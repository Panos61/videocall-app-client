import type { Participant } from '@/types';
import { Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ParticipantsModal from './participants-modal';

interface Props {
  guests: Participant[];
  participants: Participant[];
  participantsInCall: Participant[];
}

const ParticipantItem = ({ participant }: { participant: Participant }) => {
  return (
    <div key={participant.id} className='flex items-center gap-4'>
      {participant.isHost && <Crown size={12} className='text-yellow-600' />}
      {participant.username}
    </div>
  );
};

const Participants = ({ guests, participants, participantsInCall }: Props) => {
  const totalUsers =
    participants.length + guests.length + participantsInCall.length;

  const participantsInLobby = participants.filter(
    (participant) =>
      !participantsInCall.some((p) => p.session_id === participant.session_id)
  );

  const renderParticipantsInCall = () => {
    if (participantsInCall.length === 0) return null;

    return (
      <div className='flex flex-col gap-4'>
        <span className='text-xs font-medium text-gray-600'>
          IN CALL ({participantsInCall.length})
        </span>
        <div className='flex items-center gap-4 text-xs text-gray-500'>
          {participantsInCall.map((participant) => (
            <ParticipantItem key={participant.id} participant={participant} />
          ))}
        </div>
      </div>
    );
  };

  const renderParticipantsInLobby = () => {
    if (guests.length === 0 && participantsInLobby.length === 0) return null;

    if (participantsInLobby.length > 0) {
      const totalUsersLobby = participantsInLobby.length + guests.length;

      return (
        <>
          {participantsInCall.length > 0 && <Separator />}
          <div className='flex flex-col gap-4 '>
            <span className='text-xs font-medium text-gray-600'>
              IN LOBBY ({totalUsersLobby})
            </span>
            <div className='flex items-center gap-4 text-xs text-gray-500 max-w-[328px] overflow-x-auto'>
              {participantsInLobby.slice(0, 3).map((participant, index) => (
                <>
                  <ParticipantItem
                    key={participant.id}
                    participant={participant}
                  />
                  {index < participantsInLobby.length - 1 && (
                    <Separator orientation='vertical' />
                  )}
                </>
              ))}
              {participantsInLobby.length > 3 && (
                <div className='text-xs text-gray-500'>
                  +{participantsInLobby.length - 3} others
                </div>
              )}
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className='flex flex-col gap-4 p-12 mt-12 border border-gray-200 rounded-8'>
      <div className='flex items-center justify-between'>
        <span className='font-medium'>Participants</span>
        {totalUsers > 0 && (
          <ParticipantsModal
            guests={guests}
            participantsInLobby={participantsInLobby}
            participantsInCall={participantsInCall}
          />
        )}
      </div>
      <div className='flex flex-col gap-8'>
        {renderParticipantsInCall()}
        {renderParticipantsInLobby()}
      </div>
    </div>
  );
};

export default Participants;
