import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { VideoIcon, MicIcon } from 'lucide-react';

import type { DevicePreferences } from '@/context/media/MediaControlProvider';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/elements';
interface Props {
  username: string;
  mediaState: { audio: boolean; video: boolean };
  audioDevice: DevicePreferences | null;
  videoDevice: DevicePreferences | null;
  onGetSrc: (src: string | null) => void;
}

const Preview = ({
  username,
  mediaState,
  audioDevice,
  videoDevice,
  onGetSrc,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const switchStream = async (constraints: MediaStreamConstraints) => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = newStream;

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error switching media devices:', error);
    }
  };

  useEffect(() => {
    const constraints = {
      audio: mediaState.audio
        ? {
            deviceId: {
              exact: audioDevice?.deviceId,
            },
          }
        : false,
      video: mediaState.video
        ? {
            deviceId: {
              exact: videoDevice?.deviceId,
            },
          }
        : false,
    };

    if (mediaState.audio || mediaState.video) {
      switchStream(constraints);
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    const videoElement = videoRef.current;

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        mediaStreamRef.current = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [
    mediaState.audio,
    mediaState.video,
    audioDevice,
    videoDevice,
  ]);

  const renderMediaBadge = () => {
    const activeBadges = [
      mediaState.audio
        ? {
            text: 'Mic active',
            icon: <MicIcon size='12' className='text-green-400' />,
          }
        : null,
      mediaState.video
        ? {
            text: 'Video active',
            icon: <VideoIcon size='12' className='text-green-400' />,
          }
        : null,
    ].filter(
      (badge): badge is { text: string; icon: JSX.Element } => badge !== null
    );

    return (
      <div className='absolute bottom-24 left-20 flex flex-col gap-8'>
        {activeBadges.map((badge, index) => (
          <Badge
            key={index}
            variant='outline'
            className='border-green-500 text-green-400 animate-pulse'
          >
            <div className='flex items-center gap-4 px-4 text-xs'>
              {badge.text} {badge.icon}
            </div>
          </Badge>
        ))}
      </div>
    );
  };

  const avatarCls = classNames('absolute', {
    'invisible overflow-hidden size-0': mediaState.video,
    'inset-0 flex items-center justify-center': !mediaState.video,
  });

  const renderPreview = () => {
    return (
      <div className='relative w-full h-full'>
        <div className={avatarCls}>
          <Avatar value={username} editingMode onGetSrc={onGetSrc} />
        </div>
        {mediaState.video && (
          <video
            ref={videoRef}
            muted={!mediaState.audio}
            autoPlay
            playsInline
            className='absolute inset-0 size-full object-cover rounded-3xl'
          />
        )}
      </div>
    );
  };

  return (
    <div className='relative flex h-full w-full rounded-3xl bg-black'>
      {renderPreview()}
      {renderMediaBadge()}
    </div>
  );
};

export default Preview;
