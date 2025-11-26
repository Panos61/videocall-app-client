import { BASE_WS_URL } from '@/utils/constants';

export const connectSSE = (
  roomID: string,
  onInvitationUpdate: (key: string) => void
) => {
  const source: EventSource = new EventSource(
    `${BASE_WS_URL}/sse-invitation-update/${roomID}`
  );

  source.addEventListener('update', (event) => {
    const newInvitation: string = event.data;
    onInvitationUpdate(newInvitation);
  });

  return source;
};
