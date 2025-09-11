
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { 
  BookOpen, Plus, Edit, Eye, Trash2, Search, X, Save,
  Calendar, Users, Award, Clock, MapPin, User, AlertCircle
} from 'lucide-react';

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  descripcion?: string;
  tipo_curso_nombre: string;
  aula_nombre?: string;
  capacidad_maxima: number;
  estudiantes_inscritos: number;
  fecha_inicio: string;
  fecha_fin: string;
  horario?: string;
  estado: string;
  profesores?: string;
}

interface TipoCurso {
  id_tipo_curso: number;
  nombre: string;
  precio_base: number;
}

interface Aula {
  id_aula: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
}

const CursosManager: React.FC = () => {
  const { get, post, put, delete: del, loading } = useApi();
  
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [tiposCursos, setTiposCursos] = useState<TipoCurso[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadCursos(),
      loadTiposCursos(),
      loadAulas()
    ]);
  };

  const loadCursos = async () => {
    const response = await get<{success: boolean, data: Curso[]}>('/cursos');
    if (response.data?.success) {
      setCursos(response.data.data);
    } else {
      setError(response.error || 'Error cargando cursos');
    }
  };

  const loadTiposCursos = async () => {
    const response = await get<{success: boolean, data: TipoCurso[]}>('/cursos/tipos');
    if (response.data?.success) {
      setTiposCursos(response.data.data);
    }
  };

  const loadAulas = async () => {
    const response = await get<{success: boolean, data: Aula[]}>('/cursos/aulas');
    if (response.data?.success) {
      setAulas(response.data.data);
    }
  };

  // Filtrar cursos
  const cursosFiltrados = cursos.filter(curso => {
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.codigo_curso.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || curso.estado === filterEstado;
    const matchesTipo = filterTipo === 'todos' || curso.tipo_curso_nombre === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  const handleCreateCurso = () => {
    setSelectedCurso(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditCurso = (curso: Curso) => {
    setSelectedCurso(curso);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewCurso = (curso: Curso) => {
    setSelectedCurso(curso);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteCurso = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este curso?')) return;

    const response = await del(`/cursos/${id}`);
    if (response.data?.success) {
      await loadCursos();
      setError(null);
    } else {
      setError(response.error || 'Error eliminando curso');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const cursoData = {
      codigo_curso: formData.get('codigo_curso') as string,
      nombre: formData.get('nombre') as string,
      descripcion: formData.get('descripcion') as string,
      id_tipo_curso: Number(formData.get('id_tipo_curso')),
      id_aula: formData.get('id_aula') ? Number(formData.get('id_aula')) : null,
      capacidad_maxima: Number(formData.get('capacidad_maxima')),
      fecha_inicio: formData.get('fecha_inicio') as string,
      fecha_fin: formData.get('fecha_fin') as string,
      horario: formData.get('horario') as string,
      estado: formData.get('estado') as string || 'planificado'
    };

    let response;
    if (modalType === 'create') {
      response = await post('/cursos', cursoData);
    } else {
      response = await put(`/cursos/${selectedCurso?.id_curso}`, cursoData);
    }

    if (response.data?.success) {
      await loadCursos();
      setShowModal(false);
      setError(null);
    } else {
      setError(response.error || 'Error guardando curso');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return '#10b981';
      case 'planificado': return '#3b82f6';
      case 'finalizado': return '#6b7280';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <BookOpen size={32} color="#ef4444" />
          Gestión de Cursos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra los cursos disponibles en la academia ({cursosFiltrados.length} cursos)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#ef4444'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder="Buscar cursos o códigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Filtros */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos los tipos</option>
              {tiposCursos.map(tipo => (
                <option key={tipo.id_tipo_curso} value={tipo.nombre}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Crear */}
          <button
            onClick={handleCreateCurso}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Lista de Cursos */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {cursosFiltrados.map(curso => {
          const estadoColor = getEstadoColor(curso.estado);
          const ocupacion = curso.capacidad_maxima > 0 
            ? (curso.estudiantes_inscritos / curso.capacidad_maxima) * 100 
            : 0;

          return (
            <div key={curso.id_curso} style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: `${estadoColor}20`,
                      color: estadoColor,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {curso.codigo_curso}
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                      {curso.tipo_curso_nombre}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
                    {curso.nombre}
                  </h3>
                  
                  {curso.descripcion && (
                    <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                      {curso.descripcion}
                    </p>
                  )}
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} />
                      <strong>Profesores:</strong> {curso.profesores || 'Sin asignar'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      <strong>Aula:</strong> {curso.aula_nombre || 'Sin asignar'}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={14} />
                      <strong>Capacidad:</strong> {curso.estudiantes_inscritos}/{curso.capacidad_maxima}
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} />
                      <strong>Horario:</strong> {curso.horario || 'Por definir'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: `${estadoColor}20`,
                    color: estadoColor
                  }}>
                    {curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1)}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleViewCurso(curso)}
                      style={{
                        padding: '8px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditCurso(curso)}
                      style={{
                        padding: '8px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '8px',
                        color: '#f59e0b',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCurso(curso.id_curso)}
                      style={{
                        padding: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px', 
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      defaultValue={selectedCurso?.descripcion || ''}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                      placeholder="Descripción del curso"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Aula
                      </label>
                      <select
                        name="id_aula"
                        defaultValue={selectedCurso ? 
                          aulas.find(a => a.nombre === selectedCurso.aula_nombre)?.id_aula || '' 
                          : ''}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="">Sin aula asignada</option>
                        {aulas.map(aula => (
                          <option key={aula.id_aula} value={aula.id_aula}>
                            {aula.nombre} - {aula.ubicacion} (Cap: {aula.capacidad})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Capacidad Máxima *
                      </label>
                      <input
                        name="capacidad_maxima"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={selectedCurso?.capacidad_maxima || 20}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Fecha de Inicio *
                      </label>
                      <input
                        name="fecha_inicio"
                        type="date"
                        defaultValue={selectedCurso?.fecha_inicio || ''}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Fecha de Fin *
                      </label>
                      <input
                        name="fecha_fin"
                        type="date"
                        defaultValue={selectedCurso?.fecha_fin || ''}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Horario
                      </label>
                      <input
                        name="horario"
                        type="text"
                        defaultValue={selectedCurso?.horario || ''}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                        placeholder="Ej: Lunes a Viernes 8:00-12:00"
                      />
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Estado
                      </label>
                      <select
                        name="estado"
                        defaultValue={selectedCurso?.estado || 'planificado'}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="planificado">Planificado</option>
                        <option value="activo">Activo</option>
                        <option value="finalizado">Finalizado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {modalType !== 'view' && (
                  <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: 'rgba(255,255,255,0.7)',
                        cursor: 'pointer'
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: loading ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(255,255,255,0.3)',
                            borderTop: '2px solid #fff',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {modalType === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CursosManager;<div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Fecha Inicio</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                      {curso.fecha_inicio ? new Date(curso.fecha_inicio).toLocaleDateString() : 'Por definir'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Fecha Fin</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                      {curso.fecha_fin ? new Date(curso.fecha_fin).toLocaleDateString() : 'Por definir'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso de ocupación */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Ocupación del curso</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                    {Math.round(ocupacion)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${ocupacion}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${
                      ocupacion > 80 ? '#ef4444' : 
                      ocupacion > 60 ? '#f59e0b' : '#10b981'
                    }, ${
                      ocupacion > 80 ? '#dc2626' : 
                      ocupacion > 60 ? '#d97706' : '#059669'
                    })`,
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay cursos */}
      {cursosFiltrados.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
            No se encontraron cursos
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            {searchTerm || filterEstado !== 'todos' || filterTipo !== 'todos' 
              ? 'Intenta con otros filtros de búsqueda' 
              : 'Crea tu primer curso'}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Crear Nuevo Curso' : 
                 modalType === 'edit' ? 'Editar Curso' : 'Detalles del Curso'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            {modalType === 'view' && selectedCurso ? (
              // Vista de detalles del curso
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Código del Curso
                    </label>
                    <div style={{ color: '#fff', fontSize: '1rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      {selectedCurso.codigo_curso}
                    </div>
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Estado
                    </label>
                    <div style={{ color: '#fff', fontSize: '1rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      {selectedCurso.estado}
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Nombre del Curso
                  </label>
                  <div style={{ color: '#fff', fontSize: '1rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    {selectedCurso.nombre}
                  </div>
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Descripción
                  </label>
                  <div style={{ color: '#fff', fontSize: '1rem', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    {selectedCurso.descripcion || 'Sin descripción'}
                  </div>
                </div>
              </div>
            ) : (
              // Formulario de creación/edición
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Código del Curso *
                      </label>
                      <input
                        name="codigo_curso"
                        type="text"
                        defaultValue={selectedCurso?.codigo_curso || ''}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                        placeholder="Ej: COS-001"
                      />
                    </div>
                    <div>
                      <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                        Tipo de Curso *
                      </label>
                      <select
                        name="id_tipo_curso"
                        defaultValue={selectedCurso ? 
                          tiposCursos.find(t => t.nombre === selectedCurso.tipo_curso_nombre)?.id_tipo_curso || '' 
                          : ''}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="">Seleccionar tipo</option>
                        {tiposCursos.map(tipo => (
                          <option key={tipo.id_tipo_curso} value={tipo.id_tipo_curso}>
                            {tipo.nombre} - ${tipo.precio_base}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Nombre del Curso *
                    </label>
                    <input
                      name="nombre"
                      type="text"
                      defaultValue={selectedCurso?.nombre || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                      placeholder="Nombre del curso"
                    />
                  </div>

                  <div></div>

                  