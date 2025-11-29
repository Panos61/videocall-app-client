import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Cookie from 'js-cookie';

import { setParticipantCallData, setSession, startCall } from '@/api/client';
import { useSystemEventsCtx } from '@/context';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import JOIN_TONE from '@/assets/join_tone.mp3';

interface Props {
  isHost: boolean | undefined;
  username: string;
  setUsername: (username: string) => void;
  avatarSrc: string | null | undefined;
  isCallActive: boolean;
}

const Form = ({
  isHost,
  username,
  setUsername,
  avatarSrc,
  isCallActive,
}: Props) => {
  const { sendSystemEvent } = useSystemEventsCtx();

  const {
    register,
    watch,
    formState: { isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    defaultValues: { username: username || '' },
  });

  const formUsername = watch('username');

  // Sync form when prop changes
  useEffect(() => {
    reset({ username: username || '' });
  }, [username, reset]);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const roomID = pathname.split('/')[2];
  const jwt = Cookie.get('rsCookie');

  const { mutate: startCallMutation, isPending: isStartingCall } = useMutation({
    mutationFn: () => startCall(roomID),
    retry: true,
  });

  const handleStartCall = async () => {
    try {
      const sessionID: string = await setSession(roomID, jwt);
      await setParticipantCallData(roomID, formUsername, avatarSrc, jwt);

      if (isHost) {
        startCallMutation();
      }

      const joinTone = new Audio(JOIN_TONE);
      joinTone.volume = 0.6;
      joinTone.play();

      sendSystemEvent({
        type: 'user.joined',
        payload: {},
      });
      navigate(`/room/${roomID}/call`, {
        state: { roomID: roomID, sessionID: sessionID },
        replace: true,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderText = () => {
    if (isStartingCall) {
      return 'Starting call...';
    }
    return isHost ? 'Start Call' : 'Join Call';
  };
  const isDisabled = !isValid || (!isCallActive && !isHost) || isStartingCall;

  return (
    <>
      <div className='mb-16'>
        <Input
          placeholder='Enter your name'
          {...register('username', {
            required: true,
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters long.',
            },
            maxLength: {
              value: 16,
              message: 'Username should not exceed over 16 characters length.',
            },
          })}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className=' mt-8 ml-12 flex items-center gap-4 text-xs text-muted-foreground line-clamp-2'>
          👉 Username must be between 3 and 16 characters long and will be your
          display name throughout the call.
        </div>
      </div>
      <Button
        variant='call'
        className='w-full'
        disabled={isDisabled}
        onClick={handleStartCall}
      >
        {renderText()}
      </Button>
      {!isCallActive && !isHost && (
        <div className='flex justify-center mt-8'>
          <span className='text-xs text-muted-foreground text-center'>
            Please wait for the host to start the call.
          </span>
        </div>
      )}
    </>
  );
};

export default Form;
