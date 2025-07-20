export const connectSSE = (
  roomID: string,
  onInvitationUpdate: (key: string) => void
) => {
  const source: EventSource = new EventSource(
    `http://localhost:8080/sse-invitation-update/${roomID}`
  );

  source.addEventListener('update', (event) => {
    const newInvitation: string = event.data;
    onInvitationUpdate(newInvitation);
  });

  return source;
};
