import { useEffect, useState } from 'react';
import { Room, Track } from 'livekit-client';
import classNames from 'classnames';
import { useEventsCtx } from '@/context';
import { ScreenShare, ScreenShareOff } from 'lucide-react';

interface Props {
  sessionID: string;
  room: Room | null;
  onScreenShareChange?: (isSharing: boolean, track?: any) => void;
}

const ShareScreen = ({ sessionID, room, onScreenShareChange }: Props) => {
  const { sendEvent } = useEventsCtx();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!room?.localParticipant) return;

    const checkScreenShare = () => {
      const screenSharePublication = Array.from(
        room.localParticipant.videoTrackPublications.values()
      ).find((pub) => pub.source === Track.Source.ScreenShare);

      // console.log('Checking screen share:', {
      //   publications: room.localParticipant.videoTrackPublications.size,
      //   screenSharePublication: !!screenSharePublication,
      //   sources: Array.from(
      //     room.localParticipant.videoTrackPublications.values()
      //   ).map((p) => ({ source: p.source, kind: p.kind })),
      //   isSharing: !!screenSharePublication,
      //   Track_Source_ScreenShare: Track.Source.ScreenShare,
      // });

      const newIsSharing = !!screenSharePublication;
      setIsSharing(newIsSharing);

      // Notify parent component about screen share changes
      if (onScreenShareChange) {
        if (newIsSharing && screenSharePublication) {
          onScreenShareChange(true, {
            track: screenSharePublication.videoTrack,
            participantIdentity: sessionID,
            kind: Track.Kind.Video,
          });
        } else {
          onScreenShareChange(false);
        }
      }
    };

    checkScreenShare();

    // Listen for track published/unpublished events
    const handleTrackPublished = () => {
      console.log('Track published in ShareScreen');
      setTimeout(checkScreenShare, 100); // Small delay to ensure track is fully published
    };
    const handleTrackUnpublished = () => {
      console.log('Track unpublished in ShareScreen');
      setTimeout(checkScreenShare, 100);
    };

    room.localParticipant.on('trackPublished', handleTrackPublished);
    room.localParticipant.on('trackUnpublished', handleTrackUnpublished);

    return () => {
      room.localParticipant.off('trackPublished', handleTrackPublished);
      room.localParticipant.off('trackUnpublished', handleTrackUnpublished);
    };
  }, [room, onScreenShareChange, sessionID]);

  const handleShareScreen = async () => {
    if (!room?.localParticipant) {
      return;
    }
    
    let shareTrackSid: string = '';

    console.log('isSharing', isSharing);
    try {
      if (isSharing) {
        await room.localParticipant.setScreenShareEnabled(false);
        sendEvent({
          type: 'share_screen.ended',
          senderID: sessionID,
          payload: {
            share_screen: false,
            track_sid: shareTrackSid,
          },
        });
      } else {
        const result = await room.localParticipant.setScreenShareEnabled(true);
        shareTrackSid = result?.track?.sid || '';
        console.log('Screen share enabled result:', result);

        // Manual check after enabling screen share
        setTimeout(() => {
          const screenSharePublication = Array.from(
            room.localParticipant.videoTrackPublications.values()
          ).find((pub) => pub.source === Track.Source.ScreenShare);

          if (screenSharePublication && onScreenShareChange) {
            onScreenShareChange(true, {
              track: screenSharePublication.videoTrack,
              participantIdentity: sessionID,
              kind: Track.Kind.Video,
            });
          }
        }, 200);

        sendEvent({
          type: 'share_screen.started',
          senderID: sessionID,
          payload: {
            share_screen: true,
            track_sid: shareTrackSid,
          },
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const cls = classNames(
    'flex items-center p-12 rounded-full duration-300 ease-in-out cursor-pointer hover:scale-105',
    {
      'bg-red-500 hover:bg-red-600': isSharing,
      'bg-white hover:bg-slate-200': !isSharing,
    }
  );

  return (
    <div className={cls} onClick={handleShareScreen}>
      {isSharing ? (
        <ScreenShareOff size={16} className='text-white' />
      ) : (
        <ScreenShare size={16} className='text-green-500' />
      )}
    </div>
  );
};

export default ShareScreen;
