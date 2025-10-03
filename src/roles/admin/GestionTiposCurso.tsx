import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Save, BookOpen
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

  // Helper: formato de precio consistente
  const formatPrice = (v?: number | null) => {
    if (v === null || v === undefined || isNaN(Number(v))) return '-';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(v));
  };

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

      <div
        style={{
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: 'var(--admin-text-muted, rgba(255,255,255,0.7))' }}>Total: {tipos.length}</div>
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
      </div>

      <div
        style={{
          background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
          border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(239, 68, 68, 0.1)', borderBottom: '2px solid rgba(239, 68, 68, 0.3)' }}>
              <th style={{ 
                padding: '16px 20px', 
                color: 'var(--admin-text-primary, #fff)', 
                textAlign: 'left', 
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                width: '35%'
              }}>
                Nombre
              </th>
              <th style={{ 
                padding: '16px 20px', 
                color: 'var(--admin-text-primary, #fff)', 
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                width: '15%'
              }}>
                Duración
              </th>
              <th style={{ 
                padding: '16px 20px', 
                color: 'var(--admin-text-primary, #fff)', 
                textAlign: 'right',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                width: '20%'
              }}>
                Precio
              </th>
              <th style={{ 
                padding: '16px 20px', 
                color: 'var(--admin-text-primary, #fff)', 
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                width: '15%'
              }}>
                Estado
              </th>
              <th style={{ 
                padding: '16px 20px', 
                color: 'var(--admin-text-primary, #fff)', 
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.5px',
                width: '15%'
              }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((t, index) => (
              <tr
                key={t.id_tipo_curso}
                style={{
                  borderBottom: index < tipos.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <td style={{ 
                  padding: '16px 20px', 
                  color: 'var(--admin-text-primary, #fff)',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  {t.nombre}
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', 
                  textAlign: 'center',
                  fontSize: '0.9rem'
                }}>
                  {t.duracion_meses != null ? `${t.duracion_meses} meses` : '-'}
                </td>
                <td style={{ 
                  padding: '16px 20px', 
                  color: 'var(--admin-text-secondary, rgba(255,255,255,0.9))', 
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  {formatPrice(t.precio_base ?? null)}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      borderRadius: 12,
                      background: t.estado === 'activo' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: t.estado === 'activo' ? '#10b981' : '#ef4444',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {t.estado || 'activo'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      onClick={() => openEdit(t)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id_tipo_curso)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '8px 12px',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!loading && tipos.length === 0 && (
          <div style={{ 
            color: 'var(--admin-text-muted, rgba(255,255,255,0.6))', 
            padding: '40px 20px',
            textAlign: 'center',
            fontSize: '0.95rem'
          }}>
            No hay tipos de curso registrados
          </div>
        )}
        {loading && (
          <div style={{ 
            color: 'var(--admin-text-muted, rgba(255,255,255,0.6))', 
            padding: '40px 20px',
            textAlign: 'center',
            fontSize: '0.95rem'
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
            borderTop: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
      </div>

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
