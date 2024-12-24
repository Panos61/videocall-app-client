import { useLocation } from 'react-router-dom';
import { VideoIcon, MicIcon, MicOffIcon, VideoOffIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InviteModal } from '@/components/elements';

interface Props {
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (roomID: string, enabled: boolean) => Promise<void>;
  setVideoState: (roomID: string, enabled: boolean) => Promise<void>;
}

const Actions = ({ mediaState, setAudioState, setVideoState }: Props) => {
  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];

  const handleAudioState = () => {
    setAudioState(roomID, !mediaState.audio);
  };

  const handleVideoState = () => {
    setVideoState(roomID, !mediaState.video);
  };

  return (
    <div className='flex items-center justify-center gap-8 mt-16'>
      <Button size='sm' variant='outline' onClick={() => handleAudioState()}>
        {mediaState.audio ? (
          <MicIcon className='size-16' />
        ) : (
          <MicOffIcon className='size-16' />
        )}
      </Button>
      <Button size='sm' variant='outline' onClick={() => handleVideoState()}>
        {mediaState.video
         ? (
          <VideoIcon className='size-16' />
        ) : (
          <VideoOffIcon className='size-16' />
        )}
      </Button>
      <Separator orientation='vertical' className='h-6 bg-gray-200' />
      <InviteModal />
    </div>
  );
};

export default Actions;
