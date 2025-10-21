import { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, Trash2, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface PerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  theme: any;
  userData: {
    id_usuario: number;
    nombre?: string;
    apellido?: string;
    nombres?: string;
    apellidos?: string;
    email?: string;
    username?: string;
  };
  onPhotoUpdated?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PerfilModal = ({ isOpen, onClose, darkMode, theme, userData, onPhotoUpdated }: PerfilModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener iniciales
  const getInitials = () => {
    const firstName = userData?.nombres || userData?.nombre;
    const lastName = userData?.apellidos || userData?.apellido;
    
    if (!firstName || !lastName) return 'U';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  // Cargar foto actual al abrir el modal
  useEffect(() => {
    if (isOpen && userData?.id_usuario) {
      loadCurrentPhoto();
    }
  }, [isOpen, userData?.id_usuario]);

  // Limpiar preview al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const loadCurrentPhoto = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/usuarios/${userData.id_usuario}/foto-perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setCurrentPhotoUrl(url);
      } else {
        setCurrentPhotoUrl(null);
      }
    } catch (error) {
      console.error('Error al cargar foto:', error);
      setCurrentPhotoUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no válido. Solo se permiten: JPG, PNG, WEBP');
      return;
    }

    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Tamaño máximo: 2 MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setUploading(true);

    try {
      const token = sessionStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('foto', selectedFile);

      const response = await fetch(`${API_BASE}/api/usuarios/${userData.id_usuario}/foto-perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Foto de perfil actualizada correctamente');
        setSelectedFile(null);
        setPreviewUrl(null);
        await loadCurrentPhoto();
        if (onPhotoUpdated) onPhotoUpdated();
        // Cerrar modal automáticamente después de subir
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        toast.error(data.message || 'Error al subir la foto');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      toast.error('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPhotoUrl) {
      toast.error('No hay foto para eliminar');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return;
    }

    setDeleting(true);

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/usuarios/${userData.id_usuario}/foto-perfil`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Foto de perfil eliminada correctamente');
        setCurrentPhotoUrl(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        if (onPhotoUpdated) onPhotoUpdated();
        // Cerrar modal automáticamente después de eliminar
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        toast.error(data.message || 'Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error al eliminar foto:', error);
      toast.error('Error al eliminar la foto');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Solo cubre el contenido, NO el navbar */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: '4.5rem',
          left: 0,
          right: 0,
          bottom: 0,
          background: darkMode 
            ? 'rgba(0, 0, 0, 0.4)' 
            : 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Modal */}
      <div
        className="responsive-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: darkMode ? theme.contentBg : theme.contentBg,
          borderRadius: '0.75rem',
          boxShadow: '0 1.25rem 3.75rem rgba(0, 0, 0, 0.3)',
          border: `1px solid ${theme.border}`,
          width: '90%',
          maxWidth: '26rem',
          maxHeight: 'calc(100vh - 6.25rem)',
          overflowY: 'auto',
          zIndex: 9999,
          animation: 'slideInDown 0.3s ease-out'
        }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.5)'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: '700',
            color: theme.textPrimary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={20} color="#ef4444" />
            Mi Perfil
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
            <X size={24} color={theme.textSecondary} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          {/* Información del usuario */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1.25rem',
            padding: '1rem',
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: '0.625rem',
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              margin: '0 0 0.375rem 0',
              fontSize: '1rem',
              fontWeight: '600',
              color: theme.textPrimary
            }}>
              {userData.nombres || userData.nombre} {userData.apellidos || userData.apellido}
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: theme.textSecondary
            }}>
              {userData.email || userData.username}
            </p>
          </div>

          {/* Preview de foto actual o nueva */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.25rem'
          }}>
            {/* Avatar/Foto */}
            <div style={{
              width: '7.5rem',
              height: '7.5rem',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `3px solid ${theme.border}`,
              boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.1)',
              background: previewUrl || currentPhotoUrl 
                ? 'transparent' 
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {previewUrl || currentPhotoUrl ? (
                <img
                  src={previewUrl || currentPhotoUrl || ''}
                  alt="Foto de perfil"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <span style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#fff',
                  letterSpacing: '2px'
                }}>
                  {getInitials()}
                </span>
              )}
            </div>

            {/* Botones de acción */}
            <div className="responsive-button-group" style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Caso 1: Sin foto y sin archivo seleccionado - Solo "Seleccionar Foto" */}
              {!currentPhotoUrl && !selectedFile && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || deleting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                    opacity: uploading || deleting ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 0.25rem 0.75rem rgba(59, 130, 246, 0.3)',
                    flex: 1,
                    minWidth: '12.5rem',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!uploading && !deleting) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}>
                  <Camera size={18} />
                  Seleccionar Foto
                </button>
              )}

              {/* Caso 2: Archivo seleccionado (preview) - "Seleccionar Otra" + "Subir" */}
              {selectedFile && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                      opacity: uploading || deleting ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                      flex: 1,
                      minWidth: '150px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading && !deleting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.3)';
                    }}>
                    <Camera size={18} />
                    Otra Foto
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading || deleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                      opacity: uploading || deleting ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      flex: 1,
                      minWidth: '150px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading && !deleting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }}>
                    <Upload size={18} />
                    {uploading ? 'Subiendo...' : 'Subir Foto'}
                  </button>
                </>
              )}

              {/* Caso 3: Foto ya cargada - "Actualizar" + "Eliminar" */}
              {currentPhotoUrl && !selectedFile && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || deleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                      opacity: uploading || deleting ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      flex: 1,
                      minWidth: '150px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading && !deleting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}>
                    <Camera size={18} />
                    Actualizar Foto
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={uploading || deleting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: uploading || deleting ? 'not-allowed' : 'pointer',
                      opacity: uploading || deleting ? 0.6 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      flex: 1,
                      minWidth: '150px',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!uploading && !deleting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}>
                    <Trash2 size={18} />
                    {deleting ? 'Eliminando...' : 'Eliminar Foto'}
                  </button>
                </>
              )}
            </div>

            {/* Input oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Información adicional */}
          <div style={{
            padding: '0.75rem',
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            color: theme.textSecondary,
            lineHeight: '1.5'
          }}>
            <strong style={{ color: theme.textPrimary }}>Nota:</strong> La foto debe ser en formato JPG, PNG o WEBP y no debe superar los 2 MB.
          </div>
        </div>
      </div>

      {/* Estilos de animación */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
        
        /* Responsive para móvil */
        @media (max-width: 640px) {
          .responsive-modal {
            top: 3.75rem !important;
            left: 5% !important;
            right: 5% !important;
            transform: none !important;
            width: 90% !important;
            max-width: 90% !important;
            border-radius: 0.75rem !important;
            max-height: calc(100vh - 5rem) !important;
          }
        }
      `}</style>
    </>
  );
};

export default PerfilModal;
