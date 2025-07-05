import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Cookie from 'js-cookie';

import { setSession, startCall } from '@/api';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  isHost: boolean | undefined;
  setUsername: (username: string) => void;
  avatarSrc: string | null | undefined;
}

const Form = ({ isHost, setUsername, avatarSrc }: Props) => {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { username: '' } });

  const username = watch('username');

  useEffect(() => {
    setUsername(username);
  }, [username, setUsername]);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const roomID: string = pathname.split('/')[2];
  const jwt: string | undefined = Cookie.get('rsCookie');

  const handleStartCall = async () => {
    try {
      const sessionID: string = await setSession(roomID, jwt);
      await startCall(roomID, username, avatarSrc, jwt);

      navigate(`/room/${roomID}/call`, {
        state: { roomID: roomID, sessionID: sessionID },
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
        disabled={!isValid}
        onClick={handleStartCall}
      >
        {isHost ? 'Start Call' : 'Join Call'}
      </Button>
    </>
  );
};

export default Form;
