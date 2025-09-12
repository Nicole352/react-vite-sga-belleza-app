import { useEffect, useState } from 'react';
import { 
  Search, GraduationCap, Eye, X, Check, XCircle, Download
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';

type Solicitud = {
  id_solicitud: number;
  codigo_solicitud: string;
  cedula_solicitante?: string;
  nombre_solicitante: string;
  apellido_solicitante: string;
  telefono_solicitante?: string;
  email_solicitante: string;
  fecha_nacimiento_solicitante?: string | null;
  direccion_solicitante?: string | null;
  genero_solicitante?: string | null;
  id_curso: number;
  monto_matricula: number;
  metodo_pago: 'transferencia' | 'paypal';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'observaciones';
  fecha_solicitud: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionMatricula = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | Solicitud['estado']>('pendiente');
  const [tipos, setTipos] = useState<Array<{ id_tipo_curso: number; nombre: string; codigo?: string }>>([]);
  const [filterTipo, setFilterTipo] = useState<number | 'todos'>('todos');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [decidiendo, setDecidiendo] = useState(false);
  const [cursos, setCursos] = useState<Array<{ id_curso: number; nombre: string; estado: string }>>([]);

  const fetchCursos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cursos?limit=100`);
      if (!res.ok) return;
      const data = await res.json();
      const cursosList = Array.isArray(data) ? data : [];
      setCursos(cursosList.map((c: any) => ({ 
        id_curso: c.id_curso, 
        nombre: c.nombre, 
        estado: c.estado 
      })));
    } catch {}
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const estado = filterEstado === 'todos' ? 'pendiente' : filterEstado; // default a pendientes
      const tipoQS = filterTipo === 'todos' ? '' : `&tipo=${filterTipo}`;
      const res = await fetch(`${API_BASE}/api/solicitudes?estado=${encodeURIComponent(estado)}&limit=50${tipoQS}`);
      if (!res.ok) throw new Error('No se pudo cargar solicitudes');
      const data = await res.json();
      setSolicitudes(data);
    } catch (e: any) {
      setError(e.message || 'Error cargando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchSolicitudes(); 
    fetchCursos();
  }, [filterEstado, filterTipo]);

  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tipos-cursos?estado=activo&limit=200`);
      if (!res.ok) return; // opcional
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setTipos(list.map((t: any) => ({ id_tipo_curso: t.id_tipo_curso, nombre: t.nombre, codigo: t.codigo })));
    } catch {}
  };

  useEffect(() => { fetchTipos(); }, []);

  const openModal = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/solicitudes/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener la solicitud');
      const data = await res.json();
      setSelected(data);
      setShowModal(true);
    } catch (e: any) {
      setError(e.message || 'Error abriendo solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (estado: 'aprobado' | 'rechazado' | 'observaciones', observaciones?: string) => {
    if (!selected) return;
    try {
      setDecidiendo(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/solicitudes/${selected.id_solicitud}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, observaciones: observaciones || null, verificado_por: null })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'No se pudo actualizar la solicitud');
      }
      setShowModal(false);
      setSelected(null);
      await fetchSolicitudes();
    } catch (e: any) {
      setError(e.message || 'Error actualizando estado');
    } finally {
      setDecidiendo(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const fullName = `${s.nombre_solicitante} ${s.apellido_solicitante}`.toLowerCase();
    const haystack = [
      fullName,
      s.email_solicitante?.toLowerCase?.() || '',
      s.cedula_solicitante || '',
      (s as any).curso_nombre?.toLowerCase?.() || '',
      (s as any).tipo_curso_nombre?.toLowerCase?.() || ''
    ].join(' ');
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || s.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <GraduationCap size={32} color="#ef4444" />
          Gestión de Matrículas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra las matrículas y credenciales de acceso de los estudiantes
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text" placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ minWidth: 180 }}>
              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as any)}
                options={[
                  { value: 'todos', valueOf: undefined as any, label: 'Todos' } as any,
                  { value: 'pendiente', label: 'Pendiente' },
                  { value: 'aprobado', label: 'Aprobado' },
                  { value: 'rechazado', label: 'Rechazado' },
                  { value: 'observaciones', label: 'Observaciones' },
                ]}
              />
            </div>
            <div style={{ minWidth: 220 }}>
              <StyledSelect
                name="filterTipo"
                value={String(filterTipo)}
                onChange={(e) => setFilterTipo(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
                options={[
                  { value: 'todos', label: 'Todos los tipos' },
                  ...tipos.map(t => ({ value: t.id_tipo_curso, label: t.nombre }))
                ]}
              />
            </div>
            <button onClick={fetchSolicitudes} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>Refrescar</button>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {loading && (<div style={{ color: 'rgba(255,255,255,0.7)' }}>Cargando...</div>)}
        {error && (<div style={{ color: '#ef4444' }}>{error}</div>)}
        {!loading && solicitudesFiltradas.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>No hay solicitudes</div>
        )}
        {solicitudesFiltradas.map((sol) => (
          <div key={sol.id_solicitud} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {sol.nombre_solicitante} {sol.apellido_solicitante}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Cédula</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{sol.cedula_solicitante || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{sol.email_solicitante}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                    <div style={{ 
                      color: '#fff', 
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {(sol as any).curso_nombre || `#${sol.id_curso}`}
                      {(() => {
                        const curso = cursos.find(c => c.id_curso === sol.id_curso);
                        if (curso?.estado === 'cancelado') {
                          return (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}>
                              🔒 BLOQUEADO
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  {(sol as any).tipo_curso_nombre && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Tipo</div>
                      <div style={{ color: '#fff', fontSize: '0.9rem' }}>{(sol as any).tipo_curso_nombre}</div>
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => openModal(sol.id_solicitud)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }}>
                <Eye size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detalle Solicitud */}
      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 16, width: 'min(840px, 92vw)', padding: 24, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Solicitud {selected.codigo_solicitud}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Solicitante</div>
                <div style={{ color: '#fff' }}>{selected.nombre_solicitante} {selected.apellido_solicitante}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Email</div>
                <div style={{ color: '#fff' }}>{selected.email_solicitante}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Cédula</div>
                <div style={{ color: '#fff' }}>{selected.cedula_solicitante || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                <div style={{ color: '#fff' }}>{selected.telefono_solicitante || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Dirección</div>
                <div style={{ color: '#fff' }}>{selected.direccion_solicitante || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Curso</div>
                <div style={{ color: '#fff' }}>{(selected as any).curso_nombre || `#${selected.id_curso}`}</div>
              </div>
              {(selected as any).tipo_curso_nombre && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Tipo</div>
                  <div style={{ color: '#fff' }}>{(selected as any).tipo_curso_nombre}</div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Monto</div>
                <div style={{ color: '#fff' }}>${selected.monto_matricula?.toLocaleString?.() || selected.monto_matricula}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Método de pago</div>
                <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selected.metodo_pago}</div>
              </div>
            </div>

            {/* Comprobante */}
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ margin: 0, color: '#fff' }}>Comprobante</h4>
                <a href={`${API_BASE}/api/solicitudes/${selected.id_solicitud}/comprobante`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none' }}>
                  <Download size={16} /> Ver/Descargar
                </a>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Abre el comprobante en una nueva pestaña para verificar la transferencia.</p>
            </div>

            {(() => {
              const curso = cursos.find(c => c.id_curso === selected.id_curso);
              const cursoBlocked = curso?.estado === 'cancelado';
              
              if (cursoBlocked) {
                return (
                  <div style={{ marginTop: 24 }}>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>🔒</span>
                        <h4 style={{ color: '#ef4444', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                          Curso Bloqueado
                        </h4>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.9rem' }}>
                        Este curso está temporalmente bloqueado. Las matrículas están suspendidas hasta que se reactive el curso.
                        Solo se pueden rechazar solicitudes pendientes.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleDecision('rechazado')} disabled={decidiendo} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <XCircle size={16} /> Rechazar
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button onClick={() => handleDecision('rechazado')} disabled={decidiendo} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={16} /> Rechazar
                  </button>
                  <button onClick={() => handleDecision('aprobado')} disabled={decidiendo} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} /> Aprobar
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMatricula;
