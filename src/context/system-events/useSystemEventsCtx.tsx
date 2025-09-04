import { useContext } from 'react';
import type { Props } from './SystemEventsProvider';
import { SystemEventsContext } from './SystemEventsProvider';

export const useSystemEventsCtx = (): Props => {
  const context = useContext(SystemEventsContext);

  if (!context) {
    throw new Error('No system events context.');
  }

  return context;
};
