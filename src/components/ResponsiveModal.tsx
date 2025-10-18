import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useBreakpoints } from '../hooks/useMediaQuery';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
}

const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '600px',
  showCloseButton = true
}) => {
  const { isMobile, isSmallScreen } = useBreakpoints();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: isSmallScreen ? 'flex-end' : 'center',
          justifyContent: 'center',
          padding: isSmallScreen ? '0' : '20px',
          pointerEvents: 'none'
        }}
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="responsive-modal"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: isSmallScreen ? '20px 20px 0 0' : '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            width: isSmallScreen ? '100%' : '90%',
            maxWidth: isSmallScreen ? '100%' : maxWidth,
            maxHeight: isSmallScreen ? '90vh' : '85vh',
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
            animation: isSmallScreen ? 'slideUp 0.3s ease-out' : 'scaleIn 0.3s ease-out',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '16px' : '20px 24px',
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
              flexShrink: 0
            }}
          >
            <h3
              style={{
                color: '#fff',
                fontSize: isMobile ? '1.1rem' : '1.3rem',
                fontWeight: '700',
                margin: 0,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
              }}
            >
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                style={{
                  width: isMobile ? '32px' : '36px',
                  height: isMobile ? '32px' : '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <X size={isMobile ? 18 : 20} />
              </button>
            )}
          </div>

          {/* Body */}
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              overflowY: 'auto',
              flex: 1,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar personalizado para el modal */
        .responsive-modal::-webkit-scrollbar {
          width: 8px;
        }
        
        .responsive-modal::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
        }
        
        .responsive-modal::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 4px;
        }
        
        .responsive-modal::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </>
  );
};

export default ResponsiveModal;
