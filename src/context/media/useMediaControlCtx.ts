import { useContext } from 'react';
import type { CtxProps } from './MediaControlProvider';
import { MediaControlContext } from './MediaControlProvider';

export const useMediaControlCtx = (): CtxProps => {
  const context = useContext(MediaControlContext);

  if (!context) {
    throw new Error('No media context.');
  }

  return context;
};