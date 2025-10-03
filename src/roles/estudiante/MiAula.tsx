import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Circle,
  Award,
  ChevronRight,
  FileText,
  Eye,
  Upload,
  Download,
  Target,
  Play,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Star,
  Hand
} from 'lucide-react';

interface MiAulaProps {
  darkMode: boolean;
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  capacidad_maxima: number;
  progreso: number;
  calificacion: number;
  tareasPendientes: number;
  proximaClase: string;
  aula?: {
    codigo: string;
    nombre: string;
    ubicacion: string;
  };
  horario?: {
    hora_inicio: string;
    hora_fin: string;
    dias: string;
  };
  docente?: {
    nombres: string;
    apellidos: string;
    titulo: string;
    nombre_completo: string;
  };
}

interface UserData {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

const API_BASE = 'http://localhost:3000/api';

const MiAula: React.FC<MiAulaProps> = ({ darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursosMatriculados, setCursosMatriculados] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setIsVisible(true);
    fetchUserData();
    fetchCursosMatriculados();
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

  const fetchCursosMatriculados = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE}/estudiantes/mis-cursos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const cursos = await response.json();
        console.log('Cursos cargados:', cursos);
        setCursosMatriculados(cursos);
        setError('');
      } else {
        setError('Error al cargar los cursos');
      }
    } catch (error) {
      console.error('Error fetching cursos:', error);
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
        border: 'rgba(251, 191, 36, 0.1)',
        accent: '#fbbf24',
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
        border: 'rgba(251, 191, 36, 0.2)',
        accent: '#f59e0b',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626'
      };
    }
  };

  const theme = getThemeColors();

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
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.accent}30`
          }}>
            <BookOpen size={32} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 8px 0' 
            }}>
              <Hand size={32} style={{ display: 'inline', marginRight: '8px' }} /> ¡Bienvenido{userData?.nombre ? `, ${userData.nombre}` : ''}!
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '1.1rem', 
              margin: '0 0 4px 0' 
            }}>
              Continúa tu formación en Belleza y Estética
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

        {/* Estadísticas rápidas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{
            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            border: `1px solid ${theme.success}30`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={20} color={theme.success} />
              <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '600' }}>Progreso General</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.success }}>
              {cursosMatriculados.length > 0 ? 
                Math.round(cursosMatriculados.reduce((acc, curso) => acc + curso.progreso, 0) / cursosMatriculados.length) : 0}%
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <BookOpen size={20} color="#3b82f6" />
              <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600' }}>Cursos Activos</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#3b82f6' }}>{cursosMatriculados.length}</div>
          </div>

          <div style={{
            background: darkMode ? `rgba(251, 191, 36, 0.1)` : `rgba(251, 191, 36, 0.05)`,
            border: `1px solid ${theme.accent}30`,
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <Star size={20} color={theme.accent} />
              <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '600' }}>Promedio</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: theme.accent }}>
              {cursosMatriculados.length > 0 ? 
                (cursosMatriculados.reduce((acc, curso) => acc + curso.calificacion, 0) / cursosMatriculados.length).toFixed(1) : '0.0'}
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
              <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '600' }}>Tareas Pendientes</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#8b5cf6' }}>
              {cursosMatriculados.reduce((acc, curso) => acc + curso.tareasPendientes, 0)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Panel principal - Cursos en progreso */}
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '32px',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 24px 0' }}>
            Mis Cursos en Progreso
          </h2>
          
          {loading && (
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
          )}

          {error && (
            <div style={{
              background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <AlertCircle size={24} color={theme.danger} style={{ marginBottom: '8px' }} />
              <p style={{ color: theme.danger, margin: 0 }}>{error}</p>
              <button
                onClick={fetchCursosMatriculados}
                style={{
                  background: theme.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  marginTop: '12px',
                  cursor: 'pointer'
                }}
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && cursosMatriculados.length === 0 && (
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <BookOpen size={48} color={theme.textMuted} style={{ marginBottom: '16px' }} />
              <h3 style={{ color: theme.textPrimary, margin: '0 0 8px 0' }}>
                No tienes cursos activos
              </h3>
              <p style={{ color: theme.textMuted, margin: 0 }}>
                Una vez que seas aceptado en un curso, aparecerá aquí.
              </p>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {cursosMatriculados.map((curso) => (
            <div
              key={curso.id_curso}
              style={{
              padding: '24px',
              background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: `${theme.success}20`,
                      color: theme.success,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {curso.codigo_curso || `CURSO-${curso.id_curso}`}
                    </div>
                    <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                      {curso.fecha_inicio ? `Inicio: ${new Date(curso.fecha_inicio).toLocaleDateString()}` : 'Fecha por definir'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 12px 0' }}>
                    {curso.nombre || 'Curso sin nombre'}
                  </h3>
                  
                  {/* Información del curso en grid profesional */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '12px', 
                    marginBottom: '12px',
                    padding: '12px',
                    background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`
                  }}>
                    {/* Docente */}
                    {curso.docente?.nombre_completo && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GraduationCap size={16} color="#3b82f6" />
                          <span style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Docente
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.3' }}>
                          {curso.docente.nombre_completo}
                        </div>
                        {curso.docente.titulo && (
                          <div style={{ color: theme.textMuted, fontSize: '0.75rem', fontStyle: 'italic' }}>
                            {curso.docente.titulo}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Aula */}
                    {curso.aula?.nombre && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={16} color={theme.success} />
                          <span style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Aula
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                          {curso.aula.nombre}
                        </div>
                        {curso.aula.ubicacion && (
                          <div style={{ color: theme.textMuted, fontSize: '0.75rem' }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> {curso.aula.ubicacion}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Horario */}
                    {curso.horario?.hora_inicio && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} color={theme.accent} />
                          <span style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Horario
                          </span>
                        </div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                          {curso.horario.hora_inicio?.substring(0, 5)} - {curso.horario.hora_fin?.substring(0, 5)}
                        </div>
                        {curso.horario.dias && (
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '4px',
                            marginTop: '2px'
                          }}>
                            {curso.horario.dias.split(',').map((dia: string, idx: number) => (
                              <span key={idx} style={{
                                padding: '2px 6px',
                                background: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                                color: theme.accent,
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                borderRadius: '4px',
                                border: `1px solid ${theme.accent}30`
                              }}>
                                {dia.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Próxima clase: {new Date(curso.proximaClase).toLocaleDateString()} {new Date(curso.proximaClase).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Star size={16} color={theme.accent} />
                    <span style={{ color: theme.accent, fontSize: '1rem', fontWeight: '600' }}>
                      {curso.calificacion}/10
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>
                    Progreso: {curso.progreso}%
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${curso.progreso}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${theme.success}, ${theme.success}dd)`,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {curso.tareasPendientes > 0 ? (
                    <>
                      <AlertCircle size={16} color={theme.warning} />
                      <span style={{ color: theme.warning, fontSize: '0.9rem', fontWeight: '600' }}>
                        {curso.tareasPendientes} tarea{curso.tareasPendientes > 1 ? 's' : ''} pendiente{curso.tareasPendientes > 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} color={theme.success} />
                      <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '600' }}>
                        Al día con las tareas
                      </span>
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  {curso.tareasPendientes > 0 ? (
                    <button
                      onClick={() => {
                        console.log('Subir tarea para curso:', curso.nombre);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Upload size={16} />
                      Subir Tarea
                    </button>
                  ) : (
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Play size={16} />
                      Continuar
                    </button>
                  )}
                  
                  <button
                    style={{
                      background: 'transparent',
                      color: theme.accent,
                      border: `1px solid ${theme.accent}30`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Próximas clases */}
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
              {cursosMatriculados.slice(0, 2).map((curso, index) => (
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
                      background: index === 0 ? theme.success : '#3b82f6'
                    }} />
                    <span style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                      {new Date(curso.proximaClase).toLocaleDateString()} {new Date(curso.proximaClase).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                    {curso.nombre}
                  </p>
                  {curso.aula?.nombre && (
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                      {curso.aula.nombre} {curso.aula.ubicacion && `- ${curso.aula.ubicacion}`}
                    </p>
                  )}
                </div>
              ))}
              
              {cursosMatriculados.length === 0 && (
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

          {/* Notificaciones */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 16px 0' }}>
              Notificaciones
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cursosMatriculados.filter(curso => curso.tareasPendientes > 0).map((curso) => (
                <div key={curso.id_curso} style={{
                  padding: '16px',
                  background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${theme.warning}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <AlertCircle size={16} color={theme.warning} />
                    <span style={{ color: theme.warning, fontSize: '0.9rem', fontWeight: '600' }}>
                      Tarea Pendiente
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                    {curso.tareasPendientes} tarea{curso.tareasPendientes > 1 ? 's' : ''} - {curso.nombre}
                  </p>
                  <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Pendiente desde hoy
                  </p>
                </div>
              ))}

              {cursosMatriculados.filter(curso => curso.tareasPendientes === 0).length > 0 && (
                <div style={{
                  padding: '16px',
                  background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                  borderRadius: '12px',
                  border: `1px solid ${theme.success}30`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle size={16} color={theme.success} />
                    <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '600' }}>
                      ¡Al día!
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                    No tienes tareas pendientes
                  </p>
                  <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    ¡Excelente trabajo!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Acceso rápido */}
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
                <FileText size={16} />
                Mis Calificaciones
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
                <Download size={16} />
                Material de Estudio
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
                <Users size={16} />
                Foro de Estudiantes
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiAula;
