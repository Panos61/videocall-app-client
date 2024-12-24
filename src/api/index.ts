import axios from 'axios';
import type {
  CreateRoomResponse,
  JoinRoomResponse,
  LeaveRoomResponse,
  SetInvKeyResponse,
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

export const joinRoom = async (invKey: string) => {
  const response = await axios.post<JoinRoomResponse>(
    'http://localhost:8080/join-room',
    {
      invKey,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  console.log('🚀 ~ joinRoom ~ response.data:', response.data);
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

  console.log('leftRoom', response.data);

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

export const setInvitationKey = async (roomID: string) => {
  const response = await axios.get<SetInvKeyResponse>(
    `http://localhost:8080/room-invitation/${roomID}`,
    { headers: { 'Content-Type': 'application/json' } }
  );

  return response.data.invitationKey;
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

// export const authorizeInvKey = async (keyInput: string) => {
//   const response = await axios.post<AuthInviteResponse>(
//     `http://localhost:8080/authorize-invite`,
//     {
//       keyInput,
//     },
//     { headers: { 'Content-Type': 'application/json' } }
//   );

//   return response.data;
// };
