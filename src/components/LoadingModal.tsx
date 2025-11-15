import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import '../styles/responsive.css';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  darkMode?: boolean;
  duration?: number; // Duración en milisegundos
  onComplete?: () => void; // Callback cuando termine el tiempo
  colorTheme?: 'yellow' | 'red' | 'blue'; // Tema de color: amarillo (default), rojo o azul
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message = 'Actualizando datos...', 
  darkMode = false,
  duration = 2000,
  onComplete,
  colorTheme = 'yellow' // Default amarillo para mantener compatibilidad
}) => {
  // Definir colores según el tema
  const colors = colorTheme === 'red' ? {
    spinnerBg: darkMode
      ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.2) 100%)',
    spinnerColor: darkMode ? '#ef4444' : '#dc2626',
    progressBar: darkMode
      ? 'linear-gradient(90deg, #ef4444, #f87171)'
      : 'linear-gradient(90deg, #dc2626, #ef4444)'
  } : colorTheme === 'blue' ? {
    spinnerBg: darkMode
      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.2) 100%)',
    spinnerColor: darkMode ? '#3b82f6' : '#2563eb',
    progressBar: darkMode
      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
      : 'linear-gradient(90deg, #2563eb, #3b82f6)'
  } : {
    spinnerBg: darkMode
      ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(202, 138, 4, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.2) 100%)',
    spinnerColor: darkMode ? '#eab308' : '#ca8a04',
    progressBar: darkMode
      ? 'linear-gradient(90deg, #eab308, #facc15)'
      : 'linear-gradient(90deg, #ca8a04, #eab308)'
  };
  useEffect(() => {
    if (isOpen && onComplete && duration > 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete, duration]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
        background: 'rgba(0, 0, 0, 0.65)',
        padding: '1rem'
      }}
    >
      <div 
        className="modal-content"
        style={{
          position: 'relative',
          width: 'auto',
          maxWidth: '400px',
          minWidth: '300px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          background: darkMode 
            ? 'var(--admin-card-bg, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          border: darkMode 
            ? '1px solid var(--admin-border, rgba(255,255,255,0.1))'
            : '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
          color: darkMode 
            ? 'var(--admin-text-primary, #fff)'
            : '#1f2937',
          animation: 'scaleIn 0.3s ease-out',
          margin: 'auto'
        }}
      >
        {/* Spinner animado */}
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: colors.spinnerBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: darkMode
            ? `0 0.5rem 1.5rem ${colorTheme === 'red' ? 'rgba(239, 68, 68, 0.2)' : colorTheme === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`
            : `0 0.5rem 1.5rem ${colorTheme === 'red' ? 'rgba(239, 68, 68, 0.15)' : colorTheme === 'blue' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)'}`
        }}>
          <Loader2 
            size={32} 
            color={colors.spinnerColor}
            style={{
              animation: 'spin 1s linear infinite'
            }}
          />
        </div>

        {/* Mensaje */}
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: darkMode 
              ? 'var(--admin-text-primary, #e2e8f0)'
              : '#1f2937',
            marginBottom: '0.375rem'
          }}>
            {message}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: darkMode 
              ? 'var(--admin-text-secondary, #94a3b8)'
              : '#6b7280',
            fontWeight: '500'
          }}>
            Por favor espera un momento
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{
          width: '100%',
          height: '4px',
          background: darkMode 
            ? 'var(--admin-input-bg, rgba(148, 163, 184, 0.2))'
            : 'rgba(203, 213, 225, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: colors.progressBar,
            borderRadius: '2px',
            animation: `progress ${duration}ms linear forwards`,
            transformOrigin: 'left'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default LoadingModal;
