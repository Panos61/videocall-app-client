import { useContext } from 'react';
import type { CtxProps } from './MediaStateProvider';
import { MediaStateContext } from './MediaStateProvider';

export const useMediaStateCtx = (): CtxProps => {
  const context = useContext(MediaStateContext);

  if (!context) {
    throw new Error('No media context.');
  }

  return context;
};