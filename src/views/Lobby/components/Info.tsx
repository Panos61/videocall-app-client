import { formatDistanceToNow } from 'date-fns';
import { Crown, PhoneCall } from 'lucide-react';

interface Props {
  isHost: boolean | undefined;
  host: string;
  createdAt: string;
  isCallActive: boolean;
  callStartedAt: string;
}

const Info = ({
  isHost,
  host,
  createdAt,
  isCallActive,
  callStartedAt,
}: Props) => {
  if (isHost) {
    return (
      <div className='flex items-center justify-center gap-4 mt-24'>
        <Crown size={12} className='text-yellow-600' />
        <span className='text-xs text-gray-600'>
          You are the host of this call.
        </span>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center gap-4 mt-24'>
      <div className='flex items-center justify-center gap-4'>
        <Crown size={12} className='text-yellow-600' />
        <span className='text-xs text-gray-600'>
          {host} created this room, {formatDistanceToNow(new Date(createdAt))}{' '}
          ago.
        </span>
      </div>
      {isCallActive && (
        <div className='flex items-center justify-center gap-4'>
          <PhoneCall size={12} className='text-green-600' />
          <span className='text-xs text-gray-600'>
            Call started {formatDistanceToNow(new Date(callStartedAt))} ago.
          </span>
        </div>
      )}
    </div>
  );
};

export default Info;
