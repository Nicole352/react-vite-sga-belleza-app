import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  BarChart3, 
  FileText,
  Settings,
  Users,
  Sun,
  Moon
} from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';
import AdminThemeWrapper from '../../components/AdminThemeWrapper';

// Importar los nuevos componentes
import AdministradoresPanel from './AdministradoresPanel';
import LogsPanel from './LogsPanel';
import ConfiguracionPanel from './ConfiguracionPanel';
import PanelDashboardSuperAdmin from './PanelDashboardSuperAdmin';

const PanelSuperAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar modo oscuro por defecto
    const saved = localStorage.getItem('superadmin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('superadmin-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Función para alternar modo
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Funciones para obtener colores según el tema (igual que Admin)
  const getThemeColors = () => {
    if (darkMode) {
      return {
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
        contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(239, 68, 68, 0.2)',
        accent: '#ef4444'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05))',
        contentBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(239, 68, 68, 0.2)',
        accent: '#ef4444'
      };
    }
  };

  const theme = getThemeColors();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'administradores', name: 'Administradores', icon: Users },
    { id: 'logs', name: 'Logs del Sistema', icon: FileText },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Variables CSS globales para el tema */}
      <style>{`
        :root {
          --superadmin-bg-primary: ${theme.background};
          --superadmin-bg-secondary: ${theme.contentBg};
          --superadmin-text-primary: ${theme.textPrimary};
          --superadmin-text-secondary: ${theme.textSecondary};
          --superadmin-text-muted: ${theme.textMuted};
          --superadmin-border: ${theme.border};
          --superadmin-accent: ${theme.accent};
          --superadmin-input-bg: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          --superadmin-input-border: ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
          --superadmin-hover-bg: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          --superadmin-modal-bg: ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'};
          --superadmin-card-bg: ${darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)'};
        }
        
        /* Estilos globales para componentes hijos */
        .superadmin-panel * {
          --text-primary: ${theme.textPrimary};
          --text-secondary: ${theme.textSecondary};
          --text-muted: ${theme.textMuted};
          --bg-primary: ${theme.background};
          --bg-secondary: ${theme.contentBg};
          --border-color: ${theme.border};
        }
        
        /* Estilos automáticos para inputs y elementos comunes */
        .superadmin-panel input,
        .superadmin-panel textarea,
        .superadmin-panel select {
          background: var(--superadmin-input-bg) !important;
          border: 1px solid var(--superadmin-input-border) !important;
          color: var(--superadmin-text-primary) !important;
        }
        
        .superadmin-panel input::placeholder,
        .superadmin-panel textarea::placeholder {
          color: var(--superadmin-text-muted) !important;
        }
      `}</style>
      
      <div 
        className="superadmin-panel"
        style={{
          minHeight: '100vh',
          background: theme.background,
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex'
        }}
      >
        {/* Sidebar */}
        <div style={{
          width: '280px',
          background: theme.sidebarBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.border}`,
          borderRadius: '0 20px 20px 0',
          padding: '24px',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          boxShadow: darkMode ? '4px 0 20px rgba(0, 0, 0, 0.3)' : '4px 0 20px rgba(0, 0, 0, 0.1)'
        }}>
        {/* Header del Sidebar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: `1px solid ${theme.border}`
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ 
              color: theme.textPrimary, 
              fontSize: '1.2rem', 
              fontWeight: '700', 
              margin: 0,
              lineHeight: 1.2
            }}>
              Panel Super
            </h1>
            <p style={{ 
              color: theme.textMuted, 
              fontSize: '0.9rem', 
              margin: 0 
            }}>
              Administrador
            </p>
          </div>
        </div>
        
        {/* Navegación del Sidebar */}
        <nav style={{ marginBottom: '32px' }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab.id ? 
                    'linear-gradient(135deg, #ef4444, #dc2626)' : 
                    'transparent',
                  color: activeTab === tab.id ? '#fff' : theme.textMuted,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  boxShadow: activeTab === tab.id ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.textMuted;
                  }
                }}
              >
                <IconComponent size={20} />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          right: '24px' 
        }}>
          <div style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05))',
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '12px'
          }}>
            <LogoutButton darkMode={darkMode} />
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        padding: '24px',
        minHeight: '100vh'
      }}>
        {/* Navbar */}
        <div style={{
          background: theme.navbarBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '20px 32px',
          marginBottom: '24px',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Información del módulo activo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
            }}>
              {(() => {
                const activeTabData = tabs.find(t => t.id === activeTab);
                const IconComponent = activeTabData?.icon || BarChart3;
                return <IconComponent size={28} color="#fff" />;
              })()}
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '800', 
                color: theme.textPrimary,
                margin: 0
              }}>
                {tabs.find(t => t.id === activeTab)?.name || 'Dashboard'}
              </h1>
              <p style={{ 
                color: theme.textSecondary, 
                margin: 0, 
                fontSize: '1rem',
                marginTop: '4px'
              }}>
                {activeTab === 'dashboard' && 'Resumen general del sistema y estadísticas'}
                {activeTab === 'administradores' && 'Gestión de usuarios administradores'}
                {activeTab === 'logs' && 'Registro de actividades del sistema'}
                {activeTab === 'config' && 'Configuración general del sistema'}
              </p>
            </div>
          </div>

          {/* Toggle Switch de modo claro/oscuro - Estilo Navbar */}
          <div
            onClick={toggleDarkMode}
            style={{
              position: 'relative',
              width: '52px',
              height: '26px',
              background: darkMode 
                ? 'rgba(55, 65, 81, 0.8)' 
                : 'rgba(229, 231, 235, 0.8)',
              borderRadius: '13px',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              boxShadow: darkMode 
                ? 'inset 0 1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)' 
                : 'inset 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.05)',
              backdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.background = darkMode 
                ? 'rgba(55, 65, 81, 0.9)' 
                : 'rgba(229, 231, 235, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = darkMode 
                ? 'rgba(55, 65, 81, 0.8)' 
                : 'rgba(229, 231, 235, 0.8)';
            }}
          >
            {/* Círculo deslizante más pequeño */}
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: darkMode ? '26px' : '2px',
                width: '22px',
                height: '22px',
                background: darkMode 
                  ? 'linear-gradient(135deg, #374151, #4b5563)' 
                  : 'linear-gradient(135deg, #ffffff, #f9fafb)',
                borderRadius: '50%',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: darkMode 
                  ? '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1)' 
                  : '0 1px 3px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.9)',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`
              }}
            >
              {darkMode ? (
                <Moon size={12} color="#d1d5db" />
              ) : (
                <Sun size={12} color="#f59e0b" />
              )}
            </div>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div style={{
          background: theme.contentBg,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          minHeight: '600px',
          boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.1)'
        }}>
          {activeTab === 'administradores' && <AdminThemeWrapper darkMode={darkMode}><AdministradoresPanel /></AdminThemeWrapper>}
          {activeTab === 'logs' && <AdminThemeWrapper darkMode={darkMode}><LogsPanel /></AdminThemeWrapper>}
          {activeTab === 'config' && <AdminThemeWrapper darkMode={darkMode}><ConfiguracionPanel /></AdminThemeWrapper>}
          {activeTab === 'dashboard' && (
            <AdminThemeWrapper darkMode={darkMode}>
              <PanelDashboardSuperAdmin />
            </AdminThemeWrapper>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default PanelSuperAdmin;
