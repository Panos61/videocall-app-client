import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { InfoIcon } from 'lucide-react';

import { FormControl, FormItem, FormField } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormLabel } from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

import type { Settings } from '@/types';

const FormSchema = z.object({
  invitation_expiry: z.enum(['30', '90', '180']),
  invite_permission: z.boolean(),
});

interface Props {
  isHost: boolean;
  settings: Settings;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
}

export const InvitationSettings = ({ isHost, settings, form }: Props) => {
  const { invitation_expiry } = settings;

  const renderNonHostInfo = () => {
    return (
      <p className='text-sm italic text-slate-600'>
        The invitation is being updated every{' '}
        <span className='font-bold'>{invitation_expiry}</span> minutes.
      </p>
    );
  };

  const renderForm = () => {
    return (
      <div className='flex flex-col flex-1 gap-24'>
        <div className='flex items-center gap-12'>
          <div className='flex items-center gap-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={16} className='text-purple-500' />
              </TooltipTrigger>
              <TooltipContent side='right'>
                The current invitation will expire after the selected duration,
                rendering it invalid. A new invitation will be automatically
                generated to ensure continuous access.
              </TooltipContent>
            </Tooltip>
            <span className='text-sm font-medium whitespace-nowrap'>
              Invitation expiry:
            </span>
          </div>
          <FormField
            control={form.control}
            name='invitation_expiry'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='flex flex-col space-y-4'
                  >
                    <FormItem className='flex items-center space-x-12 space-y-0'>
                      <FormControl>
                        <RadioGroupItem value='30' />
                      </FormControl>
                      <FormLabel className='font-normal'>30 minutes</FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center space-x-12 space-y-0'>
                      <FormControl>
                        <RadioGroupItem value='90' />
                      </FormControl>
                      <FormLabel className='font-normal'>90 minutes</FormLabel>
                    </FormItem>
                    <FormItem className='flex items-center space-x-12 space-y-0'>
                      <FormControl>
                        <RadioGroupItem value='180' />
                      </FormControl>
                      <FormLabel className='font-normal'>3 hours</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Separator />
        <div className='flex items-center gap-12'>
          <div className='flex items-center gap-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon size={16} className='text-purple-500' />
              </TooltipTrigger>
              <TooltipContent side='right'>
                When enabled, users can invite other users to join the room.
              </TooltipContent>
            </Tooltip>
            <span className='text-sm font-medium'>Invite permission:</span>
          </div>
          <div className='mt-4'>
            <FormField
              control={form.control}
              name='invite_permission'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    );
  };

  return <>{isHost ? renderForm() : renderNonHostInfo()}</>;
};
