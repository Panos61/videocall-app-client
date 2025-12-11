/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import {
  Room as LivekitRoom,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  VideoPresets,
  LocalVideoTrack,
  RemoteVideoTrack,
  AudioPresets,
  LocalAudioTrack,
  RemoteAudioTrack,
  ConnectionState,
} from 'livekit-client';
import classNames from 'classnames';
import { useResizeObserver } from 'usehooks-ts';

import type { RemoteMediaState, Participant } from '@/types';
import { getMe } from '@/api/client';
import {
  useUserEventsCtx,
  useMediaStateCtx,
  useSettingsCtx,
  usePreferencesCtx,
  useSystemEventsCtx,
} from '@/context';
import { exitRoom, getLvkToken, getParticipants } from '@/api/client';
import { useNavigationBlocker } from '@/utils/useNavigationBlocker';

import { useOrderedTiles } from './useOrderedTiles';
import {
  VideoTile,
  ParticipantsList,
  ShareScreenTile,
  HostUpdateToast,
} from './components';
import Chat from './chat';
import Header from './header';
import TilePanel from './tile-panel';
import Toolbar from './toolbar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ReactionWrapper from './components/gestures/Reaction/ReactionWrapper';
// import RoomLoader from './room-loader';

interface TrackInfo {
  track:
    | LocalVideoTrack
    | RemoteVideoTrack
    | LocalAudioTrack
    | RemoteAudioTrack;
  participantIdentity: string;
  kind: Track.Kind;
}

