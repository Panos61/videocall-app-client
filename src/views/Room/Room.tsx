/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import {
  Room as LivekitRoom,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  VideoPresets,
  LocalVideoTrack,
  RemoteVideoTrack,
} from 'livekit-client';
import classNames from 'classnames';
import { LogOutIcon } from 'lucide-react';

import type { Participant, SignallingMessage, UserEvent } from '@/types';
import { useSessionCtx, useMediaControlCtx, useSettingsCtx } from '@/context';
import { getRoomParticipants } from '@/api';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Chat, VideoTile, Header, Toolbar, Participants } from './components';

interface TrackInfo {
  track: LocalVideoTrack | RemoteVideoTrack;
  participantIdentity: string;
}

const Room = () => {
  // Signalling Context: websocket connection for session/livekit token exchange
  const { ws, connectSession, isConnected, sendMessage } = useSessionCtx();
  // Media Control Context: websocket connection for media device control
  const {
    connectMedia,
    sendMediaUpdate,
    disconnectMedia,
    mediaState,
    remoteMediaStates,
    setAudioState,
    setVideoState,
    setVideoTrack,
    videoTrack,
  } = useMediaControlCtx();

  const [activePanel, setActivePanel] = useState<
    'participants' | 'chat' | null
  >('participants');

  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());
  const [participants, setParticipants] = useState<Participant[]>([]);

  const livekitRoom = useRef<LivekitRoom | null>(null);
  const [lvkToken, setLvkToken] = useState<SignallingMessage['token'] | null>(
    null
  );
  const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);

  const location = useLocation();
  const { roomID, sessionID } = location.state;

  // Settings Context: websocket connection for settings
  const { connectSettings, disconnect } = useSettingsCtx();

  // Setup LiveKit room & event listeners
  useEffect(() => {
    livekitRoom.current = new LivekitRoom({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
    });

    const room: LivekitRoom = livekitRoom.current;

    const handleTrackSubscribed = (
      track: RemoteTrack,
      _publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Video) {
        setRemoteTracks((prev) => [
          ...prev,
          {
            track: track as RemoteVideoTrack,
            participantIdentity: participant.identity,
          },
        ]);
      }
    };

    const handleLocalTrackPublished = () => {
      if (!videoTrack) {
        const newVideoTrack = room?.localParticipant?.videoTrackPublications
          .values()
          .next().value?.videoTrack;
        setVideoTrack(newVideoTrack as LocalVideoTrack);
      } else {
        setVideoTrack(videoTrack);
      }
    };

    room.localParticipant.on('trackPublished', handleLocalTrackPublished);

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        sendMediaUpdate(sessionID, mediaState);
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.set(participant.identity, participant);
          return newMap;
        });

        refetchParticipants();
      }
    );
    room.on(
      RoomEvent.ParticipantDisconnected,
      (participant: RemoteParticipant) => {
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.delete(participant.identity);
          return newMap;
        });
        setRemoteTracks((prevTracks) =>
          prevTracks.filter(
            (track) => track.participantIdentity !== participant.identity
          )
        );

        setTimeout(() => {
          refetchParticipants();
        }, 200);
      }
    );

    room.on(RoomEvent.TrackMuted, (publication, participant) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('Video track muted for', participant.identity);
      }
    });

    room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('Video track unmuted for', participant.identity);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      setRemoteParticipants(new Map());
      setRemoteTracks([]);
      setParticipants([]);
      setLvkToken(null);
      setVideoTrack(null);
      setAudioState(false);
      setVideoState(false);
    });

    return () => {
      room.localParticipant.off('trackPublished', handleLocalTrackPublished);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.disconnect();
    };
  }, []);

  const handleTrackUnsubscribed = (track: RemoteTrack) => {
    track.detach();
  };

  // Connect to LiveKit room
  useEffect(() => {
    const room: LivekitRoom | null = livekitRoom.current;
    if (!room) return;

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
        room?.prepareConnection(livekitUrl, lvkToken);

        // Connect to room
        await room.connect(livekitUrl, lvkToken);
        const localParticipant = room?.localParticipant;

        // Only enable camera/mic if they were enabled in the lobby
        await localParticipant?.setCameraEnabled(true);
        await localParticipant?.setMicrophoneEnabled(true);

        // Get any existing participants in the room
        if (room?.remoteParticipants) {
          const participantsMap = new Map<string, RemoteParticipant>();
          room.remoteParticipants.forEach((participant) => {
            participantsMap.set(participant.identity, participant);
          });

          setRemoteParticipants(participantsMap);
        }

        if (!videoTrack) {
          const newVideoTrack = room?.localParticipant?.videoTrackPublications
            .values()
            .next().value?.videoTrack as LocalVideoTrack;

          setVideoTrack(newVideoTrack || null);
        } else {
          setVideoTrack(videoTrack);
        }
      } catch (error) {
        console.error('Error connecting to LiveKit room:', error);
      }
    };

    connectToRoom();
  }, [roomID, sessionID, lvkToken]);

  const { data: participantsData, refetch: refetchParticipants } = useQuery({
    queryKey: ['call-participants', roomID],
    queryFn: () => getRoomParticipants(roomID),
  });

  useEffect(() => {
    if (participantsData) {
      setParticipants(participantsData);
    }
  }, [participantsData, sessionID, remoteParticipants]);

  useEffect(() => {
    connectSession(`/ws/signalling/${roomID}`);

    if (isConnected) sendMessage({ type: 'connect', sessionID });
    if (!ws) return;

    ws.onmessage = (event: MessageEvent) => {
      const data: SignallingMessage = JSON.parse(event.data);
      const lvkToken = data?.token;

      setLvkToken(lvkToken);
    };
  }, [ws, isConnected, sendMessage]);

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

  useEffect(() => {
    connectSettings(roomID);

    return () => {
      disconnect();
    };
  }, [roomID, connectSettings]);

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

  const localParticipant: Participant | undefined = participants.find(
    (p) => p.session_id == sessionID
  );

  const remoteUserSessions: string[] = Array.from(
    remoteParticipants.keys()
  ).filter((session) => session !== sessionID);

  const remoteParticipant = (remoteSessionID: string) => {
    const remoteSession = remoteUserSessions.find(
      (session) => session === remoteSessionID
    );

    return participants.find((p) => p.session_id === remoteSession);
  };

  const videoContainerCls = classNames(
    'mx-4 mb-12 h-full transition-all duration-300 ease-in-out',
    {
      'mr-[348px]': activePanel !== null,
    }
  );

  const totalVideos = remoteParticipants.size + 1;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalVideos))}, 1fr)`,
    gap: '8px',
  };

  return (
    <div className='h-screen bg-black flex flex-col'>
      <Header />
      <div className='flex-1 relative overflow-hidden'>
        <div className={videoContainerCls}>
          <div className='h-full p-8 overflow-auto' style={gridStyle}>
            {remoteTracks.map((remoteTrack, index) => {
              return (
                remoteTrack.track.kind === 'video' && (
                  <VideoTile
                    key={remoteTrack.track.sid}
                    index={index}
                    participant={remoteParticipant(
                      remoteTrack.participantIdentity
                    )}
                    track={remoteTrack.track}
                    remoteSession={remoteTrack.participantIdentity}
                    isLocal={false}
                    remoteMediaStates={remoteMediaStates}
                  />
                )
              );
            })}
            <VideoTile
              key='local-video'
              participant={localParticipant}
              track={videoTrack as LocalVideoTrack}
              isLocal={true}
              mediaState={mediaState}
              remoteMediaStates={remoteMediaStates}
            />
          </div>
        </div>
        <Participants
          open={activePanel === 'participants'}
          participants={participants}
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
      <div className='flex-shrink-0 flex justify-center items-center border-t border-zinc-800 bg-zinc-950'>
        <Toolbar
          sessionID={sessionID}
          room={livekitRoom.current}
          mediaState={mediaState}
          setAudioState={setAudioState}
          setVideoState={setVideoState}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
      </div>
    </div>
  );
};

export default Room;
