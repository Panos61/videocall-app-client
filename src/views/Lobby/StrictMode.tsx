import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

const StrictMode = () => {
  return (
    <div className='flex items-center self-center gap-8 p-8 mt-20 border border-slate-200 rounded-8'>
      <div className='flex items-center gap-4'>
        <Tooltip>
          <TooltipTrigger asChild>
            <InfoIcon size={16} className='text-purple-500' />
          </TooltipTrigger>
          <TooltipContent side='top'>
            Strict mode means <span className='font-bold'>only the host</span>{' '}
            can <span className='font-bold'>invite</span>,{' '}
            <span className='font-bold'>chat</span>, or{' '}
            <span className='font-bold'>share screen</span> by default. You can
            adjust these settings <span className='font-bold'>anytime</span>.
          </TooltipContent>
        </Tooltip>
        <span className='text-sm text-gray-600 font-medium whitespace-nowrap'>
          Strict mode🔒 
        </span>
      </div>
      <div className='flex items-center gap-4'>
        <Switch id='strict-mode' />
        <Label
          htmlFor='strict-mode'
          className='text-xs text-gray-600 font-medium whitespace-nowrap'
        >
          Disabled
        </Label>
      </div>
    </div>
  );
};

export default StrictMode;
