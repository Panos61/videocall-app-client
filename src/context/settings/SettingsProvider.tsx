import { createContext, useRef, useState } from 'react';
import type { Settings } from '@/types';
import { BASE_WS_URL } from '@/utils/constants';

export interface Props {
  ws: WebSocket | null;
  connectSettings: (roomID: string) => void;
  settings: Settings | null;
  disconnect: () => void;
}

export const SettingsContext = createContext<Props | undefined>(undefined);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ws = useRef<WebSocket | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  const connectSettings = (roomID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(
        `${BASE_WS_URL}/ws/settings-broadcast/${roomID}`
      );

      ws.current.onmessage = (event: MessageEvent) => {
        if (!ws.current) return;

        const data: Settings = JSON.parse(event.data);
        setSettings(data);

        console.log('settings', data);
      };
    }
  };

  const disconnect = () => {
    ws.current?.close();
    ws.current = null;
  };

  return (
    <SettingsContext.Provider
      value={{
        ws: ws.current,
        connectSettings,
        settings,
        disconnect,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
