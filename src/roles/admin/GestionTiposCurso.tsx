import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, X, Save, BookOpen, Search, Grid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

type TipoCurso = {
  id_tipo_curso: number;
  nombre: string;
  descripcion?: string | null;
  duracion_meses?: number | null;
  precio_base?: number | null;
  estado?: 'activo' | 'inactivo';
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionTiposCurso: React.FC = () => {
  const [tipos, setTipos] = useState<TipoCurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<TipoCurso | null>(null);

  // Estados para búsqueda, vista y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Helper: formato de precio consistente
  const formatPrice = (v?: number | null) => {
    if (v === null || v === undefined || isNaN(Number(v))) return '-';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(v));
  };

  // Filtrado y paginación
  const filteredTipos = useMemo(() => {
    if (!searchTerm.trim()) return tipos;
    const term = searchTerm.toLowerCase();
    return tipos.filter(t => 
      t.nombre.toLowerCase().includes(term) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(term))
    );
  }, [tipos, searchTerm]);

  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const paginatedTipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTipos.slice(start, start + itemsPerPage);
  }, [filteredTipos, currentPage, itemsPerPage]);

  // Reset página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/tipos-cursos?limit=200`);
      if (!res.ok) throw new Error('No se pudo cargar tipos de curso');
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray((data as any)?.rows)
        ? (data as any).rows
        : [];
      setTipos(list);
    } catch (e: any) {
      setError(e.message || 'Error cargando tipos de curso');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const openCreate = () => {
    setSelected(null);
    setModalType('create');
    setShowModal(true);
  };
  const openEdit = (t: TipoCurso) => {
    setSelected(t);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este tipo de curso?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/tipos-cursos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el tipo de curso');
      // Actualizar lista local inmediatamente sin recargar
      setTipos((prev) => prev.filter((t) => t.id_tipo_curso !== id));
    } catch (e: any) {
      setError(e.message || 'Error eliminando tipo de curso');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: String(fd.get('nombre') || '').trim(),
      descripcion: String(fd.get('descripcion') || ''),
      duracion_meses: fd.get('duracion_meses') ? Number(fd.get('duracion_meses')) : null,
      precio_base: fd.get('precio_base') ? Number(fd.get('precio_base')) : null,
      estado: String(fd.get('estado') || 'activo'),
    } as Record<string, any>;

    if (!payload.nombre) {
      setError('El nombre es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (modalType === 'create') {
        const res = await fetch(`${API_BASE}/api/tipos-cursos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo crear el tipo de curso');
        const newTipo = await res.json();
        // Agregar el nuevo tipo a la lista inmediatamente
        setTipos(prev => [newTipo, ...prev]);
      } else if (modalType === 'edit' && selected) {
        const res = await fetch(`${API_BASE}/api/tipos-cursos/${selected.id_tipo_curso}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo actualizar el tipo de curso');
        const updatedTipo = await res.json();
        // Actualizar el tipo en la lista inmediatamente
        setTipos(prev => prev.map(t => 
          t.id_tipo_curso === selected.id_tipo_curso 
            ? { ...t, ...updatedTipo }
            : t
        ));
      }
      setShowModal(false);
    } catch (e: any) {
      setError(e.message || 'Error guardando tipo de curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ 
          color: 'var(--admin-text-primary, #fff)', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <BookOpen size={32} color="#ef4444" />
          Gestión de Tipos de Curso
        </h2>
        <p style={{ color: 'var(--admin-text-muted, rgba(255,255,255,0.7))', margin: '8px 0 0 0' }}>
          Administra los tipos de curso antes de crear cursos.
        </p>
      </div>

      {/* Barra de búsqueda y controles */}
      <div
        style={{
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
          {/* Barra de búsqueda */}
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'rgba(255,255,255,0.5)' 
              }} 
            />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            />
          </div>

          {/* Toggle Vista */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: viewMode === 'cards' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewMode === 'cards' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                color: viewMode === 'cards' ? '#3b82f6' : 'rgba(255,255,255,0.6)',
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
                background: viewMode === 'table' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: viewMode === 'table' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                borderRadius: '8px',
                color: viewMode === 'table' ? '#3b82f6' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <List size={16} /> Tabla
            </button>
          </div>

          {/* Botón Nuevo */}
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={18} /> Nuevo Tipo
          </button>
        </div>

        {/* Info de resultados */}
        <div style={{ color: 'var(--admin-text-muted, rgba(255,255,255,0.7))', fontSize: '0.9rem' }}>
          {searchTerm ? `${filteredTipos.length} de ${tipos.length} tipos` : `Total: ${tipos.length} tipos`}
        </div>
      </div>

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '24px'
        }}>
          {paginatedTipos.map((t) => (
            <div
              key={t.id_tipo_curso}
              style={{
                background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
                border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '1.25rem', 
                  fontWeight: 700, 
                  margin: '0 0 8px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  {t.nombre}
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 8,
                      background: t.estado === 'activo' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.estado === 'activo' ? '#10b981' : '#ef4444',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {t.estado || 'activo'}
                  </span>
                </h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: '0.9rem', 
                  margin: 0,
                  lineHeight: 1.5,
                  minHeight: '40px'
                }}>
                  {t.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginBottom: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Duración
                  </div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>
                    {t.duracion_meses != null ? `${t.duracion_meses} meses` : '-'}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginBottom: '4px' }}>
                    Precio
                  </div>
                  <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: 700 }}>
                    {formatPrice(t.precio_base ?? null)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openEdit(t)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <Edit size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(t.id_tipo_curso)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <div
          style={{
            background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
            border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ 
                background: 'rgba(248, 113, 113, 0.15)', 
                borderBottom: '1px solid rgba(248, 113, 113, 0.3)' 
              }}>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '35%' }}>
                  Nombre
                </th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>
                  Duración
                </th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'right', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '20%' }}>
                  Precio
                </th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>
                  Estado
                </th>
                <th style={{ padding: '10px 12px', color: '#fff', textAlign: 'center', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', width: '15%' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTipos.map((t, index) => (
                <tr
                  key={t.id_tipo_curso}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
                  }}
                >
                  <td style={{ padding: '12px', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>
                    {t.nombre}
                  </td>
                  <td style={{ padding: '12px', color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: '0.8rem' }}>
                    {t.duracion_meses != null ? `${t.duracion_meses} meses` : '-'}
                  </td>
                  <td style={{ padding: '12px', color: 'rgba(255,255,255,0.9)', textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>
                    {formatPrice(t.precio_base ?? null)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: t.estado === 'activo' ? 'rgba(16,185,129,0.2)' : 'rgba(156,163,175,0.2)',
                        border: t.estado === 'activo' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(156,163,175,0.3)',
                        color: t.estado === 'activo' ? '#10b981' : '#9ca3af',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.estado || 'activo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => openEdit(t)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          color: '#fbbf24',
                          padding: '6px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
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
                      <button
                        onClick={() => handleDelete(t.id_tipo_curso)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          padding: '6px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Estados vacíos y errores */}
      {!loading && filteredTipos.length === 0 && (
        <div style={{ 
          color: 'rgba(255,255,255,0.6)', 
          padding: '60px 20px',
          textAlign: 'center',
          fontSize: '1rem',
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          {searchTerm ? 'No se encontraron tipos de curso' : 'No hay tipos de curso registrados'}
        </div>
      )}
      {loading && (
        <div style={{ 
          color: 'rgba(255,255,255,0.6)', 
          padding: '60px 20px',
          textAlign: 'center',
          fontSize: '1rem',
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          Cargando tipos de curso...
        </div>
      )}
      {error && (
        <div style={{ 
          color: '#ef4444', 
          padding: '20px',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          fontSize: '0.95rem',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {/* Paginación */}
      {!loading && filteredTipos.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: '16px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Página {currentPage} de {totalPages}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 14px',
                  background: currentPage === page ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(255,255,255,0.08)',
                  border: currentPage === page ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '40px',
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%))',
              border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.3))',
              borderRadius: 16,
              width: 'min(680px, 92vw)',
              padding: 24,
              color: 'var(--admin-text-primary, #fff)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {modalType === 'create' ? 'Nuevo Tipo de Curso' : 'Editar Tipo de Curso'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--admin-text-primary, #fff)', cursor: 'pointer' }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Nombre - ancho completo */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontWeight: 600 }}>Nombre del tipo</label>
                  <input
                    name="nombre"
                    placeholder="Ej. Cosmetología, Maquillaje Profesional"
                    defaultValue={selected?.nombre || ''}
                    required
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      color: '#fff',
                    }}
                  />
                  <div style={{ marginTop: 6, color: 'var(--admin-text-muted, rgba(255,255,255,0.55))', fontSize: '0.8rem' }}>
                    El nombre que verán los estudiantes en la web.
                  </div>
                </div>

                {/* Descripción - ahora arriba, ancho completo */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontWeight: 600 }}>Descripción (opcional)</label>
                  <textarea
                    name="descripcion"
                    defaultValue={selected?.descripcion || ''}
                    placeholder="Resumen atractivo del programa, objetivos y beneficios principales."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      color: 'var(--admin-text-primary, #fff)',
                    }}
                  />
                </div>

                {/* Separador sutil */}
                <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />

                {/* Duración y Precio en la misma fila */}
                <div>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontWeight: 600 }}>Duración (meses)</label>
                  <input
                    type="number"
                    min={1}
                    name="duracion_meses"
                    placeholder="Ej. 6"
                    defaultValue={selected?.duracion_meses ?? ''}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      color: 'var(--admin-text-primary, #fff)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontWeight: 600 }}>Precio base (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    name="precio_base"
                    placeholder="Ej. 2500"
                    defaultValue={selected?.precio_base ?? ''}
                    style={{
                      width: '100%',
                      padding: 12,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 10,
                      color: 'var(--admin-text-primary, #fff)',
                    }}
                  />
                </div>

                {/* Estado al final a ancho completo, con StyledSelect */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 6, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontWeight: 600 }}>Estado</label>
                  <StyledSelect
                    name="estado"
                    defaultValue={selected?.estado || 'activo'}
                    options={[
                      { value: 'activo', label: 'Activo' },
                      { value: 'inactivo', label: 'Inactivo' },
                    ]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 12,
                    color: 'var(--admin-text-muted, rgba(255,255,255,0.7))',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Save size={16} />
                  {modalType === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTiposCurso;
