import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookie from 'js-cookie';
import classNames from 'classnames';
import { capitalize } from 'lodash';

import { getMe, getSettings, updateSettings } from '@/api';

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

import type { Participant, Settings } from '@/types';
import { AccessWarning } from './AccessWarning';
import { MediaSettings } from './MediaSettings';
import { InvitationSettings } from './InvitationSettings';

type Tab = 'media' | 'invitation';
type InvitationExpiry = '30' | '90' | '180';

export const SettingsModal = () => {
  const [activeTab, setActiveTab] = useState<Tab>('invitation');

  const [meData, setMeData] = useState<Participant | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [successApply, setSuccessApply] = useState<boolean>(false);

  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];
  const jwt = Cookie.get('rsCookie');

  const FormSchema = z.object({
    invitation_expiry: z.enum(['30', '90', '180']),
    invite_permission: z.boolean(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      invitation_expiry: '30' as InvitationExpiry,
      invite_permission: false,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    const fetchMe = async () => {
      if (!jwt || !roomID) return;

      try {
        const meResponseData = await getMe(roomID, jwt);
        setMeData(meResponseData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMe();
  }, [roomID, jwt]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!jwt || !roomID) return;

      try {
        const settingsResponse = await getSettings(roomID);
        console.log('settingsResponse', settingsResponse);

        if (!settingsResponse) return;
        setSettings({
          invitation_expiry:
            settingsResponse.invitation_expiry as InvitationExpiry,
          invite_permission: settingsResponse.invite_permission ?? false,
        });
        console.log('settings', settingsResponse);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSettings();
  }, [roomID, jwt]);

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
    if (settings) {
      form.reset({
        invitation_expiry: settings.invitation_expiry,
        invite_permission: settings.invite_permission,
      });
    }
  }, [settings, form, successApply]);

  const renderSettings = () => {
    switch (activeTab) {
      case 'media':
        return <MediaSettings />;
      case 'invitation':
        return (
          settings &&
          meData?.isHost !== undefined && (
            <InvitationSettings
              form={form}
              isHost={meData?.isHost}
              settings={settings}
            />
          )
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
      'flex items-center w-full px-8 py-4 text-md cursor-pointer rounded-4 duration-150 ease-in-out',
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
      <DialogContent className='max-w-[600px]'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <div className='flex items-center gap-4'>
                  Settings <SettingsIcon className='size-16' />
                </div>
                <Separator className='w-full mt-8' />
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className='flex h-[300px] mt-16'>
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
              <div className='flex flex-col flex-1 gap-20'>
                <div className='flex flex-col gap-4'>
                  <span>{capitalize(activeTab)} settings</span>
                  <Separator />
                </div>
                <div className='flex flex-col gap-12'>
                  <AccessWarning
                    isHost={meData?.isHost}
                    settingsPanel={activeTab}
                  />
                  {renderSettings()}
                </div>
              </div>
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
