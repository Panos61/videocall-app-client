import { useEffect, useRef, useState } from 'react';
import { HandIcon } from 'lucide-react';

interface Props {
  username: string;
}

const RaisedHand = ({ username }: Props) => {
  const duration = useRef<number>(10000);
  const [animation, setAnimation] = useState<boolean>(true);
  
  useEffect(() => {
    setTimeout(() => {
      duration.current = 0;
      setAnimation(false);
    }, duration.current);
  }, []);

  if (!animation) return null;
  
  return (
    <div className='flex items-center justify-center gap-8 px-8 py-4 w-full border border-zinc-500 rounded-8 text-white hover:bg-zinc-500/20 duration-300 animate-circle-entrance'>
      <span className='text-sm'>{username}</span>
      <HandIcon size={20} className='text-yellow-500' />
    </div>
  );
};

export default RaisedHand;
