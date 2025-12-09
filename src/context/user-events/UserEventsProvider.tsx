import { createContext, useState, useRef, useMemo } from 'react';
import { BASE_WS_URL } from '@/utils/constants';
import type { Reaction, RaisedHand, ShareScreen } from './events';
import type { MediaControlState, RemoteMediaControlState } from '@/types';

interface BaseEvent {
  type: string;
  session_id?: string;
  senderID?: string;
  payload:
    | {
        reaction_type: string;
        username: string;
        raised_hand: boolean;
        trackSid: string;
        active: boolean;
      }
    | any;
}

export interface Props {
  ws: WebSocket | null;
  connectUserEvents: (roomID: string, sessionID: string) => void;
  sendUserEvent: (event: BaseEvent) => void;
  disconnectUserEvents: () => void;
  isConnected: boolean;
  events: {
    reactionEvents: Reaction[];
    raisedHandEvents: RaisedHand[];
    shareScreenEvents: ShareScreen[];
    remoteMediaStates: RemoteMediaControlState;
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserEventsContext = createContext<Props | undefined>(undefined);

export const UserEventsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [reaction, setReaction] = useState<Reaction[]>([]);
  const [raisedHand, setRaisedHand] = useState<RaisedHand[]>([]);
  const [shareScreen, setShareScreen] = useState<ShareScreen[]>([]);
  const [remoteMediaStates, setRemoteMediaStates] =
    useState<RemoteMediaControlState>({});

  const connectUserEvents = (roomID: string, sessionID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}/ws/user-events/${roomID}`);

      ws.current.onopen = () => {
        setIsConnected(true);
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
          switch (data.type) {
            case 'reaction.sent':
              setReaction((prev) => [
                ...prev,
                {
                  ...(data.payload as Omit<Reaction, 'id'>),
                  id: `${data.session_id}-${Date.now()}`,
                },
              ]);
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
              if (data.session_id !== sessionID) {
                setRemoteMediaStates((prev) => {
                  const newState = {
                    ...prev,
                    [data.session_id as string]:
                      data.payload as MediaControlState,
                  };
                  return newState;
                });
              }
              break;
              
            case 'sync.media':
              if (data.session_id !== sessionID) {
                const receivedState = data.payload as RemoteMediaControlState;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { [sessionID]: myState, ...otherUsersState } =
                  receivedState;
                setRemoteMediaStates(otherUsersState);
              }
              break;
          }
        } catch (error) {
          console.error('Failed to parse incoming event:', error);
        }
      };
    }
  };

  const disconnectUserEvents = () => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  };

  const sendUserEvent = (event: BaseEvent) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // console.log('sending event:', JSON.stringify(event));
      ws.current.send(JSON.stringify(event));
    } else {
      console.warn('WebSocket not ready, message not sent:', event);
    }
  };

  const events = useMemo(
    () => ({
      reactionEvents: reaction,
      raisedHandEvents: raisedHand,
      shareScreenEvents: shareScreen,
      remoteMediaStates,
    }),
    [reaction, raisedHand, shareScreen, remoteMediaStates]
  );

  console.log('events', events);

  return (
    <UserEventsContext.Provider
      value={{
        ws: ws.current,
        isConnected,
        events,
        connectUserEvents,
        sendUserEvent,
        disconnectUserEvents,
      }}
    >
      {children}
    </UserEventsContext.Provider>
  );
};
