import { useContext } from 'react';
import type { Props } from './SessionProvider';
import { SessionContext } from './SessionProvider';

export const useSessionCtx = (): Props => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('No session context.');
  }

  return context;
};
