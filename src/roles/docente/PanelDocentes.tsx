import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, User, Lock, Eye, EyeOff, CheckCircle2, BarChart3, Settings, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoutButton from '../../components/LogoutButton';
import SchoolLogo from '../../components/SchoolLogo';

// Importar componentes modulares
import DocenteDashboard from './DocenteDashboard';
import MisCursos from './MisCursos';
import MisEstudiantes from './MisEstudiantes';
import MiHorario from './MiHorario';
import MiPerfil from './MiPerfil';

const API_BASE = 'http://localhost:3000/api';

const PanelDocentes = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docente-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Estados para modal de cambio de contraseña
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [userData, setUserData] = useState<{nombres?: string; apellidos?: string} | null>(null);

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

  // Función para obtener iniciales del usuario
  const getInitials = () => {
    if (!userData?.nombres || !userData?.apellidos) return 'DC';
    const firstInitial = userData.nombres.charAt(0).toUpperCase();
    const lastInitial = userData.apellidos.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Guardar preferencia de modo cuando cambie
  useEffect(() => {
    localStorage.setItem('docente-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

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
          border: 1px solid var(--docente-input-border) !important;
          color: var(--docente-text-primary) !important;
        }
      `}</style>

      <div 
        className="docente-panel"
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
                      'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                      'transparent',
                    color: activeTab === tab.id ? '#ffffff' : theme.textMuted,
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: activeTab === tab.id ? '0 8px 20px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = darkMode 
                        ? 'rgba(59, 130, 246, 0.1)' 
                        : 'rgba(59, 130, 246, 0.08)';
                      e.currentTarget.style.color = theme.accent;
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.textMuted;
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <IconComponent size={20} />
                  <span>{tab.name}</span>
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
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Información del módulo activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
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
                  Panel Docente
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
              {/* Iniciales del Usuario */}
              <div style={{
                width: '44px',
                height: '44px',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                fontWeight: '700',
                fontSize: '0.95rem',
                color: '#fff',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}>
                {getInitials()}
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
                {/* Círculo deslizante */}
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
                    <Sun size={12} color="#3b82f6" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del Tab Activo */}
          <div style={{
            background: theme.contentBg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '32px',
            minHeight: 'calc(100vh - 180px)',
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            {activeTab === 'dashboard' && <DocenteDashboard darkMode={darkMode} />}
            {activeTab === 'cursos' && <MisCursos darkMode={darkMode} />}
            {activeTab === 'estudiantes' && <MisEstudiantes darkMode={darkMode} />}
            {activeTab === 'horario' && <MiHorario darkMode={darkMode} />}
            {activeTab === 'perfil' && <MiPerfil darkMode={darkMode} />}
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
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: `0 8px 24px ${theme.accent}40`
              }}>
                <Lock size={40} color="#fff" />
              </div>
              <h2 style={{ color: theme.textPrimary, fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0' }}>
                Cambiar Contraseña
              </h2>
              <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0 }}>
                Por seguridad, debes cambiar tu contraseña temporal
              </p>
            </div>

            {resetError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px',
                color: '#ef4444',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {resetError}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
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
                    padding: '14px 45px 14px 14px',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showNewPassword ? <EyeOff size={20} color={theme.textMuted} /> : <Eye size={20} color={theme.textMuted} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
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
                    padding: '14px 45px 14px 14px',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
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
                padding: '16px',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: resetLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${theme.accent}40`,
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
