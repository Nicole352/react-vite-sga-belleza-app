import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, GraduationCap, Calendar, Phone, MapPin, User, X, Grid, List, ChevronLeft, ChevronRight, Mail, IdCard
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

// Tipos
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

          {/* Botón Refrescar */}
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
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: 'rgba(239, 68, 68, 0.15)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <User size={18} color={RedColorPalette.primary} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>
                            {estudiante.nombre} {estudiante.apellido}
                          </div>
                          {estudiante.telefono && (
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
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
            padding: isMobile ? '16px' : '18px 1.75rem 1.375rem 1.75rem',
            color: '#fff',
            margin: '0 auto',
            boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)',
            maxHeight: isMobile ? '90vh' : '85vh',
            overflowY: 'auto',
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
                <GraduationCap size={20} />
                Información del Estudiante
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

            {/* Información del Estudiante */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: isMobile ? 12 : 16 
            }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Nombres</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{selectedEstudiante.nombre}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Apellidos</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{selectedEstudiante.apellido}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Identificación</div>
                <div style={{ color: '#fff' }}>{selectedEstudiante.identificacion}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Usuario</div>
                <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} color="#3b82f6" />
                  {selectedEstudiante.username || 'No asignado'}
                </div>
              </div>
              {selectedEstudiante.telefono && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} color="#10b981" />
                    {selectedEstudiante.telefono}
                  </div>
                </div>
              )}
              {selectedEstudiante.fecha_nacimiento && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="#fbbf24" />
                    {formatDate(selectedEstudiante.fecha_nacimiento)}
                  </div>
                </div>
              )}
              {selectedEstudiante.genero && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Género</div>
                  <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selectedEstudiante.genero}</div>
                </div>
              )}
              {selectedEstudiante.direccion && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Dirección</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="#ef4444" />
                    {selectedEstudiante.direccion}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Estado</div>
                <span style={{
                  display: 'inline-flex',
                  padding: '6px 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
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
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Registro</div>
                <div style={{ color: '#fff' }}>{formatDate(selectedEstudiante.fecha_registro)}</div>
              </div>
            </div>

            {/* Botón Cerrar */}
            <div style={{ marginTop: isMobile ? 20 : 24, textAlign: isMobile ? 'center' : 'right' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  color: '#9ca3af',
                  padding: '10px 1.25rem',
                  borderRadius: '0.5rem',
                  width: isMobile ? '100%' : 'auto',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
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



