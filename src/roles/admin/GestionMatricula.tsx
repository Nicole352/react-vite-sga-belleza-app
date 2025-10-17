import { useState, useEffect } from 'react';
import { 
  Search, GraduationCap, Eye, X, Check, XCircle, Download, FileText, IdCard, Clock, CheckCircle2, AlertCircle, Ban, FileCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';
type Solicitud = {
  id_solicitud: number;
  codigo_solicitud: string;
  identificacion_solicitante?: string;
  nombre_solicitante: string;
  apellido_solicitante: string;
  telefono_solicitante?: string;
  email_solicitante: string;
  fecha_nacimiento_solicitante?: string | null;
  direccion_solicitante?: string | null;
  genero_solicitante?: string | null;
  horario_preferido?: 'matutino' | 'vespertino';
  id_curso: number;
  monto_matricula: number;
  metodo_pago: 'transferencia' | 'efectivo' | 'payphone';
  // Nuevos campos del comprobante
  numero_comprobante?: string;
  banco_comprobante?: string;
  fecha_transferencia?: string;
  id_estudiante_existente?: number | null;
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
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState<Solicitud | null>(null);
  const [generatedUsername, setGeneratedUsername] = useState<string>('');
  const [cursos, setCursos] = useState<Array<{ id_curso: number; nombre: string; estado: string }>>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [counters, setCounters] = useState({ pendiente: 0, aprobado: 0, rechazado: 0, observaciones: 0 });

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

  // Contadores agregados independientes del filtro de estado
  const fetchCounters = async () => {
    try {
      const params = new URLSearchParams();
      params.set('aggregate', 'by_estado');
      if (filterTipo !== 'todos') {
        params.set('tipo', String(filterTipo));
      }
      const res = await fetch(`${API_BASE}/api/solicitudes?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      // Validar y aplicar defaults
      setCounters({
        pendiente: Number(data?.pendiente || 0),
        aprobado: Number(data?.aprobado || 0),
        rechazado: Number(data?.rechazado || 0),
        observaciones: Number(data?.observaciones || 0),
      });
    } catch {}
  };

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Construir query dinámicamente: si es "todos", no enviar estado para traer todas
      const params = new URLSearchParams();
      if (filterEstado !== 'todos') {
        params.set('estado', filterEstado);
      }
      params.set('limit', String(limit));
      params.set('page', String(page));
      if (filterTipo !== 'todos') {
        params.set('tipo', String(filterTipo));
      }
      const res = await fetch(`${API_BASE}/api/solicitudes?${params.toString()}`);
      if (!res.ok) throw new Error('No se pudo cargar solicitudes');
      const totalHeader = Number(res.headers.get('X-Total-Count') || 0);
      setTotalCount(Number.isFinite(totalHeader) ? totalHeader : 0);
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
  }, [filterEstado, filterTipo, page, limit]);

  // Cargar counters al inicio y cuando cambia el tipo (no depende del estado)
  useEffect(() => {
    fetchCounters();
  }, [filterTipo]);

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

  const openComprobanteModal = (solicitudId: number, numeroComprobante?: string) => {
    const url = `${API_BASE}/api/solicitudes/${solicitudId}/comprobante`;
    setComprobanteUrl(url);
    setComprobanteNumero(numeroComprobante || '');
    setShowComprobanteModal(true);
  };

  // Función para generar username automáticamente (versión simplificada)
  const generateUsername = (nombre: string, apellido: string): string => {
    try {
      // Extraer iniciales del nombre (todas las palabras)
      const nombreParts = nombre.trim().split(' ').filter(part => part.length > 0);
      const inicialesNombre = nombreParts.map(part => part.charAt(0).toLowerCase()).join('');
      
      // Extraer primer apellido
      const apellidoParts = apellido.trim().split(' ').filter(part => part.length > 0);
      const primerApellido = apellidoParts[0]?.toLowerCase() || '';
      
      // Crear username base
      const baseUsername = inicialesNombre + primerApellido;
      
      // Por ahora devolver el username base (luego implementaremos la validación en backend)
      return baseUsername;
    } catch (error) {
      console.error('Error generando username:', error);
      // Fallback en caso de error
      const inicialesNombre = nombre.charAt(0).toLowerCase();
      const primerApellido = apellido.split(' ')[0]?.toLowerCase() || '';
      return inicialesNombre + primerApellido;
    }
  };

  // Función para abrir modal de aprobación
  const openApprovalModal = (solicitud: Solicitud) => {
    console.log('Datos de la solicitud para aprobar:', solicitud);
    console.log('Campos específicos:', {
      nombre: solicitud.nombre_solicitante,
      apellido: solicitud.apellido_solicitante,
      telefono: solicitud.telefono_solicitante,
      email: solicitud.email_solicitante,
      identificacion: solicitud.identificacion_solicitante,
      fecha_nacimiento: solicitud.fecha_nacimiento_solicitante,
      horario: solicitud.horario_preferido,
      tipo_curso: (solicitud as any).tipo_curso_nombre
    });
    
    setApprovalData(solicitud);
    
    // Generar username automáticamente
    const username = generateUsername(solicitud.nombre_solicitante, solicitud.apellido_solicitante);
    setGeneratedUsername(username);
    
    setShowApprovalModal(true);
  };

  // Función para crear estudiante desde solicitud aprobada
  const handleCreateStudent = async () => {
    if (!approvalData) return;
    
    try {
      setDecidiendo(true);
      
      const response = await fetch(`${API_BASE}/api/estudiantes/crear-desde-solicitud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_solicitud: approvalData.id_solicitud,
          aprobado_por: 1 // TODO: Obtener del contexto de usuario logueado
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando estudiante');
      }
      
      const data = await response.json();
      
      // Notificación de éxito - diferente según si es estudiante nuevo o existente
      if (approvalData?.id_estudiante_existente) {
        // CASO: Estudiante existente - Solo se creó matrícula
        toast.success(
          <div style={{ lineHeight: '1.6' }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} />
              Matrícula aprobada exitosamente
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              <div><strong>Estudiante:</strong> {data.estudiante.nombre} {data.estudiante.apellido}</div>
              <div><strong>Usuario:</strong> {data.estudiante.username}</div>
              <div style={{ marginTop: '6px', padding: '8px', background: 'rgba(59, 130, 246, 0.15)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '600' }}>
                  El estudiante usará sus credenciales existentes
                </div>
              </div>
            </div>
          </div>,
          {
            duration: 6000,
            style: {
              minWidth: '420px',
            },
            icon: <CheckCircle2 size={24} />,
          }
        );
      } else {
        // CASO: Estudiante nuevo - Se creó usuario + matrícula
        toast.success(
          <div style={{ lineHeight: '1.6' }}>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} />
              Estudiante creado exitosamente
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>
              <div><strong>Nombre:</strong> {data.estudiante.nombre} {data.estudiante.apellido}</div>
              <div><strong>Usuario:</strong> {data.estudiante.username}</div>
              <div><strong>Email:</strong> {data.estudiante.email}</div>
              <div style={{ marginTop: '6px', color: '#fbbf24', fontWeight: '600' }}>
                <strong>Contraseña:</strong> {data.estudiante.password_temporal}
              </div>
            </div>
          </div>,
          {
            duration: 8000,
            style: {
              minWidth: '420px',
            },
            icon: <CheckCircle2 size={24} />,
          }
        );
      }
      
      // Cerrar modal y refrescar datos
      setShowApprovalModal(false);
      setApprovalData(null);
      setGeneratedUsername('');
      
      // Refrescar lista de solicitudes
      await fetchSolicitudes();
      await fetchCounters();
      
    } catch (error: any) {
      console.error('Error creando estudiante:', error);
      toast.error(`Error: ${error.message}`, {
        duration: 5000,
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setDecidiendo(false);
    }
  };

  const handleDecision = async (estado: 'aprobado' | 'rechazado' | 'observaciones', observaciones?: string, solicitudId?: number) => {
    const targetId = solicitudId || selected?.id_solicitud;
    if (!targetId) return;
    
    try {
      setDecidiendo(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/solicitudes/${targetId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, observaciones: observaciones || null, verificado_por: null })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'No se pudo actualizar la solicitud');
      }
      
      // Solo cerrar modal si se actualizó desde el modal
      if (!solicitudId) {
        setShowModal(false);
        setSelected(null);
      }
      
      await fetchSolicitudes();
      await fetchCounters();
      
      // Notificación según el estado
      if (estado === 'aprobado') {
        toast.success('Solicitud aprobada correctamente', {
          icon: <CheckCircle2 size={20} />,
        });
      } else if (estado === 'rechazado') {
        toast.error('Solicitud rechazada', {
          icon: <Ban size={20} />,
        });
      } else {
        toast('Observaciones agregadas', {
          icon: <FileCheck size={20} />,
          style: {
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            color: '#fbbf24',
            backdropFilter: 'blur(10px)',
          },
        });
      }
    } catch (e: any) {
      setError(e.message || 'Error actualizando estado');
      toast.error(`${e.message || 'Error actualizando estado'}`, {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setDecidiendo(false);
    }
  };

  const solicitudesFiltradas = solicitudes
    .filter((s) => {
      const fullName = `${s.nombre_solicitante} ${s.apellido_solicitante}`.toLowerCase();
      const haystack = [
        fullName,
        s.email_solicitante?.toLowerCase?.() || '',
        s.identificacion_solicitante || '',
        (s as any).curso_nombre?.toLowerCase?.() || '',
        (s as any).tipo_curso_nombre?.toLowerCase?.() || ''
      ].join(' ');
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesEstado = filterEstado === 'todos' || s.estado === filterEstado;
      return matchesSearch && matchesEstado;
    })
    .sort((a, b) => {
      // Ordenar por fecha de solicitud, más antiguos primero
      const dateA = new Date(a.fecha_solicitud).getTime();
      const dateB = new Date(b.fecha_solicitud).getTime();
      return dateA - dateB;
    });

  const totalPages = Math.ceil(solicitudesFiltradas.length / limit);
  const paginatedSolicitudes = solicitudesFiltradas.slice((page - 1) * limit, page * limit);

  // Los contadores ahora vienen del backend (counters)

  // Resetear página cuando cambian filtros principales
  useEffect(() => {
    setPage(1);
  }, [filterEstado, filterTipo]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 6px 0',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <GraduationCap size={26} color="#ef4444" />
          Gestión de Matrículas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.85rem' }}>
          Administra las matrículas y credenciales de acceso de los estudiantes
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '16px', padding: '16px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text" placeholder="Buscar por nombre, email o cédula..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '10px 10px 10px 38px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px', color: '#fff', fontSize: '0.8rem'
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
            <button onClick={fetchSolicitudes} style={{ padding: '8px 14px', fontSize: '0.8rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: 'pointer' }}>Refrescar</button>
          </div>
        </div>
        {/* Counters + Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
          {/* Counters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              padding: '5px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(156, 163, 175, 0.15)', border: '1px solid rgba(156, 163, 175, 0.3)', color: '#9ca3af'
            }}>Pendiente: {counters.pendiente}</span>
            <span style={{
              padding: '5px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981'
            }}>Aprobado: {counters.aprobado}</span>
            <span style={{
              padding: '5px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444'
            }}>Rechazado: {counters.rechazado}</span>
            <span style={{
              padding: '5px 8px', borderRadius: 9999, fontSize: '0.7rem', fontWeight: 700,
              background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.3)', color: '#fbbf24'
            }}>Observaciones: {counters.observaciones}</span>
          </div>
          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Por página:</span>
              <div style={{ minWidth: 100 }}>
                <StyledSelect
                  name="limit"
                  value={String(limit)}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  options={[
                    { value: '10', label: '10' },
                    { value: '20', label: '20' },
                    { value: '50', label: '50' },
                  ]}
                />
              </div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginLeft: 6 }}>Total: {totalCount}</span>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              padding: '7px 10px', fontSize: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer'
            }}>Anterior</button>
            <span style={{ color: 'rgba(255,255,255,0.8)' }}>Página {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={(page * limit) >= totalCount} style={{
              padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.06)', color: '#fff', cursor: solicitudes.length < limit ? 'not-allowed' : 'pointer'
            }}>Siguiente</button>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes */}
      <div style={{ display: 'grid', gap: '14px' }}>
        {loading && (<div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Cargando...</div>)}
        {error && (<div style={{ color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>)}
        {!loading && solicitudesFiltradas.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>No hay solicitudes</div>
        )}
{paginatedSolicitudes.map((sol) => {
          // Formatear fecha de solicitud
          const formatearFecha = (fechaString: string) => {
            const fecha = new Date(fechaString);
            const meses = [
              'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
              'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            const dia = fecha.getDate();
            const mes = meses[fecha.getMonth()];
            const año = fecha.getFullYear();
            return `${dia}/${mes}/${año}`;
          };

          return (
            <div key={sol.id_solicitud} style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px', padding: '16px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
            }}>
              {/* Información Principal */}
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {sol.nombre_solicitante} {sol.apellido_solicitante}
                </h3>
                
                {/* Primera fila - Información básica */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                  gap: '12px',
                  marginBottom: '10px'
                }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '3px' }}>Identificación</div>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>{sol.identificacion_solicitante || '-'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '3px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>{sol.email_solicitante}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '3px' }}>Fecha de Solicitud</div>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>{formatearFecha(sol.fecha_solicitud)}</div>
                  </div>
                  {(sol as any).tipo_curso_nombre && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '3px' }}>Tipo de Curso</div>
                      <div style={{ color: '#fff', fontSize: '0.8rem' }}>{(sol as any).tipo_curso_nombre}</div>
                    </div>
                  )}
                </div>

                {/* Segunda fila - Número, Comprobante y Estado separados */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: sol.metodo_pago === 'efectivo' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', 
                  gap: '10px',
                  alignItems: 'start'
                }}>
                  {/* Número de comprobante - Campo separado */}
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '3px' }}>Número Comprobante</div>
                    {sol.numero_comprobante ? (
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        color: '#fbbf24',
                        padding: '5px 6px',
                        borderRadius: '5px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        {sol.numero_comprobante}
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(107, 114, 128, 0.1)',
                        border: '1px solid rgba(107, 114, 128, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        padding: '5px 6px',
                        borderRadius: '5px',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        width: '100%'
                      }}>
                        {sol.metodo_pago === 'transferencia' ? 'Sin número' : 'N/A'}
                      </div>
                    )}
                  </div>

                  {/* Recibido por - Solo para efectivo */}
                  {sol.metodo_pago === 'efectivo' && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Recibido por</div>
                      {(sol as any).recibido_por ? (
                        <div style={{
                          background: 'rgba(180, 83, 9, 0.1)',
                          border: '1px solid rgba(180, 83, 9, 0.3)',
                          color: '#b45309',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          width: '100%'
                        }}>
                          {(sol as any).recibido_por}
                        </div>
                      ) : (
                        <div style={{
                          background: 'rgba(107, 114, 128, 0.1)',
                          border: '1px solid rgba(107, 114, 128, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          textAlign: 'center',
                          fontStyle: 'italic',
                          width: '100%'
                        }}>
                          Sin registro
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comprobante - Solo botón */}
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Comprobante</div>
                    <button
                      onClick={() => openComprobanteModal(sol.id_solicitud, sol.numero_comprobante)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        justifyContent: 'center'
                      }}
                    >
                      <Download size={14} />
                      Ver Comprobante
                    </button>
                  </div>

                  {/* Estado - Campo separado */}
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Estado</div>
                    <div style={{ 
                      display: 'flex',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: sol.estado === 'aprobado' ? 'rgba(16, 185, 129, 0.15)' :
                                 sol.estado === 'rechazado' ? 'rgba(239, 68, 68, 0.15)' :
                                 sol.estado === 'observaciones' ? 'rgba(251, 191, 36, 0.15)' :
                                 'rgba(156, 163, 175, 0.15)',
                      border: sol.estado === 'aprobado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                             sol.estado === 'rechazado' ? '1px solid rgba(239, 68, 68, 0.3)' :
                             sol.estado === 'observaciones' ? '1px solid rgba(251, 191, 36, 0.3)' :
                             '1px solid rgba(156, 163, 175, 0.3)',
                      color: sol.estado === 'aprobado' ? '#10b981' :
                            sol.estado === 'rechazado' ? '#ef4444' :
                            sol.estado === 'observaciones' ? '#fbbf24' :
                            '#9ca3af'
                    }}>
                      {sol.estado}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción - Parte Inferior */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '16px'
              }}>
                <button 
                  onClick={() => openModal(sol.id_solicitud)} 
                  style={{ 
                    background: 'rgba(59, 130, 246, 0.15)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    color: '#3b82f6', 
                    padding: '10px 16px', 
                    borderRadius: '10px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  <Eye size={16} />
                  Ver
                </button>
                {sol.estado === 'pendiente' && (
                  <>
                    <button 
                      onClick={() => openApprovalModal(sol)} 
                      disabled={decidiendo}
                      style={{ 
                        background: 'rgba(16, 185, 129, 0.15)', 
                        border: '1px solid rgba(16, 185, 129, 0.3)', 
                        color: '#10b981', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: decidiendo ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: decidiendo ? 0.6 : 1,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      <Check size={14} />
                      Aprobar
                    </button>
                    <button 
                      onClick={() => handleDecision('rechazado', undefined, sol.id_solicitud)} 
                      disabled={decidiendo}
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.15)', 
                        border: '1px solid rgba(239, 68, 68, 0.3)', 
                        color: '#ef4444', 
                        padding: '8px 12px', 
                        borderRadius: '8px', 
                        cursor: decidiendo ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: decidiendo ? 0.6 : 1,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      <XCircle size={14} />
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {!loading && solicitudesFiltradas.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          marginTop: '24px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Página {page} de {totalPages} • Total: {solicitudesFiltradas.length} solicitudes
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                  background: page === pageNum ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.08)',
                  border: page === pageNum ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
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

      {/* Modal Detalle Solicitud */}
      {showModal && selected && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            padding: '18px 28px 22px 28px',
            color: '#fff',
            margin: '0 auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>Solicitud {selected.codigo_solicitud}</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Nombre Completo</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>{selected.nombre_solicitante} {selected.apellido_solicitante}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Identificación</div>
                <div style={{ color: '#fff' }}>{selected.identificacion_solicitante || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Email</div>
                <div style={{ color: '#fff' }}>{selected.email_solicitante}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                <div style={{ color: '#fff' }}>{selected.telefono_solicitante || '-'}</div>
              </div>
              {selected.fecha_nacimiento_solicitante && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                  <div style={{ color: '#fff' }}>
                    {(() => {
                      const fecha = new Date(selected.fecha_nacimiento_solicitante);
                      const meses = [
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                      ];
                      const dia = fecha.getDate();
                      const mes = meses[fecha.getMonth()];
                      const año = fecha.getFullYear();
                      return `${dia}/${mes}/${año}`;
                    })()}
                  </div>
                </div>
              )}
              {selected.genero_solicitante && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Género</div>
                  <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selected.genero_solicitante}</div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Dirección</div>
                <div style={{ color: '#fff' }}>{selected.direccion_solicitante || '-'}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Solicitud</div>
                <div style={{ color: '#fff' }}>
                  {(() => {
                    const fecha = new Date(selected.fecha_solicitud);
                    const meses = [
                      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ];
                    const dia = fecha.getDate();
                    const mes = meses[fecha.getMonth()];
                    const año = fecha.getFullYear();
                    return `${dia}/${mes}/${año}`;
                  })()}
                </div>
              </div>
              {(selected as any).tipo_curso_nombre && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Tipo de Curso</div>
                  <div style={{ color: '#fff' }}>{(selected as any).tipo_curso_nombre}</div>
                </div>
              )}
              {selected.horario_preferido && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Horario Preferido</div>
                  <div style={{ 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    textTransform: 'capitalize'
                  }}>
                    <Clock size={16} color="#fbbf24" />
                    {selected.horario_preferido}
                  </div>
                </div>
              )}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Monto de Matrícula</div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.1rem' }}>${selected.monto_matricula?.toLocaleString?.() || selected.monto_matricula}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Método de Pago</div>
                <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selected.metodo_pago}</div>
              </div>
              
              {/* Información del comprobante - para transferencia */}
              {selected.metodo_pago === 'transferencia' && (
                <>
                  {selected.numero_comprobante && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Número de Comprobante</div>
                      <div style={{ 
                        color: '#fbbf24', 
                        fontWeight: '600', 
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        {selected.numero_comprobante}
                      </div>
                    </div>
                  )}
                  {selected.banco_comprobante && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Banco</div>
                      <div style={{ color: '#fff', textTransform: 'capitalize' }}>{selected.banco_comprobante}</div>
                    </div>
                  )}
                  {selected.fecha_transferencia && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Transferencia</div>
                      <div style={{ color: '#fff' }}>
                        {(() => {
                          const fecha = new Date(selected.fecha_transferencia);
                          const meses = [
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                          ];
                          const dia = fecha.getDate();
                          const mes = meses[fecha.getMonth()];
                          const año = fecha.getFullYear();
                          return `${dia} de ${mes}, ${año}`;
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Información del comprobante - para efectivo */}
              {selected.metodo_pago === 'efectivo' && (
                <>
                  {selected.numero_comprobante && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Número de Comprobante</div>
                      <div style={{ 
                        color: '#fbbf24', 
                        fontWeight: '600', 
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                        background: 'rgba(251, 191, 36, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        {selected.numero_comprobante}
                      </div>
                    </div>
                  )}
                  {(selected as any).recibido_por && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Recibido por</div>
                      <div style={{ 
                        color: '#b45309', 
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        background: 'rgba(180, 83, 9, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid rgba(180, 83, 9, 0.3)'
                      }}>
                        {(selected as any).recibido_por}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Estado</div>
                <div style={{ 
                  display: 'inline-flex',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  background: selected.estado === 'aprobado' ? 'rgba(16, 185, 129, 0.15)' :
                             selected.estado === 'rechazado' ? 'rgba(239, 68, 68, 0.15)' :
                             selected.estado === 'observaciones' ? 'rgba(251, 191, 36, 0.15)' :
                             'rgba(156, 163, 175, 0.15)',
                  border: selected.estado === 'aprobado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                         selected.estado === 'rechazado' ? '1px solid rgba(239, 68, 68, 0.3)' :
                         selected.estado === 'observaciones' ? '1px solid rgba(251, 191, 36, 0.3)' :
                         '1px solid rgba(156, 163, 175, 0.3)',
                  color: selected.estado === 'aprobado' ? '#10b981' :
                        selected.estado === 'rechazado' ? '#ef4444' :
                        selected.estado === 'observaciones' ? '#fbbf24' :
                        '#9ca3af'
                }}>
                  {selected.estado}
                </div>
              </div>
            </div>

            {/* Comprobante */}
            <div style={{ marginTop: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} color="#10b981" />
                Comprobante de Pago
              </h4>
              <div style={{ marginBottom: '12px' }}>
                <a 
                  href={`${API_BASE}/api/solicitudes/${selected.id_solicitud}/comprobante`} 
                  target="_blank" 
                  rel="noreferrer" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    padding: '10px 16px', 
                    borderRadius: 8, 
                    border: '1px solid rgba(16, 185, 129, 0.3)', 
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981', 
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <Download size={16} /> Ver/Descargar Comprobante
                </a>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '0.8rem' }}>
                Abre el comprobante en una nueva pestaña para verificar la transferencia.
              </p>
            </div>

            {/* Documentos */}
            <div style={{ marginTop: 16, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#3b82f6" />
                Documentos
              </h4>
              
              {(() => {
                // Determinar si es extranjero basado en la cédula (si no tiene formato ecuatoriano, es extranjero)
                const esEcuatoriano = selected.identificacion_solicitante && /^\d{10}$/.test(selected.identificacion_solicitante);
                
                if (esEcuatoriano) {
                  // Solo mostrar documento de identificación para ecuatorianos
                  return (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IdCard size={14} color="#3b82f6" />
                        Documento de Identificación
                      </div>
                      <a 
                        href={`${API_BASE}/api/solicitudes/${selected.id_solicitud}/documento-identificacion`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 8, 
                          padding: '8px 12px', 
                          borderRadius: 8, 
                          border: '1px solid rgba(59, 130, 246, 0.3)', 
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6', 
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        <Download size={14} /> Ver/Descargar Identificación
                      </a>
                    </div>
                  );
                } else {
                  // Mostrar ambos documentos para extranjeros
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <IdCard size={14} color="#3b82f6" />
                          Copia de Pasaporte
                        </div>
                        <a 
                          href={`${API_BASE}/api/solicitudes/${selected.id_solicitud}/documento-identificacion`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            padding: '8px 12px', 
                            borderRadius: 8, 
                            border: '1px solid rgba(59, 130, 246, 0.3)', 
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6', 
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}
                        >
                          <Download size={14} /> Ver/Descargar
                        </a>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} color="#3b82f6" />
                          Documento de Estatus Legal
                        </div>
                        <a 
                          href={`${API_BASE}/api/solicitudes/${selected.id_solicitud}/documento-estatus-legal`} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            padding: '8px 12px', 
                            borderRadius: 8, 
                            border: '1px solid rgba(59, 130, 246, 0.3)', 
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6', 
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: '500'
                          }}
                        >
                          <Download size={14} /> Ver/Descargar
                        </a>
                      </div>
                    </div>
                  );
                }
              })()}
              
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: '12px 0 0 0', fontSize: '0.8rem' }}>
                Haz clic en los enlaces para abrir los documentos en una nueva pestaña.
              </p>
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
                        <Lock size={20} />
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

              // Solo mostrar botones si el estado es 'pendiente'
              if (selected.estado !== 'pendiente') {
                return (
                  <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <div style={{
                      background: selected.estado === 'aprobado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: selected.estado === 'aprobado' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'inline-block'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>
                          {selected.estado === 'aprobado' ? <CheckCircle2 size={28} color="#10b981" /> : selected.estado === 'rechazado' ? <XCircle size={28} color="#ef4444" /> : <AlertCircle size={28} color="#f59e0b" />}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ 
                            color: selected.estado === 'aprobado' ? '#10b981' : '#ef4444', 
                            margin: '0 0 4px 0', 
                            fontSize: '1rem', 
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            Solicitud {selected.estado}
                          </h4>
                          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.85rem' }}>
                            {selected.estado === 'aprobado' 
                              ? 'Esta solicitud ya fue aprobada y el estudiante fue creado exitosamente.'
                              : selected.estado === 'rechazado'
                              ? 'Esta solicitud fue rechazada anteriormente.'
                              : 'Esta solicitud tiene observaciones pendientes.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button 
                    onClick={() => handleDecision('rechazado')} 
                    disabled={decidiendo} 
                    style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)', 
                      color: '#ef4444', 
                      padding: '12px 20px', 
                      borderRadius: 12, 
                      cursor: decidiendo ? 'not-allowed' : 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8,
                      opacity: decidiendo ? 0.6 : 1,
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}
                  >
                    <XCircle size={16} /> Rechazar
                  </button>
                  <button 
                    onClick={() => handleDecision('aprobado')} 
                    disabled={decidiendo} 
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981, #059669)', 
                      border: 'none', 
                      color: '#fff', 
                      padding: '12px 20px', 
                      borderRadius: 12, 
                      cursor: decidiendo ? 'not-allowed' : 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 8,
                      opacity: decidiendo ? 0.6 : 1,
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}
                  >
                    <Check size={16} /> Aprobar
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {showComprobanteModal && (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: '12px', 
            width: '100%',
            maxWidth: '800px',
            maxHeight: '90vh',
            padding: '18px 28px 22px 28px', 
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  <Download size={20} />
                  Comprobante de Pago
                </h3>
                {comprobanteNumero && (
                  <p style={{ 
                    margin: '6px 0 0 28px', 
                    color: '#fbbf24', 
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    Número: {comprobanteNumero}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowComprobanteModal(false)} 
                style={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
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
            
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px',
              overflow: 'hidden'
            }}>
              <img 
                src={comprobanteUrl} 
                alt="Comprobante de pago"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = `
                    <div style="text-align: center; color: rgba(255,255,255,0.7);">
                      <p>No se pudo cargar la imagen del comprobante</p>
                      <a href="${comprobanteUrl}" target="_blank" style="color: #10b981; text-decoration: underline;">
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  `;
                  (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                }}
              />
            </div>
            
            <div style={{ 
              marginTop: '16px', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px' 
            }}>
              <a 
                href={comprobanteUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <Download size={16} />
                Descargar
              </a>
              <button
                onClick={() => setShowComprobanteModal(false)}
                style={{
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  color: '#9ca3af',
                  padding: '10px 16px',
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

      {/* Modal de Aprobación */}
      {showApprovalModal && approvalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '800px',
            padding: '18px 28px 22px 28px',
            color: '#fff',
            margin: '0 auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                <Check size={20} />
                {approvalData?.id_estudiante_existente ? 'Crear Matrícula' : 'Crear Estudiante'}
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Nombres - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Nombres</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>
                  {(approvalData?.nombre_solicitante && approvalData.nombre_solicitante.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Apellidos - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Apellidos</div>
                <div style={{ color: '#fff', fontWeight: '600' }}>
                  {(approvalData?.apellido_solicitante && approvalData.apellido_solicitante.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Identificación - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Identificación</div>
                <div style={{ color: '#fff' }}>
                  {(approvalData?.identificacion_solicitante && approvalData.identificacion_solicitante.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Email - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Email</div>
                <div style={{ color: '#fff' }}>
                  {(approvalData?.email_solicitante && approvalData.email_solicitante.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Teléfono - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Teléfono</div>
                <div style={{ color: '#fff' }}>
                  {(approvalData?.telefono_solicitante && approvalData.telefono_solicitante.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Fecha de Nacimiento - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Fecha de Nacimiento</div>
                <div style={{ color: '#fff' }}>
                  {(() => {
                    try {
                      if (approvalData?.fecha_nacimiento_solicitante && approvalData.fecha_nacimiento_solicitante.trim()) {
                        const fecha = new Date(approvalData.fecha_nacimiento_solicitante);
                        if (!isNaN(fecha.getTime())) {
                          const meses = [
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                          ];
                          const dia = fecha.getDate();
                          const mes = meses[fecha.getMonth()];
                          const año = fecha.getFullYear();
                          return `${dia}/${mes}/${año}`;
                        }
                      }
                      return 'No especificado';
                    } catch (error) {
                      console.error('Error formateando fecha:', error);
                      return 'No especificado';
                    }
                  })()}
                </div>
              </div>
              
              {/* Tipo de Curso - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Tipo de Curso</div>
                <div style={{ color: '#fff' }}>
                  {((approvalData as any)?.tipo_curso_nombre && (approvalData as any).tipo_curso_nombre.trim()) || 'No especificado'}
                </div>
              </div>
              
              {/* Horario Preferido - Siempre visible */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: 4 }}>Horario Preferido</div>
                <div style={{ 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  textTransform: 'capitalize'
                }}>
                  <Clock size={16} color="#fbbf24" />
                  {(approvalData?.horario_preferido && approvalData.horario_preferido.trim()) || 'No especificado'}
                </div>
              </div>
            </div>

            {/* Usuario Generado - Solo mostrar si NO es estudiante existente */}
            {!approvalData?.id_estudiante_existente && (
              <div style={{ marginTop: 16, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GraduationCap size={18} color="#10b981" />
                  Usuario Generado Automáticamente
                </h4>
                <div style={{ 
                  color: '#10b981', 
                  fontSize: '1.2rem',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginBottom: '8px'
                }}>
                  {generatedUsername}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: '0.85rem'
                }}>
                  Generado a partir de las iniciales del nombre + primer apellido
                </div>
              </div>
            )}

            {/* Alerta para estudiante existente */}
            {approvalData?.id_estudiante_existente && (
              <div style={{ 
                marginTop: 16, 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.3)', 
                borderRadius: 12, 
                padding: 16 
              }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#3b82f6" />
                  Estudiante Existente
                </h4>
                <div style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  Este estudiante ya está registrado en el sistema. Solo se creará la matrícula para el nuevo curso.
                  <br />
                  <strong style={{ color: '#3b82f6' }}>No se generarán nuevas credenciales.</strong>
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowApprovalModal(false)}
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
                onClick={() => handleCreateStudent()}
                disabled={decidiendo}
                style={{
                  background: decidiendo ? 'rgba(156, 163, 175, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: decidiendo ? '1px solid rgba(156, 163, 175, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  color: decidiendo ? '#9ca3af' : '#10b981',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: decidiendo ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: decidiendo ? 0.7 : 1
                }}
              >
                <Check size={16} />
                {decidiendo ? 'Procesando...' : (approvalData?.id_estudiante_existente ? 'Crear Matrícula' : 'Crear Estudiante')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionMatricula;
