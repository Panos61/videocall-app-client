import { useState, useEffect } from 'react';
import {
  Track,
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteAudioTrack,
  RemoteVideoTrack,
} from 'livekit-client';

interface TrackInfo {
  track:
    | LocalVideoTrack
    | RemoteVideoTrack
    | LocalAudioTrack
    | RemoteAudioTrack;
  participantIdentity: string;
  kind: Track.Kind;
}

interface Props {
  activeSpeakers: string[];
  remoteTracks: TrackInfo[];
}

export const useOrderedTiles = ({
  activeSpeakers,
  remoteTracks,
}: Props): TrackInfo[] => {
  const [sidePanelOrder, setSidePanelOrder] = useState<TrackInfo[]>([]);
  const [lastSpokeTimestamps, setLastSpokeTimestamps] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const now = Date.now();
    const updatedTimestamps = { ...lastSpokeTimestamps };

    activeSpeakers.forEach((speakerId) => {
      updatedTimestamps[speakerId] = now;
    });
    setLastSpokeTimestamps(updatedTimestamps);

    const sortedRemoteTracks = [...remoteTracks].sort((a, b) => {
      const aIsSpeaking = activeSpeakers.includes(a.participantIdentity);
      const bIsSpeaking = activeSpeakers.includes(b.participantIdentity);

      if (aIsSpeaking && !bIsSpeaking) return -1;
      if (!aIsSpeaking && bIsSpeaking) return 1;

      const aLastSpoke = updatedTimestamps[a.participantIdentity] || 0;
      const bLastSpoke = updatedTimestamps[b.participantIdentity] || 0;

      // Most recent speakers first
      return bLastSpoke - aLastSpoke;
    });

    setSidePanelOrder(sortedRemoteTracks);
  }, [activeSpeakers, remoteTracks]);

  return sidePanelOrder;
};
