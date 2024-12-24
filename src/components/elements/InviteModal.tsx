/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useCopyToClipboard } from 'usehooks-ts';
import { useInvitationKey } from '@/hooks';

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
  const [disabled, setDisabled] = useState<boolean>(false);

  const roomID = pathname.split('/')[2];
  const invKey = useInvitationKey(roomID);

  const renderTrigger = () => {
    const isCallPage = pathname.includes('/call');
    if (isCallPage) {
      return (
        <div className='flex items-center justify-center gap-8 mt-12 p-8 w-full rounded-md text-sm text-white bg-slate-900 hover:bg-slate-800 duration-150'>
          <UserPlus size={16} />
          Invite someone
        </div>
      );
    }

    return (
      <div className='flex items-center py-8 px-12 border rounded-sm border-gray-200 hover:bg-gray-100 duration-200'>
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
          <DialogTitle>Invitation key 🔑</DialogTitle>
          <DialogDescription>
            Copy the invitation key below and share it with a user that wants to
            participate in this call.
          </DialogDescription>
        </DialogHeader>
        <div className='flex gap-12 mt-8'>
          <Input id='name' value={invKey} disabled />
          <Button
            type='submit'
            variant='ghost'
            disabled={disabled}
            onClick={handleCopy(invKey)}
          >
            {copiedText && disabled ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
