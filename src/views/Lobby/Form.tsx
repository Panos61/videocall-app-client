import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Cookie from 'js-cookie';

import { setSession, startCall } from '@/api';
import { useMediaControlCtx } from '@/context';

import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  isHost: boolean | undefined;
  setUsername: (username: string) => void;
  avatarSrc: string | null | undefined;
}

const Form = ({ isHost, setUsername, avatarSrc }: Props) => {
  const { mediaState } = useMediaControlCtx();
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
      await startCall(roomID, username, avatarSrc, jwt, mediaState);

      navigate(`/room/${roomID}/call`, {
        state: { roomID: roomID, sessionID: sessionID },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderInvalidInputWarning = () => {
    if (errors.username) {
      return (
        <Alert variant='destructive' className='p-8 mt-8'>
          <div className='flex items-center gap-8'>
            <AlertCircle className='size-16' />
            <AlertDescription className='text-xs'>
              {errors.username.message}
            </AlertDescription>
          </div>
        </Alert>
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
        <p className='mt-8 ml-12 text-xs text-muted-foreground'>
          This will be your display name.
        </p>
        {renderInvalidInputWarning()}
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
