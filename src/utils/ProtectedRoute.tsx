import { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { isUUIDv4 } from './isUUIDv4';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const navigate = useNavigate();
  const { id: uuid } = useParams<{ id: string }>();

  if (!uuid) return null;

  useEffect(() => {
    if (!isUUIDv4(uuid)) {
      navigate('/whoops');
    }
  }, [uuid, navigate]);

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
