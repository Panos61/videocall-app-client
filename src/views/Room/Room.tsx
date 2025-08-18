/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
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
} from 'livekit-client';
import classNames from 'classnames';

import type { Participant, SignallingMessage } from '@/types';
import {
  useSessionCtx,
  useMediaControlCtx,
  useSettingsCtx,
  usePreferencesCtx,
  useEventsCtx,
} from '@/context';
import { getParticipants } from '@/api';
import {
  Chat,
  VideoTile,
  Header,
  Toolbar,
  Participants,
  ShareScreenTile,
} from './components';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import ReactionWrapper from './components/gestures/Reaction/ReactionWrapper';
import TilePanel from './TilePanel';

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
  // Signalling Context: websocket connection for session/livekit token exchange
  const { ws, connectSession, isConnected, sendMessage } = useSessionCtx();
  // Events Context: websocket connection for user events
  const {
    ws: eventsWS,
    connectEvents,
    events: { reactionEvents, shareScreenEvents },
    disconnect: disconnectEvents,
  } = useEventsCtx();
  // Media Control Context: websocket connection for media device control
  const {
    connectMedia,
    sendMediaUpdate,
    disconnectMedia,
    mediaState,
    remoteMediaStates,
    setAudioState,
    setVideoState,
    setVideoTrack,
    audioTrack,
    setAudioTrack,
    videoTrack,
  } = useMediaControlCtx();
  const { isChatExpanded, shareScreenView, setShareScreenView } =
    usePreferencesCtx();

  const [activePanel, setActivePanel] = useState<
    'participants' | 'chat' | null
  >('participants');

  const [remoteParticipants, setRemoteParticipants] = useState<
    Map<string, RemoteParticipant>
  >(new Map());
  const [participants, setParticipants] = useState<Participant[]>([]);

  const livekitRoom = useRef<LivekitRoom | null>(null);
  const [lvkToken, setLvkToken] = useState<SignallingMessage['token'] | null>(
    null
  );
  const [remoteTracks, setRemoteTracks] = useState<TrackInfo[]>([]);
  const [remoteAudioTracks, setRemoteAudioTracks] = useState<TrackInfo[]>([]);
  const [screenShareTrack, setScreenShareTrack] = useState<TrackInfo | null>(
    null
  );

  const location = useLocation();
  const { roomID, sessionID } = location.state;

  // Settings Context: websocket connection for settings
  const { connectSettings, settings, disconnect } = useSettingsCtx();

  // Setup LiveKit room & event listeners
  useEffect(() => {
    livekitRoom.current = new LivekitRoom({
      adaptiveStream: true,
      dynacast: true,
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
        console.log('Screen share track detected:', track);
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
    room.localParticipant.on('trackUnpublished', handleLocalTrackUnpublished);

    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);

    room.on(
      RoomEvent.ParticipantConnected,
      (participant: RemoteParticipant) => {
        sendMediaUpdate(sessionID, mediaState);
        setRemoteParticipants((prevParticipants) => {
          const newMap = new Map(prevParticipants);
          newMap.set(participant.identity, participant);
          return newMap;
        });

        refetchParticipants();
      }
    );

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

    room.on(RoomEvent.TrackMuted, (publication, participant) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('Video track muted for', participant.identity);
      }
    });

    room.on(RoomEvent.TrackUnmuted, (publication, participant) => {
      if (publication.kind === Track.Kind.Video) {
        console.log('Video track unmuted for', participant.identity);
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      setRemoteParticipants(new Map());
      setRemoteTracks([]);
      setRemoteAudioTracks([]);
      setParticipants([]);
      setLvkToken(null);
      setVideoTrack(null);
      setAudioTrack(null);
      setAudioState(false);
      setVideoState(false);
    });

    return () => {
      room.localParticipant.off('trackPublished', handleLocalTrackPublished);
      room.localParticipant.off(
        'trackUnpublished',
        handleLocalTrackUnpublished
      );
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.disconnect();
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

  const handleLocalTrackUnpublished = () => {
    // Check if screen share track still exists
    const screenSharePublication = Array.from(
      livekitRoom.current?.localParticipant?.videoTrackPublications.values() ||
        []
    ).find((pub) => pub.source === Track.Source.ScreenShare);

    if (!screenSharePublication) {
      setScreenShareTrack(null);
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

        const livekitUrl: string = import.meta.env.VITE_LIVEKIT_CLOUD_URL;
        if (!livekitUrl) {
          console.error('LiveKit URL is not set');
          return;
        }

        // Pre-warm connection
        room?.prepareConnection(livekitUrl, lvkToken);

        // Connect to room
        await room.connect(livekitUrl, lvkToken);

        // Only enable camera/mic if they were enabled in the lobby
        // await localParticipant?.setCameraEnabled(true);
        // await localParticipant?.setMicrophoneEnabled(true);

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
  }, [roomID, sessionID, lvkToken]);

  const { data: participantsData, refetch: refetchParticipants } = useQuery({
    queryKey: ['call-participants', roomID],
    queryFn: () => getParticipants(roomID),
  });

  useEffect(() => {
    if (participantsData) {
      setParticipants(participantsData.participantsInCall);
    }
  }, [participantsData, sessionID, remoteParticipants]);

  useEffect(() => {
    connectSession(`/ws/signalling/${roomID}`);

    if (isConnected) sendMessage({ type: 'connect', sessionID });
    if (!ws) return;

    ws.onmessage = (event: MessageEvent) => {
      const data: SignallingMessage = JSON.parse(event.data);
      const lvkToken = data?.token;

      setLvkToken(lvkToken);
    };
  }, [ws, isConnected, sendMessage]);

  useEffect(() => {
    connectEvents(`/ws/user-events/${roomID}`);
    if (!eventsWS) return;

    return () => {
      disconnectEvents();
    };
  }, [roomID]);

  useEffect(() => {
    const connect = async () => {
      try {
        connectMedia(`/ws/media/${roomID}`, sessionID);
      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
      }
    };

    connect();

    return () => {
      disconnectMedia();
    };
  }, [roomID, sessionID]);

  useEffect(() => {
    connectSettings(roomID);

    return () => {
      disconnect();
    };
  }, [roomID, connectSettings]);

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

  // Transform reactions to match ReactionData interface
  const transformedReactions =
    reactionEvents &&
    reactionEvents.map((r, index) => ({
      id: `${r.username}-${Date.now()}-${index}`,
      emoji: r.reaction_type,
      username: r.username,
    }));

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

  const videoContainerCls = classNames(
    'mx-4 mb-12 h-full transition-all duration-300 ease-in-out',
    {
      'mr-[348px]': activePanel !== null,
      'mr-[800px]': isChatExpanded && activePanel === 'chat',
    }
  );

  const totalVideos = remoteParticipants.size + 1;
  const gridStyle = {
    gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalVideos))}, 1fr)`,
  };

  return (
    <div className='h-screen bg-black flex flex-col'>
      <Header
        isSharingScreen={shareScreenEvents.length > 0}
        participantsCount={participants.length}
      />
      <div className='flex-1 relative overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel
            defaultSize={10}
            minSize={10}
            maxSize={40}
            className='bg-white'
          >
            <TilePanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className='h-full relative overflow-hidden'>
              <ReactionWrapper reactions={transformedReactions} />
              <div className={videoContainerCls}>
                {shareScreenEvents.length > 0 && screenShareTrack && (
                  <div className='h-full p-8 overscroll-auto'>
                    <ShareScreenTile screenShareTrack={screenShareTrack} />
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
                            participant={remoteParticipant(
                              remoteTrack.participantIdentity
                            )}
                            track={remoteTrack.track}
                            audioTracks={remoteAudioTracks}
                            remoteSession={remoteTrack.participantIdentity}
                            isLocal={false}
                            remoteMediaStates={remoteMediaStates}
                          />
                        )
                      );
                    })}
                    <VideoTile
                      key='local-video'
                      participant={localParticipant}
                      track={videoTrack as LocalVideoTrack}
                      isLocal={true}
                      mediaState={mediaState}
                      audioTracks={remoteAudioTracks}
                      remoteMediaStates={remoteMediaStates}
                    />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <Participants
          open={activePanel === 'participants'}
          participants={participants}
          invitePermission={hasInvitePermission}
          isHost={isHost}
          sessionID={sessionID}
          mediaState={mediaState}
          remoteMediaStates={remoteMediaStates}
          onClose={() => setActivePanel(null)}
        />
        <Chat
          open={activePanel === 'chat'}
          onClose={() => setActivePanel(null)}
        />
      </div>
      <div className='flex items-center border-t border-zinc-800 bg-zinc-950'>
        <Toolbar
          sessionID={sessionID}
          room={livekitRoom.current}
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
