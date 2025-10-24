import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Award, TrendingUp, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  calificacion: number;
  progreso: number;
}

interface Calificacion {
  id_calificacion: number;
  id_tarea: number;
  tarea_titulo: string; // Backend devuelve 'tarea_titulo'
  nota: number; // Backend devuelve 'nota'
  nota_maxima: number;
  fecha_calificacion: string;
  comentario_docente: string; // Backend devuelve 'comentario_docente'
  modulo_nombre: string;
  modulo_orden: number;
  resultado: string; // aprobado/reprobado
}

interface CalificacionesPorCurso {
  curso: Curso;
  calificaciones: Calificacion[];
  promedio: number;
}

const Calificaciones: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [cursosConCalificaciones, setCursosConCalificaciones] = useState<CalificacionesPorCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCursos, setExpandedCursos] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');

  const theme = {
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.3)',
    cardBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    accent: '#fbbf24',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Obtener cursos del estudiante
      const cursosResponse = await fetch(`${API_BASE}/estudiantes/mis-cursos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!cursosResponse.ok) {
        throw new Error('Error al cargar los cursos');
      }

      const cursos: Curso[] = await cursosResponse.json();
      
      // Obtener calificaciones por curso
      const cursosConCalificacionesData: CalificacionesPorCurso[] = [];
      
      for (const curso of cursos) {
        try {
          const calificacionesResponse = await fetch(
            `${API_BASE}/calificaciones/estudiante/curso/${curso.id_curso}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (calificacionesResponse.ok) {
            const calificacionesData = await calificacionesResponse.json();
            const calificaciones = Array.isArray(calificacionesData.calificaciones) 
              ? calificacionesData.calificaciones 
              : [];
            
            // Calcular promedio (solo calificaciones válidas)
            const calificacionesValidas = calificaciones.filter((cal: Calificacion) => 
              cal.nota !== null && cal.nota !== undefined
            ).map((cal: Calificacion) => ({
              ...cal,
              nota: parseFloat(cal.nota as any) || 0,
              nota_maxima: parseFloat(cal.nota_maxima as any) || 20
            }));
            const totalNotas = calificacionesValidas.reduce((sum: number, cal: Calificacion) => sum + cal.nota, 0);
            const promedio = calificacionesValidas.length > 0 ? totalNotas / calificacionesValidas.length : 0;
            
            cursosConCalificacionesData.push({
              curso,
              calificaciones,
              promedio
            });
          }
        } catch (error) {
          console.error(`Error cargando calificaciones para curso ${curso.id_curso}:`, error);
        }
      }
      
      setCursosConCalificaciones(cursosConCalificacionesData);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
      setError('Error al cargar las calificaciones');
    } finally {
      setLoading(false);
    }
  };

  const toggleCurso = (cursoId: number) => {
    setExpandedCursos(prev => ({
      ...prev,
      [cursoId]: !prev[cursoId]
    }));
  };

  const getColorByGrade = (grade: number) => {
    if (grade >= 18) return theme.success;
    if (grade >= 14) return theme.warning;
    return theme.danger;
  };

  const getGradeLabel = (grade: number) => {
    if (grade >= 18) return 'Excelente';
    if (grade >= 16) return 'Muy Bueno';
    if (grade >= 14) return 'Bueno';
    if (grade >= 11) return 'Regular';
    return 'Insuficiente';
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
        color: theme.textPrimary
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: `4px solid ${theme.textMuted}`,
            borderTop: `4px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.75rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <Award size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Error al cargar</h3>
        <p style={{ color: theme.textMuted, margin: 0 }}>{error}</p>
        <button
          onClick={fetchCalificaciones}
          style={{
            marginTop: '1rem',
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff',
        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            background: `linear-gradient(135deg, ${theme.accent}, #f59e0b)`,
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              color: theme.textPrimary,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0
            }}>
              Mis Calificaciones
            </h1>
            <p style={{ color: theme.textMuted, margin: '0.25rem 0 0 0' }}>
              Revisa tu rendimiento académico en todos tus cursos
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      {cursosConCalificaciones.length > 0 ? (
        <>
          {/* Tarjeta destacada de promedio general */}
          <div style={{
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05))',
            border: `2px solid ${theme.success}`,
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: darkMode 
              ? '0 8px 32px rgba(16, 185, 129, 0.2)'
              : '0 8px 32px rgba(16, 185, 129, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  background: `linear-gradient(135deg, ${theme.success}, #059669)`,
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
                }}>
                  <TrendingUp size={28} color="#fff" />
                </div>
                <div>
                  <h2 style={{
                    color: theme.textPrimary,
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    margin: 0,
                    marginBottom: '0.25rem'
                  }}>
                    Tu Promedio General
                  </h2>
                  <p style={{ 
                    color: theme.textMuted, 
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    Rendimiento académico en todos tus cursos
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  color: theme.success, 
                  fontSize: '3rem', 
                  fontWeight: '900',
                  lineHeight: 1,
                  marginBottom: '0.5rem'
                }}>
                  {(
                    cursosConCalificaciones.reduce((sum, c) => sum + c.promedio, 0) / 
                    cursosConCalificaciones.length
                  ).toFixed(1)}
                </div>
                <div style={{
                  display: 'inline-block',
                  background: `${theme.success}20`,
                  border: `1px solid ${theme.success}`,
                  borderRadius: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: theme.success
                }}>
                  {getGradeLabel(
                    cursosConCalificaciones.reduce((sum, c) => sum + c.promedio, 0) / 
                    cursosConCalificaciones.length
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas adicionales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>

          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <BookOpen size={20} color="#3b82f6" />
              <span style={{ color: '#3b82f6', fontWeight: '600' }}>Cursos</span>
            </div>
            <div style={{ 
              color: '#3b82f6', 
              fontSize: '1.75rem', 
              fontWeight: '800',
              lineHeight: 1
            }}>
              {cursosConCalificaciones.length}
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
            border: `1px solid ${theme.warning}30`,
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FileText size={20} color={theme.warning} />
              <span style={{ color: theme.warning, fontWeight: '600' }}>Total Tareas</span>
            </div>
            <div style={{ 
              color: theme.warning, 
              fontSize: '1.75rem', 
              fontWeight: '800',
              lineHeight: 1
            }}>
              {cursosConCalificaciones.reduce((sum, c) => sum + c.calificaciones.length, 0)}
            </div>
          </div>
        </div>
        </>
      ) : (
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1))'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05))',
          border: `2px solid ${theme.warning}`,
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '1.5rem',
          textAlign: 'center',
          boxShadow: darkMode 
            ? '0 8px 32px rgba(245, 158, 11, 0.2)'
            : '0 8px 32px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            background: `linear-gradient(135deg, ${theme.warning}, #d97706)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
          }}>
            <Award size={40} color="#fff" />
          </div>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0'
          }}>
            Aún no tienes calificaciones
          </h2>
          <p style={{ 
            color: theme.textMuted, 
            margin: 0,
            fontSize: '1rem',
            lineHeight: 1.6
          }}>
            Tus calificaciones aparecerán aquí una vez que tus docentes evalúen tus entregas.
            <br />
            Mantente al día con tus tareas para obtener buenas notas.
          </p>
        </div>
      )}

      {/* Lista de cursos con calificaciones */}
      {cursosConCalificaciones.length === 0 ? (
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <Award size={48} style={{ color: theme.textMuted, margin: '0 auto 1rem' }} />
          <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5rem 0' }}>
            No hay calificaciones registradas
          </h3>
          <p style={{ color: theme.textMuted, margin: 0 }}>
            Aún no tienes calificaciones en tus cursos
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cursosConCalificaciones.map(({ curso, calificaciones, promedio }) => (
            <div
              key={curso.id_curso}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '1rem',
                overflow: 'hidden'
              }}
            >
              {/* Header del curso */}
              <div
                onClick={() => toggleCurso(curso.id_curso)}
                style={{
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: `linear-gradient(135deg, ${theme.accent}, #f59e0b)`,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{
                      color: theme.textPrimary,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {curso.nombre}
                    </h3>
                    <p style={{ color: theme.textMuted, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                      {curso.codigo_curso}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      color: getColorByGrade(promedio), 
                      fontSize: '1.25rem', 
                      fontWeight: '700' 
                    }}>
                      {promedio.toFixed(1)}
                    </div>
                    <div style={{ 
                      color: theme.textMuted, 
                      fontSize: '0.8rem',
                      marginTop: '0.125rem'
                    }}>
                      {getGradeLabel(promedio)}
                    </div>
                  </div>
                  {expandedCursos[curso.id_curso] ? (
                    <ChevronDown size={20} style={{ color: theme.textMuted }} />
                  ) : (
                    <ChevronRight size={20} style={{ color: theme.textMuted }} />
                  )}
                </div>
              </div>

              {/* Detalle de calificaciones */}
              {expandedCursos[curso.id_curso] && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  {calificaciones.length === 0 ? (
                    <div style={{
                      background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                      border: `1px solid ${theme.warning}30`,
                      borderRadius: '0.75rem',
                      padding: '1.5rem',
                      textAlign: 'center',
                      marginTop: '1rem'
                    }}>
                      <Award size={32} color={theme.warning} style={{ marginBottom: '0.5rem' }} />
                      <p style={{ 
                        color: theme.textPrimary, 
                        margin: '0 0 0.25rem 0',
                        fontWeight: '600'
                      }}>
                        Sin calificaciones aún
                      </p>
                      <p style={{ 
                        color: theme.textMuted, 
                        margin: 0,
                        fontSize: '0.9rem'
                      }}>
                        Completa y entrega tus tareas para recibir calificaciones
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem',
                      marginTop: '1rem'
                    }}>
                      {calificaciones.map((calificacion) => (
                        <div
                          key={calificacion.id_calificacion}
                          style={{
                            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '0.75rem',
                            padding: '1rem'
                          }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '0.5rem'
                          }}>
                            <div>
                              <h4 style={{
                                color: theme.textPrimary,
                                fontSize: '1rem',
                                fontWeight: '600',
                                margin: 0
                              }}>
                                {calificacion.tarea_titulo}
                              </h4>
                              <p style={{ 
                                color: theme.textMuted, 
                                margin: '0.25rem 0 0 0', 
                                fontSize: '0.9rem' 
                              }}>
                                {calificacion.modulo_nombre}
                              </p>
                            </div>
                            <div style={{ 
                              background: getColorByGrade(parseFloat(calificacion.nota as any) || 0) + '20',
                              border: `1px solid ${getColorByGrade(parseFloat(calificacion.nota as any) || 0)}30`,
                              borderRadius: '0.5rem',
                              padding: '0.25rem 0.75rem'
                            }}>
                              <span style={{ 
                                color: getColorByGrade(parseFloat(calificacion.nota as any) || 0), 
                                fontWeight: '700',
                                fontSize: '1.1rem'
                              }}>
                                {(parseFloat(calificacion.nota as any) || 0).toFixed(1)}
                              </span>
                              <span style={{ 
                                color: theme.textMuted, 
                                marginLeft: '0.25rem',
                                fontSize: '0.9rem'
                              }}>
                                /{(parseFloat(calificacion.nota_maxima as any) || 20)}
                              </span>
                            </div>
                          </div>

                          {calificacion.comentario_docente && (
                            <div style={{
                              background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                              border: `1px solid ${theme.border}`,
                              borderRadius: '0.5rem',
                              padding: '0.75rem',
                              marginTop: '0.75rem'
                            }}>
                              <p style={{ 
                                color: theme.textSecondary, 
                                margin: 0,
                                fontStyle: 'italic'
                              }}>
                                "{calificacion.comentario_docente}"
                              </p>
                            </div>
                          )}

                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: `1px solid ${theme.border}`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Calendar size={16} style={{ color: theme.textMuted }} />
                              <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                                {new Date(calificacion.fecha_calificacion).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <div style={{ 
                              background: getColorByGrade(((parseFloat(calificacion.nota as any) || 0) / (parseFloat(calificacion.nota_maxima as any) || 20)) * 20) + '20',
                              borderRadius: '0.5rem',
                              padding: '0.25rem 0.5rem'
                            }}>
                              <span style={{ 
                                color: getColorByGrade(((parseFloat(calificacion.nota as any) || 0) / (parseFloat(calificacion.nota_maxima as any) || 20)) * 20), 
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                {getGradeLabel(((parseFloat(calificacion.nota as any) || 0) / (parseFloat(calificacion.nota_maxima as any) || 20)) * 20)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Calificaciones;