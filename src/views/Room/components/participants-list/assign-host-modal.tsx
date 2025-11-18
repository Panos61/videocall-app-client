import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookie from 'js-cookie';
import { EllipsisVerticalIcon, HandshakeIcon, InfoIcon } from 'lucide-react';

import type { Participant } from '@/types';
import { assignHost, getMe } from '@/api/client';

import { Avatar } from '@/components/elements';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AssignHostModal = ({
  selectedParticipant,
}: {
  selectedParticipant: Participant;
}) => {
  const { id: roomID } = useParams();
  const jwt: string | undefined = Cookie.get('rsCookie');

  const [showNewDialog, setShowNewDialog] = useState(false);

  const { data: meData } = useQuery({
    queryKey: ['me', roomID, jwt],
    queryFn: () => getMe(roomID!, jwt!),
    enabled: !!roomID && !!jwt,
  });

  const currentHostID = meData?.id;

  const {
    mutate: assignHostMutation,
    isPending: isAssigningHost,
    isError,
  } = useMutation({
    mutationFn: ({
      currentHostID,
      participantID,
    }: {
      currentHostID: string;
      participantID: string;
    }) => assignHost(roomID!, currentHostID, participantID),
    onSuccess: () => {
      setShowNewDialog(false);
    },
    onError: (error) => {
      console.error('err: ', error);
    },
  });
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <EllipsisVerticalIcon className='size-12 text-gray-500 cursor-pointer hover:text-gray-700' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => setShowNewDialog(true)}>
              Assign as Host
              <HandshakeIcon className='size-16 text-blue-500' />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Assign as Host</DialogTitle>
            <div className='flex flex-col items-center gap-12 mb-16'>
              Are you sure you want to assign this participant as the host?
              <div className='flex items-center gap-8 w-full bg-gray-100 rounded-8 p-8'>
                <Avatar size='sm' src={selectedParticipant.avatar_src} />
                <span className='text-lg text-black'>
                  {selectedParticipant.username}
                </span>
              </div>
              <div className='flex items-center gap-4'>
                <InfoIcon size={44} className='text-blue-500' />
                <p className='text-xs text-black'>
                  Important: This action is irreversible. The selected
                  participant will become the new host. Host actions will be
                  performed by the new host.
                </p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <div className='flex flex-col gap-8'>
              <div className='flex items-center gap-8'>
                <DialogClose asChild>
                  <Button variant='outline'>Cancel</Button>
                </DialogClose>
                <Button
                  type='submit'
                  disabled={isAssigningHost}
                  onClick={() =>
                    assignHostMutation({
                      currentHostID: currentHostID!,
                      participantID: selectedParticipant.id,
                    })
                  }
                >
                  Assign as Host
                  <HandshakeIcon className='ml-4 size-16 text-blue-500' />
                </Button>
              </div>
              {isError && (
                <div className='text-xs text-red-500'>
                  Something went wrong. Try again.
                </div>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssignHostModal;
