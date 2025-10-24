import React from 'react';

interface AdminThemeWrapperProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

const AdminThemeWrapper: React.FC<AdminThemeWrapperProps> = ({ children, darkMode = true }) => {
  const theme = darkMode ? {
    textPrimary: '#fff',
    textSecondary: 'rgba(255,255,255,0.8)',
    textMuted: 'rgba(255,255,255,0.7)',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
    border: 'rgba(239, 68, 68, 0.2)',
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
    border: 'rgba(239, 68, 68, 0.2)',
    inputBg: 'rgba(0,0,0,0.05)',
    inputBorder: 'rgba(0,0,0,0.15)',
    hoverBg: 'rgba(0,0,0,0.05)',
    modalBg: 'rgba(240,240,240,0.75)'
  };

  return (
    <>
      <style>{`
        .admin-theme-wrapper {
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
        .admin-theme-wrapper h1,
        .admin-theme-wrapper h2,
        .admin-theme-wrapper h3,
        .admin-theme-wrapper h4,
        .admin-theme-wrapper h5,
        .admin-theme-wrapper h6 {
          color: var(--theme-text-primary) !important;
        }
        
        /* Colores para contenido general */
        .admin-theme-wrapper p,
        .admin-theme-wrapper span,
        .admin-theme-wrapper div {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Forzar colores específicos para elementos problemáticos */
        .admin-theme-wrapper * {
          color: var(--theme-text-secondary) !important;
        }
        
        .admin-theme-wrapper h1 *,
        .admin-theme-wrapper h2 *,
        .admin-theme-wrapper h3 *,
        .admin-theme-wrapper h4 *,
        .admin-theme-wrapper h5 *,
        .admin-theme-wrapper h6 * {
          color: var(--theme-text-primary) !important;
        }
        
        .admin-theme-wrapper input,
        .admin-theme-wrapper textarea,
        .admin-theme-wrapper select {
          background: var(--theme-input-bg) !important;
          border: 1px solid var(--theme-input-border) !important;
          color: var(--theme-text-primary) !important;
        }
        
        /* Estilos específicos para select y sus opciones - MUY AGRESIVOS */
        .admin-theme-wrapper select {
          background: ${darkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)'} !important;
          border: ${darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          font-family: inherit !important;
        }
        
        .admin-theme-wrapper select option {
          background: ${darkMode ? '#111' : '#fff'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          padding: 8px !important;
          border: none !important;
        }
        
        .admin-theme-wrapper select option:disabled {
          background: ${darkMode ? '#111' : '#f8f9fa'} !important;
          color: ${darkMode ? '#bbb' : '#6b7280'} !important;
        }
        
        .admin-theme-wrapper select option:hover,
        .admin-theme-wrapper select option:focus {
          background: ${darkMode ? '#333' : '#f0f0f0'} !important;
        }
        
        .admin-theme-wrapper select option:checked {
          background: ${darkMode ? '#444' : '#e5e7eb'} !important;
        }
        
        /* Sobrescribir estilos específicos de StyledSelect hardcodeados */
        .admin-theme-wrapper select[style*="background: rgba(17,17,17,0.9)"] {
          background: ${darkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)'} !important;
        }
        
        .admin-theme-wrapper select[style*="color: #fff"] {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        .admin-theme-wrapper input::placeholder,
        .admin-theme-wrapper textarea::placeholder {
          color: var(--theme-text-muted) !important;
        }
        
        /* Backgrounds de contenedores - más específico */
        .admin-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.9)"],
        .admin-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.95)"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Modales - Control total del fondo */
        .admin-theme-wrapper div[data-modal-overlay="true"] {
          background: var(--theme-modal-bg) !important;
        }
        
        /* Aplicar también a modales con position fixed */
        .admin-theme-wrapper div[style*="position: fixed"][style*="zIndex: 9999"],
        .admin-theme-wrapper div[style*="position: fixed"][style*="z-index: 9999"] {
          background: var(--theme-modal-bg) !important;
        }
        
        /* Bordes - Forzar color rojo en todos los bordes */
        .admin-theme-wrapper [style*="border: 1px solid"],
        .admin-theme-wrapper [style*="border:1px solid"],
        .admin-theme-wrapper [style*="border: 2px solid"],
        .admin-theme-wrapper [style*="border:2px solid"],
        .admin-theme-wrapper div[style*="border"],
        .admin-theme-wrapper .glass-effect {
          border-color: ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'} !important;
        }
        
        /* Backgrounds específicos que aparecen en modo oscuro */
        .admin-theme-wrapper div[style*="background: rgba(255,255,255,0.05)"] {
          background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
        }
        
        .admin-theme-wrapper div[style*="background: rgba(255,255,255,0.1)"] {
          background: var(--theme-input-bg) !important;
        }
        
        /* Forzar backgrounds de cards y contenedores */
        .admin-theme-wrapper > div > div[style*="background"],
        .admin-theme-wrapper > div > div > div[style*="background"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Labels */
        .admin-theme-wrapper label {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Botones de texto */
        .admin-theme-wrapper button:not([style*="background: linear-gradient"]) {
          color: var(--theme-text-primary) !important;
        }
        
        /* Tablas */
        .admin-theme-wrapper table th {
          color: var(--theme-text-muted) !important;
        }
        
        .admin-theme-wrapper table td {
          color: var(--theme-text-primary) !important;
        }
        
        /* Clase específica para columnas de nombres que deben estar en mayúsculas */
        .admin-theme-wrapper .table-nombre-uppercase,
        .admin-theme-wrapper .table-nombre-uppercase div {
          text-transform: uppercase !important;
        }
        
        /* Textos específicos que suelen ser más sutiles */
        .admin-theme-wrapper div[style*="color: rgba(255,255,255,0.6)"],
        .admin-theme-wrapper div[style*="color: rgba(255,255,255,0.7)"],
        .admin-theme-wrapper span[style*="color: rgba(255,255,255,0.6)"],
        .admin-theme-wrapper span[style*="color: rgba(255,255,255,0.7)"],
        .admin-theme-wrapper p[style*="color: rgba(255,255,255,0.6)"],
        .admin-theme-wrapper p[style*="color: rgba(255,255,255,0.7)"] {
          color: var(--theme-text-muted) !important;
        }
        
        .admin-theme-wrapper div[style*="color: rgba(255,255,255,0.8)"],
        .admin-theme-wrapper span[style*="color: rgba(255,255,255,0.8)"],
        .admin-theme-wrapper p[style*="color: rgba(255,255,255,0.8)"],
        .admin-theme-wrapper h3[style*="color: rgba(255,255,255,0.8)"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .admin-theme-wrapper div[style*="color: #fff"],
        .admin-theme-wrapper span[style*="color: #fff"],
        .admin-theme-wrapper h1[style*="color: #fff"],
        .admin-theme-wrapper h2[style*="color: #fff"],
        .admin-theme-wrapper h3[style*="color: #fff"],
        .admin-theme-wrapper td[style*="color: #fff"],
        .admin-theme-wrapper th[style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Reglas ultra-agresivas para sobrescribir TODOS los colores hardcodeados */
        .admin-theme-wrapper [style*="color: rgba(255,255,255"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .admin-theme-wrapper [style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Backgrounds oscuros específicos */
        .admin-theme-wrapper [style*="background: linear-gradient(135deg, rgba(0,0,0"]:not(.reporte-card-selected) {
          background: var(--theme-bg-content) !important;
        }
        
        .admin-theme-wrapper [style*="background: rgba(0,0,0"]:not(.reporte-card-selected) {
          background: var(--theme-bg-content) !important;
        }
        
        /* Excepción para cards de reportes seleccionadas - FORZAR ROJO */
        .admin-theme-wrapper .reporte-card-selected {
          background: #ef4444 !important;
          background-image: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
        }
        
        /* REGLAS ULTRA-AGRESIVAS PARA SUPERADMIN */
        .admin-theme-wrapper > div,
        .admin-theme-wrapper > div > div,
        .admin-theme-wrapper > div > div > div {
          background: ${darkMode ? 'inherit' : 'var(--theme-bg-content)'} !important;
        }
        
        /* RESPONSIVE: Escalar TODO el contenido en laptops pequeñas */
        @media (max-width: 1366px) and (min-width: 1025px) {
          .admin-theme-wrapper {
            font-size: 13px !important;
          }
          
          .admin-theme-wrapper h1 {
            font-size: 1.3rem !important;
          }
          
          .admin-theme-wrapper h2 {
            font-size: 1.1rem !important;
          }
          
          .admin-theme-wrapper h3 {
            font-size: 0.8rem !important;
            font-weight: 600 !important;
          }
          
          .admin-theme-wrapper h4 {
            font-size: 0.85rem !important;
          }
          
          .admin-theme-wrapper button {
            padding: 8px 14px !important;
            font-size: 0.85rem !important;
          }
          
          .admin-theme-wrapper input,
          .admin-theme-wrapper select,
          .admin-theme-wrapper textarea {
            font-size: 0.85rem !important;
            padding: 8px 10px !important;
          }
          
          .admin-theme-wrapper table {
            font-size: 0.85rem !important;
          }
          
          .admin-theme-wrapper table th,
          .admin-theme-wrapper table td {
            padding: 8px 10px !important;
          }
          
          /* Cards y contenedores */
          .admin-theme-wrapper > div > div {
            padding: 16px !important;
          }
        }
        
        @media (max-width: 1024px) and (min-width: 769px) {
          .admin-theme-wrapper {
            font-size: 12px !important;
          }
          
          .admin-theme-wrapper h1 {
            font-size: 1.2rem !important;
          }
          
          .admin-theme-wrapper h2 {
            font-size: 1rem !important;
          }
          
          .admin-theme-wrapper h3 {
            font-size: 0.8rem !important;
            font-weight: 600 !important;
          }
          
          .admin-theme-wrapper button {
            padding: 6px 12px !important;
            font-size: 0.8rem !important;
          }
        }
        
        /* Reducir títulos en TODAS las resoluciones */
        .admin-theme-wrapper h1 {
          font-size: 1.5rem !important;
        }
        
        .admin-theme-wrapper h2 {
          font-size: 1.25rem !important;
        }
        
        .admin-theme-wrapper h3 {
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
          text-transform: uppercase !important;
        }
        
        /* Regla ultra-específica para h3 en cards */
        .admin-theme-wrapper div[style*="border-radius"] h3,
        .admin-theme-wrapper div[style*="borderRadius"] h3,
        .admin-theme-wrapper [style*="padding"] h3 {
          font-size: 0.8rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
          text-transform: uppercase !important;
        }
        
        /* Forzar fontWeight en h3 con estilos inline */
        .admin-theme-wrapper h3[style] {
          font-weight: 700 !important;
        }
        
        .admin-theme-wrapper h4 {
          font-size: 0.75rem !important;
        }
        
        .admin-theme-wrapper h5 {
          font-size: 0.7rem !important;
        }
        
        /* Forzar backgrounds específicos que aparecen en SuperAdmin */
        .admin-theme-wrapper div[style*="background: rgba(0,0,0,0.9)"],
        .admin-theme-wrapper div[style*="background: rgba(26,26,26,0.9)"],
        .admin-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.9)"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Contenedores principales con padding */
        .admin-theme-wrapper div[style*="padding: '32px'"],
        .admin-theme-wrapper div[style*="padding: 32px"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Forzar TODOS los elementos a tener color visible */
        .admin-theme-wrapper * {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Iconos SVG */
        .admin-theme-wrapper svg {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Excepciones para colores específicos que deben mantenerse */
        .admin-theme-wrapper [style*="color: #10b981"],
        .admin-theme-wrapper [style*="color: #ef4444"],
        .admin-theme-wrapper [style*="color: #3b82f6"],
        .admin-theme-wrapper .error-text-red {
          color: #ef4444 !important;
        }
      `}</style>

      <div className="admin-theme-wrapper">
        {children}
      </div>
    </>
  );
};

export default AdminThemeWrapper;