import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Cargando sesión...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirigir a dashboard si no tiene permisos de admin
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
