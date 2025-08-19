import { useRef, useEffect, useState, useCallback } from 'react';
import {
  LocalVideoTrack,
  RemoteVideoTrack,
  LocalAudioTrack,
  RemoteAudioTrack,
  Track,
} from 'livekit-client';
import classNames from 'classnames';
import { MicIcon, MicOffIcon } from 'lucide-react';

import type { Participant } from '@/types';
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

interface ResponsiveSize {
  avatarSize: 'sm' | 'md' | 'lg';
  usernameSize: 'sm' | 'lg';
  iconSize: 16 | 20;
}

interface Props {
  index?: number;
  participant: Participant | undefined;
  track: LocalVideoTrack | RemoteVideoTrack;
  audioTracks?: TrackInfo[];
  audioTrack?: LocalAudioTrack | RemoteAudioTrack;
  remoteSession?: string;
  isLocal: boolean;
  responsiveSize?: ResponsiveSize;
  mediaState?: { audio: boolean; video: boolean };
  remoteMediaStates: {
    [sessionID: string]: { audio: boolean; video: boolean };
  };
}

const VideoTile = ({
  index,
  participant,
  track,
  audioTracks,
  remoteSession,
  isLocal,
  mediaState,
  remoteMediaStates,
  responsiveSize = {
    avatarSize: 'lg',
    usernameSize: 'lg',
    iconSize: 20,
  },
}: Props) => {
  const videoID: string = isLocal ? 'local-video' : `${remoteSession}-video`;
  const localVideoElement = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElement = useRef<HTMLVideoElement | null>(null);
  const tileContainerRef = useRef<HTMLDivElement | null>(null);

  const audioElement = useRef<HTMLAudioElement | null>(null);

  const [isVideoMounted, setIsVideoMounted] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(isLocal);
  const isIntersectingRef = useRef(false);

  const { avatarSize, usernameSize, iconSize } = responsiveSize;

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
  }, [isLocal, shouldLoadVideo, participant?.username, remoteSession]);

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
    if (!remoteSession || !participant) return;

    if (shouldLoadVideo && track && remoteMediaStates[remoteSession]?.video) {
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
          muted={!remoteMediaStates[remoteSession]?.audio}
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

    if (remoteSession) {
      const remoteVideoEnabled = remoteMediaStates[remoteSession]?.video;
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
  }, [track, remoteMediaStates, remoteSession, isVideoMounted]);

  useEffect(() => {
    if (!audioTracks || !remoteSession) return;

    const participantAudioTrack = audioTracks.find(
      (audioTrack) => audioTrack.participantIdentity === remoteSession
    );

    if (
      audioElement.current &&
      participantAudioTrack &&
      remoteMediaStates[remoteSession]?.audio
    ) {
      participantAudioTrack.track.attach(audioElement.current);
    }

    return () => {
      if (audioElement.current && participantAudioTrack) {
        participantAudioTrack.track.detach(audioElement.current);
      }
    };
  }, [audioTracks, remoteMediaStates, remoteSession]);

  const getAudioState = () => {
    if (isLocal) {
      return mediaState;
    }

    if (!remoteSession || !participant) return { audio: false };

    return {
      audio: remoteMediaStates[remoteSession]?.audio,
    };
  };

  const usernameCls = classNames(
    'absolute bottom-4 right-12 px-12 py-4 rounded-md text-white bg-black bg-opacity-45 z-50',
    {
      'w-[52px] text-xs bg-black/80 truncate': usernameSize === 'sm',
      'w-[144px] text-sm': usernameSize === 'lg',
    }
  );

  return (
    <div
      ref={tileContainerRef}
      className='relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr transition-all duration-1000 ease-out'
    >
      {isLocal ? renderLocalPreview() : renderRemotePreview()}
      <div className={usernameCls}>{participant?.username}</div>
      <div className='absolute bottom-4 left-12 py-4 z-50'>
        {getAudioState()?.audio ? (
          <MicIcon color='#e5e7eb' className={`size-${iconSize}`} />
        ) : (
          <MicOffIcon color='#dc2626' className={`size-${iconSize}`} />
        )}
      </div>
      {/* <audio ref={audioElement} autoPlay style={{ display: 'none' }} /> */}
    </div>
  );
};

export default VideoTile;
