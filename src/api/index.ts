import axios from 'axios';
import type {
  CreateRoomResponse,
  ValidateInvitationResponse,
  JoinRoomResponse,
  LeaveRoomResponse,
  SetInvitationResponse,
  UserMedia,
} from '@/types';

export const createRoom = async () => {
  const response = await axios.get<CreateRoomResponse>(
    'http://localhost:8080/create-room',
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
};

export const validateInvitation = async (code: string, room_id: string) => {
  try {
    const response = await axios.post<ValidateInvitationResponse>(
      `http://localhost:8080/validate-invitation`,
      {
        code,
        room_id,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return {
      isValid: response.data.isValid,
      isExpired: response.data.isExpired,
      roomID: response.data.roomID,
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: false,
      roomID: null,
    };
  }
};

export const joinRoom = async (roomID: string) => {
  const response = await axios.post<JoinRoomResponse>(
    `http://localhost:8080/join-room/${roomID}`,

    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const leaveRoom = async (roomID: string, jwtToken: string | null) => {
  const response = await axios.get<LeaveRoomResponse>(
    `http://localhost:8080/leave-room/${roomID}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  return response.data;
};

export const startCall = async (
  roomID: string,
  username: string,
  avatar_src: string | null | undefined,
  jwtToken: string | null
) => {
  const response = await axios.post(
    `http://localhost:8080/start-call/${roomID}`,
    {
      username,
      avatar_src,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    }
  );

  return response.data;
};

export const getRoomParticipants = async (roomID: string) => {
  const response = await axios.get(
    `http://localhost:8080/call-participants/${roomID}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.roomParticipants;
};

export const setSession = async (roomID: string, jwt: string | null) => {
  const response = await axios.post(
    `http://localhost:8080/set-session/${roomID}`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return response.data;
};

export const getInvitation = async (roomID: string) => {
  const response = await axios.get<SetInvitationResponse>(
    `http://localhost:8080/room-invitation/${roomID}`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data.invitation;
};

export const updateUserMedia = async (
  roomID: string,
  jwt: string | null,
  media: { audio: boolean; video: boolean }
) => {
  const response = await axios.post<UserMedia>(
    `http://localhost:8080/update-user-media/${roomID}`,
    { media },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  return response.data;
};
