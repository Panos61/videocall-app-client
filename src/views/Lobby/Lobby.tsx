import { useState, useEffect, useRef } from 'react';
// import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { useMediaDeviceSelect } from '@livekit/components-react';
import Cookie from 'js-cookie';

import type { Participant } from '@/types';
import { getMe } from '@/api';
import { useMediaControlCtx, useSettingsCtx } from '@/context';
import { useNavigationBlocker } from '@/utils/useNavigationBlocker';

import {
  Actions,
  Form,
  RoomInfo,
  MediaPermissions,
  Participants,
  Preview,
  StrictMode,
} from './components';

export const Lobby = () => {
  const { pathname } = useLocation();
  const {
    mediaState,
    setAudioState,
    setVideoState,
    // setAudioTrack,
    setVideoTrack,
    videoTrack,
  } = useMediaControlCtx();
  const { connectSettings } = useSettingsCtx();

  const [meData, setMeData] = useState<Participant | undefined>();
  const [guests, setGuests] = useState<Participant[]>([]);
  const [username, setUsername] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const jwt = Cookie.get('rsCookie');
  const roomID = pathname.split('/')[2];

  useEffect(() => {
    if (roomID) {
      connectSettings(roomID);
    }
  }, [roomID, connectSettings]);

  const guestsWS = useRef<WebSocket | null>(null);

  useNavigationBlocker({
    message:
      'Are you sure you want to leave the lobby? You will be disconnected from the room.',
    onBeforeLeave: () => {
      if (videoTrack) {
        videoTrack.stop();
      }

      if (guestsWS.current?.readyState === WebSocket.OPEN) {
        guestsWS.current.close(1000, 'Component unmounting');
      }
    },
  });

  useEffect(() => {
    guestsWS.current = new WebSocket(`ws://localhost:8080/ws/guests/${roomID}`);

    if (!guestsWS.current) return;

    guestsWS.current.onmessage = async (event: MessageEvent) => {
      const data: Participant[] = JSON.parse(event.data);
      setGuests(data);
      console.log('data', data);
    };

    return () => {
      if (guestsWS.current?.readyState === WebSocket.OPEN) {
        guestsWS.current.close(1000, 'Component unmounting');
      }
      guestsWS.current = null;
    };
  }, [roomID]);

  useEffect(() => {
    const fetchMe = async () => {
      if (!jwt || !roomID) return;

      try {
        const meResponseData = await getMe(roomID, jwt);
        setMeData(meResponseData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMe();
  }, [roomID, jwt]);

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

  // useEffect(() => {
  //   const getAudioTrack = async () => {
  //     // Stop existing track if any
  //     if (videoTrack) {
  //       videoTrack.stop();
  //     }

  //     try {
  //       if (mediaState.video) {
  //         const track = await createLocalVideoTrack({
  //           deviceId: videoActiveDeviceId,
  //         });
  //         setVideoTrack(track);
  //       }
  //     } catch (error) {
  //       console.error('Failed to create video track:', error);
  //     }
  //   };

  //   // Only create track if user has video enabled
  //   if (videoActiveDeviceId) {
  //     getAudioTrack();
  //   }

  //   // Cleanup function
  //   return () => {
  //     if (videoTrack) {
  //       videoTrack.stop();
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [videoActiveDeviceId, mediaState.video]);

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

    // Cleanup function
    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoActiveDeviceId, mediaState.video]);

  const isHost = meData?.isHost;

  return (
    <>
      <div className='grid grid-cols-4 h-screen bg-gradient-to-br from-white via-white to-orange-300'>
        <div className='col-span-1 flex items-center justify-center'>
          <div className='flex flex-col gap-32 w-full h-screen mx-48'>
            <div className='flex items-center justify-center gap-24 mt-48'>
              <div className='flex items-center justify-center size-64 bg-white border-[2px] border-[#00dc5ce0] rounded-xl'>
                <div className='border border-[#635BFF] rounded-xl p-8 translate-x-8 translate-y-12'>
                  <svg
                    viewBox='0 0 24 24'
                    className='size-48 text-[#635BFF] stroke-2'
                    fill='none'
                  >
                    #00dc5ce0
                    <path
                      d='M4 4H20V14C20 15.1046 19.1046 16 18 16H9L4 21V4Z'
                      fill='currentColor'
                    />
                  </svg>
                </div>
              </div>
              <h1 className='text-5xl font-mono'>Toku</h1>
            </div>
            <div className='flex flex-col flex-1 justify-center'>
              <h3 className='mb-20 text-center text-xl font-semibold tracking-tight'>
                {isHost ? 'Start Call' : 'Join Call'}
              </h3>
              <Form
                isHost={isHost}
                setUsername={setUsername}
                avatarSrc={avatarSrc}
              />
              <Actions
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
              <RoomInfo
                isHost={isHost}
                host='Panos'
                createdAt={new Date().toISOString()}
              />
              <StrictMode roomID={roomID} isHost={isHost} />
              <Participants guests={guests} />
              <MediaPermissions
                selectedAudioDevice={selectedAudioDevice}
                selectedVideoDevice={selectedVideoDevice}
              />
            </div>
          </div>
        </div>
        <div className='col-span-3 flex items-center mr-48 mt-48 mb-24'>
          <Preview
            username={username}
            mediaState={mediaState}
            videoTrack={videoTrack as LocalVideoTrack}
            onGetSrc={setAvatarSrc}
          />
        </div>
      </div>
    </>
  );
};
