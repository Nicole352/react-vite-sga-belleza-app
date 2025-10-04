import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Upload, CheckCircle, Clock, 
  AlertCircle, FileText, Award, TrendingUp, Download,
  ChevronDown, ChevronUp
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface Tarea {
  id_tarea: number;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  fecha_limite: string;
  nota_maxima: number;
  nota_minima_aprobacion: number;
  modulo_nombre: string;
  modulo_orden: number;
  estado_estudiante: 'pendiente' | 'entregado' | 'calificado';
  id_entrega: number | null;
  fecha_entrega: string | null;
  nota: number | null;
  resultado: string | null;
  comentario_docente: string | null;
}

interface ModuloAgrupado {
  nombre: string;
  orden: number;
  tareas: Tarea[];
}

interface Curso {
  nombre: string;
  codigo_curso: string;
}

const TareasEstudiante: React.FC = () => {
  const { id_curso } = useParams<{ id_curso: string }>();
  const navigate = useNavigate();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [modulosAgrupados, setModulosAgrupados] = useState<ModuloAgrupado[]>([]);
  const [modulosExpandidos, setModulosExpandidos] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [showModalEntrega, setShowModalEntrega] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [comentario, setComentario] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCursoData();
    fetchTareas();
  }, [id_curso]);

  useEffect(() => {
    // Agrupar tareas por módulo
    const agrupados: { [key: string]: ModuloAgrupado } = {};
    
    tareas.forEach(tarea => {
      const key = `${tarea.modulo_orden}-${tarea.modulo_nombre}`;
      if (!agrupados[key]) {
        agrupados[key] = {
          nombre: tarea.modulo_nombre,
          orden: tarea.modulo_orden,
          tareas: []
        };
      }
      agrupados[key].tareas.push(tarea);
    });

    const modulosArray = Object.values(agrupados).sort((a, b) => a.orden - b.orden);
    setModulosAgrupados(modulosArray);

    // Expandir el primer módulo por defecto
    if (modulosArray.length > 0) {
      setModulosExpandidos({ [modulosArray[0].orden]: true });
    }
  }, [tareas]);

  const fetchCursoData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/cursos/${id_curso}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurso(response.data);
    } catch (error) {
      console.error('Error fetching curso:', error);
      toast.error('Error cargando información del curso');
    }
  };

  const fetchTareas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/tareas/estudiante/curso/${id_curso}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTareas(response.data.tareas || []);
    } catch (error) {
      console.error('Error fetching tareas:', error);
      toast.error('Error cargando tareas');
    } finally {
      setLoading(false);
    }
  };

  const toggleModulo = (orden: number) => {
    setModulosExpandidos(prev => ({
      ...prev,
      [orden]: !prev[orden]
    }));
  };

  const handleEntregarTarea = (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    setShowModalEntrega(true);
    setArchivo(null);
    setComentario('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        toast.error('El archivo no debe superar 5MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Solo se permiten archivos PDF, JPG, PNG, WEBP');
        return;
      }

      setArchivo(file);
    }
  };

  const handleSubmitEntrega = async () => {
    if (!archivo && !tareaSeleccionada?.id_entrega) {
      toast.error('Debes seleccionar un archivo');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('id_tarea', tareaSeleccionada!.id_tarea.toString());
      formData.append('comentario_estudiante', comentario);
      if (archivo) {
        formData.append('archivo', archivo);
      }

      if (tareaSeleccionada?.id_entrega) {
        // Actualizar entrega existente
        await axios.put(`${API_BASE}/entregas/${tareaSeleccionada.id_entrega}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Entrega actualizada exitosamente');
      } else {
        // Crear nueva entrega
        await axios.post(`${API_BASE}/entregas`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Tarea entregada exitosamente');
      }

      setShowModalEntrega(false);
      fetchTareas();
    } catch (error: any) {
      console.error('Error submitting entrega:', error);
      toast.error(error.response?.data?.error || 'Error al entregar tarea');
    } finally {
      setUploading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' };
      case 'entregado':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      case 'calificado':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' };
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock size={18} />;
      case 'entregado': return <Upload size={18} />;
      case 'calificado': return <CheckCircle size={18} />;
      default: return <AlertCircle size={18} />;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'entregado': return 'Entregado';
      case 'calificado': return 'Calificado';
      default: return 'Desconocido';
    }
  };

  const calcularPromedioGeneral = () => {
    const tareasCalificadas = tareas.filter(t => t.nota !== null);
    if (tareasCalificadas.length === 0) return null;
    const suma = tareasCalificadas.reduce((acc, t) => acc + (t.nota || 0), 0);
    return (suma / tareasCalificadas.length).toFixed(2);
  };

  const calcularEstadisticas = () => {
    const total = tareas.length;
    const pendientes = tareas.filter(t => t.estado_estudiante === 'pendiente').length;
    const entregadas = tareas.filter(t => t.estado_estudiante === 'entregado').length;
    const calificadas = tareas.filter(t => t.estado_estudiante === 'calificado').length;
    return { total, pendientes, entregadas, calificadas };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(251, 146, 60, 0.3)',
            borderTop: '4px solid #fb923c',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>Cargando tareas...</p>
        </div>
      </div>
    );
  }

  const stats = calcularEstadisticas();
  const promedioGeneral = calcularPromedioGeneral();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid rgba(251, 146, 60, 0.2)'
        }}>
          <button
            onClick={() => navigate('/panel/estudiante')}
            style={{
              background: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              borderRadius: '12px',
              padding: '10px 20px',
              color: '#fb923c',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)';
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
                color: '#fff',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <BookOpen size={32} style={{ color: '#fb923c' }} />
                {curso?.nombre}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                Código: {curso?.codigo_curso}
              </p>
            </div>

            {promedioGeneral && (
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '15px',
                padding: '20px 30px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <Award size={24} style={{ color: '#fff' }} />
                  <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>Promedio General</span>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#fff' }}>
                  {promedioGeneral}
                </div>
              </div>
            )}
          </div>

          {/* Estadísticas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '25px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '15px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '5px' }}>Total Tareas</div>
              <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700' }}>{stats.total}</div>
            </div>
            <div style={{
              background: 'rgba(251, 191, 36, 0.1)',
              borderRadius: '12px',
              padding: '15px',
              border: '1px solid rgba(251, 191, 36, 0.2)'
            }}>
              <div style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '5px' }}>Pendientes</div>
              <div style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: '700' }}>{stats.pendientes}</div>
            </div>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              padding: '15px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{ color: '#3b82f6', fontSize: '0.85rem', marginBottom: '5px' }}>Entregadas</div>
              <div style={{ color: '#3b82f6', fontSize: '1.8rem', fontWeight: '700' }}>{stats.entregadas}</div>
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '12px',
              padding: '15px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '5px' }}>Calificadas</div>
              <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: '700' }}>{stats.calificadas}</div>
            </div>
          </div>
        </div>

        {/* Lista de Módulos con Tareas */}
        {modulosAgrupados.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '60px 30px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <FileText size={64} style={{ color: 'rgba(255,255,255,0.3)', margin: '0 auto 20px' }} />
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>
              No hay tareas disponibles
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              Tu docente aún no ha creado tareas para este curso
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {modulosAgrupados.map((modulo) => (
              <div
                key={modulo.orden}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden'
                }}
              >
                {/* Header del Módulo */}
                <div
                  style={{
                    padding: '25px 30px',
                    background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleModulo(modulo.orden)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        #{modulo.orden}
                      </span>
                      <h3 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '600', margin: 0 }}>
                        {modulo.nombre}
                      </h3>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        ({modulo.tareas.length} tareas)
                      </span>
                    </div>

                    {modulosExpandidos[modulo.orden] ? (
                      <ChevronUp size={24} style={{ color: '#fb923c' }} />
                    ) : (
                      <ChevronDown size={24} style={{ color: '#fb923c' }} />
                    )}
                  </div>
                </div>

                {/* Lista de Tareas */}
                {modulosExpandidos[modulo.orden] && (
                  <div style={{ padding: '20px 30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {modulo.tareas.map((tarea) => {
                        const estadoColor = getEstadoColor(tarea.estado_estudiante);
                        const isVencida = new Date(tarea.fecha_limite) < new Date() && tarea.estado_estudiante === 'pendiente';

                        return (
                          <div
                            key={tarea.id_tarea}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid ${isVencida ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: '12px',
                              padding: '20px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                                    {tarea.titulo}
                                  </h4>
                                  <span style={{
                                    background: estadoColor.bg,
                                    color: estadoColor.text,
                                    border: `1px solid ${estadoColor.border}`,
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}>
                                    {getEstadoIcon(tarea.estado_estudiante)}
                                    {getEstadoTexto(tarea.estado_estudiante)}
                                  </span>
                                  {isVencida && (
                                    <span style={{
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      color: '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '4px 12px',
                                      borderRadius: '8px',
                                      fontSize: '0.8rem',
                                      fontWeight: '500'
                                    }}>
                                      Vencida
                                    </span>
                                  )}
                                </div>

                                {tarea.descripcion && (
                                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '12px' }}>
                                    {tarea.descripcion}
                                  </p>
                                )}

                                <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Clock size={14} />
                                    Límite: {new Date(tarea.fecha_limite).toLocaleDateString()}
                                  </span>
                                  <span style={{ color: '#fb923c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Award size={14} />
                                    Nota máx: {tarea.nota_maxima}
                                  </span>
                                  {tarea.fecha_entrega && (
                                    <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <Upload size={14} />
                                      Entregado: {new Date(tarea.fecha_entrega).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Calificación */}
                                {tarea.estado_estudiante === 'calificado' && tarea.nota !== null && (
                                  <div style={{
                                    marginTop: '15px',
                                    padding: '15px',
                                    background: tarea.nota >= tarea.nota_minima_aprobacion 
                                      ? 'rgba(16, 185, 129, 0.1)' 
                                      : 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${tarea.nota >= tarea.nota_minima_aprobacion 
                                      ? 'rgba(16, 185, 129, 0.3)' 
                                      : 'rgba(239, 68, 68, 0.3)'}`,
                                    borderRadius: '10px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>
                                          Tu Calificación
                                        </div>
                                        <div style={{
                                          fontSize: '2rem',
                                          fontWeight: '700',
                                          color: tarea.nota >= tarea.nota_minima_aprobacion ? '#10b981' : '#ef4444'
                                        }}>
                                          {tarea.nota}/{tarea.nota_maxima}
                                        </div>
                                      </div>
                                      <div style={{
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: tarea.resultado === 'aprobado' 
                                          ? 'rgba(16, 185, 129, 0.2)' 
                                          : 'rgba(239, 68, 68, 0.2)',
                                        color: tarea.resultado === 'aprobado' ? '#10b981' : '#ef4444',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                      }}>
                                        {tarea.resultado === 'aprobado' ? '✓ APROBADO' : '✗ REPROBADO'}
                                      </div>
                                    </div>
                                    {tarea.comentario_docente && (
                                      <div>
                                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>
                                          Comentario del docente:
                                        </div>
                                        <p style={{ color: '#fff', fontSize: '0.9rem', margin: 0 }}>
                                          {tarea.comentario_docente}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Botones de acción */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tarea.estado_estudiante === 'pendiente' && (
                                  <button
                                    onClick={() => handleEntregarTarea(tarea)}
                                    style={{
                                      background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                                      border: 'none',
                                      borderRadius: '10px',
                                      padding: '10px 20px',
                                      color: '#fff',
                                      fontWeight: '600',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease',
                                      boxShadow: '0 4px 15px rgba(251, 146, 60, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(251, 146, 60, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(251, 146, 60, 0.3)';
                                    }}
                                  >
                                    <Upload size={18} />
                                    Entregar
                                  </button>
                                )}

                                {(tarea.estado_estudiante === 'entregado' || tarea.estado_estudiante === 'calificado') && tarea.id_entrega && (
                                  <>
                                    <button
                                      onClick={() => window.open(`${API_BASE}/entregas/${tarea.id_entrega}/archivo`, '_blank')}
                                      style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '10px',
                                        padding: '10px 20px',
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                                    >
                                      <Download size={18} />
                                      Ver Entrega
                                    </button>
                                    {tarea.estado_estudiante === 'entregado' && (
                                      <button
                                        onClick={() => handleEntregarTarea(tarea)}
                                        style={{
                                          background: 'rgba(251, 146, 60, 0.1)',
                                          border: '1px solid rgba(251, 146, 60, 0.3)',
                                          borderRadius: '10px',
                                          padding: '10px 20px',
                                          color: '#fb923c',
                                          fontWeight: '600',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          cursor: 'pointer',
                                          transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 146, 60, 0.2)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(251, 146, 60, 0.1)'}
                                      >
                                        <Upload size={18} />
                                        Re-entregar
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Entrega */}
      {showModalEntrega && tareaSeleccionada && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(251, 146, 60, 0.3)'
          }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>
              {tareaSeleccionada.id_entrega ? 'Re-entregar Tarea' : 'Entregar Tarea'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '25px' }}>
              {tareaSeleccionada.titulo}
            </p>

            {tareaSeleccionada.instrucciones && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px' }}>
                  📋 Instrucciones:
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {tareaSeleccionada.instrucciones}
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Archivo *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '2px dashed rgba(251, 146, 60, 0.3)',
                  borderRadius: '12px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '8px' }}>
                Formatos permitidos: PDF, JPG, PNG, WEBP (máx. 5MB)
              </p>
              {archivo && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  color: '#10b981',
                  fontSize: '0.9rem'
                }}>
                  ✓ {archivo.name} ({(archivo.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '10px', fontWeight: '600' }}>
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agrega un comentario sobre tu entrega..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModalEntrega(false)}
                disabled={uploading}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitEntrega}
                disabled={uploading || (!archivo && !tareaSeleccionada.id_entrega)}
                style={{
                  background: uploading 
                    ? 'rgba(251, 146, 60, 0.5)' 
                    : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: uploading || (!archivo && !tareaSeleccionada.id_entrega) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {uploading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    {tareaSeleccionada.id_entrega ? 'Actualizar Entrega' : 'Entregar Tarea'}
                  </>
                )}
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
      `}</style>
    </div>
  );
};

export default TareasEstudiante;
