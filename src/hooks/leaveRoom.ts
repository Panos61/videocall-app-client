import { useNavigate, useLocation } from 'react-router-dom';
import { leaveRoom } from '@/api';
import { ConnectionSocket } from '@/views/Room/signalling';

export const useWSDisconnect = (ws: ConnectionSocket) => {
  const handleSendDisconnect = (roomID: string) => {
     ws.send('disconnect', roomID);
  };

  return { handleSendDisconnect };
};

export const useHandleLeaveRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLeaveRoom = async () => {
    const roomID: string = location.pathname.split('/')[2];
    const jwt: string | null = localStorage.getItem('jwt_token');

    try {
      const response = await leaveRoom(roomID, jwt);
      console.log('leave resp: ', response);

      localStorage.removeItem('jwt_token');
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return { handleLeaveRoom };
};
