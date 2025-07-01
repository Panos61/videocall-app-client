import { capitalize } from 'lodash';
import { MessageSquareWarning } from 'lucide-react';

interface Props {
  isHost: boolean | undefined;
  settingsPanel: string;
}

export const AccessWarning = ({ isHost, settingsPanel }: Props) => {
  const shouldDisplay =
    !isHost &&
    (settingsPanel === 'invitation' || settingsPanel === 'permissions');
  if (!shouldDisplay) return null;

  return (
    <div className='flex items-center gap-8 p-8 w-fit border border-yellow-400 rounded-8 text-xs bg-yellow-50'>
      <MessageSquareWarning size={16} className='text-yellow-500' />
      <span>
        {capitalize(settingsPanel)} settings can only be changed by the host.
      </span>
    </div>
  );
};
