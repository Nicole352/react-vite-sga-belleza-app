import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Redirigiendo...
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  if (user) {
    switch (user.rol) {
      case 'superadmin':
        return <Navigate to="/panel/superadmin" replace />;
      case 'administrativo':
        return <Navigate to="/panel/administrativo" replace />;
      case 'estudiante':
        // Cuando implementes el panel de estudiantes
        return <Navigate to="/aula-virtual" replace />;
      case 'docente':
        // Cuando implementes el panel de docentes
        return <Navigate to="/aula-virtual" replace />;
      default:
        // Si no reconoce el rol, redirigir a inicio
        return <Navigate to="/" replace />;
    }
  }

  // Fallback
  return <Navigate to="/" replace />;
};

export default RoleRedirect;