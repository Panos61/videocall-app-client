import { useState } from 'react';
import classNames from 'classnames';
import {
  LockIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  EllipsisVerticalIcon,
  HandshakeIcon,
  Crown,
  InfoIcon,
} from 'lucide-react';

import { useSystemEventsCtx } from '@/context/system-events';
import type { Participant } from '@/types';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, InviteModal } from '@/components/elements';
import Sidebar from '../sidebar';

interface Props {
  open: boolean;
  participants: Participant[];
  invitePermission: boolean;
  isHost: boolean;
  sessionID: string;
  mediaState: { audio: boolean; video: boolean };
  remoteMediaStates: {
    [sessionID: string]: { audio: boolean; video: boolean };
  };
  isActiveSpeaker: boolean;
  onClose: () => void;
}

const Participants = ({
  open,
  participants,
  invitePermission,
  isHost,
  mediaState,
  remoteMediaStates,
  sessionID,
  isActiveSpeaker,
  onClose,
}: Props) => {
  const { sendSystemEvent } = useSystemEventsCtx();

  const getMediaState = (remoteSession: string, participant: Participant) => {
    const isLocal = sessionID === remoteSession;
    if (isLocal) {
      return mediaState;
    }

    if (!remoteSession || !participant) return { audio: false, video: false };

    return {
      audio: remoteMediaStates[remoteSession]?.audio ?? false,
      video: remoteMediaStates[remoteSession]?.video ?? false,
    };
  };

  const getCls = (participant: Participant, isActiveSpeaker: boolean) =>
    classNames(
      'flex items-center gap-8 py-4 px-8 rounded-12 cursor-default duration-500',
      {
        'bg-orange-200/75': participant.isHost && !isActiveSpeaker,
        'hover:bg-orange-300': participant.isHost,
        'bg-green-200/75': isActiveSpeaker,
      }
    );

  const [showNewDialog, setShowNewDialog] = useState(false);

  const renderDropdownMenu = (selectedParticipant: Participant) => {
    return (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <EllipsisVerticalIcon className='size-12 text-gray-500 cursor-pointer hover:text-gray-700' />
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setShowNewDialog(true)}>
                Handover Host
                <HandshakeIcon className='size-16 text-blue-500' />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Handover Host</DialogTitle>
              <DialogDescription className='flex flex-col items-center gap-12 mb-16'>
                Are you sure you want to handover the host to this participant?
                <div className='flex items-center gap-4'>
                  <InfoIcon size={44} className='text-blue-500'/>
                  <p className='text-xs text-black'>
                    Important: This action is irreversible. The selected participant will become the new host. Host actions will be performed by the new host.
                  </p>
                </div>
                <div className='flex items-center gap-8 w-full bg-gray-100 rounded-8 p-8'>
                  <Avatar size='sm' src={selectedParticipant.avatar_src} />
                  <p className='text-lg text-black'>
                    {selectedParticipant.username}
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button
                type='submit'
                onClick={() =>
                  sendSystemEvent({
                    type: 'host.handover',
                    payload: {
                      new_host_id: selectedParticipant.id,
                    },
                  })
                }
              >
                Handover
                <HandshakeIcon className='size-16 text-blue-500 ml-4' />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <Sidebar title='Participants' open={open} onClose={onClose}>
      <>
        {(invitePermission || isHost) && <InviteModal />}
        {!invitePermission && !isHost && (
          <div className='ml-16 w-fit outline outline-gray-700 rounded-8 p-8 flex items-center gap-8'>
            <LockIcon className='size-12 text-orange-400' />
            <span className='text-xs text-muted italic'>
              Only host can invite participants.
            </span>
          </div>
        )}
        <p className='p-16 text-xs text-white font-bold'>
          IN MEETING ({participants.length})
        </p>
        <Separator className='mb-12 bg-gray-700 outline' />
        <div className='flex flex-col gap-4 py-8 px-12 mx-4 bg-white rounded-16'>
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={getCls(participant, isActiveSpeaker)}
            >
              <Avatar size='sm' src={participant.avatar_src} />
              <div className='flex items-center gap-4'>
                {participant.isHost && (
                  <Crown size={12} className='text-yellow-600' />
                )}
                <p className='text-sm text-black break-all'>
                  {participant.username}
                </p>
                {participant.isHost && (
                  <span className='text-xs text-black font-bold'>
                    {participant.isHost && '(Host)'}
                  </span>
                )}
              </div>
              <div className='flex items-center gap-8 ml-auto'>
                {getMediaState(participant.session_id, participant).audio ? (
                  <MicIcon color='#000000' className='size-12' />
                ) : (
                  <MicOffIcon color='#dc2626' className='size-12' />
                )}
                {getMediaState(participant.session_id, participant).video ? (
                  <VideoIcon color='#000000' className='size-12' />
                ) : (
                  <VideoOffIcon color='#dc2626' className='size-12' />
                )}
                {isHost &&
                  sessionID !== participant.session_id &&
                  renderDropdownMenu(participant)}
              </div>
            </div>
          ))}
        </div>
      </>
    </Sidebar>
  );
};

export default Participants;
