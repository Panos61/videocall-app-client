import { useRef, useEffect, useCallback } from 'react';
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
  gridCls: string;
}

const VideoTile = (props: Props) => {
  const {
    index,
    participant,
    track,
    remoteSession,
    isLocal,
    mediaState,
    remoteMediaStates,
    gridCls,
  } = props;

  const videoID: string = isLocal ? 'local-video' : `${remoteSession}-video`;

  const localVideoElement = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElement = useRef<HTMLVideoElement | null>(null);

  const audioElement = useRef<HTMLAudioElement | null>(null);
  const videoTileRef = useRef<HTMLDivElement>(null);

  const getMediaState = useCallback(() => {
    if (isLocal) {
      return mediaState;
    }

    if (!remoteSession || !participant) return { audio: false, video: false };

    return {
      audio: remoteMediaStates[remoteSession]?.audio,
      video: remoteMediaStates[remoteSession]?.video,
    };
  }, [remoteMediaStates, remoteSession, participant, isLocal, mediaState]);

  const remoteAudioEnabled = getMediaState()?.audio;
  const remoteVideoEnabled = getMediaState()?.video;

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

    if (track && remoteVideoEnabled) {
      return (
        <video
          id={videoID}
          key={index}
          ref={remoteVideoElement}
          muted={!remoteAudioEnabled}
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

  useEffect(() => {
    if (audioElement.current && track && mediaState?.audio) {
      track.attach(audioElement.current);
    }

    return () => {
      if (track) {
        track.detach();
      }
    };
  }, [track, mediaState?.audio]);

  useEffect(() => {
    if (localVideoElement.current && track && mediaState?.video) {
      track.attach(localVideoElement.current);
    }

    return () => {
      if (track) {
        track.detach();
      }
    };
  }, [track, mediaState?.video]);

  useEffect(() => {
    if (remoteVideoElement.current && track) {
      if (remoteVideoEnabled) {
        track.attach(remoteVideoElement.current);
      } else {
        track.detach();
      }
    }

    return () => {
      if (track) {
        track.detach();
      }
    };
  }, [track, remoteVideoEnabled]);

  const videoTileCls =
    'relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr';
  const cls = videoTileCls.concat(' ', gridCls);

  return (
    <div ref={videoTileRef} className={cls}>
      {isLocal ? renderLocalPreview() : renderRemotePreview()}
      <div className='absolute bottom-4 right-12 px-12 py-4 rounded-md text-sm text-white bg-black bg-opacity-45 z-50'>
        {participant?.username}
      </div>
      <div className='absolute bottom-4 left-12 py-4 z-50'>
        {remoteAudioEnabled ? (
          <MicIcon color='#e5e7eb' className='size-20' />
        ) : (
          <MicOffIcon color='#dc2626' className='size-20' />
        )}
      </div>
    </div>
  );
};

export default VideoTile;
