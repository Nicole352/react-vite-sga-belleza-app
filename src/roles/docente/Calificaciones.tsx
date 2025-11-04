import React, { useState, useEffect } from 'react';
import { BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  total_estudiantes: number;
  estado?: 'activo' | 'finalizado' | 'planificado' | 'cancelado';
}

const Calificaciones: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'activos' | 'finalizados'>('activos');

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE}/api/docentes/mis-cursos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      } else {
        setError('Error al cargar los cursos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    cardBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    accent: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  // Filter courses based on active tab
  const filteredCursos = cursos.filter(curso => {
    // When estado is not available, we assume it's active
    const cursoEstado = curso.estado || 'activo';
    
    if (activeTab === 'activos') {
      return cursoEstado === 'activo';
    } else {
      return cursoEstado === 'finalizado';
    }
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            background: `linear-gradient(135deg, ${theme.accent}, #2563eb)`,
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{
              color: theme.textPrimary,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0
            }}>
              Calificaciones
            </h1>
            <p style={{ color: theme.textMuted, margin: '0.25rem 0 0 0' }}>
              Selecciona un curso para ver las calificaciones de los estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Tabs for filtering courses */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('activos')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'activos' 
              ? `linear-gradient(135deg, ${theme.accent}, #2563eb)` 
              : darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            borderRadius: '0.5rem',
            color: activeTab === 'activos' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'activos') {
              e.currentTarget.style.background = darkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'activos') {
              e.currentTarget.style.background = darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          Cursos Activos
        </button>
        
        <button
          onClick={() => setActiveTab('finalizados')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'finalizados' 
              ? `linear-gradient(135deg, ${theme.accent}, #2563eb)` 
              : darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)',
            border: 'none',
            borderRadius: '0.5rem',
            color: activeTab === 'finalizados' ? '#fff' : theme.textSecondary,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'finalizados') {
              e.currentTarget.style.background = darkMode 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'finalizados') {
              e.currentTarget.style.background = darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.05)';
            }
          }}
        >
          Cursos Finalizados
        </button>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
          color: theme.textPrimary
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: `4px solid ${theme.textMuted}`,
              borderTop: `4px solid ${theme.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p>Cargando cursos...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{
          background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
          border: `1px solid ${theme.danger}50`,
          borderRadius: '0.75rem',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <BookOpen size={48} color={theme.danger} style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: theme.danger, margin: '0 0 0.5rem 0' }}>
            Error al cargar
          </h3>
          <p style={{ color: theme.textMuted, margin: 0 }}>{error}</p>
          <button
            onClick={fetchCursos}
            style={{
              marginTop: '1rem',
              background: theme.danger,
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      ) : filteredCursos.length === 0 ? (
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '1rem',
          padding: '3rem',
          textAlign: 'center'
        }}>
          <BookOpen size={48} style={{ color: theme.textMuted, margin: '0 auto 1rem' }} />
          <h3 style={{ color: theme.textPrimary, margin: '0 0 0.5rem 0' }}>
            {activeTab === 'activos' ? 'No tienes cursos activos' : 'No tienes cursos finalizados'}
          </h3>
          <p style={{ color: theme.textMuted, margin: 0 }}>
            {activeTab === 'activos' 
              ? 'Los cursos activos aparecerán aquí cuando se asignen' 
              : 'Los cursos finalizados aparecerán aquí cuando se completen'}
          </p>
        </div>
      ) : (
        <div>
          <div className="responsive-grid-auto" style={{
            gap: '1rem'
          }}>
            {filteredCursos.map((curso) => (
              <div
                key={curso.id_curso}
                onClick={() => navigate(`/panel/docente/calificaciones/${curso.id_curso}`)}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = darkMode 
                    ? '0 10px 25px rgba(0,0,0,0.3)' 
                    : '0 10px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{
                      display: 'inline-block',
                      background: `${theme.accent}20`,
                      color: theme.accent,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem'
                    }}>
                      {curso.codigo_curso}
                    </div>
                    <h3 style={{
                      color: theme.textPrimary,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {curso.nombre}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color={theme.textMuted} />
                      <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                        {curso.total_estudiantes} estudiantes
                      </span>
                    </div>
                  </div>
                  <BookOpen size={20} color={theme.accent} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calificaciones;