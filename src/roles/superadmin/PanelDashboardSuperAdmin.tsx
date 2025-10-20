import { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  DollarSign,
  Server,
  Activity,
  TrendingUp,
  Database,
  Wifi,
  CheckCircle,
  Shield,
  BarChart3
} from 'lucide-react';
import { useBreakpoints } from '../../hooks/useMediaQuery';

const PanelDashboardSuperAdmin = () => {
  const { isMobile } = useBreakpoints();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalAdministradores: 0,
    totalEstudiantes: 0,
    porcentajeUsuarios: 0,
    porcentajeAdministradores: 0,
    porcentajeEstudiantes: 0
  });
  const [loading, setLoading] = useState(true);
  const API_BASE = 'http://localhost:3000/api';

  // Cargar estadísticas reales
  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        if (!token) {
          console.log('No hay token disponible');
          if (isMounted) setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/users/stats`, {
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

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* Tarjetas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(15rem, 90vw), 1fr))',
        gap: isMobile ? '0.75em' : '0.875em',
        marginBottom: isMobile ? '1em' : '1.125em'
      }}>
        {/* Total Usuarios */}
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
              <Users size={14} color="#3b82f6" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Total Usuarios</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalUsuarios.toLocaleString()}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color={stats.porcentajeUsuarios >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} />
              <span style={{ color: stats.porcentajeUsuarios >= 0 ? '#22c55e' : '#ef4444', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                {loading ? '...' : `${stats.porcentajeUsuarios >= 0 ? '+' : ''}${stats.porcentajeUsuarios}%`}
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

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

        {/* Estudiantes Activos */}
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
              <GraduationCap size={14} color="#10b981" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Estudiantes Activos</h3>
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

        {/* Ingresos Mensuales */}
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
              <DollarSign size={14} color="#f59e0b" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Ingresos Mensuales</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            $24,580
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <TrendingUp size={10} color="#22c55e" strokeWidth={2} />
              <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                +15%
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Estado del Sistema */}
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
              <Server size={14} color="#10b981" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Uptime del Sistema</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.375em 0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            99.9%
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2em' }}>
              <CheckCircle size={10} color="#22c55e" strokeWidth={2} />
              <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: '700', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                Operativo
              </span>
            </div>
            <span style={{ color: 'rgba(150,150,160,1)', fontSize: '0.7rem', fontWeight: '500' }}>Estado actual</span>
          </div>
        </div>
      </div>

      {/* Gráficos y Estadísticas Adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: isMobile ? '1em' : '1.25em' }}>
        {/* Gráfico de Actividad */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15,15,20,0.7) 0%, rgba(30,30,35,0.7) 100%)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(239, 68, 68, 0.15)',
          borderRadius: '0.875em',
          padding: '1.125em',
          boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginBottom: '1em' }}>
            <div style={{
              width: '2.5em',
              height: '2.5em',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '0.625em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Activity size={isMobile ? 18 : 20} color="#fff" />
            </div>
            <h3 style={{ color: 'rgba(255,255,255,0.95)', margin: 0 }}>
              Actividad del Sistema
            </h3>
          </div>
          
          {/* Placeholder para gráfico */}
          <div style={{
            height: '12.5rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '0.625em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '0.0625rem solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              <TrendingUp size={isMobile ? 40 : 48} style={{ marginBottom: '0.75em' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>Gráfico de actividad semanal</div>
            </div>
          </div>
        </div>

        {/* Estado de Servicios */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15,15,20,0.7) 0%, rgba(30,30,35,0.7) 100%)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(239, 68, 68, 0.15)',
          borderRadius: '0.875em',
          padding: '1.125em',
          boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ color: 'rgba(255,255,255,0.95)', marginBottom: '1em' }}>
            Estado de Servicios
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75em',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625em',
              border: '0.0625rem solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em' }}>
                <Database size={isMobile ? 16 : 18} color="#10b981" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: '500' }}>Base de Datos</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Activo</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75em',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625em',
              border: '0.0625rem solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em' }}>
                <Server size={isMobile ? 16 : 18} color="#10b981" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: '500' }}>Servidor Web</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Activo</span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.75em',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625em',
              border: '0.0625rem solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em' }}>
                <Wifi size={isMobile ? 16 : 18} color="#10b981" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem', fontWeight: '500' }}>Conectividad</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4em' }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '600' }}>Estable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelDashboardSuperAdmin;
