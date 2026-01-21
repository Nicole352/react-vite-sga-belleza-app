import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, Clock, MapPin, AlertCircle, BarChart3, ChevronRight } from 'lucide-react';

import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface MisCursosProps {
  darkMode: boolean;
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  aula_nombre?: string;
  aula_ubicacion?: string;
  hora_inicio?: string;
  hora_fin?: string;
  dias?: string;
  total_estudiantes: number;
  capacidad_maxima: number;
}

const MisCursos: React.FC<MisCursosProps> = ({ darkMode }) => {
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'activos' | 'finalizados'>('activos');

  useEffect(() => {
    fetchMisCursos();
  }, []);

  useEffect(() => {
    // Filter courses based on active tab
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (activeTab === 'activos') {
      // Cursos activos: estado activo/planificado Y fecha de fin no ha pasado
      setFilteredCursos(cursos.filter(curso => {
        const fechaFin = new Date(curso.fecha_fin);
        fechaFin.setHours(0, 0, 0, 0);

        return (curso.estado === 'activo' || curso.estado === 'planificado') && fechaFin >= hoy;
      }));
    } else {
      // Cursos finalizados: estado finalizado/cancelado O fecha de fin ya pasó
      setFilteredCursos(cursos.filter(curso => {
        const fechaFin = new Date(curso.fecha_fin);
        fechaFin.setHours(0, 0, 0, 0);

        return curso.estado === 'finalizado' || curso.estado === 'cancelado' || fechaFin < hoy;
      }));
    }
  }, [cursos, activeTab]);

  const fetchMisCursos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Usar el endpoint que devuelve TODOS los cursos (activos y finalizados)
      const response = await fetch(`${API_BASE}/api/docentes/todos-mis-cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar los cursos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getThemeColors = () => {
    if (darkMode) {
      return {
        cardBg: '#1e1e1e',
        textPrimary: '#ffffff',
        textSecondary: 'rgba(255, 255, 255, 0.8)',
        textMuted: 'rgba(255, 255, 255, 0.6)',
        border: 'rgba(255, 255, 255, 0.1)',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b'
      };
    } else {
      return {
        cardBg: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30, 41, 59, 0.8)',
        textMuted: 'rgba(30, 41, 59, 0.7)',
        border: '#e2e8f0',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b'
      };
    }
  };

  const theme = getThemeColors();

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
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>Cargando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
        borderRadius: '1em',
        padding: '2em',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1em' }} />
        <h3 style={{ color: '#ef4444', margin: '0 0 0.5em 0' }}>Error al cargar</h3>
        <p style={{ color: theme.textMuted, margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: theme.textPrimary,
          margin: '0 0 0.15rem 0',
          letterSpacing: '-0.02em'
        }}>
          Mis Cursos Asignados
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0, fontWeight: 500 }}>
          Gestiona tus cursos y estudiantes actuales y anteriores
        </p>
      </div>

      {/* Tabs para filtrar cursos */}
      <div style={{
        display: 'flex',
        gap: '0.4rem',
        marginBottom: '0.75rem',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('activos')}
          style={{
            padding: '0.35rem 0.85rem',
            background: activeTab === 'activos'
              ? theme.accent
              : 'transparent',
            border: activeTab === 'activos' ? 'none' : `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            color: activeTab === 'activos' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <BarChart3 size={14} /> Cursos Activos
        </button>

        <button
          onClick={() => setActiveTab('finalizados')}
          style={{
            padding: '0.35rem 0.85rem',
            background: activeTab === 'finalizados'
              ? theme.accent
              : 'transparent',
            border: activeTab === 'finalizados' ? 'none' : `1px solid ${theme.border}`,
            borderRadius: '0.375rem',
            color: activeTab === 'finalizados' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Clock size={14} /> Cursos Finalizados
        </button>
      </div>

      {/* Lista de Cursos */}
      {filteredCursos.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3em 1em',
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1em',
          backdropFilter: 'blur(1.25rem)',
          boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
        }}>
          <BookOpen size={48} style={{ margin: '0 auto 1em', color: theme.textMuted, opacity: 0.5 }} />
          <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
            {activeTab === 'activos'
              ? 'No tienes cursos activos'
              : 'No tienes cursos finalizados'}
          </h3>
          <p style={{ color: theme.textMuted, margin: 0 }}>
            {activeTab === 'activos'
              ? 'Tus cursos activos aparecerán aquí'
              : 'Tus cursos finalizados aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="responsive-grid-auto" style={{ gap: '0.75rem' }}>
          {filteredCursos.map((curso, index) => {
            return (
              <div
                key={`curso-${curso.id_curso}-${index}`}
                style={{
                  background: theme.cardBg,
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: '1em',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.375rem)';
                  e.currentTarget.style.boxShadow = darkMode
                    ? `0 1rem 2rem rgba(0, 0, 0, 0.4)`
                    : `0 1rem 2rem rgba(59, 130, 246, 0.08)`;
                  e.currentTarget.style.borderColor = theme.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header Neutral */}
                <div style={{
                  background: theme.cardBg,
                  padding: '1rem',
                  position: 'relative',
                  borderBottom: `1px solid ${theme.border}`
                }}>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75em' }}>
                      <div style={{
                        background: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: theme.accent
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <div style={{
                        background: curso.estado === 'activo'
                          ? (darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)')
                          : (darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)'),
                        padding: '0.25rem 0.625rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: curso.estado === 'activo' ? theme.success : theme.warning,
                        textTransform: 'uppercase'
                      }}>
                        {curso.estado}
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '800',
                      color: theme.textPrimary,
                      margin: '0 0 0.75rem 0',
                      lineHeight: 1.2
                    }}>
                      {curso.nombre}
                    </h3>

                    {/* Estadística destacada */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        background: darkMode ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        flex: 1,
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.125rem' }}>
                          <Users size={12} color={theme.accent} />
                          <span style={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: '600' }}>
                            Estudiantes
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '1.2rem', fontWeight: '800', lineHeight: 1 }}>
                          {curso.total_estudiantes}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: '0.6rem', marginTop: '0.125rem' }}>
                          de {curso.capacidad_maxima} estudiantes
                        </div>
                      </div>

                      {/* Circular progress */}
                      <div style={{ position: 'relative', width: '3rem', height: '3rem' }}>
                        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                            strokeWidth="4"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke={theme.accent}
                            strokeWidth="4"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - (curso.total_estudiantes / curso.capacidad_maxima))}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: theme.textPrimary,
                          fontSize: '0.7rem',
                          fontWeight: '800'
                        }}>
                          {Math.round((curso.total_estudiantes / curso.capacidad_maxima) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div style={{ padding: '0.75rem' }}>
                  {/* Información en grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    {/* Aula */}
                    {curso.aula_nombre && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <MapPin size={10} color={theme.success} />
                          <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Aula
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                          {curso.aula_nombre}
                        </div>
                      </div>
                    )}

                    {/* Horario */}
                    {curso.hora_inicio && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                          <Clock size={10} color={theme.accent} />
                          <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Horario
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: '700' }}>
                          {curso.hora_inicio?.substring(0, 5)} - {curso.hora_fin?.substring(0, 5)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Período */}
                  <div style={{
                    background: darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                      <Calendar size={10} color={theme.warning} />
                      <span style={{ color: theme.textMuted, fontSize: '0.55rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Período Académico
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                        {new Date(curso.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </div>
                      <ChevronRight size={10} color={theme.textMuted} />
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                        {new Date(curso.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <button style={{
                      padding: '0.5rem',
                      background: theme.accent,
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                      onClick={() => navigate(`/panel/docente/curso/${curso.id_curso}`)}>
                      <BookOpen size={12} />
                      Gestión de Módulos
                    </button>

                    <button style={{
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${theme.accent}`,
                      borderRadius: '0.5rem',
                      color: theme.accent,
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/panel/docente/calificaciones/${curso.id_curso}`);
                      }}>
                      <BarChart3 size={12} />
                      Calificaciones del Curso
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

export default MisCursos;