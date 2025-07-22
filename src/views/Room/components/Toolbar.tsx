import { useLocation, useNavigate } from 'react-router-dom';
import Cookie from 'js-cookie';
import { Room } from 'livekit-client';
import classNames from 'classnames';

import { leaveRoom } from '@/api';
import { useSessionCtx, useMediaControlCtx } from '@/context';

import {
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  UsersIcon,
  MessageCircleIcon,
} from 'lucide-react';
import { SettingsModal } from '@/components/elements';

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

  const menuBtnCls =
    'flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer';

  return (
    <div className='flex items-center h-60'>
      <div className='flex items-center gap-8 m-8'>
        <div className={menuBtnCls} onClick={handleAudioState}>
          {mediaState.audio ? (
            <MicIcon size={16} />
          ) : (
            <MicOffIcon color='#dc2626' size={16} />
          )}
        </div>
        <div className={menuBtnCls} onClick={handleVideoState}>
          {mediaState.video ? (
            <VideoIcon size={16} />
          ) : (
            <VideoOffIcon color='#dc2626' size={16} />
          )}
        </div>
        <div
          className={menuBtnCls}
          onClick={() =>
            setActivePanel(
              activePanel === 'participants' ? null : 'participants'
            )
          }
        >
          <UsersIcon size={16} />
        </div>
        <div
          className={menuBtnCls}
          onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
        >
          <MessageCircleIcon size={16} />
        </div>
        <SettingsModal />
        <div
          className={classNames(menuBtnCls, '!bg-red-500')}
          onClick={handleOnLeave}
        >
          <PhoneOffIcon size={16} color='white' />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
