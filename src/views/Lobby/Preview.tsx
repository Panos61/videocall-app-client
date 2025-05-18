import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { VideoIcon, MicIcon } from 'lucide-react';

import type { DevicePreferences } from '@/context/media/MediaControlProvider';
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
  }, [mediaState.audio, mediaState.video, audioDevice, videoDevice]);

  const renderActiveDeviceIcon = () => {
    const activeDevices = [
      mediaState.audio
        ? {
            text: 'Mic active',
            icon: <MicIcon size='20' className='text-green-400' />,
          }
        : null,
      mediaState.video
        ? {
            text: 'Video active',
            icon: <VideoIcon size='20' className='text-green-400' />,
          }
        : null,
    ].filter(
      (device): device is { text: string; icon: JSX.Element } => device !== null
    );

    return (
      <div className='absolute bottom-24 left-20 flex gap-8'>
        {activeDevices.map((device, index) => (
          <div
            key={index}
            className='flex items-center gap-4 px-4 text-xs text-green-400'
          >
            {device.icon}
          </div>
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
      {renderActiveDeviceIcon()}
    </div>
  );
};

export default Preview;
