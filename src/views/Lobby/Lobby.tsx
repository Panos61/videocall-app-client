import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookie from 'js-cookie';

import type { Participant } from '@/types';
import { getRoomParticipants, getMe, getSettings } from '@/api';
import { useMediaCtx } from '@/context';

import Actions from './Actions';
import Form from './Form';
import Participants from './Participants';
import Preview from './Preview';

import LOGO from '@/assets/logo.png';

export const Lobby = () => {
  const { pathname } = useLocation();
  const {
    mediaState,
    setAudioState,
    setVideoState,
    setAudioDevice,
    setVideoDevice,
    audioDevice,
    videoDevice,
  } = useMediaCtx();

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
                setAudioDevice={setAudioDevice}
                setVideoDevice={setVideoDevice}
                audioDevice={audioDevice}
                videoDevice={videoDevice}
              />
              <Participants participants={participants} />
              <div
                className='flex flex-col gap-8 p-8 mt-76 outline outline-slate-200 rounded-4 
                shadow-[0_4px_20px_-4px_rgba(0,0,255,0.1)]
                transition-shadow duration-300'
              >
                <div className='flex items-center gap-16'>
                  <span className='text-xs'>Audio:</span>
                  <span className='text-xs text-muted-foreground'>
                    {audioDevice?.label}
                  </span>
                </div>
                <div className='flex items-center gap-16'>
                  <span className='text-xs'>Video:</span>
                  <span className='text-xs text-muted-foreground'>
                    {videoDevice?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-span-3 flex items-center mr-48 mt-48 mb-24'>
          <Preview
            username={username}
            mediaState={mediaState}
            audioDevice={audioDevice}
            videoDevice={videoDevice}
            onGetSrc={setAvatarSrc}
          />
        </div>
      </div>
    </>
  );
};
