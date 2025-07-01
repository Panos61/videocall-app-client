import { useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useMediaDeviceSelect } from '@livekit/components-react';

export const MediaSettings = () => {
  const {
    devices: audioDevices,
    activeDeviceId: audioActiveDeviceId,
    // setActiveMediaDevice: setAudioActiveDevice,
  } = useMediaDeviceSelect({
    kind: 'audioinput',
  });

  const {
    devices: videoDevices,
    activeDeviceId: videoActiveDeviceId,
    setActiveMediaDevice: setVideoActiveDevice,
  } = useMediaDeviceSelect({
    kind: 'videoinput',
  });

  // Video device can be found but not set as active device
  // set first video device as selected
  useEffect(() => {
    if (
      videoDevices.length > 0 &&
      (!videoActiveDeviceId || videoActiveDeviceId === 'default')
    ) {
      const defaultSelectedDevice = videoDevices[0];
      setVideoActiveDevice(defaultSelectedDevice.deviceId);
    }
  }, [videoDevices, videoActiveDeviceId, setVideoActiveDevice]);

  const selectedAudioDevice = audioDevices.find(
    (device) => device.deviceId === audioActiveDeviceId
  );
  const selectedVideoDevice = videoDevices.find(
    (device) => device.deviceId === videoActiveDeviceId
  );

  const audioPlaceholder =
    selectedAudioDevice?.label || 'Select an audio device';
  const videoPlaceholder =
    selectedVideoDevice?.label || 'Select a video device';

  const renderAudioDevices = () => {
    return (
      <Select>
        <SelectTrigger className='w-[300px]'>
          <SelectValue
            defaultValue={audioActiveDeviceId}
            placeholder={audioPlaceholder}
          />
        </SelectTrigger>
        <SelectContent>
          {audioDevices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const renderVideoDevices = () => {
    return (
      <Select>
        <SelectTrigger className='w-[300px]'>
          <SelectValue
            defaultValue={videoActiveDeviceId}
            placeholder={videoPlaceholder}
          />
        </SelectTrigger>
        <SelectContent>
          {videoDevices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  const cardCls = 'flex flex-col gap-12 border border-slate-200 rounded-8 p-12';

  return (
    <div className='flex flex-col gap-12'>
      <div className={cardCls}>
        <span className='text-sm font-medium'>Media Device Permissions</span>
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
