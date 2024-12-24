import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Participant } from '@/types';
import { getRoomParticipants } from '@/api';
import { Avatar, AvatarStack } from '@/components/elements';

const Participants = () => {
  const { pathname } = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);

  const roomID: string = pathname.split('/')[2];

  useEffect(() => {
    const handleGetRoomParticipants = async () => {
      try {
        const participantData: Participant[] = await getRoomParticipants(
          roomID
        );
        console.log(participantData);
        setParticipants(participantData);
      } catch (error) {
        console.log(error);
      }
    };

    handleGetRoomParticipants();
  }, [roomID]);

  if (participants.length === 0)
    return (
      <span className='flex justify-center mt-28 text-xs text-gray-600 whitespace-nowrap'>
        You will be the host of this call.
      </span>
    );

  return (
    <div className='flex items-center gap-4 mt-28 ml-24'>
      <span className='flex items-center gap-4 text-xs text-gray-600 whitespace-nowrap'>
        <span className='text-lg'>🎧</span> Already in call:{' '}
      </span>
      {participants && participants.length > 1 ? (
        <div className='flex items-center'>
          <AvatarStack>
            {participants.map((participant, i) => (
              <div key={i} className='flex items-center gap-4'>
                <Avatar size='sm' src={participant.avatar_src} />
              </div>
            ))}
          </AvatarStack>
          <div className='flex gap-4 ml-12'>
            {participants.map((participant) => (
              <p className='text-sm'>{participant.username}</p>
            ))}
          </div>
        </div>
      ) : (
        <>
          <Avatar size='sm' src={participants[0]?.avatar_src} />
          <p className='text-sm'>{participants[0]?.username}</p>
        </>
      )}
    </div>
  );
};

export default Participants;
