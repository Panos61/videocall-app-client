import { createContext, ReactNode, useState, useRef, useEffect } from 'react';
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
  sessionID: string;
  media: MediaState;
}

export interface DevicePreferences {
  deviceId: string | undefined;
  label: string | undefined;
}

export interface CtxProps {
  connectMedia: (roomID: string, sessionID: string) => void;
  disconnectMedia: () => void;
  mediaState: MediaState;
  remoteMediaStates: RemoteMediaState;
  setAudioState: (enabled: boolean, sessionID?: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID?: string) => Promise<void>;
  audioDevice: DevicePreferences | null;
  videoDevice: DevicePreferences | null;
  setAudioDevice: (device: DevicePreferences) => void;
  setVideoDevice: (device: DevicePreferences) => void;
}

export const MediaContext = createContext<CtxProps | undefined>(undefined);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
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

  const connectMedia = (route: string, sessionID: string) => {
    // Clean up any existing connection
    disconnectMedia();

    const jwt = Cookie.get('rsCookie');
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

  // set current device preferences
  useEffect(() => {
    const getCurrentDevice = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      // Try to load saved preferences first
      const savedAudio = JSON.parse(localStorage.getItem('rs-audio-device') || '{}');
      const savedVideo = JSON.parse(localStorage.getItem('rs-video-device') || '{}');

      // Find current devices
      const audioDevice = devices.find(
        (device) => device.kind === 'audioinput'
      );
      const videoDevice = devices.find(
        (device) => device.kind === 'videoinput'
      );

      // Use saved preferences if they exist, otherwise use default devices
      const audioPreference = savedAudio?.deviceId ? savedAudio : {
        deviceId: audioDevice?.deviceId,
        label: audioDevice?.label,
      };
      const videoPreference = savedVideo?.deviceId ? savedVideo : {
        deviceId: videoDevice?.deviceId,
        label: videoDevice?.label,
      };

      setSelectedAudioDevice(audioPreference);
      setSelectedVideoDevice(videoPreference);

      localStorage.setItem(
        'rs-audio-device',
        JSON.stringify(audioPreference)
      );
      localStorage.setItem(
        'rs-video-device',
        JSON.stringify(videoPreference)
      );
    };

    getCurrentDevice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setAudioDevice = async (device: DevicePreferences) => {
    setSelectedAudioDevice({
      deviceId: device.deviceId,
      label: device.label,
    });
    localStorage.setItem('rs-audio-device', JSON.stringify(device));

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
    localStorage.setItem('rs-video-device', JSON.stringify(device));

    if (mediaState.video) {
      await setVideoState(false);
      await setVideoState(true);
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
        setAudioDevice,
        setVideoDevice,
        audioDevice,
        videoDevice,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
