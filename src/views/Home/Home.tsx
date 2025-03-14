import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { createRoom } from '@/api';

import { LayoutDashboard, Server, Github, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

export const Home = () => {
  const navigate = useNavigate();

  const [displayInput, setDisplayInput] = useState<boolean>(false);
  const [trigerValidation, setTrigerValidation] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [isRedirectingSuccess, setIsRedirectingSuccess] =
    useState<boolean>(false);

  const { toast } = useToast();

  const {
    register,
    watch,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { invURL: '' } });

  const invLink = watch('invURL');


  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();
      
      const roomID = response.id;
      const { jwt } = response.participants;

      localStorage.setItem('jwt_token', jwt);
      navigate(`/room/${roomID}`);
      
      toast({
        title: 'Created a room! 🎉',
        description: 'You can now join in. 🚀',
      });
    } catch (error) {
      console.error('err: ', error);
    }
  };

  const renderInvalidInputWarning = () => {
    if (errors.invURL) {
      return (
        <span className='ml-4 text-xs text-red-500'>
          Invalid invitation format. Try Again.
        </span>
      );
    }
  };

  const onInputChange = () => {
    if (isValid) {
      setTrigerValidation(true);
    }
  };

  useEffect(() => {
    if (isValid && trigerValidation) {
      const codeMatch = invLink.match(/code=([^&]+)/);
      const roomMatch = invLink.match(/room=([^&]+)/);

      if (codeMatch && roomMatch) {
        const code = codeMatch[1];
        const room = roomMatch[1];

        setIsRedirecting(true);
        setTimeout(() => {
          window.open(`/room-invite?code=${code}&room=${room}`, '_blank');
          setIsRedirectingSuccess(true);
        }, 2000);
      }
      setIsRedirectingSuccess(false);
      setTrigerValidation(false);
    }
  }, [trigerValidation, isValid, invLink]);
  

  const cardCls = classNames(
    'w-auto p-12 drop-shadow-sm transition-all duration-700 ease-in-out overflow-hidden bg-white bg-opacity-90',
    {
      'h-[340px]': displayInput,
      'h-[246px]': !displayInput,
    }
  );

  const inputCls = classNames('transition-all duration-700 ease-in-out', {
    'opacity-100 translate-y-0': displayInput,
    'opacity-0 translate-y-[20px]': !displayInput,
  });

  const repoLinkCls =
    'flex items-center justify-center gap-8 w-[212px] p-8 border border-gray-300 rounded-12 hover:bg-gray-50 hover:text-blue-700 transition-all duration-500 ease-in-out';

  return (
    <div className='flex items-center justify-center h-screen bg-custom-bg bg-cover bg-fixed'>
      <Card className={cardCls}>
        <CardHeader>
          <CardTitle>
            <span className='text-2xl font-mono'>Rooms_</span>
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
                  <div className='flex flex-col gap-8 flex-wrap'>
                    <Input
                      className='mt-20 w-[392px]'
                      placeholder='Paste your invitation link 🔗'
                      {...register('invURL', {
                        pattern: {
                          value:
                            /^http:\/\/localhost:5173\/room-invite\?code=[\w-]+&room=[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
                          message: 'Invalid invitation link format',
                        },
                        onChange: onInputChange,
                      })}
                    />
                    {renderInvalidInputWarning()}
                    {!isRedirectingSuccess && (
                      <p className='ml-4 text-xs'>
                        {isRedirecting
                          ? 'Proceeding to validation...'
                          : 'You will be redirected to the invite validation page.'}
                      </p>
                    )}
                    {isRedirectingSuccess && (
                      <p className='mt-4 ml-4 text-xs text-green-600'>
                        Invitation format is valid! 🎉
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <Separator
              orientation='vertical'
              className='h-72 self-center mb-56'
            />
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
