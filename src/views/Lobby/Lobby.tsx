import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { checkCache, getRoomParticipants, getMe, getSettings } from '@/api';
import { useMediaCtx } from '@/context';
import type { Participant } from '@/types';

import Form from './Form';
import Participants from './Participants';
import { Preview, Actions } from './Preview';

export const Lobby = () => {
  const { pathname } = useLocation();
  const { mediaState, setAudioState, setVideoState } = useMediaCtx();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [meData, setMeData] = useState<Participant | undefined>();
  const [settings, setSettings] = useState('30');
  const [username, setUsername] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  const jwt = localStorage.getItem('jwt_token');
  const roomID = pathname.split('/')[2];

  useEffect(() => {
    const handleGetRoomParticipants = async () => {
      try {
        const participantData: Participant[] = await getRoomParticipants(
          roomID
        );
        console.log(participantData);
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
          console.log('settings', response);
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
          <div className='w-full mx-48'>
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
