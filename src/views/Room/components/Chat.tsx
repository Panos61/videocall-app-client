import { SendHorizonalIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Sidebar from '../Sidebar';
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onClose: () => void;
}

const Chat = ({ open, onClose }: Props) => {
  return (
    <Sidebar title='Conversation' open={open} onClose={onClose}>
      <div className='h-[calc(100%-80px)] flex flex-col'>
        <div className='flex-1 flex flex-col justify-between items-center gap-4 w-full py-8 px-12 bg-white rounded-16 overflow-y-auto'>
          <div className='flex flex-col items-center gap-4 w-full '>
            <div className='flex gap-8 mt-4'>
              <p className='self-center text-xs text-slate-800'>
                Let everyone send messages
              </p>
              <Switch />
            </div>
            <Separator className='mt-4'/>
          </div>
          <div className='flex gap-4 w-full'>
            <input
              placeholder='Send a message to everyone'
              className='flex-1 py-12 px-4 rounded-12 text-sm font-light indent-16 bg-gray-200 outline-none duration-300 ease-in-out hover:bg-gray-100 focus:outline-none focus:bg-gray-100'
            />
            <button className='p-12 rounded-8 duration-200 hover:bg-green-200'>
              <SendHorizonalIcon size={20} className='text-green-600' />
            </button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Chat;
