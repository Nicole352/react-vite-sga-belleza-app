import React from 'react';

interface DocenteThemeWrapperProps {
  children: React.ReactNode;
  darkMode?: boolean;
}

const DocenteThemeWrapper: React.FC<DocenteThemeWrapperProps> = ({ children, darkMode = true }) => {
  const theme = darkMode ? {
    textPrimary: '#fff',
    textSecondary: 'rgba(255,255,255,0.8)',
    textMuted: 'rgba(255,255,255,0.7)',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
    contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
    border: 'rgba(59, 130, 246, 0.2)', // AZUL en lugar de rojo
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
    border: 'rgba(59, 130, 246, 0.2)', // AZUL en lugar de rojo
    inputBg: 'rgba(0,0,0,0.05)',
    inputBorder: 'rgba(0,0,0,0.15)',
    hoverBg: 'rgba(0,0,0,0.05)',
    modalBg: 'rgba(240,240,240,0.75)'
  };

  return (
    <>
      <style>{`
        .docente-theme-wrapper {
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
        .docente-theme-wrapper h1,
        .docente-theme-wrapper h2,
        .docente-theme-wrapper h3,
        .docente-theme-wrapper h4,
        .docente-theme-wrapper h5,
        .docente-theme-wrapper h6 {
          color: var(--theme-text-primary) !important;
        }
        
        /* Colores para contenido general */
        .docente-theme-wrapper p,
        .docente-theme-wrapper span,
        .docente-theme-wrapper div {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Forzar colores específicos para elementos problemáticos */
        .docente-theme-wrapper * {
          color: var(--theme-text-secondary) !important;
        }
        
        .docente-theme-wrapper h1 *,
        .docente-theme-wrapper h2 *,
        .docente-theme-wrapper h3 *,
        .docente-theme-wrapper h4 *,
        .docente-theme-wrapper h5 *,
        .docente-theme-wrapper h6 * {
          color: var(--theme-text-primary) !important;
        }
        
        .docente-theme-wrapper input,
        .docente-theme-wrapper textarea,
        .docente-theme-wrapper select {
          background: var(--theme-input-bg) !important;
          border: 1px solid var(--theme-input-border) !important;
          color: var(--theme-text-primary) !important;
        }
        
        /* Estilos específicos para select y sus opciones */
        .docente-theme-wrapper select {
          background: ${darkMode ? 'rgba(17,17,17,0.9)' : 'rgba(255,255,255,0.9)'} !important;
          border: ${darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          border-radius: 10px !important;
          font-size: 14px !important;
          font-family: inherit !important;
        }
        
        .docente-theme-wrapper select option {
          background: ${darkMode ? '#111' : '#fff'} !important;
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
          padding: 8px !important;
          border: none !important;
        }
        
        .docente-theme-wrapper select option:disabled {
          background: ${darkMode ? '#111' : '#f8f9fa'} !important;
          color: ${darkMode ? '#bbb' : '#6b7280'} !important;
        }
        
        .docente-theme-wrapper select option:hover,
        .docente-theme-wrapper select option:focus {
          background: ${darkMode ? '#333' : '#f0f0f0'} !important;
        }
        
        .docente-theme-wrapper select option:checked {
          background: ${darkMode ? '#444' : '#e5e7eb'} !important;
        }
        
        .docente-theme-wrapper input::placeholder,
        .docente-theme-wrapper textarea::placeholder {
          color: var(--theme-text-muted) !important;
        }
        
        /* Backgrounds de contenedores */
        .docente-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.9)"],
        .docente-theme-wrapper div[style*="background: linear-gradient(135deg, rgba(0,0,0,0.95)"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Modales */
        .docente-theme-wrapper div[data-modal-overlay="true"] {
          background: var(--theme-modal-bg) !important;
        }
        
        .docente-theme-wrapper div[style*="position: fixed"][style*="zIndex: 9999"],
        .docente-theme-wrapper div[style*="position: fixed"][style*="z-index: 9999"] {
          background: var(--theme-modal-bg) !important;
        }
        
        /* Bordes - AZUL en lugar de rojo */
        .docente-theme-wrapper [style*="border: 1px solid"],
        .docente-theme-wrapper [style*="border:1px solid"],
        .docente-theme-wrapper [style*="border: 2px solid"],
        .docente-theme-wrapper [style*="border:2px solid"],
        .docente-theme-wrapper div[style*="border"],
        .docente-theme-wrapper .glass-effect {
          border-color: ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'} !important;
        }
        
        /* Backgrounds específicos */
        .docente-theme-wrapper div[style*="background: rgba(255,255,255,0.05)"] {
          background: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} !important;
        }
        
        .docente-theme-wrapper div[style*="background: rgba(255,255,255,0.1)"] {
          background: var(--theme-input-bg) !important;
        }
        
        /* Labels */
        .docente-theme-wrapper label {
          color: var(--theme-text-secondary) !important;
        }
        
        /* Botones de texto */
        .docente-theme-wrapper button:not([style*="background: linear-gradient"]) {
          color: var(--theme-text-primary) !important;
        }
        
        /* Tablas */
        .docente-theme-wrapper table th {
          color: var(--theme-text-muted) !important;
        }
        
        .docente-theme-wrapper table td {
          color: var(--theme-text-primary) !important;
        }
        
        /* Textos específicos */
        .docente-theme-wrapper div[style*="color: rgba(255,255,255,0.6)"],
        .docente-theme-wrapper div[style*="color: rgba(255,255,255,0.7)"],
        .docente-theme-wrapper span[style*="color: rgba(255,255,255,0.6)"],
        .docente-theme-wrapper span[style*="color: rgba(255,255,255,0.7)"],
        .docente-theme-wrapper p[style*="color: rgba(255,255,255,0.6)"],
        .docente-theme-wrapper p[style*="color: rgba(255,255,255,0.7)"] {
          color: var(--theme-text-muted) !important;
        }
        
        .docente-theme-wrapper div[style*="color: rgba(255,255,255,0.8)"],
        .docente-theme-wrapper span[style*="color: rgba(255,255,255,0.8)"],
        .docente-theme-wrapper p[style*="color: rgba(255,255,255,0.8)"],
        .docente-theme-wrapper h3[style*="color: rgba(255,255,255,0.8)"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .docente-theme-wrapper div[style*="color: #fff"],
        .docente-theme-wrapper span[style*="color: #fff"],
        .docente-theme-wrapper h1[style*="color: #fff"],
        .docente-theme-wrapper h2[style*="color: #fff"],
        .docente-theme-wrapper h3[style*="color: #fff"],
        .docente-theme-wrapper td[style*="color: #fff"],
        .docente-theme-wrapper th[style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Reglas agresivas para sobrescribir colores hardcodeados */
        .docente-theme-wrapper [style*="color: rgba(255,255,255"] {
          color: var(--theme-text-secondary) !important;
        }
        
        .docente-theme-wrapper [style*="color: #fff"] {
          color: var(--theme-text-primary) !important;
        }
        
        /* Backgrounds oscuros específicos */
        .docente-theme-wrapper [style*="background: linear-gradient(135deg, rgba(0,0,0"] {
          background: var(--theme-bg-content) !important;
        }
        
        .docente-theme-wrapper [style*="background: rgba(0,0,0"] {
          background: var(--theme-bg-content) !important;
        }
        
        /* Forzar TODOS los elementos a tener color visible */
        .docente-theme-wrapper * {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Iconos SVG */
        .docente-theme-wrapper svg {
          color: ${darkMode ? '#fff' : '#1e293b'} !important;
        }
        
        /* Excepciones para colores específicos que deben mantenerse */
        .docente-theme-wrapper [style*="color: #10b981"],
        .docente-theme-wrapper [style*="color: #ef4444"],
        .docente-theme-wrapper [style*="color: #3b82f6"],
        .docente-theme-wrapper [style*="color: #f59e0b"] {
          /* Mantener colores de estado */
        }
        
        /* ===== RESPONSIVE COMPLETO PARA MÓVILES ===== */
        @media (max-width: 768px) {
          /* Modales responsive */
          .modal-content {
            width: 92vw;
            padding: 1.5rem;
            border-radius: 16px;
          }
          
          /* Campos de formulario en una sola columna en móvil */
          .modal-content .form-row {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          .modal-content .form-row > div {
            width: 100% !important;
            flex: none !important;
          }
          
          /* Headers y títulos más pequeños */
          .docente-theme-wrapper h1 {
            font-size: 1.5rem !important;
          }
          
          .docente-theme-wrapper h2 {
            font-size: 1.25rem !important;
          }
          
          .docente-theme-wrapper h3 {
            font-size: 1.1rem !important;
          }
          
          /* Botones en columna en móvil */
          .docente-theme-wrapper div[style*="display: flex"][style*="gap"] {
            flex-wrap: wrap !important;
          }
          
          .docente-theme-wrapper button {
            font-size: 0.85rem !important;
            padding: 0.6rem 1rem !important;
            white-space: nowrap;
          }
          
          /* Contenedores de botones en columna */
          .docente-theme-wrapper > div > div > div:has(button) {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          /* Cards de módulos/tareas más compactos */
          .docente-theme-wrapper > div > div[style*="border-radius"] {
            padding: 1rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Metadatos en columna */
          .docente-theme-wrapper div[style*="display: flex"][style*="align-items: center"][style*="gap"] {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          
          /* Badges y estados más pequeños */
          .docente-theme-wrapper div[style*="padding: 3px 8px"],
          .docente-theme-wrapper div[style*="padding: 4px 8px"] {
            font-size: 0.7rem !important;
            padding: 2px 6px !important;
          }
          
          /* Iconos más pequeños */
          .docente-theme-wrapper svg {
            width: 16px !important;
            height: 16px !important;
          }
          
          /* Inputs y textareas más grandes para móvil */
          .docente-theme-wrapper input,
          .docente-theme-wrapper textarea,
          .docente-theme-wrapper select {
            font-size: 16px !important;
            padding: 0.75rem !important;
            border-radius: 10px !important;
          }
          
          /* Tablas responsive - scroll horizontal */
          .docente-theme-wrapper table {
            display: block !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          .docente-theme-wrapper table th,
          .docente-theme-wrapper table td {
            font-size: 0.8rem !important;
            padding: 0.5rem !important;
          }
          
          /* Contenedores principales con padding reducido */
          .docente-theme-wrapper > div {
            padding: 0.75rem !important;
          }
          
          /* Headers de sección más compactos */
          .docente-theme-wrapper > div > div:first-child {
            padding: 1rem !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Grupos de botones horizontales en columna */
          .docente-theme-wrapper div[style*="display: flex"]:has(> button + button) {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .docente-theme-wrapper div[style*="display: flex"]:has(> button + button) button {
            width: 100% !important;
          }
          
          /* Cards de tareas más compactos */
          .docente-theme-wrapper div[style*="padding: 14px 16px"],
          .docente-theme-wrapper div[style*="padding: 1rem 1.25rem"] {
            padding: 0.875rem !important;
          }
          
          /* Botones de acción en fila en móvil */
          .docente-theme-wrapper div[style*="display: flex"][style*="gap: 6px"] button,
          .docente-theme-wrapper div[style*="display: flex"][style*="gap: 8px"] button {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
          
          /* Espaciado entre elementos reducido */
          .docente-theme-wrapper div[style*="gap: 0.75em"],
          .docente-theme-wrapper div[style*="gap: 1em"] {
            gap: 0.5rem !important;
          }
          
          /* Textos más pequeños */
          .docente-theme-wrapper p,
          .docente-theme-wrapper span:not([style*="font-size"]) {
            font-size: 0.875rem !important;
            line-height: 1.4 !important;
          }
          
          /* Contenedores de información en columna */
          .docente-theme-wrapper div[style*="justify-content: space-between"] {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.75rem !important;
          }
          
          /* Botones "Volver" más pequeños */
          .docente-theme-wrapper button[style*="ArrowLeft"] {
            padding: 0.5rem 0.75rem !important;
            font-size: 0.85rem !important;
          }
          
          /* Estadísticas y métricas en columna */
          .docente-theme-wrapper div[style*="display: grid"],
          .docente-theme-wrapper div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          
          /* Ocultar elementos decorativos en móvil */
          .docente-theme-wrapper div[style*="backdrop-filter: blur"] {
            backdrop-filter: blur(4px) !important;
          }
          
          /* Ajustar max-width de contenedores */
          .docente-theme-wrapper div[style*="max-width: 75rem"],
          .docente-theme-wrapper div[style*="max-width: 60rem"],
          .docente-theme-wrapper div[style*="max-width: 50rem"] {
            max-width: 100% !important;
            width: 100% !important;
          }
          
          /* Padding de secciones reducido */
          .docente-theme-wrapper div[style*="padding: 1.5rem"],
          .docente-theme-wrapper div[style*="padding: 2rem"] {
            padding: 1rem !important;
          }
          
          /* Border radius más pequeño en móvil */
          .docente-theme-wrapper div[style*="border-radius: 0.75em"],
          .docente-theme-wrapper div[style*="border-radius: 1em"],
          .docente-theme-wrapper div[style*="border-radius: 1.25em"] {
            border-radius: 0.75rem !important;
          }
          
          /* Ajustar iconos en botones */
          .docente-theme-wrapper button svg {
            width: 14px !important;
            height: 14px !important;
          }
          
          /* Mejorar legibilidad de fechas y metadatos */
          .docente-theme-wrapper div[style*="font-size: 0.8rem"],
          .docente-theme-wrapper span[style*="font-size: 0.8rem"] {
            font-size: 0.75rem !important;
          }
          
          /* Ajustar espaciado de listas */
          .docente-theme-wrapper div[style*="flex-direction: column"][style*="gap"] {
            gap: 0.5rem !important;
          }
          
          /* Hacer que los contenedores principales ocupen todo el ancho */
          .docente-theme-wrapper > div > div {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        
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
      `}</style>

      <div className="docente-theme-wrapper">
        {children}
      </div>
    </>
  );
};

export default DocenteThemeWrapper;
