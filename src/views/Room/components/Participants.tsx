import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from 'lucide-react';
import type { Participant } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Avatar, InviteModal } from '@/components/elements';
import Sidebar from '../Sidebar';

interface Props {
  open: boolean;
  participants: Participant[];
  sessionID: string;
  mediaState: { audio: boolean; video: boolean };
  remoteMediaStates: {
    [sessionID: string]: { audio: boolean; video: boolean };
  };
  onClose: () => void;
}

const Participants = ({
  open,
  participants,
  mediaState,
  remoteMediaStates,
  sessionID,
  onClose,
}: Props) => {
  const getMediaState = (remoteSession: string, participant: Participant) => {
    const isLocal = sessionID === remoteSession;
    if (isLocal) {
      return mediaState;
    }

    if (!remoteSession || !participant) return { audio: false, video: false };

    return {
      audio: remoteMediaStates[remoteSession]?.audio ?? participant.media.audio,
      video: remoteMediaStates[remoteSession]?.video ?? participant.media.video,
    };
  };

  return (
    <Sidebar title='Participants' open={open} onClose={onClose}>
      <>
        <InviteModal />
        <p className='p-16 text-xs text-white font-bold'>
          IN MEETING ({participants.length})
        </p>
        <Separator className='mb-12 bg-gray-700 outline' />
        <div className='flex flex-col gap-4 py-8 px-12 mx-4 bg-white rounded-16'>
          {participants.map((participant, i) => (
            <div
              key={i}
              className={`flex items-center gap-8 py-4 px-8 rounded-12 cursor-default duration-500 ${
                participant.isHost && 'bg-orange-200/75'
              } ${
                participant.isHost ? 'hover:bg-orange-300' : 'hover:bg-gray-200'
              }`}
            >
              <Avatar size='sm' src={participant.avatar_src} />
              <div className='flex items-center gap-4'>
                <p className='text-sm text-black break-all'>
                  {participant.username}
                </p>
                {participant.isHost && (
                  <span className='text-xs text-black font-bold'>
                    {participant.isHost && '(Host)'}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-8 ml-auto'>
                {getMediaState(participant.session_id, participant).audio ? (
                  <MicIcon color='#000000' className='size-12' />
                ) : (
                  <MicOffIcon color='#dc2626' className='size-12' />
                )}
                {getMediaState(participant.session_id, participant).video ? (
                  <VideoIcon color='#000000' className='size-12' />
                ) : (
                  <VideoOffIcon color='#dc2626' className='size-12' />
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    </Sidebar>
  );
};

export default Participants;
