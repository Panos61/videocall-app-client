import { useForm } from 'react-hook-form';
import { useHandleCreateRoom, useHandleJoinRoom } from '@/hooks';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export const Home = () => {
  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { invKey: '' } });

  const invKey = watch('invKey');

  const { handleCreateRoom } = useHandleCreateRoom();
  const { handleJoinRoom } = useHandleJoinRoom();

  const renderInvalidInputWarning = () => {
    if (errors.invKey) {
      return (
        <Alert variant='destructive' className='p-8 mt-8'>
          <div className='flex items-center gap-8'>
            <AlertCircle className='size-16' />
            <AlertDescription className='text-xs'>
              {errors.invKey.message || 'Invalid invitation key. Try Again.'}
            </AlertDescription>
          </div>
        </Alert>
      );
    }
  };

  return (
    <div className='flex items-center justify-center h-screen'>
      <Card className='w-[450px] drop-shadow'>
        <CardHeader>
          <CardTitle>Create or join a room.</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col'>
          <div className='flex flex-col gap-8'>
            <p className='text-sm text-slate-500'>
              Start a call by creating a room.
            </p>
            <Button className='w-full' onClick={() => handleCreateRoom()}>
              Create Room
            </Button>
          </div>
          <Separator className='my-24' />
          <div className='flex flex-col gap-8'>
            <p className='text-sm text-slate-500'>
              Or join a room by inserting the invitation key.
            </p>
            <Input
              placeholder='Enter invitation key'
              {...register('invKey', {
                required: 'Invitation key is required.',
                minLength: { value: 16, message: 'Key must be 16 characters.' },
                maxLength: { value: 16, message: 'Key must be 16 characters.' },
              })}
            />
            {renderInvalidInputWarning()}
            <Button
              variant='outline'
              disabled={!isValid}
              onClick={() => handleJoinRoom(invKey)}
              className='mt-12'
            >
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
