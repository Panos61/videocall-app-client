import { createContext, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_WS_URL } from '@/utils/constants';
import type {
  HostLeftPayload,
  HostUpdatedPayload,
  RoomKilledPayload,
  SystemEventData,
} from './events';
import { handleHostLeft, handleHostUpdated } from './hostEventHandlers';

export interface Props {
  ws: WebSocket | null;
  connectSystemEvents: (roomID: string) => void;
  sendSystemEvent: (event: SystemEventData) => void;
  disconnectSystemEvents: () => void;
  isConnected: boolean;
  recentSystemEvents: SystemEventData[];
  latestHostLeft: SystemEventData<HostLeftPayload> | null;
  latestHostUpdate: SystemEventData<HostUpdatedPayload> | null;
  latestRoomKilled: SystemEventData<RoomKilledPayload> | null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SystemEventsContext = createContext<Props | undefined>(undefined);

export const SystemEventsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const [recentSystemEvents, setRecentSystemEvents] = useState<
    SystemEventData[]
  >([]);
  const [latestHostLeft, setLatestHostLeft] =
    useState<SystemEventData<HostLeftPayload> | null>(null);
  const [latestHostUpdate, setLatestHostUpdate] =
    useState<SystemEventData<HostUpdatedPayload> | null>(null);
  const [latestRoomKilled, setLatestRoomKilled] =
    useState<SystemEventData<RoomKilledPayload> | null>(null);

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
          const data: SystemEventData = JSON.parse(event.data);

          const systemEvent: SystemEventData = {
            type: data.type,
            payload: data.payload,
            received_at: Date.now(),
          };
          // keep last 20 total system events
          setRecentSystemEvents((prev) => [...prev, systemEvent].slice(-20));

          switch (data.type) {
            case 'host.left':
              const hostLeftPayload = data.payload as HostLeftPayload;
              setLatestHostLeft({
                type: 'host.left',
                payload: hostLeftPayload,
                received_at: Date.now(),
              });

              handleHostLeft(queryClient, roomID);
              break;
            case 'host.updated':
              const hostUpdatedPayload = data.payload as HostUpdatedPayload;
              setLatestHostUpdate({
                type: 'host.updated',
                payload: hostUpdatedPayload,
                received_at: Date.now(),
              });

              handleHostUpdated(queryClient, roomID);
              break;
            case 'room.killed':
              const roomKilledPayload = data.payload as RoomKilledPayload;
              setLatestRoomKilled({
                type: 'room.killed',
                payload: roomKilledPayload,
                received_at: Date.now(),
              });
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

  const sendSystemEvent = (event: SystemEventData) => {
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
        recentSystemEvents,
        latestHostLeft,
        latestHostUpdate,
        latestRoomKilled,
      }}
    >
      {children}
    </SystemEventsContext.Provider>
  );
};
