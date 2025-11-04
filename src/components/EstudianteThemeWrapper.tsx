import React from 'react';

interface EstudianteThemeWrapperProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

const EstudianteThemeWrapper: React.FC<EstudianteThemeWrapperProps> = ({ children, darkMode = false }) => {
  const theme = darkMode ? {
    textPrimary: '#fff',
    textSecondary: 'rgba(255,255,255,0.8)',
    textMuted: 'rgba(255,255,255,0.7)',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
    border: 'rgba(251, 191, 36, 0.2)', // DORADO
    inputBg: 'rgba(255,255,255,0.1)',
    inputBorder: 'rgba(255,255,255,0.2)',
    hoverBg: 'rgba(255,255,255,0.05)',
    modalBg: 'rgba(0,0,0,0.7)'
  } : {
    textPrimary: '#1e293b',
    textSecondary: 'rgba(30,41,59,0.8)',
    textMuted: 'rgba(30,41,59,0.7)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    contentBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
    border: 'rgba(251, 191, 36, 0.2)', // DORADO
    inputBg: 'rgba(0,0,0,0.05)',
    inputBorder: 'rgba(0,0,0,0.15)',
    hoverBg: 'rgba(0,0,0,0.05)',
    modalBg: 'rgba(240,240,240,0.75)'
  };

  return (
    <>
      <style>{`
        .estudiante-theme-wrapper {
          --theme-text-primary: ${theme.textPrimary};
          --theme-text-secondary: ${theme.textSecondary};
          --theme-text-muted: ${theme.textMuted};
          --theme-bg-content: ${theme.contentBg};
          --theme-card-bg: ${theme.contentBg};
          --theme-border: ${theme.border};
          --theme-input-bg: ${theme.inputBg};
          --theme-input-border: ${theme.inputBorder};
          --theme-hover-bg: ${theme.hoverBg};
          --theme-modal-bg: ${theme.modalBg};
        }
        
        /* Colores para títulos */
        .estudiante-theme-wrapper h1,
        .estudiante-theme-wrapper h2,
        .estudiante-theme-wrapper h3,
        .estudiante-theme-wrapper h4,
        .estudiante-theme-wrapper h5,
        .estudiante-theme-wrapper h6 {
          color: var(--theme-text-primary) !important;
        }
        
        /* Colores para contenido general */
        .estudiante-theme-wrapper p,
        .estudiante-theme-wrapper span,
        .estudiante-theme-wrapper div {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Forzar colores específicos para elementos problemáticos */
        .estudiante-theme-wrapper * {
          color: var(--theme-text-secondary) !important;
        }
        
        .estudiante-theme-wrapper h1 *,
        .estudiante-theme-wrapper h2 *,
        .estudiante-theme-wrapper h3 *,
        .estudiante-theme-wrapper h4 *,
        .estudiante-theme-wrapper h5 *,
        .estudiante-theme-wrapper h6 * {
          color: var(--theme-text-primary) !important;
        }
        
        .estudiante-theme-wrapper input,
        .estudiante-theme-wrapper textarea,
        .estudiante-theme-wrapper select {
          background: var(--theme-input-bg) !important;
          border: 1px solid var(--theme-input-border) !important;
          color: var(--theme-text-primary) !important;
        }
        
        /* Estilos específicos para select y sus opciones */
        .estudiante-theme-wrapper select {
          background: ${darkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)'} !important;
          border: ${darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          font-family: inherit !important;
        }
        
        .estudiante-theme-wrapper select option {
          background: ${darkMode ? '#111' : '#fff'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          padding: 8px !important;
          border: none !important;
        }
        
        .estudiante-theme-wrapper select option:disabled {
          background: ${darkMode ? '#111' : '#f8f9fa'} !important;
          color: ${darkMode ? '#bbb' : '#6b7280'} !important;
        }
        
        .estudiante-theme-wrapper select option:hover,
        .estudiante-theme-wrapper select option:focus {
          background: ${darkMode ? '#333' : '#f0f0f0'} !important;
        }
        
        .estudiante-theme-wrapper select option:checked {
          background: ${darkMode ? '#444' : '#e5e7eb'} !important;
        }
        
        .estudiante-theme-wrapper input::placeholder,
        .estudiante-theme-wrapper textarea::placeholder {
          color: var(--theme-text-muted) !important;
        }
        
        /* Backgrounds de contenedores */
        .estudiante-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.9)"],
        .estudiante-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.95)"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Modales */
        .estudiante-theme-wrapper div[data-modal-overlay="true"] {
          background: var(--theme-modal-bg) !important;
        }
        
        .estudiante-theme-wrapper div[style*="position: fixed"][style*="zIndex: 9999"],
        .estudiante-theme-wrapper div[style*="position: fixed"][style*="z-index: 9999"] {
          background: var(--theme-modal-bg) !important;
        }
        
        /* Bordes - DORADO en lugar de rojo o azul */
        .estudiante-theme-wrapper [style*="border: 1px solid"],
        .estudiante-theme-wrapper [style*="border:1px solid"],
        .estudiante-theme-wrapper [style*="border: 2px solid"],
        .estudiante-theme-wrapper [style*="border:2px solid"],
        .estudiante-theme-wrapper div[style*="border"],
        .estudiante-theme-wrapper .glass-effect {
          border-color: ${darkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)'} !important;
        }
        
        /* Backgrounds específicos */
        .estudiante-theme-wrapper div[style*="background: rgba(255,255,255,0.05)"] {
          background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
        }
        
        .estudiante-theme-wrapper div[style*="background: rgba(255,255,255,0.1)"] {
          background: var(--theme-input-bg) !important;
        }
        
        /* Labels */
        .estudiante-theme-wrapper label {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Botones de texto */
        .estudiante-theme-wrapper button:not([style*="background: linear-gradient"]) {
          color: var(--theme-text-primary) !important;
        }
        
        /* Tablas */
        .estudiante-theme-wrapper table th {
          color: var(--theme-text-muted) !important;
        }
        
        .estudiante-theme-wrapper table td {
          color: var(--theme-text-primary) !important;
        }
        
        /* Textos específicos */
        .estudiante-theme-wrapper div[style*="color: rgba(255,255,255,0.6)"],
        .estudiante-theme-wrapper div[style*="color: rgba(255,255,255,0.7)"],
        .estudiante-theme-wrapper span[style*="color: rgba(255,255,255,0.6)"],
        .estudiante-theme-wrapper span[style*="color: rgba(255,255,255,0.7)"],
        .estudiante-theme-wrapper p[style*="color: rgba(255,255,255,0.6)"],
        .estudiante-theme-wrapper p[style*="color: rgba(255,255,255,0.7)"] {
          color: var(--theme-text-muted) !important;
        }
        
        .estudiante-theme-wrapper div[style*="color: rgba(255,255,255,0.8)"],
        .estudiante-theme-wrapper span[style*="color: rgba(255,255,255,0.8)"],
        .estudiante-theme-wrapper p[style*="color: rgba(255,255,255,0.8)"],
        .estudiante-theme-wrapper h3[style*="color: rgba(255,255,255,0.8)"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .estudiante-theme-wrapper div[style*="color: #fff"],
        .estudiante-theme-wrapper span[style*="color: #fff"],
        .estudiante-theme-wrapper h1[style*="color: #fff"],
        .estudiante-theme-wrapper h2[style*="color: #fff"],
        .estudiante-theme-wrapper h3[style*="color: #fff"],
        .estudiante-theme-wrapper td[style*="color: #fff"],
        .estudiante-theme-wrapper th[style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Reglas agresivas para sobrescribir colores hardcodeados */
        .estudiante-theme-wrapper [style*="color: rgba(255,255,255"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .estudiante-theme-wrapper [style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Backgrounds oscuros específicos */
        .estudiante-theme-wrapper [style*="background: linear-gradient(135deg, rgba(0,0,0"] {
          background: var(--theme-bg-content) !important;
        }
        
        .estudiante-theme-wrapper [style*="background: rgba(0,0,0"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Forzar TODOS los elementos a tener color visible */
        .estudiante-theme-wrapper * {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Iconos SVG */
        .estudiante-theme-wrapper svg {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Excepciones para colores específicos que deben mantenerse */
        .estudiante-theme-wrapper [style*="color: #10b981"],
        .estudiante-theme-wrapper [style*="color: #ef4444"],
        .estudiante-theme-wrapper [style*="color: #3b82f6"],
        .estudiante-theme-wrapper [style*="color: #fbbf24"],
        .estudiante-theme-wrapper [style*="color: #f59e0b"] {
          /* Mantener colores de estado */
        }
      `}</style>

      <div className="estudiante-theme-wrapper">
        {children}
      </div>
    </>
  );
};

export default EstudianteThemeWrapper;
