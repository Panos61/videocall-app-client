import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  MediaControlProvider,
  PreferencesProvider,
  SessionProvider,
  SettingsProvider,
} from './context';
import { Home, Authorization, Lobby, Room, PostCall } from './views';
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
      path: '/room-invite',
      element: <Authorization />,
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
      path: '/room/:id/post-call',
      element: <PostCall />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SettingsProvider>
          <PreferencesProvider>
            <MediaControlProvider>
              <TooltipProvider>
                <RouterProvider router={router} />
              </TooltipProvider>
              <Toaster />
            </MediaControlProvider>
          </PreferencesProvider>
        </SettingsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
