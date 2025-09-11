import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Este efecto se ejecuta cuando el componente se monta
    // Útil para logging o analytics
    if (user) {
      console.log(`Usuario ${user.nombre} (${user.rol}) accediendo al dashboard`);
    }
  }, [user]);

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
            Redirigiendo...
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Detectando rol de usuario
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
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  switch (user.rol) {
    case 'superadmin':
      return <Navigate to="/panel/superadmin" replace />;
    
    case 'administrativo':
      return <Navigate to="/panel/administrativo" replace />;
    
    case 'docente':
      // Cuando implementes el panel de docentes
      return <Navigate to="/panel/docente" replace />;
    
    case 'estudiante':
      // Cuando implementes el panel de estudiantes
      return <Navigate to="/panel/estudiante" replace />;
    
    default:
      // Rol no reconocido, mostrar error
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
              Rol No Reconocido
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '24px', lineHeight: 1.6 }}>
              Tu rol "{user.rol}" no tiene un panel asignado. 
              <br />
              Contacta al administrador para más información.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.href = '/'}
                style={{
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
                Ir al Inicio
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      );
  }
};

export default RoleRedirect;