import type { Participant } from '@/types';
import { Crown, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar } from '@/components/elements';

interface Props {
  participants: Participant[];
}

const ParticipantsModal = ({ participants }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className='text-sm font-light text-blue-600 hover:text-blue-700 duration-150 cursor-pointer'>
          View All
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[400px]'>
        <DialogHeader>
          <DialogTitle>
            <div className='flex items-center gap-4'>
              Participants <Users className='size-16' /> {participants.length}
            </div>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className='flex gap-24 mt-8'>
          <div className='flex flex-col gap-4 w-1/2'>
            <div className='text-xs font-medium text-gray-600'>IN CALL (5)</div>
            <div className='flex flex-col text-sm text-gray-500'>
              <div className='flex items-center'>
                <Crown size={12} className='text-yellow-600' />
                <div className='flex items-center gap-4'>
                  <Avatar />
                  <span>Panos</span>
                </div>
              </div>
              <div>Alex</div>
              <div>Alex</div>
              <div>Alex</div>
            </div>
          </div>
          <Separator orientation='vertical' />
          <div className='flex flex-col gap-4 text-left w-1/2'>
            <div className='text-xs text-left font-medium text-gray-600'>
              IN LOBBY (5)
            </div>
            <div className='flex flex-col text-sm text-gray-500'>
              <div>Alex</div>
              <div>Alex</div>
              <div>Alex</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantsModal;
