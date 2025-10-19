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
  const [showCalificaciones, setShowCalificaciones] = useState(false);
  const [showCompaneros, setShowCompaneros] = useState(false);
  const [calificaciones, setCalificaciones] = useState<Array<{cursoId:number; cursoNombre:string; modulo?:string; tarea:string; nota:number}>>([]);
  const [companeros, setCompaneros] = useState<Array<{cursoId:number; cursoNombre:string; nombre:string; email?:string}>>([]);

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

  // Cargar calificaciones por curso del estudiante autenticado
  const fetchCalificaciones = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;
      if (!cursosMatriculados || cursosMatriculados.length === 0) {
        setCalificaciones([]);
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` } as any;
      const all: Array<{cursoId:number; cursoNombre:string; modulo?:string; tarea:string; nota:number}> = [];
      for (const curso of cursosMatriculados) {
        const res = await fetch(`${API_BASE}/calificaciones/estudiante/curso/${curso.id_curso}`, { headers });
        if (!res.ok) continue;
        const payload = await res.json();
        const items = (payload?.calificaciones || []) as any[];
        for (const it of items) {
          const tareaNombreRaw = it.tarea_nombre ?? it.nombre_tarea ?? it.titulo ?? it.tarea ?? it.nombre ?? '';
          const tareaNombre = String(tareaNombreRaw).trim().length > 0 ? String(tareaNombreRaw) : 'Actividad';
          const notaNum = Number(it.nota ?? it.calificacion ?? it.puntaje ?? 0);
          const moduloNombre = it.modulo_nombre ?? it.nombre_modulo ?? it.modulo ?? undefined;
          all.push({ cursoId: curso.id_curso, cursoNombre: curso.nombre, modulo: moduloNombre ? String(moduloNombre) : undefined, tarea: String(tareaNombre), nota: isNaN(notaNum) ? 0 : notaNum });
        }
      }
      setCalificaciones(all);
    } catch (e) {
      setCalificaciones([]);
    }
  };

  // Cargar compañeros por curso del estudiante autenticado
  const fetchCompaneros = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;
      if (!cursosMatriculados || cursosMatriculados.length === 0) {
        setCompaneros([]);
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` } as any;
      const all: Array<{cursoId:number; cursoNombre:string; nombre:string; email?:string}> = [];
      for (const curso of cursosMatriculados) {
        const res = await fetch(`${API_BASE}/cursos/${curso.id_curso}/estudiantes`, { headers });
        if (!res.ok) continue;
        const lista = await res.json();
        const arr = (Array.isArray(lista?.estudiantes) ? lista.estudiantes : Array.isArray(lista) ? lista : []) as any[];
        for (const est of arr) {
          const composed = `${est.nombres ?? ''} ${est.apellidos ?? ''}`.trim();
          const preferido = (est.nombre_completo ?? composed);
          const nombre = (preferido && preferido.length > 0) ? preferido : (est.nombre ?? 'Estudiante');
          const email = est.email ?? est.correo ?? undefined;
          all.push({ cursoId: curso.id_curso, cursoNombre: curso.nombre, nombre, email });
        }
      }
      setCompaneros(all);
    } catch (e) {
      setCompaneros([]);
    }
  };

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
        padding: '12px',
        marginBottom: '12px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.accent}30`
          }}>
            <BookOpen size={18} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.2rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 4px 0' 
            }}>
              <Hand size={16} style={{ display: 'inline', marginRight: '6px' }} /> ¡Bienvenido{userData?.nombre ? `, ${userData.nombre}` : ''}!
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.85rem', 
              margin: '0 0 4px 0' 
            }}>
              Continúa tu formación en Belleza y Estética
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '0.75rem',
              color: theme.textMuted
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                {new Date().toLocaleDateString('es-ES')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} />
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas (ultra-compactas, una sola línea) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: '6px' }}>
          <div style={{
            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
            border: `1px solid ${theme.success}30`,
            borderRadius: '10px',
            padding: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Target size={12} color={theme.success} />
              <span style={{ color: theme.success, fontSize: '0.7rem', fontWeight: '700' }}>Progreso General:</span>
              <span style={{ color: theme.success, fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.length > 0 ? 
                  Math.round(cursosMatriculados.reduce((acc, curso) => acc + curso.progreso, 0) / cursosMatriculados.length) : 0}%
              </span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <BookOpen size={12} color="#3b82f6" />
              <span style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: '700' }}>Cursos Activos:</span>
              <span style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '800' }}>{cursosMatriculados.length}</span>
            </div>
          </div>

          <div style={{
            background: darkMode ? `rgba(251, 191, 36, 0.1)` : `rgba(251, 191, 36, 0.05)`,
            border: `1px solid ${theme.accent}30`,
            borderRadius: '10px',
            padding: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Star size={12} color={theme.accent} />
              <span style={{ color: theme.accent, fontSize: '0.7rem', fontWeight: '700' }}>Promedio:</span>
              <span style={{ color: theme.accent, fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.length > 0 ? 
                  (cursosMatriculados.reduce((acc, curso) => acc + curso.calificacion, 0) / cursosMatriculados.length).toFixed(1) : '0.0'}
              </span>
            </div>
          </div>

          <div style={{
            background: darkMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '10px',
            padding: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
              <Award size={12} color="#8b5cf6" />
              <span style={{ color: '#8b5cf6', fontSize: '0.7rem', fontWeight: '700' }}>Tareas Pendientes:</span>
              <span style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: '800' }}>
                {cursosMatriculados.reduce((acc, curso) => acc + curso.tareasPendientes, 0)}
              </span>
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
          padding: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 12px 0' }}>
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
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {cursosMatriculados.map((curso) => (
            <div
              key={curso.id_curso}
              onClick={() => window.location.href = `/panel/estudiante/curso/${curso.id_curso}`}
              style={{
              padding: '14px',
              background: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '16px',
              border: `1px solid ${theme.border}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{
                      background: `${theme.success}20`,
                      color: theme.success,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {curso.codigo_curso || `CURSO-${curso.id_curso}`}
                    </div>
                    <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
                      {curso.fecha_inicio ? `Inicio: ${new Date(curso.fecha_inicio).toLocaleDateString()}` : 'Fecha por definir'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 8px 0' }}>
                    {curso.nombre || 'Curso sin nombre'}
                  </h3>
                  
                  {/* Información del curso en grid profesional */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px', 
                    marginBottom: '10px',
                    padding: '8px',
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
                        <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600', lineHeight: '1.3' }}>
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
                        <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
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
                        <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600' }}>
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

                  <p style={{ color: theme.textMuted, fontSize: '0.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={12} />
                    Próxima clase: {new Date(curso.proximaClase).toLocaleDateString()} {new Date(curso.proximaClase).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                  </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Star size={14} color={theme.accent} />
                    <span style={{ color: theme.accent, fontSize: '0.95rem', fontWeight: '600' }}>
                      {curso.calificacion}/10
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>
                    Progreso: {curso.progreso}%
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div style={{ marginBottom: '10px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
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
                      <AlertCircle size={14} color={theme.warning} />
                      <span style={{ color: theme.warning, fontSize: '0.85rem', fontWeight: '600' }}>
                        {curso.tareasPendientes} tarea{curso.tareasPendientes > 1 ? 's' : ''} pendiente{curso.tareasPendientes > 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} color={theme.success} />
                      <span style={{ color: theme.success, fontSize: '0.85rem', fontWeight: '600' }}>
                        Al día con las tareas
                      </span>
                    </>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
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
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Upload size={14} />
                      Subir Tarea
                    </button>
                  ) : (
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Play size={14} />
                      Continuar
                    </button>
                  )}
                  
                  <button
                    style={{
                      background: 'transparent',
                      color: theme.accent,
                      border: `1px solid ${theme.accent}30`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Eye size={14} />
                    Ver Detalles
                  </button>
                </div>
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
                      background: index === 0 ? theme.success : '#3b82f6'
                    }} />
                    <span style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: '700' }}>
                      {new Date(curso.proximaClase).toLocaleDateString()} {new Date(curso.proximaClase).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
                onClick={() => { setShowCalificaciones(true); fetchCalificaciones(); }}
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
                onClick={() => { setShowCompaneros(true); fetchCompaneros(); }}
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

          {/* Modal: Mis Calificaciones */}
          {showCalificaciones && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}>
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                width: '100%', maxWidth: '720px', maxHeight: '80vh', overflow: 'auto', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: theme.textPrimary, fontWeight: 800 }}>Mis Calificaciones</h4>
                  <button onClick={() => setShowCalificaciones(false)} style={{ border: 'none', background: 'transparent', color: theme.textSecondary, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {calificaciones.length === 0 && (
                    <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>No hay calificaciones disponibles.</div>
                  )}
                  {calificaciones.length > 0 && (
                    <>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {calificaciones.map((c, idx) => (
                          <div key={idx} style={{
                            display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 2.5fr 0.8fr',
                            alignItems: 'center',
                            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '8px',
                            padding: '8px'
                          }}>
                            <div style={{ fontSize: '0.8rem', color: theme.textSecondary, fontWeight: 600 }}>{c.cursoNombre}</div>
                            <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>{c.modulo ?? 'Módulo'}</div>
                            <div style={{ fontSize: '0.85rem', color: theme.textPrimary }}>Tarea: {c.tarea}</div>
                            <div style={{ textAlign: 'right', fontWeight: 800, color: theme.accent }}>{c.nota.toFixed(1)}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '8px', textAlign: 'right', color: theme.textSecondary, fontSize: '0.9rem' }}>
                        Promedio: <span style={{ color: theme.textPrimary, fontWeight: 800 }}>
                          {(
                            calificaciones.reduce((acc, it) => acc + (isNaN(it.nota) ? 0 : it.nota), 0) / calificaciones.length
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal: Compañeros de Curso */}
          {showCompaneros && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}>
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                width: '100%', maxWidth: '640px', maxHeight: '80vh', overflow: 'auto', padding: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: theme.textPrimary, fontWeight: 800 }}>Compañeros de Curso</h4>
                  <button onClick={() => setShowCompaneros(false)} style={{ border: 'none', background: 'transparent', color: theme.textSecondary, cursor: 'pointer' }}>✕</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {companeros.length === 0 && (
                    <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>No hay compañeros disponibles.</div>
                  )}
                  {companeros.length > 0 && (
                    cursosMatriculados.map((curso) => (
                      <div key={curso.id_curso} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textPrimary, marginBottom: '4px' }}>{curso.nombre}</div>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          {companeros.filter(c => c.cursoId === curso.id_curso).map((cmp, i) => (
                            <div key={i} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                              border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '6px'
                            }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: 700 }}>{cmp.nombre}</span>
                                <span style={{ color: theme.textMuted, fontSize: '0.75rem' }}>{curso.nombre}</span>
                              </div>
                              {cmp.email && <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>{cmp.email}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiAula;
