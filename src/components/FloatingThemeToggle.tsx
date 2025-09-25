import React from 'react';
import ThemeToggle from './ThemeToggle';

/**
 * FloatingThemeToggle
 * Botón flotante en la esquina superior izquierda, justo debajo del header.
 * Si necesitas ajustar la altura del header, puedes definir en CSS:
 *   html { --header-h: 72px; }
 */
const FloatingThemeToggle: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 'calc(var(--header-h, 72px) + 8px)', // Ajusta 72px si tu header es más alto o bajo
    left: '12px',
    zIndex: 1000,
  };

  return (
    <div style={containerStyle}>
      <ThemeToggle />
    </div>
  );
};

export default FloatingThemeToggle;
