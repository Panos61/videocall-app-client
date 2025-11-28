import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { isUUIDv4 } from './isUUIDv4';
import { hasRoomAccess } from '@/api/client';
import { RoomKilledModal } from '@/features';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const { id: uuid } = useParams<{ id: string }>();

  if (!uuid) return null;

  useEffect(() => {
    if (!isUUIDv4(uuid)) {
      navigate('/whoops');
      return;
    }
    
    hasRoomAccess(uuid);
  }, [uuid, navigate]);

  return (
    <>
      {children ? children : <Outlet />}
      <RoomKilledModal />
    </>
  );
};

export default ProtectedRoute;
