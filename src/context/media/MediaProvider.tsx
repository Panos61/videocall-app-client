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
  connect: (roomID: string, sessionID: string) => void;
  disconnect: () => void;
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

  const connect = (roomID: string, sessionID: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(`${BASE_WS_URL}/ws/media/${roomID}`);

      ws.current.onopen = () => {
        console.log('connection established!');
        setIsConnected(true);
      };

      ws.current.onclose = () => {
        console.log('connection closed!');
        setIsConnected(false);
      };

      ws.current.onmessage = (event) => {
        const data: Message = JSON.parse(event.data);
        if (data.sessionID !== sessionID) {
          setRemoteMediaStates((prev) => ({
            ...prev,
            [data.sessionID]: data.media,
          }));
        }
      };
    }
  };

  const disconnect = () => {
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

  const setAudioState = async (enabled: boolean, sessionID?: string) => {
    const updatedState = { ...mediaState, audio: enabled };
    setMediaState(updatedState);

    // await updateUserMedia(roomID, participantJWT, updatedState);
    if (sessionID) {
      sendMediaUpdate(sessionID, updatedState);
    }
  };

  const setVideoState = async (
    enabled: boolean,
    sessionID?: string | undefined
  ) => {
    const updatedState = { ...mediaState, video: enabled };
    setMediaState(updatedState);

    if (sessionID) {
      sendMediaUpdate(sessionID, updatedState);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        connect,
        remoteMediaStates,
        disconnect,
        mediaState,
        setAudioState,
        setVideoState,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
