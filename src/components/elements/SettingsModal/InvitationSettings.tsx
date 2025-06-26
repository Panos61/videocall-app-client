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
  isHost: boolean;
  settings: Settings;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
}

export const InvitationSettings = ({ isHost, settings, form }: Props) => {
  const { invitation_expiry } = settings;
  console.log('invitation_expiry', invitation_expiry);

  const renderNonHostInfo = () => {
    return (
      <div className='flex items-center gap-12'>
        <p className='text-sm italic text-slate-600'>
          The invitation is being updated every{' '}
          <span className='underline'>{invitation_expiry}</span> minutes.
        </p>
      </div>
    );
  };

  const renderForm = () => {
    return (
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
    );
  };

  return (
    <div className='flex items-center gap-20'>
      {isHost ? (
        <>
          <span className='text-sm font-medium whitespace-nowrap'>
            Invitation expiry:{' '}
          </span>
          {renderForm()}
        </>
      ) : (
        renderNonHostInfo()
      )}
    </div>
  );
};
