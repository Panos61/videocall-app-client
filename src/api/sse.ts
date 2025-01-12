export const connectSSE = (
  roomID: string,
  onInvitationUpdate: (key: string) => void
) => {
  const source = new EventSource(
    `http://localhost:8080/sse-invitation-update/${roomID}`
  );

  source.addEventListener('update', (event) => {
    const newInvitation = event.data;
    onInvitationUpdate(newInvitation);
  });

  return source;
};
