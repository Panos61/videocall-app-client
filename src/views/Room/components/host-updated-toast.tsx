import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useCountdown } from 'usehooks-ts';

const HostUpdatedToast = () => {
  const [count, { startCountdown }] = useCountdown({
    countStart: 5,
  });
  const toastIdRef = useRef<string | number | null>(null);

  // Start countdown when component mounts
  useEffect(() => {
    startCountdown();
  }, [startCountdown]);

  // Handle countdown completion
  useEffect(() => {
    if (count === 0) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    }
  }, [count]);

  // Create initial toast
  useEffect(() => {
    toastIdRef.current = toast.info(
      'New Host has been randomly promoted to host.',
      {
        duration: Infinity,
      }
    );

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (toastIdRef.current && count > 0) {
      toast.warning(
        'New Host has been randomly promoted to host.',
        {
          id: toastIdRef.current,
        }
      );
    }
  }, [count]);

  return null;
};

export default HostUpdatedToast;
