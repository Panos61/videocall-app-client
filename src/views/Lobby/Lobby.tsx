import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookie from 'js-cookie';

import type { Participant } from '@/types';
import { checkCache, getRoomParticipants, getMe, getSettings } from '@/api';
import { useMediaCtx } from '@/context';

import Actions from './Actions';
import Form from './Form';
import Participants from './Participants';
import Preview from './Preview';

export const Lobby = () => {
  const { pathname } = useLocation();
  const { mediaState, setAudioState, setVideoState } = useMediaCtx();

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

      const cachedData = checkCache('me');
      if (cachedData) {
        console.log('Using cached data:', cachedData);
      }

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
            <span className='mt-48 text-3xl font-bold font-mono'>Rooms_</span>
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
              />
              <Participants participants={participants} />
            </div>
          </div>
        </div>
        <div className='col-span-3 flex items-center mr-48 my-48'>
          <Preview
            username={username}
            mediaState={mediaState}
            onGetSrc={setAvatarSrc}
          />
        </div>
      </div>
    </>
  );
};
