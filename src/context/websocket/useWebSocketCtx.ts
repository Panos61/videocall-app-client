import { useContext } from 'react';
import { WebSocketContext, Props } from '@/context/websocket/WebSockerProvider';

export const useWebSocketCtx = (): Props => {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error('No WS context.');
  }

  return context;
};
