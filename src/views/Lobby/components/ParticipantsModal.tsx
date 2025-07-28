import type { Participant } from '@/types';
import { Crown, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/elements';

interface Props {
  guests: string[];
  participants: Participant[];
  participantsInCall: Participant[];
}

const ParticipantsModal = ({
  guests,
  participants,
  participantsInCall,
}: Props) => {
  const totalUsersLobby = guests.length + participants.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='text-sm font-light text-blue-600 hover:text-blue-700 duration-150 cursor-pointer'>
          View All
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center gap-4'>
              Participants <Users className='size-16' />
            </div>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className='flex gap-24 mt-8'>
          <div className='flex flex-col gap-4 w-full'>
            <div className='text-xs font-medium text-gray-600'>
              IN CALL ({participantsInCall.length})
            </div>
            <div className='flex flex-col gap-4 mt-4 text-sm'>
              {participantsInCall.map((participant) => (
                <div key={participant.id}>
                  <div className='flex items-center gap-4 p-4 rounded-8 hover:bg-gray-100 duration-150'>
                    <Avatar size='sm' src={participant.avatar_src} />
                    <span>{participant.username}</span>
                    {participant.isHost && (
                      <Crown size={12} className='text-yellow-600' />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {totalUsersLobby > 0 && (
            <>
              <Separator orientation='vertical' />
              <div className='flex flex-col gap-4 text-left'>
                <div className='text-xs text-left font-medium text-gray-600'>
                  IN LOBBY ({totalUsersLobby})
                </div>
                <div className='flex flex-col text-sm'>
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className='flex items-center gap-4'
                    >
                      <Avatar />
                      <span>{participant.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsModal;
