import { useState, useEffect } from 'react';
import {
  BookOpen, DollarSign, Award, TrendingUp,
  AlertTriangle, UserCheck, Target, PieChart, BarChart3,
  Activity, UserPlus, Shield, GraduationCap, Users, CheckCircle, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import GlassEffect from '../../components/GlassEffect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
import LoadingModal from '../../components/LoadingModal';
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
  const [matriculasPorMes, setMatriculasPorMes] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const API_BASE = 'http://localhost:3000/api';

  const loadAllData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        console.log('No hay token disponible');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, matriculasRes, actividadRes] = await Promise.all([
        fetch(`${API_BASE}/users/admin-stats`, { headers }),
        fetch(`${API_BASE}/dashboard/matriculas-por-mes`, { headers }),
        fetch(`${API_BASE}/dashboard/actividad-reciente`, { headers })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (matriculasRes.ok) {
        const data = await matriculasRes.json();
        setMatriculasPorMes(data);
      }

      if (actividadRes.ok) {
        const data = await actividadRes.json();
        setActividadReciente(data);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  useSocket({
    'nueva_solicitud': () => {
      console.log('🔔 Nueva solicitud - Actualizando dashboard');
      loadAllData();
    },
    'solicitud_actualizada': () => {
      console.log('🔔 Solicitud actualizada - Actualizando dashboard');
      loadAllData();
    },
    'nuevo_pago': () => {
      console.log('🔔 Nuevo pago - Actualizando dashboard');
      loadAllData();
    },
    'pago_verificado': () => {
      console.log('🔔 Pago verificado - Actualizando dashboard');
      loadAllData();
    }
  });

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        setLoading(true);
        setShowLoadingModal(true);
        await loadAllData();
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setTimeout(() => setShowLoadingModal(false), 300);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const getIconComponent = (iconName) => {
    const icons = {
      UserPlus,
      DollarSign,
      Award,
      BookOpen,
      UserCheck
    };
    return icons[iconName] || Activity;
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(15rem, 90vw), 1fr))',
        gap: isMobile ? '0.75em' : '0.875em',
        marginBottom: isMobile ? '1em' : '1.125em'
      }}>
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
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Total Administradores</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalAdministradores.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeAdministradores >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeAdministradores >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeAdministradores >= 0 ? '+' : ''}${stats.porcentajeAdministradores}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Cursos Activos</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.cursosActivos.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeCursos >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeCursos >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeCursos >= 0 ? '+' : ''}${stats.porcentajeCursos}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Total Estudiantes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalEstudiantes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeEstudiantes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeEstudiantes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeEstudiantes >= 0 ? '+' : ''}${stats.porcentajeEstudiantes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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
              <Users size={14} color="#f59e0b" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Total Docentes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalDocentes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeDocentes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeDocentes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeDocentes >= 0 ? '+' : ''}${stats.porcentajeDocentes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Matrículas Aceptadas</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.matriculasAceptadas.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeMatriculasAceptadas >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeMatriculasAceptadas >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeMatriculasAceptadas >= 0 ? '+' : ''}${stats.porcentajeMatriculasAceptadas}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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
              background: 'rgba(251, 191, 36, 0.12)',
              borderRadius: '0.375em',
              padding: '0.3em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={14} color="#fbbf24" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.75rem' }}>Matrículas Pendientes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.matriculasPendientes.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeMatriculasPendientes >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeMatriculasPendientes >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700' }}>
                {loading ? '...' : `${stats.porcentajeMatriculasPendientes >= 0 ? '+' : ''}${stats.porcentajeMatriculasPendientes}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(11.25rem, 90vw), 1fr))',
        gap: isMobile ? '0.625em' : '0.75em',
        marginBottom: isMobile ? '1em' : '1.125em'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '0.0625rem solid rgba(239, 68, 68, 0.2)', borderRadius: '0.75em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <Target size={isMobile ? 13 : 15} color="#ef4444" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65em', fontWeight: '600', margin: 0 }}>Tasa de Aprobación</h4>
          </div>
          <p style={{ color: '#ef4444', fontSize: '1.4em', fontWeight: '700', margin: 0 }}>94%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.625em', margin: '0.25em 0 0 0' }}>Último mes</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
          border: '0.0625rem solid rgba(139, 92, 246, 0.2)', borderRadius: '0.75em', padding: '0.75em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.4em' }}>
            <Award size={isMobile ? 13 : 15} color="#8b5cf6" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65em', fontWeight: '600', margin: 0 }}>Tasa de Graduación</h4>
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
          {matriculasPorMes.length > 0 ? matriculasPorMes.map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '100%', height: item.altura, background: `linear-gradient(180deg, #ef4444, #dc2626)`,
                borderRadius: '0.375em 0.375em 0.1875em 0.1875em', marginBottom: '0.5em', display: 'flex',
                alignItems: 'start', justifyContent: 'center', paddingTop: '0.375em',
                color: '#fff', fontSize: '0.7em', fontWeight: '600',
                minHeight: item.valor === 0 ? '0.5em' : 'auto'
              }}>
                {item.valor > 0 ? item.valor : ''}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7em', fontWeight: '600' }}>
                {item.mes}
              </span>
            </div>
          )) : (
            <div style={{ width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '2em' }}>
              No hay datos de matrículas
            </div>
          )}
        </div>
      </div>

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
          {actividadReciente.length > 0 ? actividadReciente.map((actividad, index) => {
            const IconComponent = getIconComponent(actividad.icono);
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
          }) : (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '2em' }}>
              No hay actividad reciente
            </div>
          )}
        </div>
      </div>

      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando estadísticas..."
        darkMode={true}
        duration={500}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
      />
    </div>
  );
};

export default Dashboard;
