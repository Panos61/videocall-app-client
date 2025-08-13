import { createContext, useState } from 'react';

export interface Props {
  isChatExpanded: boolean;
  setIsChatExpanded: (isChatExpanded: boolean) => void;
  shareScreenView: 'shared' | 'participants';
  setShareScreenView: (shareScreenView: 'shared' | 'participants') => void;
}

export const PreferencesContext = createContext<Props | undefined>(undefined);

export const PreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [shareScreenView, setShareScreenView] = useState<
    'shared' | 'participants'
  >('shared');

  return (
    <PreferencesContext.Provider
      value={{
        isChatExpanded,
        setIsChatExpanded,
        shareScreenView,
        setShareScreenView,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
