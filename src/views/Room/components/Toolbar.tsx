import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { leaveRoom } from '@/api';
import { useSignallingCtx } from '@/context/signalling';
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

interface Props {
  sessionID: string;
  localStream: MediaStream | undefined;
  setLocalStream: Dispatch<SetStateAction<MediaStream | undefined>>;
  localVideo: React.RefObject<HTMLVideoElement>;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean) => Promise<void>;
  setVideoState: (enabled: boolean) => Promise<void>;
  onOpenParticipants: () => void;
}

const Toolbar = ({
  sessionID,
  localStream,
  setLocalStream,
  localVideo,
  mediaState,
  setAudioState,
  setVideoState,
  onOpenParticipants,
}: Props) => {
  const { sendMessage } = useSignallingCtx();

  const navigate = useNavigate();
  const location = useLocation();
  const { roomID } = location.state;

  const jwt = localStorage.getItem('jwt_token');

  const handleAudioState = () => {
    setAudioState(!mediaState.audio);
  };

  const handleVideoState = async () => {
    const videoEnabled = !mediaState.video;
    if (videoEnabled) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (localStream) {
          videoStream
            .getVideoTracks()
            .forEach((track) => localStream.addTrack(track));
        } else {
          setLocalStream(videoStream);
        }
      } catch (err) {
        console.error('Error enabling video:', err);
      }
    } else {
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.stop();
          localStream.removeTrack(track);
        });
        if (!localStream.getTracks().length) {
          setLocalStream(undefined);
        }
      }
    }
    setVideoState(videoEnabled);
  };

  const handleOnLeave = async () => {
    try {
      sendMessage({ type: 'disconnect', sessionID });
      await leaveRoom(roomID, jwt);

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        setLocalStream(undefined);
      }

      // Detach video source
      if (localVideo?.current?.srcObject) {
        localVideo.current.srcObject = null;
      }

      // Reset media state in context
      setAudioState(false);
      setVideoState(false);

      navigate('/');
      localStorage.removeItem('jwt_token');
    } catch (error) {
      console.error('Error during leave:', error);
    }
  };

  return (
    <div className='flex items-center border border-opacity-15 rounded-xl z-20 border-gray-100 bg-transparent'>
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
