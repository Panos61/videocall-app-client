import { createContext, useState, useRef } from 'react';
import { BASE_WS_URL } from '@/utils/constants';
import type {
  BaseEvent,
  MediaControlState,
  RemoteMediaControlState,
} from '@/types';

interface Reaction {
  reaction_type: string;
  username: string;
}

interface RaisedHand {
  raised_hand: boolean;
  username: string;
}

interface ShareScreen {
  trackSid: string;
  username: string;
  active: boolean;
}

export interface Props {
  ws: WebSocket | null;
  connectEvents: (roomID: string, sessionID: string) => void;
  sendEvent: (event: BaseEvent) => void;
  disconnect: () => void;
  isConnected: boolean;
  events: {
    reactionEvents: Reaction[];
    raisedHandEvents: RaisedHand[];
    shareScreenEvents: ShareScreen[];
    remoteMediaStates: RemoteMediaControlState;
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const EventsContext = createContext<Props | undefined>(undefined);

export const EventsProvider = ({ children }: { children: React.ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [reaction, setReaction] = useState<Reaction[]>([]);
  const [raisedHand, setRaisedHand] = useState<RaisedHand[]>([]);
  const [shareScreen, setShareScreen] = useState<ShareScreen[]>([]);
  const [remoteMediaStates, setRemoteMediaStates] =
    useState<RemoteMediaControlState>({});

  const connectEvents = (roomID: string, sessionID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}/ws/user-events/${roomID}`);

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
            case 'share_screen.started':
              setShareScreen((prev) => [...prev, data.payload as ShareScreen]);
              break;
            case 'share_screen.ended':
              setShareScreen((prev) =>
                prev.filter(
                  (event) =>
                    event.trackSid !== (data.payload as ShareScreen).trackSid
                )
              );
              break;
            case 'media.control.updated':
              console.log('media.control.updated', data);
              if (data.session_id !== sessionID) {
                setRemoteMediaStates((prev) => ({
                  ...prev,
                  [data.session_id as string]:
                    data.payload as MediaControlState,
                }));
              }
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
          reactionEvents: reaction,
          raisedHandEvents: raisedHand,
          shareScreenEvents: shareScreen,
          remoteMediaStates,
        },
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
