import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, BookOpen, DollarSign, Award, TrendingUp, 
  AlertTriangle, UserCheck, Target, PieChart, BarChart3, 
  Activity, UserPlus, Shield, Users, Clock, CheckCircle
} from 'lucide-react';

const Dashboard = () => {
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
    <div style={{ padding: '32px' }}>
      {/* Tarjetas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Total Administradores */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Total Administradores</h3>
              <p style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.totalAdministradores.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <Shield size={28} color="#ef4444" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeAdministradores >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeAdministradores >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeAdministradores >= 0 ? '+' : ''}${stats.porcentajeAdministradores}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Cursos Activos */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Cursos Activos</h3>
              <p style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.cursosActivos.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <BookOpen size={28} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeCursos >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeCursos >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeCursos >= 0 ? '+' : ''}${stats.porcentajeCursos}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Matrículas Aceptadas */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Matrículas Aceptadas</h3>
              <p style={{ color: '#22c55e', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.matriculasAceptadas.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <CheckCircle size={28} color="#22c55e" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeMatriculasAceptadas >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeMatriculasAceptadas >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeMatriculasAceptadas >= 0 ? '+' : ''}${stats.porcentajeMatriculasAceptadas}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Matrículas Pendientes */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Matrículas Pendientes</h3>
              <p style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.matriculasPendientes.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <Clock size={28} color="#f59e0b" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeMatriculasPendientes >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeMatriculasPendientes >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeMatriculasPendientes >= 0 ? '+' : ''}${stats.porcentajeMatriculasPendientes}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Total Estudiantes */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Total Estudiantes</h3>
              <p style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.totalEstudiantes.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <GraduationCap size={28} color="#3b82f6" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeEstudiantes >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeEstudiantes >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeEstudiantes >= 0 ? '+' : ''}${stats.porcentajeEstudiantes}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Total Docentes */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
          border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Total Docentes</h3>
              <p style={{ color: '#a855f7', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
                {loading ? '...' : stats.totalDocentes.toLocaleString()}
              </p>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <Users size={28} color="#a855f7" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color={stats.porcentajeDocentes >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ color: stats.porcentajeDocentes >= 0 ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: '600' }}>
              {loading ? '...' : `${stats.porcentajeDocentes >= 0 ? '+' : ''}${stats.porcentajeDocentes}%`}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Pagos Pendientes</h4>
          </div>
          <p style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>23</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>$12,450 en deuda</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <UserCheck size={20} color="#22c55e" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Profesores Activos</h4>
          </div>
          <p style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>8</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Todos asignados</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
          border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Target size={20} color="#8b5cf6" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Tasa Graduación</h4>
          </div>
          <p style={{ color: '#8b5cf6', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>87%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Último semestre</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.05))',
          border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <PieChart size={20} color="#06b6d4" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Ocupación Cursos</h4>
          </div>
          <p style={{ color: '#06b6d4', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>73%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Promedio general</p>
        </div>
      </div>

      {/* Gráfico de barras - Matrículas por mes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '32px', marginBottom: '32px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} color="#ef4444" />
          Matrículas por Mes (Últimos 6 meses)
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'end', gap: '16px', height: '200px', padding: '0 16px' }}>
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
                borderRadius: '8px 8px 4px 4px', marginBottom: '12px', display: 'flex',
                alignItems: 'start', justifyContent: 'center', paddingTop: '8px',
                color: '#fff', fontSize: '0.8rem', fontWeight: '600'
              }}>
                {item.valor}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600' }}>
                {item.mes}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '32px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color="#ef4444" />
          Actividad Reciente
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
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
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  background: `rgba(${actividad.color === '#10b981' ? '16, 185, 129' : 
                                    actividad.color === '#f59e0b' ? '245, 158, 11' :
                                    actividad.color === '#a855f7' ? '168, 85, 247' :
                                    actividad.color === '#3b82f6' ? '59, 130, 246' : '239, 68, 68'}, 0.2)`,
                  borderRadius: '10px', padding: '10px'
                }}>
                  <IconComponent size={20} color={actividad.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', margin: '0 0 4px 0' }}>
                    {actividad.texto}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>
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
