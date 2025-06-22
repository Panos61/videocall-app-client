import { useEffect } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useMediaControlCtx } from '@/context';
import { useMediaDeviceSelect } from '@livekit/components-react';

export const MediaSettings = () => {
  const { audioDevice, videoDevice } = useMediaControlCtx();

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

  const selectedAudioDevice = audioDevices.find(
    (device) => device.deviceId === audioActiveDeviceId
  );
  const selectedVideoDevice = videoDevices.find(
    (device) => device.deviceId === videoActiveDeviceId
  );

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

  const audioPlaceholder =
    selectedAudioDevice?.label || 'Select a audio device';
  const videoPlaceholder =
    selectedVideoDevice?.label || 'Select a video device';

  const renderAudioDevices = () => {
    return (
      <Select>
        <SelectTrigger className='w-[300px]'>
          <SelectValue
            defaultValue={audioDevice?.deviceId}
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
            defaultValue={videoDevice?.deviceId}
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
