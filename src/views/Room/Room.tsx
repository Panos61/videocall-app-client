/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { useMediaQuery } from 'usehooks-ts';
import { LogOutIcon } from 'lucide-react';

import type { Participant, UserEvent } from '@/types';
import { useSignallingCtx, useMediaCtx } from '@/context';
import { getRoomParticipants } from '@/api';
import { usePeerConnection, ICE_SERVERS } from '@/webrtc';
import { useToast } from '@/components/ui/use-toast';
import { computeGridLayout } from './computeGridLayout';

import { VideoTile, Toolbar, Participants, Chat } from './components';
import { Button } from '@/components/ui/button';

export const Room = () => {
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
  const [participantList, setParticipantList] = useState<Participant[]>([]);
  const [userSession, setUserSession] = useState<string[]>([]);
  const [shouldUpdateParticipants, setShouldUpdateParticipants] =
    useState(false);

  const [isPolite, setIsPolite] = useState(false);
  const makingOffer = useRef(false);
  const ignoreOffer = useRef(false);

  const [localStream, setLocalStream] = useState<MediaStream>();
  const localVideo = useRef<HTMLVideoElement>(null);

  const rtcPeerConnection = useRef<Record<string, RTCPeerConnection>>({});
  const remoteStreams = useRef<Record<string, MediaStream>>({});

  const location = useLocation();
  const { roomID, sessionID } = location.state;

  const { initializePC, addICECandidate, disconnect } =
    usePeerConnection(ICE_SERVERS);

  const updateUserSession = (sessionID: string, action: 'add' | 'remove') => {
    setUserSession((prevState) => {
      if (action === 'add') {
        return prevState.includes(sessionID)
          ? prevState
          : [...prevState, sessionID];
      } else {
        return prevState.filter((id) => id !== sessionID);
      }
    });
    setShouldUpdateParticipants(true);
  };

  useEffect(() => {
    const handleGetRoomParticipants = async () => {
      try {
        const participantData: Participant[] = await getRoomParticipants(
          roomID
        );
        setParticipantList(participantData);

        setUserSession((prevSessionIDs) =>
          prevSessionIDs.includes(sessionID)
            ? prevSessionIDs
            : [...prevSessionIDs, sessionID]
        );
      } catch (error) {
        console.log(error);
      }
    };

    if (shouldUpdateParticipants || participantList.length === 0) {
      handleGetRoomParticipants();
    }
  }, [
    roomID,
    sessionID,
    shouldUpdateParticipants,
    participantList.length,
    userSession,
  ]);

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
  }, [localStream, rtcPeerConnection, mediaState.video, mediaState.audio]);

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
  }, [localStream, mediaState.audio, mediaState.video]);

  // signalling websocket connection & webrtc handling
  useEffect(() => {
    connectSignalling(`/ws/signalling/${roomID}`);

    let isCallInitiator = false;

    if (isConnected) {
      sendMessage({ type: 'connect', sessionID });

      if (participantList.length === 1) {
        isCallInitiator = true;
      }
    }

    if (!ws) return;

    ws.onmessage = async (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (!data.type) {
        return;
      }

      if (!rtcPeerConnection.current[data.sessionID]) {
        const pc = localStream ? initializePC(localStream) : initializePC();
        rtcPeerConnection.current[data.sessionID] = pc;

        pc.ontrack = (event) => {
          const mediaStream =
            remoteStreams.current[data.sessionID] || new MediaStream();
          mediaStream.addTrack(event.track);
          remoteStreams.current[data.sessionID] = mediaStream;

          const videoElement = document.getElementById(
            `${data.sessionID}-video`
          ) as HTMLMediaElement;

          if (videoElement) {
            videoElement.srcObject = mediaStream;
            videoElement.play().catch(console.error);
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log(`ICE connection state: ${pc.iceConnectionState}`);
          if (pc.iceConnectionState === 'failed') {
            pc.restartIce();
          }
        };
      }

      if (!rtcPeerConnection.current[data.sessionID]) {
        return;
      }

      const pc = rtcPeerConnection.current[data.sessionID];

      switch (data.type) {
        case 'session_joined':
          updateUserSession(data.sessionID, 'add');

          if (isCallInitiator) {
            sendMessage({
              type: 'start_call',
              sessionID,
            });
          }
          break;

        case 'start_call':
          if (data.sessionID !== sessionID) {
            updateUserSession(data.sessionID, 'add');
            setIsPolite(true);

            if (localStream) {
              const senders = pc.getSenders();
              localStream.getTracks().forEach((track) => {
                if (!senders.find((sender) => sender.track === track)) {
                  pc.addTrack(track, localStream);
                }
              });
            }

            // Only create an offer if we haven't already
            if (pc.signalingState === 'stable' && !makingOffer.current) {
              try {
                makingOffer.current = true;
                await pc.setLocalDescription();
                sendMessage({
                  type: 'offer',
                  sessionID,
                  description: JSON.stringify(pc.localDescription),
                  to: data.sessionID,
                });
              } catch (error) {
                console.error('Error creating offer:', error);
              } finally {
                makingOffer.current = false;
              }
            }
          }
          break;

        case 'offer':
          updateUserSession(data.sessionID, 'add');

          try {
            const offerCollision =
              makingOffer.current || pc.signalingState !== 'stable';
            ignoreOffer.current = !isPolite && offerCollision;

            if (ignoreOffer.current) {
              return;
            }

            await pc.setRemoteDescription(
              new RTCSessionDescription(JSON.parse(data.description))
            );

            if (pc.signalingState === 'have-remote-offer') {
              await pc.setLocalDescription();

              sendMessage({
                type: 'answer',
                sessionID,
                description: JSON.stringify(pc.localDescription),
                to: data.sessionID,
              });
            }
          } catch (error) {
            console.error('Error handling offer:', error);
          }
          break;

        case 'answer':
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(JSON.parse(data.description))
            );
          } catch (err) {
            console.error('Error setting remote description:', err);
          }
          break;

        case 'ice':
          if (sessionID !== data.sessionID && data.candidate) {
            try {
              const candidate = JSON.parse(data.candidate);
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
          break;

        case 'disconnect':
          if (data.sessionID !== sessionID) {
            updateUserSession(data.sessionID, 'remove');

            delete remoteStreams.current[data.sessionID];
            if (rtcPeerConnection.current[data.sessionID]) {
              disconnect();
              delete rtcPeerConnection.current[data.sessionID];
            }

            setLocalStream(undefined);

            if (rtcPeerConnection) {
              Object.values(rtcPeerConnection.current).forEach((pc) => {
                pc.getSenders().forEach((sender) => pc.removeTrack(sender));
                pc.close();
              });
              rtcPeerConnection.current = {};
            }

            localStream?.getVideoTracks().forEach((track) => track.stop());
          }
          break;
      }
    };
  }, [
    ws,
    isConnected,
    sendMessage,
    roomID,
    sessionID,
    localStream,
    userSession,
    initializePC,
    addICECandidate,
    disconnect,
  ]);

  // media websocket connection
  useEffect(() => {
    const connect = async () => {
      try {
        await connectMedia(`/ws/media/${roomID}`, sessionID);
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
  const userEventsWS = useRef<WebSocket | null>(null);

  console.log('userSession', userSession);
  console.log('userSession.length', userSession.length);

  // ws connection for user events (notifications)
  useEffect(() => {
    userEventsWS.current = new WebSocket(
      `ws://localhost:8080/ws/user-events/${roomID}`
    );

    if (!userEventsWS.current) return;

    userEventsWS.current.onmessage = (event: MessageEvent) => {
      const data: UserEvent = JSON.parse(event.data);
      const { payload } = data;
      const eventType: string = data.type;

      let text: string = '';

      if (eventType === 'user_left') {
        text = `${payload.participant_name} has left the call`;
      } else if (eventType === 'host_left') {
        if (userSession.length <= 2) {
          text =
            'The previous host has left the call. You are now the host of the call';
        } else {
          text =
            'The host has left the call. Be the first to make a move! After 30 seconds, the host will be chosen randomly.';
        }
      }

      const toastConfig = {
        duration:
          eventType === 'host_left' && userSession.length > 2 ? 30000 : 5000,
        description: (
          <div className='flex items-center gap-8'>
            <LogOutIcon size={24} color='#fb2c36' />
            <div className='flex flex-col gap-4'>
              <span>{text}</span>
              {eventType === 'host_left' && userSession.length > 2 && (
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
  }, [roomID, userSession, toast]);

  const localParticipant: Participant | undefined = participantList.find(
    (p) => p.session_id == sessionID
  );

  const remoteParticipant = (sessionID: string) => {
    return participantList.find((p) => p.session_id == sessionID);
  };

  const totalVideos = userSession.length;
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

  return (
    <div className='flex flex-col w-full h-screen bg-black'>
      <div className={roomContainerCls}>
        {userSession
          .filter((session) => session !== sessionID)
          .map((remoteSession, index) => {
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
