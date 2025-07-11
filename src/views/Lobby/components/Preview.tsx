import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { LocalVideoTrack } from 'livekit-client';
import { VideoIcon, MicIcon } from 'lucide-react';
import { Avatar } from '@/components/elements';
interface Props {
  username: string;
  mediaState: { audio: boolean; video: boolean };
  videoTrack: LocalVideoTrack;
  onGetSrc: (src: string | null) => void;
}

const Preview = ({ username, mediaState, videoTrack, onGetSrc }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoElement = videoRef.current;

  useEffect(() => {
    if (videoTrack && videoElement) {
      videoElement.srcObject = videoTrack.mediaStream as MediaStream;
    }
  }, [videoTrack, videoElement]);

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
