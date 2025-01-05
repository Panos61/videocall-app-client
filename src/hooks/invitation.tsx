import { useEffect } from 'react';
import { useRoomCtx } from '../context/useRoomContext';
import { connectSSE } from '@/api/sse';


// eslint-disable-next-line react-hooks/exhaustive-deps
export const useInvitation = (roomID: string) => {
  const { invKey, setInvKey } = useRoomCtx();

  useEffect(() => {
    const storedKey = localStorage.getItem(`invitationKey_${roomID}`);

    if (storedKey) {
      setInvKey(storedKey);
    }

    const source = connectSSE(roomID, (newKey: string) => {
      setInvKey(newKey);
      localStorage.setItem(`invitationKey_${roomID}`, newKey);
    });

    return () => {
      source.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomID]);

  return invKey;
};
