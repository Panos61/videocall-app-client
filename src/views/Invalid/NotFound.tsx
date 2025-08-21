import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col justify-center items-center gap-24'>
      <div className='flex flex-col gap-12 mt-[160px]'>
        <h1 className='max-w-[580px] text-center text-2xl font-mono font-medium'>
          Whoops..404 This page cannot be found.{' '}
        </h1>
        <p className='max-w-[580px] text-center text-md'>
          The page you are looking for does not exist.
        </p>
      </div>
      <Button onClick={() => navigate('/')}>Return to home screen</Button>
    </div>
  );
};

export default NotFound;
