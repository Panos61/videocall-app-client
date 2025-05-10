/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from 'livekit-client';
import classNames from 'classnames';
import { useMediaQuery } from 'usehooks-ts';
import { LogOutIcon } from 'lucide-react';

import type { Participant, SignallingMessage, UserEvent } from '@/types';
import { useMediaCtx, useSignallingCtx } from '@/context';
import { getRoomParticipants } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { computeGridLayout } from './computeGridLayout';

import { VideoTile, Toolbar, Participants, Chat } from './components';
import { Button } from '@/components/ui/button';

export const RoomV2 = () => {
  const { ws, connectSignalling, isConnected, sendMessage } =
    useSignallingCtx();
  const {
    connectMedia,
    disconnectMedia,
    mediaState,
    remoteMediaStates,
    setAudioState,
    setVideoState,
  } = useMediaCtx();

  const [activePanel, setActivePanel] = useState<
    'participants' | 'chat' | null
  >(null);

  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());
  const [participantList, setParticipantList] = useState<Participant[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream>();
  const [lvkToken, setLvkToken] = useState<SignallingMessage['token'] | null>(
    null
  );

  const localVideo = useRef<HTMLVideoElement>(null);
  const livekitRoom = useRef<Room | null>(null);

  const location = useLocation();
  const { roomID, sessionID } = location.state;

  useEffect(() => {
    livekitRoom.current = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    const room: Room = livekitRoom.current;

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.set(participant.identity, participant);
          return newMap;
        });
        console.log('Participant connected');
      }
    );

    room.on(
      RoomEvent.ParticipantDisconnected,
      (participant: RemoteParticipant) => {
        console.log('Participant disconnected:', participant.identity);
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.delete(participant.identity);
          return newMap;
        });
        console.log('remoteParticipants: ', remoteParticipants);
      }
    );

    room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      setRemoteParticipants(new Map());
    });

    return () => {
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.disconnect();
    };
  }, []);

  const handleTrackSubscribed = (
    track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    console.log(`Track subscribed: ${track.kind} from ${participant.identity}`);
  };

  const handleTrackUnsubscribed = (track: RemoteTrack) => {
    track.detach();
  };

  useEffect(() => {
    const handleGetRoomParticipants = async () => {
      try {
        const participantData: Participant[] = await getRoomParticipants(
          roomID
        );
        
        setParticipantList(participantData);
      } catch (error) {
        console.log(error);
      }
    };

    handleGetRoomParticipants();
  }, [roomID, sessionID, remoteParticipants]);

  useEffect(() => {
    let isMounted = true;

    const setupLocalStream = async () => {
      if (localStream) return;

      try {
        const mediaConstraints: MediaStreamConstraints = {
          audio: mediaState.audio,
          video: mediaState.video,
        };

        if (mediaConstraints.audio || mediaConstraints.video) {
          const stream = await navigator.mediaDevices.getUserMedia(
            mediaConstraints
          );

          if (isMounted) {
            setLocalStream(stream);
          }
        } else {
          console.log(
            'Both audio and video are disabled, no localStream acquired'
          );
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    setupLocalStream();

    return () => {
      isMounted = false;
    };
  }, [mediaState.video, mediaState.audio]);

  useEffect(() => {
    if (localStream && localVideo.current) {
      localVideo.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = mediaState.video;
      });

      localStream.getAudioTracks().forEach((track) => {
        track.enabled = mediaState.audio;
      });
    }

    if (livekitRoom.current?.localParticipant) {
      console.log('localParticipant: ', livekitRoom.current.localParticipant);
      // const localParticipant = livekitRoom.current.localParticipant;
      // const cameraPublication = localParticipant.getTrackPublication(
      //   Track.Source.Camera
      // );
      // const microphonePublication = localParticipant.getTrackPublication(
      //   Track.Source.Microphone
      // );

      // if (cameraPublication) {
      //   cameraPublication.track?.
      // }

      // if (microphonePublication) {
      //   microphonePublication.track?.setEnabled(mediaState.audio);
      // }
    }
  }, [localStream, mediaState.audio, mediaState.video]);

  useEffect(() => {
    connectSignalling(`/ws/signalling/${roomID}`);

    if (isConnected) sendMessage({ type: 'connect', sessionID });

    if (!ws) return;
    ws.onmessage = (event: MessageEvent) => {
      const data: SignallingMessage = JSON.parse(event.data);
      console.log('signalling msg: ', data);

      const lvkToken = data?.token;
      setLvkToken(lvkToken);
    };
  }, [ws, isConnected, sendMessage, localStream]);

  useEffect(() => {
    if (!livekitRoom.current) return;

    const connectToRoom = async () => {
      try {
        if (!lvkToken) {
          console.error('Failed to get LiveKit token');
          return;
        }

        const livekitUrl = import.meta.env.VITE_LIVEKIT_CLOUD_URL;
        if (!livekitUrl) {
          console.error('LiveKit URL is not set');
          return;
        }

        // Pre-warm connection
        livekitRoom.current?.prepareConnection(livekitUrl, lvkToken);

        // Connect to room
        await livekitRoom.current?.connect(livekitUrl, lvkToken);
        console.log(
          'Connected to LiveKit room:',
          livekitRoom.current?.numParticipants
        );

        // Get any existing participants in the room
        if (livekitRoom.current?.remoteParticipants) {
          const participantsMap = new Map<string, RemoteParticipant>();
          console.log(
            'remoteParticipants: ',
            livekitRoom.current.remoteParticipants
          );
          livekitRoom.current.remoteParticipants.forEach((participant) => {
            participantsMap.set(participant.identity, participant);
          });
          setRemoteParticipants(participantsMap);
        }
      } catch (error) {
        console.error('Error connecting to LiveKit room:', error);
      }
    };

    connectToRoom();
  }, [roomID, sessionID, lvkToken]);

  // Publish local media when available
  useEffect(() => {
    if (!localStream || !livekitRoom.current?.localParticipant) return;

    // Publish all local tracks to the room
    const publishTracks = async () => {
      try {
        // Publish each track from the local stream
        localStream.getTracks().forEach((track) => {
          const source =
            track.kind === 'video'
              ? Track.Source.Camera
              : Track.Source.Microphone;

          livekitRoom.current?.localParticipant.publishTrack(track, {
            source,
            simulcast: track.kind === 'video', // Enable simulcast for video
          });
        });
      } catch (error) {
        console.error('Error publishing tracks:', error);
      }
    };

    publishTracks();
  }, [localStream]);

  useEffect(() => {
    const connect = async () => {
      try {
        connectMedia(`/ws/media/${roomID}`, sessionID);
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
      }
    };

    connect();

    return () => {
      disconnectMedia();
    };
  }, [roomID, sessionID]);

  const { toast } = useToast();

  const [displayHostBtn, setDisplayHostBtn] = useState<boolean>(false);
  const userEventsWS = useRef<WebSocket | null>(null);

  useEffect(() => {
    userEventsWS.current = new WebSocket(
      `ws://localhost:8080/ws/user-events/${roomID}`
    );

    if (!userEventsWS.current) return;

    userEventsWS.current.onmessage = async (event: MessageEvent) => {
      const data: UserEvent = JSON.parse(event.data);
      const { payload } = data;
      const eventType: string = data.type;

      let text: string = '';
      let shouldShowHostBtn: boolean = false;

      if (eventType === 'user_left') {
        text = `${payload.participant_name} has left the call.`;
      } else if (eventType === 'host_left') {
        try {
          const participants = await getRoomParticipants(roomID);

          if (participants.length >= 2) {
            shouldShowHostBtn = true;
            setDisplayHostBtn(shouldShowHostBtn);
            text =
              'The host has left the call. Be the first to make a move! After 30 seconds, the host will be chosen randomly.';
          } else {
            text =
              'The previous host has left the call. You are now the host of the call.';
          }
        } catch (error) {
          text = 'The host has left the call.';
        }
      }

      const toastConfig = {
        duration: shouldShowHostBtn ? 30000 : 5000,
        description: (
          <div className='flex items-center gap-8'>
            <LogOutIcon size={24} color='#fb2c36' />
            <div className='flex flex-col gap-4'>
              <span>{text}</span>
              {shouldShowHostBtn && (
                <Button size='sm' onClick={() => console.log('make me host')}>
                  Make me host 🙌
                </Button>
              )}
            </div>
          </div>
        ),
      };

      toast(toastConfig);
    };

    return () => {
      if (userEventsWS.current?.readyState === WebSocket.OPEN) {
        userEventsWS.current.close(1000, 'Component unmounting');
      }
      userEventsWS.current = null;
    };
  }, [roomID, toast, displayHostBtn, remoteParticipants]);

  const localParticipant: Participant | undefined = participantList.find(
    (p) => p.session_id == sessionID
  );


  const totalVideos = remoteParticipants.size + 1;
  const isMedium = useMediaQuery('(max-width: 1024px)');

  const { containerClass, videoTileClass } = computeGridLayout(
    totalVideos,
    isMedium
  );

  const actionsCls = classNames(
    'grow relative mx-48 mt-48 mb-24 transition-all duration-300 ease-in-out',
    {
      'mr-[428px]': activePanel !== null,
      'mr-[48px]': activePanel === null,
    }
  );

  const roomContainerCls = containerClass.concat(' ', actionsCls);

  const remoteUserSessions = Array.from(remoteParticipants.keys()).filter(
    (session) => session !== sessionID
  );
  console.log('remoteUserSessions: ', remoteUserSessions);
  
  const remoteParticipant = (remoteSessionID: string) => {
    const remoteSession = remoteUserSessions.find(
      (session) => session === remoteSessionID
    );

    return participantList.find((p) => p.session_id === remoteSession);
  };

  return (
    <div className='flex flex-col w-full h-screen bg-black'>
      <div className={roomContainerCls}>
        {remoteUserSessions.map((remoteSession, index) => {
          return (
            <VideoTile
                key={remoteSession}
                index={index}
                participant={remoteParticipant(remoteSession)}
                remoteSession={remoteSession}
                localStream={localStream}
                isLocal={false}
                mediaState={mediaState}
                remoteMediaStates={remoteMediaStates}
                gridCls={videoTileClass[index]}
              />
            );
          })}
        <VideoTile
          key='local-video'
          ref={localVideo}
          participant={localParticipant}
          localStream={localStream}
          isLocal={true}
          mediaState={mediaState}
          remoteMediaStates={remoteMediaStates}
          gridCls={videoTileClass[totalVideos - 1]}
        />
      </div>
      <div className='relative flex justify-center items-center border border-slate-900 rounded-se-sm bg-slate-950'>
        <div className='flex justify-center items-center h-64 duration-300'>
          <Toolbar
            sessionID={sessionID}
            localStream={localStream}
            setLocalStream={setLocalStream}
            localVideo={localVideo}
            mediaState={mediaState}
            setAudioState={setAudioState}
            setVideoState={setVideoState}
            activePanel={activePanel}
            setActivePanel={setActivePanel}
          />
        </div>
      </div>
      <Participants
        open={activePanel === 'participants'}
        participants={participantList}
        sessionID={sessionID}
        mediaState={mediaState}
        remoteMediaStates={remoteMediaStates}
        onClose={() => setActivePanel(null)}
      />
      <Chat
        open={activePanel === 'chat'}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
};
