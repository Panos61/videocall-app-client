export interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  avatar_src: string;
  media: { audio: boolean; video: boolean };
  jwt: string;
  session_id: string;
}

export interface SetSession {
  sessionID: string;
}

export interface SignallingMessage {
  type: string;
  sessionID: string;
  description?: string;
  candidate?: string;
  to?: string;
}

export interface CreateRoom{
  id: string;
  invKey: string;
  participants: Participant;
}

export interface JoinRoom {
  roomID: string;
  participant: Participant;
  isAuthorized: boolean;
}

export interface LeaveRoom {
  leftRoom: boolean;
}

export interface Settings {
  invitation_expiry: string;
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
