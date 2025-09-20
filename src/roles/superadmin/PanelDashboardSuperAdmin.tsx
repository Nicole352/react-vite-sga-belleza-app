import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';

const PanelDashboardSuperAdmin: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalAdministradores: 0,
    totalEstudiantes: 0,
    porcentajeUsuarios: 0,
    porcentajeAdministradores: 0,
    porcentajeEstudiantes: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const API_BASE = 'http://localhost:3000/api';

  // Cargar estadísticas reales
  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        if (!token) {
          console.log('No hay token disponible');
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          console.log('Error al cargar estadísticas:', res.status);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <div style={{
      padding: '32px'
    }}>

    {/* Tarjetas de Estadísticas Principales */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      {/* Total Usuarios */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} color="#fff" />
          </div>
          <div style={{ 
            color: stats.porcentajeUsuarios >= 0 ? '#10b981' : '#ef4444', 
            fontSize: '0.8rem', 
            fontWeight: '600' 
          }}>
            {loading ? '...' : `${stats.porcentajeUsuarios >= 0 ? '+' : ''}${stats.porcentajeUsuarios}% este mes`}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
          {loading ? '...' : stats.totalUsuarios.toLocaleString()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Total Usuarios
        </div>
      </div>

      {/* Total Administradores */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={24} color="#fff" />
          </div>
          <div style={{ 
            color: stats.porcentajeAdministradores >= 0 ? '#10b981' : '#ef4444', 
            fontSize: '0.8rem', 
            fontWeight: '600' 
          }}>
            {loading ? '...' : `${stats.porcentajeAdministradores >= 0 ? '+' : ''}${stats.porcentajeAdministradores}% este mes`}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
          {loading ? '...' : stats.totalAdministradores.toLocaleString()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Total Administradores
        </div>
      </div>

      {/* Estudiantes Activos */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} color="#fff" />
          </div>
          <div style={{ 
            color: stats.porcentajeEstudiantes >= 0 ? '#10b981' : '#ef4444', 
            fontSize: '0.8rem', 
            fontWeight: '600' 
          }}>
            {loading ? '...' : `${stats.porcentajeEstudiantes >= 0 ? '+' : ''}${stats.porcentajeEstudiantes}% este mes`}
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
          {loading ? '...' : stats.totalEstudiantes.toLocaleString()}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Estudiantes Activos
        </div>
      </div>

      {/* Ingresos Mensuales */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} color="#fff" />
          </div>
          <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
            +15% este mes
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
          $24,580
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Ingresos Mensuales
        </div>
      </div>

      {/* Estado del Sistema */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Server size={24} color="#fff" />
          </div>
          <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
            Operativo
          </div>
        </div>
        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
          99.9%
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
          Uptime del Sistema
        </div>
      </div>
    </div>

    {/* Gráficos y Estadísticas Adicionales */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
      {/* Gráfico de Actividad */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={24} color="#fff" />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
            Actividad del Sistema
          </h3>
        </div>
        
        {/* Placeholder para gráfico */}
        <div style={{
          height: '200px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
            <TrendingUp size={48} style={{ marginBottom: '16px' }} />
            <div>Gráfico de actividad semanal</div>
          </div>
        </div>
      </div>

      {/* Estado de Servicios */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '700', marginBottom: '24px' }}>
          Estado de Servicios
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Database size={20} color="#10b981" />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>Base de Datos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Activo</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Server size={20} color="#10b981" />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>Servidor Web</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Activo</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wifi size={20} color="#10b981" />
              <span style={{ color: '#fff', fontSize: '0.9rem' }}>Conectividad</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Estable</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PanelDashboardSuperAdmin;
