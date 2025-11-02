import { useState, useEffect } from 'react';
import { 
  Search, Eye, GraduationCap, Calendar, Phone, MapPin, User, X, Grid, List, ChevronLeft, ChevronRight, Mail, IdCard, Download, FileText, Shield, Sheet
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import UserAvatar from '../../components/UserAvatar';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

// Tipos
interface Curso {
  id_curso: number;
  nombre: string;
  codigo_curso: string;
  horario: string;
  estado: string;
}

interface Estudiante {
  id_usuario: number;
  identificacion: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
  fecha_registro: string;
  fecha_ultima_conexion?: string;
  // Nuevos campos de documentos y contacto
  contacto_emergencia?: string;
  tipo_documento?: 'ecuatoriano' | 'extranjero';
  tiene_documento_identificacion?: boolean;
  tiene_documento_estatus_legal?: boolean;
  id_solicitud?: number; // Para descargar documentos
  cursos?: Curso[]; // Cursos inscritos
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionEstudiantes = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // 10 estudiantes por página
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Función para obtener estudiantes
  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      
      const response = await fetch(`${API_BASE}/api/estudiantes?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error cargando estudiantes');
      }
      
      const data = await response.json();
      const headerVal = response.headers.get('X-Total-Count');
      const totalHeader = headerVal !== null ? Number(headerVal) : NaN;

      // Fallbacks si el backend no envía X-Total-Count
      const computedTotal = Number.isFinite(totalHeader) && totalHeader >= 0
        ? totalHeader
        : (typeof data?.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0));

      setEstudiantes(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []));
      setTotalCount(computedTotal);
    } catch (err: any) {
      setError(err.message || 'Error cargando estudiantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, [page, limit, searchTerm]);

  const estudiantesFiltrados = estudiantes
    .filter(estudiante => {
      const matchesEstado = filterEstado === 'todos' || estudiante.estado === filterEstado;
      return matchesEstado;
    })
    .sort((a, b) => {
      // Ordenar por fecha de registro, más recientes primero
      const dateA = new Date(a.fecha_registro).getTime();
      const dateB = new Date(b.fecha_registro).getTime();
      return dateB - dateA;
    });

  const handleViewEstudiante = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setShowModal(true);
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
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)', 
      color: '#fff' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '12px' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)', 
          margin: '0 0 0.375rem 0',
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '6px' : '0.625rem'
        }}>
          <GraduationCap size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Gestión de Estudiantes
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          margin: 0, 
          fontSize: isMobile ? '0.75rem' : '0.85rem'
        }}>
          Administra y visualiza la información de todos los estudiantes registrados
        </p>
      </div>

      {/* Controles */}
      <GlassEffect variant="card" tint="neutral" intensity="light" style={{ marginBottom: isMobile ? 12 : 16 }}>
        <div className="responsive-filters">
          <div style={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: '0.75rem', alignItems: isSmallScreen ? 'stretch' : 'center', flex: 1, width: isSmallScreen ? '100%' : 'auto' }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', minWidth: isSmallScreen ? 'auto' : '17.5rem', width: isSmallScreen ? '100%' : 'auto' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder={isMobile ? "Buscar estudiantes..." : "Buscar por nombre, apellido, cédula o email..."}
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
            <div style={{ minWidth: isSmallScreen ? 'auto' : 200, width: isSmallScreen ? '100%' : 'auto' }}>
              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' },
                  { value: 'pendiente', label: 'Pendientes' }
                ]}
              />
            </div>

            {/* Toggle Vista */}
            <div style={{ display: 'flex', gap: '0.375rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.625rem', padding: '0.1875rem', width: isSmallScreen ? '100%' : 'auto' }}>
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
                  fontSize: '0.75rem',
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

          {/* Botones Excel y Refrescar */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: isSmallScreen ? '100%' : 'auto' }}>
            <button 
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE}/api/estudiantes/reporte/excel`);
                  if (!response.ok) throw new Error('Error descargando reporte');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Reporte_Estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('Error:', error);
                  alert('Error al descargar el reporte');
                }
              }}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.15))',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '0.625rem',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: isSmallScreen ? '100%' : 'auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(239, 68, 68, 0.25))';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.15))';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Sheet size={16} />
              Descargar Excel
            </button>
            <button 
              onClick={fetchEstudiantes}
              disabled={loading}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                background: loading ? 'rgba(239, 68, 68, 0.3)' : `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
                border: 'none',
                borderRadius: '0.625rem',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0.25rem 0.75rem rgba(239, 68, 68, 0.3)',
                width: isSmallScreen ? '100%' : 'auto'
              }}
            >
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>
      </GlassEffect>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <GlassEffect variant="card" tint="red" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: RedColorPalette.primary, marginBottom: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
            Total Estudiantes
          </div>
        </GlassEffect>
        
        <GlassEffect variant="card" tint="neutral" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: mapToRedScheme('#3b82f6'), marginBottom: '0.25rem' }}>
            {estudiantes.filter(e => e.estado === 'activo').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem' }}>
            Estudiantes Activos
          </div>
        </GlassEffect>
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

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.125rem' }}>
          {estudiantesFiltrados.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px 1.25rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
            </div>
          ) : (
            estudiantesFiltrados.map((estudiante) => (
              <div
                key={estudiante.id_usuario}
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
                <div style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.375rem' }}>
                    <span style={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '3px 0.375rem',
                      borderRadius: '0.3125rem'
                    }}>
                      {estudiante.identificacion}
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
                      background: estudiante.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' :
                                 estudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                                 'rgba(251, 191, 36, 0.15)',
                      border: estudiante.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' :
                             estudiante.estado === 'inactivo' ? '1px solid rgba(239, 68, 68, 0.3)' :
                             '1px solid rgba(251, 191, 36, 0.3)',
                      color: estudiante.estado === 'activo' ? mapToRedScheme('#10b981') :
                            estudiante.estado === 'inactivo' ? RedColorPalette.primary :
                            '#fbbf24'
                    }}>
                      {estudiante.estado}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.625rem',
                    marginBottom: '0.625rem'
                  }}>
                    <UserAvatar
                      userId={estudiante.id_usuario}
                      nombre={estudiante.nombre}
                      apellido={estudiante.apellido}
                      size={2}
                      showBorder={true}
                      borderColor="rgba(239, 68, 68, 0.3)"
                    />
                    <h3 style={{ 
                      color: '#fff', 
                      margin: 0
                    }}>
                      {estudiante.nombre} {estudiante.apellido}
                    </h3>
                  </div>
                </div>

                <div style={{ 
                  paddingTop: '0.625rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '0.875rem'
                }}>
                  <div style={{ 
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                      Identificación
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {estudiante.identificacion}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                      Usuario
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {estudiante.username || 'No asignado'}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                      Email
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {estudiante.email}
                    </div>
                  </div>
                  <div style={{ flex: '1 1 120px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                      Registro
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>
                      {formatDate(estudiante.fecha_registro)}
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
                    onClick={() => handleViewEstudiante(estudiante)}
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

      {/* Paginación para Cards */}
      {viewMode === 'cards' && !loading && estudiantesFiltrados.length > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '0',
          padding: isMobile ? '16px' : '20px 1.5rem',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '1rem'
        }}>
          <div style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {totalPages} • Total: {totalCount} estudiantes
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            justifyContent: isMobile ? 'center' : 'flex-start',
            flexWrap: 'wrap'
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                  background: page === pageNum ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})` : 'rgba(255,255,255,0.08)',
                  border: page === pageNum ? `1px solid ${RedColorPalette.primary}` : '1px solid rgba(255,255,255,0.15)',
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
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: page === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
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

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: 16, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '8px 0.75rem',
              margin: '0.75rem',
              color: '#ef4444',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}>
              <span>👉</span>
              <span>Desliza horizontalmente para ver toda la tabla</span>
              <span>👈</span>
            </div>
          )}
          
          <div className="responsive-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Estudiante
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Identificación
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Usuario
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Estado
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Fecha Registro
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                    {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((estudiante, index) => (
                  <tr key={estudiante.id_usuario} style={{ 
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <UserAvatar
                          nombre={estudiante.nombre}
                          apellido={estudiante.apellido}
                          userId={estudiante.id_usuario}
                          size={2.25}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                          {estudiante.telefono && (
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                              {estudiante.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {estudiante.identificacion}
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {estudiante.username || 'No asignado'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: estudiante.estado === 'activo' ? 'rgba(220, 38, 38, 0.15)' :
                                   estudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                                   'rgba(248, 113, 113, 0.15)',
                        border: estudiante.estado === 'activo' ? `1px solid ${RedColorPalette.success}` :
                               estudiante.estado === 'inactivo' ? '1px solid rgba(239, 68, 68, 0.3)' :
                               `1px solid ${RedColorPalette.primaryLight}`,
                        color: estudiante.estado === 'activo' ? RedColorPalette.success :
                              estudiante.estado === 'inactivo' ? RedColorPalette.primary :
                              RedColorPalette.primaryLight
                      }}>
                        {estudiante.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {formatDate(estudiante.fecha_registro)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewEstudiante(estudiante)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '8px 0.75rem',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          margin: '0 auto'
                        }}
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        </div>
        
        {/* Paginación fuera del contenedor con overflow */}
        {totalCount > 0 && (
          <div className="pagination-container" style={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '12px' : '0',
            padding: isMobile ? '16px' : '20px 1.5rem',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '1rem'
          }}>
            <div style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Página {page} de {totalPages} • Total: {totalCount} estudiantes
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              justifyContent: isMobile ? 'center' : 'flex-start',
              flexWrap: 'wrap'
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                    background: page === pageNum ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})` : 'rgba(255,255,255,0.08)',
                    border: page === pageNum ? `1px solid ${RedColorPalette.primary}` : '1px solid rgba(255,255,255,0.15)',
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
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '4px' : '0.375rem',
                  padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                  background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625rem',
                  color: page === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontWeight: 600,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
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
        </>
      )}

      {/* Modal de Detalle */}
      {showModal && selectedEstudiante && (
        <div 
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? 12 : 14,
              paddingBottom: isMobile ? 8 : 10,
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                  Información del Estudiante
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
                  color: 'var(--admin-text-primary, #fff)',
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
                <X size={16} />
              </button>
            </div>

            {/* Información del Estudiante */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr', 
              gap: isMobile ? 10 : 12,
              columnGap: isSmallScreen ? 0 : 16,
              marginBottom: isMobile ? 16 : 20
            }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <User size={14} style={{ color: '#ef4444' }} />
                  Nombres
                </label>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{selectedEstudiante.nombre}</div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <User size={14} style={{ color: '#ef4444' }} />
                  Apellidos
                </label>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{selectedEstudiante.apellido}</div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <IdCard size={14} style={{ color: '#8b5cf6' }} />
                  Identificación
                </label>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedEstudiante.identificacion}</div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <User size={14} style={{ color: '#3b82f6' }} />
                  Usuario
                </label>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                  {selectedEstudiante.username || 'No asignado'}
                </div>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <Mail size={14} style={{ color: '#06b6d4' }} />
                  Email
                </label>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedEstudiante.email}</div>
              </div>
              {selectedEstudiante.telefono && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                    <Phone size={14} style={{ color: '#10b981' }} />
                    Teléfono
                  </label>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    {selectedEstudiante.telefono}
                  </div>
                </div>
              )}
              {selectedEstudiante.fecha_nacimiento && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                    <Calendar size={14} style={{ color: '#fbbf24' }} />
                    Fecha de Nacimiento
                  </label>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    {formatDate(selectedEstudiante.fecha_nacimiento)}
                  </div>
                </div>
              )}
              {selectedEstudiante.genero && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                    <User size={14} style={{ color: '#f59e0b' }} />
                    Género
                  </label>
                  <div style={{ color: '#fff', textTransform: 'capitalize', fontSize: '0.9rem' }}>{selectedEstudiante.genero}</div>
                </div>
              )}
              
              {/* Cursos Inscritos */}
              {selectedEstudiante.cursos && selectedEstudiante.cursos.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 6, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.75rem' }}>
                    <GraduationCap size={13} style={{ color: '#f87171' }} />
                    Cursos Inscritos
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedEstudiante.cursos.map((curso) => (
                      <div
                        key={curso.id_curso}
                        style={{
                          padding: isMobile ? '8px 10px' : '8px 12px',
                          background: 'rgba(248, 113, 113, 0.1)',
                          border: '1px solid rgba(248, 113, 113, 0.3)',
                          borderRadius: isMobile ? 6 : 8,
                          display: 'flex',
                          flexDirection: isSmallScreen ? 'column' : 'row',
                          justifyContent: 'space-between',
                          alignItems: isSmallScreen ? 'flex-start' : 'center',
                          gap: '6px'
                        }}
                      >
                        <div>
                          <div style={{ color: '#f87171', fontWeight: '600', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                            {curso.nombre}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? '0.7rem' : '0.75rem', marginTop: '2px' }}>
                            {curso.codigo_curso} • {curso.horario}
                          </div>
                        </div>
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: isMobile ? '0.65rem' : '0.7rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                          background: curso.estado === 'activo' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          border: curso.estado === 'activo' ? '1px solid rgba(220, 38, 38, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                          color: curso.estado === 'activo' ? '#dc2626' : '#ef4444'
                        }}>
                          {curso.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEstudiante.direccion && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                    <MapPin size={14} style={{ color: '#ef4444' }} />
                    Dirección
                  </label>
                  <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                    {selectedEstudiante.direccion}
                  </div>
                </div>
              )}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  Estado
                </label>
                <span style={{
                  display: 'inline-flex',
                  padding: '6px 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  background: selectedEstudiante.estado === 'activo' ? 'rgba(220, 38, 38, 0.15)' :
                             selectedEstudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                             'rgba(248, 113, 113, 0.15)',
                  border: selectedEstudiante.estado === 'activo' ? `1px solid ${RedColorPalette.success}` :
                         selectedEstudiante.estado === 'inactivo' ? `1px solid ${RedColorPalette.primary}` :
                         `1px solid ${RedColorPalette.primaryLight}`,
                  color: selectedEstudiante.estado === 'activo' ? RedColorPalette.success :
                        selectedEstudiante.estado === 'inactivo' ? RedColorPalette.primary :
                        RedColorPalette.primaryLight
                }}>
                  {selectedEstudiante.estado}
                </span>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                  <Calendar size={14} style={{ color: '#3b82f6' }} />
                  Fecha de Registro
                </label>
                <div style={{ color: '#fff', fontSize: '0.9rem' }}>{formatDate(selectedEstudiante.fecha_registro)}</div>
              </div>
              {selectedEstudiante.contacto_emergencia && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: 'rgba(255,255,255,0.9)', fontWeight: 500, fontSize: '0.8rem' }}>
                    <Phone size={14} style={{ color: '#ef4444' }} />
                    Contacto de Emergencia
                  </label>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                    {selectedEstudiante.contacto_emergencia}
                  </div>
                </div>
              )}
            </div>

            {/* Sección de Documentos - Solo muestra el que corresponde */}
            {(selectedEstudiante.tiene_documento_identificacion || selectedEstudiante.tiene_documento_estatus_legal) && (
              <div style={{
                marginTop: isMobile ? 12 : 16,
                padding: isMobile ? 10 : 12,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: isMobile ? 8 : 10
              }}>
                <h4 style={{
                  margin: 0,
                  marginBottom: isMobile ? 8 : 10,
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  fontWeight: '600',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <FileText size={14} />
                  Documentos del Estudiante
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: selectedEstudiante.tipo_documento === 'extranjero' ? (isSmallScreen ? '1fr' : '1fr 1fr') : '1fr',
                  gap: isMobile ? 6 : 8
                }}>
                  {/* Ecuatoriano: solo cédula */}
                  {selectedEstudiante.tipo_documento === 'ecuatoriano' && selectedEstudiante.tiene_documento_identificacion && (
                    <a
                      href={`${API_BASE}/api/solicitudes/${selectedEstudiante.id_solicitud}/documento-identificacion`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        background: 'rgba(220, 38, 38, 0.12)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: isMobile ? 6 : 8,
                        color: '#dc2626',
                        fontSize: isMobile ? '0.8rem' : '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Download size={14} />
                      Ver Cédula
                    </a>
                  )}
                  {/* Extranjero: pasaporte Y estatus legal */}
                  {selectedEstudiante.tipo_documento === 'extranjero' && selectedEstudiante.tiene_documento_identificacion && (
                    <a
                      href={`${API_BASE}/api/solicitudes/${selectedEstudiante.id_solicitud}/documento-identificacion`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        background: 'rgba(220, 38, 38, 0.12)',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: isMobile ? 6 : 8,
                        color: '#dc2626',
                        fontSize: isMobile ? '0.8rem' : '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Download size={14} />
                      Ver Pasaporte
                    </a>
                  )}
                  {selectedEstudiante.tipo_documento === 'extranjero' && selectedEstudiante.tiene_documento_estatus_legal && (
                    <a
                      href={`${API_BASE}/api/solicitudes/${selectedEstudiante.id_solicitud}/documento-estatus-legal`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: isMobile ? '8px 12px' : '10px 14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: isMobile ? 6 : 8,
                        color: '#ef4444',
                        fontSize: isMobile ? '0.8rem' : '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Shield size={14} />
                      Ver Estatus Legal
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Botón Cerrar */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isSmallScreen ? 'column-reverse' : 'row', 
              gap: isMobile ? 10 : 12, 
              marginTop: isMobile ? 16 : 24, 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: isMobile ? 10 : 12,
                  color: 'var(--admin-text-muted, rgba(255,255,255,0.7))',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  width: isSmallScreen ? '100%' : 'auto',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEstudiantes;



