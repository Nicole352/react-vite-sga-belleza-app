import React, { useState, useEffect } from 'react';
import { 
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  User,
  BookOpen,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';

const API_BASE = 'http://localhost:3000/api';

const PanelDocentes = () => {
  const [activeTab, setActiveTab] = useState('mi-aula');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docente-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Estados para modal de cambio de contraseña
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

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
        alert('¡Contraseña actualizada exitosamente!');
      } else {
        const errorData = await response.json();
        setResetError(errorData.error || 'Error al actualizar la contraseña');
      }
    } catch (error) {
      setResetError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setResetLoading(false);
    }
  };

  const handlePasswordResetChange = (field: string, value: string) => {
    setPasswordResetData(prev => ({ ...prev, [field]: value }));
    setResetError('');
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
        navbarBg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
        contentBg: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
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
    { id: 'mi-aula', name: 'Mi Aula', icon: BookOpen },
    { id: 'servicios', name: 'Servicios', icon: Settings },
    { id: 'perfil', name: 'Mi Perfil', icon: User }
  ];

  return (
    <>
      {/* Variables CSS globales para el tema */}
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
          --docente-hover-bg: ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
          --docente-modal-bg: ${darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)'};
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          padding: '24px',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
          boxShadow: darkMode ? '4px 0 20px rgba(0, 0, 0, 0.3)' : '4px 0 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ 
              margin: 0, 
              color: theme.accent, 
              fontSize: '1.5rem', 
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Panel Docente
            </h2>
          </div>

          {/* Navigation */}
          <nav style={{ marginBottom: '32px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    marginBottom: '8px',
                    background: isActive ? `rgba(239, 68, 68, 0.15)` : 'transparent',
                    border: isActive ? `1px solid rgba(239, 68, 68, 0.3)` : '1px solid transparent',
                    borderRadius: '12px',
                    color: isActive ? theme.accent : theme.textSecondary,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '600' : '500',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={20} />
                  {tab.name}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={toggleDarkMode}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.9rem'
              }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>

          {/* Logout */}
          <div style={{ marginTop: 'auto' }}>
            <LogoutButton />
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          marginLeft: '280px', 
          flex: 1, 
          padding: '32px',
          background: theme.contentBg,
          minHeight: '100vh'
        }}>
          <div style={{
            background: theme.contentBg,
            borderRadius: '20px',
            padding: '32px',
            border: `1px solid ${theme.border}`,
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h1 style={{ 
              margin: '0 0 24px 0', 
              color: theme.textPrimary, 
              fontSize: '2rem', 
              fontWeight: '700' 
            }}>
              Bienvenido al Panel de Docente
            </h1>
            
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '1.1rem', 
              lineHeight: 1.6,
              margin: '0 0 32px 0'
            }}>
              Gestiona tus clases, estudiantes y recursos educativos desde este panel.
            </p>

            {/* Content based on active tab */}
            {activeTab === 'mi-aula' && (
              <div>
                <h2 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Mi Aula Virtual</h2>
                <p style={{ color: theme.textSecondary }}>Aquí podrás gestionar tus clases y estudiantes.</p>
              </div>
            )}

            {activeTab === 'servicios' && (
              <div>
                <h2 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Servicios</h2>
                <p style={{ color: theme.textSecondary }}>Accede a los servicios disponibles para docentes.</p>
              </div>
            )}

            {activeTab === 'perfil' && (
              <div>
                <h2 style={{ color: theme.textPrimary, marginBottom: '16px' }}>Mi Perfil</h2>
                <p style={{ color: theme.textSecondary }}>Gestiona tu información personal y configuración.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Restablecer Contraseña (Primer Ingreso) */}
        {showPasswordResetModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)'
                }}>
                  <Lock size={32} color="#fff" />
                </div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 12px 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  🔐 Restablecer Contraseña
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Nueva Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordResetData.newPassword}
                    onChange={(e) => handlePasswordResetChange('newPassword', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{
                      width: '100%',
                      padding: '14px 50px 14px 16px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Confirmar Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordResetData.confirmPassword}
                    onChange={(e) => handlePasswordResetChange('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                    style={{
                      width: '100%',
                      padding: '14px 50px 14px 16px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontFamily: 'Montserrat, sans-serif'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {resetError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fecaca',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  {resetError}
                </div>
              )}

              <button
                onClick={handlePasswordReset}
                disabled={resetLoading || !passwordResetData.newPassword || !passwordResetData.confirmPassword}
                style={{
                  width: '100%',
                  background: resetLoading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: resetLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {resetLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Cambiar Contraseña
                  </>
                )}
              </button>

              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#93c5fd',
                  fontSize: '0.85rem',
                  margin: 0,
                  lineHeight: 1.4
                }}>
                  💡 <strong>Tip:</strong> Usa una contraseña segura que puedas recordar fácilmente. Una vez cambiada, podrás acceder normalmente con tu nuevo password.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PanelDocentes;
