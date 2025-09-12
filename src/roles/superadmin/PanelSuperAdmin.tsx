import React, { useState } from 'react';
import { 
  Shield, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  CheckCircle,
  FileText,
  Settings,
  Users,
  GraduationCap,
  DollarSign,
  Server,
  Database,
  Wifi
} from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';

// Importar los nuevos componentes
import AdministradoresPanel from './AdministradoresPanel';
import LogsPanel from './LogsPanel';
import ConfiguracionPanel from './ConfiguracionPanel';

const PanelSuperAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'administradores', name: 'Administradores', icon: Users },
    { id: 'logs', name: 'Logs del Sistema', icon: FileText },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
      padding: '24px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Navegación de pestañas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 32px',
          marginBottom: '0',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '24px', right: '32px' }}>
            <LogoutButton />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Shield size={28} color="#ef4444" />
            <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
              Panel Super Administrador
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeTab === tab.id ? 
                      'linear-gradient(135deg, #ef4444, #dc2626)' : 
                      'rgba(255,255,255,0.05)',
                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: activeTab === tab.id ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  <IconComponent size={18} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la pestaña */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          minHeight: '600px'
        }}>
          {activeTab === 'administradores' && <AdministradoresPanel />}
          {activeTab === 'logs' && <LogsPanel />}
          {activeTab === 'config' && <ConfiguracionPanel />}
          {activeTab === 'dashboard' && (
            <div style={{
              padding: '32px',
              background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
              minHeight: '100vh',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {/* Header del Dashboard */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '32px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                    }}>
                      <BarChart3 size={40} color="#fff" />
                    </div>
                    <div>
                      <h1 style={{ 
                        fontSize: '2.2rem', 
                        fontWeight: '800', 
                        color: '#fff',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Dashboard Principal
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                        Resumen general del sistema y estadísticas institucionales
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: '700' }}>
                        {new Date().toLocaleDateString('es-ES', { day: '2-digit' })}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                      +12% este mes
                    </div>
                  </div>
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    1,247
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Total Usuarios
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
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                      +8% este mes
                    </div>
                  </div>
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    892
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PanelSuperAdmin;
