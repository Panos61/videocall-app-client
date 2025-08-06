import { createContext, ReactNode, useState, useRef, useEffect } from 'react';
import { LocalVideoTrack } from 'livekit-client';
import Cookie from 'js-cookie';
import { BASE_WS_URL } from '@/utils/constants';

interface MediaState {
  audio: boolean;
  video: boolean;
}

interface RemoteMediaState {
  [sessionID: string]: MediaState;
}

interface Message {
  type?: string;
  sessionID: string;
  token?: string;
  media?: MediaState;
}

export interface DevicePreferences {
  deviceId: string | undefined;
  label: string | undefined;
}

export interface CtxProps {
  connectMedia: (roomID: string, sessionID: string) => void;
  sendMediaUpdate: (sessionID: string, updatedState: MediaState) => void;
  disconnectMedia: () => void;
  mediaState: MediaState;
  remoteMediaStates: RemoteMediaState;
  setAudioState: (enabled: boolean, sessionID?: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID?: string) => Promise<void>;
  audioDevice: DevicePreferences | null;
  videoDevice: DevicePreferences | null;
  setAudioDevice: (device: DevicePreferences) => void;
  setVideoDevice: (device: DevicePreferences) => void;
  // setAudioTrack: (track: LocalAudioTrack) => void;
  setVideoTrack: (track: LocalVideoTrack | null) => void;
  videoTrack: LocalVideoTrack | null;
}

export const MediaControlContext = createContext<CtxProps | undefined>(
  undefined
);

export const MediaControlProvider = ({ children }: { children: ReactNode }) => {
  const ws = useRef<WebSocket | null>(null);

  const [mediaState, setMediaState] = useState({ audio: false, video: false });
  const [remoteMediaStates, setRemoteMediaStates] = useState<RemoteMediaState>(
    {}
  );
  const [isConnected, setIsConnected] = useState(false);
  const [audioDevice, setSelectedAudioDevice] =
    useState<DevicePreferences | null>(null);
  const [videoDevice, setSelectedVideoDevice] =
    useState<DevicePreferences | null>(null);
  const [videoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(
    null
  );

  const connectMedia = (route: string, sessionID: string) => {
    // Clean up any existing connection
    disconnectMedia();

    const jwt = Cookie.get('rsCookie');
    if (!jwt) {
      return;
    }

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
          
          // Send initial media state when connection is established
          if (mediaState) {
            sendMediaUpdate(sessionID, mediaState);
          }
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      socket.onmessage = (event: MessageEvent) => {
        if (ws.current !== socket) return;

        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);

          if (data.error) {
            console.error('WebSocket error message:', data.error);
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
      try {
        ws.current.close(1000, 'Normal Closure');
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      ws.current = null;
      setIsConnected(false);
      setRemoteMediaStates({});
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      disconnectMedia();
    };
  }, []);

  const sendMediaUpdate = (sessionID: string, updatedState: MediaState) => {
    if (!ws.current) {
      return;
    }

    if (ws.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const msg: Message = {
      sessionID: sessionID,
      media: updatedState,
    };

    try {
      ws.current.send(JSON.stringify(msg));
    } catch (error) {
      console.error('Failed to send media update:', error);
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

  const setAudioDevice = async (device: DevicePreferences) => {
    setSelectedAudioDevice({
      deviceId: device.deviceId,
      label: device.label,
    });
    // localStorage.setItem('rs-audio-device', JSON.stringify(device));

    if (mediaState.audio) {
      await setAudioState(false);
      await setAudioState(true);
    }
  };

  const setVideoDevice = async (device: DevicePreferences) => {
    setSelectedVideoDevice({
      deviceId: device.deviceId,
      label: device.label,
    });
    // localStorage.setItem('rs-video-device', JSON.stringify(device));

    if (mediaState.video) {
      await setVideoState(false);
      await setVideoState(true);
    }
  };

  // const setAudioTrack = async (_track: LocalAudioTrack) => {
  //   // console.log('audio track', track);
  // };

  const setVideoTrack = async (track: LocalVideoTrack | null) => {
    setLocalVideoTrack(track);
  };

  return (
    <MediaControlContext.Provider
      value={{
        connectMedia,
        sendMediaUpdate,
        remoteMediaStates,
        disconnectMedia,
        mediaState,
        setAudioState,
        setVideoState,
        setAudioDevice,
        setVideoDevice,
        audioDevice,
        videoDevice,
        // setAudioTrack,
        setVideoTrack,
        videoTrack,
      }}
    >
      {children}
    </MediaControlContext.Provider>
  );
};
