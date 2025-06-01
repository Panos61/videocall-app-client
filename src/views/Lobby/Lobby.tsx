import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookie from 'js-cookie';
import { useMediaDeviceSelect } from '@livekit/components-react';

import type { Participant } from '@/types';
import { getRoomParticipants, getMe, getSettings } from '@/api';
import { useMediaControlCtx } from '@/context';

import Actions from './Actions';
import Form from './Form';
import Participants from './Participants';
import MediaPermissions from './MediaPermissions';
import Preview from './Preview';

import LOGO from '@/assets/logo.png';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';

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

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meData, setMeData] = useState<Participant | undefined>();
  const [settings, setSettings] = useState('30');
  const [username, setUsername] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const jwt = Cookie.get('rsCookie');
  const roomID = pathname.split('/')[2];

  useEffect(() => {
    const handleGetRoomParticipants = async () => {
      try {
        const participantData: Participant[] = await getRoomParticipants(
          roomID
        );

        setParticipants(participantData);
      } catch (error) {
        console.log(error);
      }
    };

    handleGetRoomParticipants();
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

  useEffect(() => {
    const handleGetSettings = async () => {
      try {
        const response = await getSettings(roomID);
        if (response) {
          setSettings(response.invitation_expiry);
        }
      } catch (error) {
        console.error(error);
      }
    };

    handleGetSettings();
  }, [roomID]);

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

  return (
    <>
      <div className='grid grid-cols-4 h-screen'>
        <div className='col-span-1 flex items-center justify-center'>
          <div className='flex flex-col gap-32 w-full h-screen mx-48'>
            <img src={LOGO} alt='rooms-logo' />
            <div className='flex flex-col flex-1 justify-center'>
              <h3 className='mb-20 text-center text-xl font-semibold tracking-tight'>
                {meData?.isHost ? 'Start Call' : 'Join Call'}
              </h3>
              <Form
                isHost={meData?.isHost}
                setUsername={setUsername}
                avatarSrc={avatarSrc}
              />
              <Actions
                me={meData}
                settings={settings}
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
              <Participants participants={participants} />
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
