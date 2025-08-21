import { useState, useEffect, useRef } from 'react';

const Timer = () => {
  const startTimeRef = useRef<Date>(new Date());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const differenceInSeconds = Math.floor(
        (now.getTime() - startTimeRef.current.getTime()) / 1000
      );
      setElapsedSeconds(differenceInSeconds);
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(secs).padStart(2, '0');

    if (hours > 0) {
      const paddedHours = String(hours).padStart(2, '0');
      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${paddedMinutes}:${paddedSeconds}`;
  };

  return (
    <div className='flex items-center gap-8'>
      <div className='text-xs text-gray-300 font-mono min-w-[36px]'>
        {formatTime(elapsedSeconds)}
      </div>
      <span className='text-gray-300'>-</span>
      <p className='text-xs text-white'>Call in progress</p>
      <div className='size-8 rounded-full bg-green-500 animate-pulse'></div>
    </div>
  );
};

export default Timer;
