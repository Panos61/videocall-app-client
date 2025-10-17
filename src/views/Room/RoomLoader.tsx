import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCountdown } from 'usehooks-ts';
import Cookie from 'js-cookie';

import { exitRoom } from '@/api/client';
import { useNavigationBlocker } from '@/utils/useNavigationBlocker';

import { LoadingSpinner } from '@/components/elements';
// import { Button } from '@/components/ui/button';

interface Props {
  hasError?: boolean;
  onRetry?: () => void;
}

const RoomLoader = ({ hasError }: Props) => {
  const navigate = useNavigate();
  const { id: roomID } = useParams();

  const [count, { startCountdown }] = useCountdown({
    countStart: 60,
  });

  const [allowNavigation, setAllowNavigation] = useState(false);

  const { mutate: exitRoomMutation } = useMutation({
    mutationFn: () => exitRoom(roomID as string),
    onSuccess: () => {
      setAllowNavigation(true);
      setTimeout(() => navigate('/', { replace: true }), 0);
      Cookie.remove('rsCookie');
    },
    onError: () => {
      setAllowNavigation(true);
      setTimeout(() => navigate('/', { replace: true }), 0);
      Cookie.remove('rsCookie');
    },
  });

  useNavigationBlocker({
    message:
      'Are you sure you want to leave the room? All your data will be deleted.',
    onBeforeLeave: () => {
      exitRoomMutation();
    },
    shouldBlock: !allowNavigation,
    allowedPaths: [],
  });

  useEffect(() => {
    startCountdown();
    if (count === 0) {
      exitRoomMutation();
    }
  }, [startCountdown, count]);

  return (
    <div className='h-screen flex flex-col gap-24 items-center justify-center text-center bg-zinc-900'>
      {!hasError && (
        <>
          <h1 className='text-slate-200 text-2xl font-medium animate-pulse'>
            Connecting to room...
          </h1>
          <LoadingSpinner size='lg' />
        </>
      )}
      {hasError && (
        <div className='flex flex-col items-center gap-12 mt-24'>
          <p className='text-slate-200 text-sm'>
            Failed to connect to room. Please try again.
          </p>
          {/* <Button variant='secondary' onClick={onRetry}>
            Try again
          </Button> */}
          <span className='mt-32 text-slate-200 text-sm underline'>
            Returning to home screen in {count} seconds.
          </span>
        </div>
      )}
    </div>
  );
};

export default RoomLoader;
