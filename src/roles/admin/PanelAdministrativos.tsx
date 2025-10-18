import { useState, useEffect } from 'react';
import {
  Users, BookOpen, MapPin, BarChart3, GraduationCap, UserCheck, FileText, Building2, DollarSign, Menu, X
} from 'lucide-react';
import AdminThemeWrapper from '../../components/AdminThemeWrapper';
import SchoolLogo from '../../components/SchoolLogo';
import ProfileMenu from '../../components/ProfileMenu';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

// Importar componentes modulares
import Dashboard from './Dashboard';
import GestionCursos from './GestionCursos';
import GestionMatricula from './GestionMatricula';
import GestionEstudiantes from './GestionEstudiantes';
import GestionDocentes from './GestionDocentes';
import AsignacionAula from './AsignacionAula';
import GestionAulas from './GestionAulas';
import GestionPagosEstudiante from './GestionPagosEstudiante';
import Reportes from './Reportes';
import GestionTiposCurso from './GestionTiposCurso';
import ControlUsuarios from './ControlUsuarios';

const PanelAdministrativos = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar modo oscuro por defecto
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Cargar preferencia guardada
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{ nombre?: string; apellido?: string; nombres?: string; apellidos?: string } | null>(null);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        console.log('🔑 Token para obtener datos:', token ? 'Existe' : 'No existe');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('📡 Status de /api/auth/me:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('👤 Datos del usuario recibidos:', data);
          console.log('📝 Nombres:', data.nombres);
          console.log('📝 Apellidos:', data.apellidos);
          console.log('📝 Todas las propiedades:', Object.keys(data));
          setUserData(data);
        } else {
          console.error('❌ Error en respuesta:', response.status);
        }
      } catch (error) {
        console.error('❌ Error obteniendo datos del usuario:', error);
      }
    };
    fetchUserData();
  }, []);

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('admin-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Guardar preferencia de sidebar cuando cambie
  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Función para alternar sidebar
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Función para alternar modo
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Funciones para obtener colores según el tema
  const getThemeColors = () => {
    if (darkMode) {
      return {
        background: '#0a0a0a',
        sidebarBg: '#171717',
        navbarBg: '#262626',
        contentBg: '#171717',
        textPrimary: '#ffffff',
        textSecondary: '#e5e5e5',
        textMuted: '#a3a3a3',
        border: 'rgba(255, 255, 255, 0.1)',
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
    { id: 'tipos', name: 'Tipos de Curso', icon: BookOpen },
    { id: 'cursos', name: 'Gestión Cursos', icon: BookOpen },
    { id: 'matricula', name: 'Gestión Matrícula', icon: GraduationCap },
    { id: 'estudiantes', name: 'Gestión Estudiantes', icon: Users },
    { id: 'pagos', name: 'Gestión de Pagos', icon: DollarSign },
    { id: 'docentes', name: 'Gestión Docentes', icon: UserCheck },
    { id: 'control-usuarios', name: 'Control de Usuarios', icon: Users },
    { id: 'gestion-aulas', name: 'Gestión Aulas', icon: Building2 },
    { id: 'asignacion-aulas', name: 'Asignación Aula', icon: MapPin },
    { id: 'reportes', name: 'Reportes', icon: FileText }
  ];

  return (
    <>
      {/* Variables CSS globales para el tema */}
      <style>{`
        :root {
          --admin-bg-primary: ${theme.background};
          --admin-bg-secondary: ${theme.contentBg};
          --admin-text-primary: ${theme.textPrimary};
          --admin-text-secondary: ${theme.textSecondary};
          --admin-text-muted: ${theme.textMuted};
          --admin-border: ${theme.border};
          --admin-accent: ${theme.accent};
          --admin-input-bg: ${darkMode ? '#262626' : 'rgba(0,0,0,0.05)'};
          --admin-input-border: ${darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0,0,0,0.15)'};
          --admin-hover-bg: ${darkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0,0,0,0.05)'};
          --admin-modal-bg: ${darkMode ? 'rgba(10, 10, 10, 0.95)' : 'rgba(0,0,0,0.4)'};
          --admin-card-bg: ${darkMode ? '#171717' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)'};
        }
        
        /* Estilos globales para componentes hijos */
        .admin-panel * {
          --text-primary: ${theme.textPrimary};
          --text-secondary: ${theme.textSecondary};
          --text-muted: ${theme.textMuted};
          --bg-primary: ${theme.background};
          --bg-secondary: ${theme.contentBg};
          --border-color: ${theme.border};
        }
        
        /* Estilos automáticos para inputs y elementos comunes */
        .admin-panel input,
        .admin-panel textarea,
        .admin-panel select {
          background: var(--admin-input-bg) !important;
          border: 1px solid var(--admin-input-border) !important;
          color: var(--admin-text-primary) !important;
        }
        
        .admin-panel input::placeholder,
        .admin-panel textarea::placeholder {
          color: var(--admin-text-muted) !important;
        }
      `}</style>

      <div
        className="admin-panel"
        style={{
          minHeight: '100vh',
          background: theme.background,
          fontFamily: 'Montserrat, sans-serif',
          display: 'flex'
        }}
      >
        {/* Overlay para móvil */}
        {isSmallScreen && mobileMenuOpen && (
          <div
            data-modal-overlay="true"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              transition: 'opacity 0.3s ease'
            }}
          />
        )}

        {/* Sidebar */}
        <div style={{
          width: isSmallScreen ? '280px' : (sidebarCollapsed ? '70px' : '280px'),
          background: theme.sidebarBg,
          border: `1px solid ${theme.border}`,
          borderRadius: isSmallScreen ? '0' : '0 16px 16px 0',
          padding: (isSmallScreen || !sidebarCollapsed) ? '10px 16px 20px 16px' : '10px 6px 20px 6px',
          position: 'fixed',
          height: '100vh',
          left: isSmallScreen ? (mobileMenuOpen ? '0' : '-280px') : '0',
          top: 0,
          zIndex: 1000,
          boxShadow: darkMode ? '4px 0 20px rgba(0, 0, 0, 0.3)' : '4px 0 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          overflowY: isSmallScreen ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Botón hamburguesa - Desktop */}
          {!isSmallScreen && (
            <button
              onClick={toggleSidebar}
              style={{
                position: 'absolute',
                top: '16px',
                right: sidebarCollapsed ? '50%' : '16px',
                transform: sidebarCollapsed ? 'translateX(50%)' : 'none',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                color: theme.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = sidebarCollapsed ? 'translateX(50%) scale(1.05)' : 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.transform = sidebarCollapsed ? 'translateX(50%)' : 'none';
              }}
            >
              <Menu size={20} />
            </button>
          )}

          {/* Botón cerrar - Móvil */}
          {isSmallScreen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
                background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                color: theme.accent,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                zIndex: 10
              }}
            >
              <X size={20} />
            </button>
          )}

          {/* Header del Sidebar - Solo Logo */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '8px',
            paddingBottom: '4px',
            borderBottom: `1px solid ${theme.border}`,
            paddingTop: '0px',
            marginTop: (isSmallScreen || !sidebarCollapsed) ? '0px' : '48px'
          }}>
            {(isSmallScreen || !sidebarCollapsed) && <SchoolLogo size={140} darkMode={darkMode} />}
          </div>

          {/* Navegación del Sidebar */}
          <nav style={{ 
            marginBottom: '32px',
            flex: 1
          }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isSmallScreen) setMobileMenuOpen(false);
                  }}
                  title={(sidebarCollapsed && !isSmallScreen) ? tab.name : ''}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: (sidebarCollapsed && !isSmallScreen) ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: (sidebarCollapsed && !isSmallScreen) ? '12px 8px' : '12px 16px',
                    marginBottom: '6px',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeTab === tab.id ?
                      'linear-gradient(135deg, #ef4444, #dc2626)' :
                      'transparent',
                    color: activeTab === tab.id ? '#fff' : theme.textMuted,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    boxShadow: activeTab === tab.id ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
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
                  <IconComponent size={18} style={{ flexShrink: 0 }} />
                  {(isSmallScreen || !sidebarCollapsed) && <span>{tab.name}</span>}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Contenido Principal */}
        <div style={{
          marginLeft: isSmallScreen ? '0' : (sidebarCollapsed ? '70px' : '280px'),
          flex: 1,
          padding: isMobile ? '12px' : '24px',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          width: isSmallScreen ? '100%' : 'auto'
        }}>
          {/* Navbar */}
          <div style={{
            background: theme.navbarBg,
            border: `1px solid ${theme.border}`,
            borderRadius: isMobile ? '12px' : '20px',
            padding: isMobile ? '12px 16px' : '16px 32px',
            marginBottom: isMobile ? '12px' : '16px',
            boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 100
          }}>
            {/* Información del módulo activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
              {/* Botón hamburguesa móvil */}
              {isSmallScreen && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                    color: theme.accent,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}
                >
                  <Menu size={20} />
                </button>
              )}
              
              <div style={{
                width: isMobile ? '36px' : '48px',
                height: isMobile ? '36px' : '48px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                flexShrink: 0
              }}>
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab);
                  const IconComponent = activeTabData?.icon || BarChart3;
                  return <IconComponent size={isMobile ? 18 : 24} color="#fff" />;
                })()}
              </div>
              <div className={isMobile ? 'hide-mobile' : ''}>
                <h1 style={{
                  fontSize: isMobile ? '1rem' : '1.4rem',
                  fontWeight: '800',
                  color: theme.textPrimary,
                  margin: 0
                }}>
                  Panel Administrativos
                </h1>
                <p style={{
                  color: theme.textSecondary,
                  margin: 0,
                  fontSize: isMobile ? '0.7rem' : '0.8rem',
                  marginTop: '4px'
                }}>
                  Sistema de gestión académica
                </p>
              </div>
            </div>

            {/* Iconos del lado derecho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ProfileMenu
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                theme={theme}
                userData={userData}
              />
            </div>
          </div>

          {/* Contenido de la sección activa */}
          <div style={{
            background: theme.contentBg,
            border: `1px solid ${theme.border}`,
            borderRadius: isMobile ? '12px' : '20px',
            minHeight: isMobile ? '400px' : '600px',
            boxShadow: darkMode ? '0 2px 10px rgba(0, 0, 0, 0.5)' : '0 8px 24px rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'dashboard' && <AdminThemeWrapper darkMode={darkMode}><Dashboard /></AdminThemeWrapper>}
            {activeTab === 'tipos' && <AdminThemeWrapper darkMode={darkMode}><GestionTiposCurso /></AdminThemeWrapper>}
            {activeTab === 'estudiantes' && <AdminThemeWrapper darkMode={darkMode}><GestionEstudiantes /></AdminThemeWrapper>}
            {activeTab === 'cursos' && <AdminThemeWrapper darkMode={darkMode}><GestionCursos /></AdminThemeWrapper>}
            {activeTab === 'matricula' && <AdminThemeWrapper darkMode={darkMode}><GestionMatricula /></AdminThemeWrapper>}
            {activeTab === 'docentes' && <AdminThemeWrapper darkMode={darkMode}><GestionDocentes /></AdminThemeWrapper>}
            {activeTab === 'control-usuarios' && <AdminThemeWrapper darkMode={darkMode}><ControlUsuarios /></AdminThemeWrapper>}
            {activeTab === 'gestion-aulas' && <AdminThemeWrapper darkMode={darkMode}><GestionAulas /></AdminThemeWrapper>}
            {activeTab === 'asignacion-aulas' && <AdminThemeWrapper darkMode={darkMode}><AsignacionAula /></AdminThemeWrapper>}
            {activeTab === 'pagos' && <AdminThemeWrapper darkMode={darkMode}><GestionPagosEstudiante /></AdminThemeWrapper>}
            {activeTab === 'reportes' && <AdminThemeWrapper darkMode={darkMode}><Reportes /></AdminThemeWrapper>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelAdministrativos;
