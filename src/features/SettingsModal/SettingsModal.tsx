import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Cookie from 'js-cookie';
import classNames from 'classnames';

import type { Participant } from '@/types';
import { getMe } from '@/api/client';
import { useSettingsCtx } from '@/context';

import { Lock, SettingsIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import { AccessWarning } from './AccessWarning';
import { ChatSettings } from './ChatSettings';
import { MediaSettings } from './MediaSettings';
import { InvitationSettings } from './InvitationSettings';
import { Permissions } from './Permissions';

type Tab = 'media' | 'invitation' | 'chat' | 'permissions';

export const SettingsModal = () => {
  const { settings } = useSettingsCtx();

  const [activeTab, setActiveTab] = useState<Tab>('invitation');

  const { pathname } = useLocation();
  const roomID = pathname.split('/')[2];
  const jwt = Cookie.get('rsCookie');

  const { data: meData } = useQuery<Participant>({
    queryKey: ['me', roomID],
    queryFn: () => getMe(roomID!, jwt!),
    enabled: !!roomID && !!jwt,
  });

  const isHost = meData?.isHost;

  const renderSettings = () => {
    switch (activeTab) {
      case 'media':
        return <MediaSettings />;
      case 'invitation':
        return (
          isHost !== undefined && (
            <InvitationSettings
              roomID={roomID}
              isHost={isHost}
              settings={
                settings || {
                  invitation_expiry: '30',
                  invite_permission: false,
                }
              }
            />
          )
        );
      case 'chat':
        return <ChatSettings />;
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
        return isHost
          ? 'Manage room invitation settings and permissions'
          : 'View current invitation settings set by the host';
      case 'chat':
        return 'Configure conversation settings';
      case 'permissions':
        return isHost
          ? 'Manage various permissions for room members'
          : 'View current room permissions set by the host';
    }
  };

  const triggerCls = classNames(
    'flex items-center p-12 rounded-full bg-gray-100 hover:bg-gray-200 duration-300 ease-in-out cursor-pointer hover:scale-105',
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

  const isStrictMode = settings?.strict_mode || false;

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
            <div className='flex items-center gap-28'>
              <div className='flex items-center gap-4'>
                Settings <SettingsIcon className='size-16' />
              </div>
              {isStrictMode && (
                <div className='flex items-center gap-4 text-xs text-yellow-500'>
                  <Lock size={12} className='text-yellow-500' />
                  <span>Strict mode is enabled.</span>
                </div>
              )}
            </div>
            <Separator className='w-full mt-8' />
          </DialogTitle>
        </DialogHeader>
        <div className='flex h-[340px] mt-16'>
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
              className={menuBtnCls(activeTab === 'chat')}
              onClick={() => setActiveTab('chat')}
            >
              <span className='text-sm'>Conversation</span>
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
              <AccessWarning isHost={isHost} settingsPanel={activeTab} />
              {renderSettings()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
