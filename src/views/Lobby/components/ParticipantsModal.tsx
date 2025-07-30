import type { Participant } from '@/types';
import { Crown, Users } from 'lucide-react';
import { Avatar } from '@/components/elements';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Props {
  guests: Participant[];
  participantsInLobby: Participant[];
  participantsInCall: Participant[];
}

const ParticipantItem = ({
  participant,
  participantsInCall,
  isLobby,
}: {
  participant: Participant;
  participantsInCall?: Participant[];
  isLobby?: boolean;
}) => {
  return (
    <div key={participant.id}>
      <div className='flex items-center gap-4 p-4 rounded-8 hover:bg-gray-100 duration-150'>
        {participant.avatar_src && (
          <Avatar size='sm' src={participant.avatar_src} />
        )}
        <div className='flex flex-col'>
          <div className='flex items-center gap-4'>
            <span>{participant.username}</span>
            {participant.isHost && (
              <Crown size={12} className='text-yellow-600' />
            )}
            {isLobby && participantsInCall?.length === 0 && (
              <span className='text-xs text-gray-500'>Waiting in lobby</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ParticipantsModal = ({
  guests,
  participantsInLobby,
  participantsInCall,
}: Props) => {
  const totalUsersLobby = guests.length + participantsInLobby.length;

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
          {participantsInCall.length > 0 && (
            <div className='flex flex-col gap-4 w-full'>
              <div className='text-xs font-medium text-gray-600'>
                IN CALL ({participantsInCall.length})
              </div>
              <div className='flex flex-col gap-4 text-sm'>
                {participantsInCall.map((participant) => (
                  <ParticipantItem
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </div>
            </div>
          )}
          {participantsInCall.length > 0 && participantsInLobby.length > 0 && (
            <Separator orientation='vertical' />
          )}
          {totalUsersLobby > 0 && (
            <>
              <div className='flex flex-col gap-4 text-left w-full'>
                <div className='text-xs text-left font-medium text-gray-600'>
                  IN LOBBY ({totalUsersLobby})
                </div>
                <div className='flex flex-col gap-4 text-sm'>
                  {participantsInLobby.map((participant) => (
                    <ParticipantItem
                      key={participant.id}
                      participant={participant}
                      participantsInCall={participantsInCall}
                      isLobby
                    />
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
