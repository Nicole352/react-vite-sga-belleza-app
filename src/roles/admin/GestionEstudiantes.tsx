import React, { useState } from 'react';
import { 
  Users, Search, Plus, Edit, Eye, Trash2, X, UserCheck
} from 'lucide-react';

// Tipos
interface Admin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  estado: string;
  permisos: string[];
}

const GestionEstudiantes = () => {
  const [administrativos, setAdministrativos] = useState<Admin[]>([
    {
      id: 1, nombre: 'Lcda. Patricia', apellido: 'González',
      email: 'patricia.gonzalez@belleza.edu', telefono: '+58 414-123-4567',
      cargo: 'Coordinadora Académica', departamento: 'Académico',
      fechaIngreso: '2023-01-15', estado: 'activo',
      permisos: ['cursos', 'estudiantes', 'reportes']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');

  const administrativosFiltrados = administrativos.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.apellido.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || admin.estado === filterEstado;
    const matchesDepartamento = filterDepartamento === 'todos' || admin.departamento === filterDepartamento;
    return matchesSearch && matchesEstado && matchesDepartamento;
  });

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteAdmin = (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este administrativo?')) {
      setAdministrativos(administrativos.filter(admin => admin.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const adminData: Omit<Admin, 'id'> = {
      nombre: String(formData.get('nombre') || ''),
      apellido: String(formData.get('apellido') || ''),
      email: String(formData.get('email') || ''),
      telefono: String(formData.get('telefono') || ''),
      cargo: String(formData.get('cargo') || ''),
      departamento: String(formData.get('departamento') || ''),
      fechaIngreso: String(formData.get('fechaIngreso') || ''),
      estado: String(formData.get('estado') || 'activo'),
      permisos: (formData.getAll('permisos') as string[])
    };

    if (modalType === 'create') {
      const newAdmin: Admin = { 
        ...adminData, 
        id: administrativos.length ? Math.max(...administrativos.map(a => a.id)) + 1 : 1 
      };
      setAdministrativos([...administrativos, newAdmin]);
    } else if (modalType === 'edit') {
      setAdministrativos(administrativos.map(admin => 
        admin.id === selectedAdmin!.id ? { ...admin, ...adminData } : admin
      ));
    }
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ 
        color: '#fff', 
        fontSize: '2rem', 
        fontWeight: '700', 
        margin: '0 0 8px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <UserCheck size={32} color="#ef4444" />
        Gestión de Estudiantes
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 32px 0' }}>
        Administra el personal estudiantil y sus permisos de acceso
      </p>

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
                placeholder="Buscar estudiantes..."
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
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>

            <select
              value={filterDepartamento}
              onChange={(e) => setFilterDepartamento(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos los departamentos</option>
              <option value="Académico">Académico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Financiero">Financiero</option>
            </select>
          </div>

          {/* Botón Crear */}
          <button
            onClick={handleCreateAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {administrativosFiltrados.map(admin => (
          <div key={admin.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {admin.nombre} {admin.apellido}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                  {admin.cargo} - {admin.departamento}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Email:</strong> {admin.email}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Teléfono:</strong> {admin.telefono}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Ingreso:</strong> {new Date(admin.fechaIngreso).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: admin.estado === 'activo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: admin.estado === 'activo' ? '#10b981' : '#ef4444'
                }}>
                  {admin.estado.charAt(0).toUpperCase() + admin.estado.slice(1)}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewAdmin(admin)}
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
                    onClick={() => handleEditAdmin(admin)}
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
                    onClick={() => handleDeleteAdmin(admin.id)}
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

            {/* Permisos */}
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.05)', 
              borderRadius: '12px', 
              padding: '16px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>
                Permisos de Acceso
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {admin.permisos.map((permiso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.2)', 
                    color: '#10b981',
                    padding: '4px 8px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600'
                  }}>
                    {permiso}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Nuevo Estudiante' : 
                 modalType === 'edit' ? 'Editar Estudiante' : 'Detalles del Estudiante'}
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

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Nombre
                    </label>
                    <input
                      name="nombre"
                      type="text"
                      defaultValue={selectedAdmin?.nombre || ''}
                      disabled={modalType === 'view'}
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
                      Apellido
                    </label>
                    <input
                      name="apellido"
                      type="text"
                      defaultValue={selectedAdmin?.apellido || ''}
                      disabled={modalType === 'view'}
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

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={selectedAdmin?.email || ''}
                    disabled={modalType === 'view'}
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Teléfono
                    </label>
                    <input
                      name="telefono"
                      type="tel"
                      defaultValue={selectedAdmin?.telefono || ''}
                      disabled={modalType === 'view'}
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
                      Cargo
                    </label>
                    <input
                      name="cargo"
                      type="text"
                      defaultValue={selectedAdmin?.cargo || ''}
                      disabled={modalType === 'view'}
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
                      {modalType === 'create' ? 'Crear Estudiante' : 'Guardar Cambios'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEstudiantes;
