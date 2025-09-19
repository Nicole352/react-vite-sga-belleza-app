import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  style?: React.CSSProperties;
  darkMode?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className, style, darkMode = true }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar datos de sesión
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Redirigir al login de aula virtual
    navigate('/aula-virtual');
  };

  const buttonStyle: React.CSSProperties = {
    fontWeight: '700',
    fontSize: '16px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    color: darkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.9)',
    textDecoration: 'none',
    position: 'relative',
    padding: '12px 20px',
    textShadow: 'none',
    transform: 'translateY(0)',
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    background: darkMode 
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05))',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    backdropFilter: 'blur(10px)',
    boxShadow: darkMode 
      ? '0 4px 20px rgba(239, 68, 68, 0.2)' 
      : '0 4px 20px rgba(239, 68, 68, 0.1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...style
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className={`logout-button ${className || ''}`}
        style={buttonStyle}
      >
        <LogOut size={18} />
        <span>Cerrar Sesión</span>
      </button>

      <style>{`
        .logout-button {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .logout-button:hover {
          background: ${darkMode 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.2))' 
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))'} !important;
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: ${darkMode 
            ? '0 8px 30px rgba(239, 68, 68, 0.4)' 
            : '0 8px 30px rgba(239, 68, 68, 0.2)'} !important;
          border-color: rgba(239, 68, 68, 0.6) !important;
          color: #ef4444 !important;
          text-shadow: ${darkMode 
            ? '0 0 15px rgba(239, 68, 68, 0.6)' 
            : '0 0 10px rgba(239, 68, 68, 0.3)'} !important;
        }
        .logout-button:active {
          transform: translateY(-1px) scale(1.02) !important;
          box-shadow: ${darkMode 
            ? '0 4px 15px rgba(239, 68, 68, 0.3)' 
            : '0 4px 15px rgba(239, 68, 68, 0.15)'} !important;
        }
      `}</style>
    </>
  );
};

export default LogoutButton;
