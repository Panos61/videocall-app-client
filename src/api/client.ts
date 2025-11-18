import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookie from 'js-cookie';
import type {
  CallState,
  CreateRoom,
  JoinRoom,
  Participant,
  Settings,
  UpdateSettings,
  Authorization,
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

    // check if room exists, else redirect to invalid page
    if (error.response?.status === 404) {
      window.location.href = '/whoops';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // check if the token is valid, else redirect to login
        // if the token is valid or not expired, refresh the token
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

export const joinRoom = async (roomID: string | null): Promise<JoinRoom> => {
  const response = await api.post<JoinRoom>(`/join-room/${roomID}`);
  return response.data;
};

export const startCall = async (roomID: string): Promise<CallState> => {
  const response = await api.post(`/start-call/${roomID}`);
  return response.data;
};

export const leaveCall = async (
  roomID: string,
  jwtToken: string | undefined
): Promise<boolean> => {
  const response = await api.get<boolean>(`/leave-call/${roomID}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  return response.data;
};

export const exitRoom = async (roomID: string): Promise<boolean> => {
  const response = await api.delete<boolean>(`/exit-room/${roomID}`);
  return response.data;
};

export const killCall = async (
  roomID: string,
  jwtToken: string | undefined
): Promise<boolean> => {
  const response = await api.get<boolean>(`/kill-room/${roomID}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  return response.data;
};

export const assignHost = async (
  roomID: string,
  currentHostID: string,
  selectedParticipantID: string
): Promise<string> => {
  const response = await api.post<string>(`/assign-host/${roomID}`, {
    current_host_id: currentHostID,
    new_host_id: selectedParticipantID,
  });

  return response.data;
};

export const getLvkToken = async (
  roomID: string,
  sessionID: string
): Promise<string> => {
  const response = await api.post<string>(`/lvk-token/${roomID}`, {
    session_id: sessionID,
  });

  return response.data;
};

export const getCallState = async (roomID: string): Promise<CallState> => {
  const response = await api.get<CallState>(`/call/${roomID}`);
  return response.data;
};

export const getMe = async (
  roomID: string,
  jwt: string
): Promise<Participant> => {
  const response = await api.post<Participant>(`/get-me/${roomID}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  return response.data;
};

// gets only the createdAt field
export const getRoomInfo = async (roomID: string): Promise<string> => {
  const response = await api.get<string>(`/room-info/${roomID}`);
  return response.data;
};

export const setParticipantCallData = async (
  roomID: string,
  username: string,
  avatar_src: string | null | undefined,
  jwtToken: string | undefined
): Promise<Participant> => {
  const response = await api.post<Participant>(
    `/set-participant-call-data/${roomID}`,
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
    const response = await api.get<Settings>(`/settings/${roomID}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return {
        strict_mode: false,
        invitation_expiry: '30',
        invite_permission: false,
      };
    }
  }
};

export const updateSettings = async (roomID: string, settings: Settings) => {
  try {
    const response = await api.post<UpdateSettings>(
      `/update-settings/${roomID}`,
      {
        settings,
      }
    );

    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getParticipants = async (
  roomID: string
): Promise<{
  participants: Participant[];
  participantsInCall: Participant[];
}> => {
  const response = await api.get<{
    participants: Participant[];
    participantsInCall: Participant[];
  }>(`http://localhost:8080/participants/${roomID}`);

  return {
    participants: response.data.participants,
    participantsInCall: response.data.participantsInCall,
  };
};

export const setSession = async (
  roomID: string,
  jwt: string | undefined
): Promise<string> => {
  const response = await api.post<string>(
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

export const validateInvitation = async (
  code: string | null,
  room_id: string | null
): Promise<Authorization> => {
  const response = await api.post<Authorization>(`/authorization`, {
    code,
    room_id,
  });

  return response.data;
};

export const getInvitationCode = async (roomID: string): Promise<string> => {
  const response = await axios.get<{ invitation: string }>(
    `http://localhost:8080/invitation-code/${roomID}`
  );

  return response.data.invitation;
};
