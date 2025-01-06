import { joinRoom } from '@/api';
import { useToast } from '@/components/ui/use-toast';

export const useHandleJoinRoom = () => {
  const { toast } = useToast();

  const handleJoinRoom = async (roomID: string) => {
    try {
      const response = await joinRoom(roomID);

      const jwtToken = response.participant.jwt;
      localStorage.setItem('jwt_token', jwtToken);

      toast({
        title: 'Successfully joined in! 🎉',
      });
    } catch (error) {
      console.log(error);
    }
  };

  return { handleJoinRoom };
};
