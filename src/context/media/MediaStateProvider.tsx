import { createContext, ReactNode, useState, useEffect } from 'react';
import { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import type { MediaState, RemoteMediaState } from '@/types';
import { useUserEventsCtx } from '../user-events/useUserEventsCtx';

interface BaseEvent {
  type: string;
  participant_id: string;
  payload: {
    audio: boolean;
    video: boolean;
  };
}

export interface DevicePreferences {
  deviceId: string | undefined;
  label: string | undefined;
}

export interface CtxProps {
  connectMedia: (roomID: string, participantID: string) => void;
  disconnectMedia: () => void;
  mediaState: MediaState;
  remoteMediaStates: RemoteMediaState;
  setAudioState: (enabled: boolean, participantID?: string) => Promise<void>;
  setVideoState: (enabled: boolean, participantID?: string) => Promise<void>;
  audioDevice: DevicePreferences | null;
  videoDevice: DevicePreferences | null;
  setAudioDevice: (device: DevicePreferences) => void;
  setVideoDevice: (device: DevicePreferences) => void;
  setAudioTrack: (track: LocalAudioTrack | null) => void;
  setVideoTrack: (track: LocalVideoTrack | null) => void;
  audioTrack: LocalAudioTrack | null;
  videoTrack: LocalVideoTrack | null;
}

export const MediaStateContext = createContext<CtxProps | undefined>(undefined);

export const MediaStateProvider = ({ children }: { children: ReactNode }) => {
  const {
    connectUserEvents,
    disconnectUserEvents,
    sendUserEvent,
    isConnected,
    events: { remoteMediaStates },
  } = useUserEventsCtx();

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

  const connectMedia = (roomID: string, participantID: string) => {
    // Clean up any existing connection
    disconnectMedia();
    connectUserEvents(roomID, participantID, '');
  };

  const disconnectMedia = () => {
    disconnectUserEvents();
  };

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      disconnectUserEvents();
    };
  }, []);

  const setAudioState = async (enabled: boolean, participantID = '') => {
    const updatedState = { ...mediaState, audio: enabled };
    setMediaState(updatedState);

    if (isConnected && participantID) {
      const msg: BaseEvent = {
        type: 'media.state.updated',
        participant_id: participantID,
        payload: {
          audio: updatedState.audio,
          video: updatedState.video,
        },
      };
      sendUserEvent(msg);
    }
  };

  const setVideoState = async (enabled: boolean, participantID = '') => {
    const updatedState = { ...mediaState, video: enabled };
    setMediaState(updatedState);

    if (isConnected && participantID) {
      const msg: BaseEvent = {
        type: 'media.state.updated',
        participant_id: participantID,
        payload: {
          audio: updatedState.audio,
          video: updatedState.video,
        },
      };
      sendUserEvent(msg);
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
    <MediaStateContext.Provider
      value={{
        connectMedia,
        disconnectMedia,
        mediaState,
        remoteMediaStates,
        setAudioState,
        setVideoState,
        setAudioDevice,
        setVideoDevice,
        audioDevice,
        videoDevice,
        audioTrack,
        videoTrack,
        setAudioTrack,
        setVideoTrack,
      }}
    >
      {children}
    </MediaStateContext.Provider>
  );
};
