import { ScreenShare } from 'lucide-react';
import { useEventsCtx } from '@/context';
import { Room } from 'livekit-client';

const ShareScreen = ({
  sessionID,
  room,
}: {
  sessionID: string;
  room: Room | null;
}) => {
  const { sendEvent } = useEventsCtx();

  const handleShareScreen = async () => {
    if (!room?.localParticipant) {
      console.error('Local participant not available');
      return;
    }

    try {
      await room.localParticipant.setScreenShareEnabled(true);

      sendEvent({
        type: 'share_screen.started',
        senderID: sessionID,
        payload: {
          share_screen: true,
        },
      });
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <div
      className='flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer hover:scale-105'
      onClick={handleShareScreen}
    >
      <ScreenShare size={16} className='text-green-500' />
    </div>
  );
};

export default ShareScreen;
