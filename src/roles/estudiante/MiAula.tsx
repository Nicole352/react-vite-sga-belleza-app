import React, { useState, useEffect } from 'react';

import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  MapPin,
  Award,
  ChevronRight,
  FileText,
  Eye,
  Upload,
  Target,
  Play,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Star,
  Hand
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  nombres?: string;
  apellidos?: string;
  email: string;
  rol: string;
}

const API_BASE = 'http://localhost:3000/api';

const MiAula: React.FC<MiAulaProps> = ({ darkMode }) => {
  const navigate = useNavigate();
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
      transform: isVisible ? 'translateY(0)' : 'translateY(-1.875rem)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
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
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0.5rem 1.5rem ${theme.accent}30`
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{
              fontSize: '1.4rem',
              fontWeight: '800',
              color: theme.textPrimary,
              margin: '0 0 0.25em 0'
            }}>
              <Hand size={16} style={{ display: 'inline', marginRight: '0.375em' }} /> ¡Bienvenido{userData?.nombres ? `, ${userData.nombres} ${userData.apellidos || ''}` : (userData?.nombre ? `, ${userData.nombre} ${userData.apellido || ''}` : '')}!
            </h1>
            <p style={{
              color: theme.textSecondary,
              fontSize: '0.85rem',
              margin: '0 0 0.25em 0'
            }}>
              Continúa tu formación en Belleza y Estética
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

        {/* Estadísticas rápidas (ultra-compactas, una sola línea) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(min(7.5rem, 90vw), 1fr))', gap: '0.375em' }}>
          <div style={{
            background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
            border: `0.0625rem solid ${theme.accent}30`,
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Target size={12} color={theme.accent} />
              <span style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: '700' }}>Progreso General:</span>
              <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.length > 0 && cursosMatriculados.some(curso => curso.progreso !== undefined && curso.progreso !== null) ?
                  Math.round(cursosMatriculados.reduce((acc, curso) => acc + (curso.progreso || 0), 0) / cursosMatriculados.length) : 0}%
              </span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
            border: '0.0625rem solid rgba(245, 158, 11, 0.3)',
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <BookOpen size={12} color="#f59e0b" />
              <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: '700' }}>Cursos Activos:</span>
              <span style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: '800' }}>{cursosMatriculados.length}</span>
            </div>
          </div>

          <div style={{
            background: darkMode ? `rgba(217, 119, 6, 0.1)` : `rgba(217, 119, 6, 0.05)`,
            border: `0.0625rem solid rgba(217, 119, 6, 0.3)`,
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Star size={12} color="#d97706" />
              <span style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: '700' }}>Promedio:</span>
              <span style={{ color: '#d97706', fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.length > 0 && cursosMatriculados.some(curso => curso.calificacion !== undefined && curso.calificacion !== null) ?
                  (cursosMatriculados.reduce((acc, curso) => acc + (curso.calificacion || 0), 0) / cursosMatriculados.length).toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(184, 134, 11, 0.1)' : 'rgba(184, 134, 11, 0.05)',
            border: '0.0625rem solid rgba(184, 134, 11, 0.3)',
            borderRadius: '0.625em',
            padding: '0.375em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375em', whiteSpace: 'nowrap' }}>
              <Award size={12} color="#b8860b" />
              <span style={{ color: '#b8860b', fontSize: '0.7rem', fontWeight: '700' }}>Tareas Pendientes:</span>
              <span style={{ color: '#b8860b', fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.length > 0 ?
                  cursosMatriculados.reduce((acc, curso) => acc + (curso.tareasPendientes || 0), 0) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2em', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Panel principal - Cursos en progreso */}
        <div style={{
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1rem',
          padding: '0.625em',
          backdropFilter: 'blur(1.25rem)',
          boxShadow: darkMode ? '0 1.25rem 2.5rem rgba(0, 0, 0, 0.3)' : '0 1.25rem 2.5rem rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 0.625em 0' }}>
            Mis Cursos en Progreso
          </h2>

          {loading && (
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
                  width: '1.25em',
                  height: '1.25em',
                  border: `0.125rem solid ${theme.textMuted}`,
                  borderTop: `0.125rem solid ${theme.accent}`,
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
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75em',
              padding: '1.25em',
              textAlign: 'center'
            }}>
              <AlertCircle size={24} color={theme.danger} style={{ marginBottom: '0.5em' }} />
              <p style={{ color: theme.danger, margin: 0 }}>{error}</p>
              <button
                onClick={fetchCursosMatriculados}
                style={{
                  background: theme.danger,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5em',
                  padding: '0.5em 1em',
                  marginTop: '0.75em',
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
              border: `0.0625rem solid ${theme.border}`,
              borderRadius: '1em',
              padding: '2.5em',
              textAlign: 'center'
            }}>
              <BookOpen size={48} color={theme.textMuted} style={{ marginBottom: '1em' }} />
              <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5em 0' }}>
                No tienes cursos activos
              </h3>
              <p style={{ color: theme.textMuted, margin: 0 }}>
                Una vez que seas aceptado en un curso, aparecerá aquí.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gap: '0.5em', overflowY: 'auto', flex: 1, paddingRight: '0.5em' }}>
            {cursosMatriculados.map((curso) => (
              <div
                key={curso.id_curso}
                onClick={() => navigate(`/panel/estudiante/curso/${curso.id_curso}`)}
                style={{
                  padding: '0.5em',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '0.75em',
                  border: `0.0625rem solid ${theme.border}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5em' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em', marginBottom: '0.2em' }}>
                      <div style={{
                        background: darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
                        color: theme.accent,
                        padding: '0.2em 0.625em',
                        borderRadius: '0.75em',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {curso.codigo_curso || `CURSO-${curso.id_curso}`}
                      </div>
                    </div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: theme.textPrimary, margin: '0 0 0.2em 0', lineHeight: '1.2' }}>
                      {curso.nombre || 'Curso sin nombre'}
                    </h3>
                    <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3em' }}>
                      <Calendar size={12} />
                      Inicio: {curso.fecha_inicio ? new Date(curso.fecha_inicio).toLocaleDateString() : 'Fecha por definir'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', marginLeft: '0.5em' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.2em' }}>
                      <Star size={12} color={theme.accent} />
                      <span style={{ color: theme.accent, fontSize: '0.8rem', fontWeight: '600' }}>
                        {curso.calificacion !== undefined && curso.calificacion !== null ? curso.calificacion.toFixed(1) : '0.0'}/10
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: theme.textMuted }}>
                      Progreso: {curso.progreso !== undefined && curso.progreso !== null ? Math.round(curso.progreso) : 0}%
                    </div>
                  </div>
                </div>

                {/* Información del curso en grid profesional */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5em',
                  marginBottom: '0.5em'
                }}>
                  {/* Docente */}
                  {curso.docente?.nombre_completo && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.3em',
                      padding: '0.375em',
                      background: darkMode ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.06)',
                      borderRadius: '0.5em',
                      border: `0.0625rem solid ${theme.accent}25`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                        <GraduationCap size={12} color={theme.accent} />
                        <span style={{ 
                          background: theme.accent,
                          color: '#fff',
                          fontSize: '0.6rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.03em',
                          padding: '0.125em 0.35em',
                          borderRadius: '0.25em',
                          display: 'inline-block'
                        }}>
                          Docente
                        </span>
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '600', lineHeight: '1.3' }}>
                        {curso.docente.nombre_completo}
                      </div>
                      {curso.docente.titulo && (
                        <div style={{ color: theme.textMuted, fontSize: '0.7rem', fontStyle: 'italic' }}>
                          {curso.docente.titulo}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aula */}
                  {curso.aula?.nombre && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.3em',
                      padding: '0.375em',
                      background: darkMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
                      borderRadius: '0.5em',
                      border: `0.0625rem solid rgba(245, 158, 11, 0.25)`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                        <MapPin size={12} color="#f59e0b" />
                        <span style={{ 
                          background: '#f59e0b',
                          color: '#fff',
                          fontSize: '0.6rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.03em',
                          padding: '0.125em 0.35em',
                          borderRadius: '0.25em',
                          display: 'inline-block'
                        }}>
                          Aula
                        </span>
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '600' }}>
                        {curso.aula.nombre}
                      </div>
                      {curso.aula.ubicacion && (
                        <div style={{ color: theme.textMuted, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                          <MapPin size={10} /> {curso.aula.ubicacion}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Horario */}
                  {curso.horario?.hora_inicio && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.3em',
                      padding: '0.375em',
                      background: darkMode ? 'rgba(217, 119, 6, 0.08)' : 'rgba(217, 119, 6, 0.06)',
                      borderRadius: '0.5em',
                      border: `0.0625rem solid rgba(217, 119, 6, 0.25)`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                        <Clock size={12} color="#d97706" />
                        <span style={{ 
                          background: '#d97706',
                          color: '#fff',
                          fontSize: '0.6rem', 
                          fontWeight: '700', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.03em',
                          padding: '0.125em 0.35em',
                          borderRadius: '0.25em',
                          display: 'inline-block'
                        }}>
                          Horario
                        </span>
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.2em' }}>
                        {curso.horario.hora_inicio?.substring(0, 5)} - {curso.horario.hora_fin?.substring(0, 5)}
                      </div>
                      {curso.horario.dias && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25em'
                        }}>
                          {curso.horario.dias.split(',').map((dia: string, idx: number) => (
                            <span key={idx} style={{
                              padding: '0.15em 0.4em',
                              background: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.12)',
                              color: theme.accent,
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              borderRadius: '0.25em',
                              border: `0.0625rem solid ${theme.accent}30`,
                              whiteSpace: 'nowrap'
                            }}>
                              {dia.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Progreso del curso y tareas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3em', marginBottom: '0.5em' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', marginBottom: '0.2em' }}>
                        <span style={{ color: theme.textMuted, fontWeight: '500' }}>Progreso</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                          <span style={{ color: theme.textPrimary, fontWeight: '600', fontSize: '0.7rem' }}>
                            {curso.progreso !== undefined && curso.progreso !== null ? `${Math.round(curso.progreso)}%` : '0%'}
                          </span>
                          <span style={{
                            padding: '0.125em 0.35em',
                            background: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.12)',
                            borderRadius: '0.25em',
                            border: `0.0625rem solid ${theme.accent}30`,
                            color: theme.accent,
                            fontSize: '0.65rem',
                            fontWeight: '700'
                          }}>
                            {curso.calificacion !== undefined && curso.calificacion !== null ? curso.calificacion.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        height: '0.4em',
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        borderRadius: '0.2em',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${curso.progreso !== undefined && curso.progreso !== null ? curso.progreso : 0}%`,
                          background: `linear-gradient(90deg, ${theme.accent}, #f59e0b)`,
                          borderRadius: '0.2em'
                        }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Estado de tareas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', fontSize: '0.7rem' }}>
                    <CheckCircle size={11} color={curso.tareasPendientes === 0 ? '#f59e0b' : theme.warning} />
                    <span style={{
                      color: curso.tareasPendientes === 0 ? '#f59e0b' : theme.warning,
                      fontWeight: '600'
                    }}>
                      {curso.tareasPendientes === 0 ? 'Al día con las tareas' : `${curso.tareasPendientes} tareas pendientes`}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4em' }}>
                  {curso.tareasPendientes > 0 ? (
                    <button
                      onClick={() => {
                        console.log('Subir tarea para curso:', curso.nombre);
                      }}
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}, #f59e0b)`,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5em',
                        padding: '0.4em 0.75em',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4em',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 0.25rem 0.5rem ${theme.accent}30`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-0.125em)';
                        e.currentTarget.style.boxShadow = `0 0.5rem 1rem ${theme.accent}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 0.25rem 0.5rem ${theme.accent}30`;
                      }}
                    >
                      <Upload size={14} />
                      Subir Tarea
                    </button>
                  ) : (
                    <button
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}, #f59e0b)`,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5em',
                        padding: '0.4em 0.75em',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4em',
                        transition: 'all 0.3s ease',
                        boxShadow: `0 0.25rem 0.5rem ${theme.accent}30`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-0.125em)';
                        e.currentTarget.style.boxShadow = `0 0.5rem 1rem ${theme.accent}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 0.25rem 0.5rem ${theme.accent}30`;
                      }}
                    >
                      <Play size={14} />
                      Continuar
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/panel/estudiante/curso/${curso.id_curso}`)}
                    style={{
                      background: 'transparent',
                      color: theme.accent,
                      border: `1px solid ${theme.accent}30`,
                      borderRadius: '0.5em',
                      padding: '0.4em 0.75em',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4em',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${theme.accent}20`;
                      e.currentTarget.style.borderColor = theme.accent;
                      e.currentTarget.style.transform = 'translateY(-0.125em)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = `${theme.accent}30`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Eye size={14} />
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Próximas clases */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '12px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 8px 0' }}>
              Próximas Clases
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cursosMatriculados.slice(0, 2).map((curso, index) => (
                <div key={curso.id_curso} style={{
                  padding: '8px',
                  background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: index === 0 ? theme.accent : '#f59e0b'
                    }} />
                    <span style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                      {new Date(curso.proximaClase).toLocaleDateString()} {new Date(curso.proximaClase).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary, fontSize: '0.75rem', margin: 0 }}>
                    {curso.nombre}
                  </p>
                  {curso.aula?.nombre && (
                    <p style={{ color: theme.textMuted, fontSize: '0.7rem', margin: '2px 0 0 0' }}>
                      {curso.aula.nombre} {curso.aula.ubicacion && `- ${curso.aula.ubicacion}`}
                    </p>
                  )}
                </div>
              ))}

              {cursosMatriculados.length === 0 && (
                <div style={{
                  padding: '12px',
                  textAlign: 'center',
                  color: theme.textMuted,
                  fontSize: '0.85rem'
                }}>
                  No hay clases programadas
                </div>
              )}
            </div>
          </div>

          {/* Notificaciones */}
          {cursosMatriculados.some(curso => curso.tareasPendientes > 0) && (
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '20px',
              padding: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 8px 0' }}>
                Notificaciones
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cursosMatriculados.filter(curso => curso.tareasPendientes > 0).map((curso) => (
                  <div key={curso.id_curso} style={{
                    padding: '10px',
                    background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                    borderRadius: '12px',
                    border: `1px solid ${theme.warning}30`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <AlertCircle size={14} color={theme.warning} />
                      <span style={{ color: theme.warning, fontSize: '0.85rem', fontWeight: '600' }}>
                        Tarea Pendiente
                      </span>
                    </div>
                    <p style={{ color: theme.textSecondary, fontSize: '0.8rem', margin: 0 }}>
                      {curso.tareasPendientes} tarea{curso.tareasPendientes > 1 ? 's' : ''} - {curso.nombre}
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: '2px 0 0 0' }}>
                      Pendiente desde hoy
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acceso rápido */}
          <div style={{
            background: theme.cardBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '20px',
            padding: '12px',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 8px 0' }}>
              Acceso Rápido
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigate('/panel/estudiante/calificaciones')}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                <FileText size={16} />
                Mis Calificaciones
                <ChevronRight size={16} style={{ marginLeft: 'auto' }} />
              </button>
              <button
                onClick={() => { /* Implementar funcionalidad de compañeros */ }}
                style={{
                  background: 'transparent',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}>
                <Users size={16} />
                Compañeros de Curso
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