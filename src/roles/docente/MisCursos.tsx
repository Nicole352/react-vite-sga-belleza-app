import { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Clock, MapPin, TrendingUp, AlertCircle, BarChart3, Eye, Edit, ChevronRight, Award } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

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
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMisCursos();
  }, []);

  const fetchMisCursos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE}/docentes/mis-cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cursos del docente:', data);
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
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b'
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
        warning: '#d97706'
      };
    }
  };

  const theme = getThemeColors();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: `4px solid ${theme.textMuted}`,
          borderTop: `4px solid ${theme.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>Cargando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h3 style={{ color: '#ef4444', margin: '0 0 8px 0' }}>Error al cargar</h3>
        <p style={{ color: theme.textMuted, margin: 0 }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: '800', 
          color: theme.textPrimary, 
          margin: '0 0 8px 0' 
        }}>
          Mis Cursos Asignados
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '1rem', margin: 0 }}>
          Gestiona tus cursos y estudiantes
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${theme.accent}30`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <BookOpen size={32} color={theme.accent} style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.accent, marginBottom: '4px' }}>
            {cursos.length}
          </div>
          <div style={{ color: theme.textMuted, fontSize: '0.9rem', fontWeight: '600' }}>
            Cursos Activos
          </div>
        </div>

        <div style={{
          background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          border: `1px solid ${theme.success}30`,
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <Users size={32} color={theme.success} style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: theme.success, marginBottom: '4px' }}>
            {cursos.reduce((acc, curso) => acc + curso.total_estudiantes, 0)}
          </div>
          <div style={{ color: theme.textMuted, fontSize: '0.9rem', fontWeight: '600' }}>
            Total Estudiantes
          </div>
        </div>
      </div>

      {/* Grid de Cursos Tipo Pinterest */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px' 
      }}>
        {cursos.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center'
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
          cursos.map((curso, index) => {
            const coloresGradiente = [
              ['#3b82f6', '#2563eb'],
              ['#10b981', '#059669'],
              ['#f59e0b', '#d97706'],
              ['#8b5cf6', '#7c3aed'],
              ['#ec4899', '#db2777'],
              ['#06b6d4', '#0891b2']
            ];
            const [color1, color2] = coloresGradiente[index % coloresGradiente.length];
            
            return (
              <div
                key={curso.id_curso}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = darkMode 
                    ? `0 20px 40px ${color1}40` 
                    : `0 20px 40px ${color1}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header con gradiente */}
                <div style={{
                  background: `linear-gradient(135deg, ${color1}, ${color2})`,
                  padding: '24px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Patrón de fondo */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)'
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: '#fff'
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <div style={{
                        background: curso.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                        backdropFilter: 'blur(10px)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#fff',
                        textTransform: 'uppercase'
                      }}>
                        {curso.estado}
                      </div>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '1.4rem', 
                      fontWeight: '800', 
                      color: '#fff', 
                      margin: '0 0 12px 0',
                      lineHeight: 1.3
                    }}>
                      {curso.nombre}
                    </h3>

                    {/* Estadística destacada */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        flex: 1
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Users size={16} color="#fff" />
                          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', fontWeight: '600' }}>
                            Estudiantes
                          </span>
                        </div>
                        <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>
                          {curso.total_estudiantes}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', marginTop: '2px' }}>
                          de {curso.capacidad_maxima}
                        </div>
                      </div>

                      {/* Circular progress */}
                      <div style={{ position: 'relative', width: '70px', height: '70px' }}>
                        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="35"
                            cy="35"
                            r="30"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="6"
                          />
                          <circle
                            cx="35"
                            cy="35"
                            r="30"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="6"
                            strokeDasharray={`${2 * Math.PI * 30}`}
                            strokeDashoffset={`${2 * Math.PI * 30 * (1 - (curso.total_estudiantes / curso.capacidad_maxima))}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: '800'
                        }}>
                          {Math.round((curso.total_estudiantes / curso.capacidad_maxima) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div style={{ padding: '24px' }}>
                  {/* Información en grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {/* Aula */}
                    {curso.aula_nombre && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <MapPin size={14} color={theme.success} />
                          <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Aula
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '700' }}>
                          {curso.aula_nombre}
                        </div>
                        {curso.aula_ubicacion && (
                          <div style={{ color: theme.textMuted, fontSize: '0.75rem', marginTop: '2px' }}>
                            {curso.aula_ubicacion}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Horario */}
                    {curso.hora_inicio && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <Clock size={14} color={color1} />
                          <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Horario
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '700' }}>
                          {curso.hora_inicio?.substring(0, 5)} - {curso.hora_fin?.substring(0, 5)}
                        </div>
                        {curso.dias && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {curso.dias.split(',').slice(0, 3).map((dia, idx) => (
                              <span key={idx} style={{
                                padding: '2px 6px',
                                background: `${color1}20`,
                                color: color1,
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                borderRadius: '4px'
                              }}>
                                {dia.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Período */}
                  <div style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Calendar size={14} color={theme.warning} />
                      <span style={{ color: theme.textMuted, fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Período Académico
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
                        {new Date(curso.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </div>
                      <ChevronRight size={14} color={theme.textMuted} />
                      <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
                        {new Date(curso.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button style={{
                      padding: '12px',
                      background: `linear-gradient(135deg, ${color1}, ${color2})`,
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                      <Eye size={16} />
                      Ver Detalles
                    </button>
                    
                    <button style={{
                      padding: '12px',
                      background: 'transparent',
                      border: `2px solid ${color1}`,
                      borderRadius: '12px',
                      color: color1,
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = color1;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = color1;
                    }}>
                      <BarChart3 size={16} />
                      Calificaciones
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MisCursos;
