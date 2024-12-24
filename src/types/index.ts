export interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  avatar_src: string;
  media: { audio: boolean; video: boolean };
  jwt: string;
  session_id: string;
}

export interface UserMedia {
  video: boolean;
  audio: boolean;
}

export interface SignallingMessage {
  type: string;
  sessionID: string;
  description?: string;
  candidate?: string;
  to?: string;
}

export interface CreateRoomResponse {
  id: string;
  invKey: string;
  participants: Participant;
}

export interface JoinRoomResponse {
  room_id: string;
  participant: Participant;
}

export interface LeaveRoomResponse {
  leftRoom: boolean;
}

export interface SetInvKeyResponse {
  invitationKey: string;
}

export interface AuthInviteResponse {
  isAuthorized: boolean;
  roomID: string;
}

export interface SetSessionResponse {
  sessionID: string;
}
