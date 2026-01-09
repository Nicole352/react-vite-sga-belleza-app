import { useState, useEffect } from 'react';
import { Users, Award, Star, Calendar, BookOpen, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
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
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activos' | 'finalizados'>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

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

        // Sort students alphabetically by apellido
        const sortedData = [...data].sort((a: Estudiante, b: Estudiante) => {
          const apellidoA = (a.apellido || '').trim().toUpperCase();
          const apellidoB = (b.apellido || '').trim().toUpperCase();
          return apellidoA.localeCompare(apellidoB, 'es');
        });
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
        cardBg: 'rgba(30, 41, 59, 0.7)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#3b82f6',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171'
      };
    } else {
      return {
        cardBg: '#ffffff',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#64748b',
        border: 'rgba(15, 23, 42, 0.08)',
        accent: '#2563eb',
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, cursoFiltro, estadoFiltro]);

  // Filter students based on search, course, and status filters
  const estudiantesFiltrados = estudiantes.filter(est => {
    const matchTexto =
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.cedula.includes(searchTerm) ||
      est.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCurso = !cursoFiltro || est.codigo_curso === cursoFiltro;

    const studentEstado = est.estado_curso || 'activo';

    const matchEstado = estadoFiltro === 'todos' ||
      (estadoFiltro === 'activos' && studentEstado === 'activo') ||
      (estadoFiltro === 'finalizados' && studentEstado === 'finalizado');

    return matchTexto && matchCurso && matchEstado;
  }).sort((a, b) => {
    const apellidoA = (a.apellido || '').trim().toUpperCase();
    const apellidoB = (b.apellido || '').trim().toUpperCase();
    return apellidoA.localeCompare(apellidoB, 'es');
  });

  // Pagination logic
  const totalPages = Math.ceil(estudiantesFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const estudiantesPaginados = estudiantesFiltrados.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      <div style={{ marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.15rem 0', letterSpacing: '-0.02em' }}>
          Mis Estudiantes
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0, fontWeight: 500 }}>
          Gestiona y monitorea el progreso de tus estudiantes en todos tus cursos
        </p>
      </div>

      {/* Estadísticas (ultra-compactas) */}
      <div className="responsive-grid-4" style={{ gap: '0.4rem', marginBottom: '0.75rem' }}>
        <div style={{ background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)', border: `1px solid ${theme.border}`, borderRadius: '0.5rem', padding: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', whiteSpace: 'nowrap', color: theme.textSecondary }}>
            <Users size={12} color={theme.accent} />
            <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Total:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: theme.textPrimary }}>{estudiantesFiltrados.length}</span>
          </div>
        </div>
        <div style={{ background: darkMode ? 'rgba(52, 211, 153, 0.08)' : 'rgba(5, 150, 105, 0.04)', border: `1px solid ${theme.border}`, borderRadius: '0.5rem', padding: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', whiteSpace: 'nowrap', color: theme.textSecondary }}>
            <Award size={12} color={theme.success} />
            <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Exitosos:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: theme.success }}>{estudiantesFiltrados.filter(e => e.promedio && e.promedio >= 8).length}</span>
          </div>
        </div>
        <div style={{ background: darkMode ? 'rgba(251, 191, 36, 0.08)' : 'rgba(217, 119, 6, 0.04)', border: `1px solid ${theme.border}`, borderRadius: '0.5rem', padding: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', whiteSpace: 'nowrap', color: theme.textSecondary }}>
            <Star size={12} color={theme.warning} />
            <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Promedio:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: theme.warning }}>{estudiantesFiltrados.length > 0 ? (estudiantesFiltrados.reduce((acc, e) => acc + (e.promedio || 0), 0) / estudiantesFiltrados.length).toFixed(1) : '0.0'}</span>
          </div>
        </div>
        <div style={{ background: darkMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(124, 58, 237, 0.04)', border: `1px solid ${theme.border}`, borderRadius: '0.5rem', padding: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', whiteSpace: 'nowrap', color: theme.textSecondary }}>
            <BookOpen size={12} color={darkMode ? '#8b5cf6' : '#7c3aed'} />
            <span style={{ fontSize: '0.65rem', fontWeight: '600' }}>Cursos:</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: theme.textPrimary }}>{cursosUnicos.length}</span>
          </div>
        </div>
      </div>

      {/* Filtros y Toggle de vista */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar estudiante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 auto',
            minWidth: '150px',
            padding: '0.4rem 0.65rem',
            background: darkMode ? 'rgba(255,255,255,0.02)' : '#fff',
            border: `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            color: theme.textPrimary,
            fontSize: '0.8rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        />
        <select
          value={cursoFiltro}
          onChange={(e) => setCursoFiltro(e.target.value)}
          style={{
            flex: '0 1 auto',
            minWidth: '140px',
            padding: '0.4rem 0.65rem',
            background: darkMode ? 'rgba(255,255,255,0.02)' : '#fff',
            border: `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            color: theme.textPrimary,
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer'
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
            flex: '0 1 auto',
            minWidth: '140px',
            padding: '0.4rem 0.65rem',
            background: darkMode ? 'rgba(255,255,255,0.02)' : '#fff',
            border: `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            color: theme.textPrimary,
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="todos">Todos los estados</option>
          <option value="activos">Cursos Activos</option>
          <option value="finalizados">Cursos Finalizados</option>
        </select>

        <div style={{ display: 'flex', gap: '2px', background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', padding: '2px', borderRadius: '0.375rem' }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '0.35rem 0.65rem',
              background: viewMode === 'cards' ? theme.cardBg : 'transparent',
              border: 'none',
              borderRadius: '0.25rem',
              color: viewMode === 'cards' ? theme.accent : theme.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Grid size={14} /> Tarjetas
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '0.35rem 0.65rem',
              background: viewMode === 'table' ? theme.cardBg : 'transparent',
              border: 'none',
              borderRadius: '0.25rem',
              color: viewMode === 'table' ? theme.accent : theme.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <List size={14} /> Tabla
          </button>
        </div>
      </div>

      <div style={{ flex: 1 }}>
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
        ) : viewMode === 'table' ? (
          <div style={{
            overflowX: 'auto',
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: '0.75rem',
            boxShadow: darkMode
              ? '0 2px 12px rgba(0, 0, 0, 0.3)'
              : '0 2px 12px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Header de la tabla mejorado */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1.2fr 0.8fr 0.6fr 0.6fr',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
              borderBottom: `1px solid ${theme.border}`,
              fontWeight: '700',
              fontSize: '0.65rem',
              color: theme.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              minWidth: '700px'
            }}>
              <div>Estudiante</div>
              <div>Identificación</div>
              <div>Curso</div>
              <div>Estado</div>
              <div>Inicio</div>
              <div>Fin</div>
            </div>

            {/* Filas de estudiantes */}
            <div style={{ display: 'grid', gap: '0', padding: '0', minWidth: '700px' }}>
              {estudiantesPaginados.map((estudiante) => {
                // Determine status color
                let statusColor = theme.textMuted;
                let statusText = 'Desconocido';

                const studentEstado = estudiante.estado_curso || 'activo';

                switch (studentEstado) {
                  case 'activo':
                    statusColor = theme.success;
                    statusText = 'Activo';
                    break;
                  case 'finalizado':
                    statusColor = theme.textMuted;
                    statusText = 'Finalizado';
                    break;
                  case 'planificado':
                    statusColor = theme.warning;
                    statusText = 'Planificado';
                    break;
                  case 'cancelado':
                    statusColor = theme.danger;
                    statusText = 'Cancelado';
                    break;
                  default:
                    statusText = studentEstado || 'Activo';
                }

                return (
                  <div
                    key={`${estudiante.id_usuario}-${estudiante.codigo_curso}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.5fr 1fr 1.2fr 0.8fr 0.6fr 0.6fr',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderBottom: `1px solid ${theme.border}`,
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {/* Columna: Estudiante */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <div style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: '800',
                        flexShrink: 0
                      }}>
                        {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'normal' }}>
                        {estudiante.apellido}, {estudiante.nombre}
                      </div>
                    </div>

                    {/* Columna: Cédula */}
                    <div style={{ color: theme.textSecondary, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                      {estudiante.cedula}
                    </div>

                    {/* Columna: Curso */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflow: 'hidden', minWidth: 0 }}>
                      <span style={{
                        background: `${theme.accent}15`,
                        color: theme.accent,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {estudiante.codigo_curso}
                      </span>
                      <span style={{
                        color: theme.textSecondary,
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {estudiante.curso_nombre}
                      </span>
                    </div>

                    {/* Columna: Estado */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        color: statusColor,
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        {statusText}
                      </span>
                    </div>

                    {/* Columna: Fecha Inicio */}
                    <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>
                      {formatDate(estudiante.fecha_inicio_curso)}
                    </div>

                    {/* Columna: Fecha Fin */}
                    <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>
                      {formatDate(estudiante.fecha_fin_curso)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderTop: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
              }}>
                <span style={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: '600' }}>
                  Pág. {currentPage} de {totalPages} · {estudiantesFiltrados.length} alumnos
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme.border}`,
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: currentPage === 1 ? theme.textMuted : theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.color = theme.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textPrimary;
                      }
                    }}
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((numero) => {
                      // Logic to show limited page numbers like in standard pagination if needed, 
                      // but TomarAsistencia showed all. Assuming user wants identical style.
                      // However, TomarAsistencia code viewed was:
                      // Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => ( ... ))
                      // So it shows all pages. I will do the same but maybe I should limit it if there are many pages.
                      // The original code in MisEstudiantes had logic to limit shown pages.
                      // TomarAsistencia.tsx code I copied DOES NOT have logic to limit pages, it maps all.
                      // I'll stick to what TomarAsistencia has as requested "identico". 
                      // Wait, if there are 100 pages it will break. 
                      // TomarAsistencia code: 
                      // {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => ( ... ))}
                      // I will use that logic.
                      return (
                        <button
                          key={numero}
                          onClick={() => goToPage(numero)}
                          style={{
                            minWidth: '1.75rem',
                            height: '1.75rem',
                            borderRadius: '0.375rem',
                            border: numero === currentPage ? 'none' : `1px solid ${theme.border}`,
                            background: numero === currentPage ? theme.accent : 'transparent',
                            color: numero === currentPage ? '#fff' : theme.textPrimary,
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (numero !== currentPage) {
                              e.currentTarget.style.borderColor = theme.accent;
                              e.currentTarget.style.color = theme.accent;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (numero !== currentPage) {
                              e.currentTarget.style.borderColor = theme.border;
                              e.currentTarget.style.color = theme.textPrimary;
                            }
                          }}
                        >
                          {numero}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme.border}`,
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: currentPage === totalPages ? theme.textMuted : theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.color = theme.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textPrimary;
                      }
                    }}
                  >
                    Siguiente <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vista de Cards */
          <div>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
              {estudiantesPaginados.map((estudiante) => {
                // Determine status color
                let statusColor = theme.textMuted;
                let statusText = 'Desconocido';
                const studentEstado = estudiante.estado_curso || 'activo';

                switch (studentEstado) {
                  case 'activo':
                    statusColor = theme.success;
                    statusText = 'Activo';
                    break;
                  case 'finalizado':
                    statusColor = theme.textMuted;
                    statusText = 'Finalizado';
                    break;
                  case 'planificado':
                    statusColor = theme.warning;
                    statusText = 'Planificado';
                    break;
                  case 'cancelado':
                    statusColor = theme.danger;
                    statusText = 'Cancelado';
                    break;
                  default:
                    statusText = studentEstado || 'Activo';
                }

                return (
                  <div
                    key={`${estudiante.id_usuario}-${estudiante.codigo_curso}`}
                    style={{
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = darkMode
                        ? '0 4px 12px rgba(59, 130, 246, 0.2)'
                        : '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Header: Avatar, Nombre y Estado */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '1.5rem',
                        height: '1.5rem',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        flexShrink: 0
                      }}>
                        {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: theme.textPrimary, fontSize: '0.8rem', fontWeight: '700' }}>
                          {estudiante.apellido}, {estudiante.nombre}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '0.65rem' }}>
                          Identificación: {estudiante.cedula}
                        </div>
                      </div>
                      <span style={{
                        color: statusColor,
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        whiteSpace: 'nowrap'
                      }}>
                        {statusText}
                      </span>
                    </div>

                    {/* Fila integrada: Curso, Inicio y Fin */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem',
                      background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '0.375rem',
                      fontSize: '0.65rem'
                    }}>
                      {/* Curso */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, minWidth: 0 }}>
                        <BookOpen size={10} color={theme.accent} />
                        <span style={{
                          color: theme.textPrimary,
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {estudiante.codigo_curso}: {estudiante.curso_nombre}
                        </span>
                      </div>

                      {/* Separador */}
                      <div style={{ width: '1px', height: '1rem', background: theme.border, flexShrink: 0 }} />

                      {/* Fechas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                        <Calendar size={10} color={theme.textMuted} />
                        <span style={{ color: theme.textSecondary, fontWeight: '500' }}>
                          {formatDate(estudiante.fecha_inicio_curso).substring(0, 5)} - {formatDate(estudiante.fecha_fin_curso).substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación para cards */}
            {totalPages > 1 && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderTop: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem',
                background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                marginTop: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: theme.textSecondary, fontWeight: '600' }}>
                  Pág. {currentPage} de {totalPages} · {estudiantesFiltrados.length} alumnos
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme.border}`,
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: currentPage === 1 ? theme.textMuted : theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.color = theme.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textPrimary;
                      }
                    }}
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((numero) => {
                      return (
                        <button
                          key={numero}
                          onClick={() => goToPage(numero)}
                          style={{
                            minWidth: '1.75rem',
                            height: '1.75rem',
                            borderRadius: '0.375rem',
                            border: numero === currentPage ? 'none' : `1px solid ${theme.border}`,
                            background: numero === currentPage ? theme.accent : 'transparent',
                            color: numero === currentPage ? '#fff' : theme.textPrimary,
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (numero !== currentPage) {
                              e.currentTarget.style.borderColor = theme.accent;
                              e.currentTarget.style.color = theme.accent;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (numero !== currentPage) {
                              e.currentTarget.style.borderColor = theme.border;
                              e.currentTarget.style.color = theme.textPrimary;
                            }
                          }}
                        >
                          {numero}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme.border}`,
                      background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: currentPage === totalPages ? theme.textMuted : theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = theme.accent;
                        e.currentTarget.style.color = theme.accent;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== totalPages) {
                        e.currentTarget.style.borderColor = theme.border;
                        e.currentTarget.style.color = theme.textPrimary;
                      }
                    }}
                  >
                    Siguiente <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisEstudiantes;
