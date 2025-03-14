import { createContext, ReactNode, useState, useRef } from 'react';
import { BASE_WS_URL } from '@/utils/constants';

interface MediaState {
  audio: boolean;
  video: boolean;
}

interface RemoteMediaState {
  [sessionID: string]: MediaState;
}

interface Message {
  sessionID: string;
  media: MediaState;
}

export interface Props {
  connectMedia: (roomID: string, sessionID: string) => void;
  disconnectMedia: () => void;
  mediaState: MediaState;
  remoteMediaStates: RemoteMediaState;
  setAudioState: (enabled: boolean, sessionID?: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID?: string) => Promise<void>;
}

export const MediaContext = createContext<Props | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);

  const [mediaState, setMediaState] = useState({ audio: false, video: false });
  const [remoteMediaStates, setRemoteMediaStates] = useState<RemoteMediaState>(
    {}
  );
  const [isConnected, setIsConnected] = useState(false);

  const connectMedia = (route: string, sessionID: string) => {
    // Clean up any existing connection
    disconnectMedia();

    const jwt = localStorage.getItem('jwt_token');
    if (!jwt) return;

    try {
      const socket = new WebSocket(`${BASE_WS_URL}${route}`);
      ws.current = socket;

      socket.onopen = () => {
        // Only send auth if socket is still the current one
        if (ws.current === socket) {
          socket.send(
            JSON.stringify({
              type: 'auth',
              token: jwt,
              sessionID,
            })
          );
          setIsConnected(true);
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onmessage = (event) => {
        if (ws.current !== socket) return;

        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            return;
          }

          if (data.sessionID && data.media) {
            if (data.sessionID !== sessionID) {
              setRemoteMediaStates((prev) => ({
                ...prev,
                [data.sessionID]: data.media,
              }));
            }
          }
        } catch (error) {
          console.error('Media WS - Failed to parse message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  const disconnectMedia = () => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
      setIsConnected(false);
      setRemoteMediaStates({});
    }
  };

  const sendMediaUpdate = (sessionID: string, updatedState: MediaState) => {
    if (isConnected && ws.current?.readyState === WebSocket.OPEN) {
      const msg: Message = {
        sessionID: sessionID,
        media: updatedState,
      };
      ws.current.send(JSON.stringify(msg));
    }
  };

  const setAudioState = async (enabled: boolean, sessionID = '') => {
    const updatedState = { ...mediaState, audio: enabled };
    setMediaState(updatedState);

    if (isConnected) {
      sendMediaUpdate(sessionID, updatedState);
    }
  };

  const setVideoState = async (enabled: boolean, sessionID = '') => {
    const updatedState = { ...mediaState, video: enabled };
    setMediaState(updatedState);

    if (isConnected) {
      sendMediaUpdate(sessionID, updatedState);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        connectMedia,
        remoteMediaStates,
        disconnectMedia,
        mediaState,
        setAudioState,
        setVideoState,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
