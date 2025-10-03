import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, X, MapPin, Save, Calendar, Clock, Users, AlertCircle
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

const API_BASE = 'http://localhost:3000';

type EstadoAsignacion = 'activa' | 'inactiva' | 'cancelada';
type EstadoFiltro = 'todas' | EstadoAsignacion;

interface Asignacion {
  id_asignacion: number;
  id_aula: number;
  id_curso: number;
  id_docente: number;
  hora_inicio: string;
  hora_fin: string;
  dias: string;
  estado: EstadoAsignacion;
  observaciones?: string;
  // Datos relacionados
  codigo_aula: string;
  aula_nombre: string;
  ubicacion?: string;
  codigo_curso: string;
  curso_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima: number;
  tipo_curso_nombre: string;
  docente_nombres: string;
  docente_apellidos: string;
  estudiantes_matriculados: number;
  porcentaje_ocupacion: number;
}

interface Aula {
  id_aula: number;
  codigo_aula: string;
  nombre: string;
  ubicacion?: string;
  estado: string;
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima: number;
  estado: string;
}

interface Docente {
  id_docente: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  estado: string;
}

const AsignacionAula: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('activa');
  const [saving, setSaving] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Función para formatear fechas: 03/Oct/2025
  const formatearFecha = (fecha: string): string => {
    if (!fecha) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar asignaciones
      const params = new URLSearchParams();
      if (filtroEstado !== 'todas') {
        params.set('estado', filtroEstado);
      }
      params.set('limit', '100');

      const [asignacionesRes, aulasRes, cursosRes, docentesRes] = await Promise.all([
        fetch(`${API_BASE}/api/asignaciones-aulas?${params.toString()}`),
        fetch(`${API_BASE}/api/aulas?limit=100`),
        fetch(`${API_BASE}/api/cursos?limit=100`),
        fetch(`${API_BASE}/api/docentes?limit=100`)
      ]);

      if (!asignacionesRes.ok) throw new Error('Error cargando asignaciones');
      if (!aulasRes.ok) throw new Error('Error cargando aulas');
      if (!cursosRes.ok) throw new Error('Error cargando cursos');
      if (!docentesRes.ok) throw new Error('Error cargando docentes');

      const asignacionesData = await asignacionesRes.json();
      const aulasData = await aulasRes.json();
      const cursosData = await cursosRes.json();
      const docentesData = await docentesRes.json();

      console.log('📊 Datos cargados:', {
        asignaciones: asignacionesData,
        aulas: aulasData,
        cursos: cursosData,
        docentes: docentesData
      });

      // Manejar diferentes formatos de respuesta
      const asignacionesList = asignacionesData.asignaciones || [];
      const aulasList = aulasData.aulas || [];
      const cursosList = Array.isArray(cursosData) ? cursosData : (cursosData.cursos || []);
      const docentesList = Array.isArray(docentesData) ? docentesData : (docentesData.docentes || []);

      setAsignaciones(asignacionesList);
      setAulas(aulasList);
      setCursos(cursosList);
      setDocentes(docentesList);
      
      console.log('✅ Estados actualizados:', {
        totalAsignaciones: asignacionesList.length,
        totalAulas: aulasList.length,
        totalCursos: cursosList.length,
        totalDocentes: docentesList.length,
        docentesActivos: docentesList.filter((d: any) => d.estado === 'activo').length
      });
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const asignacionesFiltradas = asignaciones.filter((asignacion: Asignacion) => {
    const matchesSearch = asignacion.aula_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.docente_nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.docente_apellidos.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateAsignacion = () => {
    setSelectedAsignacion(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditAsignacion = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const diasSeleccionados = Array.from(formData.getAll('dias')) as string[];
    
    if (diasSeleccionados.length === 0) {
      alert('Debe seleccionar al menos un día de clase');
      return;
    }

    const horaInicio = String(formData.get('hora_inicio') || '');
    const horaFin = String(formData.get('hora_fin') || '');
    
    const asignacionData = {
      id_aula: Number(formData.get('id_aula')),
      id_curso: Number(formData.get('id_curso')),
      id_docente: Number(formData.get('id_docente')),
      hora_inicio: `${horaInicio}:00`,
      hora_fin: `${horaFin}:00`,
      dias: diasSeleccionados.join(','),
      observaciones: String(formData.get('observaciones') || '')
    };

    try {
      setSaving(true);
      
      if (modalType === 'create') {
        const res = await fetch(`${API_BASE}/api/asignaciones-aulas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacionData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error creando asignación');
        }

        alert('Asignación creada exitosamente');
      } else if (modalType === 'edit' && selectedAsignacion) {
        const res = await fetch(`${API_BASE}/api/asignaciones-aulas/${selectedAsignacion.id_asignacion}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacionData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error actualizando asignación');
        }

        alert('Asignación actualizada exitosamente');
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('Error guardando asignación:', err);
      alert(err.message || 'Error guardando asignación');
    } finally {
      setSaving(false);
    }
  };

  const getOcupacionColor = (inscritos: number, capacidad: number) => {
    const porcentaje = (inscritos / capacidad) * 100;
    if (porcentaje >= 90) return '#ef4444';
    if (porcentaje >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <MapPin size={32} color="#ef4444" />
          Asignación de Aulas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Gestiona la asignación de aulas, horarios y profesores
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text" placeholder="Buscar por aula, curso o profesor..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '12px 12px 12px 44px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px', color: '#fff', fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <StyledSelect
                name="filtroEstado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
                options={[
                  { value: 'todas', label: 'Todas' },
                  { value: 'activa', label: 'Activas' },
                  { value: 'inactiva', label: 'Inactivas' },
                ]}
              />
            </div>
          </div>
          <button
            onClick={handleCreateAsignacion}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
              borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          Cargando asignaciones...
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px', padding: '16px', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Lista de Asignaciones */}
      {!loading && !error && (
        <div style={{ display: 'grid', gap: '20px' }}>
          {asignacionesFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
              No se encontraron asignaciones
            </div>
          ) : (
            asignacionesFiltradas.map(asignacion => (
              <div key={asignacion.id_asignacion} style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                        {asignacion.aula_nombre}
                      </h3>
                      <div style={{
                        background: asignacion.estado === 'activa' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                        color: asignacion.estado === 'activa' ? '#10b981' : '#9ca3af',
                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600'
                      }}>
                        {asignacion.estado}
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{asignacion.curso_nombre}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Docente</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{asignacion.docente_nombres} {asignacion.docente_apellidos}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Horario</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          {asignacion.hora_inicio.substring(0, 5)} - {asignacion.hora_fin.substring(0, 5)}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Período</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} />
                          {formatearFecha(asignacion.fecha_inicio)} - {formatearFecha(asignacion.fecha_fin)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleEditAsignacion(asignacion)}
                    style={{
                      padding: '8px', background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px',
                      color: '#f59e0b', cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                </div>

                {/* Días y Ocupación */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '8px' }}>Días de Clase</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {asignacion.dias.split(',').map((dia: string, idx: number) => (
                        <div key={idx} style={{
                          background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6',
                          padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600'
                        }}>
                          {dia}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '8px' }}>Ocupación</div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px',
                      color: getOcupacionColor(asignacion.estudiantes_matriculados, asignacion.capacidad_maxima),
                      fontSize: '1.1rem', fontWeight: '700'
                    }}>
                      <Users size={18} />
                      {asignacion.estudiantes_matriculados}/{asignacion.capacidad_maxima}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
                      marginTop: '4px'
                    }}>
                      {asignacion.porcentaje_ocupacion}% ocupado
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '700px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Nueva Asignación' : 'Editar Asignación'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Aula</label>
                  <StyledSelect
                    name="id_aula"
                    required
                    defaultValue={selectedAsignacion?.id_aula || ''}
                    placeholder="Seleccionar aula"
                    options={aulas.filter(a => a.estado === 'activa').map(a => ({ 
                      value: a.id_aula, 
                      label: `${a.nombre} - ${a.ubicacion || 'Sin ubicación'}` 
                    }))}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Curso</label>
                  <StyledSelect
                    name="id_curso"
                    required
                    defaultValue={selectedAsignacion?.id_curso || ''}
                    placeholder="Seleccionar curso"
                    options={cursos.filter(c => c.estado === 'activo' || c.estado === 'planificado').map(c => ({ 
                      value: c.id_curso, 
                      label: `${c.nombre} (${formatearFecha(c.fecha_inicio)} - ${formatearFecha(c.fecha_fin)})` 
                    }))}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Docente {docentes.length > 0 && `(${docentes.filter(d => d.estado === 'activo').length} disponibles)`}
                </label>
                {docentes.length === 0 ? (
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.9rem'
                  }}>
                    No hay docentes disponibles. Por favor, cree docentes primero.
                  </div>
                ) : (
                  <StyledSelect
                    name="id_docente"
                    required
                    defaultValue={selectedAsignacion?.id_docente || ''}
                    placeholder="Seleccionar docente"
                    options={docentes.filter(d => d.estado === 'activo').map(d => ({ 
                      value: d.id_docente, 
                      label: `${d.nombres} ${d.apellidos}` 
                    }))}
                  />
                )}
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Días de Clase</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {diasSemana.map(dia => {
                    const diasArray = selectedAsignacion?.dias?.split(',') || [];
                    return (
                      <label key={dia} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox" name="dias" value={dia}
                          defaultChecked={diasArray.includes(dia)}
                          style={{ accentColor: '#ef4444' }}
                        />
                        {dia}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Hora Inicio</label>
                  <input
                    type="time" name="hora_inicio" required
                    defaultValue={selectedAsignacion?.hora_inicio?.substring(0, 5) || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Hora Fin</label>
                  <input
                    type="time" name="hora_fin" required
                    defaultValue={selectedAsignacion?.hora_fin?.substring(0, 5) || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Observaciones (opcional)</label>
                <textarea
                  name="observaciones"
                  rows={3}
                  defaultValue={selectedAsignacion?.observaciones || ''}
                  placeholder="Notas adicionales sobre la asignación..."
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: saving ? 'rgba(156, 163, 175, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : (modalType === 'create' ? 'Crear Asignación' : 'Guardar Cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignacionAula;
