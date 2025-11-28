import { SignalIcon } from 'lucide-react';


const ConnectionStatus = () => {
  return (
    <div className='flex items-center gap-8'>
      <SignalIcon size={18} className='text-green-500 stroke-3' />
      <p className='text-xs text-white'>Connection</p>
    </div>
  );
};

export default ConnectionStatus;