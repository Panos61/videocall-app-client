import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookie from 'js-cookie';

import { validateInvitation, joinRoom } from '@/api';

import { CircleCheckBig, CircleX, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/elements';
import { useToast } from '@/components/ui/use-toast';

export const InvitationValidation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExternal = searchParams.get('external') !== 'false';

  const { toast } = useToast();

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const invitationCode = searchParams.get('code');
  const roomID = searchParams.get('room');

  useEffect(() => {
    if (!roomID || !invitationCode) return;

    const handleValidateInvitation = async () => {
      setIsValidating(true);
      setError(null);
      setIsSuccess(false);

      try {
        const validationResponse = await validateInvitation(
          invitationCode,
          roomID
        );

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
          const { isAuthorized, participant } = joinRoomResponse;

          if (isAuthorized) {
            // await new Promise((resolve) => setTimeout(resolve, 1000));
            setIsSuccess(true);
            setIsValidating(false);
            Cookie.set('rsCookie', participant.jwt);

            if (!isExternal) {
              // setTimeout(() => {
              navigate(`/room/${roomID}`, {
                state: { roomID: roomID },
              });
              // }, 2000);
            }
            toast({
              description: 'Successfully joined in! 🎉',
            });
          } else {
            setIsValidating(false);
            setError('Failed to join room. Something went wrong..');
          }
        } catch (joinError) {
          setIsValidating(false);
          setError('Failed to join the room. Please try again.');
        }
      } catch (err) {
        setIsValidating(false);
        setError('An error occurred while validating your invitation.');
      }
    };

    handleValidateInvitation();
  }, [roomID, invitationCode, navigate, toast, isExternal]);

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
            <CircleX className='size-32 text-red-600' />
          </div>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className='flex flex-col items-center gap-8'>
          <div className='animate-circle-entrance'>
            <CircleCheckBig className='size-32 text-green-600' />
          </div>
          <div className='flex flex-col items-center gap-4'>
            <p className='text-sm text-green-600'>Invitation is valid!</p>
            {isExternal && (
              <p className='text-sm'>You can now join in the room.</p>
            )}
          </div>
          {!isExternal && (
            <>
              <p className='text-sm'>Joining room..</p>
              <div className='mt-4 w-full'>
                <LoadingSpinner />
              </div>
            </>
          )}
        </div>
      );
    }
  };

  return (
    <div className='flex justify-center items-center mt-[160px]'>
      <Card className='w-[500px]'>
        <CardHeader className='flex flex-col items-center'>
          <div className='flex items-center gap-8'>
            <span className='text-2xl font-mono font-medium'>Toku</span>
            <span className='text-xl'>Authorization</span>
          </div>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-12'>
          <p className='text-sm'>Your invitation code: {invitationCode}</p>
          {renderAlert()}
          {isExternal && isSuccess && (
            <Button
              variant='call'
              onClick={() => navigate(`/room/${roomID}`)}
              className='mt-4'
            >
              <LogIn className='size-20 mr-8 text-white' />
              Proceed
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
