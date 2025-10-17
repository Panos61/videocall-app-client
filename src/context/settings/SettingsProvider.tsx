import { createContext, useRef, useState, useCallback } from 'react';

import type { Settings } from '@/types';
import { getSettings } from '@/api/client';
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

  const connectSettings = useCallback(async (roomID: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const initialSettingsData = await getSettings(roomID);
      setSettings(initialSettingsData as Settings);
    } catch (error) {
      console.error('Error fetching initial settings', error);
    }

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
    };
  }, []);

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
