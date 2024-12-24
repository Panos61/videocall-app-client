import { useNavigate } from 'react-router-dom';
import { joinRoom } from '@/api';
import { useToast } from '@/components/ui/use-toast';

export const useHandleJoinRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinRoom = async (invKey: string) => {
    try {
      const response = await joinRoom(invKey);
      console.log(response);
      const roomID = response.room_id;
      const jwtToken = response.participant.jwt;

      localStorage.setItem('jwt_token', jwtToken);
      navigate(`/room/${roomID}`);

      toast({
        title: 'Valid key ✅',
        description: 'Successfully joined in! 🎉',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return { handleJoinRoom };
};
