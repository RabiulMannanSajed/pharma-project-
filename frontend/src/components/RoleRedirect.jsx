import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

export const RoleRedirect = () => {
  const { isAuthenticated, role, bootstrapping } = useAuth();

  if (bootstrapping) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (role === ROLES.ADMIN) return <Navigate to="/admin/dashboard" replace />;
  if (role === ROLES.SALESMAN) return <Navigate to="/salesman/dashboard" replace />;

  return <Navigate to="/login" replace />;
};