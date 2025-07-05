import { Crown } from 'lucide-react';

interface Props {
  isHost: boolean | undefined;
}

const Info = ({ isHost }: Props) => {
  if (isHost) {
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
        Panos created this room, 3 minutes ago.
      </span>
    </div>
  );
};

export default Info;
