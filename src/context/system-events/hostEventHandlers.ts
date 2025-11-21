import { QueryClient } from '@tanstack/react-query';
import type { HostUpdatedPayload } from './events';
import type { Participant } from '@/types';

// invalidate cached data when host is updated
export const handleHostUpdated = (
  queryClient: QueryClient,
  payload: HostUpdatedPayload,
  roomId: string
) => {
  const participantsData: { participantsInCall: Participant[] } =
    queryClient.getQueryData<{ participantsInCall: Participant[] }>([
      'call-participants',
      roomId,
    ])!;

  const previousHost = participantsData.participantsInCall.find(
    (p) => p.id === payload.current_host_id
  );
  console.log('previousHost', previousHost);

  queryClient.invalidateQueries({ queryKey: ['call-participants', roomId] });
  queryClient.invalidateQueries({ queryKey: ['me', roomId] });
};

// invalidate cached data when host leaves
export const handleHostLeft = (queryClient: QueryClient, roomId: string) => {
  queryClient.invalidateQueries({ queryKey: ['call-participants', roomId] });
  queryClient.invalidateQueries({ queryKey: ['me', roomId] });
};
