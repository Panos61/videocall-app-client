import { useContext } from 'react';
import type { Props } from './PreferencesProvider';
import { PreferencesContext } from './PreferencesProvider';

export const usePreferencesCtx = (): Props => {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('No preferences context.');
  }

  return context;
};
