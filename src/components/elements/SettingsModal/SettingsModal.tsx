import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Cookie from 'js-cookie';
import classNames from 'classnames';

import type { Participant } from '@/types';
import { getMe } from '@/api';
import { useSettingsCtx } from '@/context';

import { SettingsIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import { AccessWarning } from './AccessWarning';
import { MediaSettings } from './MediaSettings';
import { InvitationSettings } from './InvitationSettings';
import { Permissions } from './Permissions';

type Tab = 'media' | 'invitation' | 'permissions';

export const SettingsModal = () => {
  const { settings } = useSettingsCtx();

  const [activeTab, setActiveTab] = useState<Tab>('invitation');

  const [meData, setMeData] = useState<Participant | null>(null);

  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];
  const jwt = Cookie.get('rsCookie');

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
  
  // useEffect(() => {
  //   const fetchSettings = async () => {
  //     if (!jwt || !roomID) return;

  //     try {
  //       const settingsResponse = await getSettings(roomID);
  //       console.log('settingsResponse', settingsResponse);

  //       if (!settingsResponse) return;
  //       setSettings({
  //         invitation_expiry:
  //           settingsResponse.invitation_expiry as InvitationExpiry,
  //         invite_permission: settingsResponse.invite_permission,
  //       });
  //       console.log('settings', settingsResponse);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   fetchSettings();
  // }, [roomID, jwt]);

  const renderSettings = () => {
    switch (activeTab) {
      case 'media':
        return <MediaSettings />;
      case 'invitation':
        return (
          meData?.isHost !== undefined && (
            <InvitationSettings
              roomID={roomID}
              isHost={meData?.isHost}
              settings={settings || {
                invitation_expiry: '30',
                invite_permission: false,
              }}
            />
          )
        );
      case 'permissions':
        return <Permissions />;
      default:
        return null;
    }
  };

  const renderHeader = () => {
    switch (activeTab) {
      case 'media':
        return 'Configure your camera and microphone devices';
      case 'invitation':
        return !meData?.isHost
          ? 'Manage room invitation settings and permissions'
          : 'View current invitation settings (👉 host-only controls)';
      case 'permissions':
        return 'Manage various permissions for room members';
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

  console.log('settings SettingsModal', settings);

  return (
    <Dialog>
      <DialogTrigger>
        <div className={triggerCls}>
          <SettingsIcon size={16} />
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-[600px]'>
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
            <div
              className={menuBtnCls(activeTab === 'permissions')}
              onClick={() => setActiveTab('permissions')}
            >
              <span className='text-sm'>Permissions</span>
            </div>
          </div>
          <Separator orientation='vertical' className='ml-12 mr-16' />
          <div className='flex flex-col flex-1 gap-12'>
            <div className='flex flex-col gap-4'>
              <span className='text-sm'>{renderHeader()}</span>
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
      </DialogContent>
    </Dialog>
  );
};
