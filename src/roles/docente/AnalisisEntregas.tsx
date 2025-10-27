import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, TrendingUp, Award, Clock, FileCheck, 
  Download, BarChart3, PieChart, Target, AlertCircle, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface Entrega {
  id_entrega: number;
  id_estudiante: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  fecha_entrega: string;
  calificacion: number | null;
  comentario: string | null;
  estado: string;
}

const AnalisisEntregas: React.FC = () => {
  const { id_tarea } = useParams();
  const navigate = useNavigate();
  const [darkMode] = useState(() => {
    const saved = localStorage.getItem('docente-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [loading, setLoading] = useState(true);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [tareaInfo, setTareaInfo] = useState<any>(null);

  useEffect(() => {
    if (id_tarea) {
      fetchData();
    }
  }, [id_tarea]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      // Obtener entregas
      const responseEntregas = await axios.get(`${API_BASE}/entregas/tarea/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Obtener info de la tarea (incluye módulo y curso)
      const responseTarea = await axios.get(`${API_BASE}/tareas/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Datos de la tarea:', responseTarea.data.tarea);
      
      setEntregas(responseEntregas.data.entregas || []);
      setTareaInfo(responseTarea.data.tarea || {});
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const total = entregas.length;
    const calificadas = entregas.filter(e => e.calificacion !== null && e.calificacion !== undefined).length;
    const pendientes = total - calificadas;
    const porcentajeCompletado = total > 0 ? Math.round((calificadas / total) * 100) : 0;
    
    // Promedio de calificaciones
    const calificacionesValidas = entregas.filter(e => e.calificacion !== null && e.calificacion !== undefined);
    const promedio = calificacionesValidas.length > 0
      ? (calificacionesValidas.reduce((sum, e) => sum + (e.calificacion || 0), 0) / calificacionesValidas.length).toFixed(2)
      : '0.00';
    
    // Notas máxima y mínima
    const notaMaxima = calificacionesValidas.length > 0
      ? Math.max(...calificacionesValidas.map(e => e.calificacion || 0))
      : 0;
    const notaMinima = calificacionesValidas.length > 0
      ? Math.min(...calificacionesValidas.map(e => e.calificacion || 0))
      : 0;
    
    // Estado de entregas (basado en fecha límite)
    const fechaLimite = tareaInfo?.fecha_limite ? new Date(tareaInfo.fecha_limite) : null;
    const ahora = new Date();
    
    const entregadas = entregas.length;
    const atrasadas = fechaLimite ? entregas.filter(e => new Date(e.fecha_entrega) > fechaLimite).length : 0;
    const noEntregadas = 0; // Por ahora, solo contamos las que están en el sistema
    
    // Estado de la tarea (Activa o Cerrada)
    const estadoTarea = fechaLimite && ahora > fechaLimite ? 'Cerrada' : 'Activa';
    const colorEstado = estadoTarea === 'Activa' ? '#10b981' : '#ef4444';
    
    return {
      total,
      calificadas,
      pendientes,
      porcentajeCompletado,
      promedio,
      notaMaxima,
      notaMinima,
      entregadas,
      atrasadas,
      noEntregadas,
      estadoTarea,
      colorEstado
    };
  };

  const stats = calcularEstadisticas();

  const theme = {
    bg: darkMode ? '#0f172a' : '#f8fafc',
    cardBg: darkMode ? 'rgba(30, 41, 59, 0.95)' : '#ffffff',
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
    border: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
    accent: '#3b82f6'
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: theme.textSecondary, fontSize: '1.1rem' }}>Cargando análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${darkMode ? '#0f172a' : '#f8fafc'} 0%, ${darkMode ? '#1e293b' : '#e2e8f0'} 100%)`,
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
          : '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: theme.accent,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
          }}
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BarChart3 size={40} style={{ color: theme.accent }} />
            <div>
              <h1 style={{ 
                color: theme.textPrimary, 
                fontSize: '2rem', 
                fontWeight: '800', 
                margin: '0 0 0.5rem 0' 
              }}>
                Análisis Completo de Entregas
              </h1>
              <p style={{ color: theme.textSecondary, fontSize: '1.1rem', margin: 0 }}>
                {tareaInfo?.titulo || 'Cargando...'}
              </p>
            </div>
          </div>

          {/* Botón Exportar a Excel */}
          <button
            onClick={() => {
              // Crear datos para Excel
              const excelData = entregas.map(e => ({
                'Apellido': e.estudiante_apellido,
                'Nombre': e.estudiante_nombre,
                'Fecha Entrega': new Date(e.fecha_entrega).toLocaleString('es-EC'),
                'Calificación': e.calificacion !== null ? e.calificacion : 'Sin calificar',
                'Estado': e.calificacion !== null ? 'Calificada' : 'Pendiente',
                'Comentario': e.comentario || 'Sin comentario'
              }));

              // Convertir a CSV
              const headers = Object.keys(excelData[0] || {});
              const csvContent = [
                headers.join(','),
                ...excelData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
              ].join('\n');

              // Limpiar nombres para el archivo
              const limpiarNombre = (texto: string) => {
                return texto
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-zA-Z0-9]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_|_$/g, '');
              };

              const cursoNombre = limpiarNombre(tareaInfo?.curso_nombre || 'Curso');
              const moduloNombre = limpiarNombre(tareaInfo?.modulo_nombre || 'Modulo');
              const tareaNombre = limpiarNombre(tareaInfo?.titulo || 'Tarea');
              const fecha = new Date().toLocaleDateString('es-EC').replace(/\//g, '_');

              // Descargar
              const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `Entregas_${cursoNombre}_${moduloNombre}_${tareaNombre}_${fecha}.csv`;
              link.click();
              toast.success('Archivo Excel descargado');
            }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Download size={18} />
            Exportar a Excel
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Total Estudiantes */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
          borderRadius: '12px',
          padding: '1rem',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', margin: '0 0 0.3rem 0' }}>
                Total Estudiantes
              </p>
              <h2 style={{ color: theme.textPrimary, fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.total}
              </h2>
            </div>
            <Users size={24} style={{ color: theme.accent, opacity: 0.7 }} />
          </div>
        </div>

        {/* Calificadas */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
          borderRadius: '12px',
          padding: '1rem',
          border: `1px solid rgba(6, 182, 212, 0.2)`,
          boxShadow: '0 2px 8px rgba(6, 182, 212, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', margin: '0 0 0.3rem 0' }}>
                Calificadas
              </p>
              <h2 style={{ color: '#06b6d4', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.calificadas}
              </h2>
            </div>
            <FileCheck size={24} style={{ color: '#06b6d4', opacity: 0.7 }} />
          </div>
        </div>

        {/* Pendientes */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
          borderRadius: '12px',
          padding: '1rem',
          border: `1px solid rgba(96, 165, 250, 0.2)`,
          boxShadow: '0 2px 8px rgba(96, 165, 250, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', margin: '0 0 0.3rem 0' }}>
                Pendientes
              </p>
              <h2 style={{ color: '#60a5fa', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.pendientes}
              </h2>
            </div>
            <Clock size={24} style={{ color: '#60a5fa', opacity: 0.7 }} />
          </div>
        </div>

        {/* Promedio */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 100%)',
          borderRadius: '12px',
          padding: '1rem',
          border: `1px solid rgba(99, 102, 241, 0.2)`,
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: theme.textSecondary, fontSize: '0.8rem', margin: '0 0 0.3rem 0' }}>
                Promedio General
              </p>
              <h2 style={{ color: '#6366f1', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.promedio}
              </h2>
            </div>
            <TrendingUp size={24} style={{ color: '#6366f1', opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* Gráficos y Detalles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Progreso de Calificación */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '16px',
          padding: '1.5rem',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Target size={24} style={{ color: theme.accent }} />
            <h3 style={{ color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
              Progreso de Calificación
            </h3>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Completado</span>
              <span style={{ color: theme.accent, fontSize: '1.1rem', fontWeight: '700' }}>
                {stats.porcentajeCompletado}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.porcentajeCompletado}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '6px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{
              background: darkMode ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(6, 182, 212, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: '#06b6d4' }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>Nota Máxima</span>
              </div>
              <p style={{ color: '#06b6d4', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.notaMaxima.toFixed(2)}
              </p>
            </div>

            <div style={{
              background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(96, 165, 250, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award size={18} style={{ color: '#60a5fa' }} />
                <span style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>Nota Mínima</span>
              </div>
              <p style={{ color: '#60a5fa', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
                {stats.notaMinima.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Entregas */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '16px',
          padding: '1.5rem',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <PieChart size={24} style={{ color: theme.accent }} />
            <h3 style={{ color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
              Estado de Entregas
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Entregadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Tareas Entregadas</span>
                <span style={{ color: '#06b6d4', fontSize: '1rem', fontWeight: '700' }}>
                  {stats.entregadas} ({stats.total > 0 ? Math.round((stats.entregadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.entregadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '5px'
                }} />
              </div>
            </div>

            {/* Atrasadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Tareas Atrasadas</span>
                <span style={{ color: '#60a5fa', fontSize: '1rem', fontWeight: '700' }}>
                  {stats.atrasadas} ({stats.total > 0 ? Math.round((stats.atrasadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.atrasadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
                  borderRadius: '5px'
                }} />
              </div>
            </div>

            {/* No Entregadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>Tareas No Entregadas</span>
                <span style={{ color: '#6366f1', fontSize: '1rem', fontWeight: '700' }}>
                  {stats.noEntregadas} ({stats.total > 0 ? Math.round((stats.noEntregadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '10px',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.noEntregadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '5px'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Tarea */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        border: `1px solid ${theme.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Award size={24} style={{ color: theme.accent }} />
          <h3 style={{ color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
            Información de la Tarea
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              Nota Máxima
            </p>
            <p style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              {tareaInfo?.nota_maxima || 10} pts
            </p>
          </div>

          <div>
            <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              Ponderación
            </p>
            <p style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              {tareaInfo?.ponderacion || 1} pts
            </p>
          </div>

          <div>
            <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              Nota Mínima Aprobación
            </p>
            <p style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
              {tareaInfo?.nota_minima_aprobacion || 7} pts
            </p>
          </div>

          <div>
            <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
              Estado
            </p>
            <p style={{ 
              color: stats.colorEstado, 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              margin: 0
            }}>
              {stats.estadoTarea}
            </p>
          </div>
        </div>
      </div>

      {/* Animación de spin */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AnalisisEntregas;
