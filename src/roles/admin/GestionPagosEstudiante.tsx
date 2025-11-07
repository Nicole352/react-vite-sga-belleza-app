import { useState, useEffect } from 'react';
import { Search, DollarSign, Eye, Check, X, Download, AlertCircle, CheckCircle2, XCircle, Calendar, BarChart3, User, FileText, BookOpen, ChevronLeft, ChevronRight, Sheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
import LoadingModal from '../../components/LoadingModal';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

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
  const [loading, setLoading] = useState(true);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const [selectedCurso, setSelectedCurso] = useState<{ [key: string]: number }>({});
const [selectedCuota, setSelectedCuota] = useState<{ [key: string]: number }>({});
  
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;
  
    // Trigger to refetch data when socket notifies of changes.
  const [socketTrigger, setSocketTrigger] = useState(0);

  useSocket({
    'nuevo_pago': (data: any) => {
      console.log('🔔 Nuevo pago recibido:', data);
      toast.success('Nuevo pago registrado');
      setSocketTrigger(prev => prev + 1);
    },
    'nuevo_pago_pendiente': (data: any) => {
      console.log('💰 Nuevo pago pendiente:', data);
      toast.success(`Nuevo pago de ${data.estudiante_nombre} - Cuota #${data.numero_cuota}`);
      setSocketTrigger(prev => prev + 1);
    },
    'pago_verificado': (data: any) => {
      console.log('✅ Pago verificado:', data);
      setSocketTrigger(prev => prev + 1);
    },
    'pago_rechazado': (data: any) => {
      console.log('❌ Pago rechazado:', data);
      setSocketTrigger(prev => prev + 1);
    }
  });
          
            useEffect(() => {
          loadData();
            }, [filtroEstado, socketTrigger]);
            
              useEffect(() => {
            if (estudiantes.length > 0) {
          const nuevosSelectores: { [key: string]: number } = {};
        
      estudiantes.forEach(est => {
est.cursos.forEach(curso => {
      const pagoPendiente = curso.pagos.find(p => p.estado === 'pagado');
    if (pagoPendiente) {
  nuevosSelectores[est.estudiante_cedula] = pagoPendiente.id_pago;
  } else {
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
      setShowLoadingModal(true);
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
      setShowLoadingModal(false);
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
    // Obtener el token de autenticación
    const token = sessionStorage.getItem('auth_token');
    
    // Agregar el token como parámetro de query para que funcione con <img>
    const url = `${API_BASE}/api/admin/pagos/${pago.id_pago}/comprobante?token=${token}`;
    
    console.log('🖼️ Abriendo modal de comprobante:', {
      id_pago: pago.id_pago,
      numero_comprobante: pago.numero_comprobante,
      url: url.replace(token || '', '***TOKEN***') // Ocultar token en logs
    });
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
      
      // Obtener el ID del usuario desde el endpoint /api/auth/me
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await meRes.json();
      const id_usuario = userData.id_usuario;
      
      if (!id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

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
      
      // Obtener el ID del usuario desde el endpoint /api/auth/me
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await meRes.json();
      const id_usuario = userData.id_usuario;
      
      if (!id_usuario) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

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
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '12px' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '6px' : '0.625rem'
        }}>
          <DollarSign size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Gestión de Pagos {!isMobile && 'Mensuales'}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem'
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
            flex: isSmallScreen ? '1 1 100%' : '1 1 auto',
            minWidth: isSmallScreen ? 'auto' : '22rem',
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
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`${API_BASE}/api/pagos-mensuales/reporte/excel`);
                if (!response.ok) throw new Error('Error descargando reporte');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Reporte_Pagos_${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error('Error:', error);
                toast.error('Error al descargar el reporte');
              }
            }}
            style={{ 
              padding: isMobile ? '10px 0.875rem' : '8px 0.875rem', 
              fontSize: '0.8rem', 
              borderRadius: '0.5rem', 
              border: '1px solid rgba(220, 38, 38, 0.3)', 
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(239, 68, 68, 0.15))', 
              color: '#ef4444', 
              cursor: 'pointer', 
              width: isSmallScreen ? '100%' : 'auto', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s ease'
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
        </div>
      </div>

      {/* Lista de estudiantes - UNA TARJETA POR ESTUDIANTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {paginatedEstudiantes.map((estudiante) => {
          const cursoActual = getCursoSeleccionado(estudiante);
          const pago = getPagoSeleccionado(estudiante.estudiante_cedula);

          if (!pago || !cursoActual) return null;

          return (
            <div
              key={pago.id_pago}
              style={{
                background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
                backdropFilter: 'blur(1.25rem)',
                border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
                borderRadius: '0.75rem',
                padding: '0.875rem',
                boxShadow: '0 0.25rem 0.75rem rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Información Principal */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.375rem' }}>
                  <span style={{ 
                    color: pago.metodo_pago === 'efectivo' ? '#10b981' : (!pago.numero_comprobante ? '#f59e0b' : '#3b82f6'),
                    fontSize: '0.7rem',
                    background: pago.metodo_pago === 'efectivo' ? 'rgba(16, 185, 129, 0.1)' : (!pago.numero_comprobante ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                    border: pago.metodo_pago === 'efectivo' ? '1px solid rgba(16, 185, 129, 0.3)' : (!pago.numero_comprobante ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'),
                    padding: '3px 0.5rem',
                    borderRadius: '0.3125rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {pago.metodo_pago === 'efectivo' ? '💵 Efectivo' : (!pago.numero_comprobante ? '⏳ En Espera' : '🏦 Transferencia')}
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
                    background: pago.estado === 'verificado' ? 'rgba(16, 185, 129, 0.15)' :
                               pago.estado === 'pagado' ? 'rgba(251, 191, 36, 0.15)' :
                               pago.estado === 'vencido' ? 'rgba(239, 68, 68, 0.15)' :
                               'rgba(156, 163, 175, 0.15)',
                    border: pago.estado === 'verificado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                           pago.estado === 'pagado' ? '1px solid rgba(251, 191, 36, 0.3)' :
                           pago.estado === 'vencido' ? '1px solid rgba(239, 68, 68, 0.3)' :
                           '1px solid rgba(156, 163, 175, 0.3)',
                    color: pago.estado === 'verificado' ? '#10b981' :
                          pago.estado === 'pagado' ? '#fbbf24' :
                          pago.estado === 'vencido' ? '#ef4444' :
                          '#9ca3af'
                  }}>
                    {pago.estado}
                  </span>
                </div>
                <h3 style={{ 
                  color: '#fff', 
                  margin: '0 0 0.5rem 0'
                }}>
                  {pago.estudiante_nombre} {pago.estudiante_apellido}
                </h3>
              </div>

              <div style={{ 
                paddingTop: '0.625rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '0.875rem'
              }}>
                {/* Primera fila - Información básica con selectores */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: '1 1 140px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>Identificación</div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600 }}>{estudiante.estudiante_cedula}</div>
                  </div>

                  {/* Selector de Curso */}
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>Curso</div>
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
                  <div style={{ flex: '1 1 180px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
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


      {/* Modal de detalle MEJORADO */}
      {showModal && selectedPago && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '900px',
              background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.98) 0%, rgba(26, 26, 46, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header Premium */}
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              margin: '-1rem -1.5rem 1.5rem -1.5rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileText size={24} style={{ color: '#fff' }} />
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: '#fff',
                    letterSpacing: '-0.02em'
                  }}>
                    Detalle del Pago
                  </h3>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '500'
                  }}>
                    {selectedPago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'} #{selectedPago.numero_cuota} - {selectedPago.curso_nombre}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  padding: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content - Grid compacto de 2 columnas */}
            <div>
              {/* Información Principal - Grid 2 columnas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                {/* Monto */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex'
                    }}>
                      <DollarSign size={18} style={{ color: '#10b981' }} />
                    </div>
                    <span style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Monto</span>
                  </div>
                  <div style={{
                    color: '#10b981',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {formatearMonto(selectedPago.monto)}
                  </div>
                </div>

                {/* Cuota/Clase */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex'
                    }}>
                      <Calendar size={18} style={{ color: '#3b82f6' }} />
                    </div>
                    <span style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{selectedPago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'}</span>
                  </div>
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    #{selectedPago.numero_cuota}
                  </div>
                </div>

                {/* Estado */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: `1px solid ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.3)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  boxShadow: `0 4px 12px ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.1)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.2)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '6px',
                      display: 'flex'
                    }}>
                      <BarChart3 size={18} style={{ color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' : selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444' }} />
                    </div>
                    <span style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Estado</span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.2)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' : selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444',
                    border: `1px solid ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.3)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                  }}>
                    {selectedPago.estado}
                  </span>
                </div>

                {/* Estudiante */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.375rem'
                  }}>
                    <User size={16} style={{ color: '#8b5cf6' }} />
                    <span style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>Estudiante</span>
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.25rem'
                  }}>
                    {selectedPago.estudiante_nombre} {selectedPago.estudiante_apellido}
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.75rem'
                  }}>
                    ID: {selectedPago.estudiante_cedula}
                  </div>
                </div>

                {/* Curso */}
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  gridColumn: isMobile ? '1' : 'span 2'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.375rem'
                  }}>
                    <BookOpen size={16} style={{ color: '#ef4444' }} />
                    <span style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>Curso</span>
                  </div>
                  <div style={{
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {selectedPago.curso_nombre}
                  </div>
                </div>

                {/* Comprobante - Solo si existe */}
                {selectedPago.numero_comprobante && (
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    gridColumn: isMobile ? '1' : 'span 2'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.375rem'
                    }}>
                      <FileText size={16} style={{ color: '#fbbf24' }} />
                      <span style={{
                        color: 'rgba(255,255,255,0.6)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Comprobante</span>
                    </div>
                    <div style={{
                      color: '#fbbf24',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      {selectedPago.numero_comprobante}
                    </div>
                  </div>
                )}
              </div>

              {/* Información de Pago - Solo para efectivo */}
              {selectedPago.metodo_pago === 'efectivo' && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  gridColumn: isMobile ? '1' : 'span 2'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.375rem'
                  }}>
                    <DollarSign size={16} style={{ color: '#b45309' }} />
                    <span style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>Información de Pago en Efectivo</span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    {(selectedPago as any).recibido_por && (
                      <div>
                        <div style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.75rem',
                          marginBottom: '0.25rem'
                        }}>
                          Recibido por
                        </div>
                        <div style={{
                          color: '#b45309',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {(selectedPago as any).recibido_por}
                        </div>
                      </div>
                    )}
                    {selectedPago.numero_comprobante && (
                      <div>
                        <div style={{
                          color: 'rgba(255,255,255,0.6)',
                          fontSize: '0.75rem',
                          marginBottom: '0.25rem'
                        }}>
                          Número de Comprobante
                        </div>
                        <div style={{
                          color: '#fbbf24',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {selectedPago.numero_comprobante}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comprobante de Pago - Imagen */}
              {selectedPago.numero_comprobante && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}>
                    <Download size={18} style={{ color: '#10b981' }} />
                    <span style={{
                      color: '#10b981',
                      fontSize: '0.9rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Comprobante de Pago</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    maxHeight: '500px',
                    overflow: 'auto'
                  }}>
                    <img
                      src={`${API_BASE}/api/admin/pagos/${selectedPago.id_pago}/comprobante?token=${sessionStorage.getItem('auth_token')}`}
                      alt="Comprobante de pago"
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: '0.375rem'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentNode as HTMLElement;
                        if (parent && !parent.querySelector('.error-msg')) {
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'error-msg';
                          errorDiv.innerHTML = `
                            <div style="text-align: center; color: rgba(255,255,255,0.6);">
                              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📄</div>
                              <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">No se pudo cargar el comprobante</p>
                              <button onclick="window.open('${API_BASE}/api/admin/pagos/${selectedPago.id_pago}/comprobante?token=${sessionStorage.getItem('auth_token')}', '_blank')" style="
                                background: rgba(16, 185, 129, 0.15);
                                border: 1px solid rgba(16, 185, 129, 0.3);
                                color: #10b981;
                                padding: 0.5rem 1rem;
                                border-radius: 0.375rem;
                                cursor: pointer;
                                font-size: 0.85rem;
                                font-weight: 600;
                              ">Abrir en nueva pestaña</button>
                            </div>
                          `;
                          parent.appendChild(errorDiv);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Botón de cierre */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 1.25rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {showComprobanteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowComprobanteModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={isMobile ? 18 : 20} style={{ color: '#10b981' }} />
                  <h3 style={{
                    margin: 0,
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    fontWeight: '600',
                    color: '#fff'
                  }}>
                    Comprobante de Pago
                  </h3>
                </div>
                {comprobanteNumero && (
                  <p style={{
                    margin: '4px 0 0 24px',
                    color: '#fbbf24',
                    fontSize: '0.75rem',
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
                <X size={16} />
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
              overflow: 'auto',
              maxHeight: '60vh'
            }}>
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '0.5rem'
                }}
                onLoad={(e) => {
                  console.log('✅ Imagen del comprobante cargada correctamente');
                }}
                onError={(e) => {
                  console.error('❌ Error al cargar imagen del comprobante:', comprobanteUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentNode as HTMLElement;
                  if (parent && !parent.querySelector('.error-message')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.innerHTML = `
                      <div style="text-align: center; color: rgba(255,255,255,0.7); padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                        <p style="font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 600;">No se pudo cargar la imagen del comprobante</p>
                        <p style="font-size: 0.9rem; color: rgba(255,255,255,0.5); margin-bottom: 1.5rem;">El archivo puede estar dañado o no ser una imagen válida</p>
                        <a href="${comprobanteUrl}" target="_blank" rel="noopener noreferrer" style="
                          color: #10b981; 
                          text-decoration: none;
                          background: rgba(16, 185, 129, 0.15);
                          border: 1px solid rgba(16, 185, 129, 0.3);
                          padding: 0.5rem 1rem;
                          border-radius: 0.5rem;
                          display: inline-block;
                          transition: all 0.2s ease;
                        " onmouseover="this.style.background='rgba(16, 185, 129, 0.25)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.15)'">
                          Intentar abrir en nueva pestaña
                        </a>
                      </div>
                    `;
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>

            {/* Botones */}
            <div style={{
              marginTop: '0.75rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
              <a
                href={comprobanteUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '8px 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
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
                  padding: '8px 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
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
          className="modal-overlay"
          onClick={() => setShowVerificacionModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '31.25rem' }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={isMobile ? 18 : 20} style={{ color: '#10b981' }} />
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Verificar Pago
                </h3>
              </div>
              <button
                onClick={() => setShowVerificacionModal(false)}
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
                <X size={16} />
              </button>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', margin: 0 }}>
                {pagoAVerificar.estudiante_nombre} {pagoAVerificar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'grid', gap: '0.5rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Monto total pagado:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#10b981' }}>
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
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                ¿Cuántas cuotas desea verificar con este pago?
              </label>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem',
                padding: '0.75rem'
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
                      <div style={{ textAlign: 'center', padding: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                        Solo la cuota actual está disponible para verificar
                      </div>
                    );
                  }

                  return cuotasDisponibles.map((cuota) => (
                    <label key={cuota.id_pago} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      background: cuotasAVerificar.includes(cuota.id_pago) ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      border: cuotasAVerificar.includes(cuota.id_pago) ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      marginBottom: '0.375rem',
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
                        style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, color: '#fff' }}>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                          {cuota.modalidad_pago === 'clases' ? `Clase ${cuota.numero_cuota}` : `Cuota #${cuota.numero_cuota}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                          {formatearMonto(cuota.monto)} - {cuota.estado}
                        </div>
                      </div>
                    </label>
                  ));
                })()}
              </div>
              <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.375rem' }}>
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                  Total a verificar: {cuotasAVerificar.length} cuota(s)
                </div>
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => {
                  setShowVerificacionModal(false);
                  setPagoAVerificar(null);
                  setCuotasAVerificar([]);
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '8px 1rem',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#9ca3af',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVerificacion}
                disabled={procesando || cuotasAVerificar.length === 0}
                style={{
                  flex: 1,
                  padding: '8px 1rem',
                  background: procesando || cuotasAVerificar.length === 0
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: procesando || cuotasAVerificar.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: procesando || cuotasAVerificar.length === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '0.875rem',
                      height: '0.875rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
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
          className="modal-overlay"
          onClick={() => setShowRechazoModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '31.25rem' }}
          >
            {/* Header del modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  fontWeight: '600',
                  color: '#fff'
                }}>
                  Rechazar Pago
                </h3>
              </div>
              <button
                onClick={() => setShowRechazoModal(false)}
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
                <X size={16} />
              </button>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.85rem',
                margin: 0
              }}>
                {pagoARechazar.modalidad_pago === 'clases' ? `Clase ${pagoARechazar.numero_cuota}` : `Cuota #${pagoARechazar.numero_cuota}`} - {pagoARechazar.estudiante_nombre} {pagoARechazar.estudiante_apellido}
              </p>
            </div>

            {/* Información del pago */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <AlertCircle size={14} /> Al rechazar este pago:
              </div>
              <ul style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '0.75rem',
                margin: 0,
                paddingLeft: '1rem'
              }}>
                <li>El estado volverá a "Pendiente"</li>
                <li>El estudiante deberá subir un nuevo comprobante</li>
                <li>Se le notificará el motivo del rechazo</li>
              </ul>
            </div>

            {/* Campo de motivo */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Motivo del rechazo *
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                placeholder="Ej: El comprobante no es legible, número incorrecto, etc."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  resize: 'vertical'
                }}
              />
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.5)',
                marginTop: '0.375rem'
              }}>
                Este mensaje será visible para el estudiante
              </div>
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => {
                  setShowRechazoModal(false);
                  setPagoARechazar(null);
                  setMotivoRechazo('');
                }}
                disabled={procesando}
                style={{
                  flex: 1,
                  padding: '8px 1rem',
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  borderRadius: '0.5rem',
                  color: '#9ca3af',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: procesando ? 'not-allowed' : 'pointer',
                  opacity: procesando ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarRechazo}
                disabled={procesando || !motivoRechazo.trim()}
                style={{
                  flex: 1,
                  padding: '8px 1rem',
                  background: procesando || !motivoRechazo.trim()
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: procesando || !motivoRechazo.trim() ? 'not-allowed' : 'pointer',
                  opacity: procesando || !motivoRechazo.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {procesando ? (
                  <>
                    <div style={{
                      width: '0.875rem',
                      height: '0.875rem',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <X size={16} />
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

      {/* Modal de carga */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando datos..."
        darkMode={true}
        duration={500}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
      />
    </div>
  );
};

export default GestionPagosEstudiante;



