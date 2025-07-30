import { createContext, useState } from 'react';

export interface Props {
  isChatExpanded: boolean;
  setIsChatExpanded: (isChatExpanded: boolean) => void;
}

export const PreferencesContext = createContext<Props | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
  return (
    <PreferencesContext.Provider value={{ isChatExpanded, setIsChatExpanded }}>
      {children}
    </PreferencesContext.Provider>
  );
};
