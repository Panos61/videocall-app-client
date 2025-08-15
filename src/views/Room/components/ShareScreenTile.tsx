import { useEffect, useRef } from 'react';
import { ScreenShare } from 'lucide-react';
import {
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteAudioTrack,
  RemoteVideoTrack,
  Track,
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

const ShareScreenTile = ({
  screenShareTrack,
}: {
  screenShareTrack: TrackInfo | null;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    const sharedTrack = screenShareTrack?.track;
    console.log('ShareScreenTile useEffect:', {
      hasVideoElement: !!videoElement,
      hasSharedTrack: !!sharedTrack,
      screenShareTrack,
    });

    if (videoElement && sharedTrack) {
      console.log('Attaching screen share track to video element');
      sharedTrack.attach(videoElement);
    }

    return () => {
      if (videoElement && sharedTrack) {
        console.log('Detaching screen share track from video element');
        sharedTrack.detach(videoElement);
      }
    };
  }, [screenShareTrack]);

  if (!screenShareTrack) return null;

  return (
    <div className='relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr outline outline-green-500/45 transition-all duration-1000 ease-out'>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className='absolute size-full object-contain'
      />
      <div className='absolute bottom-4 right-12 px-12 py-4 rounded-md text-sm text-white bg-black bg-opacity-45 z-50 flex items-center gap-8'>
        <span>Screen share</span>
        <ScreenShare size={16} className='text-green-500' />
      </div>
    </div>
  );
};

export default ShareScreenTile;
