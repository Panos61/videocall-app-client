import { useLocation } from 'react-router-dom';
import {
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  UsersIcon,
  SettingsIcon,
  GaugeIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHandleLeaveRoom } from '@/hooks';

interface Props {
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (roomID: string, enabled: boolean) => Promise<void>;
  setVideoState: (roomID: string, enabled: boolean) => Promise<void>;
  onOpenParticipants: () => void;
}

const Toolbar = ({
  mediaState,
  setAudioState,
  setVideoState,
  onOpenParticipants,
}: Props) => {
  const location = useLocation();
  const { roomID } = location.state;

  const { handleLeaveRoom } = useHandleLeaveRoom();
  // const { sendDisconnect } = useSendDisconnect();

  const handleAudioState = () => {
    setAudioState(roomID, !mediaState.audio);
  };

  const handleVideoState = () => {
    setVideoState(roomID, !mediaState.video);
  };

  const handleOnLeave = () => {
    handleLeaveRoom();
    // sendDisconnect(, roomID);
  };

  return (
    <div className='flex items-center border border-opacity-35 rounded-xl z-20 border-gray-100 bg-transparent'>
      <div className='flex gap-8 m-8'>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => handleAudioState()}
        >
          {mediaState.audio ? (
            <MicIcon className='size-16' />
          ) : (
            <MicOffIcon color='#dc2626' className='size-16' />
          )}
        </Button>
        <Button variant='outline' size='sm' onClick={() => handleVideoState()}>
          {mediaState.video ? (
            <VideoIcon className='size-16' />
          ) : (
            <VideoOffIcon color='#dc2626' className='size-16' />
          )}
        </Button>
        <Button variant='outline' size='sm' onClick={onOpenParticipants}>
          <UsersIcon className='size-16' />
        </Button>
        <Button variant='outline' size='sm'>
          <SettingsIcon className='size-16' />
        </Button>
        <Button variant='outline' size='sm'>
          <GaugeIcon className='size-16' />
        </Button>
        <Button variant='destructive' size='sm' onClick={handleOnLeave}>
          <div className='flex items-center gap-8'>
            Leave
            <PhoneOffIcon className='size-16' />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Toolbar;
