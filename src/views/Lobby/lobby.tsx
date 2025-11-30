import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { useMediaDeviceSelect } from '@livekit/components-react';
import { GitBranchIcon } from 'lucide-react';
import Cookie from 'js-cookie';

import type { Participant } from '@/types';
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
import { BASE_WS_URL } from '@/utils/constants';
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

import LOGO from '@/assets/catgpt.png';

const Lobby = () => {
  const { pathname } = useLocation();

  const { connectSystemEvents, latestRoomKilled } = useSystemEventsCtx();
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
    shouldBlock: !latestRoomKilled,
    allowedPaths: ['/call'],
  });

  useEffect(() => {
    connectSystemEvents(roomID);
  }, [roomID, connectSystemEvents]);

  useEffect(() => {
    participantsWS.current = new WebSocket(
      `${BASE_WS_URL}/ws/participants/${roomID}`
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

  const hostID = roomInfoData?.host_id;
  const hostParticipant = participants.find(
    (participant: Participant) => participant.id === hostID
  );

  const roomCreatedAt: string =
    roomInfoData?.created_at || new Date().toISOString();
  const isHost = meData?.isHost;

  const { data: callStateData } = useQuery({
    queryKey: ['callState', roomID],
    queryFn: () => getCallState(roomID),
    enabled: !!meData && !isHost,
  });

  const isCallActive = callStateData?.is_active || false;
  const callStartedAt = callStateData?.started_at || '';

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

  useEffect(() => {
    if (meData?.username && !formUsername) {
      setFormUsername(meData.username);
    }
  }, [meData?.username]);

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
      <div className='grid grid-cols-4 gap-24 p-32 h-screen md:bg-gradient-to-br from-white via-white to-orange-300'>
        <div className='col-span-4 md:col-span-1 flex items-center justify-center'>
          <div className='flex flex-col items-center size-full'>
            <div className='flex flex-col items-center'>
              <h1 className='text-3xl font-mono'>Whispurr</h1>
              <img src={LOGO} alt='logo' width={100} />
            </div>
            <div className='flex flex-col flex-1 justify-center'>
              <h3 className='mb-12 text-center text-2xl font-semibold tracking-tight'>
                {isHost ? 'Start Call' : 'Join Call'}
              </h3>
              <Form
                isHost={isHost}
                username={formUsername}
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
                host={hostParticipant?.username}
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
        <div className='col-span-4 md:col-span-3 hidden md:block m-20'>
          <Preview
            username={formUsername}
            mediaState={mediaState}
            videoTrack={videoTrack as LocalVideoTrack}
            onGetSrc={setAvatarSrc}
          />
        </div>
        <div
          className='md:absolute bottom-20 lg:flex hidden items-center gap-8'
          onClick={() =>
            window.open(
              'https://github.com/Panos61/videocall-app-client/issues/new',
              '_blank'
            )
          }
        >
          <span className='text-sm text-gray-600 underline cursor-pointer hover:text-gray-900'>
            Report an issue
          </span>
          <GitBranchIcon className='size-16' />
        </div>
      </div>
    </>
  );
};

export default Lobby;
