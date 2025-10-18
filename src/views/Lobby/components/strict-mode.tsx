import { useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import classNames from 'classnames';
import { capitalize } from 'lodash';

import type { Settings } from '@/types';
import { updateSettings } from '@/api/client';
import { useSettingsCtx } from '@/context';

import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon, LockIcon } from 'lucide-react';

interface Props {
  roomID: string;
  isHost: boolean | undefined;
}

const FormSchema = z.object({
  strict_mode: z.boolean(),
});

const StrictMode = ({ roomID, isHost }: Props) => {
  const { settings } = useSettingsCtx();
  const strictMode = settings?.strict_mode || false;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      strict_mode: strictMode,
    },
  });

  useEffect(() => {
    form.setValue('strict_mode', strictMode);
  }, [strictMode, form]);

  const updateStrictMode = useMutation({
    mutationFn: (updatedSettings: Settings) => {
      return updateSettings(roomID, {
        ...settings,
        strict_mode: updatedSettings.strict_mode,
      } as Settings);
    },
  });

  const handleSettingChange = (field: 'strict_mode', value: boolean) => {
    form.setValue(field, value);
    const formValue = form.getValues();

    updateStrictMode.mutate(formValue as Settings);
  };

  const renderTooltipText = () => {
    if (isHost) {
      return (
        <span>
          Strict mode means <span className='font-bold'>only the host</span> can{' '}
          <span className='font-bold'>invite</span>,{' '}
          <span className='font-bold'>chat</span>, or{' '}
          <span className='font-bold'>share screen</span> by default. You can
          adjust these settings <span className='font-bold'>anytime</span>.
        </span>
      );
    }

    return (
      <span>
        Strict mode means <span className='font-bold'>only the host</span> can{' '}
        <span className='font-bold'>invite</span>,{' '}
        <span className='font-bold'>chat</span>, or{' '}
        <span className='font-bold'>share screen</span> by default. These
        settings can be adjusted by the host{' '}
        <span className='font-bold'>anytime</span>.
      </span>
    );
  };

  const cardCls = classNames(
    'flex flex-col justify-between gap-8 w-full p-12 mt-20 border rounded-8',
    {
      'border-slate-200': isHost,
      'border-yellow-400': !isHost && settings?.strict_mode,
    }
  );

  return (
    <div className={cardCls}>
      <div className='flex items-center justify-between h-20'>
        <div className='flex items-center gap-8'>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon size={16} className='text-purple-500' />
            </TooltipTrigger>
            <TooltipContent side='top'>{renderTooltipText()}</TooltipContent>
          </Tooltip>
          <div className='flex items-center gap-4'>
            <LockIcon size={16} className='text-yellow-600' />
            <span className='text-sm text-gray-600 font-medium whitespace-nowrap'>
              Strict mode
            </span>
          </div>
        </div>
        {isHost ? (
          <div className='flex items-center gap-8'>
            <Label
              htmlFor='strict_mode'
              className='text-sm text-gray-400 font-light whitespace-nowrap'
            >
              {form.watch('strict_mode') ? 'Enabled' : 'Disabled'}
            </Label>
            <Form {...form}>
              <FormField
                control={form.control}
                name='strict_mode'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        id='strict_mode'
                        checked={field.value}
                        onCheckedChange={(value: boolean) => {
                          handleSettingChange('strict_mode', value);
                        }}
                        className='mt-4'
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </Form>
          </div>
        ) : (
          <span className='text-sm text-gray-400 font-light whitespace-nowrap'>
            {capitalize(settings?.strict_mode ? 'enabled' : 'disabled')}
          </span>
        )}
      </div>
      <span className='text-xs text-gray-500 font-light'>
        Strict mode, when set by the host, restricts participant actions to
        host-only permissions.
      </span>
    </div>
  );
};

export default StrictMode;
