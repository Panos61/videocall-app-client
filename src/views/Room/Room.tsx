/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import type { Participant } from '@/types';
import { useWebSocketCtx, useMediaCtx } from '@/context';
import { getRoomParticipants } from '@/api';
import { usePeerConnection, ICE_SERVERS } from '@/webrtc';

import { VideoTile, Toolbar, Participants } from './components';

export const Room = () => {
  const { ws, connect, isConnected, sendMessage } = useWebSocketCtx();
  const { mediaState, setAudioState, setVideoState } = useMediaCtx();

  const [participantList, setParticipantList] = useState<Participant[]>([]);
  const [userSession, setUserSession] = useState<string[]>([]);
  const [shouldUpdateParticipants, setShouldUpdateParticipants] =
    useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [openParticipants, setOpenParticipants] = useState(false);

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

  useEffect(() => {
    // init websocket connection
    connect(`/ws/signalling/${roomID}`);

    let isCallInitiator = false;

    if (isConnected) {
      sendMessage({ type: 'connect', sessionID });

      if (participantList.length === 1) {
        isCallInitiator = true;
      }
    }

    if (!ws) return;

    ws.onmessage = async (event) => {
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
          setUserSession((prevState) =>
            prevState.indexOf(data.sessionID) < 0
              ? prevState.concat(data.sessionID)
              : prevState
          );

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
            sessionID={sessionID}
            localStream={localStream}
            setLocalStream={setLocalStream}
            localVideo={localVideo}
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
