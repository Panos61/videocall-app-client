import { createContext, useState, useRef } from 'react';
import { BASE_WS_URL } from '@/utils/constants';
import type { BaseEvent } from '@/types';

interface Reaction {
  reaction_type: string;
  username: string;
}

interface RaisedHand {
  raised_hand: boolean;
  username: string;
}
export interface Props {
  ws: WebSocket | null;
  connectEvents: (roomID: string) => void;
  sendEvent: (event: BaseEvent) => void;
  disconnect: () => void;
  isConnected: boolean;
  events: {
    reaction: Reaction[];
    raisedHand: RaisedHand[];
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const EventsContext = createContext<Props | undefined>(undefined);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [reaction, setReaction] = useState<Reaction[]>([]);
  const [raisedHand, setRaisedHand] = useState<RaisedHand[]>([]);

  const connectEvents = (roomID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}${roomID}`);

      ws.current.onopen = () => {
        setIsConnected(ws.current?.readyState === WebSocket.OPEN);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };

      ws.current.onerror = () => {
        setIsConnected(false);
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const data: BaseEvent = JSON.parse(event.data);
          // Process received events and update state
          switch (data.type) {
            case 'reaction.sent':
              setReaction((prev) => [...prev, data.payload as Reaction]);
              setTimeout(() => {
                setReaction((prev) => prev.slice(1));
              }, 5000);
              break;
            case 'raised_hand.sent':
              setRaisedHand((prev) => [...prev, data.payload as RaisedHand]);
              setTimeout(() => {
                setRaisedHand((prev) => prev.slice(1)); // Remove oldest raised hand
              }, 10000);
              break;
          }
        } catch (error) {
          console.error('Failed to parse incoming event:', error);
        }
      };
    }
  };

  const disconnect = () => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  };

  const sendEvent = (event: BaseEvent) => {
    if (isConnected && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not ready, message not sent:', event);
    }
  };

  return (
    <EventsContext.Provider
      value={{
        ws: ws.current,
        connectEvents,
        sendEvent,
        disconnect,
        isConnected,
        events: {
          reaction,
          raisedHand,
        },
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
