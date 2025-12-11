import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import {
  SystemEventsProvider,
  UserEventsProvider,
  SettingsProvider,
  MediaControlProvider,
  PreferencesProvider,
} from './context';
import ProtectedRoute from './utils/protected-route';

// import { Toaster } from '@/components/ui/toaster';s
import { Toaster as SonnerToaster } from 'sonner';
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
      <SystemEventsProvider>
        <SettingsProvider>
          <UserEventsProvider>
            <MediaControlProvider>
              <PreferencesProvider>
                <TooltipProvider>
                  <RouterProvider router={router} />
                </TooltipProvider>
                {/* <Toaster /> */}
                <SonnerToaster richColors position='top-center' />
              </PreferencesProvider>
            </MediaControlProvider>
          </UserEventsProvider>
        </SettingsProvider>
      </SystemEventsProvider>
    </QueryClientProvider>
  );
};

export default App;
