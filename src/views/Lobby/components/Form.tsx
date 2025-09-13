import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Cookie from 'js-cookie';

import { setParticipantCallData, setSession, startCall } from '@/api';
import { useSystemEventsCtx } from '@/context';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    formState: { errors, isValid },
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

  // Notify parent when form value changes
  useEffect(() => {
    setUsername(formUsername);
  }, [formUsername, setUsername]);

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

      sendSystemEvent({
        type: 'user.joined',
        session_id: sessionID,
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

  const renderUsernameWarning = () => {
    if (errors.username) {
      return (
        <div className='flex items-center gap-4 mt-8'>
          <AlertCircle className='size-16 text-red-500' />
          <span className='text-xs text-red-500'>
            {errors.username.message}
          </span>
        </div>
      );
    } else {
      return (
        <p className='text-xs text-muted-foreground'>
          This will be your display name.
        </p>
      );
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
            required: 'Username is required.',
            validate: (value) => {
              return !!value.trim() || 'Username must not be empty.';
            },
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters long.',
            },
            maxLength: {
              value: 16,
              message: 'Username should not exceed over 16 characters length.',
            },
          })}
        />
        <div className='mt-8 ml-12'>{renderUsernameWarning()}</div>
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
