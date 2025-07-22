import { useRef, useEffect, useState, useCallback } from 'react';
import { LocalVideoTrack, RemoteVideoTrack } from 'livekit-client';
import { MicIcon, MicOffIcon } from 'lucide-react';
import type { Participant } from '@/types';
import { Avatar } from '@/components/elements';

interface Props {
  index?: number;
  participant: Participant | undefined;
  track: LocalVideoTrack | RemoteVideoTrack;
  remoteSession?: string;
  isLocal: boolean;
  mediaState?: { audio: boolean; video: boolean };
  remoteMediaStates: {
    [sessionID: string]: { audio: boolean; video: boolean };
  };
}

const VideoTile = ({
  index,
  participant,
  track,
  remoteSession,
  isLocal,
  mediaState,
  remoteMediaStates,
}: Props) => {
  const videoID: string = isLocal ? 'local-video' : `${remoteSession}-video`;
  const localVideoElement = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElement = useRef<HTMLVideoElement | null>(null);

  const audioElement = useRef<HTMLAudioElement | null>(null);

  const [isVideoMounted, setIsVideoMounted] = useState(false);

  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    remoteVideoElement.current = element;
    setIsVideoMounted(!!element);
  }, []);

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
        />
      </div>
    );
  };

  const renderRemotePreview = () => {
    if (!remoteSession || !participant) return;

    if (track && remoteMediaStates[remoteSession]?.video) {
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

    return (
      <div className='absolute inset-0 size-full flex items-center justify-center'>
        <Avatar src={participant.avatar_src} className='size-24 object-cover' />
      </div>
    );
  };

  // @TODO: might remove this
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

  const getAudioState = () => {
    if (isLocal) {
      return mediaState;
    }

    if (!remoteSession || !participant) return { audio: false };

    return {
      audio: remoteMediaStates[remoteSession]?.audio,
    };
  };

  return (
    <div className='relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr'>
      {isLocal ? renderLocalPreview() : renderRemotePreview()}
      <div className='absolute bottom-4 right-12 px-12 py-4 rounded-md text-sm text-white bg-black bg-opacity-45 z-50'>
        {participant?.username}
      </div>
      <div className='absolute bottom-4 left-12 py-4 z-50'>
        {getAudioState()?.audio ? (
          <MicIcon color='#e5e7eb' className='size-20' />
        ) : (
          <MicOffIcon color='#dc2626' className='size-20' />
        )}
      </div>
    </div>
  );
};

export default VideoTile;
