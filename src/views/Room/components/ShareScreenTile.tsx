import { ScreenShare } from 'lucide-react';

const ShareScreenTile = () => {
  return (
    <div className='relative flex items-center justify-center size-full rounded-8 overflow-hidden bg-zinc-900 text-gr outline outline-green-500/45 transition-all duration-1000 ease-out'>
      <div className='absolute bottom-4 right-12 px-12 py-4 rounded-md text-sm text-white bg-black bg-opacity-45 z-50 flex items-center gap-8'>
        <span>Panos's screen</span>
        <ScreenShare size={16} className='text-green-500' />
      </div>
    </div>
  );
};

export default ShareScreenTile;
