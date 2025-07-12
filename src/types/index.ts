export interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  avatar_src: string;
  jwt: string;
  session_id: string;
}

export interface SetSession {
  sessionID: string;
}

export interface SignallingMessage {
  type: string;
  sessionID: string;
  token?: string;
  description?: string;
  candidate?: string;
  to?: string;
}

export interface CreateRoom {
  id: string;
  invKey: string;
  participants: Participant;
  createdAt: string;
}

export interface JoinRoom {
  roomID: string;
  participant: Participant;
  isAuthorized: boolean;
}

export interface LeaveRoom {
  leftRoom: boolean;
}

export interface CallState {
  roomID: string;
  is_active: boolean;
  started_by: string;
  started_at: string;
}

export interface Media {
  audio: boolean;
  video: boolean;
}

type InvitationExpiry = '30' | '90' | '180';
export interface Settings {
  strict_mode?: boolean;
  invitation_expiry: InvitationExpiry;
  invite_permission: boolean;
}

export interface UpdateSettings {
  duration: string;
  expirationSet: boolean;
}

export interface SetInvitation {
  invitation: string;
}

export interface ValidateInvitation {
  roomID: string;
  isValid: boolean;
  isExpired: boolean;
}

export interface UserEvent {
  type: string;
  payload: {
    participant_id: string;
    participant_name: string;
  };
}
