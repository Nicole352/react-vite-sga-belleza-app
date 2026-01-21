import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Award, Clock, CheckCircle, User, MapPin, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/api` : 'http://localhost:3000/api';

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  tipo_curso: string;
  progreso: number;
  calificacion: number;
  tareasPendientes: number;
  estado_matricula: string;
  fecha_matricula: string;
  docente: {
    nombre_completo: string | null;
    titulo: string | null;
  };
  aula: {
    nombre: string | null;
    ubicacion: string | null;
  };
  horario: {
    hora_inicio: string | null;
    hora_fin: string | null;
    dias: string | null;
  };
}

interface HistorialAcademicoProps {
  darkMode: boolean;
}

const HistorialAcademico: React.FC<HistorialAcademicoProps> = ({ darkMode }) => {
  const [cursosActivos, setCursosActivos] = useState<Curso[]>([]);
  const [cursosFinalizados, setCursosFinalizados] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState<'activos' | 'finalizados'>('activos');

  const theme = {
    cardBg: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.3)',
    accent: '#fbbf24',
    success: darkMode ? '#10b981' : '#059669',
    warning: darkMode ? '#f59e0b' : '#d97706',
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE}/estudiantes/historial-academico`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursosActivos(data.activos || []);
        setCursosFinalizados(data.finalizados || []);
      } else {
        toast.error('Error al cargar el historial académico');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calcularDuracion = (fechaInicio: string, fechaFin: string) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const meses = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  };

  const descargarNotas = async (idCurso: number, nombreCurso: string) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/calificaciones/reporte-estudiante/${idCurso}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al descargar');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Notas_${nombreCurso.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Reporte descargado correctamente');
    } catch (error) {
      console.error('Error descarga:', error);
      toast.error('Error al descargar el reporte');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3.75em 1.25em' }}>
        <div style={{
          width: '3.75rem',
          height: '3.75rem',
          border: `0.25rem solid ${theme.textMuted}`,
          borderTop: `0.25rem solid ${theme.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.25em'
        }} />
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>Cargando historial...</p>
      </div>
    );
  }

  const cursosAMostrar = vistaActual === 'activos' ? cursosActivos : cursosFinalizados;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '0.75rem' }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: theme.textPrimary,
          margin: '0 0 0.25rem 0'
        }}>
          Historial Académico
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>
          Revisa tu progreso y cursos completados
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        padding: '0.25rem',
        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '0.75rem',
        width: 'fit-content'
      }}>
        <button
          onClick={() => setVistaActual('activos')}
          style={{
            padding: '0.5rem 1.25rem',
            background: vistaActual === 'activos'
              ? '#f59e0b'
              : 'transparent',
            border: 'none',
            borderRadius: '0.625rem',
            color: vistaActual === 'activos' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: vistaActual === 'activos' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none'
          }}
        >
          <BookOpen size={14} />
          Activos ({cursosActivos.length})
        </button>

        <button
          onClick={() => setVistaActual('finalizados')}
          style={{
            padding: '0.5rem 1.25rem',
            background: vistaActual === 'finalizados'
              ? '#f59e0b'
              : 'transparent',
            border: 'none',
            borderRadius: '0.625rem',
            color: vistaActual === 'finalizados' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: vistaActual === 'finalizados' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none'
          }}
        >
          <Award size={14} />
          Finalizados ({cursosFinalizados.length})
        </button>
      </div>

      {/* Lista de Cursos */}
      {cursosAMostrar.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3em 1em',
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1em',
          backdropFilter: 'blur(1.25rem)',
          boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
        }}>
          {vistaActual === 'activos' ? <BookOpen size={48} style={{ margin: '0 auto 1em', color: theme.textMuted, opacity: 0.5 }} /> : <Award size={48} style={{ margin: '0 auto 1em', color: theme.textMuted, opacity: 0.5 }} />}
          <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
            {vistaActual === 'activos'
              ? 'No tienes cursos activos'
              : 'No tienes cursos finalizados'}
          </h3>
          <p style={{ color: theme.textMuted, margin: 0 }}>
            {vistaActual === 'activos'
              ? 'Tus cursos activos aparecerán aquí'
              : 'Tus cursos finalizados aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="responsive-grid-auto" style={{ gap: '0.75rem' }}>
          {cursosAMostrar.map((curso, index) => {
            const esFinalizado = vistaActual === 'finalizados';
            const coloresGradiente = [
              ['#fbbf24', '#f59e0b'], // Dorado brillante
              ['#f59e0b', '#d97706'], // Dorado medio
              ['#d97706', '#b45309'], // Dorado oscuro
              ['#fbbf24', '#d97706'], // Dorado brillante a oscuro
              ['#f59e0b', '#b45309'], // Dorado medio a muy oscuro
              ['#fcd34d', '#f59e0b']  // Dorado claro a medio
            ];
            const [color1, color2] = coloresGradiente[index % coloresGradiente.length];

            return (
              <div
                key={`curso-${curso.id_curso}-${index}`}
                style={{
                  background: theme.cardBg,
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: darkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.5rem)';
                  e.currentTarget.style.boxShadow = darkMode
                    ? `0 1.25rem 2.5rem ${color1}40`
                    : `0 1.25rem 2.5rem ${color1}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header Neutral */}
                <div style={{
                  padding: '1rem',
                  position: 'relative',
                  borderBottom: `1px solid ${theme.border}`,
                  background: darkMode ? 'rgba(251, 191, 36, 0.03)' : '#fff'
                }}>
                  {/* Línea de acento superior sutil */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${color1}, ${color2})`
                  }} />

                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                        padding: '0.25em 0.75em',
                        borderRadius: '0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: theme.textSecondary
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <div style={{
                        background: esFinalizado ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        padding: '0.25em 0.75em',
                        borderRadius: '0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: esFinalizado ? '#ef4444' : '#10b981',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25em'
                      }}>
                        {esFinalizado ? <Award size={12} /> : <CheckCircle size={12} />}
                        {esFinalizado ? 'Finalizado' : 'En Curso'}
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      color: theme.textPrimary,
                      margin: '0',
                      lineHeight: '1.3'
                    }}>
                      {curso.nombre}
                    </h3>
                  </div>
                </div>

                {/* Contenido */}
                <div style={{ padding: '0.5rem' }}>

                  {/* Grid de Información Principal */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {/* Aula */}
                    {curso.aula.nombre && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <MapPin size={10} color={theme.success} />
                          <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Aula
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                          {curso.aula.nombre}
                        </div>
                      </div>
                    )}

                    {/* Horario */}
                    {curso.horario.hora_inicio ? (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Clock size={10} color={theme.accent} />
                          <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Horario
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                          {curso.horario.hora_inicio?.slice(0, 5)} - {curso.horario.hora_fin?.slice(0, 5)}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Clock size={10} color={theme.textMuted} />
                          <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Duración
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                          {calcularDuracion(curso.fecha_inicio, curso.fecha_fin)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Período */}
                  <div style={{
                    background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Calendar size={10} color={theme.accent} />
                      <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Período
                      </span>
                    </div>
                    <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                      {formatearFecha(curso.fecha_inicio)} - {formatearFecha(curso.fecha_fin)}
                    </div>
                  </div>

                  {/* Docente */}
                  {curso.docente.nombre_completo && (
                    <div style={{
                      background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${theme.border}`,
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <User size={10} color={theme.accent} />
                        <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                          Docente
                        </span>
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                        {curso.docente.nombre_completo}
                      </div>
                    </div>
                  )}

                  {/* Estadísticas Centradas (Estilo Mobile) */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: esFinalizado ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                    gap: '1rem',
                    padding: '1rem 0',
                    borderTop: `1px solid ${theme.border}`,
                    marginTop: '0.5rem'
                  }}>
                    {/* Progreso */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: theme.accent, marginBottom: '0.25rem' }}>
                        {curso.progreso}%
                      </div>
                      <div style={{ fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                        Progreso
                      </div>
                    </div>

                    {/* Promedio */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: '800', color: curso.calificacion >= 7 ? theme.success : theme.warning, marginBottom: '0.25rem' }}>
                        {curso.calificacion != null ? Number(curso.calificacion).toFixed(2) : '0.00'}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                        Promedio
                      </div>
                    </div>

                    {/* Pendientes */}
                    {!esFinalizado && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: '800', color: curso.tareasPendientes > 0 ? theme.warning : theme.success, marginBottom: '0.25rem' }}>
                          {curso.tareasPendientes}
                        </div>
                        <div style={{ fontSize: '0.6rem', color: theme.textMuted, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>
                          Pendientes
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón Descargar Notas */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        descargarNotas(curso.id_curso, curso.nombre);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        background: darkMode ? 'rgba(245, 158, 11, 0.2)' : '#fffbeb',
                        color: '#d97706',
                        border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : '#fcd34d'}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Table2 size={18} />
                      Descargar Notas
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistorialAcademico;
