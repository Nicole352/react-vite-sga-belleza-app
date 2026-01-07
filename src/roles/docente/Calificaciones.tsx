import React, { useState, useEffect } from 'react';
import { BookOpen, Users, BarChart3, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  total_estudiantes: number;
  fecha_fin?: string;
  estado?: 'activo' | 'finalizado' | 'planificado' | 'cancelado';
}

const Calificaciones: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'activos' | 'finalizados'>('activos');

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      // Usar el endpoint que devuelve TODOS los cursos (activos y finalizados)
      const response = await fetch(`${API_BASE}/api/docentes/todos-mis-cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      } else {
        setError('Error al cargar los cursos');
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
        cardBg: 'rgba(30, 41, 59, 0.7)',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: '#3b82f6',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#ef4444'
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
        danger: '#ef4444'
      };
    }
  };

  const theme = getThemeColors();

  // Filter courses based on active tab
  const filteredCursos = cursos.filter(curso => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaFin = new Date(curso.fecha_fin || new Date());
    fechaFin.setHours(0, 0, 0, 0);

    const cursoEstado = curso.estado || 'activo';

    if (activeTab === 'activos') {
      // Cursos activos: estado activo/planificado Y fecha de fin no ha pasado
      return (cursoEstado === 'activo' || cursoEstado === 'planificado') && fechaFin >= hoy;
    } else {
      // Cursos finalizados: estado finalizado/cancelado O fecha de fin ya pasó
      return cursoEstado === 'finalizado' || cursoEstado === 'cancelado' || fechaFin < hoy;
    }
  });

  return (
    <>
      <style>{`
        .tab-button-active {
          color: #ffffff !important;
        }
        .tab-button-active * {
          color: #ffffff !important;
        }
        .tab-button-active svg {
          color: #ffffff !important;
        }
      `}</style>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '0.75rem' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.25rem',
            fontWeight: '700',
            margin: '0 0 0.15rem 0',
            letterSpacing: '-0.02em'
          }}>
            Calificaciones
          </h2>
          <p style={{
            color: theme.textSecondary,
            fontSize: '0.75rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Selecciona un curso para gestionar y descargar reportes de evaluaciones
          </p>
        </div>

        {/* Tabs for filtering courses */}
        <div style={{
          display: 'flex',
          gap: '0.4rem',
          marginBottom: '1rem',
          borderBottom: `1px solid ${theme.border}`,
          paddingBottom: '0.5rem'
        }}>
          <button
            onClick={() => setActiveTab('activos')}
            className={activeTab === 'activos' ? 'tab-button-active' : ''}
            style={{
              padding: '0.35rem 0.85rem',
              background: activeTab === 'activos'
                ? theme.accent
                : 'transparent',
              border: activeTab === 'activos' ? 'none' : `1px solid ${theme.border}`,
              borderRadius: '0.375rem',
              color: activeTab === 'activos' ? '#ffffff !important' : theme.textSecondary,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <BarChart3 size={14} style={{ color: 'inherit' }} />
            <span style={{ color: 'inherit' }}>Cursos Activos</span>
          </button>

          <button
            onClick={() => setActiveTab('finalizados')}
            className={activeTab === 'finalizados' ? 'tab-button-active' : ''}
            style={{
              padding: '0.35rem 0.85rem',
              background: activeTab === 'finalizados'
                ? theme.accent
                : 'transparent',
              border: activeTab === 'finalizados' ? 'none' : `1px solid ${theme.border}`,
              borderRadius: '0.375rem',
              color: activeTab === 'finalizados' ? '#ffffff !important' : theme.textSecondary,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Clock size={14} style={{ color: 'inherit' }} />
            <span style={{ color: 'inherit' }}>Cursos Finalizados</span>
          </button>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            color: theme.textPrimary
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                border: `3px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                borderTop: `3px solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ fontSize: '0.8125rem', color: theme.textSecondary, fontWeight: '500' }}>Cargando cursos...</p>
            </div>
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${theme.danger}50`,
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <BookOpen size={48} color={theme.danger} style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: theme.danger, margin: '0 0 0.5rem 0' }}>
              Error al cargar
            </h3>
            <p style={{ color: theme.textMuted, margin: 0 }}>{error}</p>
            <button
              onClick={fetchCursos}
              style={{
                marginTop: '1rem',
                background: theme.danger,
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
        ) : filteredCursos.length === 0 ? (
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '0.75rem',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <BookOpen size={32} style={{ color: theme.textMuted, opacity: 0.5, margin: '0 auto 0.75rem' }} />
            <h3 style={{ color: theme.textPrimary, fontSize: '1rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
              {activeTab === 'activos' ? 'No tienes cursos activos' : 'No tienes cursos finalizados'}
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: '0.8125rem', margin: 0, fontWeight: '500' }}>
              {activeTab === 'activos'
                ? 'Los cursos activos aparecerán aquí cuando se asignen'
                : 'Los cursos finalizados aparecerán aquí cuando se completen'}
            </p>
          </div>
        ) : (
          <div>
            <div className="responsive-grid-auto" style={{
              gap: '1rem'
            }}>
              {filteredCursos.map((curso) => (
                <div
                  key={curso.id_curso}
                  onClick={() => navigate(`/panel/docente/calificaciones/${curso.id_curso}`)}
                  style={{
                    background: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '0.625rem',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = darkMode ? '0 8px 16px rgba(0,0,0,0.3)' : '0 8px 16px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = theme.accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = darkMode ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                        color: theme.accent,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <h3 style={{
                        color: theme.textPrimary,
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        margin: '0 0 0.35rem 0',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {curso.nombre}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={12} color={theme.textSecondary} />
                        <span style={{
                          color: theme.textSecondary,
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {curso.total_estudiantes} <span style={{ fontWeight: '500', opacity: 0.8 }}>estudiantes</span>
                        </span>
                      </div>
                    </div>
                    <div style={{
                      marginLeft: '0.75rem',
                      padding: '0.4rem',
                      borderRadius: '0.5rem',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <BookOpen size={16} color={theme.accent} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Calificaciones;