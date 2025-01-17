import { useContext } from 'react';
import type { Props } from './SignallingProvider';
import { SignallingContext } from './SignallingProvider';

export const useSignallingCtx = (): Props => {
  const context = useContext(SignallingContext);

  if (!context) {
    throw new Error('No signalling context.');
  }

  return context;
};
