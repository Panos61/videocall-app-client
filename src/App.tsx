import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MediaProvider, SessionProvider } from './context';
import { Home, Lobby, Room, InvitationValidation } from './views';
import { Toaster } from '@/components/ui/toaster';

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
    <SessionProvider>
      <MediaProvider>
        <RouterProvider router={router} />
        <Toaster />
      </MediaProvider>
    </SessionProvider>
  );
};

export default App;
