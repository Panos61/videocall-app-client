import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RoomProvider, MediaProvider, WebSocketProvider } from './context';
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
    <WebSocketProvider>
      <RoomProvider>
        <MediaProvider>
          <RouterProvider router={router} />
          <Toaster />
        </MediaProvider>
      </RoomProvider>
    </WebSocketProvider>
  );
};

export default App;
