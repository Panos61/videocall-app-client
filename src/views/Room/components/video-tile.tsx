import { useRef, useEffect, useState, useCallback } from 'react';
import {
  LocalVideoTrack,
  RemoteVideoTrack,
  LocalAudioTrack,
  RemoteAudioTrack,
  Track,
} from 'livekit-client';
import classNames from 'classnames';
import { HandIcon, MicIcon, MicOffIcon } from 'lucide-react';

import type { Participant } from '@/types';
import { useUserEventsCtx } from '@/context';
import { Avatar, LoadingSpinner } from '@/components/elements';

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
  index?: number;
  isActiveSpeaker: boolean;
  isTilePanel?: boolean;
  participant: Participant | undefined;
  track: LocalVideoTrack | RemoteVideoTrack;
  audioTracks?: TrackInfo[];
  audioTrack?: LocalAudioTrack | RemoteAudioTrack;
  remoteIdentity?: string;
  isLocal: boolean;
  responsiveWidth?: number;
  mediaState?: { audio: boolean; video: boolean };
  remoteMediaStates: {
    [sessionID: string]: { audio: boolean; video: boolean };
  };
}

const VideoTile = ({
  index,
  isTilePanel,
  participant,
  track,
  audioTracks,
  remoteIdentity,
  isLocal,
  isActiveSpeaker,
  responsiveWidth,
  mediaState,
  remoteMediaStates,
}: Props) => {
  const {
    events: { raisedHandEvents },
  } = useUserEventsCtx();

  const videoID: string = isLocal ? 'local-video' : `${remoteIdentity}-video`;
  const localVideoElement = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElement = useRef<HTMLVideoElement | null>(null);
  const tileContainerRef = useRef<HTMLDivElement | null>(null);

  const audioElement = useRef<HTMLAudioElement | null>(null);

  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(isLocal);
  const isIntersectingRef = useRef(false);

  const calculateResponsiveSize = useCallback(() => {
    let avatarSize: 'sm' | 'md' | 'lg' = 'lg';
    let usernameSize: 'sm' | 'lg' = 'lg';
    let iconSize: 16 | 20 = 20;

    // Only apply responsive sizing for panel tiles
    if (!isTilePanel) {
      return { avatarSize, usernameSize, iconSize };
    }

    responsiveWidth = responsiveWidth || 0;
    if (responsiveWidth < 185) {
      avatarSize = 'sm';
      usernameSize = 'sm';
      iconSize = 16;
    } else if (responsiveWidth < 250) {
      avatarSize = 'md';
      usernameSize = 'sm';
      iconSize = 16;
    } else if (responsiveWidth < 590) {
      avatarSize = 'md';
      usernameSize = 'lg';
      iconSize = 20;
    }

    return { avatarSize, usernameSize, iconSize };
  }, [responsiveWidth, isTilePanel]);

  const { avatarSize, usernameSize, iconSize } = calculateResponsiveSize();

  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    remoteVideoElement.current = element;
    setIsVideoMounted(!!element);
  }, []);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (isLocal) return;

    const currentRef = tileContainerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;

        if (entry.isIntersecting && !shouldLoadVideo) {
          setTimeout(() => {
            setShouldLoadVideo(true);
          }, 1000);
        }
      },
      {
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [isLocal, shouldLoadVideo, participant?.username, remoteIdentity]);

  const renderLocalPreview = () => {
    if (track && mediaState?.video) {
      return (
        <div id='video-wrapper' className='relative size-full'>
          <video
            id={videoID}
            key={index}
            ref={localVideoElement}
            muted={!mediaState?.audio}
            autoPlay
            className='absolute size-full object-cover'
          />
        </div>
      );
    }

    return (
      <div className='absolute inset-0 size-full flex items-center justify-center'>
        <Avatar
          src={participant?.avatar_src}
          className='size-24 object-cover'
          size={avatarSize}
        />
      </div>
    );
  };

  const renderRemotePreview = () => {
    if (!remoteIdentity || !participant) return;

    if (shouldLoadVideo && track && remoteMediaStates[remoteIdentity]?.video) {
      if (!shouldLoadVideo) {
        return (
          <div className='absolute inset-0 flex items-center justify-center size-full'>
            <LoadingSpinner size='lg' />
          </div>
        );
      }

      return (
        <video
          id={videoID}
          key={index}
          ref={setVideoRef}
          muted={!remoteMediaStates[remoteIdentity]?.audio}
          autoPlay
          className='absolute size-full object-cover'
        />
      );
    }

    const loadingCls = classNames(
      'absolute inset-0 size-full  flex items-center justify-center duration-1000',
      {
        'bg-zinc-800': !shouldLoadVideo,
        'bg-zinc-900': shouldLoadVideo,
      }
    );

    return (
      <div className={loadingCls}>
        <div className='flex flex-col items-center gap-4'>
          {!shouldLoadVideo && <LoadingSpinner size='lg' />}
          {shouldLoadVideo && (
            <Avatar
              src={participant.avatar_src}
              className='size-24 object-cover'
              size={avatarSize}
            />
          )}
        </div>
      </div>
    );
  };

  // todo: might remove this
  useEffect(() => {
    if (audioElement.current && track && mediaState?.audio) {
      track.attach(audioElement.current);
    }

    const audioRef = audioElement.current;

    return () => {
      if (track && audioRef) {
        track.detach(audioRef);
      }
    };
  }, [track, mediaState?.audio]);

  useEffect(() => {
    if (localVideoElement.current && track && mediaState?.video) {
      track.attach(localVideoElement.current);
    }

    const localVideoRef = localVideoElement.current;

    return () => {
      if (track && localVideoRef) {
        track.detach(localVideoRef);
      }
    };
  }, [track, mediaState?.video]);

  useEffect(() => {
    const remoteVideoRef = remoteVideoElement.current;

    if (remoteIdentity) {
      const remoteVideoEnabled = remoteMediaStates[remoteIdentity]?.video;
      if (remoteVideoRef) {
        if (track && remoteVideoEnabled) {
          track.attach(remoteVideoRef);
        } else {
          track.detach(remoteVideoRef);
        }
      }
    }

    return () => {
      if (track && remoteVideoRef) {
        track.detach(remoteVideoRef);
      }
    };
  }, [track, remoteMediaStates, remoteIdentity, isVideoMounted]);

  useEffect(() => {
    if (!audioTracks || !remoteIdentity) return;

    const participantAudioTrack = audioTracks.find(
      (audioTrack) => audioTrack.participantIdentity === remoteIdentity
    );

    if (
      audioElement.current &&
      participantAudioTrack &&
      remoteMediaStates[remoteIdentity]?.audio
    ) {
      participantAudioTrack.track.attach(audioElement.current);
    }

    return () => {
      if (audioElement.current && participantAudioTrack) {
        participantAudioTrack.track.detach(audioElement.current);
      }
    };
  }, [audioTracks, remoteMediaStates, remoteIdentity]);

  const getAudioState = () => {
    if (isLocal) {
      return mediaState;
    }

    if (!remoteIdentity || !participant) return { audio: false };

    return {
      audio: remoteMediaStates[remoteIdentity]?.audio,
    };
  };

  // todo: refactor this logic - -> O(n) -> O(1) + bug on remote video tile
  const isRaisedHand = raisedHandEvents.some(
    (event) => event.username === participant?.username
  );

  const videoTileCls = classNames(
    'relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr',
    {
      'transition-transform duration-1000 ease-out': !isRaisedHand,
      'outline outline-yellow-500': isRaisedHand,
      'outline outline-green-500': isActiveSpeaker,
    }
  );

  const usernameCls = classNames(
    'absolute bottom-4 right-12 px-12 py-4 rounded-md text-white bg-black bg-opacity-45 z-50',
    {
      'w-48 text-xs bg-black/80 truncate': usernameSize === 'sm',
      'text-sm': usernameSize === 'lg',
    }
  );

  return (
    <div ref={tileContainerRef} className={videoTileCls}>
      {isRaisedHand && !isTilePanel && (
        <HandIcon
          size={24}
          className='text-yellow-500 absolute top-12 right-12'
        />
      )}
      {isLocal ? renderLocalPreview() : renderRemotePreview()}
      <div className={usernameCls}>{participant?.username}</div>
      <div className='absolute bottom-4 left-12 py-4 z-50'>
        {getAudioState()?.audio ? (
          <MicIcon color='#e5e7eb' className={`size-${iconSize}`} />
        ) : (
          <MicOffIcon color='#dc2626' className={`size-${iconSize}`} />
        )}
      </div>
    </div>
  );
};

export default VideoTile;
