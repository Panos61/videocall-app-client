/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';

import { getInvitationCode } from '@/api';
import { connectSSE } from '@/api/sse';

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

  const [formattedInvitation, setFormattedInvitation] = useState('');
  const [invitationURL, setInvitationURL] = useState('');
  const [disabled, setDisabled] = useState<boolean>(false);

  const roomID = pathname.split('/')[2];

  const { data: invitationCode } = useQuery({
    queryKey: ['invitationCode', roomID],
    queryFn: () => getInvitationCode(roomID),
  });

  const buildInvitation = (invitation: string | undefined, roomID: string) => {
    return `http://localhost:3000/room-invite?code=${invitation}&room=${roomID}`;
  };

  useEffect(() => {
    if (invitationCode) {
      const invitationURL = buildInvitation(invitationCode, roomID);
      setInvitationURL(invitationURL);

      const formattedInvitation = invitationURL.replace(
        'http://localhost:3000',
        ''
      );
      setFormattedInvitation(formattedInvitation);
    }
  }, [invitationCode]);

  useEffect(() => {
    if (!sseRef.current) {
      sseRef.current = connectSSE(roomID, (newCode: string) => {
        setInvitationURL((prev) => {
          if (prev !== newCode) {
            const newInvitationURL = buildInvitation(newCode, roomID);
            const formattedInvitation = newInvitationURL.replace(
              'http://localhost:3000',
              ''
            );
            setFormattedInvitation(formattedInvitation);

            return newInvitationURL;
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
        <div className='flex items-center justify-center gap-8 mt-12 p-8 w-full rounded-md text-sm text-white bg-violet-900 hover:bg-violet-800 duration-300'>
          <UserPlus size={16} />
          Invite someone
        </div>
      );
    }

    return (
      <div className='flex items-center p-12 border rounded-full border-gray-200 bg-gray-100 hover:bg-gray-200 hover:scale-105 duration-300 ease-in-out cursor-pointer'>
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
            onClick={handleCopy(invitationURL)}
          >
            {copiedText && disabled ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
