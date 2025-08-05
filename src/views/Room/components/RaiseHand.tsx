import { HandIcon } from 'lucide-react';
import { useEventsCtx } from '@/context';

interface Props {
  username: string;
  sessionID: string;
}

const RaiseHand = ({ username, sessionID }: Props) => {
  const { sendEvent } = useEventsCtx();

  const handleRaiseHand = () => {
    sendEvent({
      type: 'raised_hand.sent',
      senderID: sessionID,
      payload: {
        raised_hand: true,
        sender: username,
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
