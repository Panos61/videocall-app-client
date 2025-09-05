import { useRef } from 'react';
import { useHover } from 'usehooks-ts';
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

const Reactions = ({ sessionID }: { sessionID: string }) => {
  const { sendUserEvent } = useUserEventsCtx();

  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(hoverRef);

  const handleSendReaction = (emoji: string) => {
    sendUserEvent({
      type: 'reaction.sent',
      senderID: sessionID,
      payload: {
        reaction_type: emoji,
      },
    });
  };

  const menu = (
    <div className='absolute bottom-full left-[120px] -translate-x-1/2 flex items-center justify-between gap-8 p-4 w-[280px] rounded-8 bg-white shadow-elevation-low'>
      {REACTIONS.map((reaction) => (
        <div
          key={reaction.id}
          className='flex items-center justify-center size-32 rounded-full hover:bg-violet-200 duration-150 ease-in-out cursor-pointer'
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
      className='flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer z-50 relative'
    >
      <SmilePlusIcon size={16} />
      {isHovering && menu}
    </div>
  );
};

export default Reactions;
