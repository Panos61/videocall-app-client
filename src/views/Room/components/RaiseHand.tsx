import { useEffect, useRef } from 'react';
import { HandIcon } from 'lucide-react';
import type { BaseEvent } from '@/types';

interface Props {
  roomID: string;
  username: string;
}

const RaiseHand = ({ roomID, username }: Props) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/ws/user-events/${roomID}`);

    if (!ws.current) return;

    ws.current.onmessage = (event: MessageEvent) => {
      const data: BaseEvent = JSON.parse(event.data);
      console.log('Raise hand received:', data);
    };

    ws.current.onopen = () => {
      console.log('Raise hand websocket connected');
    };

    ws.current.onerror = (event: Event) => {
      console.error('Raise hand websocket error:', event);
    };

    ws.current.onclose = () => {
      console.log('Raise hand websocket disconnected');
    };
  }, [roomID, username]);

  const handleRaiseHand = () => {
    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: 'raised_hand',
        data: {
          sender: username,
        },
      })
    );
    console.log('Raise hand sent:', username);
  };

  return (
    <div
      className='flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer hover:scale-105'
      onClick={handleRaiseHand}
    >
      <HandIcon size={16} className='text-yellow-500' />
    </div>
  );
};

export default RaiseHand;
