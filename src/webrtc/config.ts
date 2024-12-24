// Config ICE servers for RTCPeerConnection
export const ICE_SERVERS: { iceServers: RTCIceServer[] } = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: import.meta.env.VITE_TURN_SERVER_ADDRESS || '',
      username: import.meta.env.VITE_TURN_SERVER_USERNAME,
      credential: import.meta.env.VITE_TURN_SERVER_CREDENTIALS,
    },
  ],
};
