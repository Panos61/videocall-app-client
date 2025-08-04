import { useEffect, useRef } from 'react';
import { useHover } from 'usehooks-ts';
import { SmilePlusIcon } from 'lucide-react';
import type { BaseEvent } from '@/types';

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

interface Props {
  roomID: string;
  username: string;
}

const Reactions = ({ roomID, username }: Props) => {
  const ws = useRef<WebSocket | null>(null);
  const hoverRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(hoverRef);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/ws/user-events/${roomID}`);

    if (!ws.current) return;

    ws.current.onmessage = (event: MessageEvent) => {
      const data: BaseEvent = JSON.parse(event.data);
      console.log('Reaction received:', data);
    };

    ws.current.onopen = () => {
      console.log('Reactions websocket connected');
    };

    ws.current.onerror = (event: Event) => {
      console.error('Reactions websocket error:', event);
    };

    ws.current.onclose = () => {
      console.log('Reactions websocket disconnected');
    };
  }, [roomID, username]);

  const handleSendReaction = (emoji: string) => {
    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: 'reaction',
        data: {
          reaction_type: emoji,
          sender: username,
        },
      })
    );
    console.log('Reaction sent:', emoji);
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
