import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

export const Permissions = () => {
  const cardCls = 'flex flex-col gap-12 border border-slate-200 rounded-8 p-12';

  return (
    <div className='flex flex-col gap-8'>
      <div className={cardCls}>
        <div className='flex items-center gap-4'>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon size={16} className='text-purple-500' />
            </TooltipTrigger>
            <TooltipContent side='left'>
              When enabled, everyone in the room can send messages.
            </TooltipContent>
          </Tooltip>
          <span className='text-sm font-medium'>
            Let everyone send messages
          </span>
        </div>
      </div>
      <div className={cardCls}>
        <div className='flex items-center gap-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={16} className='text-purple-500' />
              </TooltipTrigger>
              <TooltipContent side='left'>
                When enabled, all members can share their screen.
            </TooltipContent>
          </Tooltip>
          <span className='text-sm font-medium'>
            Allow members to share their screen
          </span>
        </div>
      </div>
    </div>
  );
};
