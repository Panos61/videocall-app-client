import type { Participant } from '@/types';
import { Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ParticipantsModal from './ParticipantsModal';

interface Props {
  guests: Participant[];
}

const Participants = ({ guests }: Props) => {
  console.log(guests);

  const renderGuests = () => {
    if (guests.length === 0) return null;

    if (guests.length > 0) {
      return (
        <>
          <Separator />
          <div className='flex flex-col gap-4'>
            <span className='text-xs font-medium text-gray-600'>
              IN LOBBY ({guests.length})
            </span>
            <div className='flex flex-col text-xs text-gray-500'>
              <div className='flex flex-col text-xs text-gray-500'>
                {guests.length}{' '}
                {guests.length === 1 ? 'Guest' : 'Guests'}{' '}
                {guests.length === 1 ? 'is' : 'are'} waiting in lobby.
              </div>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className='flex flex-col gap-4 border border-gray-200 rounded-8 p-12 mt-12'>
      <div className='flex justify-between'>
        <span className='font-medium'>Participants</span>
        <ParticipantsModal participants={guests} />
      </div>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <span className='text-xs font-medium text-gray-600'>IN CALL (5)</span>
          <div className='flex flex-col text-xs text-gray-500'>
            <p>
              <span className='flex items-center gap-4'>
                <Crown size={12} className='text-yellow-600' /> Panos, Alex and
                3 others are in call.
              </span>
            </p>
          </div>
        </div>
        {renderGuests()}
      </div>
    </div>
  );
};

export default Participants;
