import { createContext, useContext, ReactNode, useState } from 'react';

interface RoomContextProps {
  invKey: string;
  setInvKey: (key: string) => void;
  token: string;
  setToken: (token: string) => void;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useRoomCtx = (): RoomContextProps => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error('No room context.');
  }

  return context;
};

export const RoomProvider = ({ children }: { children: ReactNode }) => {
  const [invKey, setInvKey] = useState<string>('');
  const [token, setToken] = useState<string>('');

  return (
    <RoomContext.Provider
      value={{
        invKey,
        setInvKey,
        token,
        setToken,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};
