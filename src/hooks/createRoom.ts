import { useNavigate } from 'react-router-dom';
import { createRoom, getInvitation } from '@/api';
import { useToast } from '@/components/ui/use-toast';

export const useHandleCreateRoom = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateRoom = async () => {
    try {
      const response = await createRoom();

      const roomID = response.id;
      const { jwt } = response.participants;

      localStorage.setItem('jwt_token', jwt);

      const invKey = await getInvitation(roomID);
      localStorage.setItem(`invitationKey_${roomID}`, invKey);

      toast({
        title: 'Created a room! 🎉',
        description: 'You can now join in. 🚀',
      });
      navigate(`/room/${roomID}`);
      console.log(response);
    } catch (error) {
      console.error('err: ', error);
    }
  };

  return { handleCreateRoom };
};
