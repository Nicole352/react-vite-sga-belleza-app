import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, Award, TrendingUp,
  Target, PieChart, BarChart3,
  Activity, Shield, GraduationCap, Users, CheckCircle, Clock,
  UserPlus, DollarSign, UserCheck, Star
} from 'lucide-react';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
import LoadingModal from '../../components/LoadingModal';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { StyledSelect } from '../../components/StyledSelect';
import '../../styles/responsive.css';

const Dashboard = () => {
  const { isMobile, isTablet } = useBreakpoints();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [stats, setStats] = useState({
    totalAdministradores: 0,
    totalEstudiantes: 0,
    estudiantesActivos: 0,
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
  const [matriculasPorMes, setMatriculasPorMes] = useState<Array<{ mes: string; valor: number; altura: string }>>([]);
  const [actividadReciente, setActividadReciente] = useState<Array<{ texto: string; tiempo: string; icono: string; color: string }>>([]);
  const [cursosTop, setCursosTop] = useState<Array<{ nombre_curso: string; total_matriculas: number; color: string }>>([]);
  const [ingresosMes, setIngresosMes] = useState({ ingresos_mes_actual: 0, porcentaje_cambio: 0 });
  const [estadisticasEstudiantes, setEstadisticasEstudiantes] = useState({
    estudiantes_activos: 0,
    estudiantes_inactivos: 0,
    porcentaje_activos: 0,
    tasa_retencion: 0,
    tasa_aprobacion: 0,
    tasa_graduacion: 0,
    tasa_ocupacion: 0
  });
  const [pagosPendientes, setPagosPendientes] = useState({ total_pendientes: 0 });
  const [proximosVencimientos, setProximosVencimientos] = useState<Array<{ id_pago: number; numero_cuota: number; monto: number; fecha_vencimiento: string; dias_restantes: number; nombre_estudiante: string; nombre_curso: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('month'); // 'today', 'week', 'month', 'year', 'all'
  const [courseFilter, setCourseFilter] = useState('all'); // id_tipo_curso o 'all'
  const [tiposCursos, setTiposCursos] = useState<Array<{ id_tipo_curso: number; nombre: string }>>([]);
  const [ingresosTendencias, setIngresosTendencias] = useState<{ datos: Array<{ mes: string; valor: number }>; promedio: number; total: number; mes_mayor: { mes: string; valor: number } }>({ datos: [], promedio: 0, total: 0, mes_mayor: { mes: '', valor: 0 } });
  const API_BASE = (import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/api` : 'http://localhost:3000/api';

  useEffect(() => {
    const syncDarkMode = () => {
      const saved = localStorage.getItem('admin-dark-mode');
      setDarkMode(saved !== null ? JSON.parse(saved) : true);
    };

    const interval = setInterval(syncDarkMode, 150);
    window.addEventListener('storage', syncDarkMode);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', syncDarkMode);
    };
  }, []);

  const theme = useMemo(() => ({
    pageBg: darkMode
      ? 'linear-gradient(180deg, rgba(12,12,18,1) 0%, rgba(9,9,12,1) 100%)'
      : 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,246,246,0.92) 100%)',
    statCardBg: darkMode
      ? 'linear-gradient(135deg, rgba(20,20,28,0.92) 0%, rgba(30,30,38,0.92) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,244,244,0.92) 100%)',
    statCardBorder: darkMode ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.22)',
    statIconBg: (rgb: string) => (darkMode ? `rgba(${rgb}, 0.24)` : `rgba(${rgb}, 0.16)`),
    statIconBorder: (rgb: string) => (darkMode ? `1px solid rgba(${rgb}, 0.35)` : `1px solid rgba(${rgb}, 0.25)`),
    textPrimary: darkMode ? 'rgba(255,255,255,0.92)' : '#1f2937',
    textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : '#4b5563',
    textMuted: darkMode ? 'rgba(255,255,255,0.55)' : '#6b7280',
    valueText: darkMode ? '#fff' : '#111827',
    containerBg: darkMode
      ? 'linear-gradient(135deg, rgba(15,15,20,0.85) 0%, rgba(30,30,35,0.85) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,238,238,0.9) 100%)',
    containerBorder: darkMode ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.25)',
    badgeBg: (color: string) => (darkMode ? `${color}25` : `${color}22`),
    chartBarColor: darkMode ? 'linear-gradient(180deg, #ef4444, #dc2626)' : 'linear-gradient(180deg, #ef4444, #f87171)',
    chartLabelColor: darkMode ? 'rgba(255,255,255,0.75)' : '#4b5563',
    emptyText: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
    overlayBg: darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.45)'
  }), [darkMode]);

  const loadAllData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');

      if (!token) {
        console.log('No hay token disponible');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, matriculasRes, actividadRes, cursosTopRes, ingresosRes, estudiantesRes, pagosRes, vencimientosRes, tendenciasRes] = await Promise.all([
        fetch(`${API_BASE}/users/admin-stats?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/matriculas-por-mes?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/actividad-reciente?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/cursos-top-matriculas?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/ingresos-mes-actual?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/estadisticas-estudiantes?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/pagos-pendientes-verificacion?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/proximos-vencimientos?period=${periodFilter}&course=${courseFilter}`, { headers }),
        fetch(`${API_BASE}/dashboard/ingresos-tendencias?period=${periodFilter}&course=${courseFilter}`, { headers })
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

      if (cursosTopRes.ok) {
        const data = await cursosTopRes.json();
        setCursosTop(data);
      }

      if (ingresosRes.ok) {
        const data = await ingresosRes.json();
        setIngresosMes(data);
      }

      if (estudiantesRes.ok) {
        const data = await estudiantesRes.json();
        setEstadisticasEstudiantes(data);
      }

      if (pagosRes.ok) {
        const data = await pagosRes.json();
        setPagosPendientes(data);
      }

      if (vencimientosRes.ok) {
        const data = await vencimientosRes.json();
        setProximosVencimientos(data);
      }

      if (tendenciasRes.ok) {
        const data = await tendenciasRes.json();
        setIngresosTendencias(data);
      }
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    }
  };

  useSocket({
    'nueva_solicitud': () => {
      console.log('Nueva solicitud - Actualizando dashboard');
      loadAllData();
    },
    'solicitud_actualizada': () => {
      console.log('Solicitud actualizada - Actualizando dashboard');
      loadAllData();
    },
    'matricula_aprobada': () => {
      console.log('Matrícula aprobada - Actualizando dashboard');
      loadAllData();
    },
    'nuevo_pago': () => {
      console.log('Nuevo pago - Actualizando dashboard');
      loadAllData();
    },
    'pago_verificado': () => {
      console.log('Pago verificado - Actualizando dashboard');
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
  }, [periodFilter, courseFilter]); // Recargar cuando cambie cualquier filtro

  // Cargar tipos de cursos al montar
  useEffect(() => {
    const loadTiposCursos = async () => {
      try {
        const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/tipos-cursos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTiposCursos(data);
        }
      } catch (error) {
        console.error('Error cargando tipos de cursos:', error);
      }
    };

    loadTiposCursos();
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      UserPlus,
      DollarSign,
      Award,
      BookOpen,
      UserCheck
    };
    return icons[iconName] || Activity;
  };

  // Helper para obtener el texto del período dinámicamente
  const getPeriodLabel = () => {
    switch (periodFilter) {
      case 'today':
        return 'de Hoy';
      case 'week':
        return 'de los Últimos 7 Días';
      case 'month':
        return 'del Mes';
      case 'year':
        return 'del Año';
      case 'all':
        return 'Total';
      default:
        return 'del Mes';
    }
  };

  // Helper para obtener el texto de comparación dinámicamente
  const getPeriodComparisonLabel = () => {
    switch (periodFilter) {
      case 'today':
        return 'vs ayer';
      case 'week':
        return 'vs semana anterior';
      case 'month':
        return 'vs mes anterior';
      case 'year':
        return 'vs año anterior';
      case 'all':
        return 'histórico';
      default:
        return 'vs mes anterior';
    }
  };

  const statTiles = [
    {
      key: 'admins',
      title: 'Total Administradores',
      value: stats.totalAdministradores,
      percentage: stats.porcentajeAdministradores,
      icon: Shield,
      iconColor: '#ef4444',
      accentRgb: '239, 68, 68'
    },
    {
      key: 'cursos',
      title: 'Cursos Activos',
      value: stats.cursosActivos,
      percentage: stats.porcentajeCursos,
      icon: BookOpen,
      iconColor: '#10b981',
      accentRgb: '16, 185, 129'
    },
    {
      key: 'estudiantes',
      title: 'Total Estudiantes',
      value: stats.totalEstudiantes,
      percentage: stats.porcentajeEstudiantes,
      icon: GraduationCap,
      iconColor: '#3b82f6',
      accentRgb: '59, 130, 246'
    },
    {
      key: 'activos',
      title: 'Estudiantes Activos',
      value: stats.estudiantesActivos || 0,
      percentage: stats.porcentajeEstudiantes,
      icon: UserCheck,
      iconColor: '#22c55e',
      accentRgb: '34, 197, 94'
    },
    {
      key: 'docentes',
      title: 'Total Docentes',
      value: stats.totalDocentes,
      percentage: stats.porcentajeDocentes,
      icon: Users,
      iconColor: '#f59e0b',
      accentRgb: '245, 158, 11'
    },
    {
      key: 'matriculasAceptadas',
      title: 'Matrículas Aceptadas',
      value: stats.matriculasAceptadas,
      percentage: stats.porcentajeMatriculasAceptadas,
      icon: CheckCircle,
      iconColor: '#22c55e',
      accentRgb: '34, 197, 94'
    }
  ];

  return (
    <div data-dark={darkMode ? 'true' : 'false'} style={{ background: theme.pageBg, padding: isMobile ? '0.5rem' : '0.75rem', borderRadius: '0.75rem' }}>
      {/* Header con filtros */}
      <AdminSectionHeader
        title="Dashboard"
        subtitle="Estadísticas generales del sistema"
        marginBottom={isMobile ? '12px' : '0.75rem'}
        rightSlot={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Filtro de Período */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: 500 }}>Período:</span>
              <StyledSelect
                name="periodFilter"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                options={[
                  { value: 'today', label: 'Hoy' },
                  { value: 'week', label: 'Últimos 7 días' },
                  { value: 'month', label: 'Este mes' },
                  { value: 'year', label: 'Este año' },
                  { value: 'all', label: 'Todo' }
                ]}
                style={{ minWidth: '130px', fontSize: '0.7rem' }}
              />
            </div>

            {/* Filtro de Curso */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: 500 }}>Curso:</span>
              <StyledSelect
                name="courseFilter"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Todos' },
                  ...tiposCursos.map(tc => ({ value: tc.id_tipo_curso.toString(), label: tc.nombre }))
                ]}
                style={{ minWidth: '140px', fontSize: '0.7rem' }}
              />
            </div>
          </div>
        }
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(10.5rem, 90vw), 1fr))',
        gap: isMobile ? '0.5em' : '0.625em',
        marginBottom: isMobile ? '0.75em' : '0.875em'
      }}>
        {statTiles.map(({ key, title, value, percentage, icon: Icon, iconColor, accentRgb }) => {
          const trendColor = percentage >= 0 ? '#22c55e' : '#ef4444';
          const formattedPercentage = loading ? '...' : `${percentage >= 0 ? '+' : ''}${percentage}%`;
          return (
            <div
              key={key}
              style={{
                background: theme.statCardBg,
                border: `0.0625rem solid ${theme.statCardBorder}`,
                borderRadius: '0.625em',
                padding: '0.35em',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: darkMode ? '0 12px 24px rgba(0,0,0,0.25)' : '0 10px 20px rgba(239,68,68,0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.2em' }}>
                <div style={{
                  background: theme.statIconBg(accentRgb),
                  border: theme.statIconBorder(accentRgb),
                  borderRadius: '0.375em',
                  padding: '0.25em',
                  width: isMobile ? '1.5rem' : '1.625rem',
                  height: isMobile ? '1.5rem' : '1.625rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={12} color={iconColor} strokeWidth={2.25} />
                </div>
                <h3 style={{ color: theme.textPrimary, margin: 0, fontSize: '0.65rem', fontWeight: 600 }}>{title}</h3>
              </div>
              <p style={{ color: theme.valueText, fontSize: '1.15rem', fontWeight: '700', margin: '0 0 0.08em 0', lineHeight: '1', letterSpacing: '-0.02em' }}>
                {loading ? '...' : value.toLocaleString()}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15em' }}>
                  <TrendingUp size={8} color={trendColor} strokeWidth={2} />
                  <span style={{ color: trendColor, fontSize: '0.6rem', fontWeight: '700' }}>
                    {formattedPercentage}
                  </span>
                </div>
                <span style={{ color: theme.textMuted, fontSize: '0.625rem', fontWeight: '500' }}>vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(10rem, 90vw), 1fr))',
        gap: isMobile ? '0.5em' : '0.625em',
        marginBottom: isMobile ? '0.75em' : '0.875em'
      }}>
        {[{
          key: 'aprobacion',
          title: 'Tasa Aprobación',
          value: loading ? '...' : `${estadisticasEstudiantes.tasa_aprobacion}%`,
          subtitle: 'Global',
          icon: Target,
          color: '#ef4444',
          rgb: '239, 68, 68'
        }, {
          key: 'graduacion',
          title: 'Tasa de Graduación',
          value: loading ? '...' : `${estadisticasEstudiantes.tasa_graduacion}%`,
          subtitle: 'Histórico',
          icon: Award,
          color: '#8b5cf6',
          rgb: '139, 92, 246'
        }, {
          key: 'ocupacion',
          title: 'Ocupación Cursos',
          value: loading ? '...' : `${estadisticasEstudiantes.tasa_ocupacion}%`,
          subtitle: 'Promedio general',
          icon: PieChart,
          color: '#06b6d4',
          rgb: '6, 182, 212'
        }].map(({ key, title, value, subtitle, icon: Icon, color, rgb }) => (
          <div
            key={key}
            style={{
              background: darkMode
                ? `linear-gradient(135deg, rgba(${rgb},0.18), rgba(${rgb},0.08))`
                : `linear-gradient(135deg, rgba(${rgb},0.12), rgba(${rgb},0.05))`,
              border: `0.0625rem solid rgba(${rgb}, ${darkMode ? 0.35 : 0.28})`,
              borderRadius: '0.625em',
              padding: '0.625em',
              boxShadow: darkMode ? '0 14px 28px rgba(0,0,0,0.3)' : '0 12px 24px rgba(148,163,184,0.16)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.25em' }}>
              <Icon size={isMobile ? 12 : 14} color={color} />
              <h4 style={{ color: theme.textPrimary, fontSize: '0.65em', fontWeight: 600, margin: 0 }}>{title}</h4>
            </div>
            <p style={{ color, fontSize: '1.25em', fontWeight: '700', margin: 0 }}>{value}</p>
            <p style={{ color: theme.textMuted, fontSize: '0.6em', margin: '0.125em 0 0 0' }}>{subtitle}</p>
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
        gap: isMobile ? '0.5em' : '0.625em',
        marginBottom: isMobile ? '0.75em' : '0.875em'
      }}>
        {/* Ingresos del Período */}
        <div style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.08))'
            : 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.05))',
          border: `0.0625rem solid rgba(34,197,94, ${darkMode ? 0.35 : 0.28})`,
          borderRadius: '0.625em',
          padding: '0.625em',
          boxShadow: darkMode ? '0 14px 28px rgba(0,0,0,0.3)' : '0 12px 24px rgba(148,163,184,0.16)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.25em' }}>
            <DollarSign size={isMobile ? 12 : 14} color="#22c55e" />
            <h4 style={{ color: theme.textPrimary, fontSize: '0.65em', fontWeight: 600, margin: 0 }}>Ingresos {getPeriodLabel()}</h4>
          </div>
          <p style={{ color: '#22c55e', fontSize: '1.25em', fontWeight: '700', margin: 0 }}>
            ${loading ? '...' : (ingresosTendencias?.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em', marginTop: '0.25em' }}>
            <TrendingUp size={9} color={ingresosMes.porcentaje_cambio >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
            <span style={{ color: ingresosMes.porcentaje_cambio >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.6em', fontWeight: '700' }}>
              {loading ? '...' : `${ingresosMes.porcentaje_cambio >= 0 ? '+' : ''}${ingresosMes.porcentaje_cambio}%`}
            </span>
            <span style={{ color: theme.textMuted, fontSize: '0.6em', margin: 0 }}>{getPeriodComparisonLabel()}</span>
          </div>
        </div>
        {/* Estudiantes Activos */}
        <div style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(59,130,246,0.08))'
            : 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.05))',
          border: `0.0625rem solid rgba(59,130,246, ${darkMode ? 0.35 : 0.28})`,
          borderRadius: '0.625em',
          padding: '0.625em',
          boxShadow: darkMode ? '0 14px 28px rgba(0,0,0,0.3)' : '0 12px 24px rgba(148,163,184,0.16)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.25em' }}>
            <Users size={isMobile ? 12 : 14} color="#3b82f6" />
            <h4 style={{ color: theme.textPrimary, fontSize: '0.65em', fontWeight: 600, margin: 0 }}>Estudiantes Activos</h4>
          </div>
          <p style={{ color: '#3b82f6', fontSize: '1.25em', fontWeight: '700', margin: 0 }}>
            {loading ? '...' : `${estadisticasEstudiantes.porcentaje_activos}%`}
          </p>
          <div style={{ marginTop: '0.35em' }}>
            <div style={{ width: '100%', height: '0.3em', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '0.3em', overflow: 'hidden' }}>
              <div style={{ width: `${estadisticasEstudiantes.porcentaje_activos}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ color: theme.textMuted, fontSize: '0.6em', margin: '0.15em 0 0 0' }}>
              {loading ? '...' : `${estadisticasEstudiantes.estudiantes_activos} de ${estadisticasEstudiantes.estudiantes_activos + estadisticasEstudiantes.estudiantes_inactivos} estudiantes`}
            </p>
          </div>
        </div>
        {/* Tasa de Retención */}
        <div style={{
          background: darkMode
            ? 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(139,92,246,0.08))'
            : 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.05))',
          border: `0.0625rem solid rgba(139,92,246, ${darkMode ? 0.35 : 0.28})`,
          borderRadius: '0.625em',
          padding: '0.625em',
          boxShadow: darkMode ? '0 14px 28px rgba(0,0,0,0.3)' : '0 12px 24px rgba(148,163,184,0.16)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3em', marginBottom: '0.25em' }}>
            <Award size={isMobile ? 12 : 14} color="#8b5cf6" />
            <h4 style={{ color: theme.textPrimary, fontSize: '0.65em', fontWeight: 600, margin: 0 }}>Tasa de Retención</h4>
          </div>
          <p style={{ color: '#8b5cf6', fontSize: '1.25em', fontWeight: '700', margin: 0 }}>
            {loading ? '...' : `${estadisticasEstudiantes.tasa_retencion}%`}
          </p>
          <p style={{ color: theme.textMuted, fontSize: '0.6em', margin: '0.15em 0 0 0' }}>Estudiantes que completan</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '0.5fr 0.7fr 0.8fr',
        gap: isMobile ? '0.75em' : '0.875em',
        marginBottom: isMobile ? '0.75em' : '0.875em'
      }}>
        {/* Gráfico Circular - Pagos Pendientes */}
        <div style={{
          background: theme.containerBg,
          border: `0.0625rem solid ${theme.containerBorder}`,
          borderRadius: '0.75em',
          padding: '0.875em',
          boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.35)' : '0 16px 32px rgba(239,68,68,0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h3 style={{ color: theme.textPrimary, marginBottom: '0.75em', fontSize: '0.8em', fontWeight: 600, textAlign: 'center' }}>
            Pagos Pendientes Verificación {getPeriodLabel()}
          </h3>

          {/* Gráfico de Dona Circular */}
          <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '0.75em' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              {/* Círculo de fondo */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                strokeWidth="14"
              />
              {/* Círculo de progreso */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="14"
                strokeDasharray={`${Math.min((pagosPendientes.total_pendientes / 20) * 314, 314)} 314`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
              <defs>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fb923c" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
            </svg>
            {/* Número central */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ color: '#fb923c', fontSize: '2em', fontWeight: '700', lineHeight: '1' }}>
                {loading ? '...' : pagosPendientes.total_pendientes}
              </div>
              <div style={{ color: theme.textMuted, fontSize: '0.6em', marginTop: '0.15em' }}>pagos</div>
            </div>
          </div>

          <p style={{ color: theme.textSecondary, fontSize: '0.75em', textAlign: 'center', margin: 0 }}>
            Esperando aprobación del admin
          </p>
        </div>

        {/* Gráfico de Tendencias de Ingresos - Compacto */}
        <div style={{
          background: theme.containerBg,
          border: `0.0625rem solid ${theme.containerBorder}`,
          borderRadius: '0.75em',
          padding: '0.875em',
          boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.35)' : '0 16px 32px rgba(34,197,94,0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em', marginBottom: '0.5em' }}>
            <TrendingUp size={14} color="#22c55e" strokeWidth={2.5} />
            <h3 style={{ color: theme.textPrimary, margin: 0, fontSize: '0.75em', fontWeight: 600 }}>
              Tendencias {getPeriodLabel()}
            </h3>
          </div>

          <div style={{ position: 'relative', height: '100px', marginBottom: '0.5em' }}>
            <svg width="100%" height="100" viewBox="0 0 300 100" preserveAspectRatio="none">
              {[0, 1, 2, 3].map(i => (
                <line key={i} x1="0" y1={i * 25} x2="300" y2={i * 25} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="1" />
              ))}

              {ingresosTendencias.datos.length > 0 && (() => {
                const maxValor = Math.max(...ingresosTendencias.datos.map(d => d.valor), 1);
                const points = ingresosTendencias.datos.map((d, i) => {
                  const x = (i / (ingresosTendencias.datos.length - 1)) * 300;
                  const y = 100 - ((d.valor / maxValor) * 80);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <>
                    <polygon points={`0,100 ${points} 300,100`} fill="url(#greenGradient)" opacity="0.2" />
                    <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {ingresosTendencias.datos.map((d, i) => {
                      const x = (i / (ingresosTendencias.datos.length - 1)) * 300;
                      const y = 100 - ((d.valor / maxValor) * 80);
                      const isMax = d.mes === ingresosTendencias.mes_mayor.mes;
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r={isMax ? "4" : "2.5"} fill={isMax ? "#22c55e" : theme.containerBg} stroke="#22c55e" strokeWidth="1.5" />
                          {isMax && <g transform={`translate(${x - 6}, ${y - 14})`}><Star size={12} fill="#22c55e" color="#22c55e" /></g>}
                        </g>
                      );
                    })}
                  </>
                );
              })()}

              <defs>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Estadísticas Resumidas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5em' }}>
            <div style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(34,197,94,0.06)',
              borderRadius: '0.5em',
              padding: '0.4em 0.75em'
            }}>
              <span style={{ fontSize: '0.65em', color: theme.textMuted, display: 'block', marginBottom: '0.1em' }}>Total</span>
              <span style={{ fontSize: '0.9em', fontWeight: 700, color: '#22c55e', display: 'block' }}>
                ${(ingresosTendencias?.total || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div style={{ padding: '0.4em', background: darkMode ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.05)', borderRadius: '0.4em' }}>
              <div style={{ color: theme.textMuted, fontSize: '0.6em' }}>Mejor</div>
              <div style={{ color: '#22c55e', fontSize: '0.75em', fontWeight: '700' }}>
                {loading ? '...' : ingresosTendencias.mes_mayor.mes}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline - Próximos Vencimientos */}
        <div style={{
          background: theme.containerBg,
          border: `0.0625rem solid ${theme.containerBorder}`,
          borderRadius: '0.75em',
          padding: '0.875em',
          boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.35)' : '0 16px 32px rgba(239,68,68,0.12)'
        }}>
          <h3 style={{ color: theme.textPrimary, marginBottom: '0.75em', fontSize: '0.8em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <Clock size={16} color="#ef4444" />
            Próximos Vencimientos (7 días)
            {proximosVencimientos.length > 0 && (
              <span style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                fontSize: '0.7em',
                padding: '0.1em 0.5em',
                borderRadius: '1em',
                marginLeft: 'auto'
              }}>
                {proximosVencimientos.length} pendientes
              </span>
            )}
          </h3>

          {proximosVencimientos.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625em',
              maxHeight: '280px',
              overflowY: 'auto',
              paddingRight: '0.5em',
              paddingLeft: '0.75em'
            }}>
              {proximosVencimientos.map((venc, index) => {
                const urgenciaColor = venc.dias_restantes <= 2 ? '#ef4444' : venc.dias_restantes <= 5 ? '#fb923c' : '#fbbf24';
                const urgenciaLabel = venc.dias_restantes === 0 ? 'HOY' : venc.dias_restantes === 1 ? 'MAÑANA' : `${venc.dias_restantes} días`;

                return (
                  <div key={index} style={{
                    position: 'relative',
                    paddingLeft: '1.5em',
                    paddingBottom: index < proximosVencimientos.length - 1 ? '0.625em' : '0',
                    borderLeft: index < proximosVencimientos.length - 1 ? `2px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` : 'none'
                  }}>
                    {/* Punto del timeline */}
                    <div style={{
                      position: 'absolute',
                      left: '-5px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: urgenciaColor,
                      boxShadow: `0 0 0 3px ${darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)'}`,
                      border: `2px solid ${urgenciaColor}`
                    }} />

                    {/* Contenido */}
                    <div style={{
                      background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      borderRadius: '0.5em',
                      padding: '0.625em',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      borderLeft: `3px solid ${urgenciaColor}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5em' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: theme.textPrimary, fontSize: '0.75em', fontWeight: '600', marginBottom: '0.2em' }}>
                            {venc.nombre_estudiante}
                          </div>
                          <div style={{ color: theme.textSecondary, fontSize: '0.65em' }}>
                            {venc.nombre_curso}
                          </div>
                        </div>
                        <div style={{
                          background: `${urgenciaColor}20`,
                          color: urgenciaColor,
                          fontSize: '0.6em',
                          fontWeight: '700',
                          padding: '0.25em 0.5em',
                          borderRadius: '0.375em',
                          marginLeft: '0.5em',
                          whiteSpace: 'nowrap'
                        }}>
                          {urgenciaLabel}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: theme.textMuted, fontSize: '0.65em' }}>
                          Cuota #{venc.numero_cuota}
                        </span>
                        <span style={{ color: theme.textPrimary, fontSize: '0.75em', fontWeight: '600' }}>
                          ${venc.monto.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: theme.emptyText,
              padding: '2em 1em',
              fontSize: '0.75em',
              background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderRadius: '0.5em'
            }}>
              <Clock size={32} color={theme.emptyText} style={{ marginBottom: '0.5em', opacity: 0.5 }} />
              <div>No hay pagos próximos a vencer</div>
            </div>
          )}
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr',
        gap: isMobile ? '0.75em' : '0.875em',
        marginBottom: isMobile ? '0.75em' : '0.875em'
      }}>
        {/* Gráfico de Matrículas */}
        <div style={{
          background: theme.containerBg,
          border: `0.0625rem solid ${theme.containerBorder}`,
          borderRadius: '0.75em',
          padding: '0.875em',
          boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.35)' : '0 16px 32px rgba(239,68,68,0.12)'
        }}>
          <h3 style={{ color: theme.textPrimary, marginBottom: '0.75em', display: 'flex', alignItems: 'center', gap: '0.5em', fontSize: '0.8em', fontWeight: 600 }}>
            <BarChart3 size={isMobile ? 15 : 17} color="#ef4444" />
            Matrículas por Mes (Últimos 6 meses)
          </h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: '0.625em', height: '9rem', padding: '0 0.5em' }}>
            {matriculasPorMes.length > 0 ? matriculasPorMes.map((item, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: '100%',
                  height: item.altura,
                  background: theme.chartBarColor,
                  borderRadius: '0.375em 0.375em 0.1875em 0.1875em',
                  marginBottom: '0.5em',
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'center',
                  paddingTop: '0.375em',
                  color: '#fff',
                  fontSize: '0.7em',
                  fontWeight: '600',
                  minHeight: item.valor === 0 ? '0.5em' : 'auto',
                  boxShadow: darkMode ? '0 10px 18px rgba(239,68,68,0.28)' : '0 10px 18px rgba(239,68,68,0.2)'
                }}>
                  {item.valor > 0 ? item.valor : ''}
                </div>
                <span style={{ color: theme.chartLabelColor, fontSize: '0.7em', fontWeight: '600' }}>
                  {item.mes}
                </span>
              </div>
            )) : (
              <div style={{ width: '100%', textAlign: 'center', color: theme.emptyText, padding: '2em' }}>
                No hay datos de matrículas
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Pastel - Cursos Top */}
        <div style={{
          background: theme.containerBg,
          border: `0.0625rem solid ${theme.containerBorder}`,
          borderRadius: '0.75em',
          padding: '0.875em',
          boxShadow: darkMode ? '0 20px 40px rgba(0,0,0,0.35)' : '0 16px 32px rgba(239,68,68,0.12)'
        }}>
          <h3 style={{ color: theme.textPrimary, marginBottom: '0.75em', display: 'flex', alignItems: 'center', gap: '0.5em', fontSize: '0.8em', fontWeight: 600 }}>
            <PieChart size={isMobile ? 15 : 17} color="#ef4444" />
            Cursos con Más Matrículas
          </h3>
          {cursosTop.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
              {cursosTop.map((curso, index) => {
                const total = cursosTop.reduce((sum, c) => sum + c.total_matriculas, 0);
                const porcentaje = total > 0 ? Math.round((curso.total_matriculas / total) * 100) : 0;
                return (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
                    <div style={{ width: '0.75em', height: '0.75em', borderRadius: '0.1875em', background: curso.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25em' }}>
                        <span style={{ color: theme.textPrimary, fontSize: '0.75em', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {curso.nombre_curso}
                        </span>
                        <span style={{ color: theme.textSecondary, fontSize: '0.7em', fontWeight: '700', marginLeft: '0.5em', flexShrink: 0 }}>
                          {curso.total_matriculas}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '0.375em', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '0.375em', overflow: 'hidden' }}>
                        <div style={{ width: `${porcentaje}%`, height: '100%', background: curso.color, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: theme.emptyText, padding: '2em' }}>
              No hay datos de cursos
            </div>
          )}
        </div>
      </div>

      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando estadísticas..."
        darkMode={darkMode}
        duration={500}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
      />
    </div >
  );
};

export default Dashboard;
