import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const buttonStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '42px',
    height: '42px',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: theme === 'dark'
      ? 'linear-gradient(135deg, rgba(60, 60, 60, 0.4), rgba(50, 50, 50, 0.35))'
      : 'linear-gradient(135deg, rgba(245, 245, 245, 0.6), rgba(235, 235, 235, 0.5))',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    boxShadow: theme === 'dark'
      ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
    overflow: 'hidden',
    transform: isPressed ? 'scale(0.97)' : 'scale(1)',
  };

  return (
    <button
      onClick={toggleTheme}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={buttonStyle}
      className="theme-toggle-btn-ios26"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {/* Shimmer effect */}
      <div className="shimmer-overlay-btn" />
      
      {/* Ícono de círculo dividido verticalmente (blanco/negro) */}
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 26 26" 
        fill="none"
        style={{
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        }}
      >
        {/* Círculo completo con borde */}
        <circle 
          cx="13" 
          cy="13" 
          r="11" 
          fill="none" 
          stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} 
          strokeWidth="1"
        />
        
        {/* Mitad izquierda - Blanca */}
        <path
          d="M 13 2 A 11 11 0 0 1 13 24 Z"
          fill={theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.95)'}
        />
        
        {/* Mitad derecha - Negra */}
        <path
          d="M 13 2 A 11 11 0 0 0 13 24 Z"
          fill={theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(40, 40, 40, 0.85)'}
        />
        
        {/* Línea divisoria central */}
        <line
          x1="13"
          y1="2"
          x2="13"
          y2="24"
          stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}
          strokeWidth="0.5"
        />
      </svg>
      
      <style>{`
        /* Shimmer effect en el botón */
        @keyframes btnShimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        .shimmer-overlay-btn {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          animation: btnShimmer 6s ease-in-out infinite;
          pointer-events: none;
          transform: skewX(-20deg);
        }
        
        /* Hover effect con brillo sutil en el borde */
        .theme-toggle-btn-ios26:hover {
          transform: scale(1.0) !important;
          background: ${theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(70, 70, 70, 0.5), rgba(60, 60, 60, 0.45))' 
            : 'linear-gradient(135deg, rgba(250, 250, 250, 0.7), rgba(240, 240, 240, 0.6))'} !important;
          backdrop-filter: blur(24px) saturate(200%) !important;
          box-shadow: ${theme === 'dark' 
            ? '0 10px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.15)' 
            : '0 10px 28px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.3)'} !important;
          border-color: ${theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(255, 255, 255, 0.4)'} !important;
        }
        
        .theme-toggle-btn-ios26:hover svg {
          transform: scale(1.02) rotate(2deg);
        }
        
        /* Active/Press effect - escala 0.97 */
        .theme-toggle-btn-ios26:active {
          transform: scale(0.97) !important;
        }
        
        /* Animación del ícono al cambiar */
        .theme-toggle-btn-ios26 svg {
          animation: iconFadeRotate 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform, opacity;
        }
        
        @keyframes iconFadeRotate {
          0% {
            transform: rotate(-45deg) scale(0.7);
            opacity: 0;
          }
          50% {
            transform: rotate(0deg) scale(1.05);
            opacity: 0.4;
          }
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.75;
          }
        }
        
        /* Glow effect sutil */
        .theme-toggle-btn-ios26::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, ${theme === 'dark' 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(251, 191, 36, 0.08)'}, transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          pointer-events: none;
        }
        
        .theme-toggle-btn-ios26:hover::after {
          opacity: 1;
        }
        
        /* Optimización de performance */
        .theme-toggle-btn-ios26 {
          will-change: transform, background, box-shadow;
        }
      `}</style>
    </button>
  );
};

export default ThemeToggleButton;
