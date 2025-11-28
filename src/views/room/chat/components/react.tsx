import { useRef, useState } from 'react';
import { SmilePlusIcon } from 'lucide-react';
import { useUserEventsCtx } from '@/context';

const REACTIONS = [
  {
    id: 1,
    emoji: '👍',
  },
  {
    id: 2,
    emoji: '👎',
  },
  {
    id: 3,
    emoji: '😀',
  },
  {
    id: 4,
    emoji: '😢',
  },
  {
    id: 5,
    emoji: '❤️',
  },
  {
    id: 6,
    emoji: '🎉',
  },
  {
    id: 7,
    emoji: '🐈',
  },
];

const React = () => {
  const { sendUserEvent } = useUserEventsCtx();
  const [isOpen, setIsOpen] = useState(false);
  const hoverRef = useRef<HTMLDivElement>(null);

  const handleSendReaction = (emoji: string) => {
    sendUserEvent({
      type: 'reaction.sent',
      // senderID: sessionID,
      payload: {
        reaction_type: emoji,
      },
    });
  };

  const menu = (
    <div className='absolute bottom-12 right-full w-[172px] flex items-center justify-between gap-8 p-4 overflow-hidden z-10 rounded-8 bg-white shadow-elevation-low'>
      {REACTIONS.map((reaction) => (
        <div
          key={reaction.id}
          className='flex items-center justify -center size-28 rounded-full hover:scale-110 duration-150 ease-in-out cursor-pointer'
          onClick={() => handleSendReaction(reaction.emoji)}
        >
          <span className='text-xl'>{reaction.emoji}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={hoverRef}
      className='flex items-center rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer z-50 relative'
    >
      <SmilePlusIcon size={16} onClick={() => setIsOpen(true)} />
      {isOpen && menu}
    </div>
  );
};

export default React;
