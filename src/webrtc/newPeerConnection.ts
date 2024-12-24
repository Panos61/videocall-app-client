import { useRef, useCallback } from 'react';

export const usePeerConnection = (servers: RTCConfiguration) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const initializePC = useCallback(
    (stream: MediaStream) => {
      peerConnection.current = new RTCPeerConnection(servers);

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      peerConnection.current.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state: ${peerConnection.current?.iceConnectionState}`
        );
      };

      peerConnection.current.onconnectionstatechange = () => {
        console.log(
          `Peer connection state: ${peerConnection.current?.connectionState}`
        );
      };

      return peerConnection.current;
    },
    [servers]
  );

  const createOffer = useCallback(async () => {
    if (!peerConnection.current) throw new Error('PC not initialized');
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    return offer;
  }, []);

  const createAnswer = useCallback(async () => {
    if (!peerConnection.current) throw new Error('PC not initialized');
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    return answer;
  }, []);

  const setRemoteDescription = useCallback(
    async (description: RTCSessionDescriptionInit) => {
      if (!peerConnection.current) throw new Error('PC not initialized');
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(description)
      );
    },
    []
  );

  const addICECandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!peerConnection.current) throw new Error('PC not initialized');
    await peerConnection.current.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  }, []);

  const disconnect = useCallback(() => {
    peerConnection.current?.close();
    peerConnection.current = null;
  }, []);

  return {
    initializePC,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addICECandidate,
    disconnect,
  };
};
