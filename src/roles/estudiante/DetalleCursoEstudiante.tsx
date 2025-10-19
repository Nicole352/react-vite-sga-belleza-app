import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Calendar, FileText, Upload,
  CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface Modulo {
  id_modulo: number;
  nombre: string;
  descripcion: string;
  numero_orden: number;
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

const DetalleCursoEstudiante: React.FC<DetalleCursoEstudianteProps> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<any>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [tareasPorModulo, setTareasPorModulo] = useState<{ [key: number]: Tarea[] }>({});
  const [modulosExpandidos, setModulosExpandidos] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [uploadingTarea, setUploadingTarea] = useState<number | null>(null);

  const theme = {
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.3)',
    cardBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
    accent: '#fbbf24'
  };

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
              fontSize: '1.5rem',
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
                              <div style={{ display: 'flex', gap: '0.75em', fontSize: '0.8125rem', color: theme.textMuted }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
                                  <Calendar size={13} />
                                  {new Date(tarea.fecha_limite).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
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
                                background: tarea.entrega.calificacion ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                border: `0.0625rem solid ${tarea.entrega.calificacion ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                                borderRadius: '0.375em',
                                padding: '0.25em 0.625em',
                                fontSize: '0.6875rem',
                                fontWeight: '600',
                                color: tarea.entrega.calificacion ? '#10b981' : '#3b82f6',
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
                                    handleFileUpload(tarea.id_tarea, file);
                                  }
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
                                {uploadingTarea === tarea.id_tarea ? 'Subiendo...' : 'Subir Archivo'}
                              </label>
                              <p style={{ color: theme.textMuted, fontSize: '0.6875rem', margin: '0.375em 0 0 0' }}>
                                Formatos: {tarea.formatos_permitidos.toUpperCase()} • Máx: {tarea.tamano_maximo_mb}MB
                              </p>
                            </div>
                          )}

                          {/* Archivo entregado */}
                          {tarea.entrega && (
                            <div style={{
                              background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
                              border: '0.0625rem solid rgba(16, 185, 129, 0.2)',
                              borderRadius: '0.5em',
                              padding: '0.75em',
                              marginTop: '0.75em'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tarea.entrega.calificacion ? '0.5em' : '0' }}>
                                <div>
                                  <p style={{ color: theme.textPrimary, fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.25em 0' }}>
                                    {tarea.entrega.archivo_nombre}
                                  </p>
                                  <p style={{ color: theme.textMuted, fontSize: '0.75rem', margin: 0 }}>
                                    Entregado: {new Date(tarea.entrega.fecha_entrega).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                                <CheckCircle size={20} color="#10b981" />
                              </div>

                              {/* Mostrar calificación si existe */}
                              {tarea.entrega.calificacion !== undefined && tarea.entrega.calificacion !== null && (
                                <div style={{
                                  borderTop: '0.0625rem solid rgba(16, 185, 129, 0.2)',
                                  paddingTop: '0.5em',
                                  marginTop: '0.5em'
                                }}>
                                  <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '700', margin: '0 0 0.25em 0' }}>
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
    </div>
  );
};

export default DetalleCursoEstudiante;
