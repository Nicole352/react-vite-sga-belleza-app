import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaVenusMars, FaLock, FaKey, FaCheckCircle, FaEye, FaEyeSlash, FaUserTie } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { UserCircle } from 'lucide-react';
import { RedColorPalette } from '../../utils/colorMapper';
import toast from 'react-hot-toast';

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

const Perfil = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [isPhotoHovered, setIsPhotoHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    genero: ''
  });

  const [passwordData, setPasswordData] = useState({
    password_actual: '',
    password_nueva: '',
    confirmar_password: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    fetchUserData();
    loadFoto();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          direccion: data.direccion || '',
          fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
          genero: data.genero || ''
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar datos del perfil');
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
        const fotoResponse = await fetch(`${API_BASE}/api/usuarios/${data.id_usuario}/foto-perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (fotoResponse.ok) {
          const blob = await fotoResponse.blob();
          setFotoUrl(URL.createObjectURL(blob));
        }
      }
    } catch (error) {
      console.error('Error cargando foto:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/usuarios/mi-perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');
        setIsEditing(false);
        fetchUserData();
      } else {
        toast.error(data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.password_nueva !== passwordData.confirmar_password) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.password_nueva.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password_actual: passwordData.password_actual,
          password_nueva: passwordData.password_nueva
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Contraseña actualizada correctamente');
        setPasswordData({
          password_actual: '',
          password_nueva: '',
          confirmar_password: ''
        });
      } else {
        toast.error(data.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!userData) return 'AD';
    return `${userData.nombre.charAt(0)}${userData.apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header con ícono */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '700', 
            color: 'var(--admin-text-primary)', 
            margin: '0 0 0.375rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem'
          }}>
            <UserCircle size={26} color={RedColorPalette.primary} />
            Mi Perfil
          </h2>
          <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.8125rem', margin: 0 }}>
            Gestiona tu información personal y seguridad
          </p>
        </div>
      </div>

      {/* Overlay de animación - Backdrop oscuro */}
      {isAnimating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          zIndex: 99998,
          animation: 'backdropFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          backdropFilter: 'blur(20px)',
          pointerEvents: 'none'
        }}>
          <style>{`
            @keyframes backdropFadeIn {
              from {
                opacity: 0;
                backdrop-filter: blur(0px);
              }
              to {
                opacity: 1;
                backdrop-filter: blur(20px);
              }
            }
          `}</style>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--admin-border)'
      }}>
        <button
          onClick={() => setActiveTab('info')}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'info' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'info' ? 'var(--admin-text-primary)' : 'var(--admin-text-muted)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
          <FaUser size={14} />
          Información Personal
        </button>
        <button
          onClick={() => setActiveTab('password')}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'password' ? '2px solid #ef4444' : '2px solid transparent',
            color: activeTab === 'password' ? 'var(--admin-text-primary)' : 'var(--admin-text-muted)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
          <FaLock size={14} />
          Cambiar Contraseña
        </button>
      </div>

      {/* Contenido de los tabs */}
      {activeTab === 'info' && (
        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', flex: 1 }}>
            {/* Card de perfil (izquierda) */}
            <div style={{
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}>
              {/* Foto de perfil con animación */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAnimating(true);
                  setTimeout(() => {
                    setShowPhotoPreview(true);
                  }, 800);
                }}
                style={{
                  position: isAnimating ? 'fixed' : 'relative',
                  left: isAnimating ? '50%' : '0',
                  top: isAnimating ? '50%' : '0',
                  width: '5.25rem',
                  height: '5.25rem',
                  borderRadius: '50%',
                  background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: '#fff',
                  border: isAnimating ? 'none' : '0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  margin: '0 auto 0.75rem',
                  boxShadow: isAnimating ? 'none' : '0 0.5rem 1.5rem rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isAnimating ? 'translate(-50%, -50%) scale(4) rotate(360deg)' : 'scale(1) rotate(0deg)',
                  zIndex: isAnimating ? 99999 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAnimating) {
                    e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  }
                }}>
                {fotoUrl ? (
                  <img 
                    src={fotoUrl} 
                    alt="Foto de perfil" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }} 
                  />
                ) : (
                  <span style={{
                    transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: isAnimating ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))' : 'none'
                  }}>
                    {getInitials()}
                  </span>
                )}
              </div>

              <h3 style={{ color: 'var(--admin-text-primary)', fontSize: '1rem', fontWeight: '700', margin: '0 0 0.125rem 0' }}>
                {userData?.nombre} {userData?.apellido}
              </h3>
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', margin: '0 0 0.375rem 0' }}>
                @{userData?.email?.split('@')[0]}
              </p>
              
              <div style={{
                padding: '0.375rem 0.75rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '0.5rem',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                marginTop: '0.5rem'
              }}>
                <FaUserTie size={12} />
                {userData?.rol}
              </div>

              <div style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--admin-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                  <FaCheckCircle size={16} color={userData?.estado === 'activo' ? '#ef4444' : '#dc2626'} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem' }}>Estado</div>
                    <div style={{ color: 'var(--admin-text-primary)', fontSize: '0.8125rem', fontWeight: '600', textTransform: 'capitalize' }}>
                      {userData?.estado}
                    </div>
                  </div>
                </div>

                {userData?.cedula && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <FaUser size={16} color='#ef4444' />
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.7rem' }}>Identificación</div>
                      <div style={{ color: 'var(--admin-text-primary)', fontSize: '0.8125rem', fontWeight: '600' }}>
                        {userData.cedula}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones Editar/Guardar */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}>
                    <FaUser size={14} />
                    Editar Perfil
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}>
                      <FaCheckCircle size={14} />
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserData();
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        color: 'var(--admin-text-secondary)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}>
                      <IoMdClose size={16} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Información detallada (derecha) */}
            <div style={{
              background: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-border)',
              borderRadius: '20px',
              padding: '24px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
            }}>
              <h3 style={{ 
                color: 'var(--admin-text-primary)', 
                fontSize: '0.875rem', 
                fontWeight: '700', 
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                opacity: 0.9
              }}>
                INFORMACIÓN PERSONAL
              </h3>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {/* Nombres */}
                <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Nombres
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                      required
                    />
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaUser size={14} color='var(--admin-text-muted)' />
                      {formData.nombre || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Apellidos */}
                <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Apellidos
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                      required
                    />
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaUser size={14} color='var(--admin-text-muted)' />
                      {formData.apellido || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                      required
                    />
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaEnvelope size={14} color='var(--admin-text-muted)' />
                      {formData.email || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaPhone size={14} color='var(--admin-text-muted)' />
                      {formData.telefono || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--admin-input-bg)',
                        border: '1px solid var(--admin-border)',
                        borderRadius: '0.5rem',
                        color: 'var(--admin-text-primary)',
                        fontSize: '0.8125rem'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaMapMarkerAlt size={14} color='var(--admin-text-muted)' />
                      {formData.direccion || 'No especificado'}
                    </div>
                  )}
                </div>

                {/* Fecha de nacimiento */}
                {formData.fecha_nacimiento && (
                  <div>
                    <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                      Fecha de Nacimiento
                    </label>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaBirthdayCake size={14} color='var(--admin-text-muted)' />
                      {new Date(formData.fecha_nacimiento).toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Género */}
                {formData.genero && (
                  <div>
                    <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                      Género
                    </label>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--admin-input-bg)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '0.5rem',
                      color: 'var(--admin-text-primary)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaVenusMars size={14} color='var(--admin-text-muted)' />
                      {formData.genero.charAt(0).toUpperCase() + formData.genero.slice(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword}>
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            background: 'var(--theme-card-bg)',
            border: '1px solid var(--theme-border)',
            borderRadius: '20px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}>
            <h3 style={{ 
              color: 'var(--admin-text-primary)', 
              fontSize: '0.875rem', 
              fontWeight: '700', 
              margin: '0 0 1rem 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.9
            }}>
              CAMBIAR CONTRASEÑA
            </h3>

            {/* Contraseña Actual */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Contraseña Actual
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.password_actual}
                  onChange={(e) => setPasswordData({ ...passwordData, password_actual: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    paddingRight: '2.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    color: 'var(--admin-text-primary)',
                    transition: 'all 0.2s'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  {showCurrentPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div style={{ marginBottom: '0.875rem' }}>
              <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.password_nueva}
                  onChange={(e) => setPasswordData({ ...passwordData, password_nueva: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    paddingRight: '2.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    color: 'var(--admin-text-primary)',
                    transition: 'all 0.2s'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  {showNewPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-muted)', margin: '0.375rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaCheckCircle size={10} style={{ color: passwordData.password_nueva.length >= 8 ? '#ef4444' : 'var(--admin-text-muted)' }} />
                Mínimo 8 caracteres
              </p>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: 'var(--admin-text-muted)', fontSize: '0.75rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>
                Confirmar Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmar_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmar_password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    paddingRight: '2.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    background: 'var(--admin-input-bg)',
                    border: '1px solid var(--admin-input-border)',
                    color: 'var(--admin-text-primary)',
                    transition: 'all 0.2s'
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--admin-text-muted)',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                  {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {passwordData.confirmar_password && (
                <p style={{ fontSize: '0.7rem', color: passwordData.password_nueva === passwordData.confirmar_password ? '#ef4444' : '#ef4444', margin: '0.375rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaCheckCircle size={10} />
                  {passwordData.password_nueva === passwordData.confirmar_password ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </p>
              )}
            </div>

            {/* Botón Cambiar Contraseña */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.625rem 0.875rem',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}>
                <HiOutlineShieldCheck size={16} />
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Vista previa de foto - Pantalla completa con X */}
      {showPhotoPreview && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'photoPreviewFadeIn 0.5s ease-out',
            backdropFilter: 'blur(20px)'
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
                transform: translate(-50%, -50%) scale(0.8) rotate(-10deg);
                opacity: 0;
              }
              to {
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
              }
            }
            @keyframes closeButtonAppear {
              from {
                opacity: 0;
                transform: scale(0.5) rotate(-180deg);
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

          {/* Botón cerrar (X) - Mejorado */}
          <button
            onClick={() => {
              setShowPhotoPreview(false);
              setIsAnimating(false);
            }}
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100001,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              animation: 'closeButtonAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
              backdropFilter: 'blur(20px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
            }}>
            <IoMdClose size={22} style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }} />
          </button>

          {/* Foto ampliada en el centro */}
          <div 
            onMouseEnter={() => setIsPhotoHovered(true)}
            onMouseLeave={() => setIsPhotoHovered(false)}
            style={{
            position: 'fixed',
            left: '50%',
            top: '50%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: fotoUrl ? 'transparent' : 'linear-gradient(135deg, #6b7280, #4b5563)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6rem',
            fontWeight: '700',
            color: '#fff',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(255, 255, 255, 0.1)',
            border: '4px solid rgba(255, 255, 255, 0.15)',
            overflow: 'hidden',
            animation: isPhotoHovered 
              ? 'photoScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, rotatePhoto 3s linear infinite'
              : 'photoScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            backdropFilter: 'blur(10px)'
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


        </div>
      )}
    </div>
  );
};

export default Perfil;
