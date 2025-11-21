import { useEffect, useRef } from 'react';
import { useCountdown } from 'usehooks-ts';
import { toast } from 'sonner';

type Props = {
  hostEventType: 'left' | 'updated';
};

const HostUpdateToast = ({ hostEventType }: Props) => {
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
      hostEventType === 'left'
        ? 'Previous Host has left the room, you are randomly promoted to host.'
        : 'Previous Host has been replaced by a new host.',
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
      toast.info(
        hostEventType === 'left'
          ? 'Previous Host has left the room, you are randomly promoted to host.'
          : 'Previous Host has been replaced by a new host.',
        {
          id: toastIdRef.current,
        }
      );
    }
  }, [count, hostEventType]);

  return null;
};

export default HostUpdateToast;
