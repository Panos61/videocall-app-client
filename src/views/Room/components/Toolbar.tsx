import { Dispatch, SetStateAction } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
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
  MessageCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  sessionID: string;
  localStream: MediaStream | undefined;
  setLocalStream: Dispatch<SetStateAction<MediaStream | undefined>>;
  localVideo: React.RefObject<HTMLVideoElement>;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean, sessionID: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID: string) => Promise<void>;
  activePanel: 'participants' | 'chat' | null;
  setActivePanel: (panel: 'participants' | 'chat' | null) => void;
}

const Toolbar = ({
  sessionID,
  localStream,
  setLocalStream,
  localVideo,
  mediaState,
  setAudioState,
  setVideoState,
  activePanel,
  setActivePanel,
}: Props) => {
  const { sendMessage } = useSignallingCtx();

  const navigate = useNavigate();
  const location = useLocation();
  const { roomID } = location.state;

  const jwt: string | undefined = Cookie.get('rsCookie');

  const handleAudioState = () => {
    setAudioState(!mediaState.audio, sessionID);
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
    setVideoState(videoEnabled, sessionID);
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
      setAudioState(false, sessionID);
      setVideoState(false, sessionID);

      navigate('/');
      Cookie.remove('rsCookie');
    } catch (error) {
      console.error('Error during leave:', error);
    }
  };

  return (
    <div className='flex items-center border border-gray-100/15 rounded-xl z-20  bg-transparent'>
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
