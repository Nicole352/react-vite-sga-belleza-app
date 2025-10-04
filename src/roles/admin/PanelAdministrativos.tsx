import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, MapPin, BarChart3, GraduationCap, UserCheck, FileText, Sun, Moon, Building2, DollarSign, Camera, Info, LogOut, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminThemeWrapper from '../../components/AdminThemeWrapper';
import SchoolLogo from '../../components/SchoolLogo';

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

const PanelAdministrativos = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar modo oscuro por defecto
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [userData, setUserData] = useState<{nombres?: string; apellidos?: string} | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
      }
    };
    fetchUserData();
  }, []);

  // Función para obtener iniciales del usuario
  const getInitials = () => {
    if (!userData?.nombres || !userData?.apellidos) return 'AD';
    const firstInitial = userData.nombres.charAt(0).toUpperCase();
    const lastInitial = userData.apellidos.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('admin-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Cerrar menú de perfil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Función para cerrar sesión
  const handleLogout = () => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_role');
    toast.success('Sesión cerrada exitosamente');
    navigate('/aula-virtual');
  };

  // Función para alternar modo
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Funciones para obtener colores según el tema
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
    { id: 'tipos', name: 'Tipos de Curso', icon: BookOpen },
    { id: 'cursos', name: 'Gestión Cursos', icon: BookOpen },
    { id: 'matricula', name: 'Gestión Matrícula', icon: GraduationCap },
    { id: 'estudiantes', name: 'Gestión Estudiantes', icon: Users },
    { id: 'pagos', name: 'Gestión de Pagos', icon: DollarSign },
    { id: 'docentes', name: 'Gestión Docentes', icon: UserCheck },
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
          --admin-input-bg: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          --admin-input-border: ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
          --admin-hover-bg: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          --admin-modal-bg: ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'};
          --admin-card-bg: ${darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)'};
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
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: theme.sidebarBg,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.border}`,
        borderRadius: '0 20px 20px 0',
        padding: '12px 24px 24px 24px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: darkMode ? '4px 0 20px rgba(0, 0, 0, 0.3)' : '4px 0 20px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header del Sidebar - Solo Logo */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '8px',
          paddingBottom: '4px',
          borderBottom: `1px solid ${theme.border}`,
          paddingTop: '0px'
        }}>
          <SchoolLogo size={140} darkMode={darkMode} />
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
                  gap: '10px',
                  padding: '12px 16px',
                  marginBottom: '6px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab.id ? 
                    'linear-gradient(135deg, #ef4444, #dc2626)' : 
                    'transparent',
                  color: activeTab === tab.id ? '#fff' : theme.textMuted,
                  fontSize: '0.85rem',
                  fontWeight: '500',
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
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1000
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
                Panel Administrativos
              </h1>
              <p style={{ 
                color: theme.textSecondary, 
                margin: 0, 
                fontSize: '1rem',
                marginTop: '4px'
              }}>
                Sistema de gestión académica
              </p>
            </div>
          </div>

          {/* Iconos del lado derecho */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Icono de Perfil de Usuario */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                style={{
                  width: '44px',
                  height: '44px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  fontWeight: '700',
                  fontSize: '0.95rem',
                  color: '#fff',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}>
                {getInitials()}
              </div>

              {/* Menú desplegable con animaciones */}
              {showProfileMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: '50px',
                    right: '0px',
                    background: darkMode ? theme.contentBg : theme.contentBg,
                    borderRadius: '12px',
                    boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.1)',
                    border: `1px solid ${theme.border}`,
                    minWidth: '250px',
                    zIndex: 1001,
                    animation: 'slideInDown 0.3s ease-out',
                    backdropFilter: 'blur(20px)'
                  }}>
                  {/* Header del menú */}
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: `1px solid ${theme.border}`,
                    background: theme.navbarBg,
                    borderRadius: '12px 12px 0 0'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: theme.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textAlign: 'center'
                    }}>
                      Mi Perfil
                    </div>
                  </div>

                  {/* Opción 1: Cambiar foto */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu(false);
                      toast('Función de cambiar foto de perfil próximamente', {
                        icon: <Info size={20} />,
                        duration: 3000,
                      });
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      color: theme.textPrimary,
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      borderBottom: `1px solid ${theme.border}`,
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                    <Camera size={18} color={theme.textSecondary} />
                    <span>Cambiar foto de perfil</span>
                  </div>

                  {/* Opción 2: Cambiar contraseña */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu(false);
                      toast('Función de cambiar contraseña próximamente', {
                        icon: <Info size={20} />,
                        duration: 3000,
                      });
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      color: theme.textPrimary,
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                    <Lock size={18} color={theme.textSecondary} />
                    <span>Cambiar contraseña</span>
                  </div>

                  {/* Opción 3: Cerrar Sesión */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                    <LogOut size={18} color="#ef4444" />
                    <span>Cerrar Sesión</span>
                  </div>
                </div>
              )}

              {/* Estilos CSS para animaciones */}
              <style>{`
                @keyframes slideInDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}</style>
            </div>

            {/* Toggle Switch de modo claro/oscuro */}
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
          {activeTab === 'dashboard' && <AdminThemeWrapper darkMode={darkMode}><Dashboard /></AdminThemeWrapper>}
          {activeTab === 'tipos' && <AdminThemeWrapper darkMode={darkMode}><GestionTiposCurso /></AdminThemeWrapper>}
          {activeTab === 'estudiantes' && <AdminThemeWrapper darkMode={darkMode}><GestionEstudiantes /></AdminThemeWrapper>}
          {activeTab === 'cursos' && <AdminThemeWrapper darkMode={darkMode}><GestionCursos /></AdminThemeWrapper>}
          {activeTab === 'matricula' && <AdminThemeWrapper darkMode={darkMode}><GestionMatricula /></AdminThemeWrapper>}
          {activeTab === 'docentes' && <AdminThemeWrapper darkMode={darkMode}><GestionDocentes /></AdminThemeWrapper>}
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
