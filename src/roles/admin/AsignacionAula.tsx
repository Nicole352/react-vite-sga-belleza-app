import React, { useState } from 'react';
import { 
  Search, Plus, Edit, X, MapPin, Save, Calendar, Clock, Users
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

type EstadoAsignacion = 'activa' | 'inactiva';
type EstadoFiltro = 'todas' | EstadoAsignacion;

type Asignacion = {
  id: number;
  aula: string;
  curso: string;
  profesor: string;
  horario: string;
  dias: string[];
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
  capacidad: number;
  estudiantesInscritos: number;
  estado: EstadoAsignacion;
};

const AsignacionAula: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([
    {
      id: 1, aula: 'Aula 101', curso: 'Cosmetología Básica', profesor: 'Dr. Carlos Mendoza',
      horario: '08:00 - 12:00', dias: ['Lunes', 'Miércoles', 'Viernes'],
      fechaInicio: '2024-02-01', fechaFin: '2024-05-30', capacidad: 20,
      estudiantesInscritos: 18, estado: 'activa'
    },
    {
      id: 2, aula: 'Aula 102', curso: 'Peluquería Profesional', profesor: 'Lic. María González',
      horario: '14:00 - 18:00', dias: ['Martes', 'Jueves'],
      fechaInicio: '2024-02-01', fechaFin: '2024-05-30', capacidad: 15,
      estudiantesInscritos: 12, estado: 'activa'
    },
    {
      id: 3, aula: 'Aula 103', curso: 'Maquillaje Profesional', profesor: 'Lic. Ana Rodríguez',
      horario: '09:00 - 13:00', dias: ['Lunes', 'Miércoles'],
      fechaInicio: '2024-03-01', fechaFin: '2024-06-30', capacidad: 12,
      estudiantesInscritos: 10, estado: 'activa'
    }
  ]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todas');

  const aulas = ['Aula 101', 'Aula 102', 'Aula 103', 'Aula 201', 'Aula 202', 'Laboratorio A', 'Laboratorio B'];
  const cursos = ['Cosmetología Básica', 'Cosmetología Avanzada', 'Peluquería Profesional', 'Maquillaje Profesional', 'Manicure y Pedicure', 'Barbería Moderna'];
  const profesores = ['Dr. Carlos Mendoza', 'Lic. María González', 'Lic. Ana Rodríguez', 'Prof. Luis Martínez'];
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const asignacionesFiltradas = asignaciones.filter((asignacion: Asignacion) => {
    const matchesSearch = asignacion.aula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.curso.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.profesor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filtroEstado === 'todas' || asignacion.estado === filtroEstado;
    return matchesSearch && matchesEstado;
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const diasSeleccionados = Array.from(formData.getAll('dias')) as string[];
    
    const asignacionData: Omit<Asignacion, 'id'> = {
      aula: String(formData.get('aula') || ''),
      curso: String(formData.get('curso') || ''),
      profesor: String(formData.get('profesor') || ''),
      horario: String(formData.get('horario') || ''),
      dias: diasSeleccionados,
      fechaInicio: String(formData.get('fechaInicio') || ''),
      fechaFin: String(formData.get('fechaFin') || ''),
      capacidad: Number(formData.get('capacidad') || 0),
      estudiantesInscritos: Number(formData.get('estudiantesInscritos') || 0),
      estado: 'activa',
    };

    if (modalType === 'create') {
      const nextId = Math.max(0, ...asignaciones.map((a) => a.id)) + 1;
      const newAsignacion: Asignacion = {
        ...asignacionData,
        id: nextId,
      };
      setAsignaciones([...asignaciones, newAsignacion]);
    } else if (modalType === 'edit') {
      if (!selectedAsignacion) return;
      setAsignaciones(asignaciones.map((asignacion) =>
        asignacion.id === selectedAsignacion.id
          ? { ...asignacion, ...asignacionData }
          : asignacion
      ));
    }
    setShowModal(false);
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

      {/* Lista de Asignaciones */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {asignacionesFiltradas.map(asignacion => (
          <div key={asignacion.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                    {asignacion.aula}
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
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{asignacion.curso}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Profesor</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{asignacion.profesor}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Horario</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {asignacion.horario}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Período</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      {asignacion.fechaInicio} - {asignacion.fechaFin}
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
                  {asignacion.dias.map((dia, idx) => (
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
                  color: getOcupacionColor(asignacion.estudiantesInscritos, asignacion.capacidad),
                  fontSize: '1.1rem', fontWeight: '700'
                }}>
                  <Users size={18} />
                  {asignacion.estudiantesInscritos}/{asignacion.capacidad}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem',
                  marginTop: '4px'
                }}>
                  {Math.round((asignacion.estudiantesInscritos / asignacion.capacidad) * 100)}% ocupado
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                    name="aula"
                    required
                    defaultValue={selectedAsignacion?.aula || ''}
                    placeholder="Seleccionar aula"
                    options={aulas.map(a => ({ value: a, label: a }))}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Curso</label>
                  <StyledSelect
                    name="curso"
                    required
                    defaultValue={selectedAsignacion?.curso || ''}
                    placeholder="Seleccionar curso"
                    options={cursos.map(c => ({ value: c, label: c }))}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Profesor</label>
                <StyledSelect
                  name="profesor"
                  required
                  defaultValue={selectedAsignacion?.profesor || ''}
                  placeholder="Seleccionar profesor"
                  options={profesores.map(p => ({ value: p, label: p }))}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Días de Clase</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {diasSemana.map(dia => (
                    <label key={dia} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox" name="dias" value={dia}
                        defaultChecked={selectedAsignacion?.dias?.includes(dia) || false}
                        style={{ accentColor: '#ef4444' }}
                      />
                      {dia}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Horario</label>
                  <input
                    type="text" name="horario" required placeholder="08:00 - 12:00"
                    defaultValue={selectedAsignacion?.horario || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Capacidad</label>
                  <input
                    type="number" name="capacidad" required min="1"
                    defaultValue={selectedAsignacion?.capacidad || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Inscritos</label>
                  <input
                    type="number" name="estudiantesInscritos" min="0"
                    defaultValue={selectedAsignacion?.estudiantesInscritos || '0'}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Fecha Inicio</label>
                  <input
                    type="date" name="fechaInicio" required
                    defaultValue={selectedAsignacion?.fechaInicio || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Fecha Fin</label>
                  <input
                    type="date" name="fechaFin" required
                    defaultValue={selectedAsignacion?.fechaFin || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
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
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <Save size={16} />
                  {modalType === 'create' ? 'Crear Asignación' : 'Guardar Cambios'}
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
