/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { connectSSE } from '@/api/sse';
import { getInvitation } from '@/api';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export const InviteModal = () => {
  const { pathname } = useLocation();
  const [copiedText, copy] = useCopyToClipboard();

  const sseRef = useRef<EventSource | null>(null);
  const [invitation, setInvitation] = useState('');
  const [formattedInvitation, setFormattedInvitation] = useState('');
  const [disabled, setDisabled] = useState<boolean>(false);

  const roomID = pathname.split('/')[2];

  const formatInvitation = (invitation: string) => {
    const formattedInvitation = invitation.replace('http://localhost:5173', '');
    setFormattedInvitation(formattedInvitation);
  };

  useEffect(() => {
    const fetchInitialInvitation = async () => {
      try {
        const initialInvitation = await getInvitation(roomID);
        setInvitation(initialInvitation);
        formatInvitation(initialInvitation);
      } catch (error) {
        console.error('Error fetching initial invitation:', error);
      }
    };

    fetchInitialInvitation();

    if (!sseRef.current) {
      sseRef.current = connectSSE(roomID, (newInvitation: string) => {
        setInvitation((prev) => {
          if (prev !== newInvitation) {
            formatInvitation(newInvitation);
            return newInvitation;
          }
          return prev;
        });
      });
    }

    return () => {
      sseRef.current?.close();
      sseRef.current = null;
    };
  }, [roomID]);

  const renderTrigger = () => {
    const isCallPage = pathname.includes('/call');
    if (isCallPage) {
      return (
        <div className='flex items-center justify-center gap-8 mt-12 p-8 w-full rounded-md text-sm text-white bg-indigo-900 hover:bg-indigo-800 duration-300'>
          <UserPlus size={16} />
          Invite someone
        </div>
      );
    }

    return (
      <div className='flex items-center p-12 border rounded-full border-slate-200 bg-white hover:bg-slate-100 duration-300 ease-in-out cursor-pointer'>
        <UserPlus size={16} />
      </div>
    );
  };

  const handleCopy = (text: string) => () => {
    copy(text).then(() => {
      setDisabled(true);
      setTimeout(() => setDisabled(false), 2500);
    });
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger()}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Invitation 🔗</DialogTitle>
          <DialogDescription>
            Copy the invitation URL below and share it with a user that wants to
            participate in this call.
          </DialogDescription>
        </DialogHeader>
        <div className='flex gap-12 mt-8'>
          <Input id='invitation' value={formattedInvitation} disabled />
          <Button
            type='submit'
            variant='ghost'
            disabled={disabled}
            onClick={handleCopy(invitation)}
          >
            {copiedText && disabled ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
