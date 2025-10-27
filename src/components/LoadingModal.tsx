import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  darkMode?: boolean;
  duration?: number; // Duración en milisegundos
  onComplete?: () => void; // Callback cuando termine el tiempo
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message = 'Actualizando datos...', 
  darkMode = false,
  duration = 2000,
  onComplete 
}) => {
  useEffect(() => {
    if (isOpen && onComplete && duration > 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onComplete, duration]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <div style={{
        background: darkMode 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '1rem',
        border: darkMode 
          ? '1px solid rgba(148, 163, 184, 0.2)' 
          : '1px solid rgba(203, 213, 225, 0.3)',
        padding: '2rem',
        minWidth: '300px',
        maxWidth: '400px',
        boxShadow: darkMode 
          ? '0 1.5rem 3rem rgba(0, 0, 0, 0.5)' 
          : '0 1.5rem 3rem rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        animation: 'scaleIn 0.3s ease-out'
      }}>
        {/* Spinner animado */}
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 197, 253, 0.2) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: darkMode
            ? '0 0.5rem 1.5rem rgba(59, 130, 246, 0.2)'
            : '0 0.5rem 1.5rem rgba(59, 130, 246, 0.15)'
        }}>
          <Loader2 
            size={32} 
            color={darkMode ? '#60a5fa' : '#3b82f6'}
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
            color: darkMode ? '#e2e8f0' : '#1e293b',
            marginBottom: '0.375rem'
          }}>
            {message}
          </div>
          <div style={{
            fontSize: '0.8125rem',
            color: darkMode ? '#94a3b8' : '#64748b',
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
            ? 'rgba(148, 163, 184, 0.2)' 
            : 'rgba(203, 213, 225, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: darkMode
              ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
              : 'linear-gradient(90deg, #3b82f6, #2563eb)',
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
    </div>
  );
};

export default LoadingModal;
