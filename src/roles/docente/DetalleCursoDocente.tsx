import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, BookOpen, Calendar, 
  ChevronDown, ChevronUp, Trash2, FileText,
  CheckCircle, Clock, AlertCircle, Eye, EyeOff, RefreshCw, Edit
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
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  total_tareas: number;
  promedios_publicados: boolean;
}

interface Tarea {
  id_tarea: number;
  id_modulo?: number;
  titulo: string;
  descripcion: string;
  instrucciones?: string;
  fecha_limite: string;
  nota_maxima: number;
  nota_minima_aprobacion?: number;
  ponderacion: number;
  permite_archivo?: boolean;
  tamano_maximo_mb?: number;
  formatos_permitidos?: string;
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
  const [tareaEditar, setTareaEditar] = useState<Tarea | null>(null);
  const [showModalEntregas, setShowModalEntregas] = useState(false);
  const [showModalConfirmCerrar, setShowModalConfirmCerrar] = useState(false);
  const [showModalConfirmReabrir, setShowModalConfirmReabrir] = useState(false);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<number | null>(null);
  const [moduloParaCerrar, setModuloParaCerrar] = useState<number | null>(null);
  const [moduloParaReabrir, setModuloParaReabrir] = useState<number | null>(null);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<{ id: number; nombre: string; nota_maxima: number; ponderacion: number } | null>(null);

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
    setTareaEditar(null);
    setShowModalTarea(true);
  };

  const handleEditarTarea = (tarea: Tarea) => {
    setModuloSeleccionado(tarea.id_modulo || 0);
    setTareaEditar(tarea);
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

  const handleCerrarModulo = async (id_modulo: number) => {
    setModuloParaCerrar(id_modulo);
    setShowModalConfirmCerrar(true);
  };

  const confirmarCerrarModulo = async () => {
    if (!moduloParaCerrar) return;

    try {
      setShowModalConfirmCerrar(false);
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const response = await axios.put(`${API_BASE}/modulos/${moduloParaCerrar}/cerrar`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Módulo cerrado exitosamente');
      } else {
        toast.error(response.data.error || 'Error al cerrar el módulo');
      }
      
      fetchModulos();
      setModuloParaCerrar(null);
    } catch (error: any) {
      console.error('Error cerrando módulo:', error);
      setModuloParaCerrar(null);
      if (error.response) {
        // El servidor respondió con un código de error
        toast.error(error.response.data.error || `Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Algo pasó al configurar la solicitud
        toast.error('Error al cerrar el módulo: ' + error.message);
      }
    }
  };

  const handleReabrirModulo = async (id_modulo: number) => {
    setModuloParaReabrir(id_modulo);
    setShowModalConfirmReabrir(true);
  };

  const confirmarReabrirModulo = async () => {
    if (!moduloParaReabrir) return;

    try {
      setShowModalConfirmReabrir(false);
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        toast.error('No estás autenticado. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      const response = await axios.put(`${API_BASE}/modulos/${moduloParaReabrir}/reabrir`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Módulo reabierto exitosamente');
      } else {
        toast.error(response.data.error || 'Error al reabrir el módulo');
      }
      
      fetchModulos();
      setModuloParaReabrir(null);
    } catch (error: any) {
      console.error('Error reabriendo módulo:', error);
      setModuloParaReabrir(null);
      if (error.response) {
        // El servidor respondió con un código de error
        toast.error(error.response.data.error || `Error ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        // Algo pasó al configurar la solicitud
        toast.error('Error al reabrir el módulo: ' + error.message);
      }
    }
  };

  const handleTogglePromedios = async (id_modulo: number, publicados: boolean) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const endpoint = publicados ? 'ocultar-promedios' : 'publicar-promedios';
      
      await axios.put(`${API_BASE}/modulos/${id_modulo}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(publicados ? 'Promedios ocultados' : 'Promedios publicados');
      fetchModulos();
    } catch (error: any) {
      console.error('Error toggling promedios:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar promedios');
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
        minHeight: '25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3.125rem',
            height: '3.125rem',
            border: '0.25rem solid rgba(59, 130, 246, 0.3)',
            borderTop: '0.25rem solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.25em'
          }} />
          <p style={{ fontSize: '1.1rem', color: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)' }}>Cargando curso...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 4rem)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)',
          backdropFilter: 'blur(0.625rem)',
          borderRadius: '0.875em',
          padding: '1em',
          marginBottom: '1em',
          border: `0.0625rem solid ${theme.border}`
        }}>
          <button
            onClick={() => navigate('/panel/docente')}
            style={{
              background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
              border: `0.0625rem solid ${theme.border}`,
              borderRadius: '0.5em',
              padding: '0.5em 0.75em',
              color: theme.accent,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              marginBottom: '0.75em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)';
              e.currentTarget.style.transform = 'translateX(-0.3125em)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={20} />
            Volver a Mis Cursos
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75em' }}>
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: theme.textPrimary,
                marginBottom: '0.375em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625em'
              }}>
                <BookOpen size={18} style={{ color: theme.accent }} />
                {curso?.nombre}
              </h1>
              <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                Código: {curso?.codigo_curso} • {curso?.total_estudiantes || 0} estudiantes matriculados
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  fetchModulos();
                  toast.success('Actualizado');
                }}
                style={{
                  background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                  border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                  borderRadius: '0.5em',
                  padding: '0.5em 0.875em',
                  color: '#10b981',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)';
                }}
              >
                <RefreshCw size={16} />
                Actualizar
              </button>
              
              <button
                onClick={handleCrearModulo}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '0.5em',
                  padding: '0.5em 0.875em',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 0.1875rem 0.625rem rgba(59, 130, 246, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.0625rem)';
                  e.currentTarget.style.boxShadow = '0 0.3125rem 0.875rem rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0.1875rem 0.625rem rgba(59, 130, 246, 0.25)';
                }}
              >
                <Plus size={16} />
                Crear Módulo
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Módulos */}
        {modulos.length === 0 ? (
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(0.625rem)',
            borderRadius: '1.25em',
            padding: '3.75em 1.875em',
            textAlign: 'center',
            border: `0.0625rem solid ${theme.border}`,
            boxShadow: darkMode ? 'none' : '0 0.25rem 1.25rem rgba(0,0,0,0.08)'
          }}>
            <BookOpen size={64} style={{ color: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(59, 130, 246, 0.4)', margin: '0 auto 1.25em' }} />
            <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', marginBottom: '0.625em', fontWeight: '700' }}>
              No hay módulos creados
            </h3>
            <p style={{ color: theme.textMuted, marginBottom: '1.25em', fontSize: '1rem' }}>
              Crea tu primer módulo (parcial) para comenzar a organizar las tareas del curso
            </p>
            <button
              onClick={handleCrearModulo}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '0.75em',
                padding: '0.875em 1.75em',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 0.25rem 0.9375rem rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-0.125rem)';
                e.currentTarget.style.boxShadow = '0 0.375rem 1.25rem rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.25rem 0.9375rem rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={20} style={{ display: 'inline', marginRight: '0.5em' }} />
              Crear Primer Módulo
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
            {modulos.map((modulo) => (
              <div
                key={modulo.id_modulo}
                style={{
                  background: darkMode 
                    ? 'rgba(255,255,255,0.03)'
                    : '#ffffff',
                  borderRadius: '0.75em',
                  border: darkMode 
                    ? '0.0625rem solid rgba(255,255,255,0.08)' 
                    : '0.0625rem solid #e5e7eb',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: darkMode 
                    ? '0 0.125rem 0.5rem rgba(0,0,0,0.1)' 
                    : '0 0.0625rem 0.1875rem rgba(0,0,0,0.1)',
                  position: 'relative' as const
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 0.5rem 1.5rem rgba(0,0,0,0.2)'
                    : '0 0.25rem 0.75rem rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-0.125rem)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = darkMode
                    ? '0 0.125rem 0.5rem rgba(0,0,0,0.1)'
                    : '0 0.0625rem 0.1875rem rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Header del Módulo */}
                <div
                  style={{
                    padding: '14px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                  onClick={() => toggleModulo(modulo.id_modulo)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Contenido Principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Título */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ 
                          color: theme.textPrimary, 
                          fontSize: '1rem', 
                          fontWeight: '800', 
                          margin: 0,
                          letterSpacing: '-0.01em',
                          lineHeight: '1.3'
                        }}>
                          {modulo.nombre}
                        </h3>
                      </div>
                      {modulo.descripcion && (
                        <p style={{ 
                          color: theme.textMuted, 
                          margin: '6px 0 0 0',
                          fontSize: '0.85rem',
                          lineHeight: '1.4'
                        }}>
                          {modulo.descripcion}
                        </p>
                      )}
                      {/* Metadatos y Estado */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: theme.textMuted }}>
                          <FileText size={14} style={{ color: theme.accent, opacity: 0.7 }} />
                          <span style={{ fontWeight: '500' }}>
                            {modulo.total_tareas} {modulo.total_tareas === 1 ? 'tarea' : 'tareas'}
                          </span>
                        </div>
                        {modulo.fecha_inicio && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: theme.textMuted }}>
                            <Calendar size={14} style={{ color: theme.accent, opacity: 0.7 }} />
                            <span style={{ fontWeight: '500' }}>
                              {new Date(modulo.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        )}
                        <div style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'capitalize' as const,
                          ...getEstadoColor(modulo.estado)
                        }}>
                          {modulo.estado}
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {modulo.estado !== 'finalizado' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCrearTarea(modulo.id_modulo);
                          }}
                          style={{
                            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '600',
                            fontSize: '0.8rem'
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
                      )}

                      {/* Botón Publicar/Ocultar Promedios */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePromedios(modulo.id_modulo, modulo.promedios_publicados);
                        }}
                        style={{
                          background: modulo.promedios_publicados 
                            ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)')
                            : (darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.08)'),
                          border: modulo.promedios_publicados
                            ? `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                            : `1px solid ${darkMode ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)'}`,
                          borderRadius: '8px',
                          padding: '6px 10px',
                          color: modulo.promedios_publicados ? '#3b82f6' : '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontWeight: '600',
                          fontSize: '0.8rem'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = modulo.promedios_publicados 
                            ? 'rgba(59, 130, 246, 0.15)' 
                            : 'rgba(156, 163, 175, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = modulo.promedios_publicados
                            ? (darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)')
                            : (darkMode ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.08)');
                        }}
                        title={modulo.promedios_publicados ? 'Ocultar promedios' : 'Publicar promedios'}
                      >
                        {modulo.promedios_publicados ? <Eye size={16} /> : <EyeOff size={16} />}
                        {modulo.promedios_publicados ? 'Visible' : 'Oculto'}
                      </button>

                      {modulo.estado === 'finalizado' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReabrirModulo(modulo.id_modulo);
                          }}
                          style={{
                            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)';
                          }}
                        >
                          <FileText size={16} />
                          Reabrir
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCerrarModulo(modulo.id_modulo);
                          }}
                          style={{
                            background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                            borderRadius: '8px',
                            padding: '6px 10px',
                            color: '#f59e0b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: '600',
                            fontSize: '0.8rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)';
                          }}
                        >
                          <FileText size={16} />
                          Cerrar
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEliminarModulo(modulo.id_modulo);
                        }}
                        style={{
                          background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                          border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                          borderRadius: '8px',
                          padding: '6px',
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
                  <div style={{ padding: '12px 16px' }}>
                    {!tareasPorModulo[modulo.id_modulo] ? (
                      <div style={{ textAlign: 'center', padding: '12px', color: theme.textMuted }}>
                        Cargando tareas...
                      </div>
                    ) : tareasPorModulo[modulo.id_modulo].length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>
                        <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.3, color: theme.textMuted }} />
                        <p>No hay tareas en este módulo</p>
                        <button
                          onClick={() => handleCrearTarea(modulo.id_modulo)}
                          style={{
                            background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                            border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#10b981',
                            marginTop: '10px',
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {tareasPorModulo[modulo.id_modulo].map((tarea) => (
                          <div
                            key={tarea.id_tarea}
                            style={{
                              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.98)',
                              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                              borderRadius: '10px',
                              padding: '12px',
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
                            onClick={() => {
                              setTareaSeleccionada({
                                id: tarea.id_tarea,
                                nombre: tarea.titulo,
                                nota_maxima: tarea.nota_maxima,
                                ponderacion: tarea.ponderacion
                              });
                              setShowModalEntregas(true);
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ color: theme.textPrimary, fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px' }}>
                                  {tarea.titulo}
                                </h4>
                                {tarea.descripcion && (
                                  <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginBottom: '8px' }}>
                                    {tarea.descripcion}
                                  </p>
                                )}
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                                  <span style={{ color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={12} />
                                    Límite: {new Date(tarea.fecha_limite).toLocaleDateString()} {new Date(tarea.fecha_limite).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </span>
                                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <CheckCircle size={12} />
                                    {tarea.entregas_calificadas}/{tarea.total_entregas} calificadas
                                  </span>
                                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <AlertCircle size={12} />
                                    Nota: {tarea.nota_maxima} | Peso: {tarea.ponderacion}pts
                                  </span>
                                </div>
                              </div>
                              
                              {/* Botones de acción */}
                              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                                        nota_maxima: tarea.nota_maxima,
                                        ponderacion: tarea.ponderacion
                                      });
                                      setShowModalEntregas(true);
                                      console.log('Modal abierto:', true);
                                    }}
                                    style={{
                                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                      border: 'none',
                                      borderRadius: '8px',
                                      padding: '6px 10px',
                                      color: '#fff',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontWeight: '700',
                                      fontSize: '0.8rem',
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
                                    <FileText size={13} />
                                    Ver Entregas ({tarea.total_entregas})
                                  </button>
                                )}

                                {/* Botón Editar (icono) */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditarTarea(tarea);
                                  }}
                                  title="Editar tarea"
                                  style={{
                                    background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                                    border: `1px solid ${darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'}`,
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#f59e0b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  <Edit size={16} />
                                </button>

                                {/* Botón Eliminar (icono) */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (window.confirm(`¿Estás seguro de eliminar la tarea "${tarea.titulo}"? Esta acción no se puede deshacer.`)) {
                                      // TODO: Implementar eliminación de tarea
                                      toast.error('Funcionalidad de eliminación pendiente');
                                    }
                                  }}
                                  title="Eliminar tarea"
                                  style={{
                                    background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                                    border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                  }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
        onClose={() => {
          setShowModalTarea(false);
          setTareaEditar(null);
        }}
        onSuccess={() => {
          if (moduloSeleccionado) {
            fetchTareasModulo(moduloSeleccionado);
          }
          setTareaEditar(null);
        }}
        id_modulo={moduloSeleccionado || 0}
        tareaEditar={tareaEditar}
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
        nota_maxima={tareaSeleccionada?.nota_maxima || 10}
        ponderacion={tareaSeleccionada?.ponderacion || 1}
        darkMode={darkMode}
      />

      {/* Modal de Confirmación - Cerrar Módulo */}
      {showModalConfirmCerrar && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowModalConfirmCerrar(false)}
        >
          <div 
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '28rem',
              width: '100%',
              border: darkMode 
                ? '1px solid rgba(59, 130, 246, 0.2)' 
                : '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: darkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono de Alerta */}
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <AlertCircle size={32} style={{ color: '#fff' }} />
            </div>

            {/* Título */}
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}>
              ¿Cerrar este módulo?
            </h3>

            {/* Mensaje */}
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.95rem',
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Los estudiantes <strong style={{ color: theme.textPrimary }}>ya no podrán enviar tareas</strong> una vez que cierres este módulo. Esta acción puede revertirse más tarde.
            </p>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowModalConfirmCerrar(false)}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.15)' 
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  color: theme.textPrimary,
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarCerrarModulo}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Sí, cerrar módulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación - Reabrir Módulo */}
      {showModalConfirmReabrir && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setShowModalConfirmReabrir(false)}
        >
          <div 
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '28rem',
              width: '100%',
              border: darkMode 
                ? '1px solid rgba(59, 130, 246, 0.2)' 
                : '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: darkMode
                ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono de Check */}
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <CheckCircle size={32} style={{ color: '#fff' }} />
            </div>

            {/* Título */}
            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem',
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
              marginBottom: '0.75rem',
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}>
              ¿Reabrir este módulo?
            </h3>

            {/* Mensaje */}
            <p style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.95rem',
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Los estudiantes <strong style={{ color: theme.textPrimary }}>podrán enviar tareas nuevamente</strong> una vez que reabras este módulo.
            </p>

            {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowModalConfirmReabrir(false)}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                  border: darkMode 
                    ? '1px solid rgba(255, 255, 255, 0.15)' 
                    : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  color: theme.textPrimary,
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarReabrirModulo}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  letterSpacing: '0.01em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
              >
                Sí, reabrir módulo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export default DetalleCursoDocente;
