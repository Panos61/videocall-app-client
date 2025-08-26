import { useContext } from 'react';
import type { Props } from './UserEventsProvider';
import { UserEventsContext } from './UserEventsProvider';

export const useUserEventsCtx = (): Props => {
  const context = useContext(UserEventsContext);

  if (!context) {
    throw new Error('No events context.');
  }

  return context;
};
