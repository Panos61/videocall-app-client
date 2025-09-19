import { useState } from 'react';
import { format } from 'date-fns';
import { CircleCheckBigIcon } from 'lucide-react';
import Expires from './Expires';
import React from './React';

const Message = ({ message, index }: { message: string; index: number }) => {
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(
    null
  );

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-4'>
        <span className='text-xs text-gray-600 font-bold'>You</span>
        <span className='text-xs text-gray-500'>
          {format(new Date(), 'HH:mm')}
        </span>
        <CircleCheckBigIcon size={14} className='text-green-700' />
      </div>
      <div
        key={index}
        onMouseEnter={() => setHoveredMessageIndex(index)}
        onMouseLeave={() => setHoveredMessageIndex(null)}
        className='flex items-center gap-4'
      >
        <div className='p-8 w-[74%] h-auto bg-green-100 rounded-lg text-sm break-all'>
          {message}
        </div>
        {hoveredMessageIndex === index && <React />}
        <Expires />
      </div>
    </div>
  );
};

export default Message;
