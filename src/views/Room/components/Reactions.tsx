import { useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { SmilePlusIcon } from 'lucide-react';

const REACTIONS = [
  {
    id: 'like',
    emoji: '👍',
  },
  {
    id: 'dislike',
    emoji: '👎',
  },
  {
    id: 'laugh',
    emoji: '😀',
  },
  {
    id: 'sad',
    emoji: '😢',
  },
  {
    id: 'heart',
    emoji: '❤️',
  },
  {
    id: 'celebrate',
    emoji: '🎉',
  },
  {
    id: 'cat',
    emoji: '🐈',
  },
];

const Reactions = () => {
  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(hoverRef);

  const menu = (
    <div className='absolute bottom-full flex items-center justify-between gap-8 p-4 rounded-8 bg-white shadow-elevation-low'>
      {REACTIONS.map((reaction) => (
        <div key={reaction.id} className='flex items-center justify-center size-32 rounded-full hover:bg-violet-200 duration-150 ease-in-out cursor-pointer'>
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
