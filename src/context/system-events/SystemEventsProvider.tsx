import { createContext, useState, useRef } from 'react';
import { BASE_WS_URL } from '@/utils/constants';
import type { BaseEvent } from '@/types';

export interface Props {
  ws: WebSocket | null;
  connectSystemEvents: (roomID: string) => void;
  sendSystemEvent: (event: BaseEvent) => void;
  disconnectSystemEvents: () => void;
  isConnected: boolean;
  events: {
    userJoined: boolean;
    userLeft: boolean;
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const SystemEventsContext = createContext<Props | undefined>(undefined);

export const SystemEventsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [userJoined, setUserJoined] = useState<boolean>(false);
  const [userLeft, setUserLeft] = useState<boolean>(false);

  const connectSystemEvents = (roomID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}/ws/system-events/${roomID}`);

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
            case 'user.joined':
              setUserJoined(true);
              break;
            case 'user.left':
              setUserLeft(true);
              break;
          }
        } catch (error) {
          console.error('Failed to parse incoming event:', error);
        }
      };
    }
  };

  const disconnectSystemEvents = () => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  };

  const sendSystemEvent = (event: BaseEvent) => {
    if (isConnected && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not ready, message not sent:', event);
    }
  };

  return (
    <SystemEventsContext.Provider
      value={{
        ws: ws.current,
        connectSystemEvents,
        sendSystemEvent,
        disconnectSystemEvents,
        isConnected,
        events: {
          userJoined,
          userLeft,
        },
      }}
    >
      {children}
    </SystemEventsContext.Provider>
  );
};
