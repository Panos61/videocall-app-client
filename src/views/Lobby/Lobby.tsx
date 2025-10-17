import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { useMediaDeviceSelect } from '@livekit/components-react';
import Cookie from 'js-cookie';

import type { CallState, Participant } from '@/types';
import {
  getCallState,
  getMe,
  getParticipants,
  getRoomInfo,
  exitRoom,
} from '@/api/client';
import {
  useMediaControlCtx,
  useSettingsCtx,
  useSystemEventsCtx,
} from '@/context';
import { useNavigationBlocker } from '@/utils/useNavigationBlocker';
import {
  Actions,
  Form,
  Info,
  MediaPermissions,
  Participants,
  Preview,
  StrictMode,
} from './components';

const Lobby = () => {
  const { pathname } = useLocation();

  const { connectSystemEvents } = useSystemEventsCtx();
  const {
    mediaState,
    setAudioState,
    setVideoState,
    // setAudioTrack,
    setVideoTrack,
    videoTrack,
  } = useMediaControlCtx();
  const { connectSettings, settings } = useSettingsCtx();

  const settingsData = settings || {
    strict_mode: false,
    invite_permission: false,
    invitation_expiry: '30',
  };

  const [guests, setGuests] = useState<Participant[]>([]);
  const [formUsername, setFormUsername] = useState<string>('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const [wsCallState, setWsCallState] = useState<CallState | null>({
    is_active: false,
    started_at: '',
  });

  const jwt = Cookie.get('rsCookie');
  const roomID = pathname.split('/')[2];

  useEffect(() => {
    if (roomID) {
      connectSettings(roomID);
    }
  }, [roomID, connectSettings]);

  const participantsWS = useRef<WebSocket | null>(null);

  useNavigationBlocker({
    message:
      'Are you sure you want to leave the lobby? You will be disconnected from the room.',
    onBeforeLeave: () => {
      if (videoTrack) {
        videoTrack.stop();
      }

      if (participantsWS.current?.readyState === WebSocket.OPEN) {
        participantsWS.current.close(1000, 'Component unmounting');
      }

      exitRoom(roomID);
    },
    allowedPaths: ['/call'],
  });

  useEffect(() => {
    connectSystemEvents(roomID);
  }, [roomID, connectSystemEvents]);

  useEffect(() => {
    participantsWS.current = new WebSocket(
      `ws://localhost:8080/ws/participants/${roomID}`
    );
    if (!participantsWS.current) return;

    participantsWS.current.onmessage = async (event: MessageEvent) => {
      const data: Participant[] = JSON.parse(event.data);
      setGuests(data);
    };

    return () => {
      if (participantsWS.current?.readyState === WebSocket.OPEN) {
        participantsWS.current.close(1000, 'Component unmounting');
      }
      participantsWS.current = null;
    };
  }, [roomID]);

  const callStateWS = useRef<WebSocket | null>(null);

  useEffect(() => {
    callStateWS.current = new WebSocket(
      `ws://localhost:8080/ws/call/${roomID}`
    );
    if (!callStateWS.current) return;

    callStateWS.current.onmessage = async (event: MessageEvent) => {
      const data: CallState = JSON.parse(event.data);
      setWsCallState(data);
    };

    return () => {
      if (callStateWS.current?.readyState === WebSocket.OPEN) {
        callStateWS.current.close(1000, 'Component unmounting');
      }
      callStateWS.current = null;
    };
  }, [roomID]);

  const { data: roomInfoData } = useQuery({
    queryKey: ['roomInfo', roomID],
    queryFn: () => getRoomInfo(roomID),
    enabled: !!roomID,
  });

  const { data: meData } = useQuery({
    queryKey: ['me', roomID],
    queryFn: () => getMe(roomID, jwt as string),
    enabled: !!roomID && !!jwt,
  });

  const { data: participantsData } = useQuery({
    queryKey: ['participants', roomID],
    queryFn: () => getParticipants(roomID),
    enabled: !!roomID,
  });

  const participants: Participant[] = participantsData?.participants || [];
  const participantsInCall: Participant[] =
    participantsData?.participantsInCall || [];

  const roomCreatedAt: string = roomInfoData || new Date().toISOString();
  const isHost = meData?.isHost ?? false;
  const username = meData?.username || formUsername;

  const { data: callStateData } = useQuery({
    queryKey: ['callState', roomID],
    queryFn: () => getCallState(roomID),
    enabled: !!meData && !isHost,
  });

  // HTTP query takes precedence for late joiners, WebSocket for real-time updates
  const isCallActive: boolean =
    callStateData?.is_active || wsCallState?.is_active || false;
  const callStartedAt: string = isCallActive
    ? callStateData?.started_at || wsCallState?.started_at || ''
    : '';

  const {
    devices: audioDevices,
    activeDeviceId: audioActiveDeviceId,
    setActiveMediaDevice: setAudioActiveDevice,
  } = useMediaDeviceSelect({
    kind: 'audioinput',
  });

  const {
    devices: videoDevices,
    activeDeviceId: videoActiveDeviceId,
    setActiveMediaDevice: setVideoActiveDevice,
  } = useMediaDeviceSelect({
    kind: 'videoinput',
  });

  const selectedAudioDevice = audioDevices.find(
    (device) => device.deviceId === audioActiveDeviceId
  );
  const selectedVideoDevice = videoDevices.find(
    (device) => device.deviceId === videoActiveDeviceId
  );

  // Video device can be found but not set as active device
  // set first video device as selected
  useEffect(() => {
    if (
      videoDevices.length > 0 &&
      (!videoActiveDeviceId || videoActiveDeviceId === 'default')
    ) {
      const defaultSelectedDevice = videoDevices[0];
      setVideoActiveDevice(defaultSelectedDevice.deviceId);
    }
  }, [videoDevices, videoActiveDeviceId, setVideoActiveDevice]);

  useEffect(() => {
    const getVideoTrack = async () => {
      // Stop existing track if any
      if (videoTrack) {
        videoTrack.stop();
      }

      try {
        if (mediaState.video) {
          const track = await createLocalVideoTrack({
            deviceId: videoActiveDeviceId,
          });
          setVideoTrack(track);
        } else {
          setVideoTrack(null);
        }
      } catch (error) {
        console.error('Failed to create video track:', error);
      }
    };

    // Only create track if user has video enabled
    if (videoActiveDeviceId) {
      getVideoTrack();
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoActiveDeviceId, mediaState.video]);

  return (
    <>
      <div className='grid grid-cols-4 h-screen bg-gradient-to-br from-white via-white to-orange-300'>
        <div className='col-span-1 flex items-center justify-center'>
          <div className='flex flex-col gap-32 w-full h-screen mx-48'>
            <div className='flex items-center justify-center gap-24 mt-48'>
              <h1 className='text-3xl font-mono'>[placeholder]</h1>
            </div>
            <div className='flex flex-col flex-1 justify-center'>
              <h3 className='mb-20 text-center text-xl font-semibold tracking-tight'>
                {isHost ? 'Start Call' : 'Join Call'}
              </h3>
              <Form
                isHost={isHost}
                username={username}
                setUsername={setFormUsername}
                avatarSrc={avatarSrc}
                isCallActive={isCallActive}
              />
              <Actions
                settings={settingsData}
                isHost={isHost}
                mediaState={mediaState}
                setAudioState={setAudioState}
                setVideoState={setVideoState}
                audioDevices={audioDevices}
                videoDevices={videoDevices}
                audioActiveDeviceId={audioActiveDeviceId}
                videoActiveDeviceId={videoActiveDeviceId}
                setAudioActiveDevice={setAudioActiveDevice}
                setVideoActiveDevice={setVideoActiveDevice}
              />
              <Info
                isHost={isHost}
                host='Panos'
                createdAt={roomCreatedAt}
                isCallActive={isCallActive}
                callStartedAt={callStartedAt}
              />
              <StrictMode roomID={roomID} isHost={isHost} />
              {isCallActive && (
                <Participants
                  guests={guests}
                  participants={participants}
                  participantsInCall={participantsInCall}
                />
              )}
              <MediaPermissions
                selectedAudioDevice={selectedAudioDevice}
                selectedVideoDevice={selectedVideoDevice}
              />
            </div>
          </div>
        </div>
        <div className='col-span-3 flex items-center mr-48 mt-48 mb-24'>
          <Preview
            username={formUsername}
            mediaState={mediaState}
            videoTrack={videoTrack as LocalVideoTrack}
            onGetSrc={setAvatarSrc}
          />
        </div>
      </div>
    </>
  );
};

export default Lobby;
