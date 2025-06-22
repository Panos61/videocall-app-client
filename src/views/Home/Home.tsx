import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Cookie from 'js-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, LogInIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { createRoom } from '@/api';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

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

  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();
      const { id, participants } = response;

      Cookie.set('rsCookie', participants.jwt);
      navigate(`/room/${id}`);

      toast({
        title: 'Created a room! 🎉',
        description: 'You can now join in. 🚀',
      });
    } catch (error) {
      console.error('err: ', error);
    }
  };

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

  return (
    <div className='flex flex-col gap-32 relative min-h-screen bg-gradient-to-br text-gray-900 px-4 py-12 items-center justify-center'>
      <header className='absolute top-40 left-[104px] flex items-center gap-12 text-gray-800'>
        <div className='flex items-center justify-center size-64 bg-white border-[2px] border-[#00dc5ce0] rounded-xl'>
          <div className='border border-[#635BFF] rounded-xl p-8 translate-x-8 translate-y-12'>
            <svg
              viewBox='0 0 24 24'
              className='size-48 text-[#635BFF] stroke-2'
              fill='none'
            >
              #00dc5ce0
              <path
                d='M4 4H20V14C20 15.1046 19.1046 16 18 16H9L4 21V4Z'
                fill='currentColor'
              />
            </svg>
          </div>
        </div>
        <h1 className='text-5xl'>
          <span className='font-mono'>Toku</span>
        </h1>
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
          </h1>
          <h1 className='text-4xl text-gray-500'>
            Create a room, share the link, and start talking. Private,
            encrypted, and zero setup.
          </h1>
          <p className='text-xl text-gray-600'>
            Host encrypted meetings with a single click. No sign-ups, no
            downloads — just secure real-time collaboration.
          </p>
          <div className='flex items-center gap-12'>
            <Button
              onClick={handleCreateRoom}
              className='px-24 text-white rounded-xl'
            >
              <PlusIcon className='mr-8 size-20' />
              Create Room
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
      {/* <div className='flex gap-12 md:flex justify-center'>
        <Card className='w-full max-w-md bg-white border border-gray-200 drop-shadow-md'>
          <CardContent className='p-24 text-gray-700'>
            <div className='flex items-center gap-3 mb-4'>
              <EyeOff className='size-24 text-orange-300' />
              <h2 className='text-xl font-semibold text-gray-800'>
                Private Video Rooms
              </h2>
            </div>
            <p className='text-sm'>
              Start high-quality video calls in one click. Invite anyone with a
              link. No setup, no hassle — everything stays encrypted and secure.
            </p>
          </CardContent>
        </Card>
        <Card className='w-full max-w-md bg-white border border-gray-200 drop-shadow-md'>
          <CardContent className='p-24 text-gray-700'>
            <div className='flex items-center gap-3 mb-4'>
              <VideoIcon className='size-24 text-green-500' />
              <h2 className='text-xl font-semibold text-gray-800'>
                Private Video Rooms
              </h2>
            </div>
            <p className='text-sm'>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
              quos. Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Quisquam, quos.
            </p>
          </CardContent>
        </Card>
        <Card className='w-full max-w-md bg-white border border-gray-200 drop-shadow-md'>
          <CardContent className='p-24 text-gray-700'>
            <div className='flex items-center gap-3 mb-4'>
              <MessageCircleIcon className='size-24 text-violet-500' />
              <h2 className='text-xl font-semibold text-gray-800'>
                Toku Video Call & Chat
              </h2>
            </div>
            <p className='text-sm'>
              Toku Video Call & Chat enables secure, high-quality video calls
              without complexity. Share the room link and collaborate with
              confidence. All sessions are encrypted and private.
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default Home;
