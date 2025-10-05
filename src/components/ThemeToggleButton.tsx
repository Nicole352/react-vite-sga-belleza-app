import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: theme === 'dark' 
      ? '1.5px solid rgba(251, 191, 36, 0.3)' 
      : '1.5px solid rgba(31, 41, 55, 0.15)',
    background: theme === 'dark'
      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 250, 251, 0.9))',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: theme === 'dark'
      ? '0 4px 15px rgba(251, 191, 36, 0.15)'
      : '0 4px 15px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  };

  const iconStyle: React.CSSProperties = {
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    color: theme === 'dark' ? '#fbbf24' : '#1f2937',
    filter: theme === 'dark' 
      ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' 
      : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
  };

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      className="theme-toggle-btn"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun size={20} style={iconStyle} />
      ) : (
        <Moon size={20} style={iconStyle} />
      )}
      
      <style>{`
        .theme-toggle-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: ${theme === 'dark' 
            ? '0 6px 25px rgba(251, 191, 36, 0.3)' 
            : '0 6px 25px rgba(0, 0, 0, 0.15)'} !important;
          border-color: ${theme === 'dark' 
            ? 'rgba(251, 191, 36, 0.5)' 
            : 'rgba(31, 41, 55, 0.25)'} !important;
        }
        
        .theme-toggle-btn:active {
          transform: translateY(0) scale(0.98);
        }
        
        .theme-toggle-btn svg {
          animation: iconRotate 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes iconRotate {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0;
          }
          50% {
            transform: rotate(180deg) scale(0.8);
            opacity: 0.5;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
};

export default ThemeToggleButton;
