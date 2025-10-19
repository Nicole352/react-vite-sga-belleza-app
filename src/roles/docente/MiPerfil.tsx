import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Edit, Save, X, CheckCircle2, AlertCircle, Award, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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
      if (!token || !docente) return;

      let ident = ((formData.identificacion ?? docente.identificacion) || (docente as any).cedula || '').toString();
      const nombres = (formData.nombres ?? docente.nombres) as string;
      const apellidos = (formData.apellidos ?? docente.apellidos) as string;
      const fecha_nacimiento = (formData.fecha_nacimiento ?? docente.fecha_nacimiento) as string | undefined;
      const titulo_profesional = (formData.titulo_profesional ?? docente.titulo_profesional) as string;
      const experiencia_anos = (formData.experiencia_anos ?? docente.experiencia_anos ?? 0) as number;
      const estado = (formData as any).estado ?? (docente as any).estado ?? 'activo';

      // 1) Resolver id_docente buscando por identificacion/username, con fallback a listado amplio
      let id_docente: number | null = null;
      let registro: any = null;
      const namesKey = `${docente.nombres} ${docente.apellidos}`.trim().toLowerCase();
      // intento 1: por identificacion
      try {
        const res1 = await fetch(`${API_BASE}/docentes?search=${encodeURIComponent(ident)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res1.ok) {
          const lista1 = await res1.json();
          if (Array.isArray(lista1)) {
            registro = lista1.find((d: any) => `${(d.identificacion || d.cedula || '').toString().trim()}` === ident.trim());
            id_docente = registro?.id_docente ?? null;
          }
        }
      } catch {}
      // intento 2: por username
      if (!id_docente && docente.username) {
        try {
          const res2 = await fetch(`${API_BASE}/docentes?search=${encodeURIComponent(docente.username)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res2.ok) {
            const lista2 = await res2.json();
            if (Array.isArray(lista2)) {
              registro = lista2.find((d: any) => d.username === docente.username);
              id_docente = registro?.id_docente ?? null;
            }
          }
        } catch {}
      }
      // intento 3: listar muchos y filtrar localmente
      if (!id_docente) {
        const res3 = await fetch(`${API_BASE}/docentes?limit=1000`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res3.ok) throw new Error('No se pudo obtener la lista de docentes');
        const lista3 = await res3.json();
        if (Array.isArray(lista3)) {
          registro = lista3.find((d: any) => `${(d.identificacion || d.cedula || '').toString().trim()}` === ident.trim())
                  || lista3.find((d: any) => (d.username || '').toString() === (docente.username || '').toString())
                  || lista3.find((d: any) => `${(d.nombres || '').toString().trim().toLowerCase()} ${(d.apellidos || '').toString().trim().toLowerCase()}` === namesKey);
          id_docente = registro?.id_docente ?? null;
        }
      }
      // si no tenemos identificacion, intenta usar la del registro encontrado o consultarla
      if (!ident.trim() && registro?.identificacion) {
        ident = `${registro.identificacion}`;
      }
      if (!ident.trim()) {
        // intentar obtener desde /api/usuarios/:id (cedula)
        try {
          const resU = await fetch(`${API_BASE}/usuarios/${docente.id_usuario}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (resU.ok) {
            const dataU = await resU.json();
            const ced = dataU?.usuario?.cedula || dataU?.usuario?.cedula?.toString?.();
            if (ced) ident = `${ced}`;
          }
        } catch {}
      }
      if (!ident.trim() && id_docente) {
        // intentar obtener desde /api/docentes/:id (identificacion)
        try {
          const resD = await fetch(`${API_BASE}/docentes/${id_docente}`);
          if (resD.ok) {
            const dataD = await resD.json();
            const identDoc = dataD?.docente?.identificacion || dataD?.identificacion;
            if (identDoc) ident = `${identDoc}`;
          }
        } catch {}
      }
      if (!ident.trim()) {
        throw new Error('La identificación es obligatoria');
      }
      if (!id_docente) throw new Error('No se encontró el ID del docente (verifica tu identificación)');

      // 2) Enviar PUT con el payload requerido por el backend
      const response = await fetch(`${API_BASE}/docentes/${id_docente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          identificacion: ident.trim(),
          nombres,
          apellidos,
          fecha_nacimiento: fecha_nacimiento || null,
          titulo_profesional,
          experiencia_anos: Number(experiencia_anos) || 0,
          estado
        })
      });

      if (response.ok) {
        await fetchPerfil();
        setEditing(false);
        toast.success('Perfil actualizado exitosamente', {
          icon: <CheckCircle2 size={20} />,
        });
      } else {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el perfil', {
        icon: <AlertCircle size={20} />,
      });
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
    return <div style={{ textAlign: 'center', padding: '3.75em', color: theme.textSecondary }}>Cargando perfil...</div>;
  }

  if (!docente) {
    return <div style={{ textAlign: 'center', padding: '3.75em', color: theme.textSecondary }}>No se pudo cargar el perfil</div>;
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: theme.textPrimary, margin: '0 0 0.25em 0' }}>
            Mi Perfil
          </h2>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0 }}>
            Gestiona tu información personal
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '0.625em 0.875em',
              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
              border: 'none',
              borderRadius: '0.625em',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <Edit size={16} />
            Editar Perfil
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.625em' }}>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(docente);
              }}
              style={{
                padding: '0.625em 0.875em',
                background: 'transparent',
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.625em',
                color: theme.textSecondary,
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.625em 0.875em',
                background: `linear-gradient(135deg, ${theme.success}, ${theme.success}dd)`,
                border: 'none',
                borderRadius: '0.625em',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1em', flex: 1 }}>
        {/* Card de perfil */}
        <div style={{
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1em',
          padding: '1em',
          textAlign: 'center'
        }}>
          <div style={{
            width: '5.25rem',
            height: '5.25rem',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75em',
            fontSize: '2rem',
            fontWeight: '800',
            color: '#fff',
            boxShadow: `0 0.5rem 1.5rem ${theme.accent}40`
          }}>
            {docente.nombres.charAt(0)}{docente.apellidos.charAt(0)}
          </div>

          <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.125em 0' }}>
            {docente.nombres} {docente.apellidos}
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '0 0 0.375em 0' }}>
            @{docente.username}
          </p>
          
          <div style={{
            padding: '0.375em 0.75em',
            background: `${theme.accent}20`,
            borderRadius: '0.875em',
            color: theme.accent,
            fontSize: '0.8rem',
            fontWeight: '700',
            display: 'inline-block',
            marginTop: '0.5em'
          }}>
            👨‍🏫 Docente
          </div>

          <div style={{
            marginTop: '1em',
            paddingTop: '1em',
            borderTop: `0.0625rem solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em', marginBottom: '0.5em' }}>
              <Award size={16} color={theme.success} />
              <div style={{ textAlign: 'left', flex: 1 }}>
                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>Título</div>
                <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
                  {docente.titulo_profesional}
                </div>
              </div>
            </div>

            {docente.experiencia_anos !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                <Calendar size={16} color={theme.accent} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>Experiencia</div>
                  <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
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
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1em',
          padding: '1em'
        }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.75em 0' }}>
            Información Personal
          </h3>

          <div style={{ display: 'grid', gap: '0.75em' }}>
            {/* Identificación */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.375em' }}>
                Identificación
              </label>
              <div style={{
                padding: '0.625em 0.75em',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '0.9rem'
              }}>
                <FileText size={14} style={{ display: 'inline', marginRight: '0.375em' }} /> {docente.identificacion}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.375em' }}>
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625em 0.75em',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `0.0625rem solid ${theme.border}`,
                    borderRadius: '0.5em',
                    color: theme.textPrimary,
                    fontSize: '0.9rem'
                  }}
                />
              ) : (
                <div style={{
                  padding: '0.625em 0.75em',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: '0.5em',
                  color: theme.textPrimary,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}>
                  <Mail size={14} color={theme.textMuted} />
                  {docente.email || 'No especificado'}
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label style={{ color: theme.textMuted, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.375em' }}>
                Teléfono
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.625em 0.75em',
                    background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: `0.0625rem solid ${theme.border}`,
                    borderRadius: '0.5em',
                    color: theme.textPrimary,
                    fontSize: '0.9rem'
                  }}
                />
              ) : (
                <div style={{
                  padding: '0.625em 0.75em',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: '0.5em',
                  color: theme.textPrimary,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}>
                  <Phone size={14} color={theme.textMuted} />
                  {docente.telefono || 'No especificado'}
                </div>
              )}
            </div>

            {/* Fecha de Nacimiento */}
            {docente.fecha_nacimiento && (
              <div>
                <label style={{ color: theme.textMuted, fontSize: '0.8rem', fontWeight: '600', display: 'block', marginBottom: '0.375em' }}>
                  Fecha de Nacimiento
                </label>
                <div style={{
                  padding: '0.625em 0.75em',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: '0.5em',
                  color: theme.textPrimary,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}>
                  <Calendar size={14} color={theme.textMuted} />
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
