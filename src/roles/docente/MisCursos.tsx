import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Calendar, Clock, MapPin, AlertCircle, BarChart3, Eye, ChevronRight } from 'lucide-react';
import ModalCalificaciones from './ModalCalificaciones';

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
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalCalificaciones, setModalCalificaciones] = useState<{ isOpen: boolean; cursoId: number; cursoNombre: string }>({ 
    isOpen: false, 
    cursoId: 0, 
    cursoNombre: '' 
  });

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
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: theme.textPrimary, 
          margin: '0 0 4px 0' 
        }}>
          Mis Cursos Asignados
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>
          Gestiona tus cursos y estudiantes
        </p>
      </div>

      {/* Estadísticas (ultra-compactas) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
        gap: '6px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          border: `1px solid ${theme.accent}30`,
          borderRadius: '10px',
          padding: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <BookOpen size={12} color={theme.accent} />
            <span style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: '700' }}>Cursos Activos:</span>
            <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '800' }}>{cursos.length}</span>
          </div>
        </div>

        <div style={{
          background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          border: `1px solid ${theme.success}30`,
          borderRadius: '10px',
          padding: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <Users size={12} color={theme.success} />
            <span style={{ color: theme.success, fontSize: '0.7rem', fontWeight: '700' }}>Total Estudiantes:</span>
            <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '800' }}>{cursos.reduce((acc, curso) => acc + curso.total_estudiantes, 0)}</span>
          </div>
        </div>
      </div>

      {/* Grid de Cursos Tipo Pinterest */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px' 
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
                  borderRadius: '16px',
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
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Patrón de fondo */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)'
                  }} />
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: '#fff'
                      }}>
                        {curso.codigo_curso}
                      </div>
                      <div style={{
                        background: curso.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                        backdropFilter: 'blur(10px)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: '#fff',
                        textTransform: 'uppercase'
                      }}>
                        {curso.estado}
                      </div>
                    </div>
                    
                    <h3 style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '800', 
                      color: '#fff', 
                      margin: '0 0 8px 0',
                      lineHeight: 1.3
                    }}>
                      {curso.nombre}
                    </h3>

                    {/* Estadística destacada */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        flex: 1
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <Users size={14} color="#fff" />
                          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.65rem', fontWeight: '600' }}>
                            Estudiantes
                          </span>
                        </div>
                        <div style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '800', lineHeight: 1 }}>
                          {curso.total_estudiantes}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem', marginTop: '2px' }}>
                          de {curso.capacidad_maxima}
                        </div>
                      </div>

                      {/* Circular progress */}
                      <div style={{ position: 'relative', width: '55px', height: '55px' }}>
                        <svg width="55" height="55" style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx="27.5"
                            cy="27.5"
                            r="23"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="5"
                          />
                          <circle
                            cx="27.5"
                            cy="27.5"
                            r="23"
                            fill="none"
                            stroke="#fff"
                            strokeWidth="5"
                            strokeDasharray={`${2 * Math.PI * 23}`}
                            strokeDashoffset={`${2 * Math.PI * 23 * (1 - (curso.total_estudiantes / curso.capacidad_maxima))}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#fff',
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
                <div style={{ padding: '16px' }}>
                  {/* Información en grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '12px'
                  }}>
                    {/* Aula */}
                    {curso.aula_nombre && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <MapPin size={12} color={theme.success} />
                          <span style={{ color: theme.textMuted, fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Aula
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                          {curso.aula_nombre}
                        </div>
                        {curso.aula_ubicacion && (
                          <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginTop: '2px' }}>
                            {curso.aula_ubicacion}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Horario */}
                    {curso.hora_inicio && (
                      <div style={{
                        background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        padding: '10px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.border}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <Clock size={12} color={color1} />
                          <span style={{ color: theme.textMuted, fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase' }}>
                            Horario
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                          {curso.hora_inicio?.substring(0, 5)} - {curso.hora_fin?.substring(0, 5)}
                        </div>
                        {curso.dias && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
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
                    padding: '10px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.border}`,
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Calendar size={12} color={theme.warning} />
                      <span style={{ color: theme.textMuted, fontSize: '0.6rem', fontWeight: '600', textTransform: 'uppercase' }}>
                        Período Académico
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '600' }}>
                        {new Date(curso.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </div>
                      <ChevronRight size={14} color={theme.textMuted} />
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '600' }}>
                        {new Date(curso.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button style={{
                      padding: '10px',
                      background: `linear-gradient(135deg, ${color1}, ${color2})`,
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => navigate(`/panel/docente/curso/${curso.id_curso}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}>
                      <Eye size={14} />
                      Ver Detalles
                    </button>
                    
                    <button style={{
                      padding: '10px',
                      background: 'transparent',
                      border: `2px solid ${color1}`,
                      borderRadius: '12px',
                      color: color1,
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalCalificaciones({
                        isOpen: true,
                        cursoId: curso.id_curso,
                        cursoNombre: curso.nombre
                      });
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = color1;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = color1;
                    }}>
                      <BarChart3 size={14} />
                      Calificaciones
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Calificaciones */}
      <ModalCalificaciones
        isOpen={modalCalificaciones.isOpen}
        onClose={() => setModalCalificaciones({ isOpen: false, cursoId: 0, cursoNombre: '' })}
        cursoId={modalCalificaciones.cursoId}
        cursoNombre={modalCalificaciones.cursoNombre}
        darkMode={darkMode}
      />
    </div>
  );
};

export default MisCursos;
