import type { Participant } from '@/types';
import {
  ChevronUp,
  VideoIcon,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
      <div className='flex items-center h-[34px] outline outline-slate-200 rounded-4 hover:text-accent-foreground'>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className='w-16 h-full flex items-center justify-center duration-300 hover:bg-accent'
          >
            <div className='w-16 h-full flex items-center justify-center duration-300 hover:bg-accent'>
              <ChevronUp className='size-16' />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            <DropdownMenuItem>
              Macbook Pro Microphone (Built-in) (System default)
            </DropdownMenuItem>
            <DropdownMenuItem>
              Microsoft Teams Audio Device (Virtual)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation='vertical' className='h-24 bg-gray-200' />
        <div
          className='w-32 h-full flex items-center justify-center duration-300 hover:bg-accent'
          onClick={() => handleAudioState()}
        >
          {mediaState.audio ? (
            <MicIcon className='size-16' />
          ) : (
            <MicOffIcon className='size-16' />
          )}
        </div>
      </div>
      <div className='flex items-center h-[34px] outline outline-slate-200 rounded-4 hover:text-accent-foreground'>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className='w-16 h-full flex items-center justify-center duration-300 hover:bg-accent'
          >
            <div className='w-16 h-full flex items-center justify-center duration-300 hover:bg-accent'>
              <ChevronUp className='size-16' />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            <DropdownMenuItem>
              FaceTime HD Camera (Built-in)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation='vertical' className='h-24 bg-gray-200' />
        <div
          className='w-32 h-full flex items-center justify-center duration-300 hover:bg-accent'
          onClick={() => handleVideoState()}
        >
          {mediaState.video ? (
            <VideoIcon className='size-16' />
          ) : (
            <VideoOffIcon className='size-16' />
          )}
        </div>
      </div>
      <Separator orientation='vertical' className='h-6 bg-gray-200' />
      <div className='flex items-center gap-8'>
        <InviteModal />
        <SettingsModal settings={settings} isHost={me?.isHost} />
      </div>
    </div>
  );
};

export default Actions;
