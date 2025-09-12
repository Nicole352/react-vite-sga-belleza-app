import React, { useState } from 'react';
import { 
  Search, Plus, Edit, X, UserCheck, Save
} from 'lucide-react';

const GestionDocentes = () => {
  const [profesores, setProfesores] = useState([
    {
      id: 1, nombre: 'Dr. Carlos', apellido: 'Mendoza', cedula: '15678901',
      email: 'carlos.mendoza@bellezaacademia.edu', telefono: '+58 412-345-6789',
      especialidad: 'Cosmetología Avanzada', experiencia: '8 años',
      cursosAsignados: ['Cosmetología Básica', 'Tratamientos Faciales'],
      estado: 'activo', fechaIngreso: '2020-03-15'
    },
    {
      id: 2, nombre: 'Lic. María', apellido: 'González', cedula: '26789012',
      email: 'maria.gonzalez@bellezaacademia.edu', telefono: '+58 424-567-8901',
      especialidad: 'Peluquería Profesional', experiencia: '12 años',
      cursosAsignados: ['Peluquería Profesional', 'Colorimetría'],
      estado: 'activo', fechaIngreso: '2018-08-20'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cursosDisponibles = [
    'Cosmetología Básica', 'Cosmetología Avanzada', 'Peluquería Profesional',
    'Manicure y Pedicure', 'Tratamientos Faciales', 'Colorimetría',
    'Barbería Moderna', 'Maquillaje Profesional'
  ];

  const profesoresFiltrados = profesores.filter(profesor => {
    const matchesSearch = profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesor.cedula.includes(searchTerm);
    return matchesSearch;
  });

  const handleCreateProfesor = () => {
    setSelectedProfesor(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditProfesor = (profesor) => {
    setSelectedProfesor(profesor);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cursosSeleccionados = Array.from(formData.getAll('cursos'));
    
    const profesorData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      cedula: formData.get('cedula'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      especialidad: formData.get('especialidad'),
      experiencia: formData.get('experiencia'),
      cursosAsignados: cursosSeleccionados,
      estado: 'activo',
      fechaIngreso: formData.get('fechaIngreso') || new Date().toISOString().split('T')[0]
    };

    if (modalType === 'create') {
      const newProfesor = {
        ...profesorData,
        id: Math.max(...profesores.map(p => p.id)) + 1
      };
      setProfesores([...profesores, newProfesor]);
    } else if (modalType === 'edit') {
      setProfesores(profesores.map(profesor => 
        profesor.id === selectedProfesor.id 
          ? { ...profesor, ...profesorData }
          : profesor
      ));
    }
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <UserCheck size={32} color="#ef4444" />
          Gestión de Docentes
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra profesores y asignación de cursos
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text" placeholder="Buscar por nombre o cédula..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <button
            onClick={handleCreateProfesor}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
              borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Docente
          </button>
        </div>
      </div>

      {/* Lista de Profesores */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {profesoresFiltrados.map(profesor => (
          <div key={profesor.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {profesor.nombre} {profesor.apellido}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Especialidad</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.especialidad}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Experiencia</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.experiencia}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.email}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditProfesor(profesor)}
                  style={{
                    padding: '8px', background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px',
                    color: '#f59e0b', cursor: 'pointer'
                  }}
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            {/* Cursos Asignados */}
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600', margin: '0 0 12px 0' }}>
                Cursos Asignados ({profesor.cursosAsignados.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profesor.cursosAsignados.map((curso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600'
                  }}>
                    {curso}
                  </div>
                ))}
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
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Nuevo Docente' : 'Editar Docente'}
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
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nombre</label>
                  <input
                    type="text" name="nombre" required
                    defaultValue={selectedProfesor?.nombre || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Apellido</label>
                  <input
                    type="text" name="apellido" required
                    defaultValue={selectedProfesor?.apellido || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Especialidad</label>
                <input
                  type="text" name="especialidad" required
                  defaultValue={selectedProfesor?.especialidad || ''}
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Cursos a Asignar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {cursosDisponibles.map(curso => (
                    <label key={curso} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox" name="cursos" value={curso}
                        defaultChecked={selectedProfesor?.cursosAsignados?.includes(curso) || false}
                        style={{ accentColor: '#ef4444' }}
                      />
                      {curso}
                    </label>
                  ))}
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
                  {modalType === 'create' ? 'Crear Docente' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDocentes;
