import { useState, useEffect } from 'react';
import { Search, DollarSign, Eye, Check, X, Download, AlertCircle, CheckCircle2, XCircle, Calendar, BarChart3, User, FileText, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = 'http://localhost:3000';

interface Pago {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  metodo_pago: string;
  numero_comprobante: string | null;
  banco_comprobante: string | null;
  fecha_transferencia: string | null;
  estado: 'pendiente' | 'pagado' | 'verificado' | 'vencido';
  observaciones: string | null;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  admin_nombre?: string;
  admin_identificacion?: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cedula: string;
  curso_nombre: string;
  codigo_matricula: string;
  id_curso: number;
  modalidad_pago?: 'mensual' | 'clases';
  numero_clases?: number;
  precio_por_clase?: number;
}

interface EstudianteAgrupado {
  estudiante_cedula: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  cursos: {
    id_curso: number;
    curso_nombre: string;
    codigo_matricula: string;
    pagos: Pago[];
  }[];
}

const GestionPagosEstudiante = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estudiantes, setEstudiantes] = useState<EstudianteAgrupado[]>([]);
  const [loading, setLoading] = useState(true); const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('pendientes_primero');
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [pagoARechazar, setPagoARechazar] = useState<Pago | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [pagoAVerificar, setPagoAVerificar] = useState<Pago | null>(null);
  const [cuotasAVerificar, setCuotasAVerificar] = useState<number[]>([]);

  // Estados para selectores por tarjeta
  const [selectedCurso, setSelectedCurso] = useState<{ [key: string]: number }>({});
  const [selectedCuota, setSelectedCuota] = useState<{ [key: string]: number }>({});

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  // Inicializar selectores automáticamente con pagos pendientes
  useEffect(() => {
    if (estudiantes.length > 0) {
      const nuevosSelectores: { [key: string]: number } = {};

      estudiantes.forEach(est => {
        est.cursos.forEach(curso => {
          // Buscar primero pagos en estado 'pagado' (pendientes de verificar)
          const pagoPendiente = curso.pagos.find(p => p.estado === 'pagado');
          if (pagoPendiente) {
            nuevosSelectores[est.estudiante_cedula] = pagoPendiente.id_pago;
          } else {
            // Si no hay pagados, buscar el primero no verificado
            const pagoNoVerificado = curso.pagos.find(p => p.estado !== 'verificado');
            if (pagoNoVerificado) {
              nuevosSelectores[est.estudiante_cedula] = pagoNoVerificado.id_pago;
            }
          }
        });
      });

      setSelectedCuota(nuevosSelectores);
    }
  }, [estudiantes]);

  const loadData = async () => {

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') {
        params.set('estado', filtroEstado);
      }
      params.set('limit', '200');

      const res = await fetch(`${API_BASE}/api/admin/pagos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error cargando pagos');

      const data = await res.json();
      setPagos(data);

      // Agrupar por estudiante
      const agrupados = agruparPorEstudiante(data);
      setEstudiantes(agrupados);

      // Inicializar selectores con primer curso y primera cuota
      const initCursos: { [key: string]: number } = {};
      const initCuotas: { [key: string]: number } = {};
      agrupados.forEach(est => {
        if (est.cursos.length > 0) {
          initCursos[est.estudiante_cedula] = est.cursos[0].id_curso;
          if (est.cursos[0].pagos.length > 0) {
            initCuotas[est.estudiante_cedula] = est.cursos[0].pagos[0].id_pago;
          }
        }
      });
      setSelectedCurso(initCursos);
      setSelectedCuota(initCuotas);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos de pagos', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const agruparPorEstudiante = (pagosData: Pago[]): EstudianteAgrupado[] => {
    const grupos: { [key: string]: EstudianteAgrupado } = {};

    pagosData.forEach(pago => {
      const cedula = pago.estudiante_cedula;

      if (!grupos[cedula]) {
        grupos[cedula] = {
          estudiante_cedula: cedula,
          estudiante_nombre: pago.estudiante_nombre,
          estudiante_apellido: pago.estudiante_apellido,
          cursos: []
        };
      }

      let curso = grupos[cedula].cursos.find(c => c.id_curso === pago.id_curso);
      if (!curso) {
        curso = {
          id_curso: pago.id_curso,
          curso_nombre: pago.curso_nombre,
          codigo_matricula: pago.codigo_matricula,
          pagos: []
        };
        grupos[cedula].cursos.push(curso);
      }

      curso.pagos.push(pago);
    });

    // Ordenar pagos por número de cuota
    Object.values(grupos).forEach(est => {
      est.cursos.forEach(curso => {
        curso.pagos.sort((a, b) => a.numero_cuota - b.numero_cuota);
      });
    });

    return Object.values(grupos);
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const openComprobanteModal = (pago: Pago) => {
    const url = `${API_BASE}/api/admin/pagos/${pago.id_pago}/comprobante`;
    setComprobanteUrl(url);
    setComprobanteNumero(pago.numero_comprobante || 'N/A');
    setShowComprobanteModal(true);
  };

  const handleVerificarPago = (pago: Pago) => {
    setPagoAVerificar(pago);
    setCuotasAVerificar([pago.id_pago]); // Por defecto solo la cuota actual
    setShowVerificacionModal(true);
  };

  const confirmarVerificacion = async () => {
    if (!pagoAVerificar || cuotasAVerificar.length === 0) return;

    try {
      setProcesando(true);
      const token = sessionStorage.getItem('auth_token');
      const id_usuario = 1; // TODO: Obtener del contexto

      // Verificar todas las cuotas seleccionadas
      for (const id_pago of cuotasAVerificar) {
        const res = await fetch(`${API_BASE}/api/admin/pagos/${id_pago}/verificar`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ verificado_por: id_usuario })
        });

        if (!res.ok) throw new Error(`Error verificando pago ${id_pago}`);
      }

      setShowVerificacionModal(false);
      setPagoAVerificar(null);
      setCuotasAVerificar([]);
      await loadData();

      toast.success(`${cuotasAVerificar.length} cuota(s) verificada(s) exitosamente`, {
        duration: 4000,
        icon: <CheckCircle2 size={20} />,
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error verificando los pagos', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazarPago = (pago: Pago) => {
    setPagoARechazar(pago);
    setMotivoRechazo('');
    setShowRechazoModal(true);
  };

  const confirmarRechazo = async () => {
    if (!motivoRechazo.trim()) {
      toast.error('Por favor ingrese el motivo del rechazo', {
        icon: <AlertCircle size={20} />,
      });
      return;
    }

    if (!pagoARechazar) return;

    try {
      setProcesando(true);
      const token = sessionStorage.getItem('auth_token');
      const id_usuario = 1; // TODO: Obtener del contexto

      const res = await fetch(`${API_BASE}/api/admin/pagos/${pagoARechazar.id_pago}/rechazar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ observaciones: motivoRechazo, verificado_por: id_usuario })
      });

      if (!res.ok) throw new Error('Error rechazando pago');

      setShowRechazoModal(false);
      setPagoARechazar(null);
      setMotivoRechazo('');
      await loadData();

      toast.success('Pago rechazado correctamente', {
        icon: <XCircle size={20} />,
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error rechazando el pago', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setProcesando(false);
    }
  };

  // Filtrar y ordenar estudiantes
  const estudiantesFiltrados = estudiantes
    .filter(est => {
      const matchSearch =
        est.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.estudiante_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.estudiante_cedula.includes(searchTerm);

      return matchSearch;
    })
    .sort((a, b) => {
      if (filtroPrioridad === 'pendientes_primero') {
        // Obtener pagos pendientes de cada estudiante
        const pagosPendientesA = a.cursos.flatMap(curso =>
          curso.pagos.filter(pago => pago.estado === 'pagado')
        );
        const pagosPendientesB = b.cursos.flatMap(curso =>
          curso.pagos.filter(pago => pago.estado === 'pagado')
        );

        // Prioridad: estudiantes con pagos pendientes primero
        if (pagosPendientesA.length > 0 && pagosPendientesB.length === 0) return -1;
        if (pagosPendientesB.length > 0 && pagosPendientesA.length === 0) return 1;
      }

      // Ordenamiento por defecto: fecha de vencimiento
      const pagoA = a.cursos[0]?.pagos[0];
      const pagoB = b.cursos[0]?.pagos[0];
      if (!pagoA || !pagoB) return 0;
      const dateA = new Date(pagoA.fecha_vencimiento).getTime();
      const dateB = new Date(pagoB.fecha_vencimiento).getTime();
      return dateA - dateB;
    });

  // Paginación
  const totalPages = Math.ceil(estudiantesFiltrados.length / itemsPerPage);
  const paginatedEstudiantes = estudiantesFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Obtener el pago seleccionado para un estudiante
  const getPagoSeleccionado = (cedula: string): Pago | null => {
    const idCuota = selectedCuota[cedula];
    if (!idCuota) return null;
    return pagos.find(p => p.id_pago === idCuota) || null;
  };

  // Obtener el curso seleccionado para un estudiante
  const getCursoSeleccionado = (estudiante: EstudianteAgrupado) => {
    const idCurso = selectedCurso[estudiante.estudiante_cedula];
    return estudiante.cursos.find(c => c.id_curso === idCurso) || estudiante.cursos[0];
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '25rem',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3.125rem',
            height: '3.125rem',
            border: '0.25rem solid rgba(239, 68, 68, 0.2)',
            borderTop: '0.25rem solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-padding">
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '12px' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '6px' : '0.625rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          <DollarSign size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Gestión de Pagos {!isMobile && 'Mensuales'}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}>
          Verifica y administra los pagos mensuales de los estudiantes
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(1.25rem)',
        border: '0.0625rem solid rgba(239, 68, 68, 0.2)',
        borderRadius: isMobile ? '0.75em' : '1rem',
        padding: isMobile ? '0.75em' : '1rem',
        marginBottom: isMobile ? '0.75em' : '1rem'
      }}>
        <div className="responsive-filters">
          <div style={{
            position: 'relative',
            flex: 1,
            minWidth: isSmallScreen ? 'auto' : '17.5rem',
            width: isSmallScreen ? '100%' : 'auto'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder={isMobile ? "Buscar..." : "Buscar por estudiante, cédula, curso..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625em 0.625rem 0.625rem 2.375rem',
                background: 'rgba(255,255,255,0.1)',
                border: '0.0625rem solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: '#fff',
                fontSize: '0.8rem'
              }}
            />
          </div>
          <div style={{
            minWidth: isSmallScreen ? 'auto' : 180,
            width: isSmallScreen ? '100%' : 'auto'
          }}>
            <StyledSelect
              name="filterEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={[
                { value: 'todos', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'pagado', label: 'Pagados' },
                { value: 'verificado', label: 'Verificados' },
                { value: 'vencido', label: 'Vencidos' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Lista de estudiantes - UNA TARJETA POR ESTUDIANTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {paginatedEstudiantes.map((estudiante) => {
          const cursoActual = getCursoSeleccionado(estudiante);
          const pago = getPagoSeleccionado(estudiante.estudiante_cedula);

          if (!pago || !cursoActual) return null;

          return (
            <div
              key={pago.id_pago}
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(1.25rem)',
                border: '0.0625rem solid rgba(239, 68, 68, 0.2)',
                borderRadius: isMobile ? '0.75em' : '1rem',
                padding: isMobile ? '0.75em' : '1rem',
                boxShadow: '0 0.5rem 1.5rem rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Información Principal */}
              <div style={{ marginBottom: isMobile ? '0.625em' : '0.875rem' }}>
                <h3 style={{
                  color: '#fff',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '700',
                  margin: isMobile ? '0 0 0.5rem 0' : '0 0 0.75rem 0'
                }}>
                  {pago.estudiante_nombre} {pago.estudiante_apellido}
                </h3>

                {/* Primera fila - Información básica con selectores */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(11.25rem, 90vw), 1fr))',
                  gap: isMobile ? '0.625em' : '0.75rem',
                  marginBottom: isMobile ? '0.5em' : '0.625rem'
                }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', marginBottom: '0.1875rem' }}>Identificación</div>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>{estudiante.estudiante_cedula}</div>
                  </div>

                  {/* Selector de Curso */}
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Curso</div>
                    {estudiante.cursos.length > 1 ? (
                      <select
                        value={selectedCurso[estudiante.estudiante_cedula] || cursoActual.id_curso}
                        onChange={(e) => {
                          const newIdCurso = Number(e.target.value);
                          setSelectedCurso({ ...selectedCurso, [estudiante.estudiante_cedula]: newIdCurso });
                          const nuevoCurso = estudiante.cursos.find(c => c.id_curso === newIdCurso);
                          if (nuevoCurso && nuevoCurso.pagos.length > 0) {
                            setSelectedCuota({ ...selectedCuota, [estudiante.estudiante_cedula]: nuevoCurso.pagos[0].id_pago });
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '0.25em 0.5rem',
                          background: 'rgba(255,255,255,0.1)',
                          border: '0.0625rem solid rgba(255,255,255,0.2)',
                          borderRadius: '0.375rem',
                          color: '#fff',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {estudiante.cursos.map(curso => (
                          <option key={curso.id_curso} value={curso.id_curso} style={{ background: '#1a1a2e' }}>
                            {curso.curso_nombre}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ color: '#fff', fontSize: '0.9rem' }}>{cursoActual.curso_nombre}</div>
                    )}
                  </div>

                  {/* Selector de Cuota/Clase */}
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      {pago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'}
                    </div>
                    <select
                      value={selectedCuota[estudiante.estudiante_cedula] || (() => {
                        // Primero buscar cuotas en estado 'pagado' (pendientes de verificar)
                        const cuotaPagada = cursoActual.pagos.find((p: Pago) => p.estado === 'pagado');
                        if (cuotaPagada) return cuotaPagada.id_pago;

                        // Si no hay pagadas, buscar la primera que NO esté verificada
                        const cuotaNoVerificada = cursoActual.pagos.find((p: Pago) => p.estado !== 'verificado');
                        return cuotaNoVerificada?.id_pago || pago.id_pago;
                      })()}
                      onChange={(e) => {
                        setSelectedCuota({ ...selectedCuota, [estudiante.estudiante_cedula]: Number(e.target.value) });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 0.5rem',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '0.375rem',
                        color: '#fff',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      {cursoActual.pagos.map(p => (
                        <option key={p.id_pago} value={p.id_pago} style={{ background: '#1a1a2e' }}>
                          {p.modalidad_pago === 'clases' ? `Clase ${p.numero_cuota}` : `Cuota #${p.numero_cuota}`} - {formatearMonto(p.monto)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      marginBottom: '0.25rem'
                    }}>
                      Vencimiento
                    </div>
                    <div style={{
                      color: '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    }}>
                      {formatearFecha(pago.fecha_vencimiento)}
                    </div>
                  </div>
                </div>

                {/* Segunda fila - Número, Comprobante y Estado */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : (pago.metodo_pago === 'efectivo' ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'),
                  gap: isMobile ? '0.625em' : '0.75rem',
                  alignItems: 'start'
                }}>
                  {/* Número de comprobante */}
                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      marginBottom: '0.25rem'
                    }}>
                      {isMobile ? 'Nº Comprobante' : 'Número Comprobante'}
                    </div>
                    {pago.numero_comprobante ? (
                      <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '0.0625rem solid rgba(251, 191, 36, 0.3)',
                        color: '#fbbf24',
                        padding: '0.375em 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        fontFamily: 'monospace',
                        textAlign: 'center',
                        width: '100%'
                      }}>
                        {pago.numero_comprobante}
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(107, 114, 128, 0.1)',
                        border: '0.0625rem solid rgba(107, 114, 128, 0.3)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        padding: '0.375em 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        width: '100%'
                      }}>
                        Sin número
                      </div>
                    )}
                  </div>

                  {/* Recibido por - Solo para efectivo */}
                  {pago.metodo_pago === 'efectivo' && (
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Recibido por</div>
                      {(pago as any).recibido_por ? (
                        <div style={{
                          background: 'rgba(180, 83, 9, 0.1)',
                          border: '0.0625rem solid rgba(180, 83, 9, 0.3)',
                          color: '#b45309',
                          padding: '0.375em 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          width: '100%'
                        }}>
                          {(pago as any).recibido_por}
                        </div>
                      ) : (
                        <div style={{
                          background: 'rgba(107, 114, 128, 0.1)',
                          border: '0.0625rem solid rgba(107, 114, 128, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                          padding: '0.375em 0.5rem',
                          borderRadius: '0.375rem',
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

                  {/* Comprobante - Botón */}
                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: isMobile ? '0.7rem' : '0.8rem',
                      marginBottom: '0.25rem'
                    }}>
                      Comprobante
                    </div>
                    <button
                      onClick={() => openComprobanteModal(pago)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: isMobile ? '0.5em 0.625rem' : '0.375em 0.5rem',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.75rem' : '0.7rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.1875rem',
                        whiteSpace: 'nowrap',
                        width: '100%',
                        justifyContent: 'center'
                      }}
                    >
                      <Download size={12} />
                      {isMobile ? 'Ver' : 'Ver Comprobante'}
                    </button>
                  </div>

                  {/* Estado */}
                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: isMobile ? '0.65rem' : '0.7rem',
                      marginBottom: '0.1875rem'
                    }}>
                      Estado
                    </div>
                    <div style={{
                      display: 'flex',
                      padding: '0.3125em 0.375rem',
                      borderRadius: '0.3125rem',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: pago.estado === 'verificado' ? 'rgba(16, 185, 129, 0.15)' :
                        pago.estado === 'pagado' ? 'rgba(251, 191, 36, 0.15)' :
                          pago.estado === 'vencido' ? 'rgba(239, 68, 68, 0.15)' :
                            'rgba(156, 163, 175, 0.15)',
                      border: pago.estado === 'verificado' ? '0.0625rem solid rgba(16, 185, 129, 0.3)' :
                        pago.estado === 'pagado' ? '0.0625rem solid rgba(251, 191, 36, 0.3)' :
                          pago.estado === 'vencido' ? '0.0625rem solid rgba(239, 68, 68, 0.3)' :
                            '0.0625rem solid rgba(156, 163, 175, 0.3)',
                      color: pago.estado === 'verificado' ? '#10b981' :
                        pago.estado === 'pagado' ? '#fbbf24' :
                          pago.estado === 'vencido' ? '#ef4444' :
                            '#9ca3af'
                    }}>
                      {pago.estado}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción - Parte Inferior */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '0.5em' : '0.625rem',
                justifyContent: 'flex-end',
                borderTop: '0.0625rem solid rgba(255,255,255,0.1)',
                paddingTop: isMobile ? '0.625em' : '0.75rem'
              }}>
                <button
                  onClick={() => {
                    setSelectedPago(pago);
                    setShowModal(true);
                  }}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '0.0625rem solid rgba(59, 130, 246, 0.3)',
                    color: '#3b82f6',
                    padding: '0.625em 1rem',
                    borderRadius: '0.625rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  <Eye size={16} />
                  Ver
                </button>
                {pago.estado === 'pagado' && (
                  <>
                    <button
                      onClick={() => handleVerificarPago(pago)}
                      disabled={procesando}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981',
                        padding: '0.625em 1rem',
                        borderRadius: '0.625rem',
                        cursor: procesando ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: procesando ? 0.6 : 1,
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      <Check size={16} />
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleRechazarPago(pago)}
                      disabled={procesando}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '0.625em 1rem',
                        borderRadius: '0.625rem',
                        cursor: procesando ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        opacity: procesando ? 0.6 : 1,
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      <X size={16} />
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>


      {/* Modal de detalle PREMIUM */}
      {showModal && selectedPago && (
        <div
          data-modal-overlay="true"
          className="responsive-modal-overlay"
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
          <div
            className="responsive-modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: isMobile ? '1.25em 1.25rem 0 0' : '0.75rem',
              width: '100%',
              maxWidth: isMobile ? '100%' : '50rem',
              padding: isMobile ? '1em 1rem 1.5rem 1rem' : '1.125em 1.75rem 1.375rem 1.75rem',
              color: '#fff',
              margin: '0 auto',
              boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)',
              maxHeight: isMobile ? '85vh' : '90vh',
              overflowY: 'auto',
              animation: isMobile ? 'slideUp 0.3s ease-out' : 'none',
            }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '14px' : '1.125rem',
              paddingBottom: isMobile ? '12px' : '0.875rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '1rem' : '1.25rem',
                fontWeight: '600',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '6px' : '0.5rem'
              }}>
                <Download size={isMobile ? 18 : 20} />
                {isMobile ? 'Detalle' : 'Detalle del Pago'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem',
                  padding: isMobile ? '8px' : '0.375rem',
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
                <X size={isMobile ? 20 : 18} />
              </button>
            </div>

            {/* Content */}
            <div>
              {/* Stats Cards Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                gap: isMobile ? '12px' : '1rem',
                marginBottom: isMobile ? '20px' : '1.75rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '5rem',
                    height: '5rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(1.25rem)'
                  }} />
                  <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.5rem'
                  }}>
                    <DollarSign size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Monto
                  </div>
                  <div style={{
                    color: '#10b981',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    letterSpacing: '-1px'
                  }}>
                    {formatearMonto(selectedPago.monto)}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '5rem',
                    height: '5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(1.25rem)'
                  }} />
                  <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> {selectedPago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'}
                  </div>
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    fontFamily: 'monospace'
                  }}>
                    #{selectedPago.numero_cuota}
                  </div>
                </div>

                <div style={{
                  background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)'
                    : selectedPago.estado === 'pendiente'
                      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  border: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado'
                    ? '1px solid rgba(16, 185, 129, 0.2)'
                    : selectedPago.estado === 'pendiente'
                      ? '1px solid rgba(251, 191, 36, 0.2)'
                      : '1px solid rgba(239, 68, 68, 0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.75rem'
                  }}>
                    <BarChart3 size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Estado
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '8px 1rem',
                    borderRadius: '0.625rem',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.2)' :
                      selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' :
                        'rgba(239, 68, 68, 0.2)',
                    color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' :
                      selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444',
                    boxShadow: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '0 0.25rem 0.75rem rgba(16, 185, 129, 0.2)' :
                      selectedPago.estado === 'pendiente' ? '0 0.25rem 0.75rem rgba(251, 191, 36, 0.2)' :
                        '0 0.25rem 0.75rem rgba(239, 68, 68, 0.2)'
                  }}>
                    {selectedPago.estado === 'verificado' ? '✓ ' : selectedPago.estado === 'pagado' ? '✓ ' : selectedPago.estado === 'pendiente' ? '⏱ ' : '✗ '}
                    {selectedPago.estado}
                  </span>
                </div>
              </div>

              {/* Información Detallada */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {/* Estudiante Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: '1rem',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: '#fff',
                      boxShadow: '0 0.5rem 1rem rgba(99, 102, 241, 0.3)'
                    }}>
                      {selectedPago.estudiante_nombre?.charAt(0)}{selectedPago.estudiante_apellido?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.0625rem',
                        marginBottom: '0.375rem'
                      }}>
                        <User size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Estudiante
                      </div>
                      <div style={{
                        color: '#fff',
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        marginBottom: '0.25rem'
                      }}>
                        {selectedPago.estudiante_nombre} {selectedPago.estudiante_apellido}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24',
                          padding: '4px 0.625rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          ID: {selectedPago.estudiante_cedula}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curso Card */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.75rem'
                  }}>
                    <BookOpen size={16} style={{ display: 'inline', marginRight: '0.25rem' }} /> Curso Matriculado
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      padding: '8px 0.75rem',
                      borderRadius: '0.625rem',
                      fontSize: '0.9rem'
                    }}>
                      {selectedPago.curso_nombre}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Pago - Solo para efectivo */}
              {selectedPago.metodo_pago === 'efectivo' && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(180, 83, 9, 0.3)'
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '1rem'
                  }}>
                    💰 Información del Pago en Efectivo
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem'
                  }}>
                    {selectedPago.numero_comprobante && (
                      <div>
                        <div style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.75rem',
                          marginBottom: '0.375rem'
                        }}>
                          Número de Comprobante
                        </div>
                        <div style={{
                          color: '#fbbf24',
                          fontSize: '1rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          background: 'rgba(251, 191, 36, 0.1)',
                          padding: '8px 0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(251, 191, 36, 0.3)'
                        }}>
                          {selectedPago.numero_comprobante}
                        </div>
                      </div>
                    )}
                    {(selectedPago as any).recibido_por && (
                      <div>
                        <div style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.75rem',
                          marginBottom: '0.375rem'
                        }}>
                          Recibido por
                        </div>
                        <div style={{
                          color: '#b45309',
                          fontSize: '1rem',
                          fontWeight: 700,
                          background: 'rgba(180, 83, 9, 0.1)',
                          padding: '8px 0.75rem',
                          borderRadius: '0.5rem',
                          border: '1px solid rgba(180, 83, 9, 0.3)'
                        }}>
                          {(selectedPago as any).recibido_por}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de Verificación */}
              {(selectedPago.estado === 'verificado' && selectedPago.fecha_verificacion) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '6.25rem',
                    height: '6.25rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(1.875rem)'
                  }} />
                  <div style={{
                    color: '#10b981',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ✓ Verificado por Administrador
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '0.625rem',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#fff',
                      boxShadow: '0 0.25rem 0.75rem rgba(16, 185, 129, 0.3)'
                    }}>
                      <User size={20} />
                    </div>
                    <div>
                      <div style={{
                        color: 'rgba(255,255,255,0.95)',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        marginBottom: '0.25rem'
                      }}>
                        {selectedPago.admin_nombre || 'Administrador'}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        marginBottom: '0.375rem'
                      }}>
                        ID: {selectedPago.admin_identificacion || selectedPago.verificado_por || 'N/A'}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace'
                      }}>
                        {new Date(selectedPago.fecha_verificacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observaciones */}
              {selectedPago.observaciones && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '6.25rem',
                    height: '6.25rem',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '50%',
                    filter: 'blur(1.875rem)'
                  }} />
                  <div style={{
                    color: '#fbbf24',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.0625rem',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FileText size={18} style={{ display: 'inline', marginRight: '0.375rem' }} /> Observaciones Importantes
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '1rem',
                    lineHeight: 1.7,
                    fontWeight: 500
                  }}>
                    {selectedPago.observaciones}
                  </div>
                </div>
              )}

              {/* Actions Premium */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '14px 2rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 0.375rem 1.25rem rgba(239, 68, 68, 0.4)',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 0.75rem 1.75rem rgba(239, 68, 68, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 0.375rem 1.25rem rgba(239, 68, 68, 0.4)';
                  }}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {showComprobanteModal && (
        <div
          data-modal-overlay="true"
          className="responsive-modal-overlay"
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
          <div
            className="responsive-modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: isMobile ? '20px 1.25rem 0 0' : '0.75rem',
              width: '100%',
              maxWidth: isMobile ? '100%' : '50rem',
              maxHeight: isMobile ? '85vh' : '90vh',
              padding: isMobile ? '16px 1rem 1.5rem 1rem' : '18px 1.75rem 1.375rem 1.75rem',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)',
              animation: isMobile ? 'slideUp 0.3s ease-out' : 'none',
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '14px' : '1.125rem',
              paddingBottom: isMobile ? '12px' : '0.875rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '0.5rem',
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  fontWeight: '600',
                  letterSpacing: '-0.02em'
                }}>
                  <Download size={isMobile ? 18 : 20} />
                  Comprobante{!isMobile && ' de Pago'}
                </h3>
                {comprobanteNumero && (
                  <p style={{
                    margin: isMobile ? '4px 0 0 1.5rem' : '6px 0 0 1.75rem',
                    color: '#fbbf24',
                    fontSize: isMobile ? '0.75rem' : '0.85rem',
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

            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '1rem',
              overflow: 'hidden'
            }}>
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '0.5rem'
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
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              <a
                href={comprobanteUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '10px 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
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
                  padding: '10px 1rem',
                  borderRadius: '0.5rem',
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

      {/* Paginación */}
      {estudiantesFiltrados.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '0',
          padding: isMobile ? '16px' : '20px 1.5rem',
          marginTop: isMobile ? '16px' : '90px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(1.25rem)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: isMobile ? '12px' : '1.25rem',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {currentPage} de {totalPages} • Total: {estudiantesFiltrados.length} estudiantes
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start'
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
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
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                  background: currentPage === pageNum ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.08)',
                  border: currentPage === pageNum ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.625rem',
                color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
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

      {/* Modal de Verificación Inteligente */}
      {showVerificacionModal && pagoAVerificar && (
        <div
          data-modal-overlay="true"
          className="responsive-modal-overlay"
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
          <div
            className="responsive-modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: isMobile ? '20px 1.25rem 0 0' : '0.75rem',
              width: '100%',
              maxWidth: '31.25rem',
              padding: '18px 1.75rem 1.375rem 1.75rem',
              color: '#fff',
              margin: '0 auto',
              boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.125rem',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={20} />
                Verificar Pago
              </h3>
              <button
                onClick={() => setShowVerificacionModal(false)}
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

            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                {pagoAVerificar.estudiante_nombre} {pagoAVerificar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'grid', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monto total pagado:</span>
                  <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>
                    {(() => {
                      const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                      const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                      const cuotasPagadas = cursoActual?.pagos.filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado') || [];
                      const montoTotal = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto.toString()), 0);
                      return formatearMonto(montoTotal);
                    })()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cuotas cubiertas:</span>
                  <strong>
                    {(() => {
                      const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                      const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                      const cuotasPagadas = cursoActual?.pagos.filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado') || [];
                      return `${cuotasPagadas.length} cuota(s) de $${pagoAVerificar.monto} c/u`;
                    })()}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Comprobante:</span>
                  <strong>{pagoAVerificar.numero_comprobante || 'N/A'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Primera cuota:</span>
                  <strong>#{pagoAVerificar.numero_cuota}</strong>
                </div>
              </div>
            </div>

            {/* Selección de cuotas */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                ¿Cuántas cuotas desea verificar con este pago?
              </label>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                padding: '1rem'
              }}>
                {(() => {
                  const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                  const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                  // Solo mostrar cuotas en estado "pagado" que se pueden verificar
                  const cuotasDisponibles = cursoActual?.pagos
                    .filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado')
                    .sort((a, b) => a.numero_cuota - b.numero_cuota) || [];

                  if (cuotasDisponibles.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '1.25rem', color: 'rgba(255,255,255,0.7)' }}>
                        Solo la cuota actual está disponible para verificar
                      </div>
                    );
                  }

                  return cuotasDisponibles.map((cuota) => (
                    <label key={cuota.id_pago} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: cuotasAVerificar.includes(cuota.id_pago) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: cuotasAVerificar.includes(cuota.id_pago) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={cuotasAVerificar.includes(cuota.id_pago)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCuotasAVerificar([...cuotasAVerificar, cuota.id_pago]);
                          } else {
                            setCuotasAVerificar(cuotasAVerificar.filter(id => id !== cuota.id_pago));
                          }
                        }}
                        style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, color: '#fff' }}>
                        <div style={{ fontWeight: '600' }}>
                          {cuota.modalidad_pago === 'clases' ? `Clase ${cuota.numero_cuota}` : `Cuota #${cuota.numero_cuota}`}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                          {formatearMonto(cuota.monto)} - {cuota.estado}
                        </div>
                      </div>
                    </label>
                  ));
                })()}
              </div>
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                  Total a verificar: {cuotasAVerificar.length} cuota(s)
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowVerificacionModal(false);
                  setPagoAVerificar(null);
                  setCuotasAVerificar([]);
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '12px 1.5rem',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVerificacion}
                disabled={procesando || cuotasAVerificar.length === 0}
                style={{
                  flex: 1,
                  padding: '12px 1.5rem',
                  background: procesando || cuotasAVerificar.length === 0
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando || cuotasAVerificar.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: procesando || cuotasAVerificar.length === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Verificar {cuotasAVerificar.length > 1 ? `${cuotasAVerificar.length} Cuotas` : 'Cuota'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazo Elegante */}
      {showRechazoModal && pagoARechazar && (
        <div
          data-modal-overlay="true"
          className="responsive-modal-overlay"
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
          <div
            className="responsive-modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.75rem',
              width: '100%',
              maxWidth: '31.25rem',
              padding: '18px 1.75rem 1.375rem 1.75rem',
              color: '#fff',
              margin: '0 auto',
              boxShadow: '0 25px 3.125rem -12px rgba(0, 0, 0, 0.6)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}>
            {/* Header del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.125rem',
              paddingBottom: '0.875rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <h3 style={{ margin: 0, color: '#ef4444', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={20} />
                Rechazar Pago
              </h3>
              <button
                onClick={() => setShowRechazoModal(false)}
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
            <div style={{ marginBottom: '1rem' }}>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                margin: 0
              }}>
                {pagoARechazar.modalidad_pago === 'clases' ? `Clase ${pagoARechazar.numero_cuota}` : `Cuota #${pagoARechazar.numero_cuota}`} - {pagoARechazar.estudiante_nombre} {pagoARechazar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <AlertCircle size={16} /> Al rechazar este pago:
              </div>
              <ul style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.85rem',
                margin: 0,
                paddingLeft: '1.25rem'
              }}>
                <li>El estado volverá a "Pendiente"</li>
                <li>El estudiante deberá subir un nuevo comprobante</li>
                <li>Se le notificará el motivo del rechazo</li>
              </ul>
            </div>

            {/* Campo de motivo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: El comprobante no es legible, número incorrecto, etc."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              />
              <div style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                Este mensaje será visible para el estudiante
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowRechazoModal(false);
                  setPagoARechazar(null);
                  setMotivoRechazo('');
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '12px 1.5rem',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#9ca3af',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                disabled={procesando || !motivoRechazo.trim()}
                style={{
                  flex: 1,
                  padding: '12px 1.5rem',
                  background: procesando || !motivoRechazo.trim()
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: procesando || !motivoRechazo.trim() ? 'not-allowed' : 'pointer',
                  opacity: procesando || !motivoRechazo.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <X size={18} />
                    Rechazar Pago
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GestionPagosEstudiante;



