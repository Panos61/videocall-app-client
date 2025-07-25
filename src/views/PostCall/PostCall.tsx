import { useLocation, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  HomeIcon,
  LogOutIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  LockIcon,
} from 'lucide-react';

const PostCall = () => {
  const navigate = useNavigate();
  const { roomID } = useLocation().state;

  const handleOnExit = () => {
    Cookie.remove('rsCookie');
    navigate('/', { replace: true });
  };

  return (
    <div className='flex flex-col items-center gap-52 mt-72'>
      <div className='flex flex-col items-center justify-center gap-36'>
        <h1 className='text-4xl'>You left the call</h1>
        <div className='flex items-center justify-center gap-12'>
          <Button
            variant='outline'
            onClick={() => navigate(`/room/${roomID}`, { replace: true })}
          >
            <LogOutIcon size={20} className='mr-8' />
            Stay in lobby
          </Button>
          <Button onClick={handleOnExit}>
            <HomeIcon size={20} className='mr-8' />
            Return to home screen
          </Button>
        </div>
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
      <Card className='flex flex-row items-center justify-center gap-12 p-8 w-[384px] shadow-elevation-low'>
        <LockIcon
          size={20}
          className='cursor-pointer hover:scale-105 duration-300 ease-in-out hover:text-green-500'
        />
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
