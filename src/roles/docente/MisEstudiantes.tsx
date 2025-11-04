import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Award, Star, Calendar, BookOpen } from 'lucide-react';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

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
  fecha_inicio_curso?: string;
  fecha_fin_curso?: string;
  estado_curso?: 'activo' | 'finalizado' | 'planificado' | 'cancelado';
  // Add fields that might be available from the current API
  fecha_matricula?: string;
}

const MisEstudiantes: React.FC<MisEstudiantesProps> = ({ darkMode }) => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'finalizados'>('todos');

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

      const response = await fetch(`${API_BASE}/api/docentes/mis-estudiantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('👥 Estudiantes del docente (raw data):', data);
        
        // Sort students alphabetically by apellido
        const sortedData = data.sort((a: Estudiante, b: Estudiante) => 
          a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' })
        );
        setEstudiantes(sortedData);
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
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      };
    } else {
      return {
        cardBg: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626'
      };
    }
  };

  const theme = getThemeColors();

  // Get unique courses for filter dropdown
  const cursosUnicos = Array.from(new Set(estudiantes.map(e => `${e.codigo_curso}||${e.curso_nombre}`)))
    .map(k => ({ codigo: k.split('||')[0], nombre: k.split('||')[1] }));

  // Filter students based on search, course, and status filters
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchTexto =
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.cedula.includes(searchTerm) ||
      est.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCurso = !cursoFiltro || est.codigo_curso === cursoFiltro;
    
    // When estado_curso is not available (undefined), we assume students are active
    // This is a workaround since the backend isn't sending estado_curso
    const studentEstado = est.estado_curso || 'activo';
    
    const matchEstado = estadoFiltro === 'todos' || 
      (estadoFiltro === 'activos' && studentEstado === 'activo') ||
      (estadoFiltro === 'finalizados' && studentEstado === 'finalizado');
    
    return matchTexto && matchCurso && matchEstado;
  });

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3.75em', color: theme.textSecondary }}>Cargando estudiantes...</div>;
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1em' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.textPrimary, margin: '0 0 0.25em 0' }}>
          Mis Estudiantes
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0 }}>
          Gestiona y monitorea el progreso de tus estudiantes
        </p>
      </div>

      {/* Estadísticas (ultra-compactas, una sola línea) */}
      <div className="responsive-grid-4" style={{ gap: '0.375em', marginBottom: '0.75em' }}>
        <div style={{ background: `linear-gradient(135deg, #3b82f6, #2563eb)`, borderRadius: '0.625em', padding: '0.375em' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap', color: '#fff' }}>
            <Users size={12} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Total:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{estudiantesFiltrados.length}</span>
          </div>
        </div>
        <div style={{ background: `linear-gradient(135deg, #10b981, #059669)`, borderRadius: '0.625em', padding: '0.375em' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap', color: '#fff' }}>
            <Award size={12} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Destacados:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{estudiantesFiltrados.filter(e => e.promedio && e.promedio >= 8).length}</span>
          </div>
        </div>
        <div style={{ background: `linear-gradient(135deg, #f59e0b, #d97706)`, borderRadius: '0.625em', padding: '0.375em' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap', color: '#fff' }}>
            <Star size={12} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Promedio:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{estudiantesFiltrados.length > 0 ? (estudiantesFiltrados.reduce((acc, e) => acc + (e.promedio || 0), 0) / estudiantesFiltrados.length).toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div style={{ background: `linear-gradient(135deg, #8b5cf6, #7c3aed)`, borderRadius: '0.625em', padding: '0.375em' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap', color: '#fff' }}>
            <BookOpen size={12} />
            <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Cursos:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '800' }}>{cursosUnicos.length}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="responsive-filters" style={{ marginBottom: '1em', gap: '0.625em' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={20}
            color={theme.textMuted}
            style={{ position: 'absolute', left: '1em', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o curso..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625em 0.75em 0.625em 2.75em',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `0.0625rem solid ${theme.border}`,
              borderRadius: '0.625em',
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
            padding: '0.625em 0.75em',
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '0.625em',
            color: theme.textPrimary,
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todos los cursos</option>
          {cursosUnicos.map(c => (
            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nombre}</option>
          ))}
        </select>
        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value as 'todos' | 'activos' | 'finalizados')}
          style={{
            width: '100%',
            padding: '0.625em 0.75em',
            background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '0.625em',
            color: theme.textPrimary,
            fontSize: '0.9rem'
          }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Cursos Activos</option>
          <option value="finalizados">Cursos Finalizados</option>
        </select>
      </div>


      {/* Lista de Estudiantes (compacta) */}
      <div style={{
        background: theme.cardBg,
        border: `0.0625rem solid ${theme.border}`,
        borderRadius: '1em',
        padding: '1em',
        backdropFilter: 'blur(1.25rem)',
        boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)',
        flex: 1
      }}>
        {estudiantesFiltrados.length === 0 ? (
          <div style={{
            padding: '3.75em 1.25em',
            textAlign: 'center'
          }}>
            <Users size={64} color={theme.textMuted} style={{ marginBottom: '1em', opacity: 0.5 }} />
            <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
              {searchTerm || cursoFiltro || estadoFiltro !== 'todos' 
                ? 'No se encontraron estudiantes' 
                : 'No tienes estudiantes asignados'}
            </h3>
            <p style={{ color: theme.textMuted, margin: 0 }}>
              {searchTerm || cursoFiltro || estadoFiltro !== 'todos' 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Los estudiantes aparecerán aquí cuando se matriculen en tus cursos'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr',
              gap: '0.625em',
              padding: '0.375em 0.5em',
              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              borderRadius: '0.5em',
              marginBottom: '0.5em',
              fontWeight: '700',
              fontSize: '0.75rem',
              color: theme.accent,
              textTransform: 'uppercase',
              letterSpacing: '0.03125em'
            }}>
              <div>Estudiante</div>
              <div>Cédula</div>
              <div>Curso</div>
              <div>Estado</div>
              <div>Inicio</div>
              <div>Fin</div>
            </div>

            {/* Filas de estudiantes */}
            <div style={{ display: 'grid', gap: '0.375em' }}>
              {estudiantesFiltrados.map((estudiante) => {
                // Determine status color
                let statusColor = theme.textMuted;
                let statusBg = 'rgba(156, 163, 175, 0.2)';
                let statusText = 'Desconocido';
                
                // When estado_curso is not available, we assume it's active
                const studentEstado = estudiante.estado_curso || 'activo';
                
                switch (studentEstado) {
                  case 'activo':
                    statusColor = theme.success;
                    statusBg = 'rgba(16, 185, 129, 0.2)';
                    statusText = 'Activo';
                    break;
                  case 'finalizado':
                    statusColor = theme.textMuted;
                    statusBg = 'rgba(156, 163, 175, 0.2)';
                    statusText = 'Finalizado';
                    break;
                  case 'planificado':
                    statusColor = theme.warning;
                    statusBg = 'rgba(245, 158, 11, 0.2)';
                    statusText = 'Planificado';
                    break;
                  case 'cancelado':
                    statusColor = theme.danger;
                    statusBg = 'rgba(239, 68, 68, 0.2)';
                    statusText = 'Cancelado';
                    break;
                  default:
                    statusText = studentEstado || 'Activo (asumido)';
                }

                return (
                  <div
                    key={`${estudiante.id_usuario}-${estudiante.codigo_curso}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr 1fr',
                      gap: '0.5em',
                      padding: '0.5em',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '0.5em',
                      border: `0.0625rem solid ${theme.border}`,
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)';
                      e.currentTarget.style.transform = 'translateX(0.25em)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Columna: Estudiante */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em', minWidth: 0 }}>
                      <div style={{
                        width: '1.75rem',
                        height: '1.75rem',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: '800',
                        flexShrink: 0
                      }}>
                        {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                      </div>
                      <div style={{ overflow: 'hidden', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '700', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {estudiante.nombre} {estudiante.apellido}
                      </div>
                    </div>

                    {/* Columna: Cédula */}
                    <div style={{ color: theme.textSecondary, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {estudiante.cedula}
                    </div>

                    {/* Columna: Curso */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', overflow: 'hidden', minWidth: 0 }}>
                      <span style={{
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        padding: '0.1875em 0.5em',
                        borderRadius: '0.625em',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {estudiante.codigo_curso}
                      </span>
                      <span style={{
                        color: theme.textPrimary,
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {estudiante.curso_nombre}
                      </span>
                    </div>

                    {/* Columna: Estado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                      <span style={{
                        background: statusBg,
                        color: statusColor,
                        padding: '0.1875em 0.5em',
                        borderRadius: '0.625em',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        {statusText}
                      </span>
                    </div>

                    {/* Columna: Fecha Inicio */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                      <Calendar size={12} color={theme.textMuted} />
                      <span style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                        {formatDate(estudiante.fecha_inicio_curso)}
                      </span>
                    </div>

                    {/* Columna: Fecha Fin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                      <Calendar size={12} color={theme.textMuted} />
                      <span style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                        {formatDate(estudiante.fecha_fin_curso)}
                      </span>
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