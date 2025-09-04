import { useNavigate, useParams } from 'react-router-dom';
import Cookie from 'js-cookie';
import { Room } from 'livekit-client';
import classNames from 'classnames';

import { leaveCall } from '@/api';
import {
  useSessionCtx,
  useSystemEventsCtx,
  useMediaControlCtx,
  usePreferencesCtx,
} from '@/context';

import {
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  UsersIcon,
  MessageCircleIcon,
  LayoutGridIcon,
  LayoutPanelLeftIcon,
} from 'lucide-react';
import { SettingsModal } from '@/components/elements';
import { Separator } from '@/components/ui/separator';
import Clock from './Clock';
import ConnectionStatus from './ConnectionStatus';
import Reactions from './Reactions';
import RaiseHand from './RaiseHand';
import ShareScreen from './ShareScreen';

interface Props {
  sessionID: string;
  room: Room | null;
  mediaState: { audio: boolean; video: boolean };
  setAudioState: (enabled: boolean, sessionID: string) => Promise<void>;
  setVideoState: (enabled: boolean, sessionID: string) => Promise<void>;
  activePanel: 'participants' | 'chat' | null;
  setActivePanel: (panel: 'participants' | 'chat' | null) => void;
  onScreenShareChange?: (isSharing: boolean, track?: any) => void;
}

const Toolbar = ({
  sessionID,
  room,
  mediaState,
  setAudioState,
  setVideoState,
  activePanel,
  setActivePanel,
  onScreenShareChange,
}: Props) => {
  const { sendMessage, disconnect } = useSessionCtx();
  const { sendSystemEvent } = useSystemEventsCtx();
  const { videoTrack, setVideoTrack } = useMediaControlCtx();
  const { setIsChatExpanded, setIsFocusView, isFocusView } =
    usePreferencesCtx();

  const navigate = useNavigate();
  const { id: roomID } = useParams<{ id: string }>();

  if (!roomID) return null;

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

      sendSystemEvent({
        type: 'user.left',
        session_id: sessionID,
        payload: {},
      });

      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
      }

      // Reset media state in context
      setAudioState(false, sessionID);
      setVideoState(false, sessionID);

      sendMessage({ type: 'disconnect', sessionID });
      disconnect();
      await leaveCall(roomID, jwt);

      navigate(`/room/${roomID}/post-call`, {
        state: { roomID },
        replace: true,
      });
    } catch (error) {
      console.error('Error during leave:', error);
    } finally {
      navigate(`/room/${roomID}/post-call`, {
        state: { roomID },
        replace: true,
      });
    }
  };

  const menuBtnCls =
    'flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer hover:scale-105';

  return (
    <div className='flex items-center w-full px-24'>
      <div className='flex-1 mr-16'>
        <div className='flex items-center gap-8'>
          <Clock />
          <Separator orientation='vertical' className='h-28 bg-zinc-500' />
          <ConnectionStatus />
        </div>
      </div>
      <div className='flex-shrink-0'>
        <div className='flex items-center justify-center gap-8 p-8 border border-t-0 border-b-0 border-zinc-700 rounded-12'>
          <div
            className='flex items-center gap-4 p-4 border border-zinc-500 rounded-16 text-xs bg-zinc-800 hover:bg-zinc-600/20 duration-300 ease-in-out cursor-pointer'
            onClick={() => setIsFocusView(!isFocusView)}
          >
            <div className='p-4 bg-white rounded-full'>
              {isFocusView ? (
                <LayoutGridIcon size={16} />
              ) : (
                <LayoutPanelLeftIcon size={16} />
              )}
            </div>
            <span className='text-zinc-200'>
              {isFocusView ? 'Focus view' : 'Tile view'}
            </span>
          </div>
          <Separator orientation='vertical' className='h-28 bg-zinc-700' />
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
          <RaiseHand sessionID={sessionID} />
          <Reactions sessionID={sessionID} />
          <ShareScreen
            sessionID={sessionID}
            room={room as Room}
            onScreenShareChange={onScreenShareChange}
          />
          <div
            className={menuBtnCls}
            onClick={() =>
              setActivePanel(activePanel === 'chat' ? null : 'chat')
            }
          >
            <MessageCircleIcon size={16} className='text-violet-500' />
          </div>
          <div
            className={menuBtnCls}
            onClick={() => {
              setActivePanel(
                activePanel === 'participants' ? null : 'participants'
              );
              setIsChatExpanded(false);
            }}
          >
            <UsersIcon size={16} />
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
      <div className='flex-1'></div>
    </div>
  );
};

export default Toolbar;
