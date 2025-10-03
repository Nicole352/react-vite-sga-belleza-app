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
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    color: darkMode ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.85)',
    textDecoration: 'none',
    position: 'relative',
    padding: '12px 18px',
    textShadow: darkMode ? '0 1px 2px rgba(0, 0, 0, 0.3)' : '0 1px 2px rgba(255, 255, 255, 0.8)',
    transform: 'translateY(0)',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    background: darkMode 
      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)'
      : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
    borderRadius: '12px',
    border: darkMode 
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: darkMode
      ? '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    ...style
  };

  return (
    <>
      <button
        onClick={handleLogout}
        className={`logout-button ${className || ''}`}
        style={buttonStyle}
      >
        <LogOut size={16} />
        <span>Cerrar Sesión</span>
      </button>

      <style>{`
        .logout-button {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative !important;
        }
        
        .logout-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: ${darkMode 
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)'};
          transition: left 0.6s ease;
          border-radius: 12px;
        }
        
        .logout-button:hover::before {
          left: 100%;
        }
        
        .logout-button:hover {
          background: ${darkMode 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.04) 0%, rgba(0, 0, 0, 0.02) 100%)'} !important;
          transform: translateX(6px) translateY(-1px) !important;
          color: ${darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)'} !important;
          border-color: ${darkMode 
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(0, 0, 0, 0.12)'} !important;
          box-shadow: ${darkMode
            ? '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 0 1px rgba(0, 0, 0, 0.05)'} !important;
          backdrop-filter: blur(25px) saturate(200%) !important;
        }
        
        .logout-button:active {
          transform: translateX(3px) translateY(0px) scale(0.98) !important;
          background: ${darkMode 
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)'
            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.06) 0%, rgba(0, 0, 0, 0.03) 100%)'} !important;
          box-shadow: ${darkMode
            ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(0, 0, 0, 0.2)'
            : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.1)'} !important;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .logout-button svg {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }
        
        .logout-button:hover svg {
          transform: rotate(-5deg) scale(1.05) !important;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }
        
        .logout-button span {
          position: relative;
          z-index: 2;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .logout-button:hover span {
          transform: translateX(1px) !important;
        }
      `}</style>
    </>
  );
};

export default LogoutButton;
