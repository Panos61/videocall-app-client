import { FormControl, FormItem, FormField } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormLabel } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import type { Settings } from '@/types';

const FormSchema = z.object({
  invitation_expiry: z.enum(['30', '90', '180']),
  invite_permission: z.boolean(),
});

interface Props {
  isHost: boolean | undefined;
  settings: Settings;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
}

export const InvitationSettings = ({ isHost, settings, form }: Props) => {
  const { invitation_expiry } = settings;
  console.log('invitation_expiry', invitation_expiry);

  if (isHost) {
    return (
      <div className='flex flex-col gap-12 mt-12'>
        <p className='text-sm'>Settings are locked by the host.</p>
        <p className='text-sm italic text-slate-600'>
          The invitation is being updated every{' '}
          <span className='underline'>{invitation_expiry}</span> minutes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex gap-24 items-center mt-16'>
        <div className='flex flex-col w-[120px]'>
          <span className='text-sm font-medium'>Invitation expiry: </span>
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
    </div>
  );
};
