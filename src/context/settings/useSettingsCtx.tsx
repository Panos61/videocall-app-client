import { useContext } from 'react';
import type { Props } from './SettingsProvider';
import { SettingsContext } from './SettingsProvider';

export const useSettingsCtx = (): Props => {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('No session context.');
  }

  return context;
};
