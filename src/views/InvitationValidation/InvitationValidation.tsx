import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { validateInvitation, joinRoom } from '@/api';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export const InvitationValidation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { toast } = useToast();

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const invitationCode = queryParams.get('code');
  const roomID = queryParams.get('room');

  useEffect(() => {
    if (!roomID || !invitationCode) return;

    const handleValidateInvitation = async () => {
      setIsValidating(true);
      setError(null);
      setIsSuccess(false);

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const validationResponse = await validateInvitation(
          invitationCode,
          roomID
        );

        console.log('validationResponse', validationResponse);

        if (!validationResponse) {
          setIsValidating(false);
          setError(
            'An error occurred while validating your invitation. Try again.'
          );
          return;
        }

        if (!validationResponse.isValid) {
          setIsValidating(false);
          setError('Your invitation is invalid. Please contact the host.');
          return;
        }

        if (validationResponse.isExpired) {
          setIsValidating(false);
          setError('Your invitation has expired. Please contact the host.');
          return;
        }

        try {
          const joinRoomResponse = await joinRoom(roomID);
          if (joinRoomResponse.isAuthorized) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsSuccess(true);
            setIsValidating(false);
            localStorage.setItem('jwt_token', joinRoomResponse.participant.jwt);

            setTimeout(() => {
              navigate(`/room/${roomID}`, {
                state: { roomID: roomID },
              });
            }, 2000);
            toast({
              description: 'Successfully joined in! 🎉',
            });
          } else {
            setIsValidating(false);
            setError('Failed to join room. Something went wrong..');
          }
        } catch (joinError) {
          console.error('Join room error:', joinError);
          setIsValidating(false);
          setError('Failed to join the room. Please try again.');
        }
      } catch (err) {
        console.error('Validation error:', err);
        setIsValidating(false);
        setError('An error occurred while validating your invitation.');
      }
    };

    handleValidateInvitation();
  }, [roomID, invitationCode, navigate, toast]);

  const LoadingSpinner = () => {
    return (
      <div className='flex w-full items-center justify-center mt-4'>
        <div className='flex flex-col items-center'>
          <div className='size-36 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 ' />
        </div>
      </div>
    );
  };

  const renderAlert = () => {
    if (isValidating) {
      return (
        <div className='flex flex-col items-center gap-8'>
          <p className='text-sm animate-pulse text-orange-400'>
            Validating your invitation..
          </p>
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className='flex flex-col items-center gap-8'>
          <p className='text-sm text-red-600'>{error}</p>
          <div className='animate-circle-entrance'>
            <CircleX className='size-24 text-red-600' />
          </div>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className='flex flex-col items-center gap-8'>
          <div className='animate-circle-entrance'>
            <CircleCheckBig className='size-24 text-green-600' />
          </div>
          <p className='text-sm text-green-600'>Your invitation is valid! 😻</p>
          <p className='text-sm'>Joining room..</p>
          <LoadingSpinner />
        </div>
      );
    }
  };

  return (
    <div className='min-h-screen bg-cover bg-fixed bg-custom-bg'>
      <div className='mt-48 flex justify-center'>
        <Card className='w-[500px]'>
          <CardHeader>
            <CardTitle className='self-center font-mono'>
              Rooms_ invite
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-8'>
            <p className='text-sm'>Your invitation code: {invitationCode}</p>
            {renderAlert()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
