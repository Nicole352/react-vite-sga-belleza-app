import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  BookOpen, UserCircle, Settings, Menu
} from 'lucide-react';
import SchoolLogo from '../../components/SchoolLogo';
import ProfileMenu from '../../components/ProfileMenu';
import AdminThemeWrapper from '../../components/AdminThemeWrapper';
import CambiarPasswordModal from '../../components/CambiarPasswordModal';

// Importar componentes modulares
import MiAula from './MiAula';
import Servicios from './Servicios';
import Perfil from './Perfil';
import Calificaciones from './Calificaciones';
import DetalleCursoEstudiante from './DetalleCursoEstudiante';

const API_BASE = 'http://localhost:3000/api';

const PanelEstudiantes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mi-aula');
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar modo claro por defecto
    const saved = localStorage.getItem('estudiante-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('estudiante-sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Estados para modal de cambio de contraseña
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [isRequiredPasswordChange, setIsRequiredPasswordChange] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [userData, setUserData] = useState<{
    nombres?: string;
    apellidos?: string;
    nombre?: string;
    apellido?: string;
    apellido_paterno?: string;
    nombre_completo?: string;
  } | null>(null);

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('estudiante-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Guardar preferencia de sidebar cuando cambie
  useEffect(() => {
    localStorage.setItem('estudiante-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    checkPasswordReset();
    fetchUserData();
  }, []);

  // Obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Datos del usuario estudiante:', data);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    }
  };

  // Verificar si necesita cambiar contraseña en primer ingreso
  const checkPasswordReset = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.needs_password_reset) {
          setShowPasswordResetModal(true);
          setIsRequiredPasswordChange(true);
          setIsFirstLogin(data.is_first_login !== false); // true si es undefined o true
        }
      }
    } catch (error) {
      console.error('Error verificando estado de contraseña:', error);
    }
  };

  // Manejar cierre del modal de contraseña
  const handleClosePasswordModal = () => {
    // Solo permitir cerrar si NO es cambio obligatorio
    if (!isRequiredPasswordChange) {
      setShowPasswordResetModal(false);
    }
  };

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
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
        contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(251, 191, 36, 0.2)',
        accent: '#fbbf24'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.05))',
        contentBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(251, 191, 36, 0.2)',
        accent: '#fbbf24'
      };
    }
  };

  const theme = getThemeColors();

  const tabs = [
    { id: 'mi-aula', name: 'Mi Aula', icon: BookOpen },
    { id: 'calificaciones', name: 'Calificaciones', icon: Settings },
    { id: 'servicios', name: 'Servicios', icon: Settings },
    { id: 'perfil', name: 'Mi Perfil', icon: UserCircle }
  ];

  return (
    <>
      {/* Variables CSS globales para el tema */}
      <style>{`
        :root {
          --estudiante-bg-primary: ${theme.background};
          --estudiante-bg-secondary: ${theme.contentBg};
          --estudiante-text-primary: ${theme.textPrimary};
          --estudiante-text-secondary: ${theme.textSecondary};
          --estudiante-text-muted: ${theme.textMuted};
          --estudiante-border: ${theme.border};
          --estudiante-accent: ${theme.accent};
          --estudiante-input-bg: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          --estudiante-input-border: ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
          --estudiante-hover-bg: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          --estudiante-modal-bg: ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'};
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .estudiante-panel input,
          .estudiante-panel textarea,
          .estudiante-panel select {
            background: var(--estudiante-input-bg) !important;
            border: 0.0625rem solid var(--estudiante-input-border) !important;
            color: var(--estudiante-text-primary) !important;
          }
      `}</style>

      <div
        className="estudiante-panel"
        style={{
          minHeight: '100vh',
          background: theme.background,
          display: 'flex',
          fontSize: '0.8rem'
        }}
      >
        {/* Sidebar */}
        <div style={{
          width: sidebarCollapsed ? '4.5rem' : '16rem',
          background: theme.sidebarBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '0 1em 1em 0',
          padding: sidebarCollapsed ? '0.625em 0.375em 1.25em 0.375em' : '0.625em 1em 1.25em 1em',
          position: 'fixed',
          height: '100vh',
          left: '0',
          top: 0,
          zIndex: 1000,
          boxShadow: darkMode ? '0.25rem 0 1.25rem rgba(0, 0, 0, 0.3)' : '0.25rem 0 1.25rem rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Botón hamburguesa */}
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '1rem',
              right: sidebarCollapsed ? '50%' : '1rem',
              transform: sidebarCollapsed ? 'translateX(50%)' : 'none',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '0.5rem',
              border: `0.0625rem solid ${theme.border}`,
              background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)',
              color: theme.accent,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
              e.currentTarget.style.transform = sidebarCollapsed ? 'translateX(50%) scale(1.05)' : 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.08)';
              e.currentTarget.style.transform = sidebarCollapsed ? 'translateX(50%)' : 'none';
            }}
          >
            <Menu size={20} />
          </button>
          {/* Header del Sidebar - Solo Logo */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '0.5rem',
            paddingBottom: '0.25rem',
            borderBottom: `0.0625rem solid ${theme.border}`,
            paddingTop: '0',
            marginTop: sidebarCollapsed ? '3rem' : '0'
          }}>
            {!sidebarCollapsed && <SchoolLogo size={140} darkMode={darkMode} />}
          </div>

          {/* Navegación del Sidebar */}
          <nav style={{
            marginBottom: '2em',
            flex: 1
          }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    // Siempre volver a la ruta base del panel al cambiar de sección
                    navigate('/panel/estudiante');
                    setActiveTab(tab.id);
                    // Forzar scroll al inicio al cambiar de sección
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  title={sidebarCollapsed ? tab.name : ''}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    gap: '0.625em',
                    padding: sidebarCollapsed ? '0.75em 0.5em' : '0.75em 1em',
                    marginBottom: '0.375em',
                    borderRadius: '0.75em',
                    border: 'none',
                    background: activeTab === tab.id ?
                      'linear-gradient(135deg, #f59e0b, #d97706)' :
                      'transparent',
                    color: activeTab === tab.id ? '#fff' : theme.textMuted,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    boxShadow: activeTab === tab.id ? '0 0.5rem 1.25rem rgba(245, 158, 11, 0.3)' : 'none',
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
                  {!sidebarCollapsed && <span>{tab.name}</span>}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Contenido Principal */}
        <div style={{
          marginLeft: sidebarCollapsed ? '4.375rem' : '17.5rem',
          flex: 1,
          padding: '1.25rem',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
          width: 'auto',
          maxWidth: '100%',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}>
          {/* Navbar */}
          <div style={{
            background: theme.navbarBg,
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '1.25rem',
            padding: '1em 1.5em',
            marginBottom: '1rem',
            backdropFilter: 'blur(1.25rem)',
            boxShadow: darkMode ? '0 0.5rem 1.5rem rgba(0, 0, 0, 0.2)' : '0 0.5rem 1.5rem rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Información del módulo activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0.5rem 1.25rem rgba(245, 158, 11, 0.3)'
              }}>
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab);
                  const IconComponent = activeTabData?.icon || BookOpen;
                  return <IconComponent size={22} color="#fff" />;
                })()}
              </div>
              <div>
                <h1 style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Panel Estudiante
                </h1>
                <p style={{
                  color: theme.textSecondary,
                  margin: 0,
                  fontSize: '0.8rem',
                  marginTop: '0.125em'
                }}>
                  Sistema de gestión académica
                </p>
              </div>
            </div>

            {/* Iconos del lado derecho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', position: 'relative' }}>
              <ProfileMenu
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                theme={theme}
                userData={userData}
                avatarColor="linear-gradient(135deg, #f59e0b, #d97706)"
              />
            </div>
          </div>

          {/* Contenido de la sección activa */}
          <div style={{
            background: theme.contentBg,
            backdropFilter: 'blur(1.25rem)',
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '1.25rem',
            padding: '2em',
            minHeight: '37.5rem',
            boxShadow: darkMode ? '0 0.5rem 2rem rgba(0, 0, 0, 0.3)' : '0 0.5rem 2rem rgba(0, 0, 0, 0.1)'
          }}>
            <Routes>
              <Route
                index
                element={
                  <>
                    {activeTab === 'mi-aula' && <MiAula darkMode={darkMode} />}
                    {activeTab === 'calificaciones' && <Calificaciones darkMode={darkMode} />}
                    {activeTab === 'servicios' && <Servicios darkMode={darkMode} />}
                    {activeTab === 'perfil' && <Perfil darkMode={darkMode} />}
                  </>
                }
              />
              <Route path="curso/:id" element={<DetalleCursoEstudiante darkMode={darkMode} />} />
            </Routes>
          </div>
        </div>

        {/* Modal de Cambiar Contraseña con AdminThemeWrapper */}
        <AdminThemeWrapper darkMode={darkMode}>
          <CambiarPasswordModal
            isOpen={showPasswordResetModal}
            onClose={handleClosePasswordModal}
            isRequired={isRequiredPasswordChange}
            isFirstLogin={isFirstLogin}
            rol="estudiante"
          />
        </AdminThemeWrapper>
      </div>
    </>
  );
};

export default PanelEstudiantes;