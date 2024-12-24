import { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { VideoIcon, MicIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/elements';

interface Props {
  username: string;
  mediaState: { audio: boolean; video: boolean };
  onGetSrc: (src: string | null) => void;
}

const Preview = ({ username, mediaState, onGetSrc }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // todo: handle warning in case of a missing permission
    const openVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: mediaState.audio,
        video: mediaState.video,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    if (mediaState.video) {
      openVideo();
    }
  }, [mediaState.audio, mediaState.video]);

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
