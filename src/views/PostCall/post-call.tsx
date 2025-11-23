import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useCountdown } from 'usehooks-ts';
import Cookie from 'js-cookie';

import { getMe, exitRoom, killCall } from '@/api/client';
import { useSystemEventsCtx } from '@/context';
import { useNavigationBlocker } from '@/utils/useNavigationBlocker';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  HomeIcon,
  LogOutIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  LockIcon,
  Crown,
  PowerOffIcon,
} from 'lucide-react';

import LOGO from '@/assets/catgpt.png';

const PostCall = () => {
  const { sendSystemEvent, disconnectSystemEvents } = useSystemEventsCtx();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { id: roomID } = useParams<{ id: string }>();
  const [allowNavigation, setAllowNavigation] = useState(false);

  const jwtToken = Cookie.get('rsCookie');
  
  useNavigationBlocker({
    message:
      'Are you sure you want to leave the room? All your data will be deleted.',
    onBeforeLeave: () => {
      setAllowNavigation(true);
      disconnectSystemEvents();
      if (roomID) exitRoom(roomID);
    },
    shouldBlock: !allowNavigation,
    allowedPaths: [],
  });

  const { data: meData } = useQuery({
    queryKey: ['me', roomID, jwtToken],
    queryFn: () => getMe(roomID!, jwtToken!),
    enabled: !!roomID && !!jwtToken,
  });

  const userId = meData?.id;
  const isHost = meData?.isHost;

  const { mutate: exitRoomMutation, isPending: isExiting } = useMutation({
    mutationFn: () => exitRoom(roomID!),
    onMutate: () => {
      queryClient.cancelQueries();
      disconnectSystemEvents();
      Cookie.remove('rsCookie');
      setAllowNavigation(true);
    },
    onSuccess: () => {
      navigate('/', { replace: true });
    },
    onError: () => {
      navigate('/', { replace: true });
    },
  });

  const { mutate: killCallMutation, isPending: isKillingCall } = useMutation({
    mutationFn: () => killCall(roomID!, jwtToken!),
    onMutate: () => {
      queryClient.cancelQueries();
      disconnectSystemEvents();
      Cookie.remove('rsCookie');
      setAllowNavigation(true);
    },
    onSuccess: () => {
      navigate('/', { replace: true });
    },
    onError: () => {
      navigate('/', { replace: true });
    },
  });

  const handleStayInLobby = () => {
    setAllowNavigation(true);
    setTimeout(() => navigate(`/room/${roomID}`, { replace: true }), 0);
  };

  const handleHostLeaveRoom = () => {
    if (!userId) return;

    sendSystemEvent({
      type: 'host.left',
      payload: {
        previous_host_id: userId,
      },
    });
    exitRoomMutation();
  };

  const handleHostKillCall = () => {
    if (!userId) return;

    sendSystemEvent({
      type: 'host.left',
      payload: {
        previous_host_id: userId,
      },
    });

    killCallMutation();
  };

  const [count, { startCountdown }] = useCountdown({
    countStart: 60,
  });

  useEffect(() => {
    startCountdown();
    if (count === 0) {
      exitRoomMutation();
    }
  }, [startCountdown, count]);

  if (!roomID || !jwtToken) return null;

  return (
    <div className='flex flex-col items-center gap-48 mt-72'>
      <header className='absolute top-40 flex flex-col items-center'>
        <p className='text-2xl font-mono text-gray-800'>Whispurr</p>
        <img src={LOGO} alt='logo' width={80} />
      </header>
      <div className='flex flex-col items-center justify-center gap-28 mt-[120px]'>
        <h1 className='text-4xl'>You left the call</h1>
        <div className='flex items-center justify-center gap-4'>
          <Crown size={12} className='text-yellow-600' />
          <span className='text-xs text-gray-600'>
            You are the host of this call.
          </span>
        </div>
        <div className='flex items-center justify-center gap-12'>
          <Button variant='outline' onClick={handleStayInLobby}>
            <HomeIcon size={20} className='mr-8' />
            Stay in Lobby
          </Button>
          {isHost ? (
            <Dialog>
              <form>
                <DialogTrigger asChild>
                  <Button variant='destructive'>
                    <LogOutIcon size={20} className='mr-8' />
                    Leave Room
                  </Button>
                </DialogTrigger>
                <DialogContent className='flex flex-col gap-24 sm:max-w-[425px]'>
                  <DialogHeader>
                    <DialogTitle>Leave the Room</DialogTitle>
                    <DialogDescription className='text-sm text-muted-foreground'>
                      You’re the current host. If you leave, you can either hand
                      over the session to others or end the call for everyone.
                      Choose what happens next.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type='submit'
                      disabled={isExiting}
                      onClick={handleHostLeaveRoom}
                    >
                      <LogOutIcon size={16} className='mr-8' />
                      {isExiting ? 'Leaving...' : 'Leave'}
                    </Button>
                    <Button
                      type='submit'
                      variant='destructive'
                      disabled={isKillingCall}
                      onClick={handleHostKillCall}
                    >
                      <PowerOffIcon size={16} className='mr-8' />
                      {isKillingCall ? 'Ending...' : 'End'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          ) : (
            <Button
              variant='destructive'
              disabled={isExiting}
              onClick={() => exitRoomMutation()}
            >
              <LogOutIcon size={20} className='mr-8' />
              Leave Room
            </Button>
          )}
        </div>
        <span className='text-sm underline'>
          Returning to home screen in {count} seconds.
        </span>
      </div>
      <div className='flex items-center justify-center gap-12'>
        <span className='text-sm'>
          Were you satisfied with your overall experience?
        </span>
        <div className='flex items-center justify-center gap-12'>
          <ThumbsUpIcon
            size={20}
            className='cursor-pointer hover:scale-105 duration-300 ease-in-out hover:text-green-500'
          />
          <ThumbsDownIcon
            size={20}
            className='cursor-pointer hover:scale-105 duration-300 ease-in-out hover:text-red-500'
          />
        </div>
      </div>
      <Card className='flex flex-row items-center justify-center gap-12 p-16 w-[384px] shadow-elevation-low'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <div className='flex items-center justify-center gap-4'>
            <LockIcon size={20} className='text-orange-500' />
            <h2 className='text-lg font-semibold'>No Trace Left Behind</h2>
          </div>
          <span className='text-sm text-muted-foreground'>
            Your session data and personal information have been securely
            erased. No trace of your participation remains on our servers,
            ensuring your privacy and digital footprint are fully protected.
          </span>
          <span className='text-sm text-blue-500 underline cursor-pointer hover:text-blue-600 duration-300 ease-in-out'>
            Learn more
          </span>
        </div>
      </Card>
    </div>
  );
};

export default PostCall;
