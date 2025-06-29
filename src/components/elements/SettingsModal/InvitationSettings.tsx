import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoIcon } from 'lucide-react';

import type { Settings } from '@/types';
import { updateSettings } from '@/api';

import { Form, FormControl, FormItem, FormField } from '@/components/ui/form';
import { FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';

interface Props {
  roomID: string;
  isHost: boolean;
  settings: Settings;
}

type InvitationExpiry = '30' | '90' | '180';

export const InvitationSettings = ({ roomID, isHost, settings }: Props) => {
  const { invitation_expiry, invite_permission } = settings;

  const FormSchema = z.object({
    invitation_expiry: z.enum(['30', '90', '180']),
    invite_permission: z.boolean(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      invitation_expiry: invitation_expiry || '30',
      invite_permission: invite_permission || false,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Settings) => {
      return updateSettings(roomID, updatedSettings);
    },
    onSuccess: () => {
      console.log('Settings updated successfully');
    },
  });

  const handleSettingChange = (
    field: keyof Settings,
    value: Settings[keyof Settings]
  ) => {
    form.setValue(field, value);
    const allFormValues = form.getValues();

    updateSettingsMutation.mutate(allFormValues);
  };

  const renderNonHostInfo = () => {
    return (
      <div className='flex flex-col gap-8'>
        <p className='text-sm italic text-slate-600'>
          The invitation is being updated every{' '}
          <span className='font-bold'>{invitation_expiry}</span> minutes.
        </p>
        <p className='text-sm italic text-slate-600'>
          Invite permission: {invite_permission ? 'Enabled' : 'Disabled'}
        </p>
      </div>
    );
  };

  const cardCls = 'flex flex-col gap-12 border border-slate-200 rounded-8 p-12';

  const renderForm = () => {
    return (
      <Form {...form}>
        <div className='flex flex-col flex-1 gap-8'>
          <div className={cardCls}>
            <div className='flex items-center gap-4'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon size={16} className='text-purple-500' />
                </TooltipTrigger>
                <TooltipContent side='left'>
                  The current invitation will expire after the selected
                  duration, rendering it invalid. A new invitation will be
                  automatically generated to ensure continuous access.
                </TooltipContent>
              </Tooltip>
              <span className='text-sm font-medium whitespace-nowrap'>
                Invitation expiry:
              </span>
            </div>
            <div className='ml-20'>
              <FormField
                control={form.control}
                name='invitation_expiry'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: InvitationExpiry) => {
                          handleSettingChange('invitation_expiry', value);
                        }}
                        defaultValue={field.value}
                        className='flex flex-col space-y-4'
                      >
                        <FormItem className='flex items-center space-x-12 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='30' />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            30 minutes
                          </FormLabel>
                        </FormItem>
                        <FormItem className='flex items-center space-x-12 space-y-0'>
                          <FormControl>
                            <RadioGroupItem value='90' />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            90 minutes
                          </FormLabel>
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
          <div className={cardCls}>
            <div className='flex items-center gap-4'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon size={16} className='text-purple-500' />
                </TooltipTrigger>
                <TooltipContent side='left'>
                  When enabled, users aside from the host can invite other users
                  to join the room.
                </TooltipContent>
              </Tooltip>
              <span className='text-sm font-medium'>Invite permission:</span>
            </div>
            <div className='flex items-center gap-8 ml-20'>
              <FormField
                control={form.control}
                name='invite_permission'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        id='invite_permission'
                        checked={field.value}
                        onCheckedChange={(value: boolean) => {
                          handleSettingChange('invite_permission', value);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Label
                htmlFor='invite_permission'
                className='mb-4 text-sm font-medium'
              >
                {form.watch('invite_permission') ? 'Allow' : 'Disallow'}
              </Label>
            </div>
          </div>
        </div>
      </Form>
    );
  };

  return <>{isHost ? renderForm() : renderNonHostInfo()}</>;
};
