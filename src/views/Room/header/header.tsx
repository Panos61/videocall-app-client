import { useUserEventsCtx } from '@/context';
import { RaisedHand } from '../components/gestures';
import ShareScreenTab from './sharescreen-tab';
import Timer from './timer';

interface Props {
  isSharingScreen: boolean;
  participantsCount: number;
}

const Header = ({ isSharingScreen, participantsCount }: Props) => {
  const {
    events: { raisedHandEvents },
  } = useUserEventsCtx();

  const uniqueRaisedHandEvents = [
    ...new Set(raisedHandEvents.map((event) => event.username)),
  ];

  return (
    <header className='flex items-center justify-between h-52 px-48 border-b border-zinc-800'>
      <div className='flex items-center gap-72'>
        <div className='text-lg text-white font-mono'>[placeholder...]</div>
        <div className='flex items-center gap-8'>
          {uniqueRaisedHandEvents.map((event) => (
            <RaisedHand key={event} username={event} />
          ))}
        </div>
      </div>
      {isSharingScreen && (
        <ShareScreenTab participantsCount={participantsCount} />
      )}
      <Timer />
    </header>
  );
};

export default Header;
