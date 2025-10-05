import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Eye, GraduationCap, Calendar, Phone, MapPin, User, X, Grid, List, ChevronLeft, ChevronRight, Mail, IdCard
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

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
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)', 
      padding: 32, 
      color: '#fff' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <GraduationCap size={28} color="#10b981" />
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Gestión de Estudiantes</h1>
        </div>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          Administra y visualiza la información de todos los estudiantes registrados
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
        <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Buscar Estudiante
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido, cédula o email..."
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
          <div style={{ minWidth: 180 }}>
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
                { value: 'inactivo', label: 'Inactivos' },
                { value: 'pendiente', label: 'Pendientes' }
              ]}
            />
          </div>

          {/* Toggle Vista */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Vista
            </label>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: viewMode === 'cards' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  border: viewMode === 'cards' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: viewMode === 'cards' ? '#10b981' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <Grid size={16} /> Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: viewMode === 'table' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  border: viewMode === 'table' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                  borderRadius: '8px',
                  color: viewMode === 'table' ? '#10b981' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <List size={16} /> Tabla
              </button>
            </div>
          </div>

          {/* Botón Refrescar */}
          <button 
            onClick={fetchEstudiantes}
            disabled={loading}
            style={{ 
              padding: '12px 20px', 
              borderRadius: 10, 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#10b981', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: 12, 
          padding: 20, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: 4 }}>
            {totalCount}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Total Estudiantes
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(59, 130, 246, 0.1)', 
          border: '1px solid rgba(59, 130, 246, 0.3)', 
          borderRadius: 12, 
          padding: 20, 
          textAlign: 'center' 
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: 4 }}>
            {estudiantes.filter(e => e.estado === 'activo').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Estudiantes Activos
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

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {estudiantesFiltrados.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
              {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
            </div>
          ) : (
            estudiantesFiltrados.map((estudiante) => (
              <div
                key={estudiante.id_usuario}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '16px',
                  padding: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.15)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 50, 
                      height: 50, 
                      borderRadius: '50%', 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <User size={24} color="#10b981" />
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
                        {estudiante.nombre} {estudiante.apellido}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        background: estudiante.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' :
                                   estudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                                   'rgba(251, 191, 36, 0.15)',
                        border: estudiante.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' :
                               estudiante.estado === 'inactivo' ? '1px solid rgba(239, 68, 68, 0.3)' :
                               '1px solid rgba(251, 191, 36, 0.3)',
                        color: estudiante.estado === 'activo' ? '#10b981' :
                              estudiante.estado === 'inactivo' ? '#ef4444' :
                              '#fbbf24'
                      }}>
                        {estudiante.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <IdCard size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Identificación
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {estudiante.identificacion}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Usuario
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                      {estudiante.username || 'No asignado'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Email
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.85rem' }}>
                      {estudiante.email}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      Registro
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.85rem' }}>
                      {formatDate(estudiante.fecha_registro)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewEstudiante(estudiante)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    color: '#10b981',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                  }}
                >
                  <Eye size={14} /> Ver Detalles
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Paginación para Cards */}
      {viewMode === 'cards' && !loading && estudiantesFiltrados.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Página {page} de {totalPages} • Total: {totalCount} estudiantes
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                color: page === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: '8px 14px',
                  background: page === pageNum ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.08)',
                  border: page === pageNum ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '40px',
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
                gap: '6px',
                padding: '8px 16px',
                background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                color: page === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: 16, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Estudiante
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Identificación
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Usuario
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Estado
                </th>
                <th style={{ padding: '16px', textAlign: 'left', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Fecha Registro
                </th>
                <th style={{ padding: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: '0.9rem' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                    {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
                  </td>
                </tr>
              ) : (
                estudiantesFiltrados.map((estudiante, index) => (
                  <tr key={estudiante.id_usuario} style={{ 
                    borderTop: index > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    transition: 'background-color 0.2s'
                  }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          background: 'rgba(16, 185, 129, 0.2)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}>
                          <User size={18} color="#10b981" />
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
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                      {estudiante.identificacion}
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {estudiante.username || 'No asignado'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: estudiante.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' :
                                   estudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                                   'rgba(251, 191, 36, 0.15)',
                        border: estudiante.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' :
                               estudiante.estado === 'inactivo' ? '1px solid rgba(239, 68, 68, 0.3)' :
                               '1px solid rgba(251, 191, 36, 0.3)',
                        color: estudiante.estado === 'activo' ? '#10b981' :
                              estudiante.estado === 'inactivo' ? '#ef4444' :
                              '#fbbf24'
                      }}>
                        {estudiante.estado}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      {formatDate(estudiante.fecha_registro)}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleViewEstudiante(estudiante)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#3b82f6',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
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
              Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount)} de {totalCount} estudiantes
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
      )}

      {/* Modal de Detalle */}
      {showModal && selectedEstudiante && (
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
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            borderRadius: 16, 
            width: 'min(600px, 90vw)', 
            maxHeight: '90vh',
            overflow: 'auto',
            padding: 24, 
            color: '#fff' 
          }}>
            {/* Header del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={20} />
                Información del Estudiante
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

            {/* Información del Estudiante */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                <div style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedEstudiante.identificacion}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Usuario</div>
                <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} color="#3b82f6" />
                  {selectedEstudiante.username || 'No asignado'}
                </div>
              </div>
              {selectedEstudiante.telefono && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#10b981" />
                    {selectedEstudiante.telefono}
                  </div>
                </div>
              )}
              {selectedEstudiante.fecha_nacimiento && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#ef4444" />
                    {selectedEstudiante.direccion}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Estado</div>
                <span style={{
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  background: selectedEstudiante.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' :
                             selectedEstudiante.estado === 'inactivo' ? 'rgba(239, 68, 68, 0.15)' :
                             'rgba(251, 191, 36, 0.15)',
                  border: selectedEstudiante.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' :
                         selectedEstudiante.estado === 'inactivo' ? '1px solid rgba(239, 68, 68, 0.3)' :
                         '1px solid rgba(251, 191, 36, 0.3)',
                  color: selectedEstudiante.estado === 'activo' ? '#10b981' :
                        selectedEstudiante.estado === 'inactivo' ? '#ef4444' :
                        '#fbbf24'
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
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionEstudiantes;
