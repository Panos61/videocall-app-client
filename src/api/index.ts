import axios from 'axios';
import { buildMemoryStorage, setupCache } from 'axios-cache-interceptor';
import type {
  CreateRoomResponse,
  ValidateInvitationResponse,
  JoinRoomResponse,
  LeaveRoomResponse,
  SetInvitationResponse,
  UserMedia,
  SettingsResponse,
  UpdateSettingsResponse,
} from '@/types';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set up cache interceptor
// https://axios-cache-interceptor.js.org/getting-started
const cachedAxiosApi = setupCache(api, {
  storage: buildMemoryStorage(),
  ttl: 2 * 60 * 1000,
  methods: ['get', 'post'],
});

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

export const getSettings = async (roomID: string) => {
  try {
    const response = await cachedAxiosApi.get<SettingsResponse>(
      `http://localhost:8080/settings/${roomID}`,
      { id: 'settings' }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return {
        invitation_expiry: '30',
      };
    }
    console.error(error);
  }
};

export const updateSettings = async (
  roomID: string,
  invitation_expiry: string
) => {
  try {
    const response = await cachedAxiosApi.post<UpdateSettingsResponse>(
      `http://localhost:8080/update-settings/${roomID}`,
      {
        invitation_expiry,
      },
      {
        cache: {
          update: {
            settings: 'delete',
          },
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
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
