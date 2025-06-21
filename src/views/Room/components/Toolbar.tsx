import { useLocation, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { Room } from 'livekit-client';
import { leaveRoom } from '@/api';
import { useSessionCtx, useMediaControlCtx } from '@/context';

import {
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  UsersIcon,
  SettingsIcon,
  GaugeIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  sessionID: string;
  room: Room | null;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean, sessionID: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID: string) => Promise<void>;
  activePanel: 'participants' | 'chat' | null;
  setActivePanel: (panel: 'participants' | 'chat' | null) => void;
}

const Toolbar = ({
  sessionID,
  room,
  mediaState,
  setAudioState,
  setVideoState,
  activePanel,
  setActivePanel,
}: Props) => {
  const { sendMessage, disconnect } = useSessionCtx();
  const { videoTrack, setVideoTrack } = useMediaControlCtx();

  const navigate = useNavigate();
  const location = useLocation();
  const { roomID } = location.state;

  const jwt: string | undefined = Cookie.get('rsCookie');

  const handleAudioState = async () => {
    setAudioState(!mediaState.audio, sessionID);
    if (room?.localParticipant) {
      await room.localParticipant.setMicrophoneEnabled(!mediaState.audio);
    }
  };

  const handleVideoState = async () => {
    setVideoState(!mediaState.video, sessionID);

    if (room?.localParticipant) {
      await room.localParticipant.setCameraEnabled(!mediaState.video);
    }
  };

  const handleOnLeave = async () => {
    try {
      if (room?.localParticipant) {
        await room.localParticipant.setCameraEnabled(false);
        await room.localParticipant.setMicrophoneEnabled(false);
      }

      if (room) {
        await room.disconnect();
      }

      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
      }

      // Reset media state in context
      setAudioState(false, sessionID);
      setVideoState(false, sessionID);

      sendMessage({ type: 'disconnect', sessionID });
      disconnect();
      await leaveRoom(roomID, jwt);

      Cookie.remove('rsCookie');
      navigate('/');
    } catch (error) {
      console.error('Error during leave:', error);
    } finally {
      Cookie.remove('rsCookie');
      navigate('/');
    }
  };

  return (
    <div className='flex items-center border border-gray-100/15 rounded-xl bg-transparent'>
      <div className='flex gap-8 m-8'>
        <Button variant='secondary' size='sm' onClick={handleAudioState}>
          {mediaState.audio ? (
            <MicIcon className='size-16' />
          ) : (
            <MicOffIcon color='#dc2626' className='size-16' />
          )}
        </Button>
        <Button variant='outline' size='sm' onClick={handleVideoState}>
          {mediaState.video ? (
            <VideoIcon className='size-16' />
          ) : (
            <VideoOffIcon color='#dc2626' className='size-16' />
          )}
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            setActivePanel(
              activePanel === 'participants' ? null : 'participants'
            )
          }
        >
          <UsersIcon className='size-16' />
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
        >
          <MessageCircleIcon className='size-16' />
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
