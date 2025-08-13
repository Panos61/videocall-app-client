import { usePreferencesCtx } from '@/context';
import { ScreenShare, LayoutGrid } from 'lucide-react';

const ShareScreenTab = () => {
  const { setShareScreenView } = usePreferencesCtx();

  return (
    <div className='flex items-center gap-12'>
      <div
        className='flex items-center gap-8 px-12 py-8 outline outline-zinc-800 rounded-8 text-sm text-white bg-zinc-900 hover:bg-zinc-800 duration-300 ease-in-out cursor-pointer'
        onClick={() => setShareScreenView('participants')}
      >
        <span>Participants (10)</span>
        <LayoutGrid size={16} className='text-white' />
      </div>
      <div
        className='flex items-center gap-8 px-12 py-8 outline outline-zinc-800 rounded-8 text-sm text-white bg-green-700/20 hover:bg-green-600/25 duration-300 ease-in-out cursor-pointer'
        onClick={() => setShareScreenView('shared')}
      >
        <span>Panos's shared screen</span>
        <ScreenShare size={16} className='text-green-500' />
      </div>
    </div>
  );
};

export default ShareScreenTab;
