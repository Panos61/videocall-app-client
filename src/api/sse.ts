export const connectSSE = (
  roomID: string,
  onInvitationUpdate: (key: string) => void
) => {
  const source = new EventSource(
    `http://localhost:8080/sse-invitation-update/${roomID}`
  );

  source.addEventListener('update', (event) => {
    // Call the callback function to update the state with the new key
    onInvitationUpdate(event.data);
  });

  source.addEventListener('error', (event) => {
    console.error('SSE error:', event);
  });

  return source;
};
