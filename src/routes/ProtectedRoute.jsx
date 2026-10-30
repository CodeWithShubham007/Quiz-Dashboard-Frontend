import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/auth'} replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    const homePath = user.role === 'admin'
      ? '/admin'
      : user.role === 'faculty'
        ? '/faculty/dashboard'
        : '/student/dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
};

export default ProtectedRoute;
