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
}

const VideoTile = forwardRef<HTMLVideoElement, Props>(
  (
    { index, participant, userSession, localStream, isLocal, mediaState },
    ref
  ) => {
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!ref || typeof ref == 'function' || !ref.current) return;
      const videoElement = ref.current;

      // Pause the video before making changes to avoid AbortError
      // videoElement.pause();

      if (!isLocal) return;

      if (mediaState.video && localStream) {
        if (videoElement.srcObject !== localStream) {
          videoElement.srcObject = localStream;
        }

        videoElement
          .play()
          .catch((err) => console.error('Error playing video:', err));
      } else {
        videoElement.srcObject = null; // Detach the stream when video is disabled
      }
    }, [isLocal, mediaState.video, localStream, ref]);

    const videoID = isLocal ? 'local-video' : `${userSession}-video`;

    const renderLocalPreview = () => {
      if (mediaState.video) {
        return (
          <video
            id={videoID}
            key={index}
            ref={ref}
            autoPlay
            muted={!mediaState.audio}
            className='size-full object-cover z-50'
          />
        );
      }

      return (
        <Avatar
          src={participant?.avatar_src}
          className='self-center object-cover flex-grow'
        />
      );
    };

    // const renderRemotePreview = () => {
    //   if (mediaState.video) {
    //     return (
    //       <video
    //         id={videoID}
    //         key={index}
    //         ref={ref}
    //         autoPlay
    //         muted={!mediaState.audio}
    //         className='size-full object-cover z-50'
    //       />
    //     );
    //   }

    //   return (
    //     <Avatar
    //       src={participant?.avatar_src}
    //       className='self-center object-cover flex-grow'
    //     />
    //   );
    // };

    return (
      <div
        ref={divRef}
        className='relative size-[668px] flex items-center justify-center rounded-8 overflow-hidden bg-zinc-900 text-gr'
      >
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
  }
);

export default VideoTile;
