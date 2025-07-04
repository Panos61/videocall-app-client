import classNames from 'classnames';
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
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { InviteModal, SettingsModal } from '@/components/elements';

interface Props {
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

  const micBtnCls = classNames(
    'size-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105',
    {
      'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200':
        mediaState.audio,
      'bg-red-500 border border-red-500 text-white hover:bg-red-600':
        !mediaState.audio,
    }
  );

  const videoBtnCls = classNames(
    'size-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105',
    {
      'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200':
        mediaState.video,
      'bg-red-500 border border-red-500 text-white hover:bg-red-600':
        !mediaState.video,
    }
  );

  return (
    <div className='flex items-center justify-center gap-8 mt-16'>
      <div className='relative'>
        <button
          className={micBtnCls}
          onClick={() => setAudioState(!mediaState.audio)}
        >
          {mediaState.audio ? <MicIcon size={16} /> : <MicOffIcon size={16} />}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='absolute -bottom-4 -right-4 size-20 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center shadow-sm'>
              <ChevronUp className='size-8 text-gray-600 rotate-180' />
            </button>
          </DropdownMenuTrigger>
          {renderDropdownMenu(true)}
        </DropdownMenu>
      </div>
      <div className='relative'>
        <button
          className={videoBtnCls}
          onClick={() => setVideoState(!mediaState.video)}
        >
          {mediaState.video ? (
            <VideoIcon size={16} />
          ) : (
            <VideoOffIcon size={16} />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='absolute -bottom-4 -right-4 size-20 rounded-full border border-gray-300 bg-white hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center shadow-sm'>
              <ChevronUp className='size-8 text-gray-600 rotate-180' />
            </button>
          </DropdownMenuTrigger>
          {renderDropdownMenu(false)}
        </DropdownMenu>
      </div>
      <Separator orientation='vertical' className='h-6 bg-gray-200' />
      <div className='flex items-center gap-8'>
        <InviteModal />
        <SettingsModal />
      </div>
    </div>
  );
};

export default Actions;
