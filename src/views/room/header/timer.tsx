import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { parse } from 'date-fns';
import { getCallState } from '@/api/client';

const Timer = () => {
  const { id: roomID } = useParams();
  const startTimeRef = useRef<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: callState, isLoading } = useQuery({
    queryKey: ['callState', roomID],
    queryFn: () => getCallState(roomID as string),
    enabled: !!roomID,
  });

  useEffect(() => {
    if (callState && startTimeRef.current === null) {
      try {
        // This format string is designed to parse dates like:
        // 'Sun Aug 24 2025 17:05:45 GMT+0300 (Eastern European Summer Time)'
        const parsedDate = parse(
          callState.started_at,
          "eee MMM dd yyyy HH:mm:ss 'GMT'xx (zzzz)",
          new Date()
        );

        if (!isNaN(parsedDate.getTime())) {
          startTimeRef.current = parsedDate;
        } else {
          // Fallback for ISO strings like '2025-08-24T17:05:45.000Z'
          const isoParsedDate = new Date(callState.started_at);
          if (!isNaN(isoParsedDate.getTime())) {
            startTimeRef.current = isoParsedDate;
          } else {
            console.error('Failed to parse date:', callState.started_at);
          }
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
    
    return () => {
      startTimeRef.current = null;
    }
  }, [callState]);

  useEffect(() => {
    // Only start the timer if we have a valid start time
    if (!startTimeRef.current) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const differenceInSeconds = Math.floor(
        (now.getTime() - (startTimeRef.current as Date).getTime()) / 1000
      );
      setElapsedSeconds(differenceInSeconds);
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
    // Rerun this effect if the start time is successfully set
  }, [startTimeRef.current]);

  const formatTime = (totalSeconds: number): string => {
    // Prevent showing a negative timer if clock is slightly out of sync
    if (totalSeconds < 0) return '00:00';
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

  const displayTime =
    isLoading || !startTimeRef.current ? '00:00' : formatTime(elapsedSeconds);

  return (
    <div className='flex items-center gap-8'>
      <div className='min-w-[36px] text-xs text-gray-300 font-mono'>
        {displayTime}
      </div>
      <span className='text-gray-300'>-</span>
      <p className='text-xs text-white'>Call in progress</p>
      <div className='size-8 rounded-full bg-green-500 animate-pulse'></div>
    </div>
  );
};

export default Timer;
