import { useState, useEffect } from 'react';
import {
  Search, Eye, UserCheck, Calendar, Phone, Mail, User, X, Plus, Edit, CheckCircle2, Lock, Info, Grid, List, ChevronLeft, ChevronRight, IdCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

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
  const { isMobile, isSmallScreen } = useBreakpoints();

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
  const [limit] = useState(3); // 3 docentes por página
  const [totalCount, setTotalCount] = useState(0);
  const [previewUsername, setPreviewUsername] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  const docentesFiltrados = docentes
    .filter(docente => {
      const matchesEstado = filterEstado === 'todos' || docente.estado === filterEstado;
      return matchesEstado;
    })
    .sort((a, b) => {
      // Ordenar por ID (más antiguos primero - los que se registraron primero)
      return a.id_docente - b.id_docente;
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
        toast.success(
          <div style={{ lineHeight: '1.6' }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={20} />
              Docente creado exitosamente
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.375rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Credenciales de acceso:</div>
                <div><strong>Usuario:</strong> {result.docente.username}</div>
                <div style={{ color: '#fbbf24', fontWeight: '600' }}>
                  <strong>Contraseña temporal:</strong> {result.docente.password_temporal}
                </div>
              </div>
              <div style={{ marginTop: '0.375rem', fontSize: '0.85rem', opacity: 0.8 }}>Guarde estas credenciales para entregar al docente.</div>
            </div>
          </div>,
          {
            duration: 10000,
            style: {
              minWidth: 'min(28.125rem, 90vw)',
            },
            icon: <CheckCircle2 size={24} />,
          }
        );
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

  // const totalPages = Math.ceil(totalCount / limit); // Para uso futuro en paginación

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
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
      color: '#fff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '0.75rem' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.375rem' : '0.625rem'
        }}>
          <UserCheck size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Gestión de Docentes
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem'
        }}>
          Administra y visualiza la información de todos los docentes registrados
        </p>
      </div>

      {/* Controles */}
      <GlassEffect variant="card" tint="neutral" intensity="light" style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem',
            alignItems: isMobile ? 'stretch' : 'center',
            flex: 1
          }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', minWidth: isMobile ? 'auto' : '17.5rem', flex: isMobile ? '1' : 'initial' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar por nombre, apellido, identificación..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 0.625rem 0.625rem 2.375rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625rem',
                  color: '#fff',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            {/* Filtros */}
            <div style={{ minWidth: isMobile ? 'auto' : 'min(12.5rem, 25vw)', flex: isMobile ? '1' : 'initial' }}>
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

            {/* Toggle Vista */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.625rem',
              padding: '0.1875rem',
              width: isSmallScreen ? '100%' : 'auto'
            }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3125rem',
                  padding: isMobile ? '7px 0.625rem' : '7px 0.75rem',
                  background: viewMode === 'cards' ? mapToRedScheme('rgba(59, 130, 246, 0.2)') : 'transparent',
                  border: viewMode === 'cards' ? `1px solid ${RedColorPalette.primary}` : '1px solid transparent',
                  borderRadius: '0.4375rem',
                  color: viewMode === 'cards' ? RedColorPalette.primary : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <Grid size={16} /> {!isMobile && 'Tarjetas'}
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: isMobile ? '7px 0.625rem' : '8px 0.875rem',
                  background: viewMode === 'table' ? mapToRedScheme('rgba(59, 130, 246, 0.2)') : 'transparent',
                  border: viewMode === 'table' ? `1px solid ${RedColorPalette.primary}` : '1px solid transparent',
                  borderRadius: '0.5rem',
                  color: viewMode === 'table' ? RedColorPalette.primary : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.75rem' : '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <List size={16} /> {!isMobile && 'Tabla'}
              </button>
            </div>
          </div>

          {/* Botón Crear */}
          <button
            onClick={() => {
              setSelectedDocente(null);
              setModalMode('create');
              setPreviewUsername('');
              setShowModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: isMobile ? '10px 1rem' : '12px 1.5rem',
              background: `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 0.25rem 0.75rem rgba(239, 68, 68, 0.3)',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Plus size={16} />
            Nuevo Docente
          </button>
        </div>
      </GlassEffect>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(8.75rem, 45vw), 1fr))', gap: '0.75em', marginBottom: '1em' }}>
        <GlassEffect variant="card" tint="red" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: RedColorPalette.primary, marginBottom: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
            Total Docentes
          </div>
        </GlassEffect>

        <GlassEffect variant="card" tint="success" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: mapToRedScheme('#10b981'), marginBottom: '0.25rem' }}>
            {docentes.filter(d => d.estado === 'activo').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
            Docentes Activos
          </div>
        </GlassEffect>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75em',
          padding: '1em',
          marginBottom: '1.5em',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(17.5rem, 90vw), 1fr))', gap: '1em', marginBottom: '1.125em' }}>
          {docentesFiltrados.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '2.5em 1.25em', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              {loading ? 'Cargando docentes...' : 'No hay docentes registrados'}
            </div>
          ) : (
            docentesFiltrados.map((docente) => (
              <div
                key={docente.id_docente}
                style={{
                  background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
                  border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
                  borderRadius: '0.75rem',
                  padding: '0.875rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.375rem' }}>
                    <span style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '3px 0.5rem',
                      borderRadius: '0.3125rem'
                    }}>
                      📧 {docente.gmail || 'Sin correo'}
                    </span>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.1875rem',
                      padding: '3px 0.5rem',
                      borderRadius: 6,
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: docente.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: docente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      color: docente.estado === 'activo' ? '#10b981' : RedColorPalette.primary
                    }}>
                      {docente.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <User size={16} color={RedColorPalette.primary} />
                    </div>
                    <h3 style={{
                      color: '#fff',
                      margin: 0
                    }}>
                      {docente.nombres} {docente.apellidos}
                    </h3>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.625rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '0.875rem'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Cédula
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.identificacion}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Usuario
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.username || 'Sin usuario'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Título
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.titulo_profesional}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Experiencia
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.experiencia_anos} años
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    onClick={() => handleViewDocente(docente)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '6px 0.75rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#3b82f6',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                  >
                    <Eye size={12} /> Ver Detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '1em',
          overflow: 'hidden',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          marginBottom: '1.5em'
        }}>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5em',
              padding: '0.5em 0.75em',
              margin: '0.75em',
              color: '#ef4444',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375em'
            }}>
              <span>👉</span>
              <span>Desliza horizontalmente para ver toda la tabla</span>
              <span>👈</span>
            </div>
          )}

          <div className="responsive-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'rgba(248, 113, 113, 0.15)',
                  borderBottom: '0.0625rem solid rgba(248, 113, 113, 0.3)'
                }}>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                      <User size={14} />
                      Docente
                    </div>
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Identificación
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Usuario
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Título Profesional
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Experiencia
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                      {loading ? 'Cargando docentes...' : 'No hay docentes registrados'}
                    </td>
                  </tr>
                ) : (
                  docentesFiltrados.map((docente, index) => (
                    <tr
                      key={docente.id_docente}
                      style={{
                        borderBottom: '0.0625rem solid rgba(255,255,255,0.05)',
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                          <div style={{
                            width: '2em',
                            height: '2em',
                            borderRadius: '0.5em',
                            background: 'rgba(248, 113, 113, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '0.0625rem solid rgba(248, 113, 113, 0.3)'
                          }}>
                            <User size={14} color="#f87171" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.85rem' }}>
                              {docente.nombres} {docente.apellidos}
                            </div>
                            {docente.telefono && (
                              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                                {docente.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {docente.identificacion}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {docente.username ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <User size={12} color="#60a5fa" />
                            <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>
                              {docente.username}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                            Sin usuario
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {docente.titulo_profesional}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 0.625rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: docente.estado === 'activo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          border: docente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                          color: docente.estado === 'activo' ? '#10b981' : '#9ca3af'
                        }}>
                          {docente.estado}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
                        {docente.experiencia_anos} años
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewDocente(docente)}
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '0.0625rem solid rgba(59, 130, 246, 0.3)',
                              color: '#60a5fa',
                              padding: '0.375em 0.625em',
                              borderRadius: '0.375em',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
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
                              background: 'rgba(245, 158, 11, 0.2)',
                              border: '0.0625rem solid rgba(245, 158, 11, 0.3)',
                              color: '#fbbf24',
                              padding: '0.375em 0.625em',
                              borderRadius: '0.375em',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
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
        </div>
      )}

      {/* Paginación */}
      {!loading && docentesFiltrados.length > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '16px' : '20px 1.5rem',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '1rem',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {Math.ceil(totalCount / limit)} • Total: {totalCount} docentes
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: page === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1' : 'initial'
              }}
            >
              <ChevronLeft size={isMobile ? 14 : 16} />
              {!isMobile && 'Anterior'}
            </button>
            {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                  background: page === pageNum ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.08)',
                  border: page === pageNum ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.625rem',
                  color: '#fff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: isMobile ? '36px' : '2.5rem',
                }}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / limit), p + 1))}
              disabled={page === Math.ceil(totalCount / limit)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: page === Math.ceil(totalCount / limit) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: page === Math.ceil(totalCount / limit) ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === Math.ceil(totalCount / limit) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1' : 'initial'
              }}
            >
              {!isMobile && 'Siguiente'}
              <ChevronRight size={isMobile ? 14 : 16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          data-modal-overlay="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: isMobile ? '0' : '1.25rem',
          }}
        >
          <div className="responsive-modal" style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: isMobile ? '20px 1.25rem 0 0' : '0.75rem',
            width: isMobile ? '100vw' : '100%',
            maxWidth: isMobile ? '100vw' : '43.75rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '18px 1.75rem 1.375rem 1.75rem',
            color: '#fff',
            margin: '0 auto',
            boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Header del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.125rem',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                <UserCheck size={20} />
                {modalMode === 'view' ? 'Información del Docente' :
                  modalMode === 'create' ? 'Crear Nuevo Docente' : 'Editar Docente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.375rem',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <X size={18} />
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
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#3b82f6', fontSize: '1rem', fontWeight: '600' }}>
                      <Lock size={18} style={{ display: 'inline', marginRight: '0.375rem' }} /> Credenciales de Acceso
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: isMobile ? 10 : 12
                    }}>
                      {selectedDocente.username && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4 }}>Usuario</div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{selectedDocente.username}</div>
                        </div>
                      )}
                      {selectedDocente.password_temporal && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', marginBottom: 4 }}>Contraseña Temporal</div>
                          <div style={{ color: '#fff', fontWeight: '600' }}>{selectedDocente.password_temporal}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Información Personal */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 12 : 16
                }}>
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
                    <div style={{ color: '#fff' }}>{selectedDocente.identificacion}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Título Profesional</div>
                    <div style={{ color: '#fff' }}>{selectedDocente.titulo_profesional}</div>
                  </div>
                  {selectedDocente.telefono && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} color="#10b981" />
                        {selectedDocente.telefono}
                      </div>
                    </div>
                  )}
                  {selectedDocente.gmail && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Email</div>
                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mail size={16} color="#3b82f6" />
                        {selectedDocente.gmail}
                      </div>
                    </div>
                  )}
                  {selectedDocente.fecha_nacimiento && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                      <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                      padding: '6px 0.75rem',
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
                    <Info size={16} style={{ display: 'inline', marginRight: '0.375rem' }} /> <strong>Credenciales automáticas:</strong> El sistema generará automáticamente un username único (iniciales + apellido) y usará la identificación como contraseña temporal.
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 12 : 16,
                  marginBottom: isMobile ? 16 : 20
                }}>
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                        padding: '0.625rem',
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
                      margin: '0 0 0.75rem 0',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <User size={18} color="#ef4444" />
                      Usuario Generado Automáticamente
                    </h4>
                    <div style={{
                      color: '#ef4444',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      background: 'rgba(239, 68, 68, 0.1)',
                      padding: '8px 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      marginBottom: '0.5rem'
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
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column-reverse' : 'row',
                  gap: 12,
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(156, 163, 175, 0.15)',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      color: '#9ca3af',
                      padding: '10px 1.25rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      width: isMobile ? '100%' : 'auto'
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
                      padding: '10px 1.25rem',
                      borderRadius: '0.5rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear Docente' : 'Actualizar')}
                  </button>
                </div>
              </form>
            )}

            {/* Botón Cerrar solo para vista */}
            {modalMode === 'view' && (
              <div style={{ marginTop: isMobile ? 20 : 24, textAlign: isMobile ? 'center' : 'right' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    background: 'rgba(156, 163, 175, 0.15)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: '#9ca3af',
                    padding: '10px 1.25rem',
                    borderRadius: '0.5rem',
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




