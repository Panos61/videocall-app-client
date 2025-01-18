import { createContext, useState, useRef } from 'react';
import type { SignallingMessage } from '@/types';
import { BASE_WS_URL } from '@/utils/constants';

export interface Props {
  ws: WebSocket | null;
  connectSignalling: (route: string) => void;
  sendMessage: (message: SignallingMessage) => void;
  disconnect: () => void;
  isConnected: boolean;
}

export const SignallingContext = createContext<Props | undefined>(undefined);

export const SignallingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSignalling = (route: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}${route}`);

      ws.current.onopen = () => {
        setIsConnected(ws.current?.readyState === WebSocket.OPEN);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };

      ws.current.onerror = () => {
        setIsConnected(false);
      };
    }
  };

  const disconnect = () => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  };

  const sendMessage = (message: SignallingMessage) => {
    if (isConnected && ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log(message);
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message);
    }
  };

  return (
    <SignallingContext.Provider
      value={{ ws: ws.current, connectSignalling, sendMessage, disconnect, isConnected }}
    >
      {children}
    </SignallingContext.Provider>
  );
};
