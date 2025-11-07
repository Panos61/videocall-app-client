import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useCountdown } from 'usehooks-ts';

interface HostHandoverToastProps {
  onReject?: () => void;
  onAccept?: () => void;
  countdown?: number;
}

const HostHandoverToast = ({
  onReject,
  onAccept,
  countdown = 60,
}: HostHandoverToastProps) => {
  const [count, { startCountdown }] = useCountdown({
    countStart: countdown,
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
      onAccept?.();
    }
  }, [count, onAccept]);

  // Create initial toast
  useEffect(() => {
    toastIdRef.current = toast.warning(
      'Old Host has left the room, you are randomly promoted to host.',
      {
        description: `In ${count} seconds you will be automatically promoted to host. Reject to continue as a participant.`,
        action: {
          label: 'Reject',
          onClick: () => {
            onReject?.();
            if (toastIdRef.current || count === 0) {
              toast.dismiss(toastIdRef.current || undefined);
            }
          },
        },
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
        'Old Host has left the room, you are randomly promoted to host.',
        {
          id: toastIdRef.current,
          description: `In ${count} seconds you will be automatically promoted to host. Reject to continue as a participant.`,
          action: {
            label: 'Reject',
            onClick: () => {
              onReject?.();
              if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
              }
            },
          },
          duration: Infinity,
        }
      );
    }
  }, [count, onReject]);

  return null;
};

export default HostHandoverToast;
