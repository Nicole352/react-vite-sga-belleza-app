import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Settings, Server, Database, 
  Mail, Activity, CheckCircle, User, Phone, MapPin, Calendar, Users, ShieldCheck, X
} from 'lucide-react';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';

const API_BASE = 'http://localhost:3000';

interface UserProfile {
  id_usuario: number;
  cedula?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  genero?: string;
  rol: string;
  estado: string;
}

const ConfiguracionPanel: React.FC = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    fetchUserData();
    loadFoto();
  }, []);

  // Listener WebSocket para actualización de foto en tiempo real
  useSocket({
    'profile_picture_updated': (data: any) => {
      console.log('📸 Foto de perfil actualizada en tiempo real (ConfiguracionPanel):', data);
      if (data.id_usuario === userData?.id_usuario) {
        if (data.deleted) {
          setFotoUrl(null);
          console.log('✓ Foto eliminada correctamente (ConfiguracionPanel)');
        } else if (data.foto_perfil_url) {
          setFotoUrl(data.foto_perfil_url);
          console.log('✓ Foto actualizada correctamente (ConfiguracionPanel)');
        }
      }
    }
  }, userData?.id_usuario);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const loadFoto = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.foto_perfil) {
          setFotoUrl(data.foto_perfil);
          console.log('Foto cargada en ConfiguracionPanel:', data.foto_perfil);
        } else {
          setFotoUrl(null);
          console.log('No hay foto de perfil');
        }
      }
    } catch (error) {
      console.error('Error cargando foto:', error);
    }
  };

  const getInitials = () => {
    if (!userData) return 'SA';
    return `${userData.nombre.charAt(0)}${userData.apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div style={{
      minHeight: '100%',
      color: 'var(--superadmin-text-primary)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '0.75rem' : '1em' }}>
        <h2 style={{
          color: 'var(--superadmin-text-primary)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontSize: isMobile ? '1.25rem' : '1.625rem',
          fontWeight: '700'
        }}>
          <Settings size={26} color="#ef4444" />
          Configuración del Sistema
        </h2>
        <p style={{
          color: 'var(--superadmin-text-muted)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem'
        }}>
          Configuraciones generales y perfil del Super Administrador
        </p>
      </div>

      {/* Sección Perfil del SuperAdmin - Solo Lectura */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 2fr', gap: isMobile ? '0.75rem' : '1rem' }}>
          {/* Card de perfil (izquierda) */}
          <div style={{
            background: 'var(--superadmin-card-bg)',
            backdropFilter: 'blur(1.25rem)',
            border: '0.0625rem solid var(--superadmin-border)',
            borderRadius: '1.25rem',
            padding: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)',
            textAlign: 'center'
          }}>
            {/* Foto de perfil */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoPreview(true);
              }}
              style={{
                position: 'relative',
                width: '7.5rem',
                height: '7.5rem',
                borderRadius: '50%',
                background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#fff',
                overflow: 'hidden',
                cursor: 'pointer',
                margin: '0 auto 1rem',
                boxShadow: '0 0.5rem 1.5rem rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s ease',
                transform: 'scale(1) rotate(0deg)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              }}>
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto de perfil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>

            <h3 style={{ color: 'var(--superadmin-text-primary)', fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
              {userData?.nombre} {userData?.apellido}
            </h3>
            <p style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.8125rem', margin: '0 0 0.5rem 0' }}>
              @{userData?.email?.split('@')[0]}
            </p>

            <div style={{
              padding: '0.5rem 1rem',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '0.625rem',
              color: '#ef4444',
              fontSize: '0.8125rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem'
            }}>
              <ShieldCheck size={16} color="#ef4444" />
              Super Administrador
            </div>

            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--superadmin-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <CheckCircle size={18} color={userData?.estado === 'activo' ? '#10b981' : '#ef4444'} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem' }}>Estado</div>
                  <div style={{ color: 'var(--superadmin-text-primary)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'capitalize' }}>
                    {userData?.estado}
                  </div>
                </div>
              </div>

              {userData?.cedula && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={18} color='#ef4444' />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem' }}>Identificación</div>
                    <div style={{ color: 'var(--superadmin-text-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
                      {userData.cedula}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información detallada (derecha) - Solo Lectura */}
          <div style={{
            background: 'var(--superadmin-card-bg)',
            backdropFilter: 'blur(1.25rem)',
            border: '0.0625rem solid var(--superadmin-border)',
            borderRadius: '1.25rem',
            padding: isMobile ? '1.25rem' : '1.5rem',
            boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              color: 'var(--superadmin-text-primary)',
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: '700',
              margin: '0 0 1.25rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.9
            }}>
              INFORMACIÓN PERSONAL
            </h3>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)', 
              gap: '1rem' 
            }}>
              {/* Nombres */}
              <div>
                <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                  Nombres
                </label>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--superadmin-input-bg)',
                  border: '1px solid var(--superadmin-input-border)',
                  borderRadius: '0.625rem',
                  color: 'var(--superadmin-text-primary)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={16} color='var(--superadmin-text-muted)' />
                  {userData?.nombre || 'No especificado'}
                </div>
              </div>

              {/* Apellidos */}
              <div>
                <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                  Apellidos
                </label>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--superadmin-input-bg)',
                  border: '1px solid var(--superadmin-input-border)',
                  borderRadius: '0.625rem',
                  color: 'var(--superadmin-text-primary)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <User size={16} color='var(--superadmin-text-muted)' />
                  {userData?.apellido || 'No especificado'}
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                  Email
                </label>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--superadmin-input-bg)',
                  border: '1px solid var(--superadmin-input-border)',
                  borderRadius: '0.625rem',
                  color: 'var(--superadmin-text-primary)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Mail size={16} color='var(--superadmin-text-muted)' />
                  {userData?.email || 'No especificado'}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                  Teléfono
                </label>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--superadmin-input-bg)',
                  border: '1px solid var(--superadmin-input-border)',
                  borderRadius: '0.625rem',
                  color: 'var(--superadmin-text-primary)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Phone size={16} color='var(--superadmin-text-muted)' />
                  {userData?.telefono || 'No especificado'}
                </div>
              </div>

              {/* Dirección */}
              <div style={{ gridColumn: isSmallScreen ? '1' : 'span 2' }}>
                <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                  Dirección
                </label>
                <div style={{
                  padding: '0.625rem 0.875rem',
                  background: 'var(--superadmin-input-bg)',
                  border: '1px solid var(--superadmin-input-border)',
                  borderRadius: '0.625rem',
                  color: 'var(--superadmin-text-primary)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <MapPin size={16} color='var(--superadmin-text-muted)' />
                  {userData?.direccion || 'No especificado'}
                </div>
              </div>

              {/* Fecha de nacimiento */}
              {userData?.fecha_nacimiento && (
                <div>
                  <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                    Fecha de Nacimiento
                  </label>
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    background: 'var(--superadmin-input-bg)',
                    border: '1px solid var(--superadmin-input-border)',
                    borderRadius: '0.625rem',
                    color: 'var(--superadmin-text-primary)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Calendar size={16} color='var(--superadmin-text-muted)' />
                    {new Date(userData.fecha_nacimiento).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Género */}
              {userData?.genero && (
                <div>
                  <label style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.375rem' }}>
                    Género
                  </label>
                  <div style={{
                    padding: '0.625rem 0.875rem',
                    background: 'var(--superadmin-input-bg)',
                    border: '1px solid var(--superadmin-input-border)',
                    borderRadius: '0.625rem',
                    color: 'var(--superadmin-text-primary)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Users size={16} color='var(--superadmin-text-muted)' />
                    {userData.genero.charAt(0).toUpperCase() + userData.genero.slice(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Configuraciones del Sistema */}
      <div style={{
        background: 'var(--superadmin-card-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--superadmin-border)',
        borderRadius: '20px',
        padding: isMobile ? '1.25rem' : '2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isMobile ? '1.25rem' : '2rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0.5rem 1.25rem rgba(245, 158, 11, 0.3)'
          }}>
            <Server size={24} color="#fff" />
          </div>
          <h2 style={{ color: 'var(--superadmin-text-primary)', fontSize: isMobile ? '1.125rem' : '1.4rem', fontWeight: '700', margin: 0 }}>
            Configuraciones del Sistema
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(auto-fit, minmax(18.75rem, 1fr))', gap: isMobile ? '1rem' : '1.5rem' }}>
          {/* Configuración de Backup */}
          <div style={{
            background: 'var(--superadmin-input-bg)',
            border: '1px solid var(--superadmin-input-border)',
            borderRadius: '1rem',
            padding: isMobile ? '1.25rem' : '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Database size={20} color="#10b981" />
              <h3 style={{ color: 'var(--superadmin-text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Backup Automático
              </h3>
            </div>
            <p style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Configura la frecuencia de respaldos automáticos
            </p>
            <select style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--superadmin-input-bg)',
              border: '1px solid var(--superadmin-input-border)',
              borderRadius: '0.5rem',
              color: 'var(--superadmin-text-primary)',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem' }}>
              <CheckCircle size={16} />
              Último backup: Hoy 22:00
            </div>
          </div>

          {/* Configuración de Notificaciones */}
          <div style={{
            background: 'var(--superadmin-input-bg)',
            border: '1px solid var(--superadmin-input-border)',
            borderRadius: '1rem',
            padding: isMobile ? '1.25rem' : '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Mail size={20} color="#3b82f6" />
              <h3 style={{ color: 'var(--superadmin-text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Notificaciones
              </h3>
            </div>
            <p style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Gestiona las notificaciones del sistema
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--superadmin-text-secondary)', fontSize: '0.85rem' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                Errores críticos
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--superadmin-text-secondary)', fontSize: '0.85rem' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                Nuevos registros
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--superadmin-text-secondary)', fontSize: '0.85rem' }}>
                <input type="checkbox" style={{ accentColor: '#3b82f6' }} />
                Actualizaciones del sistema
              </label>
            </div>
          </div>

          {/* Configuración de Mantenimiento */}
          <div style={{
            background: 'var(--superadmin-input-bg)',
            border: '1px solid var(--superadmin-input-border)',
            borderRadius: '1rem',
            padding: isMobile ? '1.25rem' : '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Activity size={20} color="#f59e0b" />
              <h3 style={{ color: 'var(--superadmin-text-primary)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Mantenimiento
              </h3>
            </div>
            <p style={{ color: 'var(--superadmin-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Herramientas de mantenimiento del sistema
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button style={{
                padding: '0.5rem 1rem',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.375rem',
                color: '#f59e0b',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
              }}>
                Limpiar caché
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.375rem',
                color: '#10b981',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
              }}>
                Optimizar BD
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa de foto - Pantalla completa con X */}
      {showPhotoPreview && createPortal(
        <div
          onClick={() => {
            setShowPhotoPreview(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'photoPreviewFadeIn 0.3s ease-out',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollBehavior: 'smooth',
            cursor: 'pointer'
          }}>
          <style>{`
            @keyframes photoPreviewFadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes photoScale {
              from {
                transform: translate(-50%, -50%) scale(0.85);
                opacity: 0;
              }
              to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
            }
            @keyframes closeButtonAppear {
              from {
                opacity: 0;
                transform: scale(0.7) rotate(-90deg);
              }
              to {
                opacity: 1;
                transform: scale(1) rotate(0deg);
              }
            }
            @keyframes rotatePhoto {
              from {
                transform: translate(-50%, -50%) rotate(0deg);
              }
              to {
                transform: translate(-50%, -50%) rotate(360deg);
              }
            }
          `}</style>

          {/* Botón cerrar (X) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPhotoPreview(false);
            }}
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100001,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
              animation: 'closeButtonAppear 0.3s ease-out both',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            }}>
            <X size={22} />
          </button>

          {/* Foto ampliada en el centro */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPhotoHovered(true)}
            onMouseLeave={() => setIsPhotoHovered(false)}
            style={{
              position: 'fixed',
              left: '50%',
              top: '50%',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '6rem',
              fontWeight: '700',
              color: '#fff',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.2)',
              border: '4px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
              animation: isPhotoHovered
                ? 'photoScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, rotatePhoto 3s linear infinite'
                : 'photoScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              cursor: 'default',
              transition: 'transform 0.3s ease'
            }}>
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de perfil"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))'
              }}>
                {getInitials()}
              </span>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ConfiguracionPanel;
