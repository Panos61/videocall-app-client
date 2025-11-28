import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useSystemEventsCtx } from '@/context';

export const RoomKilledModal = () => {
  const { latestRoomKilled } = useSystemEventsCtx();

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (latestRoomKilled) {
      setOpen(true);
    }
  }, [latestRoomKilled]);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Call has ended by host 🔴</AlertDialogTitle>
          <AlertDialogDescription>
            The host has killed the room. You have been automatically removed
            from the room.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => navigate('/', { replace: true })}>
            Return to home
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