const Room = () => {
  // Settings Context: websocket connection for settings
  const { connectSettings, settings, disconnect } = useSettingsCtx();
  // System Events Context: websocket connection for system events
  const { latestRoomKilled, latestHostLeft, latestHostUpdate } =
    useSystemEventsCtx();

  // Events Context: websocket connection for user events
  const {
    ws: eventsWS,
    connectUserEvents,
    sendUserEvent,
    events: { shareScreenEvents },
  } = useUserEventsCtx();
  // Media Control Context: websocket connection for media device control
  const {
    connectMedia,
    mediaState,
    remoteMediaStates,
    setAudioState,
    setVideoState,
    setVideoTrack,
    audioTrack,
    setAudioTrack,
    videoTrack,
  } = useMediaStateCtx();
  const { isChatExpanded, shareScreenView, setShareScreenView, isFocusView } =
    usePreferencesCtx();

  const remoteMediaStatesRef = useRef(remoteMediaStates);
  useEffect(() => {
    remoteMediaStatesRef.current = remoteMediaStates;
  }, [remoteMediaStates]);

  const mediaStateRef = useRef(mediaState);
  useEffect(() => {
    mediaStateRef.current = mediaState;
  }, [mediaState]);

  const [activePanel, setActivePanel] = useState<
    'participants' | 'chat' | null
  >('participants');

  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());
  const [participants, setParticipants] = useState<Participant[]>([]);

  const livekitRoom = useRef<LivekitRoom | null>(null);
  const [lvkToken, setLvkToken] = useState<string>();

  const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<TrackInfo[]>([]);
  const [screenShareTrack, setScreenShareTrack] = useState<TrackInfo | null>(
    null
  );
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);

  const location = useLocation();
  const { id: roomID } = useParams<{ id: string }>();
  const { sessionID } = location.state || {};
  // const [searchParams, setSearchParams] = useSearchParams();

  useNavigationBlocker({
    message:
      'Are you sure you want to leave the call? You will be disconnected from the room too.',
    onBeforeLeave: () => {
      const room: LivekitRoom | null = livekitRoom.current;
      if (room) room.disconnect();

      if (videoTrack) {
        videoTrack.stop();
      }
      if (audioTrack) {
        audioTrack.stop();
      }

      disconnect();
      if (roomID) exitRoom(roomID);
    },
    shouldBlock: !latestRoomKilled,
    allowedPaths: ['/post-call'],
  });
  
  const {data: meData} = useQuery({
    queryKey: ['me', roomID],
    queryFn: () => getMe(roomID as string, sessionID),
    enabled: !!roomID && !!sessionID,
  });
  
   const participantID = meData?.id as string;

  const {
    data: lvkTokenData,
    // isLoading: isLvkTokenLoading,
    isError: isLvkTokenError,
    // refetch: refetchLvkToken,
  } = useQuery({
    queryKey: ['lvkToken', roomID],
    queryFn: () => getLvkToken(roomID as string, sessionID),
    enabled: !!roomID && !!sessionID,
  });

  // useEffect(() => {
  //   if (searchParams.get('retry')) {
  //     refetchLvkToken();
  //     searchParams.delete('retry');
  //     setSearchParams(searchParams, { replace: false });
  //   }
  // }, [searchParams, refetchLvkToken, setSearchParams]);

  useEffect(() => {
    if (lvkTokenData) {
      setLvkToken(lvkTokenData);
    } else if (isLvkTokenError) {
      setLvkToken(undefined);
    }
  }, [lvkTokenData, isLvkTokenError]);

  useEffect(() => {
    if (roomID && participantID && sessionID) connectUserEvents(roomID, participantID, sessionID);
    if (!eventsWS) return;
  }, [roomID, participantID, sessionID]);

  useEffect(() => {
    const connectMediaControlEvents = async () => {
      try {
        if (roomID && participantID) connectMedia(roomID, participantID);
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
      }
    };

    connectMediaControlEvents();
  }, [roomID, participantID]);

  useEffect(() => {
    if (roomID && sessionID) connectSettings(roomID);
  }, [roomID, connectSettings]);

  // Setup LiveKit room & event listeners
  useEffect(() => {
    livekitRoom.current = new LivekitRoom({
      adaptiveStream: true,
      dynacast: true,
      disconnectOnPageLeave: false,
      videoCaptureDefaults: {
        resolution: VideoPresets.h720.resolution,
      },
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
      publishDefaults: {
        audioPreset: AudioPresets.speech,
        videoCodec: 'vp8',
      },
    });

    const room: LivekitRoom = livekitRoom.current;

    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (
        track.kind === Track.Kind.Video &&
        publication.source === Track.Source.ScreenShare
      ) {
        setScreenShareTrack({
          track: track as RemoteVideoTrack,
          participantIdentity: participant.identity,
          kind: Track.Kind.Video,
        });
      } else if (track.kind === Track.Kind.Video) {
        setRemoteTracks((prev) => [
          ...prev,
          {
            track: track as RemoteVideoTrack,
            participantIdentity: participant.identity,
            kind: Track.Kind.Video,
          },
        ]);
      } else if (track.kind === Track.Kind.Audio) {
        setRemoteAudioTracks((prev) => [
          ...prev,
          {
            track: track as RemoteAudioTrack,
            participantIdentity: participant.identity,
            kind: Track.Kind.Audio,
          },
        ]);
      }
    };

    const handleLocalTrackPublished = () => {
      // Check for screen share track
      const screenSharePublication = Array.from(
        room.localParticipant.videoTrackPublications.values()
      ).find((pub) => pub.source === Track.Source.ScreenShare);

      if (screenSharePublication && screenSharePublication.videoTrack) {
        setScreenShareTrack({
          track: screenSharePublication.videoTrack,
          participantIdentity: sessionID,
          kind: Track.Kind.Video,
        });
      } else {
        // Handle video track
        if (!videoTrack) {
          const newVideoTrack = room?.localParticipant?.videoTrackPublications
            .values()
            .next().value?.videoTrack;
          setVideoTrack(newVideoTrack as LocalVideoTrack);
        } else {
          setVideoTrack(videoTrack);
        }

        if (!audioTrack) {
          const newAudioTrack = room?.localParticipant?.audioTrackPublications
            .values()
            .next().value?.audioTrack;
          setAudioTrack(newAudioTrack as LocalAudioTrack);
        } else {
          setAudioTrack(audioTrack);
        }
      }
    };

    room.localParticipant.on('trackPublished', handleLocalTrackPublished);

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      setActiveSpeakers(speakers.map((s) => s.identity));
    });

    const handleParticipantConnected = (participant: RemoteParticipant) => {
      // Everyone tries to send, but server only allows leader
      const fullRoomState: RemoteMediaState = {
        ...remoteMediaStatesRef.current,
        [participantID as string]: mediaStateRef.current,
      };

      sendUserEvent({
        type: 'media.synced',
        participant_id: participantID,
        payload: fullRoomState,
      });
      console.log('participantIdentity', participant);
      setRemoteParticipants((prev) => {
        const newMap = new Map(prev);
        newMap.set(participant.identity, participant);
        return newMap;
      });
      console.log('remoteParticipants', remoteParticipants);
      refetchParticipants();
    };

    const handleConnected = () => {
      sendUserEvent({
        type: 'media.state.updated',
        participant_id: participantID,
        payload: {
          audio: mediaStateRef.current.audio,
          video: mediaStateRef.current.video,
        },
      });

      sendUserEvent({
        type: 'media.synced',
        participant_id: participantID,
        payload: {},
      });
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.Connected, handleConnected);

    room.on(
      RoomEvent.ParticipantDisconnected,
      (participant: RemoteParticipant) => {
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.delete(participant.identity);
          return newMap;
        });
        setRemoteTracks((prevTracks) =>
          prevTracks.filter(
            (track) => track.participantIdentity !== participant.identity
          )
        );
        setRemoteAudioTracks((prevTracks) =>
          prevTracks.filter(
            (track) => track.participantIdentity !== participant.identity
          )
        );

        setTimeout(() => {
          refetchParticipants();
        }, 200);
      }
    );

    room.on(RoomEvent.Disconnected, () => {
      setRemoteParticipants(new Map());
      setRemoteTracks([]);
      setRemoteAudioTracks([]);
      setParticipants([]);
      setLvkToken(undefined);
      setVideoTrack(null);
      setAudioTrack(null);
      setAudioState(false);
      setVideoState(false);
    });

    return () => {
      room.localParticipant.off('trackPublished', handleLocalTrackPublished);
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.Connected, handleConnected);
    };
  }, []);

  const handleTrackUnsubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication
  ) => {
    track.detach();

    if (
      track.kind === Track.Kind.Video &&
      publication.source === Track.Source.ScreenShare
    ) {
      setScreenShareTrack(null);
    } else if (track.kind === Track.Kind.Video) {
      setRemoteTracks((prev) => prev.filter((t) => t.track.sid !== track.sid));
    } else if (track.kind === Track.Kind.Audio) {
      setRemoteAudioTracks((prev) =>
        prev.filter((t) => t.track.sid !== track.sid)
      );
    }
  };

  // Connect to LiveKit room
  useEffect(() => {
    const room: LivekitRoom | null = livekitRoom.current;
    if (!room) return;

    const connectToRoom = async () => {
      try {
        if (!lvkToken) {
          console.error('Failed to get LiveKit token');
          return;
        }

        if (room.state === ConnectionState.Connected) {
          return;
        }

        const livekitUrl: string = import.meta.env.VITE_LIVEKIT_CLOUD_URL;
        if (!livekitUrl) {
          console.error('LiveKit URL is not set');
          return;
        }

        // Pre-warm connection
        room?.prepareConnection(livekitUrl, lvkToken);
        // Connect to room
        await room.connect(livekitUrl, lvkToken);

        // Always enable camera/mic to ensure tracks are published, then mute if needed
        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);

        // If media was disabled in lobby, mute the tracks after publishing
        if (!mediaState.video) {
          const videoPublication = room.localParticipant.getTrackPublication(
            Track.Source.Camera
          );
          if (videoPublication && videoPublication.track) {
            videoPublication.track.mute();
          }
        }

        if (!mediaState.audio) {
          const audioPublication = room.localParticipant.getTrackPublication(
            Track.Source.Microphone
          );
          if (audioPublication && audioPublication.track) {
            audioPublication.track.mute();
          }
        }

        // Get any existing participants in the room
        if (room?.remoteParticipants) {
          const participantsMap = new Map<string, RemoteParticipant>();
          room.remoteParticipants.forEach((participant) => {
            participantsMap.set(participant.identity, participant);
          });

          setRemoteParticipants(participantsMap);
        }

        if (!videoTrack) {
          const newVideoTrack = room?.localParticipant?.videoTrackPublications
            .values()
            .next().value?.videoTrack as LocalVideoTrack;

          setVideoTrack(newVideoTrack || null);
        } else {
          setVideoTrack(videoTrack);
        }
      } catch (error) {
        console.error('Error connecting to LiveKit room:', error);
      }
    };

    connectToRoom();
  }, [roomID, participantID, lvkToken]);

  const { data: participantsData, refetch: refetchParticipants } = useQuery({
    queryKey: ['call-participants', roomID],
    queryFn: () => getParticipants(roomID as string),
  });

  useEffect(() => {
    if (participantsData) {
      setParticipants(participantsData.participantsInCall);
    }
  }, [participantsData, participantID, remoteParticipants]);

  const hasInvitePermission = settings?.invite_permission || false;
  const localParticipant: Participant | undefined = participants.find(
    (p) => p.session_id == sessionID
  );
  const isHost = localParticipant?.isHost || false;

  const remoteUserSessions: string[] = Array.from(
    remoteParticipants.keys()
  ).filter((session) => session !== sessionID);

  const remoteParticipant = (remoteSessionID: string) => {
    const remoteSession = remoteUserSessions.find(
      (session) => session === remoteSessionID
    );

    return participants.find((p) => p.session_id === remoteSession);
  };

  const handleScreenShareChange = useCallback(
    (isSharing: boolean, track?: any) => {
      if (isSharing && track) {
        setScreenShareTrack(track);
        setShareScreenView([{ trackSid: track.track.sid }]);
      } else {
        setScreenShareTrack(null);
        setShareScreenView('participants');
      }
    },
    [setShareScreenView]
  );

  useEffect(() => {
    if (shareScreenEvents.length > 0) {
      setShareScreenView([{ trackSid: screenShareTrack?.track.sid || '' }]);
    } else {
      setScreenShareTrack(null);
      setShareScreenView('participants');
    }
  }, [shareScreenEvents, setShareScreenView]);

  // Check if screen share has ended via native browser controls
  useEffect(() => {
    if (!screenShareTrack || !livekitRoom.current?.localParticipant) return;

    const checkScreenShareStatus = () => {
      const screenSharePublication = Array.from(
        livekitRoom.current?.localParticipant?.videoTrackPublications.values() ||
          []
      ).find((pub) => pub.source === Track.Source.ScreenShare);

      if (!screenSharePublication) {
        // Screen share was stopped via browser native controls
        sendUserEvent({
          type: 'sharescreen.ended',
          senderID: sessionID,
          payload: {
            active: false,
            trackSid: screenShareTrack.track.sid,
            username: localParticipant?.username || 'Unknown',
          },
        });
        setScreenShareTrack(null);
      }
    };

    const interval = setInterval(checkScreenShareStatus, 1000);
    return () => clearInterval(interval);
  }, [screenShareTrack, sessionID, localParticipant, sendUserEvent]);

  const videoContainerCls = classNames(
    'mx-4 mb-12 h-full transition-all duration-300 ease-in-out',
    {
      'mr-[348px]': activePanel !== null,
      'mr-[800px]': isChatExpanded && activePanel === 'chat',
    }
  );

  const totalVideos = remoteParticipants.size + (isFocusView ? 0 : 1);

  const gridStyle = {
    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalVideos))}, 1fr)`,
  };

  // Adjust video tile conponents (avatar, username, icons) size based on width of tile panel (only for tile panel video tiles)
  const tilePanelRef = useRef<HTMLDivElement>(null);
  const { width: responsiveWidth = 0 } = useResizeObserver({
    ref: tilePanelRef,
  });
  // Order the side panel video tiles based of active speakers
  const sidePanelOrder = useOrderedTiles({ activeSpeakers, remoteTracks });

  // todo: refactor this loader
  // if (isLvkTokenLoading || isLvkTokenError) {
  //   return <RoomLoader hasError={isLvkTokenError} />;
  // }

  return (
    <div className='h-screen bg-black flex flex-col'>
      <Header
        isSharingScreen={shareScreenEvents.length > 0}
        participantsCount={participants.length}
      />

      <div className='flex-1 relative overflow-hidden'>
        {latestHostLeft && (
          <HostUpdateToast
            key={latestHostLeft.received_at}
            hostEventType='left'
          />
        )}
        {latestHostUpdate && (
          <HostUpdateToast
            key={latestHostUpdate.received_at}
            hostEventType='updated'
          />
        )}
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel
            defaultSize={8}
            minSize={8}
            maxSize={40}
            hidden={!isFocusView}
          >
            <TilePanel ref={tilePanelRef}>
              {shareScreenEvents.length > 0 && screenShareTrack && (
                <div className='h-full overscroll-auto'>
                  <ShareScreenTile
                    isSidePanel
                    screenShareTrack={screenShareTrack}
                  />
                </div>
              )}
              {sidePanelOrder.map((remoteTrack: TrackInfo, index: number) => {
                return (
                  <VideoTile
                    key={`${remoteTrack.participantIdentity}-${index}`}
                    isSidePanel
                    index={index}
                    responsiveWidth={responsiveWidth || 0}
                    participant={remoteParticipant(
                      remoteTrack.participantIdentity
                    )}
                    track={remoteTrack.track as RemoteVideoTrack}
                    audioTracks={remoteAudioTracks}
                    remoteIdentity={remoteTrack.participantIdentity}
                    isLocal={false}
                    isActiveSpeaker={activeSpeakers.includes(
                      remoteTrack.participantIdentity
                    )}
                    remoteMediaStates={remoteMediaStates}
                  />
                );
              })}
              <VideoTile
                key='local-video'
                isSidePanel={true}
                participant={localParticipant}
                responsiveWidth={responsiveWidth || 0}
                track={videoTrack as LocalVideoTrack}
                isLocal={true}
                mediaState={mediaState}
                audioTracks={remoteAudioTracks}
                isActiveSpeaker={activeSpeakers.includes(sessionID)}
                remoteMediaStates={remoteMediaStates}
              />
            </TilePanel>
          </ResizablePanel>
          <ResizableHandle withHandle hidden={!isFocusView} />
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className='h-full relative overflow-hidden'>
              <ReactionWrapper />
              <div className={videoContainerCls}>
                {shareScreenView !== 'participants' && screenShareTrack && (
                  <div className='h-full p-8 overscroll-auto'>
                    <ShareScreenTile
                      isSidePanel={false}
                      screenShareTrack={screenShareTrack}
                    />
                  </div>
                )}
                {shareScreenView === 'participants' && (
                  <div
                    className='grid gap-8 h-full p-8 overflow-auto transition-all duration-300 ease-in-out'
                    style={gridStyle}
                  >
                    {remoteTracks.map((remoteTrack, index) => {
                      return (
                        remoteTrack.track.kind === 'video' && (
                          <VideoTile
                            key={remoteTrack.track.sid}
                            index={index}
                            isSidePanel={false}
                            participant={remoteParticipant(
                              remoteTrack.participantIdentity
                            )}
                            track={remoteTrack.track}
                            audioTracks={remoteAudioTracks}
                            remoteIdentity={remoteTrack.participantIdentity}
                            isLocal={false}
                            isActiveSpeaker={activeSpeakers.includes(
                              remoteTrack.participantIdentity
                            )}
                            remoteMediaStates={remoteMediaStates}
                          />
                        )
                      );
                    })}
                    {(remoteTracks.length === 0 || !isFocusView) && (
                      <VideoTile
                        key='local-video'
                        isSidePanel={false}
                        participant={localParticipant}
                        track={videoTrack as LocalVideoTrack}
                        isLocal={true}
                        mediaState={mediaState}
                        audioTracks={remoteAudioTracks}
                        isActiveSpeaker={activeSpeakers.includes(sessionID)}
                        remoteMediaStates={remoteMediaStates}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <ParticipantsList
          open={activePanel === 'participants'}
          participants={participants}
          participantID={participantID}
          invitePermission={hasInvitePermission}
          isHost={isHost}
          mediaState={mediaState}
          remoteMediaStates={remoteMediaStates}
          isActiveSpeaker={activeSpeakers.includes(sessionID)}
          onClose={() => setActivePanel(null)}
        />
        <Chat
          open={activePanel === 'chat'}
          onClose={() => setActivePanel(null)}
        />
      </div>
      <div className='flex items-center border-t border-zinc-800 bg-zinc-950'>
        <Toolbar
          room={livekitRoom.current}
          sessionID={sessionID}
          participantID={participantID}
          mediaState={mediaState}
          setAudioState={setAudioState}
          setVideoState={setVideoState}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onScreenShareChange={handleScreenShareChange}
        />
      </div>
    </div>
  );
};

export default Room;
