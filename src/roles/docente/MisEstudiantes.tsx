import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Award, Star } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

interface MisEstudiantesProps {
  darkMode: boolean;
}

interface Estudiante {
  id_usuario: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  telefono?: string;
  curso_nombre: string;
  codigo_curso: string;
  promedio?: number;
}

const MisEstudiantes: React.FC<MisEstudiantesProps> = ({ darkMode }) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<string>('');

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE}/docentes/mis-estudiantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👥 Estudiantes del docente:', data);
        setEstudiantes(data);
      } else {
        console.error('Error al cargar estudiantes');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const cursosUnicos = Array.from(new Set(estudiantes.map(e => `${e.codigo_curso}||${e.curso_nombre}`)))
    .map(k => ({ codigo: k.split('||')[0], nombre: k.split('||')[1] }));

  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchTexto = 
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.cedula.includes(searchTerm) ||
      est.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCurso = !cursoFiltro || est.codigo_curso === cursoFiltro;
    return matchTexto && matchCurso;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.textSecondary }}>Cargando estudiantes...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: theme.textPrimary, margin: '0 0 8px 0' }}>
          Mis Estudiantes
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '1rem', margin: 0 }}>
          Gestiona y monitorea el progreso de tus estudiantes
        </p>
      </div>

      {/* Estadísticas compactas (una sola línea) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
        <div style={{
          background: `linear-gradient(135deg, #3b82f6, #2563eb)`,
          borderRadius: '10px',
          padding: '10px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }} />
          <Users size={18} color="#fff" style={{ marginBottom: '4px', position: 'relative', zIndex: 1 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', position: 'relative', zIndex: 1 }}>
            {estudiantesFiltrados.length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', fontWeight: '700', position: 'relative', zIndex: 1 }}>Total Estudiantes</div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, #10b981, #059669)`,
          borderRadius: '10px',
          padding: '10px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }} />
          <Award size={18} color="#fff" style={{ marginBottom: '4px', position: 'relative', zIndex: 1 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', position: 'relative', zIndex: 1 }}>
            {estudiantesFiltrados.filter(e => e.promedio && e.promedio >= 8).length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', fontWeight: '700', position: 'relative', zIndex: 1 }}>Destacados (≥8.0)</div>
        </div>

        <div style={{
          background: `linear-gradient(135deg, #f59e0b, #d97706)`,
          borderRadius: '10px',
          padding: '10px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }} />
          <Star size={18} color="#fff" style={{ marginBottom: '4px', position: 'relative', zIndex: 1 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', position: 'relative', zIndex: 1 }}>
            {estudiantesFiltrados.length > 0 ? (estudiantesFiltrados.reduce((acc, e) => acc + (e.promedio || 0), 0) / estudiantesFiltrados.length).toFixed(1) : '0.0'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', fontWeight: '700', position: 'relative', zIndex: 1 }}>Promedio General</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 240px', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={20} 
            color={theme.textMuted} 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 44px',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${theme.border}`,
              borderRadius: '10px',
              color: theme.textPrimary,
              fontSize: '0.9rem'
            }}
          />
        </div>
        <select
          value={cursoFiltro}
          onChange={(e) => setCursoFiltro(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `1px solid ${theme.border}`,
            borderRadius: '10px',
            color: theme.textPrimary,
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todos los cursos</option>
          {cursosUnicos.map(c => (
            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre}</option>
          ))}
        </select>
      </div>


      {/* Tabla Educativa de Estudiantes */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {estudiantesFiltrados.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <Users size={64} color={theme.textMuted} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: theme.textPrimary, margin: '0 0 8px 0' }}>
              {searchTerm ? 'No se encontraron estudiantes' : 'No tienes estudiantes asignados'}
            </h3>
            <p style={{ color: theme.textMuted, margin: 0 }}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los estudiantes aparecerán aquí cuando se matriculen en tus cursos'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {/* Header de la tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
              gap: '16px',
              padding: '10px 12px',
              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderRadius: '10px',
              marginBottom: '12px',
              fontWeight: '700',
              fontSize: '0.8rem',
              color: theme.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <div>Estudiante</div>
              <div>Curso</div>
              <div>Contacto</div>
              <div style={{ textAlign: 'center' }}>Promedio</div>
            </div>

            {/* Filas de estudiantes */}
            <div style={{ display: 'grid', gap: '8px' }}>
              {estudiantesFiltrados.map((estudiante, index) => {
                const getPromedioColor = (promedio: number | undefined) => {
                  if (!promedio) return theme.textMuted;
                  if (promedio >= 9) return '#10b981';
                  if (promedio >= 8) return '#3b82f6';
                  if (promedio >= 7) return '#f59e0b';
                  return '#ef4444';
                };

                const getPromedioLabel = (promedio: number | undefined) => {
                  if (!promedio) return 'N/A';
                  if (promedio >= 9) return 'Excelente';
                  if (promedio >= 8) return 'Muy Bueno';
                  if (promedio >= 7) return 'Bueno';
                  return 'Regular';
                };

                return (
                  <div
                    key={estudiante.id_usuario}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
                      gap: '12px',
                      padding: '12px',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '10px',
                      border: `1px solid ${theme.border}`,
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Columna: Estudiante */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        flexShrink: 0
                      }}>
                        {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ 
                          color: theme.textPrimary, 
                          fontSize: '0.9rem', 
                          fontWeight: '700',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {estudiante.nombre} {estudiante.apellido}
                        </div>
                        <div style={{ 
                          color: theme.textMuted, 
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px'
                        }}>
                          <span>ID:</span>
                          <span style={{ fontWeight: '600' }}>{estudiante.cedula}</span>
                        </div>
                      </div>
                    </div>

                    {/* Columna: Curso */}
                    <div>
                      <div style={{
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        display: 'inline-block',
                        marginBottom: '4px'
                      }}>
                        {estudiante.codigo_curso}
                      </div>
                      <div style={{ 
                        color: theme.textPrimary, 
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {estudiante.curso_nombre}
                      </div>
                    </div>

                    {/* Columna: Contacto */}
                    <div>
                      {estudiante.email && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          marginBottom: '4px'
                        }}>
                          <Mail size={12} color={theme.textMuted} />
                          <span style={{ 
                            color: theme.textSecondary, 
                            fontSize: '0.75rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {estudiante.email}
                          </span>
                        </div>
                      )}
                      {estudiante.telefono && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={12} color={theme.textMuted} />
                          <span style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                            {estudiante.telefono}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Columna: Promedio */}
                    <div style={{ textAlign: 'center' }}>
                      {estudiante.promedio !== undefined ? (
                        <div>
                          <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '800',
                            color: getPromedioColor(estudiante.promedio),
                            lineHeight: 1,
                            marginBottom: '2px'
                          }}>
                            {estudiante.promedio.toFixed(1)}
                          </div>
                          <div style={{
                            fontSize: '0.6rem',
                            fontWeight: '600',
                            color: getPromedioColor(estudiante.promedio),
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {getPromedioLabel(estudiante.promedio)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>
                          Sin calificar
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisEstudiantes;
