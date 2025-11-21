import { QueryClient } from '@tanstack/react-query';

// invalidate cached data when host is updated
export const handleHostUpdated = (queryClient: QueryClient, roomId: string) => {
  queryClient.invalidateQueries({ queryKey: ['call-participants', roomId] });
  queryClient.invalidateQueries({ queryKey: ['me', roomId] });
};

// invalidate cached data when host leaves
export const handleHostLeft = (queryClient: QueryClient, roomId: string) => {
  queryClient.invalidateQueries({ queryKey: ['call-participants', roomId] });
  queryClient.invalidateQueries({ queryKey: ['me', roomId] });
};
