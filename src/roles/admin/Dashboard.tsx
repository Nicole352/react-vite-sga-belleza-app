import { useState, useEffect } from 'react';
import {
  BookOpen, DollarSign, Award, TrendingUp,
  AlertTriangle, UserCheck, Target, PieChart, BarChart3,
  Activity, UserPlus, Shield, GraduationCap, Users, CheckCircle, Clock
} from 'lucide-react';
import GlassEffect from '../../components/GlassEffect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const Dashboard = () => {
  const { isMobile, isTablet, isSmallScreen } = useBreakpoints();
  const [stats, setStats] = useState({
    totalAdministradores: 0,
    totalEstudiantes: 0,
    totalDocentes: 0,
    cursosActivos: 0,
    matriculasAceptadas: 0,
    matriculasPendientes: 0,
    porcentajeAdministradores: 0,
    porcentajeEstudiantes: 0,
    porcentajeDocentes: 0,
    porcentajeCursos: 0,
    porcentajeMatriculasAceptadas: 0,
    porcentajeMatriculasPendientes: 0
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:3000/api';

  // Cargar estadísticas reales
  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta

    const loadStats = async () => {
      try {
        const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');

        if (!token) {
          console.log('No hay token disponible');
          if (isMounted) setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/users/admin-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setStats(data);
          }
        } else {
          console.log('Error al cargar estadísticas:', res.status);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Array de dependencias vacío para que solo se ejecute una vez

  return (
    <div>
      {/* Tarjetas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(15rem, 90vw), 1fr))',
        gap: isMobile ? '0.75em' : '0.875em',
        marginBottom: isMobile ? '1em' : '1.125em'
      }}>
        {/* Total Administradores */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={14} color="#ef4444" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Total Administradores</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalAdministradores.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeAdministradores >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeAdministradores >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeAdministradores >= 0 ? '+' : ''}${stats.porcentajeAdministradores}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Cursos Activos */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <BookOpen size={14} color="#10b981" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Cursos Activos</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.cursosActivos.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeCursos >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeCursos >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeCursos >= 0 ? '+' : ''}${stats.porcentajeCursos}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Matrículas Aceptadas */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle size={14} color="#22c55e" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Matrículas Aceptadas</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.matriculasAceptadas.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeMatriculasAceptadas >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeMatriculasAceptadas >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeMatriculasAceptadas >= 0 ? '+' : ''}${stats.porcentajeMatriculasAceptadas}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Matrículas Pendientes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={14} color="#f59e0b" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Matrículas Pendientes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.matriculasPendientes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeMatriculasPendientes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeMatriculasPendientes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeMatriculasPendientes >= 0 ? '+' : ''}${stats.porcentajeMatriculasPendientes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Total Estudiantes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <GraduationCap size={14} color="#3b82f6" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Total Estudiantes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalEstudiantes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeEstudiantes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeEstudiantes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeEstudiantes >= 0 ? '+' : ''}${stats.porcentajeEstudiantes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Total Docentes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.625em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(168, 85, 247, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={14} color="#a855f7" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Total Docentes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalDocentes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeDocentes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeDocentes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeDocentes >= 0 ? '+' : ''}${stats.porcentajeDocentes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(10rem, 45vw), 1fr))', gap: '0.75em', marginBottom: '1.25em' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.04))',
          border: '0.0625rem solid rgba(239, 68, 68, 0.15)', borderRadius: '0.625em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <AlertTriangle size={isMobile ? 13 : 15} color="#ef4444" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65em', fontWeight: '600', margin: 0 }}>Pagos Pendientes</h4>
          </div>
          <p style={{ color: '#ef4444', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>23</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625em', margin: '0.25em 0 0 0' }}>$12,450 en deuda</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(21, 128, 61, 0.04))',
          border: '0.0625rem solid rgba(34, 197, 94, 0.15)', borderRadius: '0.625em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <UserCheck size={isMobile ? 13 : 15} color="#22c55e" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65em', fontWeight: '600', margin: 0 }}>Profesores Activos</h4>
          </div>
          <p style={{ color: '#22c55e', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>8</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625em', margin: '0.25em 0 0 0' }}>Todos asignados</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(124, 58, 237, 0.04))',
          border: '0.0625rem solid rgba(139, 92, 246, 0.15)', borderRadius: '0.625em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <Target size={isMobile ? 13 : 15} color="#8b5cf6" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7em', fontWeight: '600', margin: 0 }}>Tasa Graduación</h4>
          </div>
          <p style={{ color: '#8b5cf6', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>87%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625em', margin: '0.25em 0 0 0' }}>Último semestre</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.05))',
          border: '0.0625rem solid rgba(6, 182, 212, 0.2)', borderRadius: '0.75em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <PieChart size={isMobile ? 13 : 15} color="#06b6d4" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65em', fontWeight: '600', margin: 0 }}>Ocupación Cursos</h4>
          </div>
          <p style={{ color: '#06b6d4', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>73%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625em', margin: '0.25em 0 0 0' }}>Promedio general</p>
        </div>
      </div>

      {/* Gráfico de barras - Matrículas por mes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,15,20,0.7) 0%, rgba(30,30,35,0.7) 100%)',
        backdropFilter: 'blur(1.25rem)', border: '0.0625rem solid rgba(239, 68, 68, 0.15)',
        borderRadius: '0.875em', padding: '1.125em', marginBottom: '1.25em'
      }}>
        <h3 style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '1em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <BarChart3 size={isMobile ? 17 : 19} color="#ef4444" />
          Matrículas por Mes (Últimos 6 meses)
        </h3>

        <div style={{ display: 'flex', alignItems: 'end', gap: '0.75em', height: '10rem', padding: '0 0.75em' }}>
          {[
            { mes: 'Ago', valor: 32, altura: '60%' },
            { mes: 'Sep', valor: 28, altura: '52%' },
            { mes: 'Oct', valor: 45, altura: '85%' },
            { mes: 'Nov', valor: 38, altura: '70%' },
            { mes: 'Dic', valor: 52, altura: '100%' },
            { mes: 'Ene', valor: 41, altura: '78%' }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '100%', height: item.altura, background: `linear-gradient(180deg, #ef4444, #dc2626)`,
                borderRadius: '0.375em 0.375em 0.1875em 0.1875em', marginBottom: '0.5em', display: 'flex',
                alignItems: 'start', justifyContent: 'center', paddingTop: '0.375em',
                color: '#fff', fontSize: '0.7em', fontWeight: '600'
              }}>
                {item.valor}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7em', fontWeight: '600' }}>
                {item.mes}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15,15,20,0.7) 0%, rgba(30,30,35,0.7) 100%)',
        backdropFilter: 'blur(1.25rem)', border: '0.0625rem solid rgba(239, 68, 68, 0.15)',
        borderRadius: '0.875em', padding: '1.125em'
      }}>
        <h3 style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '1em', display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <Activity size={isMobile ? 17 : 19} color="#ef4444" />
          Actividad Reciente
        </h3>

        <div style={{ display: 'grid', gap: '0.75em' }}>
          {[
            { texto: 'Nueva matrícula: Ana García en Cosmetología Básica', tiempo: 'Hace 2 horas', icono: UserPlus, color: '#10b981' },
            { texto: 'Pago recibido: Carlos López - $350', tiempo: 'Hace 4 horas', icono: DollarSign, color: '#f59e0b' },
            { texto: 'Certificado emitido: María Rodríguez - Peluquería', tiempo: 'Hace 6 horas', icono: Award, color: '#a855f7' },
            { texto: 'Nuevo curso creado: Maquillaje Profesional', tiempo: 'Hace 1 día', icono: BookOpen, color: '#3b82f6' },
            { texto: 'Profesor asignado: Dr. Mendoza a Tratamientos Faciales', tiempo: 'Hace 2 días', icono: UserCheck, color: '#ef4444' }
          ].map((actividad, index) => {
            const IconComponent = actividad.icono;
            return (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', gap: '0.75em', padding: '0.75em',
                background: 'rgba(255,255,255,0.02)', borderRadius: '0.625em', border: '0.0625rem solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  background: `rgba(${actividad.color === '#10b981' ? '16, 185, 129' :
                    actividad.color === '#f59e0b' ? '245, 158, 11' :
                      actividad.color === '#a855f7' ? '168, 85, 247' :
                        actividad.color === '#3b82f6' ? '59, 130, 246' : '239, 68, 68'}, 0.2)`,
                  borderRadius: '0.5em', padding: '0.5em'
                }}>
                  <IconComponent size={isMobile ? 16 : 17} color={actividad.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75em', fontWeight: '500', margin: '0 0 0.1875em 0' }}>
                    {actividad.texto}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65em', margin: 0 }}>
                    {actividad.tiempo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


