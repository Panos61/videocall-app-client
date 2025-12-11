import { HandIcon } from 'lucide-react';
import { useUserEventsCtx } from '@/context';

const RaiseHand = ({ sessionID }: { sessionID: string }) => {
  const { sendUserEvent } = useUserEventsCtx();

  const handleRaiseHand = () => {
    sendUserEvent({
      type: 'raisedhand.sent',
      senderID: sessionID,
      payload: {
        raised_hand: true,
      },
    });
  };

  return (
    <div
      className='flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer hover:scale-105'
      onClick={handleRaiseHand}
    >
      <HandIcon size={16} className='text-yellow-500' />
    </div>
  );
};

export default RaiseHand;
