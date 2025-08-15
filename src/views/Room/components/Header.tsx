import { useEventsCtx } from '@/context';
import { RaisedHand } from './gestures';
import ShareScreenTab from './ShareScreenTab';

const Header = ({ isSharingScreen }: { isSharingScreen: boolean }) => {
  const {
    events: { raisedHand },
  } = useEventsCtx();

  const uniqueRaisedHandEvents = [
    ...new Set(raisedHand.map((event) => event.username)),
  ];

  return (
    <header className='flex items-center justify-between h-60 px-48 border-b border-zinc-800'>
      <div className='flex items-center gap-72'>
        <div className='text-lg text-white font-mono'>[name..]</div>
        <div className='flex items-center gap-8'>
          {uniqueRaisedHandEvents.map((event) => (
            <RaisedHand key={event} username={event} />
          ))}
        </div>
      </div>
      {isSharingScreen && <ShareScreenTab />}
      <div className='flex items-center gap-8'>
        <div className='text-xs text-gray-300'>00:00</div>
        <span className='text-gray-300'>-</span>
        <p className='text-xs text-white'>Call in progress</p>
        <div className='size-8 rounded-full bg-green-500 animate-pulse'></div>
      </div>
    </header>
  );
};

export default Header;
