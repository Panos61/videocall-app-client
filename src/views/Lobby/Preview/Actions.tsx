import { VideoIcon, MicIcon, MicOffIcon, VideoOffIcon } from 'lucide-react';
import type { Participant } from '@/types';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InviteModal, SettingsModal } from '@/components/elements';

interface Props {
  me: Participant | undefined;
  settings: string;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean) => Promise<void>;
  setVideoState: (enabled: boolean) => Promise<void>;
}

const Actions = ({
  me,
  settings,
  mediaState,
  setAudioState,
  setVideoState,
}: Props) => {
  const handleAudioState = () => {
    setAudioState(!mediaState.audio);
  };

  const handleVideoState = () => {
    setVideoState(!mediaState.video);
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
        {mediaState.video ? (
          <VideoIcon className='size-16' />
        ) : (
          <VideoOffIcon className='size-16' />
        )}
      </Button>
      <Separator orientation='vertical' className='h-6 bg-gray-200' />
      <div className='flex items-center gap-8'>
        <InviteModal />
        <SettingsModal settings={settings} isHost={me?.isHost} />
      </div>
    </div>
  );
};

export default Actions;
