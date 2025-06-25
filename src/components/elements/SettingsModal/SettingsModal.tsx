import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import classNames from 'classnames';

import { updateSettings } from '@/api';

import { SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

import { MediaSettings } from './MediaSettings';
import { InvitationSettings } from './InvitationSettings';

interface Props {
  settings: string;
  isHost: boolean | undefined;
}

type Tab = 'media' | 'invitation';

export const SettingsModal = ({ settings, isHost }: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>('media');
  const [successApply, setSuccessApply] = useState<boolean>(false);

  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];

  const FormSchema = z.object({
    invitation_expiry: z.enum(['30', '90', '180']),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      invitation_expiry: settings as '30' | '90' | '180',
    },
  });

  const { isDirty } = form.formState;

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      await updateSettings(roomID, data.invitation_expiry);

      setSuccessApply(true);
      setTimeout(() => {
        setSuccessApply(false);
      }, 1500);
    } catch (error) {
      setSuccessApply(false);
    }
  };

  useEffect(() => {
    form.reset({ invitation_expiry: settings as '30' | '90' | '180' });
  }, [settings, form, successApply]);

  const renderSettings = () => {
    switch (activeTab) {
      case 'media':
        return <MediaSettings />;
      case 'invitation':
        return (
          <InvitationSettings form={form} isHost={isHost} settings={settings} />
        );
      default:
        return null;
    }
  };

  const triggerCls = classNames(
    'flex items-center p-12 rounded-full bg-white hover:bg-slate-200 duration-300 ease-in-out cursor-pointer',
    {
      'border border-slate-200': !pathname.includes('/call'),
    }
  );

  const menuBtnCls = (isActive: boolean) =>
    classNames(
      'flex items-center w-full px-8 py-4 text-md cursor-pointer rounded-4 duration-300 ease-in-out',
      {
        'bg-black text-white': isActive,
        'hover:bg-slate-100': !isActive,
      }
    );

  return (
    <Dialog>
      <DialogTrigger>
        <div className={triggerCls}>
          <SettingsIcon size={16} />
        </div>
      </DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent className='max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>
                <div className='flex items-center gap-4'>
                  Settings <SettingsIcon className='size-16' />
                </div>
                <Separator className='w-full mt-8' />
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='flex h-[240px] mt-16'>
              <div className='flex flex-col gap-4 w-[140px]'>
                <div
                  className={menuBtnCls(activeTab === 'media')}
                  onClick={() => setActiveTab('media')}
                >
                  <span className='text-sm'>Media Devices</span>
                </div>
                <div
                  className={menuBtnCls(activeTab === 'invitation')}
                  onClick={() => setActiveTab('invitation')}
                >
                  <span className='text-sm'>Invitation</span>
                </div>
              </div>
              <Separator orientation='vertical' className='ml-12 mr-24' />
              {renderSettings()}
            </DialogDescription>
            <DialogFooter className='flex items-center gap-12 mt-16'>
              {successApply && (
                <span className='font-bold text-xs text-green-600'>
                  Changes applied!
                </span>
              )}
              <Button
                size='sm'
                type='submit'
                disabled={!isDirty}
                className='bg-black text-white hover:bg-gray-800'
                onClick={() => onSubmit(form.getValues())}
              >
                Apply changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};
