import { X, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon } from 'lucide-react';
import type { Participant } from '@/types';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, InviteModal } from '@/components/elements';

interface Props {
  open: boolean;
  participants: Participant[];
  mediaState: { audio: boolean; video: boolean };
  onClose: () => void;
}

const Participants = ({ open, participants, mediaState, onClose }: Props) => {
  return (
    <div
      className={`fixed right-0 top-0 h-[85%] w-[256px] mt-20 mr-16 rounded-12 border border-slate-800 bg-slate-950 shadow-lg transform ${
        open ? 'translate-x-0' : 'translate-x-full'
      } transition-transform duration-300 ease-in-out`}
    >
      <div className='flex flex-col mx-8'>
        <Button size='sm' onClick={onClose} className='absolute top-8 right-8'>
          <X size='20px' />
        </Button>
        <p className='p-16 text-sm text-white'>
          Participants ({participants.length})
        </p>
        <InviteModal />
        <Separator className='my-16 bg-gray-700 outline' />
        <div className='flex flex-col gap-4 py-8 px-12 mx-4 bg-white rounded-16'>
          {participants.map((participant, i) => (
            <div
              key={i}
              className='flex items-center gap-8 py-4 px-4 rounded-12 cursor-default duration-500 hover:bg-gray-200'
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
                {participant.media.audio ? (
                  <MicIcon color='#000000' className='size-12' />
                ) : (
                  <MicOffIcon color='#dc2626' className='size-12' />
                )}
                {participant.media.video ? (
                  <VideoIcon color='#000000' className='size-12' />
                ) : (
                  <VideoOffIcon color='#dc2626' className='size-12' />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Participants;
