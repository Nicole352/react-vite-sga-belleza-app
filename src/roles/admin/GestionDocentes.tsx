import { useState, useEffect } from 'react';
import { 
  Search, Eye, UserCheck, Calendar, Phone, Mail, User, X, Plus, Edit
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

// Tipos
interface Docente {
  id_docente: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: string;
  telefono?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  titulo_profesional: string;
  gmail?: string;
  username?: string;
  password_temporal?: string;
  experiencia_anos: number;
  estado: 'activo' | 'inactivo';
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionDocentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [previewUsername, setPreviewUsername] = useState('');

  // Función para obtener docentes
  const fetchDocentes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`${API_BASE}/api/docentes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error cargando docentes');
      }
      
      const data = await response.json();
      const headerVal = response.headers.get('X-Total-Count');
      const totalHeader = headerVal !== null ? Number(headerVal) : NaN;

      const computedTotal = Number.isFinite(totalHeader) && totalHeader >= 0
        ? totalHeader
        : (typeof data?.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0));

      setDocentes(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []));
      setTotalCount(computedTotal);
    } catch (err: any) {
      setError(err.message || 'Error cargando docentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, [page, limit, searchTerm]);

  const docentesFiltrados = docentes.filter(docente => {
    const matchesEstado = filterEstado === 'todos' || docente.estado === filterEstado;
    return matchesEstado;
  });

  const handleViewDocente = (docente: Docente) => {
    setSelectedDocente(docente);
    setModalMode('view');
    setShowModal(true);
  };

  // Función para generar preview del username
  const generateUsernamePreview = (nombres: string, apellidos: string) => {
    if (!nombres.trim() || !apellidos.trim()) {
      return '';
    }
    
    try {
      // Extraer iniciales del nombre (todas las palabras)
      const nombreParts = nombres.trim().split(' ').filter(part => part.length > 0);
      const inicialesNombre = nombreParts.map(part => part.charAt(0).toLowerCase()).join('');
      
      // Extraer primer apellido
      const apellidoParts = apellidos.trim().split(' ').filter(part => part.length > 0);
      const primerApellido = apellidoParts[0]?.toLowerCase() || '';
      
      // Crear username base
      return inicialesNombre + primerApellido;
    } catch (error) {
      return '';
    }
  };

  // Función para convertir texto a MAYÚSCULAS
  const toUpperCase = (text: string) => {
    return text.toUpperCase();
  };

  // Función para permitir solo números en teléfono
  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
  };

  // Función para convertir email a minúsculas
  const formatEmail = (value: string) => {
    return value.toLowerCase();
  };

  // Función para manejar cambios en los campos de nombre
  const handleNameChange = (nombres: string, apellidos: string) => {
    const preview = generateUsernamePreview(nombres, apellidos);
    setPreviewUsername(preview);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const docenteData = {
      identificacion: formData.get('identificacion') as string,
      nombres: formData.get('nombres') as string,
      apellidos: formData.get('apellidos') as string,
      fecha_nacimiento: formData.get('fecha_nacimiento') as string || null,
      telefono: formData.get('telefono') as string || null,
      genero: formData.get('genero') as string || null,
      direccion: formData.get('direccion') as string || null,
      titulo_profesional: formData.get('titulo_profesional') as string,
      gmail: formData.get('gmail') as string || null,
      experiencia_anos: parseInt(formData.get('experiencia_anos') as string) || 0,
      estado: formData.get('estado') as string || 'activo'
    };

    try {
      setSubmitting(true);
      setError(null);
      
      const url = modalMode === 'edit' 
        ? `${API_BASE}/api/docentes/${selectedDocente?.id_docente}`
        : `${API_BASE}/api/docentes`;
      
      const method = modalMode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docenteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar docente');
      }

      const result = await response.json();
      
      // Mostrar credenciales si es un nuevo docente
      if (modalMode === 'create' && result.docente?.username && result.docente?.password_temporal) {
        alert(`¡Docente creado exitosamente!\n\nCredenciales de acceso:\nUsuario: ${result.docente.username}\nContraseña temporal: ${result.docente.password_temporal}\n\nGuarde estas credenciales para entregar al docente.`);
      }

      setShowModal(false);
      setSelectedDocente(null);
      setPreviewUsername('');
      fetchDocentes();
    } catch (err: any) {
      setError(err.message || 'Error al guardar docente');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)', 
      padding: 32, 
      color: '#fff' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <UserCheck size={28} color="#ef4444" />
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Gestión de Docentes</h1>
        </div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          Administra y visualiza la información de todos los docentes registrados
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 16, 
        padding: 24, 
        marginBottom: 24,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'end' }}>
          {/* Búsqueda */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Buscar Docente
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Estado
            </label>
            <StyledSelect
              name="filterEstado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos los estados' },
                { value: 'activo', label: 'Activos' },
                { value: 'inactivo', label: 'Inactivos' }
              ]}
            />
          </div>

          {/* Botón Nuevo Docente */}
          <button 
            onClick={() => {
              setSelectedDocente(null);
              setModalMode('create');
              setPreviewUsername('');
              setShowModal(true);
            }}
            style={{ 
              padding: '12px 20px', 
              borderRadius: 10, 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              background: 'rgba(239, 68, 68, 0.15)', 
              color: '#ef4444', 
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Nuevo Docente
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: 12, 
          padding: 20, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', marginBottom: 4 }}>
            {totalCount}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Total Docentes
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: 12, 
          padding: 20, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: 4 }}>
            {docentes.filter(d => d.estado === 'activo').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Docentes Activos
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 24, 
          color: '#ef4444' 
        }}>
          {error}
        </div>
      )}

      {/* Tabla de Docentes */}
      <div style={{ 
        background: 'rgba(255,255,255,0.05)', 
        borderRadius: 16, 
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Docente
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Identificación
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Usuario
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Título Profesional
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Estado
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Experiencia
                </th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {docentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                    {loading ? 'Cargando docentes...' : 'No hay docentes registrados'}
                  </td>
                </tr>
              ) : (
                docentesFiltrados.map((docente, index) => (
                  <tr key={docente.id_docente} style={{ 
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: 'rgba(239, 68, 68, 0.2)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <User size={18} color="#ef4444" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>
                            {docente.nombres} {docente.apellidos}
                          </div>
                          {docente.telefono && (
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                              {docente.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {docente.identificacion}
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {docente.username ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={14} color="#3b82f6" />
                          <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                            {docente.username}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                          Sin usuario
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {docente.titulo_profesional}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: docente.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: docente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: docente.estado === 'activo' ? '#10b981' : '#ef4444'
                      }}>
                        {docente.estado}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {docente.experiencia_anos} años
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleViewDocente(docente)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#3b82f6',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye size={12} />
                          Ver
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocente(docente);
                            setModalMode('edit');
                            setShowModal(true);
                          }}
                          style={{
                            background: 'rgba(251, 191, 36, 0.15)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#fbbf24',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit size={12} />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ 
            padding: '16px 24px', 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount)} de {totalCount} docentes
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: page === 1 ? 'rgba(255,255,255,0.4)' : '#fff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Anterior
              </button>
              <span style={{ 
                padding: '8px 12px', 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.8rem' 
              }}>
                {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  color: page === totalPages ? 'rgba(255,255,255,0.4)' : '#fff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(0,0,0,0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 16, 
            width: 'min(700px, 90vw)', 
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 24, 
            color: '#fff' 
          }}>
            {/* Header del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={20} />
                {modalMode === 'view' ? 'Información del Docente' : 
                 modalMode === 'create' ? 'Crear Nuevo Docente' : 'Editar Docente'}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === 'view' && selectedDocente ? (
              /* Vista de solo lectura */
              <div>
                {/* Credenciales de Acceso */}
                {(selectedDocente.username || selectedDocente.password_temporal) && (
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: 12, 
                    padding: 16, 
                    marginBottom: 20 
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#3b82f6', fontSize: '1rem', fontWeight: '600' }}>
                      🔐 Credenciales de Acceso
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {selectedDocente.username && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4 }}>Usuario</div>
                          <div style={{ color: '#fff', fontWeight: '600', fontFamily: 'monospace' }}>{selectedDocente.username}</div>
                        </div>
                      )}
                      {selectedDocente.password_temporal && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4 }}>Contraseña Temporal</div>
                          <div style={{ color: '#fff', fontWeight: '600', fontFamily: 'monospace' }}>{selectedDocente.password_temporal}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Información Personal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Nombres</div>
                  <div style={{ color: '#fff', fontWeight: '600' }}>{selectedDocente.nombres}</div>
                </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Apellidos</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{selectedDocente.apellidos}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Identificación</div>
                <div style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedDocente.identificacion}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Título Profesional</div>
                <div style={{ color: '#fff' }}>{selectedDocente.titulo_profesional}</div>
              </div>
              {selectedDocente.telefono && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#10b981" />
                    {selectedDocente.telefono}
                  </div>
                </div>
              )}
              {selectedDocente.gmail && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Email</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#3b82f6" />
                    {selectedDocente.gmail}
                  </div>
                </div>
              )}
              {selectedDocente.fecha_nacimiento && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#fbbf24" />
                    {formatDate(selectedDocente.fecha_nacimiento)}
                  </div>
                </div>
              )}
              {selectedDocente.genero && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Género</div>
                  <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selectedDocente.genero}</div>
                </div>
              )}
              {selectedDocente.direccion && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Dirección</div>
                  <div style={{ color: '#fff' }}>{selectedDocente.direccion}</div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Experiencia</div>
                <div style={{ color: '#fff' }}>{selectedDocente.experiencia_anos} años</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Estado</div>
                <span style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  background: selectedDocente.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: selectedDocente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: selectedDocente.estado === 'activo' ? '#10b981' : '#ef4444'
                }}>
                  {selectedDocente.estado}
                </span>
              </div>
              </div>
              </div>
            ) : (
              /* Formulario de Crear/Editar */
              <form onSubmit={handleSubmit}>
                {modalMode === 'create' && (
                  <div style={{ 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 20, 
                    color: '#3b82f6',
                    fontSize: '0.9rem'
                  }}>
                    ℹ️ <strong>Credenciales automáticas:</strong> El sistema generará automáticamente un username único (iniciales + apellido) y usará la identificación como contraseña temporal.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  {/* Identificación */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Identificación *
                    </label>
                    <input
                      type="text"
                      name="identificacion"
                      required
                      defaultValue={selectedDocente?.identificacion || ''}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Nombres */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Nombres *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      required
                      defaultValue={selectedDocente?.nombres || ''}
                      onChange={(e) => {
                        // Aplicar formato MAYÚSCULAS automáticamente
                        const formattedValue = toUpperCase(e.target.value);
                        e.target.value = formattedValue;
                        
                        const apellidosInput = document.querySelector('input[name="apellidos"]') as HTMLInputElement;
                        handleNameChange(formattedValue, apellidosInput?.value || '');
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      required
                      defaultValue={selectedDocente?.apellidos || ''}
                      onChange={(e) => {
                        // Aplicar formato MAYÚSCULAS automáticamente
                        const formattedValue = toUpperCase(e.target.value);
                        e.target.value = formattedValue;
                        
                        const nombresInput = document.querySelector('input[name="nombres"]') as HTMLInputElement;
                        handleNameChange(nombresInput?.value || '', formattedValue);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Título Profesional */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Título Profesional *
                    </label>
                    <input
                      type="text"
                      name="titulo_profesional"
                      required
                      defaultValue={selectedDocente?.titulo_profesional || ''}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="gmail"
                      defaultValue={selectedDocente?.gmail || ''}
                      onChange={(e) => {
                        // Convertir automáticamente a minúsculas
                        const formattedValue = formatEmail(e.target.value);
                        e.target.value = formattedValue;
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      defaultValue={selectedDocente?.telefono || ''}
                      onChange={(e) => {
                        // Permitir solo números
                        const formattedValue = formatPhoneNumber(e.target.value);
                        e.target.value = formattedValue;
                      }}
                      onKeyPress={(e) => {
                        // Prevenir entrada de caracteres no numéricos
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      defaultValue={selectedDocente?.fecha_nacimiento || ''}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Género */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Género
                    </label>
                    <select
                      name="genero"
                      defaultValue={selectedDocente?.genero || ''}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Seleccionar</option>
                      <option value="masculino" style={{ background: '#1a1a2e', color: '#fff' }}>Masculino</option>
                      <option value="femenino" style={{ background: '#1a1a2e', color: '#fff' }}>Femenino</option>
                      <option value="otro" style={{ background: '#1a1a2e', color: '#fff' }}>Otro</option>
                    </select>
                  </div>

                  {/* Experiencia */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Experiencia (años)
                    </label>
                    <input
                      type="number"
                      name="experiencia_anos"
                      min="0"
                      defaultValue={selectedDocente?.experiencia_anos || 0}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Estado
                    </label>
                    <select
                      name="estado"
                      defaultValue={selectedDocente?.estado || 'activo'}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="activo" style={{ background: '#1a1a2e', color: '#fff' }}>Activo</option>
                      <option value="inactivo" style={{ background: '#1a1a2e', color: '#fff' }}>Inactivo</option>
                    </select>
                  </div>

                  {/* Dirección */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      Dirección
                    </label>
                    <textarea
                      name="direccion"
                      rows={3}
                      defaultValue={selectedDocente?.direccion || ''}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Usuario Generado - Solo en modo crear */}
                {modalMode === 'create' && previewUsername && (
                  <div style={{ 
                    marginTop: 16, 
                    background: 'rgba(239, 68, 68, 0.05)', 
                    border: '1px solid rgba(239, 68, 68, 0.15)', 
                    borderRadius: 12, 
                    padding: 16 
                  }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}>
                      <User size={18} color="#ef4444" />
                      Usuario Generado Automáticamente
                    </h4>
                    <div style={{ 
                      color: '#ef4444', 
                      fontSize: '1.2rem',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      marginBottom: '8px'
                    }}>
                      {previewUsername}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.85rem'
                    }}>
                      Generado a partir de las iniciales del nombre + primer apellido
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 16, 
                    color: '#ef4444',
                    fontSize: '0.9rem'
                  }}>
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(156, 163, 175, 0.15)',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      color: '#9ca3af',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: submitting ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: submitting ? 'rgba(239, 68, 68, 0.6)' : '#ef4444',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear Docente' : 'Actualizar')}
                  </button>
                </div>
              </form>
            )}

            {/* Botón Cerrar solo para vista */}
            {modalMode === 'view' && (
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(156, 163, 175, 0.15)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: '#9ca3af',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionDocentes;
