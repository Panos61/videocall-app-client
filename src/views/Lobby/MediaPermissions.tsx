interface Props {
  selectedAudioDevice: MediaDeviceInfo | undefined;
  selectedVideoDevice: MediaDeviceInfo | undefined;
}

const MediaPermissions = ({
  selectedAudioDevice,
  selectedVideoDevice,
}: Props) => {
  const renderDevice = (device: MediaDeviceInfo | undefined) => {
    if (!device)
      return (
        <p className='text-xs text-yellow-600'>Requires media permission</p>
      );

    return device.label;
  };

  return (
    <div
      className='flex flex-col gap-8 p-8 mt-76 outline outline-slate-200 rounded-4 
                shadow-[0_4px_20px_-4px_rgba(0,0,255,0.1)]
                transition-shadow duration-300'
    >
      <div className='flex items-center gap-8'>
        <span className='text-xs'>Audio:</span>
        <span className='text-xs text-muted-foreground'>
          {renderDevice(selectedAudioDevice)}
        </span>
      </div>
      <div className='flex items-center gap-8'>
        <span className='text-xs'>Video:</span>
        <span className='text-xs text-muted-foreground'>
          {renderDevice(selectedVideoDevice)}
        </span>
      </div>
    </div>
  );
};

export default MediaPermissions;
