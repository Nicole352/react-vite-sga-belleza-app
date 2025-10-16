import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Lock, LogOut, Info, Sun, Moon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileMenuProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: any;
  userData?: { nombre?: string; apellido?: string; nombres?: string; apellidos?: string } | null;
  onChangePassword?: () => void; // Opcional: callback para cambiar contraseña
  avatarColor?: string; // Opcional: color del avatar (default: rojo)
}

const ProfileMenu = ({ darkMode, toggleDarkMode, theme, userData, onChangePassword, avatarColor = 'linear-gradient(135deg, #ef4444, #dc2626)' }: ProfileMenuProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  // Función para obtener iniciales del usuario
  const getInitials = () => {
    // Priorizar nombres/apellidos (docentes) sobre nombre/apellido (admins)
    const firstName = userData?.nombres || userData?.nombre;
    const lastName = userData?.apellidos || userData?.apellido;
    
    if (!firstName || !lastName) return 'AD';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      
      // Llamar al endpoint de logout
      if (token) {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Limpiar sesión local
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_role');
      toast.success('Sesión cerrada exitosamente');
      navigate('/aula-virtual');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aunque falle el backend, cerrar sesión localmente
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_role');
      navigate('/aula-virtual');
    }
  };

  // Cerrar menú al hacer clic fuera
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

  return (
    <div style={{ position: 'relative' }}>
      {/* Avatar del usuario */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setShowProfileMenu(!showProfileMenu);
        }}
        style={{
          width: '44px',
          height: '44px',
          background: avatarColor,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: avatarColor.includes('#ef4444') 
            ? '0 4px 12px rgba(239, 68, 68, 0.3)' 
            : avatarColor.includes('#3b82f6')
            ? '0 4px 12px rgba(59, 130, 246, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)',
          fontWeight: '700',
          fontSize: '0.95rem',
          color: '#fff',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          const shadowColor = avatarColor.includes('#ef4444') 
            ? 'rgba(239, 68, 68, 0.4)' 
            : avatarColor.includes('#3b82f6')
            ? 'rgba(59, 130, 246, 0.4)'
            : 'rgba(0, 0, 0, 0.4)';
          e.currentTarget.style.boxShadow = `0 6px 16px ${shadowColor}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          const shadowColor = avatarColor.includes('#ef4444') 
            ? 'rgba(239, 68, 68, 0.3)' 
            : avatarColor.includes('#3b82f6')
            ? 'rgba(59, 130, 246, 0.3)'
            : 'rgba(0, 0, 0, 0.3)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${shadowColor}`;
        }}>
        {getInitials()}
      </div>

      {/* Menú desplegable */}
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
              if (onChangePassword) {
                onChangePassword();
              } else {
                toast('Función de cambiar contraseña próximamente', {
                  icon: <Info size={20} />,
                  duration: 3000,
                });
              }
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
            <Lock size={18} color={theme.textSecondary} />
            <span>Cambiar contraseña</span>
          </div>

          {/* Opción 3: Modo Claro/Oscuro */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              toggleDarkMode();
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
            {/* Icono mitad claro/oscuro */}
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: `linear-gradient(90deg, ${theme.textSecondary} 50%, transparent 50%)`,
              border: `2px solid ${theme.textSecondary}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                background: darkMode ? '#1f2937' : '#f3f4f6'
              }} />
            </div>
            <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </div>

          {/* Opción 4: Cerrar Sesión */}
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
  );
};

export default ProfileMenu;
