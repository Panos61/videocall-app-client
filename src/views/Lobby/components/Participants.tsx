import type { Participant } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Crown } from 'lucide-react';

interface Props {
  participants: Participant[];
}

const Participants = ({ participants }: Props) => {
  console.log(participants);

  return (
    <div className='flex flex-col gap-4 border border-gray-200 rounded-8 p-12 mt-12'>
      <div className='flex justify-between'>
        <span className='font-medium'>Participants</span>
        <div className='text-sm font-light text-blue-600 hover:text-blue-700 duration-150 cursor-pointer'>
          View All
        </div>
      </div>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-4'>
          <span className='text-xs font-medium text-gray-600'>IN CALL (5)</span>
          <div className='flex flex-col text-sm text-gray-500'>
            <p>
              <span className='flex items-center gap-4'>
                <Crown size={12} className='text-yellow-600' /> Panos, Alex and
                3 others are in call.
              </span>
            </p>
          </div>
        </div>
        <Separator />
        <div className='flex flex-col gap-4'>
          <span className='text-xs font-medium text-gray-600'>
            IN LOBBY (4)
          </span>
          <div className='flex flex-col text-sm text-gray-500'>
            <p>Kostas, Anna and 2 others are waiting in lobby.</p>
          </div>
        </div>
      </div>
    </div>
    // <div className='flex items-center gap-4 mt-28 ml-24'>
    //   <span className='flex items-center gap-4 text-xs text-gray-600 whitespace-nowrap'>
    //     <span className='text-lg'>🎧</span> Already in call:{' '}
    //   </span>
    //   {participants && participants.length > 1 ? (
    //     <div className='flex items-center'>
    //       <div className='flex gap-4 ml-12'>
    //         {participants.map((participant) => (
    //           <p className='text-sm'>{participant.username}</p>
    //         ))}
    //       </div>
    //     </div>
    //   ) : (
    //     <>
    //       <Avatar size='sm' src={participants[0]?.avatar_src} />
    //       <p className='text-sm'>{participants[0]?.username}</p>
    //     </>
    //   )}
    // </div>
  );
};

export default Participants;
