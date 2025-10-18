import { useEffect, useRef } from 'react';
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

  return (
    <div className='relative size-full rounded-3xl bg-black z-50 mx-auto'>
      <div className='relative size-full'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block'>
          <Avatar size='lg' value={username} editingMode onGetSrc={onGetSrc} />
        </div>
        {mediaState.video && (
          <video
            ref={videoRef}
            muted={!mediaState.audio}
            autoPlay
            playsInline
            className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full object-cover rounded-3xl'
          />
        )}
      </div>
      <div className='absolute bottom-24 left-24 flex gap-8 items-center text-xs text-green-400'>
        {mediaState.audio && (
          <div className='p-8 bg-green-400/20 rounded-full'>
            <MicIcon size={20} className='text-green-400' />
          </div>
        )}
        {mediaState.video && (
          <div className='p-8 bg-green-400/20 rounded-full'>
            <VideoIcon size={20} className='text-green-400' />
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
