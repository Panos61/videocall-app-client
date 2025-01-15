import { forwardRef, useRef, useEffect } from 'react';
import { MicIcon, MicOffIcon } from 'lucide-react';
import type { Participant } from '@/types';
import { Avatar } from '@/components/elements';

interface Props {
  index?: number;
  participant: Participant | undefined;
  userSession?: string;
  localStream: MediaStream | undefined;
  isLocal: boolean;
  mediaState: { audio: boolean; video: boolean };
  gridCls: string;
}

const VideoTile = forwardRef<HTMLVideoElement, Props>((props, ref) => {
  const {
    index,
    participant,
    userSession,
    localStream,
    isLocal,
    mediaState,
    gridCls,
  } = props;
  const videoTileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref || typeof ref === 'function' || !ref.current) return;

    const videoElement = ref.current;
    const isPlaying =
      !videoElement.paused &&
      !videoElement.ended &&
      videoElement.currentTime > 0 &&
      videoElement.readyState > videoElement.HAVE_CURRENT_DATA;

    if (isLocal) {
      if (mediaState.video && localStream) {
        if (videoElement.srcObject !== localStream) {
          videoElement.srcObject = localStream;
        }

        if (isPlaying) {
          videoElement
            .play()
            .catch((err) => console.error('Error playing video:', err));
        }
      } else {
        videoElement.srcObject = null;
      }
    }
  }, [isLocal, mediaState.video, localStream, ref]);

  const videoID = isLocal ? 'local-video' : `${userSession}-video`;

  const renderLocalPreview = () => {
    if (mediaState.video) {
      return (
       <div id='video-wrapper' className='relative size-full'>
         <video
          id={videoID}
          key={index}
          ref={ref}
          autoPlay
          muted={!mediaState.audio}
          className='absolute size-full object-cover'
        />
       </div>
      );
    }

    return (
      <Avatar
        src={participant?.avatar_src}
        className='self-center object-cover flex-grow'
      />
    );
  };

  const videoTileCls =
    'relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr';
  const cls = videoTileCls.concat(' ', gridCls);

  return (
    <div ref={videoTileRef} className={cls}>
      {renderLocalPreview()}
      <div className='absolute bottom-4 right-12 px-12 py-4 rounded-md text-sm text-white bg-black bg-opacity-45 z-50'>
        {participant?.username}
      </div>
      <div className='absolute bottom-4 left-12 py-4 z-50'>
        {mediaState.audio ? (
          <MicIcon color='#e5e7eb' className='size-20' />
        ) : (
          <MicOffIcon color='#dc2626' className='size-20' />
        )}
      </div>
    </div>
  );
});

export default VideoTile;