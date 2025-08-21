import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from 'usehooks-ts';
import { Button } from '@/components/ui/button';

const Invalid = () => {
  const navigate = useNavigate();

  const [count, { startCountdown }] = useCountdown({
    countStart: 60,
  });

  useEffect(() => {
    startCountdown();
    if (count === 0) {
      navigate('/');
    }
  }, [startCountdown, count]);

  return (
    <div className='flex flex-col justify-center items-center gap-24'>
      <div className='flex flex-col gap-12 mt-[160px]'>
        <h1 className='max-w-[580px] text-center text-2xl font-mono font-medium'>
          Whoops.. This room cannot be found or the URL is invalid.{' '}
        </h1>
        <p className='max-w-[580px] text-center text-md'>
          Make sure that you&apos;ve entered the correct meeting room id in the
          URL, e.g.
          https://localhost:3000/room/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        </p>
      </div>
      <Button onClick={() => navigate('/')}>Return to home screen</Button>
      <span className='mt-12 text-sm underline'>
        Returning to home screen in {count} seconds.
      </span>
    </div>
  );
};

export default Invalid;
