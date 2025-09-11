import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            <Sparkles size={36} color="#000" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '12px' }}>
            Verificando acceso...
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Por favor espera un momento
          </p>
        </div>
        <style>
          {`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}
        </style>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene el rol requerido
  if (allowRoles.length > 0 && user && !allowRoles.includes(user.rol)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '24px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Sparkles size={36} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '16px', color: '#ef4444' }}>
            Acceso Denegado
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '24px', lineHeight: 1.6 }}>
            No tienes permisos para acceder a esta sección. Tu rol actual es: <strong>{user.rol}</strong>
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            Roles requeridos: {allowRoles.join(', ')}
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              marginTop: '24px',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;