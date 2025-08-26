import { createContext, ReactNode, useState, useEffect } from 'react';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import type {
  BaseEvent,
  MediaControlState,
  RemoteMediaControlState,
} from '@/types';
import { useEventsCtx } from '../user-events/useEventsCtx';

export interface DevicePreferences {
  deviceId: string | undefined;
  label: string | undefined;
}

export interface CtxProps {
  connectMedia: (roomID: string, sessionID: string) => void;
  sendMediaEvent: (sessionID: string, updatedState: MediaControlState) => void;
  disconnectMedia: () => void;
  mediaState: MediaControlState;
  remoteMediaStates: RemoteMediaControlState;
  setAudioState: (enabled: boolean, sessionID?: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID?: string) => Promise<void>;
  audioDevice: DevicePreferences | null;
  videoDevice: DevicePreferences | null;
  setAudioDevice: (device: DevicePreferences) => void;
  setVideoDevice: (device: DevicePreferences) => void;
  setAudioTrack: (track: LocalAudioTrack | null) => void;
  setVideoTrack: (track: LocalVideoTrack | null) => void;
  audioTrack: LocalAudioTrack | null;
  videoTrack: LocalVideoTrack | null;
}

export const MediaControlContext = createContext<CtxProps | undefined>(
  undefined
);

export const MediaControlProvider = ({ children }: { children: ReactNode }) => {
  const {
    connectEvents,
    disconnect,
    sendEvent,
    isConnected,
    events: { remoteMediaStates },
  } = useEventsCtx();

  const [mediaState, setMediaState] = useState({ audio: false, video: false });
  const [audioDevice, setSelectedAudioDevice] =
    useState<DevicePreferences | null>(null);
  const [videoDevice, setSelectedVideoDevice] =
    useState<DevicePreferences | null>(null);
  const [videoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(
    null
  );
  const [audioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(
    null
  );

  const connectMedia = (roomID: string, sessionID: string) => {
    // Clean up any existing connection
    disconnectMedia();
    connectEvents(roomID, sessionID);
  };

  const disconnectMedia = () => {
    disconnect();
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      disconnectMedia();
    };
  }, []);

  const sendMediaEvent = (
    sessionID: string,
    updatedState: MediaControlState
  ) => {
    if (!isConnected) {
      return;
    }

    const msg: BaseEvent = {
      type: 'media.control.updated',
      sessionID: sessionID,
      payload: {
        audio: updatedState.audio,
        video: updatedState.video,
      },
    };

    try {
      sendEvent(msg);
    } catch (error) {
      console.error('Failed to send media update:', error);
    }
  };

  const setAudioState = async (enabled: boolean, sessionID = '') => {
    const updatedState = { ...mediaState, audio: enabled };
    setMediaState(updatedState);

    console.log('updatedState', updatedState);

    if (isConnected && sessionID) {
      const msg: BaseEvent = {
        type: 'media.control.updated',
        sessionID: sessionID,
        payload: {
          audio: updatedState.audio,
          video: updatedState.video,
        },
      };
      sendEvent(msg);
    }
  };

  const setVideoState = async (enabled: boolean, sessionID = '') => {
    const updatedState = { ...mediaState, video: enabled };
    setMediaState(updatedState);

    if (isConnected && sessionID) {
      const msg: BaseEvent = {
        type: 'media.control.updated',
        sessionID: sessionID,
        payload: {
          audio: updatedState.audio,
          video: updatedState.video,
        },
      };
      sendEvent(msg);
    }
  };

  const setAudioDevice = async (device: DevicePreferences) => {
    setSelectedAudioDevice({
      deviceId: device.deviceId,
      label: device.label,
    });

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

    if (mediaState.video) {
      await setVideoState(false);
      await setVideoState(true);
    }
  };

  const setAudioTrack = async (track: LocalAudioTrack | null) => {
    setLocalAudioTrack(track);
  };

  const setVideoTrack = async (track: LocalVideoTrack | null) => {
    setLocalVideoTrack(track);
  };

  return (
    <MediaControlContext.Provider
      value={{
        connectMedia,
        sendMediaEvent,
        remoteMediaStates,
        disconnectMedia,
        mediaState,
        setAudioState,
        setVideoState,
        setAudioDevice,
        setVideoDevice,
        audioDevice,
        videoDevice,
        setAudioTrack,
        audioTrack,
        setVideoTrack,
        videoTrack,
      }}
    >
      {children}
    </MediaControlContext.Provider>
  );
};
