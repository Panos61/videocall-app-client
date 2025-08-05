import { useContext } from 'react';
import type { Props } from './EventsProvider';
import { EventsContext } from './EventsProvider';

export const useEventsCtx = (): Props => {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('No events context.');
  }

  return context;
};
