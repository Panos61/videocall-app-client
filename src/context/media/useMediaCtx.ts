import { useContext } from 'react';
import type { CtxProps } from './MediaProvider';
import { MediaContext } from './MediaProvider';

export const useMediaCtx = (): CtxProps => {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('No media context.');
  }

  return context;
};