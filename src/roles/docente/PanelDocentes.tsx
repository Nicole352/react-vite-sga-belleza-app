import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { BookOpen, Users, Calendar, Lock, Eye, EyeOff, CheckCircle2, BarChart3, Settings, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import SchoolLogo from '../../components/SchoolLogo';
import ProfileMenu from '../../components/ProfileMenu';

// Importar componentes modulares
import DocenteDashboard from './DocenteDashboard';
import MisCursos from './MisCursos';
import MisEstudiantes from './MisEstudiantes';
import MiHorario from './MiHorario';
import MiPerfil from './MiPerfil';
import DetalleCursoDocente from './DetalleCursoDocente';

const API_BASE = 'http://localhost:3000/api';

const PanelDocentes = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docente-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('docente-sidebar-collapsed');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Estados para modal de cambio de contraseña
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [userData, setUserData] = useState<{ nombres?: string; apellidos?: string } | null>(null);

  // Obtener datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/auth/me`, {
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

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('docente-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Guardar preferencia de sidebar cuando cambie
  useEffect(() => {
    localStorage.setItem('docente-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    checkPasswordReset();
  }, []);


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
        }
      }
    } catch (error) {
      console.error('Error verificando estado de contraseña:', error);
    }
  };

  // Manejar cambio de contraseña
  const handlePasswordReset = async () => {
    if (passwordResetData.newPassword !== passwordResetData.confirmPassword) {
      setResetError('Las contraseñas no coinciden');
      return;
    }
    if (passwordResetData.newPassword.length < 6) {
      setResetError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: passwordResetData.newPassword,
          confirmPassword: passwordResetData.confirmPassword
        })
      });

      if (response.ok) {
        setShowPasswordResetModal(false);
        setPasswordResetData({ newPassword: '', confirmPassword: '' });
        toast.success('Contraseña actualizada exitosamente', {
          icon: <CheckCircle2 size={20} />,
          duration: 4000,
        });
      } else {
        const errorData = await response.json();
        setResetError(errorData.error || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setResetError('Error de conexión');
    } finally {
      setResetLoading(false);
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

  const getThemeColors = () => {
    if (darkMode) {
      return {
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
        contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        sidebarBg: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        navbarBg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.05))',
        contentBg: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6'
      };
    }
  };

  const theme = getThemeColors();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'cursos', name: 'Mis Cursos', icon: BookOpen },
    { id: 'estudiantes', name: 'Mis Estudiantes', icon: Users },
    { id: 'horario', name: 'Mi Horario', icon: Calendar },
    { id: 'perfil', name: 'Mi Perfil', icon: Settings }
  ];

  return (
    <>
      {/* Variables CSS globales */}
      <style>{`
        :root {
          --docente-bg-primary: ${theme.background};
          --docente-bg-secondary: ${theme.contentBg};
          --docente-text-primary: ${theme.textPrimary};
          --docente-text-secondary: ${theme.textSecondary};
          --docente-text-muted: ${theme.textMuted};
          --docente-border: ${theme.border};
          --docente-accent: ${theme.accent};
          --docente-input-bg: ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
          --docente-input-border: ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'};
        }
        
        .docente-panel input,
        .docente-panel textarea,
        .docente-panel select {
          background: var(--docente-input-bg) !important;
          border: 0.0625rem solid var(--docente-input-border) !important;
          color: var(--docente-text-primary) !important;
        }
      `}</style>

      <div
        className="docente-panel"
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
              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
              color: theme.accent,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.transform = sidebarCollapsed ? 'translateX(50%) scale(1.05)' : 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
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
                    setActiveTab(tab.id);
                    navigate('/panel/docente');
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
                      'linear-gradient(135deg, #3b82f6, #2563eb)' :
                      'transparent',
                    color: activeTab === tab.id ? '#fff' : theme.textMuted,
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    boxShadow: activeTab === tab.id ? '0 0.5rem 1.25rem rgba(59, 130, 246, 0.3)' : 'none',
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
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0.5rem 1.25rem rgba(59, 130, 246, 0.3)'
              }}>
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab);
                  const IconComponent = activeTabData?.icon || BarChart3;
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
                  Panel Docente
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
                onChangePassword={() => setShowPasswordResetModal(true)}
                avatarColor="linear-gradient(135deg, #3b82f6, #2563eb)"
              />
            </div>
          </div>

          {/* Contenido del Tab Activo o Rutas */}
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
              <Route path="/" element={
                <>
                  {activeTab === 'dashboard' && <DocenteDashboard darkMode={darkMode} />}
                  {activeTab === 'cursos' && <MisCursos darkMode={darkMode} />}
                  {activeTab === 'estudiantes' && <MisEstudiantes darkMode={darkMode} />}
                  {activeTab === 'horario' && <MiHorario darkMode={darkMode} />}
                  {activeTab === 'perfil' && <MiPerfil darkMode={darkMode} />}
                </>
              } />
              <Route path="/estudiantes" element={<MisEstudiantes darkMode={darkMode} />} />
              <Route path="/horario" element={<MiHorario darkMode={darkMode} />} />
              <Route path="/curso/:id" element={<DetalleCursoDocente darkMode={darkMode} />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* Modal de Cambio de Contraseña */}
      {showPasswordResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(0.5rem)'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '1.25rem',
            padding: '2em',
            maxWidth: '31.25rem',
            width: '90%',
            boxShadow: '0 1.25rem 3.75rem rgba(0,0,0,0.4)',
            border: `0.0625rem solid ${theme.border}`
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5em' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1em',
                boxShadow: `0 0.5rem 1.5rem ${theme.accent}40`
              }}>
                <Lock size={40} color="#fff" />
              </div>
              <h2 style={{ color: theme.textPrimary, fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5em 0' }}>
                Cambiar Contraseña
              </h2>
              <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0 }}>
                Por seguridad, debes cambiar tu contraseña temporal
              </p>
            </div>

            {resetError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.75em',
                padding: '0.75em',
                marginBottom: '1.25em',
                color: '#ef4444',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {resetError}
              </div>
            )}

            <div style={{ marginBottom: '1.25em' }}>
              <label style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '0.5em' }}>
                Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordResetData.newPassword}
                  onChange={(e) => setPasswordResetData({ ...passwordResetData, newPassword: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    width: '100%',
                    padding: '0.875em 2.8em 0.875em 0.875em',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `0.0625rem solid ${theme.border}`,
                    borderRadius: '0.75em',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75em',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25em'
                  }}
                >
                  {showNewPassword ? <EyeOff size={20} color={theme.textMuted} /> : <Eye size={20} color={theme.textMuted} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5em' }}>
              <label style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '0.5em' }}>
                Confirmar Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordResetData.confirmPassword}
                  onChange={(e) => setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })}
                  placeholder="Repite la contraseña"
                  style={{
                    width: '100%',
                    padding: '0.875em 2.8em 0.875em 0.875em',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `0.0625rem solid ${theme.border}`,
                    borderRadius: '0.75em',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75em',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25em'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} color={theme.textMuted} /> : <Eye size={20} color={theme.textMuted} />}
                </button>
              </div>
            </div>

            <button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              style={{
                width: '100%',
                padding: '1em',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                border: 'none',
                borderRadius: '0.75em',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: resetLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5em',
                boxShadow: `0 0.25rem 0.75rem ${theme.accent}40`,
                opacity: resetLoading ? 0.7 : 1
              }}
            >
              {resetLoading ? (
                <>Actualizando...</>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Cambiar Contraseña
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PanelDocentes;
