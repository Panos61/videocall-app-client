import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RoomProvider, MediaProvider } from './context';
import { Home, Lobby, Room } from './views';
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
  ]);

  return (
    <RoomProvider>
      <MediaProvider>
        <RouterProvider router={router} />
        <Toaster />
      </MediaProvider>
    </RoomProvider>
  );
};

export default App;
