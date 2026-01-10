import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Calendar,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  Target,
  MapPin
} from 'lucide-react';
import ModalCalificaciones from './ModalCalificaciones';
import { FaHandPaper } from 'react-icons/fa';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface DocenteDashboardProps {
  darkMode: boolean;
}

interface UserData {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  email: string;
  titulo_profesional: string;
}

interface CursoResumen {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  total_estudiantes: number;
  capacidad_maxima: number;
  fecha_inicio: string;
  fecha_fin: string;
  aula_nombre?: string;
  aula_ubicacion?: string;
  dias?: string;
  estado?: 'activo' | 'finalizado' | 'planificado' | 'cancelado';
}

const calculateNextClass = (diasStr: string | undefined): Date | null => {
  if (!diasStr) return null;

  const diasMap: { [key: string]: number } = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3,
    'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
  };

  const daysLowerCase = diasStr.toLowerCase();
  const cursoDias = Object.keys(diasMap).filter(d => daysLowerCase.includes(d)).map(d => diasMap[d]);

  if (cursoDias.length === 0) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Buscar la próxima fecha en los próximos 14 días
  for (let i = 0; i < 14; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    if (cursoDias.includes(fecha.getDay())) {
      return fecha;
    }
  }
  return null;
};

const DocenteDashboard: React.FC<DocenteDashboardProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const { isSmallScreen } = useBreakpoints();
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cursos, setCursos] = useState<CursoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalif, setShowCalif] = useState(false);
  const [cursoSelId] = useState<number | null>(null);
  const [cursoSelNombre] = useState<string>('');

  useEffect(() => {
    setIsVisible(true);
    fetchUserData();
    fetchCursos();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    }
  };

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) return;

      const response = await fetch(`${API_BASE}/api/docentes/mis-cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data);
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

  const totalEstudiantes = cursos.reduce((acc, curso) => acc + curso.total_estudiantes, 0);
  const capacidadTotal = cursos.reduce((acc, curso) => acc + curso.capacidad_maxima, 0);
  const promedioOcupacion = capacidadTotal > 0 ? Math.round((totalEstudiantes / capacidadTotal) * 100) : 0;

  return (
    <div style={{
      transform: isVisible ? 'translateY(0)' : 'translateY(-1.875rem)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header de Bienvenida */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        marginBottom: '0.75rem',
        backdropFilter: 'blur(1.25rem)',
        boxShadow: darkMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: theme.textPrimary,
          margin: '0 0 0.15rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          <FaHandPaper size={18} style={{ color: theme.textPrimary, transform: 'rotate(25deg)' }} />
          ¡Bienvenido{userData?.nombres ? `, ${userData.nombres} ${userData.apellidos}` : ''}!
        </h1>
        <p style={{
          color: theme.textSecondary,
          fontSize: '0.75rem',
          margin: '0 0 0.5rem 0',
          fontWeight: 500
        }}>
          {userData?.titulo_profesional || 'Gestiona tus cursos y estudiantes'}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.65rem',
          color: theme.textMuted,
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={12} />
            {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={12} />
            {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Estadísticas rápidas - 4 tarjetas */}
      <div className="responsive-grid-4" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{
          background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
          border: `1px solid ${theme.accent}20`,
          borderRadius: '0.625rem',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={14} color={theme.accent} />
            <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: '600' }}>Cursos Activos</span>
          </div>
          <span style={{ color: theme.accent, fontSize: '1.25rem', fontWeight: '800' }}>
            {cursos.filter(c => (c.estado || 'activo') === 'activo').length}
          </span>
        </div>

        <div style={{
          background: darkMode ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
          border: `1px solid ${theme.success}20`,
          borderRadius: '0.625rem',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={14} color={theme.success} />
            <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: '600' }}>Total Estudiantes</span>
          </div>
          <span style={{ color: theme.success, fontSize: '1.25rem', fontWeight: '800' }}>
            {totalEstudiantes}
          </span>
        </div>

        <div style={{
          background: darkMode ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.04)',
          border: `1px solid ${theme.warning}20`,
          borderRadius: '0.625rem',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Target size={14} color={theme.warning} />
            <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: '600' }}>Ocupación</span>
          </div>
          <span style={{ color: theme.warning, fontSize: '1.25rem', fontWeight: '800' }}>
            {promedioOcupacion}%
          </span>
        </div>

        <div style={{
          background: darkMode ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '0.625rem',
          padding: '0.65rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={14} color="#8b5cf6" />
            <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: '600' }}>Capacidad Total</span>
          </div>
          <span style={{ color: '#8b5cf6', fontSize: '1.25rem', fontWeight: '800' }}>
            {capacidadTotal}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : '3fr 1fr', gap: '1em' }}>
        {/* Panel principal - Mis Cursos con Tabs */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '0.875rem',
          padding: '0.875rem',
          backdropFilter: 'blur(1.25rem)',
          boxShadow: darkMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '1em' }}>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: theme.textPrimary,
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BookOpen size={16} /> Mis Cursos
            </h2>


          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2.5em' }}>
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: `0.125rem solid ${theme.textMuted}`,
                borderTop: `0.125rem solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1em'
              }} />
              <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>Cargando cursos...</p>
            </div>
          ) : cursos.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3.75em 1.25em'
            }}>
              <BookOpen size={64} color={theme.textMuted} style={{ marginBottom: '1em', opacity: 0.5 }} />
              <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
                No tienes cursos activos
              </h3>
              <p style={{ color: theme.textMuted, margin: 0 }}>
                Tus cursos activos aparecerán aquí cuando se asignen
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75em' }}>
              {cursos.map((curso) => (
                <div
                  key={curso.id_curso}
                  onClick={() => navigate(`/panel/docente/curso/${curso.id_curso}`)}
                  style={{
                    padding: '0.75rem',
                    background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = theme.accent;
                    e.currentTarget.style.transform = 'translateY(-0.125rem)';
                    e.currentTarget.style.boxShadow = darkMode
                      ? '0 0.5rem 1.5625rem rgba(0, 0, 0, 0.4)'
                      : '0 0.5rem 1.5625rem rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.borderColor = theme.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.625em' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em', marginBottom: '0.375em' }}>
                        <div style={{
                          background: `${theme.accent}20`,
                          color: theme.accent,
                          padding: '0.1875em 0.625em',
                          borderRadius: '1em',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {curso.codigo_curso}
                        </div>
                        <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
                          {curso.fecha_inicio ? `Inicio: ${new Date(curso.fecha_inicio).toLocaleDateString()}` : 'Fecha por definir'}
                        </span>
                      </div>
                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        color: theme.textPrimary,
                        margin: '0 0 0.25rem 0'
                      }}>
                        {curso.nombre}
                      </h3>

                      {/* Información del aula */}
                      {curso.aula_nombre && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          color: theme.textMuted,
                          fontSize: '0.75rem',
                          marginBottom: '0.375rem'
                        }}>
                          <MapPin size={12} color={theme.success} />
                          <span><strong style={{ color: theme.textPrimary }}>{curso.aula_nombre}</strong>{curso.aula_ubicacion && ` - ${curso.aula_ubicacion}`}</span>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: theme.textMuted,
                        fontSize: '0.7rem'
                      }}>
                        <Users size={10} />
                        <span>{curso.total_estudiantes} estudiantes</span>
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'right',
                      minWidth: '6.25rem'
                    }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '800',
                        color: theme.accent,
                        lineHeight: 1
                      }}>
                        {curso.total_estudiantes}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: '0.65rem' }}>
                        de {curso.capacidad_maxima}
                      </div>

                      {/* Barra de progreso */}
                      <div style={{
                        width: '100%',
                        height: '0.375em',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderRadius: '0.25em',
                        overflow: 'hidden',
                        marginTop: '0.375em'
                      }}>
                        <div style={{
                          width: `${(curso.total_estudiantes / curso.capacidad_maxima) * 100}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}dd)`,
                          borderRadius: '0.25em'
                        }} />
                      </div>
                      <div style={{
                        color: theme.textMuted,
                        fontSize: '0.7rem',
                        marginTop: '0.1875em'
                      }}>
                        {Math.round((curso.total_estudiantes / curso.capacidad_maxima) * 100)}% ocupado
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
          {/* Próximas Clases */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '0.75rem',
            padding: '0.75rem',
            backdropFilter: 'blur(1.25rem)',
            boxShadow: darkMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.5rem 0' }}>
              Próximas Clases
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              {cursos
                .filter(c => (c.estado || 'activo') === 'activo')
                .map(c => ({ ...c, nextClassDate: calculateNextClass(c.dias) || new Date(c.fecha_inicio) }))
                .sort((a, b) => a.nextClassDate.getTime() - b.nextClassDate.getTime())
                .slice(0, 3)
                .map((curso, index) => (
                  <div key={curso.id_curso} style={{
                    padding: '0.375rem 0.5rem',
                    background: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${theme.border}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      <div style={{
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        background: index === 0 ? theme.accent : theme.success,
                        flexShrink: 0
                      }} />
                      <span style={{ color: theme.textPrimary, fontWeight: '600', flexShrink: 0 }}>
                        {curso.nextClassDate.toLocaleDateString('es-ES')}
                      </span>
                      <span style={{ color: theme.textMuted, flexShrink: 0 }}>·</span>
                      <span style={{ color: theme.textPrimary, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {curso.nombre}
                      </span>
                      {curso.aula_nombre && (
                        <>
                          <span style={{ color: theme.textMuted, flexShrink: 0 }}>·</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {curso.aula_nombre}{curso.aula_ubicacion ? ` - ${curso.aula_ubicacion}` : ''}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

              {cursos.filter(c => (c.estado || 'activo') === 'activo').length === 0 && (
                <div style={{
                  padding: '0.75em',
                  textAlign: 'center',
                  color: theme.textMuted,
                  fontSize: '0.85rem'
                }}>
                  No hay clases programadas
                </div>
              )}
            </div>
          </div>

          {/* Acceso Rápido */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '0.75rem',
            padding: '0.75rem',
            backdropFilter: 'blur(1.25rem)',
            boxShadow: darkMode ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.5rem 0' }}>
              Acceso Rápido
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              <div style={{ position: 'relative' }}>
                {/* Changed this button to navigate to Calificaciones.tsx instead of showing dropdown */}
                <button onClick={() => navigate('/panel/docente/calificaciones')} style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.375rem',
                  padding: '0.5rem 0.625rem',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}>
                  <TrendingUp size={12} />
                  Calificaciones
                  <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
                </button>
              </div>

              <button onClick={() => navigate('/panel/docente/horario')} style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.375rem',
                padding: '0.5rem 0.625rem',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                <Calendar size={12} />
                Horario
                <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
              </button>

              <button onClick={() => navigate('/panel/docente/estudiantes')} style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '0.375rem',
                padding: '0.5rem 0.625rem',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}>
                <Users size={12} />
                Lista de Estudiantes
                <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCalif && cursoSelId !== null && (
        <ModalCalificaciones
          isOpen={showCalif}
          onClose={() => setShowCalif(false)}
          cursoId={cursoSelId}
          cursoNombre={cursoSelNombre}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default DocenteDashboard;