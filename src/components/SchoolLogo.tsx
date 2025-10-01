import React from 'react';

interface SchoolLogoProps {
  size?: number;
  darkMode?: boolean;
  className?: string;
}

const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  size = 48, 
  darkMode = false, 
  className = '' 
}) => {
  return (
    <div 
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <img 
        src="https://res.cloudinary.com/di090ggjn/image/upload/v1757037016/clbfrmifo1mbpzma5qts.png"
        alt="Jessica Vélez - Escuela de Esteticistas"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '12px',
          filter: darkMode 
            ? 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.4)) brightness(1.1)' 
            : 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3)) brightness(0.95)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'scale(1.05)';
          el.style.filter = darkMode 
            ? 'drop-shadow(0 6px 20px rgba(251, 191, 36, 0.6)) brightness(1.2)' 
            : 'drop-shadow(0 6px 20px rgba(251, 191, 36, 0.5)) brightness(0.9)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.transform = 'scale(1)';
          el.style.filter = darkMode 
            ? 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.4)) brightness(1.1)' 
            : 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3)) brightness(0.95)';
        }}
      />
    </div>
  );
};

export default SchoolLogo;
