import { useEffect } from 'react';
// import { joinRoom } from '@/api';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const InvitationValidation = () => {
  const { roomID, invitationCode } = useParams();
  console.log('roomID', roomID);
  console.log('invitationCode', invitationCode);
  // const navigate = useNavigate();

  // navigate(`/room/${roomID}`, {
  //   state: { roomID: roomID },
  // });
  useEffect(() => {}, [roomID, invitationCode]);

  return (
    <div className='flex justify-center mt-76'>
      <Card className='w-96'>
        <CardHeader>
          <CardTitle>Invitation Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Enter the invitation code to join the room</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button>Join Room</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
