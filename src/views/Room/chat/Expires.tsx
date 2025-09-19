import { Clock1Icon } from 'lucide-react';

const Expires = () => {
  return <div className='flex items-center gap-4'>
    <Clock1Icon size={14} className='text-gray-600' />
    <span className='text-xs text-gray-600'>58s</span>
  </div>;
};

export default Expires;