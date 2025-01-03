import { useRef, useCallback } from 'react';
import { createDummyAudioTrack } from './dummy-audio';

export const usePeerConnection = (servers: RTCConfiguration) => {
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const initializePC = useCallback(
    (stream?: MediaStream) => {
      peerConnection.current = new RTCPeerConnection(servers);

      if (stream) {
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });
      } else {
        const dummyAudioStream = createDummyAudioTrack();
        peerConnection.current.addTrack(
          dummyAudioStream.getAudioTracks()[0],
          dummyAudioStream
        );

        peerConnection.current.addTransceiver('audio', {
          direction: 'recvonly',
        });
        peerConnection.current.addTransceiver('video', {
          direction: 'recvonly',
        });
      }

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
    addICECandidate,
    disconnect,
  };
};
