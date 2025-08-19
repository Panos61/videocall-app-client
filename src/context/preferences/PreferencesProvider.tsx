import { createContext, useState } from 'react';

interface SharedScreenTile {
  trackSid: string;
}

export interface Props {
  isChatExpanded: boolean;
  setIsChatExpanded: (isChatExpanded: boolean) => void;
  shareScreenView: SharedScreenTile[] | 'participants';
  setShareScreenView: (
    shareScreenView: SharedScreenTile[] | 'participants'
  ) => void;
  isTileView: boolean;
  setIsTileView: (isTileView: boolean) => void;
}

export const PreferencesContext = createContext<Props | undefined>(undefined);

export const PreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [shareScreenView, setShareScreenView] = useState<
    SharedScreenTile[] | 'participants'
  >([]);
  const [isTileView, setIsTileView] = useState(false);

  return (
    <PreferencesContext.Provider
      value={{
        isChatExpanded,
        setIsChatExpanded,
        shareScreenView,
        setShareScreenView,
        isTileView,
        setIsTileView,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};
