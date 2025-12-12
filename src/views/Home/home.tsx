import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMediaQuery } from 'usehooks-ts';
import Cookie from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, LogInIcon } from 'lucide-react';

import { createRoom } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

import LOGO from '@/assets/catgpt.png';

const Home = () => {
  const navigate = useNavigate();
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange', defaultValues: { invitationCode: '' } });

  const invitation = watch('invitationCode');

  const [invitationCode, setInvitationCode] = useState<string | undefined>(
    undefined
  );
  const [roomID, setRoomID] = useState<string | undefined>(undefined);

  const { mutate: createRoomMutation, isPending: isCreatingRoom } = useMutation(
    {
      mutationFn: () => createRoom(),
      onSuccess: (data) => {
        const { id, participants } = data;
        Cookie.set('rsCookie', participants.jwt);
        navigate(`/room/${id}`);

        toast({
          title: 'Created a room! 🎉',
          description: 'You can now join in. 🚀',
        });
      },
      onError: (error) => {
        console.error('err: ', error);
      },
    }
  );

  const renderInvalidInputWarning = () => {
    if (errors.invitationCode) {
      return (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className='ml-4 text-xs text-red-500 block'
        >
          Invalid invitation format. Try Again.
        </motion.span>
      );
    }
    return null;
  };

  const isInvitationValid: boolean = isValid && invitation !== '';

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fullUrl = e.target.value;

    // Extract code and room id from URL if it's a full invitation URL
    const codeMatch = fullUrl.match(/code=([^&]+)/);
    const roomMatch = fullUrl.match(/room=([^&]+)/);

    if (codeMatch && roomMatch) {
      const extractedCode = codeMatch[1];
      const extractedRoomId = roomMatch[1];

      setValue('invitationCode', extractedCode);
      setInvitationCode(extractedCode);
      setRoomID(extractedRoomId);
    }
  };

  const isLarge = useMediaQuery('(max-width: 1500px)');

  return (
    <div className='flex flex-col gap-32 relative min-h-screen bg-gradient-to-br text-gray-900 px-4 py-12 items-center justify-center'>
      <header className='absolute top-40 left-[104px] flex flex-col items-center text-gray-800'>
        <p className='text-4xl font-bold font-mono'>Video Calls & Chat</p>
        <img src={LOGO} alt='logo' width={isLarge ? 124 : 300} />
      </header>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='w-full flex gap-40 justify-center items-center'
      >
        <div className='flex flex-col gap-12 w-[780px] text-left space-y-8 transition-all duration-500 ease-in-out'>
          <h1 className='text-5xl font-extrabold leading-tight text-gray-900'>
            Spin Up a Room. <span className='text-green-600'>🛸</span>
            <br />
            Start Talking. <span className='text-green-600'>🚀</span>
            <br />
            Stay Anonymous. <span className='text-green-600'>👻</span>
          </h1>
          <h1 className='text-4xl text-gray-500'>
            Create a room, share the link, and start talking. Private,
            encrypted, and zero setup.
          </h1>
          <p className='text-xl text-gray-600'>
            A web-based video chat platform that allows you to host encrypted
            meetings with a single click.
          </p>
          <p className='text-xl text-gray-600'>
            No sign-ups, no downloads — just being fast and anonymous.
          </p>
          <div className='flex items-center gap-12'>
            <Button
              onClick={() => createRoomMutation()}
              disabled={isCreatingRoom}
              className='px-24 text-white rounded-xl'
            >
              <PlusIcon className='mr-8 size-20' />
              {isCreatingRoom ? 'Creating room...' : 'Create Room'}
            </Button>
            <Separator orientation='vertical' className='h-28 bg-gray-300' />
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-8'>
                <Input
                  size={24}
                  placeholder='Enter your invitation 🔗'
                  value={invitation}
                  {...register('invitationCode', {
                    pattern: {
                      value: /^[\w-]{16}$/,
                      message: 'Code must be 16 characters long',
                    },
                    onChange: onInputChange,
                  })}
                />
                <Button
                  variant={'call'}
                  disabled={!isInvitationValid}
                  onClick={() => {
                    window.open(
                      `/room-invite?code=${invitationCode}&room=${roomID}&external=false`,
                      '_blank'
                    );
                  }}
                  className='w-full px-24'
                >
                  <LogInIcon className='mr-8 size-20' />
                  Join Room
                </Button>
              </div>
            </div>
            <AnimatePresence>{renderInvalidInputWarning()}</AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
