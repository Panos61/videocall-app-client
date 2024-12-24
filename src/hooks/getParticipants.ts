import { getRoomParticipants } from '@/api';

export const useGetParticipants = () => {
  const handleGetParticipants = async (roomID: string) => {
    try {
      const response = await getRoomParticipants(roomID);
      console.log('response', response);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return { handleGetParticipants };
};
