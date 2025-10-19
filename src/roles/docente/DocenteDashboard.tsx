import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Award, 
  Hand, 
  Clock,
  TrendingUp,
  ChevronRight,
  GraduationCap,
  Target,
  MapPin,
} from 'lucide-react';
import ModalCalificaciones from './ModalCalificaciones';

const API_BASE = 'http://localhost:3000/api';

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
}

const DocenteDashboard: React.FC<DocenteDashboardProps> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cursos, setCursos] = useState<CursoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalif, setShowCalif] = useState(false);
  const [cursoSelId, setCursoSelId] = useState<number | null>(null);
  const [cursoSelNombre, setCursoSelNombre] = useState<string>('');

  useEffect(() => {
    setIsVisible(true);
    fetchUserData();
    fetchCursos();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/me`, {
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

      const response = await fetch(`${API_BASE}/docentes/mis-cursos`, {
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
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(59, 130, 246, 0.1)',
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
        border: `0.0625rem solid ${theme.border}`,
        borderRadius: '1.25rem',
        padding: '0.75em',
        marginBottom: '0.75em',
        backdropFilter: 'blur(1.25rem)',
        boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em', marginBottom: '0.5em' }}>
          <div style={{
            width: '2.75rem',
            height: '2.75rem',
            background: `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0.5rem 1.5rem ${theme.accent}30`
          }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 0.25em 0' 
            }}>
              <Hand size={16} style={{ display: 'inline', marginRight: '0.375em' }} /> ¡Bienvenido{userData?.nombres ? `, ${userData.nombres} ${userData.apellidos}` : ''}!
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.85rem', 
              margin: '0 0 0.25em 0' 
            }}>
              {userData?.titulo_profesional || 'Gestiona tus cursos y estudiantes'}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5em',
              fontSize: '0.75rem',
              color: theme.textMuted
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                <Calendar size={12} />
                {new Date().toLocaleDateString('es-ES')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                <Clock size={12} />
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - 4 tarjetas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))', gap: '0.375em' }}>
          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `0.0625rem solid ${theme.accent}30`,
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <BookOpen size={12} color={theme.accent} />
              <span style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: '700' }}>Cursos Activos:</span>
              <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '800' }}>{cursos.length}</span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            border: `0.0625rem solid ${theme.success}30`,
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Users size={12} color={theme.success} />
              <span style={{ color: theme.success, fontSize: '0.7rem', fontWeight: '700' }}>Total Estudiantes:</span>
              <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '800' }}>{totalEstudiantes}</span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
            border: `0.0625rem solid ${theme.warning}30`,
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Target size={12} color={theme.warning} />
              <span style={{ color: theme.warning, fontSize: '0.7rem', fontWeight: '700' }}>Ocupación:</span>
              <span style={{ color: theme.warning, fontSize: '0.9rem', fontWeight: '800' }}>{promedioOcupacion}%</span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            border: '0.0625rem solid rgba(139, 92, 246, 0.3)',
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Award size={12} color="#8b5cf6" />
              <span style={{ color: '#8b5cf6', fontSize: '0.7rem', fontWeight: '700' }}>Capacidad Total:</span>
              <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '800' }}>{capacidadTotal}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1em' }}>
        {/* Panel principal - Mis Cursos Activos */}
        <div style={{
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1.25rem',
          padding: '1em',
          backdropFilter: 'blur(1.25rem)',
          boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
        }}>
        <h2 style={{ 
          fontSize: '1.2rem', 
          fontWeight: '700', 
          color: theme.textPrimary, 
          margin: '0 0 1em 0' 
        }}>
          Mis Cursos Activos
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5em' }}>
            <div style={{ 
              fontSize: '1.1rem', 
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75em'
            }}>
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: `0.125rem solid ${theme.textMuted}`,
                borderTop: `0.125rem solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Cargando cursos...
            </div>
          </div>
        ) : cursos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3.75em 1.25em'
          }}>
            <BookOpen size={64} color={theme.textMuted} style={{ marginBottom: '1em', opacity: 0.5 }} />
            <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
              No tienes cursos asignados
            </h3>
            <p style={{ color: theme.textMuted, margin: 0 }}>
              Contacta con el administrador para más información
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75em' }}>
            {cursos.map((curso) => (
              <div
                key={curso.id_curso}
                onClick={() => navigate(`/panel/docente/curso/${curso.id_curso}`)}
                style={{
                  padding: '0.875em',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '1em',
                  border: `0.0625rem solid ${theme.border}`,
                  transition: 'all 0.3s ease', 
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
                      fontSize: '1.1rem', 
                      fontWeight: '700', 
                      color: theme.textPrimary, 
                      margin: '0 0 0.5em 0' 
                    }}>
                      {curso.nombre}
                    </h3>

                    {/* Información del aula */}
                    {curso.aula_nombre && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5em',
                        color: theme.textMuted,
                        fontSize: '0.9rem',
                        marginBottom: '0.5em'
                      }}>
                        <MapPin size={16} color={theme.success} />
                        <span><strong style={{ color: theme.textPrimary }}>{curso.aula_nombre}</strong>{curso.aula_ubicacion && ` - ${curso.aula_ubicacion}`}</span>
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.375em',
                      color: theme.textMuted,
                      fontSize: '0.8rem'
                    }}>
                      <Users size={12} />
                      <span>{curso.total_estudiantes} estudiantes matriculados</span>
                    </div>
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    minWidth: '6.25rem'
                  }}>
                    <div style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: '800', 
                      color: theme.accent,
                      lineHeight: 1
                    }}>
                      {curso.total_estudiantes}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>
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
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '1em',
            padding: '0.75em',
            backdropFilter: 'blur(1.25rem)',
            boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
              Próximas Clases
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              {cursos.slice(0, 2).map((curso, index) => (
                <div key={curso.id_curso} style={{
                  padding: '0.5em',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '0.625em',
                  border: `0.0625rem solid ${theme.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em', fontSize: '0.8rem', color: theme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    <div style={{
                      width: '0.375em',
                      height: '0.375em',
                      borderRadius: '50%',
                      background: index === 0 ? theme.accent : theme.success,
                      flexShrink: 0
                    }} />
                    <span style={{ color: theme.textPrimary, fontWeight: '600', flexShrink: 0 }}>
                      {new Date(curso.fecha_inicio).toLocaleDateString()}
                    </span>
                    <span style={{ color: theme.textMuted, flexShrink: 0 }}>·</span>
                    <span style={{ color: theme.textPrimary, fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {curso.nombre}
                    </span>
                    {curso.aula_nombre && (
                      <>
                        <span style={{ color: theme.textMuted, flexShrink: 0 }}>·</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {curso.aula_nombre}{curso.aula_ubicacion && ` - ${curso.aula_ubicacion}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              {cursos.length === 0 && (
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
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '1.25rem',
            padding: '1em',
            backdropFilter: 'blur(1.25rem)',
            boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.75em 0' }}>
              Acceso Rápido
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
              <button onClick={() => { const c = cursos[0]; if (c) { setCursoSelId(c.id_curso); setCursoSelNombre(c.nombre); setShowCalif(true); } }} style={{
                background: 'transparent',
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.5em',
                padding: '0.625em',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <TrendingUp size={14} />
                Calificaciones
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </button>

              <button onClick={() => navigate('/panel/docente/horario')} style={{
                background: 'transparent',
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.5em',
                padding: '0.625em',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <Calendar size={14} />
                Horario
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
              </button>

              <button onClick={() => navigate('/panel/docente/estudiantes')} style={{
                background: 'transparent',
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.5em',
                padding: '0.625em',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <Users size={14} />
                Lista de Estudiantes
                <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
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