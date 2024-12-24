import { createContext, useContext, useState, useRef } from 'react';
import { SignallingMessage } from '@/types';

interface Props {
  ws: WebSocket | null;
  connect: (route: string) => void;
  sendMessage: (message: SignallingMessage) => void;
  disconnect: () => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<Props | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocketCtx = (): Props => {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('No WS context.');
  }

  return context;
};

const BASE_WS_URL = 'ws://localhost:8080';

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = (route: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    ws.current = new WebSocket(`${BASE_WS_URL}${route}`);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (err) => {
      console.error(err);
      setIsConnected(false);
    };
  };

  const disconnect = () => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
  };

  const sendMessage = (message: SignallingMessage) => {
    if (isConnected && ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not ready, message not sent:', message);
    }
  };

  // useEffect(() => {
  //   return () => {
  //     disconnect();
  //   };
  // }, []);

  return (
    <WebSocketContext.Provider
      value={{ ws: ws.current, connect, sendMessage, disconnect, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
