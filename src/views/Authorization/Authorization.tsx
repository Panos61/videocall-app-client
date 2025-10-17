import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookie from 'js-cookie';

import { validateInvitation, joinRoom } from '@/api/api';

import { CircleCheckBig, CircleX, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/elements';
import { useToast } from '@/components/ui/use-toast';

const Authorization = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExternal = searchParams.get('external') !== 'false';

  const { toast } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const invitationCode = searchParams.get('code');
  const roomID = searchParams.get('room');

  const {
    data: authorizationData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['authorization', invitationCode, roomID],
    queryFn: () => validateInvitation(invitationCode, roomID),
  });

  const { mutate: joinRoomMutation, isPending: isJoiningRoom } = useMutation({
    mutationFn: () => joinRoom(roomID),
    onSuccess: (data) => {
      setIsSuccess(true);
      Cookie.set('rsCookie', data.participant.jwt);

      if (!isExternal) {
        navigate(`/room/${roomID}`, {
          state: { roomID: roomID },
          replace: true,
        });
      }

      toast({
        description: 'Successfully joined in! 🎉',
      });
    },
    onError: () => {
      setIsSuccess(false);
      setError('Failed to join room. Something went wrong..');
    },
  });

  const { isValid, hasExpired } = authorizationData || {
    isValid: false,
    hasExpired: false,
  };

  useEffect(() => {
    if (!isValid) {
      setIsSuccess(false);
      setError('Your invitation format is invalid. Please contact the host.');
    }

    if (hasExpired) {
      setIsSuccess(false);
      setError(
        'Your invitation has expired or does not exist. Please contact the host.'
      );
    }

    if (isError) {
      setIsSuccess(false);
      setError('An error occurred while validating your invitation.');
    }

    if (!hasExpired && isValid && !isError) {
      setError(null);
      setIsSuccess(true);
    }
  }, [isValid, hasExpired, isError]);

  const renderAlert = () => {
    if (isLoading) {
      return (
        <div className='flex flex-col items-center gap-8'>
          <p className='text-sm animate-pulse text-orange-400'>
            Validating your invitation..
          </p>
          <LoadingSpinner />
        </div>
      );
    }

    if (error || isError) {
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
        </div>
      );
    }
  };

  const handleJoin = async () => {
    joinRoomMutation();
    navigate(`/room/${roomID}`, { replace: true });
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
          {isSuccess && !isLoading && (
            <div className='flex flex-col items-center gap-12'>
              <Button
                variant='call'
                className='mt-12'
                onClick={() => handleJoin()}
              >
                <LogIn className='size-20 mr-8 text-white' />
                {isJoiningRoom ? 'Joining...' : 'Join Room'}
              </Button>
              <p className='text-xs'>
                By joining a room, you agree to our Terms of Service and Privacy
                Statement.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Authorization;