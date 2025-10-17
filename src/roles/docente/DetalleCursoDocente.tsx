import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, BookOpen, Calendar, 
  ChevronDown, ChevronUp, Trash2, FileText,
  CheckCircle, Clock, AlertCircle, Hash
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ModalModulo from './ModalModulo';
import ModalTarea from './ModalTarea';
import ModalEntregas from './ModalEntregas';

const API_BASE = 'http://localhost:3000/api';

interface Modulo {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  numero_orden: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  total_tareas: number;
}

interface Tarea {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  nota_maxima: number;
  estado: string;
  total_entregas: number;
  entregas_calificadas: number;
}

interface Curso {
  id_curso: number;
  nombre: string;
  codigo_curso: string;
  total_estudiantes: number;
}

interface DetalleCursoDocenteProps {
  darkMode?: boolean;
}

const DetalleCursoDocente: React.FC<DetalleCursoDocenteProps> = ({ darkMode = true }) => {
  const { id } = useParams<{ id: string }>();
  const id_curso = id;
  const navigate = useNavigate();

  // Tema adaptativo
  const theme = {
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
    cardBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    accent: '#3b82f6'
  };
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [tareasPorModulo, setTareasPorModulo] = useState<{ [key: number]: Tarea[] }>({});
  const [modulosExpandidos, setModulosExpandidos] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showModalModulo, setShowModalModulo] = useState(false);
  const [showModalTarea, setShowModalTarea] = useState(false);
  const [showModalEntregas, setShowModalEntregas] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<number | null>(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<{ id: number; nombre: string; nota_maxima: number } | null>(null);

  useEffect(() => {
    console.log('Estado showModalEntregas cambió a:', showModalEntregas);
  }, [showModalEntregas]);

  useEffect(() => {
    fetchCursoData();
    fetchModulos();
  }, [id_curso]);

  const fetchCursoData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/cursos/${id_curso}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurso(response.data);
    } catch (error) {
      console.error('Error fetching curso:', error);
      toast.error('Error cargando información del curso');
    }
  };

  const fetchModulos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/modulos/curso/${id_curso}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModulos(response.data.modulos || []);
    } catch (error) {
      console.error('Error fetching modulos:', error);
      toast.error('Error cargando módulos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTareasModulo = async (id_modulo: number) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/tareas/modulo/${id_modulo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTareasPorModulo(prev => ({
        ...prev,
        [id_modulo]: response.data.tareas || []
      }));
    } catch (error) {
      console.error('Error fetching tareas:', error);
      toast.error('Error cargando tareas');
    }
  };

  const toggleModulo = (id_modulo: number) => {
    const isExpanded = modulosExpandidos[id_modulo];
    setModulosExpandidos(prev => ({
      ...prev,
      [id_modulo]: !isExpanded
    }));

    // Si se está expandiendo y no tiene tareas cargadas, cargarlas
    if (!isExpanded && !tareasPorModulo[id_modulo]) {
      fetchTareasModulo(id_modulo);
    }
  };

  const handleCrearModulo = () => {
    setShowModalModulo(true);
  };

  const handleCrearTarea = (id_modulo: number) => {
    setModuloSeleccionado(id_modulo);
    setShowModalTarea(true);
  };

  const handleEliminarModulo = async (id_modulo: number) => {
    if (!confirm('¿Estás seguro de eliminar este módulo? Se eliminarán todas las tareas asociadas.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      await axios.delete(`${API_BASE}/modulos/${id_modulo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Módulo eliminado exitosamente');
      fetchModulos();
    } catch (error: any) {
      console.error('Error eliminando módulo:', error);
      toast.error(error.response?.data?.error || 'Error eliminando módulo');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': 
        return {
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          borderColor: 'rgba(16, 185, 129, 0.3)'
        };
      case 'inactivo': 
        return {
          background: 'rgba(156, 163, 175, 0.1)',
          color: '#9ca3af',
          borderColor: 'rgba(156, 163, 175, 0.3)'
        };
      case 'finalizado': 
        return {
          background: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          borderColor: 'rgba(59, 130, 246, 0.3)'
        };
      default: 
        return {
          background: 'rgba(156, 163, 175, 0.1)',
          color: '#9ca3af',
          borderColor: 'rgba(156, 163, 175, 0.3)'
        };
    }
  };

  if (loading) {
    return (
      <div style={{
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '1.1rem', color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }}>Cargando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%'
    }}>
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: `1px solid ${theme.border}`
        }}>
          <button
            onClick={() => navigate('/panel/docente')}
            style={{
              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '10px 20px',
              color: theme.accent,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={20} />
            Volver a Mis Cursos
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: theme.textPrimary,
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <BookOpen size={32} style={{ color: theme.accent }} />
                {curso?.nombre}
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '1rem' }}>
                Código: {curso?.codigo_curso} • {curso?.total_estudiantes || 0} estudiantes matriculados
              </p>
            </div>

            <button
              onClick={handleCrearModulo}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#fff',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
              }}
            >
              <Plus size={20} />
              Crear Módulo
            </button>
          </div>
        </div>

        {/* Lista de Módulos */}
        {modulos.length === 0 ? (
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '60px 30px',
            textAlign: 'center',
            border: `1px solid ${theme.border}`,
            boxShadow: darkMode ? 'none' : '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <BookOpen size={64} style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(59, 130, 246, 0.4)', margin: '0 auto 20px' }} />
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '10px', fontWeight: '700' }}>
              No hay módulos creados
            </h3>
            <p style={{ color: theme.textMuted, marginBottom: '20px', fontSize: '1rem' }}>
              Crea tu primer módulo (parcial) para comenzar a organizar las tareas del curso
            </p>
            <button
              onClick={handleCrearModulo}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Crear Primer Módulo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {modulos.map((modulo) => (
              <div
                key={modulo.id_modulo}
                style={{
                  background: darkMode 
                    ? 'rgba(255,255,255,0.03)'
                    : '#ffffff',
                  borderRadius: '16px',
                  border: darkMode 
                    ? '1px solid rgba(255,255,255,0.08)' 
                    : '1px solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: darkMode 
                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  position: 'relative' as const
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 8px 24px rgba(0,0,0,0.2)'
                    : '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 2px 8px rgba(0,0,0,0.1)'
                    : '0 1px 3px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header del Módulo */}
                <div
                  style={{
                    padding: '24px 28px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => toggleModulo(modulo.id_modulo)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                    {/* Contenido Principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Título y Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
                        }}>
                          <Hash size={14} />
                          {modulo.numero_orden}
                        </div>
                        <h3 style={{ 
                          color: theme.textPrimary, 
                          fontSize: '1.25rem', 
                          fontWeight: '600', 
                          margin: 0,
                          letterSpacing: '-0.01em',
                          lineHeight: '1.4'
                        }}>
                          {modulo.nombre}
                        </h3>
                      </div>
                      {modulo.descripcion && (
                        <p style={{ 
                          color: theme.textMuted, 
                          margin: '8px 0 0 0',
                          fontSize: '0.95rem',
                          lineHeight: '1.5'
                        }}>
                          {modulo.descripcion}
                        </p>
                      )}
                      {/* Metadatos y Estado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: theme.textMuted }}>
                          <FileText size={16} style={{ color: theme.accent, opacity: 0.7 }} />
                          <span style={{ fontWeight: '500' }}>
                            {modulo.total_tareas} {modulo.total_tareas === 1 ? 'tarea' : 'tareas'}
                          </span>
                        </div>
                        {modulo.fecha_inicio && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: theme.textMuted }}>
                            <Calendar size={16} style={{ color: theme.accent, opacity: 0.7 }} />
                            <span style={{ fontWeight: '500' }}>
                              {new Date(modulo.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        )}
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize' as const,
                          ...getEstadoColor(modulo.estado)
                        }}>
                          {modulo.estado}
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCrearTarea(modulo.id_modulo);
                        }}
                        style={{
                          background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                          border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                          borderRadius: '8px',
                          padding: '8px 14px',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)';
                        }}
                      >
                        <Plus size={16} />
                        Tarea
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarModulo(modulo.id_modulo);
                        }}
                        style={{
                          background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                          borderRadius: '8px',
                          padding: '8px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)';
                        }}
                      >
                        <Trash2 size={16} />
                      </button>

                      <div style={{ 
                        color: theme.textMuted, 
                        display: 'flex', 
                        alignItems: 'center',
                        marginLeft: '4px'
                      }}>
                        {modulosExpandidos[modulo.id_modulo] ? (
                          <ChevronUp size={20} style={{ transition: 'transform 0.2s ease' }} />
                        ) : (
                          <ChevronDown size={20} style={{ transition: 'transform 0.2s ease' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Tareas (expandible) */}
                {modulosExpandidos[modulo.id_modulo] && (
                  <div style={{ padding: '20px 30px' }}>
                    {!tareasPorModulo[modulo.id_modulo] ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>
                        Cargando tareas...
                      </div>
                    ) : tareasPorModulo[modulo.id_modulo].length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
                        <FileText size={48} style={{ margin: '0 auto 15px', opacity: 0.3, color: theme.textMuted }} />
                        <p>No hay tareas en este módulo</p>
                        <button
                          onClick={() => handleCrearTarea(modulo.id_modulo)}
                          style={{
                            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                            borderRadius: '10px',
                            padding: '10px 20px',
                            color: '#10b981',
                            marginTop: '15px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)';
                          }}
                        >
                          <Plus size={18} style={{ display: 'inline', marginRight: '8px' }} />
                          Crear Primera Tarea
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {tareasPorModulo[modulo.id_modulo].map((tarea) => (
                          <div
                            key={tarea.id_tarea}
                            style={{
                              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                              borderRadius: '12px',
                              padding: '20px',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              boxShadow: darkMode ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.05)';
                              e.currentTarget.style.borderColor = darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
                              if (!darkMode) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)';
                              e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                              if (!darkMode) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                            }}
                            onClick={() => navigate(`/panel/docente/tarea/${tarea.id_tarea}`)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>
                                  {tarea.titulo}
                                </h4>
                                {tarea.descripcion && (
                                  <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '12px' }}>
                                    {tarea.descripcion}
                                  </p>
                                )}
                                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                  <span style={{ color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={14} />
                                    Límite: {new Date(tarea.fecha_limite).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={14} />
                                    {tarea.entregas_calificadas}/{tarea.total_entregas} calificadas
                                  </span>
                                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <AlertCircle size={14} />
                                    Nota máx: {tarea.nota_maxima}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Botón Ver Entregas */}
                              {tarea.total_entregas > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Abriendo modal de entregas para tarea:', tarea.id_tarea);
                                    setTareaSeleccionada({
                                      id: tarea.id_tarea,
                                      nombre: tarea.titulo,
                                      nota_maxima: tarea.nota_maxima
                                    });
                                    setShowModalEntregas(true);
                                    console.log('Modal abierto:', true);
                                  }}
                                  style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 14px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.8125rem',
                                    marginTop: '12px',
                                    boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(59, 130, 246, 0.3)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.25)';
                                  }}
                                >
                                  <FileText size={15} />
                                  Ver Entregas ({tarea.total_entregas})
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalModulo
        isOpen={showModalModulo}
        onClose={() => setShowModalModulo(false)}
        onSuccess={fetchModulos}
        id_curso={id_curso || ''}
        darkMode={darkMode}
      />

      <ModalTarea
        isOpen={showModalTarea}
        onClose={() => setShowModalTarea(false)}
        onSuccess={() => {
          if (moduloSeleccionado) {
            fetchTareasModulo(moduloSeleccionado);
          }
        }}
        id_modulo={moduloSeleccionado || 0}
        darkMode={darkMode}
      />

      <ModalEntregas
        isOpen={showModalEntregas}
        onClose={() => setShowModalEntregas(false)}
        onSuccess={() => {
          if (moduloSeleccionado) {
            fetchTareasModulo(moduloSeleccionado);
          }
        }}
        id_tarea={tareaSeleccionada?.id || 0}
        nombre_tarea={tareaSeleccionada?.nombre || ''}
        nota_maxima={tareaSeleccionada?.nota_maxima || 20}
        darkMode={darkMode}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DetalleCursoDocente;
