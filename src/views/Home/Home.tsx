import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { useHandleCreateRoom, useHandleJoinRoom } from '@/hooks';

import { LayoutDashboard, Server, Github, UserPlus } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';

export const Home = () => {
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [trigerValidation, setTrigerValidation] = useState<boolean>(false);

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { invLink: '' } });

  const invLink = watch('invLink');

  const { handleCreateRoom } = useHandleCreateRoom();
  const { handleJoinRoom } = useHandleJoinRoom();

  const renderInvalidInputWarning = () => {
    if (errors.invLink) {
      return (
        <Alert variant='destructive' className='p-8 mt-8'>
          <div className='flex items-center gap-8'>
            <AlertCircle className='size-16' />
            <AlertDescription className='text-xs'>
              {errors.invLink.message || 'Invalid invitation key. Try Again.'}
            </AlertDescription>
          </div>
        </Alert>
      );
    }
  };

  const onInputChange = () => {
    setTrigerValidation(true);
  };

  useEffect(() => {
    if (trigerValidation && isValid) {
      setTimeout(() => {
        handleJoinRoom(invLink);
      }, 1000);
    }
  }, [trigerValidation, isValid, invLink, handleJoinRoom]);

  const cardCls = classNames(
    'w-auto p-12 drop-shadow transition-all duration-700 ease-in-out overflow-hidden bg-white bg-opacity-90',
    {
      'h-[300px]': displayInput,
      'h-[246px]': !displayInput,
    }
  );

  const inputCls = classNames('transition-all duration-700 ease-in-out', {
    'opacity-100 translate-y-0': displayInput,
    'opacity-0 translate-y-[20px]': !displayInput,
  });

  const repoLinkCls = classNames(
    'flex items-center justify-center gap-8 p-8 w-[212px] border border-gray-300 rounded-12 hover:bg-gray-50 hover:text-blue-700 transition-all duration-500 ease-in-out'
  );

  return (
    <div className='flex items-center justify-center h-screen bg-custom-bg bg-cover bg-fixed'>
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle>
            <h1 className='text-2xl font-mono'>Rooms_</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-12'>
            <div className='flex flex-col gap-8 w-[240px]'>
              <p className='text-xs text-slate-500'>
                Start a call by creating a room.
              </p>
              <Button className='w-full' onClick={() => handleCreateRoom()}>
                Create Room
              </Button>
              <Separator className='w-full' />
              <div
                className='flex items-center gap-4 mt-16 hover:text-green-900 duration-300 cursor-pointer underline'
                onClick={() => setDisplayInput(!displayInput)}
              >
                <p className='text-xs cursor-pointer'>
                  Use your invitation link to join a room.
                </p>
                <UserPlus size={16} />
              </div>
              <div className={inputCls}>
                {displayInput && (
                  <Input
                    className='mt-24 w-[392px]'
                    placeholder='Paste your invitation link 🔗'
                    {...register('invLink', {
                      required: 'Invitation key is required.',
                      minLength: {
                        value: 16,
                        message: 'Key must be 16 characters.',
                      },
                      maxLength: {
                        value: 16,
                        message: 'Key must be 16 characters.',
                      },
                      onChange: onInputChange,
                    })}
                  />
                )}
                {renderInvalidInputWarning()}
              </div>
            </div>
            <Separator orientation='vertical' className='h-72 self-center' />
            <div className='ml-8'>
              <div className='flex gap-4'>
                <p className='ml-4 mb-8 text-xs text-slate-500'>
                  Github repositories.
                </p>
                <Github size={16} />
              </div>
              <div className='flex flex-col gap-8'>
                <a
                  href='https://github.com/Panos61/videocall-app-client'
                  target='_blank'
                >
                  <div className={repoLinkCls}>
                    <div className='flex items-center gap-4'>
                      <span className='text-md'>Client</span>
                      <LayoutDashboard size={16} />
                    </div>
                  </div>
                </a>
                <a
                  href='https://github.com/Panos61/videocall-app-server'
                  target='_blank'
                >
                  <div className={repoLinkCls}>
                    <div className='flex items-center gap-4'>
                      <span className='text-md'>Server</span>
                      <Server size={16} />
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
