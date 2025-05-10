import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MediaProvider, SignallingProvider } from './context';
import { Home, Lobby, RoomV2, InvitationValidation } from './views';
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
      element: <RoomV2 />,
    },
    {
      path: '/room-invite',
      element: <InvitationValidation />,
    },
  ]);

  return (
    <SignallingProvider>
      <MediaProvider>
        <RouterProvider router={router} />
        <Toaster />
      </MediaProvider>
    </SignallingProvider>
  );
};

export default App;
