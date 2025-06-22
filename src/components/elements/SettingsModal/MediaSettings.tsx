import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export const MediaSettings = () => {
  const renderAudioDevices = () => {
    return (
      <Select>
        <SelectTrigger className='w-[280px]'>
          <SelectValue placeholder='Select a fruit' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='apple'>Apple</SelectItem>
          <SelectItem value='banana'>Banana</SelectItem>
          <SelectItem value='blueberry'>Blueberry</SelectItem>
          <SelectItem value='grapes'>Grapes</SelectItem>
          <SelectItem value='pineapple'>Pineapple</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const renderVideoDevices = () => {
    return (
      <Select>
        <SelectTrigger className='w-[280px]'>
          <SelectValue placeholder='Select a fruit' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='apple'>Apple</SelectItem>
          <SelectItem value='banana'>Banana</SelectItem>
          <SelectItem value='blueberry'>Blueberry</SelectItem>
          <SelectItem value='grapes'>Grapes</SelectItem>
          <SelectItem value='pineapple'>Pineapple</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className='flex flex-col gap-12'>
      <div>Media Devices</div>
      <div className='flex flex-col gap-8'>
        <div className='flex items-center gap-8'>
          <span className='text-sm'>Audio: </span>
          {renderAudioDevices()}
        </div>
        <div className='flex items-center gap-8'>
          <span className='text-sm'>Video: </span>
          {renderVideoDevices()}
        </div>
      </div>
    </div>
  );
};
