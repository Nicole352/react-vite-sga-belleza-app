import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Award, MapPin, Edit2, Save, X } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

interface MiPerfilProps {
  darkMode: boolean;
}

interface DocenteData {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  titulo_profesional: string;
  experiencia_anos?: number;
  username: string;
}

const MiPerfil: React.FC<MiPerfilProps> = ({ darkMode }) => {
  const [docente, setDocente] = useState<DocenteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DocenteData>>({});

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setDocente(data);
        setFormData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      
      // TODO: Implementar endpoint de actualización
      const response = await fetch(`${API_BASE}/docentes/${docente?.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPerfil();
        setEditing(false);
        alert('Perfil actualizado exitosamente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const getThemeColors = () => {
    if (darkMode) {
      return {
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#10b981'
      };
    } else {
      return {
        cardBg: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#059669'
      };
    }
  };

  const theme = getThemeColors();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.textSecondary }}>Cargando perfil...</div>;
  }

  if (!docente) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.textSecondary }}>No se pudo cargar el perfil</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: theme.textPrimary, margin: '0 0 8px 0' }}>
            Mi Perfil
          </h2>
          <p style={{ color: theme.textMuted, fontSize: '1rem', margin: 0 }}>
            Gestiona tu información personal
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '12px 24px',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Edit2 size={18} />
            Editar Perfil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(docente);
              }}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                color: theme.textSecondary,
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <X size={18} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}dd)`,
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Save size={18} />
              Guardar
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Card de perfil */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '3rem',
            fontWeight: '800',
            color: '#fff',
            boxShadow: `0 8px 24px ${theme.accent}40`
          }}>
            {docente.nombres.charAt(0)}{docente.apellidos.charAt(0)}
          </div>

          <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '800', margin: '0 0 4px 0' }}>
            {docente.nombres} {docente.apellidos}
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: '0 0 8px 0' }}>
            @{docente.username}
          </p>
          
          <div style={{
            padding: '8px 16px',
            background: `${theme.accent}20`,
            borderRadius: '20px',
            color: theme.accent,
            fontSize: '0.85rem',
            fontWeight: '700',
            display: 'inline-block',
            marginTop: '12px'
          }}>
            👨‍🏫 Docente
          </div>

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Award size={20} color={theme.success} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>Título</div>
                <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                  {docente.titulo_profesional}
                </div>
              </div>
            </div>

            {docente.experiencia_anos !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color={theme.accent} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>Experiencia</div>
                  <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                    {docente.experiencia_anos} años
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información detallada */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '32px'
        }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', margin: '0 0 24px 0' }}>
            Información Personal
          </h3>

          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Identificación */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Identificación
              </label>
              <div style={{
                padding: '12px 16px',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${theme.border}`,
                borderRadius: '10px',
                color: theme.textPrimary,
                fontSize: '0.95rem'
              }}>
                📋 {docente.identificacion}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '10px',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Mail size={16} color={theme.textMuted} />
                  {docente.email || 'No especificado'}
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                Teléfono
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '10px',
                    color: theme.textPrimary,
                    fontSize: '0.95rem'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '10px',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={16} color={theme.textMuted} />
                  {docente.telefono || 'No especificado'}
                </div>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            {docente.fecha_nacimiento && (
              <div>
                <label style={{ color: theme.textMuted, fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Fecha de Nacimiento
                </label>
                <div style={{
                  padding: '12px 16px',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '10px',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={16} color={theme.textMuted} />
                  {new Date(docente.fecha_nacimiento).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiPerfil;
