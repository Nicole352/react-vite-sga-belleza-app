import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: string[]; // e.g., ['superadmin']
}

// Very simple guard using localStorage. In a real app consider context or state manager
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowRoles }) => {
  const raw = typeof window !== 'undefined' ? sessionStorage.getItem('auth_user') : null;
  if (!raw) return <Navigate to="/aula-virtual" replace />;
  try {
    const user = JSON.parse(raw);
    if (allowRoles && !allowRoles.includes(user?.rol)) {
      return <Navigate to="/aula-virtual" replace />;
    }
  } catch {
    return <Navigate to="/aula-virtual" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
