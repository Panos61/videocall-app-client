import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  MediaControlProvider,
  SessionProvider,
  SettingsProvider,
} from './context';
import { Home, Lobby, Room, InvitationValidation } from './views';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient: QueryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/room/:id',
      element: <Lobby />,
    },
    {
      path: '/room/:id/call',
      element: <Room />,
    },
    {
      path: '/room-invite',
      element: <InvitationValidation />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SettingsProvider>
          <MediaControlProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>
            <Toaster />
          </MediaControlProvider>
        </SettingsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
