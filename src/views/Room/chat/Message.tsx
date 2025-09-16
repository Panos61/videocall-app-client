import { useState } from 'react';
import { format } from 'date-fns';
import { SmilePlus } from 'lucide-react';

const Message = ({message, index }: { message: string; index: number }) => {
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
        {hoveredMessageIndex === index && (
          <SmilePlus
            size={16}
            className='text-gray-400 cursor-pointer duration-150 hover:text-gray-600'
          />
        )}
      </div>
    </div>
  );
};

export default Message;
