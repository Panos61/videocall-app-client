import { createContext, useContext, ReactNode, useState } from 'react';
import { updateUserMedia } from '@/api';

interface MediaState {
  audio: boolean;
  video: boolean;
}

interface Props {
  mediaState: MediaState;
  setAudioState: (roomID: string, enabled: boolean) => Promise<void>;
  setVideoState: (roomID: string, enabled: boolean) => Promise<void>;
}

const MediaContext = createContext<Props | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useMediaCtx = (): Props => {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('No media context.');
  }

  return context;
};

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [mediaState, setMediaState] = useState({ audio: false, video: false });

  const participantJWT = localStorage.getItem('jwt_token');

  const setAudioState = async (roomID: string, enabled: boolean) => {
    const updatedState = { ...mediaState, audio: enabled };
    setMediaState(updatedState);

    await updateUserMedia(roomID, participantJWT, updatedState);
  };

  const setVideoState = async (roomID: string, enabled: boolean) => {
    const updatedState = { ...mediaState, video: enabled };
    setMediaState(updatedState);
    
    await updateUserMedia(roomID, participantJWT, updatedState);
  };

  return (
    <MediaContext.Provider value={{ mediaState, setAudioState, setVideoState }}>
      {children}
    </MediaContext.Provider>
  );
};
