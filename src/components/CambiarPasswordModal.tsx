import { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

const API_BASE = (import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/api` : 'http://localhost:3000/api';

interface CambiarPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRequired?: boolean; // Si es true, es el primer cambio obligatorio
  rol: 'estudiante' | 'docente' | 'administrativo';
  isFirstLogin?: boolean; // Si es true, es primera vez en el sistema (no reset por admin)
}

const CambiarPasswordModal: React.FC<CambiarPasswordModalProps> = ({
  isOpen,
  onClose,
  isRequired = false,
  rol,
  isFirstLogin = true
}) => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    password_nueva: '',
    confirmar_password: ''
  });

  // Determinar colores según el rol
  const getRoleColors = () => {
    switch (rol) {
      case 'estudiante':
        return {
          primary: '#fbbf24',
          primaryDark: '#f59e0b',
          accent: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.3)'
        };
      case 'docente':
        return {
          primary: '#3b82f6',
          primaryDark: '#2563eb',
          accent: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.3)'
        };
      default:
        return {
          primary: '#ef4444',
          primaryDark: '#dc2626',
          accent: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)'
        };
    }
  };

  const colors = getRoleColors();

  // Validaciones dinámicas
  const hasMinLength = passwordData.password_nueva.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordData.password_nueva);
  const hasLowercase = /[a-z]/.test(passwordData.password_nueva);
  const hasNumber = /[0-9]/.test(passwordData.password_nueva);
  const isPasswordSecure = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password_nueva !== passwordData.confirmar_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!isPasswordSecure) {
      toast.error('La contraseña no cumple con todos los requisitos de seguridad');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('auth_token');
      const endpoint = isRequired
        ? `${API_BASE}/auth/reset-password`
        : `${API_BASE}/usuarios/cambiar-password`;

      const response = await fetch(endpoint, {
        method: isRequired ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          isRequired
            ? {
              newPassword: passwordData.password_nueva,
              confirmPassword: passwordData.confirmar_password
            }
            : {
              password_actual: passwordData.password_actual,
              password_nueva: passwordData.password_nueva
            }
        )
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        setPasswordData({
          password_actual: '',
          password_nueva: '',
          confirmar_password: ''
        });
        onClose();

        // Si era cambio obligatorio, recargar la página para actualizar el estado
        if (isRequired) {
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      } else {
        toast.error(data.message || data.error || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={!isRequired ? onClose : undefined}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>

        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--admin-bg-primary)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--admin-border)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <div>
              <h2 style={{
                color: 'var(--admin-text-primary)',
                fontSize: '1.25rem',
                fontWeight: '700',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${colors.border}`
                }}>
                  <FaLock size={20} color={colors.primary} />
                </div>
                {isRequired ? 'Cambio de Contraseña Requerido' : 'Cambiar Contraseña'}
              </h2>
              <p style={{
                color: 'var(--admin-text-muted)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {isRequired
                  ? 'Por seguridad, debes cambiar tu contraseña temporal'
                  : 'Actualiza tu contraseña para mantener tu cuenta segura'
                }
              </p>
            </div>

            {!isRequired && (
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--admin-hover-bg)';
                  e.currentTarget.style.color = 'var(--admin-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--admin-text-muted)';
                }}
              >
                <IoMdClose size={24} />
              </button>
            )}
          </div>

          {/* Alert para primer cambio */}
          {isRequired && (
            <div style={{
              background: colors.accent,
              border: `1px solid ${colors.border}`,
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'start',
              gap: '12px'
            }}>
              <HiOutlineShieldCheck size={24} color={colors.primary} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{
                  color: 'var(--admin-text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {isFirstLogin ? 'Primera vez en el sistema' : 'Contraseña reseteada por administrador'}
                </div>
                <div style={{
                  color: 'var(--admin-text-muted)',
                  fontSize: '0.8125rem',
                  lineHeight: '1.5'
                }}>
                  {isFirstLogin
                    ? 'Esta es tu primera vez ingresando. Por favor, establece una contraseña segura que solo tú conozcas.'
                    : 'El administrador ha reseteado tu contraseña. Por seguridad, debes establecer una nueva contraseña antes de continuar.'
                  }
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Contraseña Actual (solo si no es requerido) */}
            {!isRequired && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: 'var(--admin-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  Contraseña Actual
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.password_actual}
                    onChange={(e) => setPasswordData({ ...passwordData, password_actual: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      borderRadius: '10px',
                      fontSize: '0.9375rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-input-border)',
                      color: 'var(--admin-text-primary)',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--admin-input-border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--admin-text-muted)',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Nueva Contraseña */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                color: 'var(--admin-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.password_nueva}
                  onChange={(e) => setPasswordData({ ...passwordData, password_nueva: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    color: 'var(--admin-text-primary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-input-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              <div style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '12px',
                background: 'var(--admin-bg-secondary)',
                borderRadius: '10px',
                border: '1px solid var(--admin-border)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: hasMinLength ? colors.primary : 'var(--admin-text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <FaCheckCircle size={12} style={{ opacity: hasMinLength ? 1 : 0.5 }} />
                  Mínimo 8 caracteres
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: hasUppercase ? colors.primary : 'var(--admin-text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <FaCheckCircle size={12} style={{ opacity: hasUppercase ? 1 : 0.5 }} />
                  Una mayúscula (A-Z)
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: hasLowercase ? colors.primary : 'var(--admin-text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <FaCheckCircle size={12} style={{ opacity: hasLowercase ? 1 : 0.5 }} />
                  Una minúscula (a-z)
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: hasNumber ? colors.primary : 'var(--admin-text-muted)',
                  transition: 'all 0.2s'
                }}>
                  <FaCheckCircle size={12} style={{ opacity: hasNumber ? 1 : 0.5 }} />
                  Un número (0-9)
                </div>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: 'var(--admin-text-secondary)',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'block',
                marginBottom: '8px'
              }}>
                Confirmar Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmar_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmar_password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    color: 'var(--admin-text-primary)',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accent}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-input-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {passwordData.confirmar_password && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  color: passwordData.password_nueva === passwordData.confirmar_password ? colors.primary : '#ef4444'
                }}>
                  <FaCheckCircle size={14} />
                  {passwordData.password_nueva === passwordData.confirmar_password
                    ? 'Las contraseñas coinciden'
                    : 'Las contraseñas no coinciden'
                  }
                </div>
              )}
            </div>

            {/* Requerimientos faltantes alerta */}
            {!isPasswordSecure && passwordData.password_nueva.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaLock size={12} />
                Tu contraseña aún no es lo suficientemente segura.
              </div>
            )}

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {!isRequired && (
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    background: 'var(--admin-bg-secondary)',
                    border: '1px solid var(--admin-border)',
                    color: 'var(--admin-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--admin-hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--admin-bg-secondary)';
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
                  border: 'none',
                  color: '#fff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${colors.accent}`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${colors.accent}`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.accent}`;
                }}
              >
                <HiOutlineShieldCheck size={20} />
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CambiarPasswordModal;
