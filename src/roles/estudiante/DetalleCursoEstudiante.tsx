import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Calendar, FileText, Upload,
  CheckCircle, ChevronDown, ChevronUp, Edit, Trash2, AlertTriangle, X, FileType
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = 'http://localhost:3000/api';

interface Modulo {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  estado: string;
  total_tareas: number;
}

interface Tarea {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  nota_maxima: number;
  permite_archivo: boolean;
  formatos_permitidos: string;
  tamano_maximo_mb: number;
  estado: string;
  entrega?: {
    id_entrega: number;
    archivo_nombre: string;
    calificacion?: number;
    comentarios?: string;
    fecha_calificacion?: string;
    calificador_nombres?: string;
    calificador_apellidos?: string;
    estado: string;
    fecha_entrega: string;
  };
}

interface DetalleCursoEstudianteProps {
  darkMode: boolean;
}

const DetalleCursoEstudiante: React.FC<DetalleCursoEstudianteProps> = ({ darkMode: darkModeProp }) => {
  const { id } = useParams<{ id: string }>();
  const { isMobile, isSmallScreen } = useBreakpoints();
  const navigate = useNavigate();
  
  // Obtener darkMode del localStorage o usar el prop (igual que docente)
  const [darkMode, setDarkMode] = useState(() => {
    if (darkModeProp !== undefined) return darkModeProp;
    const saved = localStorage.getItem('estudiante-dark-mode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [curso, setCurso] = useState<any>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [tareasPorModulo, setTareasPorModulo] = useState<{ [key: number]: Tarea[] }>({});
  const [modulosExpandidos, setModulosExpandidos] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [uploadingTarea, setUploadingTarea] = useState<number | null>(null);
  const [archivoPreview, setArchivoPreview] = useState<{
    file: File;
    id_tarea: number;
    preview?: string;
    tipo: 'entregar' | 'editar';
    id_entrega?: number;
    id_modulo?: number;
  } | null>(null);

  // Escuchar cambios en el tema (igual que docente)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('estudiante-dark-mode');
      setDarkMode(saved !== null ? JSON.parse(saved) : false);
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // También escuchar cambios directos en el mismo tab
    const interval = setInterval(() => {
      const saved = localStorage.getItem('estudiante-dark-mode');
      const currentMode = saved !== null ? JSON.parse(saved) : false;
      setDarkMode(currentMode);
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const theme = {
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.3)',
    cardBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    accent: '#fbbf24'
  };

  // Función para refrescar todos los datos
  const refreshAllData = async () => {
    if (id) {
      await fetchCursoData();
      await fetchModulos();
    }
  };

  useSocket({
    'modulo_creado': (data: any) => {
      console.log('📚 Nuevo módulo disponible:', data);
      
      // Solo mostrar notificación si es del curso actual
      if (data.id_curso === parseInt(id || '0')) {
        toast.success(`📚 Nuevo módulo disponible: ${data.nombre}`, {
          duration: 5000,
        });
        fetchModulos();
      }
    },
    'tarea_creada': (data: any) => {
      console.log('📝 Nueva tarea asignada:', data);
      
      // Mostrar notificación
      toast.success(`📝 Nueva tarea: ${data.titulo}`, {
        duration: 5000,
      });
      
      // Recargar módulos para actualizar contador
      fetchModulos();
      
      // Si el módulo está expandido, recargar tareas
      if (modulosExpandidos[data.id_modulo]) {
        fetchTareasModulo(data.id_modulo);
      }
    },
    'tarea_calificada': (data: any) => {
      console.log('✅ Tarea calificada:', data);
      
      // Obtener el ID del usuario actual desde sessionStorage
      const authData = sessionStorage.getItem('auth_data');
      if (authData) {
        try {
          const userData = JSON.parse(authData);
          const currentUserId = userData.id_usuario;
          
          // Solo mostrar notificación si es para este estudiante
          if (data.id_estudiante === currentUserId) {
            toast.success(`🎓 Tu tarea ha sido calificada: ${data.nota} puntos`, {
              duration: 6000,
            });
          }
        } catch (error) {
          console.error('Error al parsear auth_data:', error);
        }
      }
      
      // Recargar módulos y tareas expandidas
      fetchModulos();
      Object.keys(modulosExpandidos).forEach(id_modulo => {
        if (modulosExpandidos[parseInt(id_modulo)]) {
          fetchTareasModulo(parseInt(id_modulo));
        }
      });
    }
  });

  useEffect(() => {
    if (id) {
      fetchCursoData();
      fetchModulos();
    }
  }, [id]);

  const fetchCursoData = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/cursos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurso(response.data);
    } catch (error) {
      console.error('Error fetching curso:', error);
      toast.error('Error al cargar el curso');
    }
  };

  const fetchModulos = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/modulos/curso/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // El backend retorna { success: true, modulos: [...] }
      const modulosData = Array.isArray(response.data.modulos) ? response.data.modulos :
        Array.isArray(response.data) ? response.data : [];
      setModulos(modulosData);

      // Cargar tareas de cada módulo
      modulosData.forEach((modulo: Modulo) => {
        fetchTareasModulo(modulo.id_modulo);
      });
    } catch (error) {
      console.error('Error fetching modulos:', error);
      setModulos([]); // Establecer array vacío en caso de error
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

      // El backend retorna { success: true, tareas: [...] }
      const tareasData = Array.isArray(response.data.tareas) ? response.data.tareas :
        Array.isArray(response.data) ? response.data : [];
      setTareasPorModulo(prev => ({
        ...prev,
        [id_modulo]: tareasData
      }));
    } catch (error) {
      console.error('Error fetching tareas:', error);
      setTareasPorModulo(prev => ({
        ...prev,
        [id_modulo]: []
      }));
    }
  };

  const toggleModulo = (id_modulo: number) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [id_modulo]: !prev[id_modulo]
    }));
  };

  const handleFileUpload = async (id_tarea: number, file: File) => {
    try {
      setUploadingTarea(id_tarea);
      const token = sessionStorage.getItem('auth_token');

      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('id_tarea', id_tarea.toString());

      await axios.post(`${API_BASE}/entregas`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('¡Archivo entregado exitosamente!');

      // Recargar todas las tareas para actualizar el estado
      await Promise.all(modulos.map(modulo => fetchTareasModulo(modulo.id_modulo)));
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.error || 'Error al subir el archivo');
    } finally {
      setUploadingTarea(null);
    }
  };

  const handleDeleteEntrega = async (id_entrega: number, id_modulo: number) => {
    if (!confirm('¿Estás seguro de eliminar esta entrega? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      await axios.delete(`${API_BASE}/entregas/${id_entrega}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Entrega eliminada exitosamente');
      await fetchTareasModulo(id_modulo);
    } catch (error: any) {
      console.error('Error deleting entrega:', error);
      toast.error(error.response?.data?.error || 'Error al eliminar la entrega');
    }
  };

  const handleEditEntrega = async (id_entrega: number, id_modulo: number, file: File) => {
    try {
      setUploadingTarea(id_entrega);
      const token = sessionStorage.getItem('auth_token');

      const formData = new FormData();
      formData.append('archivo', file);

      await axios.put(`${API_BASE}/entregas/${id_entrega}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Entrega actualizada exitosamente');
      await fetchTareasModulo(id_modulo);
    } catch (error: any) {
      console.error('Error updating entrega:', error);
      toast.error(error.response?.data?.error || 'Error al actualizar la entrega');
    } finally {
      setUploadingTarea(null);
    }
  };

  // Función para manejar la previsualización del archivo
  const handleFileSelect = (file: File, id_tarea: number, tipo: 'entregar' | 'editar', id_entrega?: number, id_modulo?: number) => {
    // Crear preview para imágenes y PDFs
    const reader = new FileReader();
    reader.onloadend = () => {
      setArchivoPreview({
        file,
        id_tarea,
        preview: reader.result as string,
        tipo,
        id_entrega,
        id_modulo
      });
    };
    reader.readAsDataURL(file);
  };

  // Función para confirmar la subida después de la previsualización
  const confirmarSubida = async () => {
    if (!archivoPreview) return;

    if (archivoPreview.tipo === 'entregar') {
      await handleFileUpload(archivoPreview.id_tarea, archivoPreview.file);
    } else if (archivoPreview.tipo === 'editar' && archivoPreview.id_entrega && archivoPreview.id_modulo) {
      await handleEditEntrega(archivoPreview.id_entrega, archivoPreview.id_modulo, archivoPreview.file);
    }

    setArchivoPreview(null);
  };

  // Función para verificar si una entrega es atrasada
  const esEntregaAtrasada = (fecha_entrega: string, fecha_limite: string) => {
    return new Date(fecha_entrega) > new Date(fecha_limite);
  };

  // Función para verificar si aún se puede entregar
  const puedeEntregar = (fecha_limite: string) => {
    return new Date() <= new Date(fecha_limite);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '25em',
        color: theme.textPrimary
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        background: darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff',
        border: darkMode ? '0.0625rem solid rgba(255,255,255,0.08)' : '0.0625rem solid #e5e7eb',
        borderRadius: '1em',
        padding: '1.5em 1.75em',
        marginBottom: '1.25em',
        boxShadow: darkMode ? '0 0.125rem 0.5rem rgba(0,0,0,0.1)' : '0 0.0625rem 0.1875rem rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => navigate('/panel/estudiante')}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.accent,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375em',
            marginBottom: '1em',
            fontWeight: '600',
            fontSize: '0.875rem',
            padding: '0.25em 0',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <ArrowLeft size={18} />
          Volver a Mis Cursos
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
          <BookOpen size={28} color={theme.accent} />
          <div>
            <h1 style={{
              color: theme.textPrimary,
              fontSize: isMobile ? '1.25rem' : '1.5rem',
              fontWeight: '700',
              margin: '0 0 0.25em 0',
              letterSpacing: '-0.01em'
            }}>
              {curso?.nombre}
            </h1>
            <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.875rem' }}>
              Código: {curso?.codigo_curso}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Módulos */}
      {modulos.length === 0 ? (
        <div style={{
          background: theme.cardBg,
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '1em',
          padding: '3em',
          textAlign: 'center'
        }}>
          <BookOpen size={48} style={{ color: theme.textMuted, margin: '0 auto 1em' }} />
          <p style={{ color: theme.textMuted }}>
            No hay módulos disponibles en este curso
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75em' }}>
          {modulos.map((modulo) => (
            <div
              key={modulo.id_modulo}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.02)' : '#ffffff',
                border: darkMode ? '0.0625rem solid rgba(255,255,255,0.06)' : '0.0625rem solid #e5e7eb',
                borderRadius: '0.75em',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Header del Módulo */}
              <div
                style={{
                  padding: '1em 1.25em',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s ease'
                }}
                onClick={() => toggleModulo(modulo.id_modulo)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontWeight: '600',
                    margin: '0 0 0.25em 0',
                    letterSpacing: '-0.01em'
                  }}>
                    {modulo.nombre}
                  </h3>
                  <p style={{ color: theme.textMuted, fontSize: '0.8125rem', margin: 0 }}>
                    {modulo.total_tareas} {modulo.total_tareas === 1 ? 'tarea' : 'tareas'}
                  </p>
                </div>
                {modulosExpandidos[modulo.id_modulo] ? (
                  <ChevronUp size={18} style={{ color: theme.textMuted }} />
                ) : (
                  <ChevronDown size={18} style={{ color: theme.textMuted }} />
                )}
              </div>

              {/* Lista de Tareas */}
              {modulosExpandidos[modulo.id_modulo] && (
                <div style={{ padding: '0 1.5em 1.25em' }}>
                  {!tareasPorModulo[modulo.id_modulo] || tareasPorModulo[modulo.id_modulo].length === 0 ? (
                    <p style={{ color: theme.textMuted, textAlign: 'center', padding: '1.25em' }}>
                      No hay tareas en este módulo
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625em' }}>
                      {tareasPorModulo[modulo.id_modulo].map((tarea) => (
                        <div
                          key={tarea.id_tarea}
                          style={{
                            background: darkMode ? 'rgba(255,255,255,0.015)' : '#f9fafb',
                            border: `0.0625rem solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'}`,
                            borderRadius: '0.625em',
                            padding: '1em 1.125em'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625em' }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                color: theme.textPrimary,
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                margin: '0 0 0.375em 0',
                                letterSpacing: '-0.01em'
                              }}>
                                {tarea.titulo}
                              </h4>
                              {tarea.descripcion && (
                                <p style={{ color: theme.textMuted, fontSize: '0.8125rem', margin: '0 0 0.5em 0', lineHeight: '1.4' }}>
                                  {tarea.descripcion}
                                </p>
                              )}
                              <div style={{ display: 'flex', gap: '0.75em', fontSize: '0.8125rem', color: theme.textMuted, flexWrap: 'wrap' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                                  <Calendar size={13} />
                                  Límite: {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} {new Date(tarea.fecha_limite).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                                  <FileText size={13} />
                                  Nota máx: {tarea.nota_maxima}
                                </span>
                              </div>
                            </div>

                            {/* Estado de la entrega */}
                            {tarea.entrega ? (
                              <div style={{
                                background: tarea.entrega.calificacion ? 'rgba(217, 119, 6, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                border: `0.0625rem solid ${tarea.entrega.calificacion ? 'rgba(217, 119, 6, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                                borderRadius: '0.375em',
                                padding: '0.25em 0.625em',
                                fontSize: '0.6875rem',
                                fontWeight: '600',
                                color: tarea.entrega.calificacion ? '#d97706' : '#f59e0b',
                                whiteSpace: 'nowrap' as const
                              }}>
                                {tarea.entrega.calificacion ? 'Calificado' : 'Entregado'}
                              </div>
                            ) : (
                              <div style={{
                                background: 'rgba(239, 68, 68, 0.08)',
                                border: '0.0625rem solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '0.375em',
                                padding: '0.25em 0.625em',
                                fontSize: '0.6875rem',
                                fontWeight: '600',
                                color: '#ef4444',
                                whiteSpace: 'nowrap' as const
                              }}>
                                Pendiente
                              </div>
                            )}
                          </div>

                          {/* Subir archivo */}
                          {tarea.permite_archivo && !tarea.entrega && (
                            <div style={{ marginTop: '0.625em', paddingTop: '0.625em', borderTop: `0.0625rem solid ${darkMode ? 'rgba(255,255,255,0.04)' : '#e5e7eb'}` }}>
                              {/* Advertencia si pasó la fecha límite */}
                              {!puedeEntregar(tarea.fecha_limite) && (
                                <div style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '0.5em',
                                  padding: '0.5em 0.75em',
                                  marginBottom: '0.5em',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5em'
                                }}>
                                  <AlertTriangle size={16} color="#ef4444" />
                                  <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>
                                    Fecha límite vencida - La entrega será marcada como atrasada
                                  </span>
                                </div>
                              )}
                              
                              <input
                                type="file"
                                accept={tarea.formatos_permitidos.split(',').map(f => `.${f}`).join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > tarea.tamano_maximo_mb * 1024 * 1024) {
                                      toast.error(`El archivo no debe superar ${tarea.tamano_maximo_mb}MB`);
                                      return;
                                    }
                                    handleFileSelect(file, tarea.id_tarea, 'entregar');
                                  }
                                  e.target.value = ''; // Limpiar input
                                }}
                                style={{ display: 'none' }}
                                id={`file-${tarea.id_tarea}`}
                              />
                              <label
                                htmlFor={`file-${tarea.id_tarea}`}
                                style={{
                                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                  border: 'none',
                                  borderRadius: '0.4375em',
                                  padding: '0.5em 0.875em',
                                  color: darkMode ? '#000' : '#fff',
                                  cursor: uploadingTarea === tarea.id_tarea ? 'not-allowed' : 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.375em',
                                  fontWeight: '600',
                                  fontSize: '0.8125rem',
                                  opacity: uploadingTarea === tarea.id_tarea ? 0.6 : 1,
                                  boxShadow: '0 0.125rem 0.375rem rgba(251, 191, 36, 0.25)',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (uploadingTarea !== tarea.id_tarea) {
                                    e.currentTarget.style.transform = 'translateY(-0.0625rem)';
                                    e.currentTarget.style.boxShadow = '0 0.25rem 0.625rem rgba(251, 191, 36, 0.3)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = '0 0.125rem 0.375rem rgba(251, 191, 36, 0.25)';
                                }}
                              >
                                <Upload size={15} />
                                {uploadingTarea === tarea.id_tarea ? 'Subiendo...' : 'Entregar Tarea'}
                              </label>
                              <p style={{ color: theme.textMuted, fontSize: '0.6875rem', margin: '0.375em 0 0 0' }}>
                                Formatos: {tarea.formatos_permitidos.toUpperCase()} • Máx: {tarea.tamano_maximo_mb}MB
                              </p>
                            </div>
                          )}

                          {/* Archivo entregado */}
                          {tarea.entrega && (
                            <div style={{
                              background: darkMode ? 'rgba(217, 119, 6, 0.1)' : 'rgba(217, 119, 6, 0.05)',
                              border: '0.0625rem solid rgba(217, 119, 6, 0.2)',
                              borderRadius: '0.5em',
                              padding: '0.75em',
                              marginTop: '0.75em'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tarea.entrega.calificacion ? '0.5em' : '0' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.25em' }}>
                                    <p style={{ color: theme.textPrimary, fontSize: '0.875rem', fontWeight: '600', margin: 0 }}>
                                      {tarea.entrega.archivo_nombre}
                                    </p>
                                    {/* Badge ATRASADA */}
                                    {esEntregaAtrasada(tarea.entrega.fecha_entrega, tarea.fecha_limite) && (
                                      <span style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '0.25em',
                                        padding: '0.125em 0.5em',
                                        fontSize: '0.65rem',
                                        fontWeight: '700',
                                        color: '#ef4444',
                                        textTransform: 'uppercase'
                                      }}>
                                        ATRASADA
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>
                                    Entregado: {new Date(tarea.entrega.fecha_entrega).toLocaleDateString('es-ES')} {new Date(tarea.entrega.fecha_entrega).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </p>
                                </div>
                                <CheckCircle size={20} color="#d97706" />
                              </div>

                              {/* Botones Editar y Eliminar (solo si NO está calificada) */}
                              {!tarea.entrega.calificacion && (
                                <div style={{ display: 'flex', gap: '0.5em', marginTop: '0.5em', paddingTop: '0.5em', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                                  {/* Botón Editar */}
                                  <div>
                                    <input
                                      type="file"
                                      accept={tarea.formatos_permitidos.split(',').map(f => `.${f}`).join(',')}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          if (file.size > tarea.tamano_maximo_mb * 1024 * 1024) {
                                            toast.error(`El archivo no debe superar ${tarea.tamano_maximo_mb}MB`);
                                            return;
                                          }
                                          handleFileSelect(file, tarea.id_tarea, 'editar', tarea.entrega!.id_entrega, modulo.id_modulo);
                                        }
                                        e.target.value = ''; // Limpiar input
                                      }}
                                      style={{ display: 'none' }}
                                      id={`edit-file-${tarea.id_tarea}`}
                                    />
                                    <label
                                      htmlFor={`edit-file-${tarea.id_tarea}`}
                                      style={{
                                        background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
                                        border: '1px solid rgba(245, 158, 11, 0.3)',
                                        borderRadius: '0.375em',
                                        padding: '0.375em 0.75em',
                                        color: '#f59e0b',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375em',
                                        fontWeight: '600',
                                        fontSize: '0.75rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)';
                                      }}
                                    >
                                      <Edit size={14} />
                                      Editar
                                    </label>
                                  </div>

                                  {/* Botón Eliminar */}
                                  <button
                                    onClick={() => handleDeleteEntrega(tarea.entrega!.id_entrega, modulo.id_modulo)}
                                    style={{
                                      background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      borderRadius: '0.375em',
                                      padding: '0.375em 0.75em',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.375em',
                                      fontWeight: '600',
                                      fontSize: '0.75rem',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)';
                                    }}
                                  >
                                    <Trash2 size={14} />
                                    Eliminar
                                  </button>
                                </div>
                              )}

                              {/* Mostrar calificación si existe */}
                              {tarea.entrega.calificacion !== undefined && tarea.entrega.calificacion !== null && (
                                <div style={{
                                  borderTop: '0.0625rem solid rgba(217, 119, 6, 0.2)',
                                  paddingTop: '0.5em',
                                  marginTop: '0.5em'
                                }}>
                                  <p style={{ color: '#d97706', fontSize: '0.875rem', fontWeight: '700', margin: '0 0 0.25em 0' }}>
                                    Calificación: {tarea.entrega.calificacion}/{tarea.nota_maxima}
                                  </p>
                                  {tarea.entrega.comentarios && (
                                    <p style={{ color: theme.textSecondary, fontSize: '0.8125rem', margin: '0 0 0.25em 0', fontStyle: 'italic' }}>
                                      "{tarea.entrega.comentarios}"
                                    </p>
                                  )}
                                  <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>
                                    {tarea.entrega.calificador_nombres && tarea.entrega.calificador_apellidos ? (
                                      <>
                                        Calificado por <strong>{tarea.entrega.calificador_nombres} {tarea.entrega.calificador_apellidos}</strong>
                                        {tarea.entrega.fecha_calificacion && ` el ${new Date(tarea.entrega.fecha_calificacion).toLocaleDateString('es-ES')}`}
                                      </>
                                    ) : tarea.entrega.fecha_calificacion ? (
                                      `Calificado el ${new Date(tarea.entrega.fecha_calificacion).toLocaleDateString('es-ES')}`
                                    ) : null}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
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

      {/* Modal de Previsualización */}
      {archivoPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1em',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: darkMode ? 'rgba(26,26,46,0.98)' : '#ffffff',
            borderRadius: '1em',
            padding: '1.5em',
            maxWidth: '50em',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
              <h3 style={{ color: theme.textPrimary, fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>
                Vista Previa del Archivo
              </h3>
              <button
                onClick={() => setArchivoPreview(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '0.5em',
                  padding: '0.5em',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Información del archivo */}
            <div style={{
              background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.75em',
              padding: '1em',
              marginBottom: '1.5em'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginBottom: '0.5em' }}>
                <FileText size={24} color="#fbbf24" />
                <div>
                  <p style={{ color: theme.textPrimary, fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                    {archivoPreview.file.name}
                  </p>
                  <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                    Tamaño: {(archivoPreview.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div style={{
              background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
              borderRadius: '0.75em',
              padding: '1em',
              marginBottom: '1.5em',
              minHeight: '20em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {archivoPreview.file.type.startsWith('image/') ? (
                // Vista previa de imagen
                <img
                  src={archivoPreview.preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '30em',
                    borderRadius: '0.5em',
                    objectFit: 'contain'
                  }}
                />
              ) : archivoPreview.file.type === 'application/pdf' ? (
                // Vista previa de PDF
                <iframe
                  src={archivoPreview.preview}
                  style={{
                    width: '100%',
                    height: '30em',
                    border: 'none',
                    borderRadius: '0.5em'
                  }}
                  title="PDF Preview"
                />
              ) : (
                // Icono para otros tipos de archivo
                <div style={{ textAlign: 'center' }}>
                  <FileType size={80} color={theme.textMuted} />
                  <p style={{ color: theme.textMuted, marginTop: '1em' }}>
                    No se puede previsualizar este tipo de archivo
                  </p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75em', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setArchivoPreview(null)}
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                  border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                  borderRadius: '0.5em',
                  padding: '0.75em 1.5em',
                  color: darkMode ? '#fff' : '#64748b',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarSubida}
                disabled={uploadingTarea !== null}
                style={{
                  background: uploadingTarea !== null
                    ? 'rgba(251, 191, 36, 0.6)'
                    : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  border: 'none',
                  borderRadius: '0.5em',
                  padding: '0.75em 1.5em',
                  color: darkMode ? '#000' : '#fff',
                  fontWeight: '800',
                  cursor: uploadingTarea !== null ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: uploadingTarea !== null ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (uploadingTarea === null) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                }}
              >
                {uploadingTarea !== null ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(0,0,0,0.3)',
                      borderTop: '2px solid #000',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    {archivoPreview.tipo === 'entregar' ? 'Confirmar y Entregar' : 'Confirmar y Actualizar'}
                  </>
                )}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

    </div>
  );
};

export default DetalleCursoEstudiante;
