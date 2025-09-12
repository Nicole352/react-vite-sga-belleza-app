import React, { useEffect, useState } from 'react';
import { 
  Search, Plus, Edit, Eye, Trash2, X, BookOpen, Save
} from 'lucide-react';

type Course = {
  id_curso: number;
  codigo_curso: string;
  id_tipo_curso: number;
  id_aula: number | null;
  nombre: string;
  descripcion: string | null;
  capacidad_maxima: number;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string;    // YYYY-MM-DD
  horario: string | null;
  estado: 'planificado' | 'activo' | 'finalizado' | 'cancelado';
};

type EstadoFilter = 'todos' | Course['estado'];

// Opciones para selects (catálogos)
type TipoCursoOption = {
  id_tipo_curso: number;
  codigo: string;
  nombre: string;
};

type AulaOption = {
  id_aula: number;
  nombre: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionCursos = () => {
  const [cursos, setCursos] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedCurso, setSelectedCurso] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoFilter>('todos');
  const [tiposCursos, setTiposCursos] = useState<TipoCursoOption[]>([]);
  const [aulas, setAulas] = useState<AulaOption[]>([]);

  const fetchCursos = async (estadoFilter?: EstadoFilter) => {
    try {
      setLoading(true);
      setError(null);
      const estadoParam = (estadoFilter && estadoFilter !== 'todos') ? `estado=${estadoFilter}` : '';
      const qs = [estadoParam, 'limit=100'].filter(Boolean).join('&');
      const url = qs ? `${API_BASE}/api/cursos?${qs}` : `${API_BASE}/api/cursos`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo cargar cursos');
      const data = await res.json();
      const raw = Array.isArray(data) ? data : (Array.isArray((data as any)?.rows) ? (data as any).rows : (Array.isArray((data as any)?.data) ? (data as any).data : []));
      // map keys from list query to Course minimal view
      const normalized: Course[] = raw.map((row: any) => ({
        id_curso: row.id_curso,
        codigo_curso: row.codigo_curso,
        id_tipo_curso: row.id_tipo_curso ?? 0,
        id_aula: row.id_aula ?? null,
        nombre: row.nombre,
        descripcion: row.descripcion ?? null,
        capacidad_maxima: row.capacidad_maxima ?? 20,
        fecha_inicio: row.fecha_inicio?.slice(0,10),
        fecha_fin: row.fecha_fin?.slice(0,10),
        horario: row.horario ?? null,
        estado: row.estado,
      }));
      setCursos(normalized);
    } catch (e: any) {
      setError(e.message || 'Error cargando cursos');
    } finally {
      setLoading(false);
    }
  };

  // Bloquear/Reanudar matrícula
  const handleToggleMatricula = async (curso: Course) => {
    // Determinar el nuevo estado basado en el estado actual
    let target: Course['estado'];
    if (curso.estado === 'cancelado') {
      // Si está cancelado (bloqueado), reanudar a activo o planificado según las fechas
      const hoy = new Date();
      const fechaInicio = new Date(curso.fecha_inicio);
      target = fechaInicio <= hoy ? 'activo' : 'planificado';
    } else {
      // Si no está cancelado, bloquear (cancelar temporalmente)
      target = 'cancelado';
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/cursos/${curso.id_curso}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: target })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo actualizar el estado de matrícula');
      }
      
      // Actualizar estado local inmediatamente sin recargar
      setCursos(prev => prev.map(c => 
        c.id_curso === curso.id_curso 
          ? { ...c, estado: target }
          : c
      ));

      // Mostrar mensaje de confirmación
      const accion = target === 'cancelado' ? 'bloqueado' : 'reanudado';
      alert(`Curso ${accion} exitosamente. ${target === 'cancelado' ? 'Las matrículas están suspendidas.' : 'Las matrículas están habilitadas.'}`);
    } catch (e: any) {
      setError(e.message || 'Error actualizando estado');
      alert(`Error: ${e.message || 'No se pudo actualizar el estado del curso'}`);
    } finally {
      setLoading(false);
    }
  };

  // Clonar edición
  const handleCloneCurso = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/cursos/${id}/clone`, { method: 'POST' });
      if (!res.ok) throw new Error('No se pudo clonar el curso');
      
      const newCurso = await res.json();
      // Agregar el nuevo curso clonado a la lista inmediatamente
      setCursos(prev => [newCurso, ...prev]);
      alert('Se creó una nueva edición del curso. Ajusta fechas si es necesario.');
    } catch (e: any) {
      setError(e.message || 'Error clonando curso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCursos(filterEstado);
    // cargar catálogos
    (async () => {
      try {
        const [resTipos, resAulas] = await Promise.all([
          fetch(`${API_BASE}/api/tipos-cursos?estado=activo`),
          fetch(`${API_BASE}/api/aulas?estado=disponible`)
        ]);
        if (resTipos.ok) {
          const dataTipos = await resTipos.json();
          setTiposCursos(dataTipos);
        }
        if (resAulas.ok) {
          const dataAulas = await resAulas.json();
          setAulas(dataAulas);
        }
      } catch (e) {
        // silencioso, no bloquear UI por catálogos
      }
    })();
  }, [filterEstado]);

  const handleCreateCurso = () => {
    setSelectedCurso(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditCurso = (curso: Course) => {
    setSelectedCurso(curso);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewCurso = (curso: Course) => {
    setSelectedCurso(curso);
    setModalType('view');
    setShowModal(true);
  };

  const handleFilterEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterEstado(e.target.value as EstadoFilter);
  };

  // Quick-add handlers eliminados: ahora Tipos/Aulas se gestionan en módulos dedicados

  const handleDeleteCurso = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este curso?')) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/cursos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el curso');
      // Actualizar lista local inmediatamente sin recargar
      setCursos(prev => prev.filter(c => c.id_curso !== id));
    } catch (e: any) {
      setError(e.message || 'Error eliminando curso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payloadBase: any = {
      id_tipo_curso: Number(formData.get('id_tipo_curso') || 0),
      id_aula: formData.get('id_aula') ? Number(formData.get('id_aula')) : null,
      nombre: String(formData.get('nombre') || '').trim(),
      descripcion: String(formData.get('descripcion') || ''),
      capacidad_maxima: Number(formData.get('capacidad_maxima') || 20),
      fecha_inicio: String(formData.get('fecha_inicio') || ''),
      fecha_fin: String(formData.get('fecha_fin') || ''),
      horario: String(formData.get('horario') || ''),
      estado: (String(formData.get('estado') || 'planificado') as Course['estado'])
    };
    // Solo incluir codigo_curso cuando se edita; en creación el backend lo genera automáticamente
    const payload = (modalType === 'edit' && selectedCurso)
      ? { ...payloadBase, codigo_curso: String(formData.get('codigo_curso') || '').trim() }
      : payloadBase;

    // Validación simple en frontend
    // Código es obligatorio solo en edición (en creación se genera automáticamente)
    if (modalType === 'edit' && !('codigo_curso' in payload) ) {
      setError('El código del curso es obligatorio');
      return;
    }
    if (!payload.id_tipo_curso) {
      setError('Debes seleccionar un tipo de curso');
      return;
    }
    const dInicio = new Date(payload.fecha_inicio);
    const dFin = new Date(payload.fecha_fin);
    if (!(dInicio instanceof Date) || isNaN(dInicio.getTime())) {
      setError('Fecha de inicio inválida');
      return;
    }
    if (!(dFin instanceof Date) || isNaN(dFin.getTime())) {
      setError('Fecha de fin inválida');
      return;
    }
    if (dFin <= dInicio) {
      setError('La fecha de fin debe ser mayor a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (modalType === 'create') {
        const res = await fetch(`${API_BASE}/api/cursos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          let msg = 'No se pudo crear el curso';
          try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
          throw new Error(msg);
        }
        const newCurso = await res.json();
        // Agregar el nuevo curso a la lista inmediatamente
        setCursos(prev => [newCurso, ...prev]);
      } else if (modalType === 'edit' && selectedCurso) {
        const res = await fetch(`${API_BASE}/api/cursos/${selectedCurso.id_curso}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          let msg = 'No se pudo actualizar el curso';
          try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
          throw new Error(msg);
        }
        const updatedCurso = await res.json();
        // Actualizar el curso en la lista inmediatamente
        setCursos(prev => prev.map(c => 
          c.id_curso === selectedCurso.id_curso 
            ? { ...c, ...updatedCurso }
            : c
        ));
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || 'Error guardando curso');
    } finally {
      setLoading(false);
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
          Administra los cursos disponibles en la academia
        </p>
      </div>

      {/* Advertencia si no hay tipos de curso */}
      {tiposCursos.length === 0 && (
        <div style={{
          background: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          color: '#fbbf24',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontWeight: 600 }}>Primero crea un "Tipo de Curso" en el módulo Tipos de Curso para poder crear cursos.</span>
          </div>
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
                placeholder="Buscar cursos o instructores..."
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
              onChange={handleFilterEstadoChange}
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
              <option value="planificado">Planificados</option>
              <option value="activo">Activos</option>
              <option value="finalizado">Finalizados</option>
              <option value="cancelado">Cancelados</option>
              {/* 'cerrado' no existe en la BD; usamos 'cancelado' como bloqueo temporal */}
            </select>
          </div>

          {/* Botón Crear */}
          <button
            onClick={handleCreateCurso}
            disabled={tiposCursos.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: tiposCursos.length === 0 ? 'rgba(239, 68, 68, 0.3)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: tiposCursos.length === 0 ? 'not-allowed' : 'pointer',
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
        {cursos
          .filter(c => {
            const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesEstado = filterEstado === 'todos' || c.estado === filterEstado;
            return matchesSearch && matchesEstado;
          })
          .map((curso) => (
          <div key={curso.id_curso} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Código</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Nombre</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Fecha Inicio</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.7)' }}>Fecha Fin</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Cupos</th>
                  <th style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Estado</th>
                  <th style={{ padding: '16px', textAlign: 'right', color: 'rgba(255,255,255,0.7)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr key={`curso-${curso.id_curso}`} style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '16px', color: 'rgba(255,255,255,0.9)' }}>{curso.codigo_curso}</td>
                  <td style={{ padding: '16px', color: '#fff' }}>{curso.nombre}</td>
                  <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>{curso.fecha_inicio}</td>
                  <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)' }}>{curso.fecha_fin}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    {curso.estado === 'cancelado' ? (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: 'rgba(156, 163, 175, 0.2)',
                        color: '#9ca3af'
                      }}>
                        Cerrado
                      </span>
                    ) : (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: (curso as any).cupos_disponibles > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: (curso as any).cupos_disponibles > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {(curso as any).cupos_disponibles || 0} / {curso.capacidad_maxima || 0}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{ padding: '6px 10px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700,
                      background: curso.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)'
                               : curso.estado === 'planificado' ? 'rgba(59, 130, 246, 0.15)'
                               : curso.estado === 'finalizado' ? 'rgba(156, 163, 175, 0.2)'
                               : 'rgba(239, 68, 68, 0.15)',
                      color: curso.estado === 'activo' ? '#10b981'
                             : curso.estado === 'planificado' ? '#3b82f6'
                             : curso.estado === 'finalizado' ? '#9ca3af'
                             : '#ef4444' }}>
                      {curso.estado}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleViewCurso(curso)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditCurso(curso)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteCurso(curso.id_curso)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleMatricula(curso)} 
                        style={{ 
                          background: curso.estado === 'cancelado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                          border: curso.estado === 'cancelado' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', 
                          color: curso.estado === 'cancelado' ? '#10b981' : '#ef4444', 
                          padding: '8px 12px', 
                          borderRadius: '10px', 
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {curso.estado === 'cancelado' ? '🔓 Reanudar' : '🔒 Bloquear'}
                      </button>
                      <button onClick={() => handleCloneCurso(curso.id_curso)} style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#3b82f6', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                        Clonar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            {loading && (
              <div style={{ padding: '16px', color: 'rgba(255,255,255,0.7)' }}>Cargando...</div>
            )}
            {error && (
              <div style={{ padding: '16px', color: '#ef4444' }}>{error}</div>
            )}
            {(!loading && !error && cursos.length === 0) && (
              <div style={{ padding: '16px', color: 'rgba(255,255,255,0.7)' }}>No hay cursos</div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px', width: 'min(720px, 92vw)', padding: '24px',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                {modalType === 'create' ? 'Nuevo Curso' : modalType === 'edit' ? 'Editar Curso' : 'Ver Curso'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Campos del formulario basados en la BD */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Código</label>
                  <input
                    name="codigo_curso"
                    defaultValue={selectedCurso?.codigo_curso || ''}
                    placeholder={modalType === 'create' ? 'Se genera automáticamente' : ''}
                    disabled={modalType === 'create'}
                    required={modalType !== 'create'}
                    style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                    <span>Tipo de curso</span>
                  </label>
                  <select name="id_tipo_curso" defaultValue={selectedCurso?.id_tipo_curso || ''} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }}>
                    <option value="" disabled>Selecciona un tipo</option>
                    {tiposCursos.map(tc => (
                      <option key={tc.id_tipo_curso} value={tc.id_tipo_curso}>{tc.codigo} - {tc.nombre}</option>
                    ))}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Nombre</label>
                  <input name="nombre" defaultValue={selectedCurso?.nombre || ''} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Descripción</label>
                  <textarea name="descripcion" defaultValue={selectedCurso?.descripcion || ''} rows={3} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Capacidad</label>
                  <input type="number" name="capacidad_maxima" defaultValue={selectedCurso?.capacidad_maxima || 20} min={1} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                    <span>Aula (opcional)</span>
                  </label>
                  <select name="id_aula" defaultValue={selectedCurso?.id_aula ?? ''} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }}>
                    <option value="">Sin asignar</option>
                    {aulas.map(a => (
                      <option key={a.id_aula} value={a.id_aula}>{a.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Fecha Inicio</label>
                  <input type="date" name="fecha_inicio" defaultValue={selectedCurso?.fecha_inicio || ''} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Fecha Fin</label>
                  <input type="date" name="fecha_fin" defaultValue={selectedCurso?.fecha_fin || ''} required style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Horario (opcional)</label>
                  <input name="horario" defaultValue={selectedCurso?.horario || ''} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>Estado</label>
                  <select name="estado" defaultValue={selectedCurso?.estado || 'planificado'} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', color: '#fff' }}>
                    <option value="planificado">Planificado</option>
                    <option value="activo">Activo</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                    {modalType === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCursos;
