import { useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { SmilePlusIcon } from 'lucide-react';
import { useEventsCtx } from '@/context';

const REACTIONS = [
  {
    id: 1,
    type: 'like',
    emoji: '👍',
  },
  {
    id: 2,
    type: 'dislike',
    emoji: '👎',
  },
  {
    id: 3,
    type: 'laugh',
    emoji: '😀',
  },
  {
    id: 4,
    type: 'sad',
    emoji: '😢',
  },
  {
    id: 5,
    type: 'heart',
    emoji: '❤️',
  },
  {
    id: 6,
    type: 'celebrate',
    emoji: '🎉',
  },
  {
    id: 7,
    type: 'cat',
    emoji: '🐈',
  },
];

const Reactions = ({ sessionID }: { sessionID: string }) => {
  const { sendEvent } = useEventsCtx();

  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(hoverRef);

  const handleSendReaction = (emoji: string) => {
    sendEvent({
      type: 'reaction.sent',
      senderID: sessionID,
      payload: {
        reaction_type: emoji,
      },
    });
  };

  const menu = (
    <div className='absolute bottom-full flex items-center justify-between gap-8 p-4 rounded-8 bg-white shadow-elevation-low'>
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
