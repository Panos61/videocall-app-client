import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const Clock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className='w-72 text-md lg:text-lg text-white font-medium'>
      {format(currentTime, 'h:mm aa')}
    </div>
  );
};

export default Clock;
