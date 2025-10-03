import { useState, useEffect } from 'react';
import { 
  BookOpen, UserCircle, Settings, Sun, Moon, Camera, Lock, Eye, EyeOff, CheckCircle, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LogoutButton from '../../components/LogoutButton';
import SchoolLogo from '../../components/SchoolLogo';

// Importar componentes modulares
import MiAula from './MiAula';
import Servicios from './Servicios';
import Perfil from './Perfil';

const API_BASE = 'http://localhost:3000/api';

const PanelEstudiantes = () => {
  const [activeTab, setActiveTab] = useState('mi-aula');
  const [darkMode, setDarkMode] = useState(() => {
    // Cargar preferencia guardada o usar modo claro por defecto
    const saved = localStorage.getItem('estudiante-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  // Estados para modal de cambio de contraseña
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Función para obtener iniciales del usuario
  const getInitials = () => {
    console.log('userData en getInitials:', userData);
    
    // Intentar diferentes combinaciones de campos
    let nombres = userData?.nombres || userData?.nombre || userData?.nombre_completo;
    let apellidos = userData?.apellidos || userData?.apellido || userData?.apellido_paterno;
    
    // Si hay nombre_completo, intentar separarlo
    if (!nombres && !apellidos && userData?.nombre_completo) {
      const partes = userData.nombre_completo.split(' ');
      nombres = partes[0];
      apellidos = partes[1] || partes[partes.length - 1];
    }
    
    console.log('Nombres encontrados:', nombres);
    console.log('Apellidos encontrados:', apellidos);
    
    if (!nombres || !apellidos) {
      console.log('No hay nombres o apellidos suficientes, usando ES');
      return 'ES';
    }
    
    const firstInitial = nombres.charAt(0).toUpperCase();
    const lastInitial = apellidos.charAt(0).toUpperCase();
    console.log('Iniciales generadas:', `${firstInitial}${lastInitial}`);
    return `${firstInitial}${lastInitial}`;
  };

  // Cerrar menú de perfil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
      `}</style>

      <div 
        className="estudiante-panel" 
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
                      'linear-gradient(135deg, #f59e0b, #d97706)' : 
                      'transparent',
                    color: activeTab === tab.id ? (darkMode ? '#ffffff' : '#1e293b') : theme.textMuted,
                    fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textAlign: 'left',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: activeTab === tab.id ? '0 8px 20px rgba(245, 158, 11, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = darkMode 
                        ? 'rgba(251, 191, 36, 0.1)' 
                        : 'rgba(251, 191, 36, 0.08)';
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
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
              }}>
                {(() => {
                  const activeTabData = tabs.find(t => t.id === activeTab);
                  const IconComponent = activeTabData?.icon || BookOpen;
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
                  Panel Estudiante
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
                    console.log('Icono clickeado, showProfileMenu actual:', showProfileMenu);
                    setShowProfileMenu(!showProfileMenu);
                  }}
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    color: '#fff',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
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
                      zIndex: 999,
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
                        setShowPasswordResetModal(true);
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
            boxShadow: darkMode ? '0 8px 24px rgba(0, 0, 0, 0.2)' : '0 8px 24px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            {activeTab === 'mi-aula' && <MiAula darkMode={darkMode} />}
            {activeTab === 'servicios' && <Servicios darkMode={darkMode} />}
            {activeTab === 'perfil' && <Perfil darkMode={darkMode} />}
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
              border: '2px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)'
                }}>
                  <Lock size={32} color="#000" />
                </div>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#fff',
                  margin: '0 0 12px 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Restablecer Contraseña
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
                      border: '1.5px solid rgba(251, 191, 36, 0.3)',
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
                      border: '1.5px solid rgba(251, 191, 36, 0.3)',
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
                  background: resetLoading ? 'rgba(251, 191, 36, 0.5)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#000',
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
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTop: '2px solid #000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Cambiar Contraseña</span>
                  </>
                )}
              </button>

              <p style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                marginTop: '20px',
                marginBottom: 0
              }}>
                <Info size={16} style={{ display: 'inline', marginRight: '6px' }} /> Tip: Usa una contraseña segura que incluya letras, números y símbolos
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PanelEstudiantes;
