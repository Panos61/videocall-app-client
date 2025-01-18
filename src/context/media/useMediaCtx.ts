import { useContext } from 'react';
import type { Props } from './MediaProvider';
import { MediaContext } from './MediaProvider';

export const useMediaCtx = (): Props => {
  const context = useContext(MediaContext);

  if (!context) {
    throw new Error('No media context.');
  }

  return context;
};