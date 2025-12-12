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
      <div className='flex items-center gap-8 ml-72'>
        {uniqueRaisedHandEvents.map((event) => (
          <RaisedHand key={event} username={event} />
        ))}
      </div>
      {isSharingScreen && (
        <ShareScreenTab participantsCount={participantsCount} />
      )}
      <Timer />
    </header>
  );
};

export default Header;
