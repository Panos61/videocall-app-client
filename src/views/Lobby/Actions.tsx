import {
  ChevronUp,
  VideoIcon,
  MicIcon,
  MicOffIcon,
  VideoOffIcon,
} from 'lucide-react';
import type { Participant } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { InviteModal, SettingsModal } from '@/components/elements';

interface Props {
  me: Participant | undefined;
  settings: string;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean) => Promise<void>;
  setVideoState: (enabled: boolean) => Promise<void>;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  audioActiveDeviceId: string;
  videoActiveDeviceId: string;
  setAudioActiveDevice: (deviceId: string) => void;
  setVideoActiveDevice: (deviceId: string) => void;
}

const Actions = ({
  me,
  settings,
  audioDevices,
  videoDevices,
  audioActiveDeviceId,
  videoActiveDeviceId,
  setAudioActiveDevice,
  setVideoActiveDevice,
  mediaState,
  setAudioState,
  setVideoState,
}: Props) => {
  const handleAudioDeviceChange = async (deviceId: string) => {
    setAudioActiveDevice(deviceId);
  };

  const handleVideoDeviceChange = async (deviceId: string) => {
    setVideoActiveDevice(deviceId);
  };

  const renderDropdownMenu = (isAudio: boolean) => {
    const devices = isAudio ? audioDevices : videoDevices;
    const currentDevice = isAudio ? audioActiveDeviceId : videoActiveDeviceId;

    return (
      <DropdownMenuContent side='bottom' align='start'>
        <DropdownMenuLabel>
          {isAudio ? 'Audio Device' : 'Video Device'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {devices.map((device) => {
          const isChecked = currentDevice === device.deviceId;
          return (
            <DropdownMenuRadioGroup
              key={device.deviceId}
              value={currentDevice}
              onValueChange={(deviceId) =>
                isAudio
                  ? handleAudioDeviceChange(deviceId)
                  : handleVideoDeviceChange(deviceId)
              }
            >
              <DropdownMenuRadioItem
                key={device.deviceId}
                value={device.deviceId}
                disabled={isChecked}
              >
                {device.label}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          );
        })}
      </DropdownMenuContent>
    );
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
          {renderDropdownMenu(true)}
        </DropdownMenu>
        <Separator orientation='vertical' className='h-24 bg-gray-200' />
        <div
          className='w-32 h-full flex items-center justify-center duration-300 hover:bg-accent'
          onClick={() => setAudioState(!mediaState.audio)}
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
          {renderDropdownMenu(false)}
        </DropdownMenu>
        <Separator orientation='vertical' className='h-24 bg-gray-200' />
        <div
          className='w-32 h-full flex items-center justify-center duration-300 hover:bg-accent'
          onClick={() => setVideoState(!mediaState.video)}
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
