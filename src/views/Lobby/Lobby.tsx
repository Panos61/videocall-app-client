import { useState } from 'react';
import { useMediaCtx } from '@/context';
import Form from './Form';
import Participants from './Participants';
import { Preview, Actions } from './Preview';

export const Lobby = () => {
  const { mediaState, setAudioState, setVideoState } =
    useMediaCtx();

  const [username, setUsername] = useState('');
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  return (
    <>
      <div className='grid grid-cols-4 h-screen'>
        <div className='col-span-1 flex items-center justify-center'>
          <div className='w-full mx-48'>
            <h3 className='mb-20 text-center text-xl font-semibold tracking-tight'>
              Join Call
            </h3>
            <Form setUsername={setUsername} avatarSrc={avatarSrc} />
            <Actions
              mediaState={mediaState}
              setAudioState={setAudioState}
              setVideoState={setVideoState}
            />
            <Participants />
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
