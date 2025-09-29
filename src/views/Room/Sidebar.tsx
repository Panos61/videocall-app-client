import { ReactElement } from 'react';
import classNames from 'classnames';
import { usePreferencesCtx } from '@/context';
import { LockIcon, X } from 'lucide-react';

interface Props {
  title: string;
  children: ReactElement | JSX.Element;
  open: boolean;
  expandable?: boolean;
  onClose: () => void;
}

const Sidebar = ({ title, children, open, onClose }: Props) => {
  const { isChatExpanded } = usePreferencesCtx();

  const cls = classNames(
    'absolute top-0 right-0 bottom-0 w-[340px] bg-zinc-950 shadow-lg transform transition-all duration-300 ease-in-out',
    {
      'translate-x-0 opacity-100 visible': open,
      'translate-x-full opacity-0 invisible': !open,
      'w-[340px]': !isChatExpanded,
      'w-[800px]': isChatExpanded,
    }
  );

  return (
    <>
      <div className={cls}>
        <div className='flex flex-col h-full mx-8'>
          <div className='flex items-center justify-between p-16'>
            <p className='text-white'>{title}</p>
            <X size='20px' onClick={onClose} className='text-white' />
          </div>
          {children}
          {title === 'Conversation' && (
            <div className='flex items-center'>
              <span className='m-8 text-xs text-slate-300'>
                Conversation is encrypted
              </span>
              <LockIcon size={16} className='text-purple-700' />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
