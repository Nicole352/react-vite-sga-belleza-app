import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Award,
  GraduationCap,
  Target,
  MapPin,
  Bell,
  TrendingUp,
  ChevronRight,
  FileText,
  CheckCircle
} from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cursos, setCursos] = useState<CursoResumen[]>([]);
  const [loading, setLoading] = useState(true);

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
      transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header de Bienvenida */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.accent}30`
          }}>
            <GraduationCap size={32} color="#fff" />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 8px 0' 
            }}>
              ¡Bienvenido{userData?.nombres ? `, ${userData.nombres} ${userData.apellidos}` : ''}! 👋
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '1.1rem', 
              margin: '0 0 4px 0' 
            }}>
              {userData?.titulo_profesional || 'Gestiona tus cursos y estudiantes'}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              fontSize: '0.9rem',
              color: theme.textMuted
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={16} />
                {new Date().toLocaleDateString('es-ES')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={16} />
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - 4 tarjetas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${theme.accent}30`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <BookOpen size={20} color={theme.accent} />
              <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '600' }}>Cursos Activos</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.accent }}>
              {cursos.length}
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            border: `1px solid ${theme.success}30`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={20} color={theme.success} />
              <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '600' }}>Total Estudiantes</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.success }}>
              {totalEstudiantes}
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
            border: `1px solid ${theme.warning}30`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={20} color={theme.warning} />
              <span style={{ color: theme.warning, fontSize: '0.9rem', fontWeight: '600' }}>Ocupación</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.warning }}>
              {promedioOcupacion}%
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Award size={20} color="#8b5cf6" />
              <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '600' }}>Capacidad Total</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#8b5cf6' }}>
              {capacidadTotal}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Panel principal - Mis Cursos Activos */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
        <h2 style={{ 
          fontSize: '1.6rem', 
          fontWeight: '700', 
          color: theme.textPrimary, 
          margin: '0 0 24px 0' 
        }}>
          Mis Cursos Activos
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
              fontSize: '1.1rem', 
              color: theme.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${theme.textMuted}`,
                borderTop: `2px solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Cargando cursos...
            </div>
          </div>
        ) : cursos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px'
          }}>
            <BookOpen size={64} color={theme.textMuted} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ color: theme.textPrimary, margin: '0 0 8px 0' }}>
              No tienes cursos asignados
            </h3>
            <p style={{ color: theme.textMuted, margin: 0 }}>
              Contacta con el administrador para más información
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {cursos.map((curso) => (
              <div
                key={curso.id_curso}
                style={{
                  padding: '24px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '16px',
                  border: `1px solid ${theme.border}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        background: `${theme.accent}20`,
                        color: theme.accent,
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                        {curso.fecha_inicio ? `Inicio: ${new Date(curso.fecha_inicio).toLocaleDateString()}` : 'Fecha por definir'}
                      </span>
                    </div>
                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: '700', 
                      color: theme.textPrimary, 
                      margin: '0 0 12px 0' 
                    }}>
                      {curso.nombre}
                    </h3>

                    {/* Información del aula */}
                    {curso.aula_nombre && (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        color: theme.textMuted,
                        fontSize: '0.9rem',
                        marginBottom: '8px'
                      }}>
                        <MapPin size={16} color={theme.success} />
                        <span><strong style={{ color: theme.textPrimary }}>{curso.aula_nombre}</strong>{curso.aula_ubicacion && ` - ${curso.aula_ubicacion}`}</span>
                      </div>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: theme.textMuted,
                      fontSize: '0.9rem'
                    }}>
                      <Users size={16} />
                      <span>{curso.total_estudiantes} estudiantes matriculados</span>
                    </div>
                  </div>

                  <div style={{ 
                    textAlign: 'right',
                    minWidth: '120px'
                  }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: '800', 
                      color: theme.accent,
                      lineHeight: 1
                    }}>
                      {curso.total_estudiantes}
                    </div>
                    <div style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
                      de {curso.capacidad_maxima}
                    </div>
                    
                    {/* Barra de progreso */}
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '8px'
                    }}>
                      <div style={{
                        width: `${(curso.total_estudiantes / curso.capacidad_maxima) * 100}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}dd)`,
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{ 
                      color: theme.textMuted, 
                      fontSize: '0.75rem', 
                      marginTop: '4px' 
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Próximas Clases */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px 0' }}>
              Próximas Clases
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cursos.slice(0, 2).map((curso, index) => (
                <div key={curso.id_curso} style={{
                  padding: '16px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: index === 0 ? theme.accent : theme.success
                    }} />
                    <span style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                      {new Date(curso.fecha_inicio).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                    {curso.nombre}
                  </p>
                  {curso.aula_nombre && (
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                      {curso.aula_nombre} {curso.aula_ubicacion && `- ${curso.aula_ubicacion}`}
                    </p>
                  )}
                </div>
              ))}
              
              {cursos.length === 0 && (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: theme.textMuted,
                  fontSize: '0.9rem'
                }}>
                  No hay clases programadas
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas de Estudiantes */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px 0' }}>
              Resumen de Estudiantes
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cursos.length > 0 ? (
                <>
                  <div style={{
                    padding: '16px',
                    background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                    borderRadius: '12px',
                    border: `1px solid ${theme.accent}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={16} color={theme.accent} />
                      <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '600' }}>
                        Total Estudiantes
                      </span>
                    </div>
                    <p style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      {totalEstudiantes}
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                      En {cursos.length} curso{cursos.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div style={{
                    padding: '16px',
                    background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                    borderRadius: '12px',
                    border: `1px solid ${theme.success}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <CheckCircle size={16} color={theme.success} />
                      <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '600' }}>
                        Ocupación Promedio
                      </span>
                    </div>
                    <p style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                      {promedioOcupacion}%
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                      De capacidad total
                    </p>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  color: theme.textMuted,
                  fontSize: '0.9rem'
                }}>
                  Sin datos disponibles
                </div>
              )}
            </div>
          </div>

          {/* Acceso Rápido */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px 0' }}>
              Acceso Rápido
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '12px',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <TrendingUp size={16} />
                Calificaciones
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '12px',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <FileText size={16} />
                Material de Clase
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>

              <button style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '12px',
                color: theme.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                <Bell size={16} />
                Notificaciones
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocenteDashboard;
