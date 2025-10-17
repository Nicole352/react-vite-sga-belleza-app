import React, { ReactNode, CSSProperties } from 'react';

interface GlassEffectProps {
  children: ReactNode;
  variant?: 'card' | 'modal' | 'sidebar' | 'navbar' | 'button' | 'input';
  intensity?: 'light' | 'medium' | 'strong';
  tint?: 'red' | 'neutral' | 'success' | 'warning' | 'error';
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  animated?: boolean;
}

// Paleta de colores iOS 26 con efectos glass
const iOS26Colors = {
  red: {
    light: 'rgba(239, 68, 68, 0.08)',
    medium: 'rgba(239, 68, 68, 0.12)',
    strong: 'rgba(239, 68, 68, 0.18)',
    border: 'rgba(239, 68, 68, 0.2)',
    glow: 'rgba(239, 68, 68, 0.4)',
  },
  neutral: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(255, 255, 255, 0.3)',
  },
  success: {
    light: 'rgba(220, 38, 38, 0.06)',   // Rojo suave en lugar de verde
    medium: 'rgba(220, 38, 38, 0.10)',
    strong: 'rgba(220, 38, 38, 0.15)',
    border: 'rgba(220, 38, 38, 0.18)',
    glow: 'rgba(220, 38, 38, 0.35)',
  },
  warning: {
    light: 'rgba(248, 113, 113, 0.06)',  // Rojo medio en lugar de amarillo
    medium: 'rgba(248, 113, 113, 0.10)',
    strong: 'rgba(248, 113, 113, 0.15)',
    border: 'rgba(248, 113, 113, 0.18)',
    glow: 'rgba(248, 113, 113, 0.35)',
  },
  error: {
    light: 'rgba(185, 28, 28, 0.08)',   // Rojo oscuro
    medium: 'rgba(185, 28, 28, 0.12)',
    strong: 'rgba(185, 28, 28, 0.18)',
    border: 'rgba(185, 28, 28, 0.22)',
    glow: 'rgba(185, 28, 28, 0.4)',
  }
};

const GlassEffect: React.FC<GlassEffectProps> = ({
  children,
  variant = 'card',
  intensity = 'medium',
  tint = 'red',
  className = '',
  style = {},
  onClick,
  hover = false,
  animated = true
}) => {
  
  const colorScheme = iOS26Colors[tint];
  
  const getVariantStyles = (): CSSProperties => {
    const baseStyles: CSSProperties = {
      background: `linear-gradient(135deg, ${colorScheme[intensity]}, ${colorScheme.light})`,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: `1px solid rgba(239, 68, 68, 0.2)`,
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.1)
      `,
      position: 'relative',
      overflow: 'hidden',
    };

    // Estilos específicos por variante
    switch (variant) {
      case 'card':
        return {
          ...baseStyles,
          borderRadius: '20px',
          padding: '24px',
          transition: animated ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        };
      
      case 'modal':
        return {
          ...baseStyles,
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          transition: animated ? 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        };
      
      case 'sidebar':
        return {
          ...baseStyles,
          borderRadius: '0 20px 20px 0',
          padding: '20px',
          minHeight: '100vh',
          transition: animated ? 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
        };
      
      case 'navbar':
        return {
          ...baseStyles,
          borderRadius: '0 0 16px 16px',
          padding: '16px 24px',
          transition: animated ? 'all 0.3s ease-out' : 'none',
        };
      
      case 'button':
        return {
          ...baseStyles,
          borderRadius: '12px',
          padding: '12px 20px',
          cursor: 'pointer',
          transition: animated ? 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          transform: 'translateZ(0)',
        };
      
      case 'input':
        return {
          ...baseStyles,
          borderRadius: '12px',
          padding: '12px 16px',
          transition: animated ? 'all 0.2s ease-in-out' : 'none',
        };
      
      default:
        return baseStyles;
    }
  };

  const getHoverStyles = (): CSSProperties => {
    if (!hover) return {};
    
    return {
      transform: variant === 'button' ? 'translateY(-2px) scale(1.02)' : 'translateY(-4px)',
      boxShadow: `
        0 16px 48px rgba(0, 0, 0, 0.18),
        0 4px 16px rgba(0, 0, 0, 0.12),
        0 0 0 1px ${colorScheme.glow},
        inset 0 1px 0 rgba(255, 255, 255, 0.15)
      `,
      background: `linear-gradient(135deg, ${colorScheme.medium}, ${colorScheme[intensity]})`,
    };
  };

  const glassStyles: CSSProperties = {
    ...getVariantStyles(),
    ...style,
  };

  // Efecto de brillo deshabilitado - Sin olita
  const shimmerEffect: CSSProperties = {
    display: 'none',
  };

  return (
    <div
      className={`glass-effect ${className}`}
      style={glassStyles}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover && animated) {
          Object.assign(e.currentTarget.style, getHoverStyles());
        }
      }}
      onMouseLeave={(e) => {
        if (hover && animated) {
          Object.assign(e.currentTarget.style, getVariantStyles());
        }
      }}
    >
      {/* Efecto de brillo */}
      {animated && <div style={shimmerEffect} />}
      
      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
      
      {/* CSS Animations - Sin shimmer */}
      <style>{`
        .glass-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.02) 50%, transparent 70%);
          pointer-events: none;
          border-radius: inherit;
        }
        
        .glass-effect:hover::before {
          background: linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.05) 50%, transparent 80%);
        }
      `}</style>
    </div>
  );
};

export default GlassEffect;
