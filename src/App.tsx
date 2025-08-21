import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  MediaControlProvider,
  PreferencesProvider,
  SessionProvider,
  SettingsProvider,
  EventsProvider,
} from './context';
import ProtectedRoute from './utils/ProtectedRoute';

import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Home,
  Authorization,
  Lobby,
  Room,
  PostCall,
  Invalid,
  NotFound,
} from './views';

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
      element: (
        <ProtectedRoute>
          <Lobby />
        </ProtectedRoute>
      ),
    },
    {
      path: '/room/:id/call',
      element: (
        <ProtectedRoute>
          <Room />
        </ProtectedRoute>
      ),
    },
    {
      path: '/room/:id/post-call',
      element: (
        <ProtectedRoute>
          <PostCall />
        </ProtectedRoute>
      ),
    },
    {
      path: '/whoops',
      element: <Invalid />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SettingsProvider>
          <EventsProvider>
            <PreferencesProvider>
              <MediaControlProvider>
                <TooltipProvider>
                  <RouterProvider router={router} />
                </TooltipProvider>
                <Toaster />
              </MediaControlProvider>
            </PreferencesProvider>
          </EventsProvider>
        </SettingsProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;
