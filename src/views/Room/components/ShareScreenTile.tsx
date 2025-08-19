import { useEffect, useRef } from 'react';
import { ScreenShareIcon } from 'lucide-react';
import {
  LocalAudioTrack,
  LocalVideoTrack,
  RemoteAudioTrack,
  RemoteVideoTrack,
  Track,
} from 'livekit-client';
import { useEventsCtx } from '@/context';
import classNames from 'classnames';

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
  isTilePanel: boolean;
  screenShareTrack: TrackInfo | null;
}

const ShareScreenTile = ({ isTilePanel, screenShareTrack }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const {
    events: { shareScreenEvents },
  } = useEventsCtx();

  useEffect(() => {
    const videoElement = videoRef.current;
    const sharedTrack = screenShareTrack?.track;

    if (videoElement && sharedTrack) {
      console.warn('Attaching screen share track to video element');
      sharedTrack.attach(videoElement);
    }

    return () => {
      if (videoElement && sharedTrack) {
        console.warn('Detaching screen share track from video element');
        sharedTrack.detach(videoElement);
      }
    };
  }, [screenShareTrack]);

  if (!screenShareTrack) return null;

  const tileInfoCls = classNames(
    'absolute bottom-4 right-12 flex items-center gap-8 px-12 py-4 rounded-md text-sm text-white bg-black z-50',
    {
      'bg-black/45': isTilePanel,
      'bg-black': !isTilePanel,
    }
  );

  return (
    <div className='relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr outline outline-green-500/45 transition-all duration-1000 ease-out'>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className='absolute size-full object-cover'
      />
      <div className={tileInfoCls}>
        {!isTilePanel && (
          <span>{shareScreenEvents[0].username}'s shared screen</span>
        )}
        <ScreenShareIcon
          size={isTilePanel ? 12 : 20}
          className='text-green-500'
        />
      </div>
    </div>
  );
};

export default ShareScreenTile;
