import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookie from 'js-cookie';
import type {
  CreateRoom,
  ValidateInvitation,
  JoinRoom,
  LeaveRoom,
  SetInvitation,
  Settings,
  UpdateSettings,
  Media,
} from '@/types';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookie.get('rsCookie');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = Cookie.get('rsCookie');
        if (!token) {
          Cookie.remove('rsCookie');
          window.location.href = '/';
          return Promise.reject(error);
        }

        const response = await axios.post(
          'http://localhost:8080/refresh-token',
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.token) {
          const newToken = response.data.token;
          Cookie.set('rsCookie', newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookie.remove('rsCookie');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const createRoom = async () => {
  const response = await axios.get<CreateRoom>(
    'http://localhost:8080/create-room',
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return response.data;
};

export const validateInvitation = async (code: string, room_id: string) => {
  try {
    const response = await axios.post<ValidateInvitation>(
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
  const response = await api.post<JoinRoom>(
    `/join-room/${roomID}`,

    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

export const leaveRoom = async (
  roomID: string,
  jwtToken: string | undefined
) => {
  const response = await api.get<LeaveRoom>(`/leave-room/${roomID}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  return response.data;
};

export const getMe = async (roomID: string, jwt: string) => {
  try {
    const response = await api.post(
      `/get-me/${roomID}`,
      {
        id: 'me',
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const startCall = async (
  roomID: string,
  username: string,
  avatar_src: string | null | undefined,
  jwtToken: string | undefined,
  mediaState: Media
) => {
  const response = await api.post(
    `/start-call/${roomID}`,
    {
      username,
      avatar_src,
      media: mediaState,
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
    const response = await api.get<Settings>(`/settings/${roomID}`);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return {
        invitation_expiry: '30',
        invite_permission: false,
      };
    }
    console.error(error);
  }
};

export const updateSettings = async (
  roomID: string,
  settings: Settings
) => {
  try {
    const response = await api.post<UpdateSettings>(
      `/update-settings/${roomID}`,
      {
        settings,
      }
    );
    
    console.log('api response', response.data);
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

export const setSession = async (roomID: string, jwt: string | undefined) => {
  const response = await api.post(
    `/set-session/${roomID}`,
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
  const response = await axios.get<SetInvitation>(
    `http://localhost:8080/room-invitation/${roomID}`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data.invitation;
};
