/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import type { Participant, SignallingMessage } from '@/types';
import { useMediaCtx } from '@/context';
import { getRoomParticipants } from '@/api';
import { usePeerConnection, ICE_SERVERS } from '@/webrtc';

import { VideoTile, Toolbar, Participants } from './components';

export const Room = () => {
  const { mediaState, setAudioState, setVideoState } = useMediaCtx();

  const [participantList, setParticipantList] = useState<Participant[]>([]);
  const [userSession, setUserSession] = useState<string[]>([]);
  const [shouldUpdateParticipants, setShouldUpdateParticipants] =
    useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [openParticipants, setOpenParticipants] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream>();
  const localVideo = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const rtcPeerConnection = useRef<Record<string, RTCPeerConnection>>({});
  const remoteStreams = useRef<Record<string, MediaStream>>({});

  const location = useLocation();
  const { roomID, sessionID } = location.state;

  const {
    initializePC,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addICECandidate,
    disconnect,
  } = usePeerConnection(ICE_SERVERS);

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
  }, [roomID, sessionID, shouldUpdateParticipants, participantList.length]);

  useEffect(() => {
    let isMounted = true;

    const setupLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        if (isMounted) {
          setLocalStream(stream);
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    setupLocalStream();

    return () => {
      isMounted = false;
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (localStream && localVideo.current) {
      localVideo.current.srcObject = localStream;
      setVideoReady(true);
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

  useEffect(() => {
    if (!videoReady) return;

    let wsReady = false;
    ws.current = new WebSocket(`ws://localhost:8080/ws/signalling/${roomID}`);

    const sendMessage = (message: SignallingMessage) => {
      if (wsReady && ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(message));
      } else {
        console.warn('WebSocket not ready, message not sent:', message);
      }
    };

    let isCallInitiator = false;

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
      wsReady = true;
      console.log('start call');
      sendMessage({
        type: 'connect',
        sessionID,
      });

      if (participantList.length === 1) {
        isCallInitiator = true;
      }
    };

    ws.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (
        !rtcPeerConnection.current[data.sessionID] &&
        sessionID !== data.sessionID
      ) {
        remoteStreams.current[data.sessionID] = new MediaStream();

        const pc = initializePC(localStream!);
        rtcPeerConnection.current[data.sessionID] = pc;

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendMessage({
              type: 'ice',
              sessionID,
              candidate: JSON.stringify(event.candidate),
            });
          }
        };

        pc.ontrack = (event) => {
          console.log(`Adding track from ${data.sessionID}:`, event.track);
          const mediaStream = remoteStreams.current[data.sessionID];
          mediaStream.addTrack(event.track);

          const videoElement = document.getElementById(
            `${data.sessionID}-video`
          ) as HTMLMediaElement;

          if (videoElement) {
            videoElement.srcObject = mediaStream;
            videoElement.play().catch(console.error);
          }
        };
      }

      if (!rtcPeerConnection.current[data.sessionID]) {
        return;
      }

      switch (data.type) {
        case 'session_joined':
          setUserSession((prev) => {
            if (!prev.includes(data.sessionID)) {
              return [...prev, data.sessionID];
            }
            return prev;
          });

          if (isCallInitiator) {
            sendMessage({
              type: 'start_call',
              sessionID,
            });
          }

          setShouldUpdateParticipants(true);
          break;

        case 'start_call':
          if (data.sessionID !== sessionID) {
            setUserSession((prevState) =>
              prevState.indexOf(data.sessionID) < 0
                ? prevState.concat(data.sessionID)
                : prevState
            );

            try {
              const offer = await createOffer();
              sendMessage({
                type: 'offer',
                sessionID,
                description: JSON.stringify(offer),
                to: data.sessionID,
              });
            } catch (error) {
              console.error('Error creating offer:', error);
            }
          }
          break;

        case 'offer':
          if (data.to === sessionID) {
            setUserSession((prevState) =>
              prevState.indexOf(data.sessionID) < 0
                ? prevState.concat(data.sessionID)
                : prevState
            );

            try {
              await setRemoteDescription(JSON.parse(data.description));
              const answer = await createAnswer();
              sendMessage({
                type: 'answer',
                sessionID,
                description: JSON.stringify(answer),
                to: data.sessionID,
              });
            } catch (error) {
              console.log(error);
            }
          }
          break;

        case 'answer':
          if (data.to === sessionID) {
            try {
              await setRemoteDescription(JSON.parse(data.description));
            } catch (err) {
              console.error('Error setting remote description:', err);
            }
          }
          break;

        case 'ice':
          if (sessionID !== data.sessionID && data.candidate) {
            try {
              await addICECandidate(JSON.parse(data.candidate));
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
          break;

        case 'disconnect':
          if (data.sessionID !== sessionID) {
            setUserSession((prevParticipants) => {
              const updatedParticipants = prevParticipants.filter(
                (sessionID) => sessionID !== data.sessionID
              );
              return updatedParticipants;
            });

            delete remoteStreams.current[data.sessionID];
            if (rtcPeerConnection.current[data.sessionID]) {
              disconnect();
              delete rtcPeerConnection.current[data.sessionID];
            }

            localStorage.removeItem('jwt_token');
          }
          break;
      }
    };

    // return () => {
    //   ws.current?.close();
    //   Object.values(rtcPeerConnection).forEach(pc => pc.disconnect());
    // };
  }, [
    videoReady,
    roomID,
    sessionID,
    localStream,
    userSession,
    initializePC,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addICECandidate,
    disconnect,
  ]);

  const localParticipant: Participant | undefined = participantList.find(
    (p) => p.session_id == sessionID
  );

  const remoteParticipant = (sessionID: string) => {
    return participantList.find((p) => p.session_id == sessionID);
  };

  return (
    <div className='flex flex-col w-full h-screen bg-black'>
      <div
        ref={videoContainerRef}
        className={`flex-grow m-48 transition-all duration-300 ease-in-out`}
        style={{
          marginRight: openParticipants ? '164px' : '0',
          marginBottom: '24px',
        }}
      >
        <div
          className={`flex flex-wrap gap-16 h-full transition-all duration-300 ease-in-out`}
          style={{
            marginRight: openParticipants ? '164px' : '0',
          }}
        >
          {userSession
            .filter((session) => session !== sessionID)
            .map((session, index) => {
              return (
                <VideoTile
                  key={session}
                  index={index}
                  participant={remoteParticipant(session)}
                  userSession={session}
                  localStream={localStream}
                  isLocal={false}
                  mediaState={mediaState}
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
          />
        </div>
      </div>
      <div
        className='relative flex justify-center items-center border border-slate-900 rounded-se-sm bg-slate-950'
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
        }}
      >
        <div className='flex justify-center items-center h-64 duration-300'>
          <Toolbar
            mediaState={mediaState}
            setAudioState={setAudioState}
            setVideoState={setVideoState}
            onOpenParticipants={() => setOpenParticipants(!openParticipants)}
          />
        </div>
      </div>
      <Participants
        open={true}
        participants={participantList}
        mediaState={mediaState}
        onClose={() => setOpenParticipants(false)}
      />
    </div>
  );
};
