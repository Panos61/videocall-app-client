import { formatDistanceToNow } from 'date-fns';
import { Crown } from 'lucide-react';

interface Props {
  isHost: boolean | undefined;
  host: string;
  createdAt: string;
}

const Info = ({ isHost, host, createdAt }: Props) => {
  if (!isHost) {
    return (
      <div className='flex items-center justify-center gap-4 mt-28'>
        <Crown size={12} className='text-yellow-600' />
        <span className='text-xs text-gray-600'>
          You are the host of this call.
        </span>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center gap-4 mt-28'>
      <Crown size={12} className='text-yellow-600' />
      <span className='text-xs text-gray-600'>
        {host} created this room, {formatDistanceToNow(new Date(createdAt))} ago.
      </span>
    </div>
  );
};

export default Info;
