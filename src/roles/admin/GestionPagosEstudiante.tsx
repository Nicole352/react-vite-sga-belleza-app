import { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Search, DollarSign, Eye, Check, X, Download, AlertCircle, CheckCircle2, XCircle, Calendar, BarChart3, User, FileText, BookOpen, ChevronLeft, ChevronRight, Sheet, Wallet, Hourglass, Building2, ImageOff, ExternalLink, Bell, ClipboardCheck, List, LayoutGrid, CheckCircle, XOctagon, BadgeCheck, ShieldX, CircleCheckBig, Ban, RefreshCcw, ArrowLeftRight } from 'lucide-react';
import { showToast } from '../../config/toastConfig';
import { StyledSelect } from '../../components/StyledSelect';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
import LoadingModal from '../../components/LoadingModal';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import GlassEffect from '../../components/GlassEffect';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

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
  comprobante_pago_url?: string | null;
  comprobante_pago_public_id?: string | null;
  estado: 'pendiente' | 'pagado' | 'verificado' | 'vencido';
  observaciones: string | null;
  verificado_por: number | null;
  fecha_verificacion: string | null;
  admin_nombre?: string;
  admin_identificacion?: string;
  verificado_por_nombre?: string;
  verificado_por_apellido?: string;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cedula: string;
  curso_nombre: string;
  codigo_matricula: string;
  id_curso: number;
  modalidad_pago?: 'mensual' | 'clases';
  numero_clases?: number;
  precio_por_clase?: number;
  curso_horario?: string;
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
  const [selectedHorario, setSelectedHorario] = useState<string>('todos');
  const [procesando, setProcesando] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const [detalleComprobanteError, setDetalleComprobanteError] = useState(false);
  const [comprobanteModalError, setComprobanteModalError] = useState(false);
  const [showRechazoModal, setShowRechazoModal] = useState(false);
  const [pagoARechazar, setPagoARechazar] = useState<Pago | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [pagoAVerificar, setPagoAVerificar] = useState<Pago | null>(null);
  const [cuotasAVerificar, setCuotasAVerificar] = useState<number[]>([]);

  const [selectedCurso, setSelectedCurso] = useState<{ [key: string]: number }>({});
  const [selectedCuota, setSelectedCuota] = useState<{ [key: string]: number }>({});
  const [selectedCursoTab, setSelectedCursoTab] = useState<'todos' | number>('todos');

  const buildCuotaKey = (cedula: string, cursoId: number) => `${cedula}-${cursoId}`;

  const setCuotaSeleccionada = (cedula: string, cursoId: number, cuotaId: number) => {
    const key = buildCuotaKey(cedula, cursoId);
    setSelectedCuota(prev => ({ ...prev, [key]: cuotaId }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // Default to table view

  // Trigger to refetch data when socket notifies of changes.
  const [socketTrigger, setSocketTrigger] = useState(0);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('admin-dark-mode');
      const nextMode = saved !== null ? JSON.parse(saved) : true;
      setDarkMode(prev => (prev === nextMode ? prev : nextMode));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCursoTab]);

  const pick = <T,>(light: T, dark: T): T => (darkMode ? dark : light);

  const theme = {
    pageBackground: pick(
      'linear-gradient(135deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 100%)',
      'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(17,17,25,0.92) 100%)'
    ),
    contentBackground: pick(
      '#ffffff',
      '#1e293b'
    ),
    textPrimary: pick('#0f172a', 'rgba(255,255,255,0.95)'),
    textSecondary: pick('rgba(71,85,105,0.85)', 'rgba(226,232,240,0.7)'),
    textMuted: pick('rgba(100,116,139,0.65)', 'rgba(148,163,184,0.6)'),
    surface: pick('rgba(255,255,255,0.94)', 'rgba(12,12,24,0.92)'),
    surfaceBorder: pick('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.08)'),
    inputBg: pick('#ffffff', 'rgba(255,255,255,0.08)'),
    inputBorder: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    inputIcon: pick('rgba(100,116,139,0.55)', 'rgba(255,255,255,0.55)'),
    chipBg: pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.07)'),
    cardBackground: pick(
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,248,252,0.94) 100%)',
      'linear-gradient(135deg, rgba(13,13,25,0.92) 0%, rgba(26,26,46,0.92) 100%)'
    ),
    cardShadow: pick('0 18px 48px rgba(15,23,42,0.12)', '0 24px 56px rgba(0,0,0,0.45)'),
    infoPanelBg: pick('rgba(59,130,246,0.12)', 'rgba(59,130,246,0.18)'),
    infoPanelBorder: pick('rgba(59,130,246,0.28)', 'rgba(59,130,246,0.35)'),
    positiveBg: pick('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.18)'),
    positiveBorder: pick('rgba(16,185,129,0.28)', 'rgba(16,185,129,0.35)'),
    warningBg: pick('rgba(251,191,36,0.14)', 'rgba(251,191,36,0.18)'),
    warningBorder: pick('rgba(251,191,36,0.32)', 'rgba(251,191,36,0.38)'),
    dangerBg: pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.2)'),
    dangerBorder: pick('rgba(239,68,68,0.28)', 'rgba(239,68,68,0.38)'),
    neutralBg: pick('rgba(148,163,184,0.12)', 'rgba(156,163,175,0.18)'),
    neutralBorder: pick('rgba(148,163,184,0.28)', 'rgba(156,163,175,0.35)'),
    buttonPrimaryBg: pick(RedColorPalette.primary, `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`),
    buttonPrimaryText: '#ffffff'
  };

  const tableContainerBg = pick(
    'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
    'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
  );
  const tableBorder = pick('rgba(239,68,68,0.18)', 'rgba(239,68,68,0.2)');
  const tableHeaderBg = pick('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.15)');
  const tableHeaderBorder = pick('rgba(248,113,113,0.18)', 'rgba(248,113,113,0.3)');
  const tableHeaderText = pick('#9f1239', '#ffffff');
  const tableRowDivider = pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)');
  const tableRowHover = pick('rgba(248,113,113,0.1)', 'rgba(248,113,113,0.08)');

  const tabTypographyStyles = `
    .admin-course-tab[data-active="false"][data-dark="false"] .admin-course-tab-title {
      color: #111827 !important;
    }
    .admin-course-tab[data-active="false"][data-dark="false"] .admin-course-tab-subtitle {
      color: #4b5563 !important;
    }
    .admin-course-tab[data-active="true"][data-dark="false"] .admin-course-tab-title,
    .admin-course-tab[data-active="true"][data-dark="false"] .admin-course-tab-subtitle {
      color: #ffffff !important;
    }
    .admin-course-tab[data-dark="true"] .admin-course-tab-title {
      color: rgba(248,250,252,0.92) !important;
    }
    .admin-course-tab[data-dark="true"] .admin-course-tab-subtitle {
      color: rgba(248,250,252,0.7) !important;
    }
    .admin-course-tab[data-dark="true"][data-active="true"] .admin-course-tab-title {
      color: #ffffff !important;
    }
    .admin-course-tab[data-dark="true"][data-active="true"] .admin-course-tab-subtitle {
      color: rgba(255,255,255,0.85) !important;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.85; }
    }
  `;

  useSocket({
    'nuevo_pago': (data: any) => {
      showToast.success('Nuevo pago registrado', darkMode);
      setSocketTrigger(prev => prev + 1);
    },
    'nuevo_pago_pendiente': (data: any) => {
      showToast.success(`Nuevo pago de ${data.estudiante_nombre} - Cuota #${data.numero_cuota}`, darkMode);
      setSocketTrigger(prev => prev + 1);
    },
    'pago_verificado': (data: any) => {
      setSocketTrigger(prev => prev + 1);
    },
    'pago_rechazado': (data: any) => {
      setSocketTrigger(prev => prev + 1);
    }
  });

  useEffect(() => {
    loadData();
  }, [filtroEstado, socketTrigger]);

  useEffect(() => {
    if (estudiantes.length === 0) return;
    const nuevosSelectores: { [key: string]: number } = {};

    estudiantes.forEach(est => {
      est.cursos.forEach(curso => {
        const key = buildCuotaKey(est.estudiante_cedula, curso.id_curso);
        const pagoPendiente = curso.pagos.find(p => p.estado === 'pagado');
        if (pagoPendiente) {
          nuevosSelectores[key] = pagoPendiente.id_pago;
        } else {
          const pagoNoVerificado = curso.pagos.find(p => p.estado !== 'verificado');
          if (pagoNoVerificado) {
            nuevosSelectores[key] = pagoNoVerificado.id_pago;
          } else if (curso.pagos[0]) {
            nuevosSelectores[key] = curso.pagos[0].id_pago;
          }
        }
      });
    });

    setSelectedCuota(prev => ({ ...prev, ...nuevosSelectores }));
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
      params.set('limit', '999999');

      const res = await fetch(`${API_BASE}/api/admin/pagos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error cargando pagos');

      const data = await res.json();
      setPagos(data);

      // Agrupar por estudiante
      const agrupados = agruparPorEstudiante(data);
      setEstudiantes(agrupados);

      // Inicializar selectores con primer curso por estudiante y primera cuota por curso
      const initCursos: { [key: string]: number } = {};
      const initCuotas: { [key: string]: number } = {};
      agrupados.forEach(est => {
        est.cursos.forEach((curso, index) => {
          if (index === 0) {
            initCursos[est.estudiante_cedula] = curso.id_curso;
          }
          if (curso.pagos.length > 0) {
            const key = buildCuotaKey(est.estudiante_cedula, curso.id_curso);
            initCuotas[key] = curso.pagos[0].id_pago;
          }
        });
      });
      setSelectedCurso(initCursos);
      setSelectedCuota(initCuotas);

    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast.error('Error cargando datos de pagos', darkMode);
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

  const openComprobanteModal = async (pago: Pago) => {
    try {
      const token = sessionStorage.getItem('auth_token');

      // Obtener la URL de Cloudinary desde el endpoint
      const response = await fetch(`${API_BASE}/api/admin/pagos/${pago.id_pago}/comprobante`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el comprobante');
      }

      const data = await response.json();

      if (!data.success || !data.comprobante_pago_url) {
        throw new Error('Comprobante no disponible');
      }

      // Usar directamente la URL de Cloudinary
      setComprobanteUrl(data.comprobante_pago_url);
      setComprobanteNumero(pago.numero_comprobante || 'N/A');
      setComprobanteModalError(false);
      setShowComprobanteModal(true);
    } catch (error) {
      console.error('Error obteniendo comprobante:', error);
      setComprobanteModalError(true);
      showToast.error('No se pudo cargar el comprobante', darkMode);
    }
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

      showToast.success(`${cuotasAVerificar.length} cuota(s) verificada(s) exitosamente`, darkMode);

    } catch (error) {
      console.error('Error:', error);
      showToast.error('Error verificando los pagos', darkMode);
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
      showToast.warning('Por favor ingrese el motivo del rechazo', darkMode);
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

      showToast.success('Pago rechazado correctamente', darkMode);

    } catch (error) {
      console.error('Error:', error);
      showToast.error('Error rechazando el pago', darkMode);
    } finally {
      setProcesando(false);
    }
  };

  // Contador de pagos pendientes por verificar (estado = 'pagado')
  const pagosPorVerificar = useMemo(() => {
    let count = 0;
    estudiantes.forEach(est => {
      est.cursos.forEach(curso => {
        curso.pagos.forEach(pago => {
          if (pago.estado === 'pagado') {
            count++;
          }
        });
      });
    });
    return count;
  }, [estudiantes]);

  const cursosDisponibles = useMemo(() => {
    const map = new Map<string, { id: number; nombre: string }>();
    estudiantes.forEach(est => {
      est.cursos.forEach(curso => {
        // Solo incluir cursos con pagos (cursos activos)
        const primerPago = curso.pagos[0];

        if (primerPago && !map.has(curso.curso_nombre)) {
          map.set(curso.curso_nombre, {
            id: curso.id_curso,
            nombre: curso.curso_nombre
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [estudiantes]);

  useEffect(() => {
    if (selectedCursoTab === 'todos') return;
    const existe = cursosDisponibles.some(c => c.id === selectedCursoTab);
    if (!existe) {
      setSelectedCursoTab('todos');
    }
  }, [cursosDisponibles, selectedCursoTab]);

  // Filtrar y ordenar estudiantes
  const estudiantesFiltrados = useMemo(() => {
    let result = estudiantes;

    // Filtrar por horario si no es 'todos'
    if (selectedHorario !== 'todos') {
      result = result.map(est => ({
        ...est,
        cursos: est.cursos.filter(curso => {
          const horario = curso.pagos[0]?.curso_horario;
          return horario === selectedHorario;
        })
      })).filter(est => est.cursos.length > 0);
    }

    // Filtrar por curso seleccionado
    result = result.filter(est => {
      if (selectedCursoTab === 'todos') return true;
      // Buscar el nombre del curso seleccionado
      const cursoSeleccionado = cursosDisponibles.find(c => c.id === selectedCursoTab);
      if (!cursoSeleccionado) return false;
      // Filtrar por nombre de curso en lugar de id
      return est.cursos.some(curso => curso.curso_nombre === cursoSeleccionado.nombre);
    });

    // Filtrar por búsqueda
    result = result.filter(est => {
      const matchSearch =
        est.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.estudiante_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.estudiante_cedula.includes(searchTerm);

      return matchSearch;
    });

    // Ordenar
    return result.sort((a, b) => {
      if (filtroPrioridad === 'pendientes_primero') {
        const pagosPendientesA = a.cursos.flatMap(curso =>
          curso.pagos.filter(pago => pago.estado === 'pagado')
        );
        const pagosPendientesB = b.cursos.flatMap(curso =>
          curso.pagos.filter(pago => pago.estado === 'pagado')
        );

        if (pagosPendientesA.length > 0 && pagosPendientesB.length === 0) return -1;
        if (pagosPendientesB.length > 0 && pagosPendientesA.length === 0) return 1;
      }

      const pagoA = a.cursos[0]?.pagos[0];
      const pagoB = b.cursos[0]?.pagos[0];
      if (!pagoA || !pagoB) return 0;
      const dateA = new Date(pagoA.fecha_vencimiento).getTime();
      const dateB = new Date(pagoB.fecha_vencimiento).getTime();
      return dateA - dateB;
    });
  }, [estudiantes, selectedHorario, selectedCursoTab, searchTerm, filtroPrioridad]);

  // Paginación
  const totalPages = Math.ceil(estudiantesFiltrados.length / itemsPerPage);
  const paginatedEstudiantes = estudiantesFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Obtener el pago seleccionado para un estudiante en un curso específico
  const getPagoSeleccionado = (estudiante: EstudianteAgrupado, curso: EstudianteAgrupado['cursos'][number]): Pago | null => {
    const key = buildCuotaKey(estudiante.estudiante_cedula, curso.id_curso);
    const idCuota = selectedCuota[key];
    if (idCuota) {
      return curso.pagos.find(p => p.id_pago === idCuota) || curso.pagos[0] || null;
    }
    return curso.pagos[0] || null;
  };

  // Obtener el curso seleccionado para un estudiante
  const getCursoSeleccionado = (estudiante: EstudianteAgrupado) => {
    const idCurso = selectedCurso[estudiante.estudiante_cedula];
    return estudiante.cursos.find(c => c.id_curso === idCurso) || estudiante.cursos[0];
  };

  const getEmptyMessage = () => {
    if (searchTerm) return 'No se encontraron registros que coincidan con la búsqueda';
    switch (filtroEstado) {
      case 'vencido': return 'No hay pagos vencidos';
      case 'verificado': return 'No hay pagos verificados';
      case 'pagado': return 'No hay pagos pendientes de verificación';
      case 'pendiente': return 'No hay pagos pendientes de pago';
      default: return 'No hay pagos registrados';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '25rem',
        color: theme.textPrimary
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

  const getAlertBadge = (options: { inHeader?: boolean, compact?: boolean }) => {
    const { inHeader, compact } = options;
    return (
      <div
        onClick={() => pagosPorVerificar > 0 && setFiltroEstado('pagado')}
        style={{
          background: pagosPorVerificar > 0
            ? (darkMode
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.06) 100%)')
            : (darkMode
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.06) 100%)'),
          border: pagosPorVerificar > 0
            ? '1px solid rgba(239, 68, 68, 0.35)'
            : '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '0.35rem',
          padding: compact ? '0.45rem 1.2rem' : '0.5rem 1rem',
          marginBottom: (inHeader || compact) ? 0 : '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '0.6rem' : '0.75rem',
          cursor: pagosPorVerificar > 0 ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          boxShadow: pagosPorVerificar > 0
            ? '0 2px 8px rgba(239, 68, 68, 0.15)'
            : '0 2px 8px rgba(16, 185, 129, 0.1)',
          animation: pagosPorVerificar > 0 ? 'pulse 2s infinite' : 'none',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (pagosPorVerificar > 0) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = pagosPorVerificar > 0
            ? '0 2px 8px rgba(239, 68, 68, 0.15)'
            : '0 2px 8px rgba(16, 185, 129, 0.1)';
        }}
      >
        <div style={{
          background: pagosPorVerificar > 0
            ? 'rgba(239, 68, 68, 0.15)'
            : 'rgba(16, 185, 129, 0.15)',
          borderRadius: '0.5rem',
          padding: compact ? '0.25rem' : '0.3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {pagosPorVerificar > 0 ? (
            <>
              <ClipboardCheck size={compact ? 16 : 18} color="#ef4444" />
              <div style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 700,
                boxShadow: '0 1px 4px rgba(239, 68, 68, 0.4)'
              }}>
                {pagosPorVerificar}
              </div>
            </>
          ) : (
            <CheckCircle2 size={compact ? 16 : 18} color="#10b981" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            color: pagosPorVerificar > 0 ? '#ef4444' : '#10b981',
            fontSize: compact ? '0.85rem' : '0.9rem',
            fontWeight: 700,
            marginBottom: '0.1rem',
            whiteSpace: 'nowrap'
          }}>
            {pagosPorVerificar > 0
              ? `${pagosPorVerificar} ${pagosPorVerificar === 1 ? 'pago pendiente' : 'pagos pendientes'}`
              : (compact ? '¡Al día!' : '¡Al día! Sin pendientes')
            }
          </div>
          {!(inHeader || compact) && (
            <div style={{
              color: theme.textSecondary,
              fontSize: '0.75rem'
            }}>
              {pagosPorVerificar > 0
                ? 'Haz clic aquí para ver los pagos que requieren tu verificación'
                : 'Todos los pagos han sido verificados correctamente'
              }
            </div>
          )}
        </div>
        {(pagosPorVerificar > 0 && !compact) && <Bell size={16} color="#ef4444" style={{ opacity: 0.7 }} />}
      </div>
    );
  };

  return (
    <div
      style={
        {
          background: theme.pageBackground,
          color: "theme.textPrimary",
          minHeight: '100%',
          transition: 'background 0.3s ease, color 0.3s ease',
          '--admin-card-bg': theme.cardBackground,
          '--admin-bg-secondary': theme.surface,
          '--admin-border': theme.surfaceBorder,
          '--admin-text-primary': theme.textPrimary,
          '--admin-text-secondary': theme.textSecondary,
          '--admin-text-muted': theme.textMuted,
          '--admin-input-bg': theme.inputBg,
          '--admin-input-border': theme.inputBorder,
          '--admin-input-text': theme.textPrimary,
          '--admin-input-icon': theme.inputIcon,
          '--admin-info-bg': theme.infoPanelBg,
          '--admin-info-border': theme.infoPanelBorder
        } as CSSProperties
      }
    >
      <style>{tabTypographyStyles}</style>
      {/* Header */}
      <AdminSectionHeader
        title={`Gestión de Pagos${!isMobile ? ' Mensuales' : ''}`}
        subtitle="Verifica y administra los pagos mensuales de los estudiantes"
        rightSlot={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={async () => {
                try {
                  const params = new URLSearchParams();
                  if (filtroEstado !== 'todos') params.set('estado', filtroEstado);
                  if (selectedHorario !== 'todos') params.set('horario', selectedHorario);
                  if (selectedCursoTab !== 'todos') params.set('cursoId', String(selectedCursoTab));
                  if (searchTerm) params.set('search', searchTerm);

                  const fetchUrl = `${API_BASE}/api/pagos-mensuales/reporte/excel${params.toString() ? '?' + params.toString() : ''}`;
                  const response = await fetch(fetchUrl);
                  if (!response.ok) throw new Error('Error descargando reporte');
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = `Reporte_Pagos_${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(blobUrl);
                  document.body.removeChild(a);
                  showToast.success('Reporte descargado correctamente', darkMode);
                } catch (error) {
                  console.error('Error:', error);
                  showToast.error('Error al descargar el reporte', darkMode);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                height: '2rem',
                padding: '0 1rem',
                background: `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
                border: 'none',
                borderRadius: '0.625rem',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Sheet size={14} color="#fff" />
              Descargar Excel
            </button>
            <button
              onClick={async () => {
                if (loading) return;
                await loadData();
              }}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                background: theme.contentBackground,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '0.625rem',
                color: theme.textSecondary,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />




      {/* Controles */}
      <GlassEffect
        variant="card"
        tint="neutral"
        intensity="light"
        style={{
          marginBottom: isMobile ? '0.5rem' : '0.5rem',
          padding: '0.5rem',
          boxShadow: 'none',
          borderRadius: '0.375rem',
          border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.18)'}`
        }}
      >
        <div className="responsive-filters" style={{ gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            position: 'relative',
            flex: 2,
            width: isSmallScreen ? '100%' : 'auto'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: theme.inputIcon }} />
            <input
              type="text"
              placeholder={isMobile ? "Buscar..." : "Buscar estudiante..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0 0.5rem 0 2rem',
                background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,250,252,0.95)',
                border: `1px solid ${darkMode ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '0.5rem',
                color: theme.textPrimary,
                fontSize: '0.75rem',
                boxShadow: 'none',
                height: '2rem'
              }}
            />
          </div>
          <div style={{
            minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)',
            width: isSmallScreen ? '100%' : 'auto'
          }}>
            <StyledSelect
              name="filterEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              darkMode={darkMode}
              options={[
                { value: 'todos', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'pagado', label: 'Pagados' },
                { value: 'verificado', label: 'Verificados' },
                { value: 'vencido', label: 'Vencidos' },
              ]}
            />
          </div>
          <div style={{
            minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)',
            width: isSmallScreen ? '100%' : 'auto'
          }}>
            <StyledSelect
              name="filterHorario"
              value={selectedHorario}
              onChange={(e) => setSelectedHorario(e.target.value)}
              darkMode={darkMode}
              options={[
                { value: 'todos', label: 'Todos los horarios' },
                { value: 'matutino', label: 'Matutino' },
                { value: 'vespertino', label: 'Vespertino' },
              ]}
            />
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                gap: '0.375rem',
                background: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.12)',
                borderRadius: '0.65rem',
                padding: '0.1875rem',
                border: 'none',
                boxShadow: 'none'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3em',
                    padding: '0.3125rem 0.75rem',
                    background: viewMode === 'grid' ? (darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff') : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: viewMode === 'grid' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)'),
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  title="Vista de Tarjetas"
                >
                  <LayoutGrid size={16} color={viewMode === 'grid' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)')} /> Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3em',
                    padding: '0.3125rem 0.75rem',
                    background: viewMode === 'table' ? (darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff') : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: viewMode === 'table' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)'),
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                  title="Vista de Tabla"
                >
                  <List size={16} color={viewMode === 'table' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)')} /> Tabla
                </button>
              </div>


            </div>
          )}
          {/* Badge de Pagos Pendientes Compacto */}
          <div style={{ display: isSmallScreen ? 'none' : 'block' }}>
            {getAlertBadge({ compact: true })}
          </div>
        </div>
      </GlassEffect>

      {/* Badge de Pagos Pendientes (Mobile only - visible abajo) */}
      {isMobile && (
        <div style={{ marginBottom: '0.5rem' }}>
          {getAlertBadge({})}
        </div>
      )}

      {cursosDisponibles.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          marginBottom: '1rem',
          background: darkMode ? 'rgba(15,23,42,0.4)' : 'rgba(248,250,252,0.8)',
          border: `1px solid ${theme.surfaceBorder}`,
          borderRadius: '0.35rem',
          padding: isMobile ? '0.6rem' : '0.75rem',
          boxShadow: darkMode ? '0 0.5rem 1.5rem rgba(0,0,0,0.35)' : '0 0.5rem 1rem rgba(15,23,42,0.08)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(12rem, 1fr))',
            gap: '0.6rem',
            alignItems: 'stretch'
          }}>
            {['todos', ...cursosDisponibles.map(c => c.id)].map((cursoId) => {
              const isAll = cursoId === 'todos';
              const cursoInfo = isAll ? { nombre: 'Todos los cursos' } : cursosDisponibles.find(c => c.id === cursoId);
              if (!cursoInfo) return null;
              const isActive = selectedCursoTab === cursoId;
              const inactiveText = darkMode ? 'rgba(248,250,252,0.92)' : '#111827';
              const detailText = darkMode ? 'rgba(248,250,252,0.7)' : '#4b5563';
              const activeText = '#ffffff';
              const iconColor = isActive
                ? '#ffffff'
                : (darkMode ? 'rgba(255,255,255,0.9)' : '#ef4444');
              const iconBackground = isActive
                ? darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.85)'
                : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.12)';
              const textColor = isActive ? activeText : inactiveText;
              const detailActiveColor = darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)';
              return (
                <button
                  key={cursoId}
                  className="admin-course-tab"
                  data-active={isActive}
                  data-dark={darkMode}
                  onClick={() => setSelectedCursoTab(cursoId as typeof selectedCursoTab)}
                  style={{
                    borderRadius: '1rem',
                    padding: '0.6rem 0.75rem',
                    border: `1px solid ${isActive ? mapToRedScheme('rgba(239,68,68,0.8)') : theme.surfaceBorder}`,
                    background: isActive
                      ? theme.buttonPrimaryBg
                      : theme.cardBackground,
                    color: textColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    boxShadow: isActive
                      ? '0 0.5rem 1rem rgba(239,68,68,0.35)'
                      : darkMode ? '0 0.3rem 0.8rem rgba(0,0,0,0.3)' : '0 0.2rem 0.5rem rgba(15,23,42,0.08)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: iconBackground,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={16} color={iconColor} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div className="admin-course-tab-title" style={{ color: textColor }}>{cursoInfo.nombre}</div>
                    {!isAll && (
                      <>
                        <div
                          className="admin-course-tab-subtitle"
                          style={{ color: isActive ? detailActiveColor : detailText, fontSize: '0.65rem', fontWeight: 500 }}
                        >
                          {isActive ? 'Mostrando' : 'Ver pagos'}
                        </div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de estudiantes - Tabla o Tarjetas */}
      {viewMode === 'table' && !isMobile ? (
        <>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: darkMode ? 'rgba(239,68,68,0.12)' : 'rgba(254,226,226,0.9)',
              border: `1px solid ${darkMode ? 'rgba(248,113,113,0.4)' : 'rgba(248,113,113,0.35)'}`,
              borderRadius: '0.5rem',
              padding: '8px 0.75rem',
              marginBottom: '0.75rem',
              color: darkMode ? 'rgba(248,250,252,0.85)' : 'rgba(153,27,27,0.85)',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}>
              <ArrowLeftRight size={16} strokeWidth={2.25} />
              <span>Desliza horizontalmente para ver toda la tabla</span>
              <ArrowLeftRight size={16} strokeWidth={2.25} />
            </div>
          )}

          <div className="responsive-table-container" style={{
            overflowX: 'auto',
            borderRadius: isMobile ? '12px' : '0.75rem',
            border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.18)'}`,
            background: darkMode
              ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
            marginBottom: isMobile ? '12px' : '0.5rem',
            position: 'relative'
          }}>
            {!isMobile && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.08,
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}>
                <ArrowLeftRight size={16} color={darkMode ? '#ffffff' : '#0f172a'} strokeWidth={2.25} />
                <ArrowLeftRight size={16} color={darkMode ? '#ffffff' : '#0f172a'} strokeWidth={2.25} />
              </div>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', position: 'relative', zIndex: 1 }}>
              <thead style={{
                background: darkMode ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.12)',
                borderBottom: `1px solid ${darkMode ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.18)'}`
              }}>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Estudiante</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Identificación</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Curso</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Cuota</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Monto</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Vencimiento</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Método</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Estado</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Comprobante</th>
                  <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEstudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '40px 1.25rem', textAlign: 'center', color: theme.textSecondary, fontSize: '0.85rem' }}>
                      {getEmptyMessage()}
                    </td>
                  </tr>
                ) : (
                  paginatedEstudiantes.map((estudiante) => {
                    const cursoFiltrado = selectedCursoTab !== 'todos'
                      ? estudiante.cursos.find(c => c.id_curso === selectedCursoTab)
                      : null;
                    const cursoActual = cursoFiltrado || getCursoSeleccionado(estudiante);
                    if (!cursoActual) return null;

                    const pago = getPagoSeleccionado(estudiante, cursoActual);
                    if (!pago) return null;

                    const metodoPagoBadge = (() => {
                      if (pago.metodo_pago === 'efectivo') {
                        return { label: 'Efectivo', color: '#10b981', Icon: Wallet };
                      }
                      if (!pago.numero_comprobante) {
                        return { label: 'En Espera', color: '#f59e0b', Icon: Hourglass };
                      }
                      return { label: 'Transferencia', color: '#3b82f6', Icon: Building2 };
                    })();

                    const MetodoIcon = metodoPagoBadge.Icon;
                    const cuotaKey = buildCuotaKey(estudiante.estudiante_cedula, cursoActual.id_curso);

                    return (
                      <tr
                        key={pago.id_pago}
                        style={{
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}`,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textPrimary, fontWeight: 600, fontSize: '0.7rem', verticalAlign: 'middle' }}>
                          {estudiante.estudiante_apellido}, {estudiante.estudiante_nombre}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textSecondary, fontSize: '0.65rem', verticalAlign: 'middle' }}>{estudiante.estudiante_cedula}</td>
                        <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle' }}>
                          {selectedCursoTab !== 'todos' ? (
                            <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 500 }}>
                              {cursoActual.curso_nombre}
                            </div>
                          ) : estudiante.cursos.length > 1 ? (
                            <select
                              value={selectedCurso[estudiante.estudiante_cedula] || cursoActual.id_curso}
                              onChange={(e) => {
                                const newIdCurso = Number(e.target.value);
                                setSelectedCurso(prev => ({ ...prev, [estudiante.estudiante_cedula]: newIdCurso }));
                                const nuevoCurso = estudiante.cursos.find(c => c.id_curso === newIdCurso);
                                if (nuevoCurso && nuevoCurso.pagos.length > 0) {
                                  const newKey = buildCuotaKey(estudiante.estudiante_cedula, nuevoCurso.id_curso);
                                  setSelectedCuota(prev => {
                                    if (prev[newKey]) return prev;
                                    return { ...prev, [newKey]: nuevoCurso.pagos[0].id_pago };
                                  });
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '0.25rem 0.5rem',
                                background: theme.inputBg,
                                border: `1px solid ${theme.inputBorder}`,
                                borderRadius: '0.375rem',
                                color: theme.textPrimary,
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                fontWeight: 500
                              }}
                            >
                              {estudiante.cursos.map(curso => (
                                <option
                                  key={curso.id_curso}
                                  value={curso.id_curso}
                                  style={{
                                    background: darkMode ? '#1a1a2e' : '#ffffff',
                                    color: darkMode ? '#f8fafc' : '#0f172a'
                                  }}
                                >
                                  {curso.curso_nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 500 }}>{cursoActual.curso_nombre}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem' }}>
                          <select
                            value={selectedCuota[cuotaKey] ?? pago.id_pago}
                            onChange={(e) => {
                              setCuotaSeleccionada(estudiante.estudiante_cedula, cursoActual.id_curso, Number(e.target.value));
                            }}
                            style={{
                              width: '100%',
                              padding: '0.25rem 0.5rem',
                              background: theme.inputBg,
                              border: `1px solid ${theme.inputBorder}`,
                              borderRadius: '0.375rem',
                              color: theme.textPrimary,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {cursoActual.pagos.map(p => (
                              <option
                                key={p.id_pago}
                                value={p.id_pago}
                                style={{
                                  background: darkMode ? '#1a1a2e' : '#ffffff',
                                  color: darkMode ? '#f8fafc' : '#0f172a'
                                }}
                              >
                                {pago.modalidad_pago === 'clases' ? `Clase ${p.numero_cuota}` : `Cuota ${p.numero_cuota}`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textPrimary, fontWeight: 700, fontSize: '0.7rem' }}>{formatearMonto(pago.monto)}</td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textSecondary, fontSize: '0.65rem' }}>{formatearFecha(pago.fecha_vencimiento)}</td>
                        <td style={{ padding: '0.25rem 0.5rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '3px 0.5rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            color: metodoPagoBadge.color,
                            background: `${metodoPagoBadge.color}15`,
                            border: `1px solid ${metodoPagoBadge.color}30`
                          }}>
                            <MetodoIcon size={11} />
                            {metodoPagoBadge.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem' }}>
                          <span style={{
                            padding: '3px 0.625rem',
                            borderRadius: '999px',
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
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          {pago.numero_comprobante ? (
                            <button
                              onClick={() => openComprobanteModal(pago)}
                              title="Ver comprobante"
                              style={{
                                padding: '0.25rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #10b981',
                                backgroundColor: 'transparent',
                                color: '#10b981',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#10b981';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#10b981';
                              }}
                            >
                              <Download style={{ width: '0.85rem', height: '0.85rem' }} />
                            </button>
                          ) : (
                            <span style={{ color: theme.textMuted, fontSize: '0.65rem', fontStyle: 'italic' }}>Sin comprobante</span>
                          )}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedPago(pago);
                                setShowModal(true);
                              }}
                              title="Ver Detalles"
                              style={{
                                padding: '0.25rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #3b82f6',
                                backgroundColor: 'transparent',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#3b82f6';
                              }}
                            >
                              <Eye style={{ width: '0.85rem', height: '0.85rem' }} />
                            </button>
                            {pago.estado === 'pagado' && (
                              <>
                                <button
                                  onClick={() => handleVerificarPago(pago)}
                                  disabled={procesando}
                                  title="Verificar Pago"
                                  style={{
                                    padding: '0.25rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #10b981',
                                    backgroundColor: 'transparent',
                                    color: '#10b981',
                                    cursor: procesando ? 'not-allowed' : 'pointer',
                                    opacity: procesando ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!procesando) {
                                      e.currentTarget.style.backgroundColor = '#10b981';
                                      e.currentTarget.style.color = 'white';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#10b981';
                                  }}
                                >
                                  <BadgeCheck style={{ width: '1rem', height: '1rem' }} />
                                </button>
                                <button
                                  onClick={() => handleRechazarPago(pago)}
                                  disabled={procesando}
                                  title="Rechazar Pago"
                                  style={{
                                    padding: '0.375rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #ef4444',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    cursor: procesando ? 'not-allowed' : 'pointer',
                                    opacity: procesando ? 0.5 : 1,
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!procesando) {
                                      e.currentTarget.style.backgroundColor = '#ef4444';
                                      e.currentTarget.style.color = 'white';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#ef4444';
                                  }}
                                >
                                  <ShieldX style={{ width: '1rem', height: '1rem' }} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.25rem' }}>
          {paginatedEstudiantes.length === 0 ? (
            <div style={{ padding: '40px 1.25rem', textAlign: 'center', color: theme.textSecondary, fontSize: '0.85rem' }}>
              {getEmptyMessage()}
            </div>
          ) : (
            paginatedEstudiantes.map((estudiante) => {
              const cursoFiltrado = selectedCursoTab !== 'todos'
                ? estudiante.cursos.find(c => c.id_curso === selectedCursoTab)
                : null;
              const cursoActual = cursoFiltrado || getCursoSeleccionado(estudiante);
              if (!cursoActual) return null;

              const pago = getPagoSeleccionado(estudiante, cursoActual);
              if (!pago) return null;

              const cuotaKey = buildCuotaKey(estudiante.estudiante_cedula, cursoActual.id_curso);
              const cuotaSeleccionada = selectedCuota[cuotaKey] ?? pago.id_pago;

              const metodoPagoBadge = (() => {
                if (pago.metodo_pago === 'efectivo') {
                  return {
                    label: 'Efectivo',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    Icon: Wallet
                  } as const;
                }

                if (!pago.numero_comprobante) {
                  return {
                    label: 'En Espera',
                    color: '#f59e0b',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    Icon: Hourglass
                  } as const;
                }

                return {
                  label: 'Transferencia',
                  color: '#3b82f6',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  Icon: Building2
                } as const;
              })();

              const MetodoIcon = metodoPagoBadge.Icon;

              return (
                <div
                  key={pago.id_pago}
                  style={{
                    background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
                    backdropFilter: 'blur(1.25rem)',
                    border: '1px solid var(--admin-border, rgba(239, 68, 68, 0.2))',
                    borderRadius: '0.5rem',
                    padding: '0.35rem 0.5rem',
                    boxShadow: '0 0.125rem 0.5rem rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem'
                  }}
                >
                  {/* Información Principal + Selectores Combinados */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.8fr',
                    gap: '0.5rem',
                    alignItems: 'start'
                  }}>
                    {/* Izquierda: Badges + Nombre + ID */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              color: metodoPagoBadge.color,
                              fontSize: '0.65rem',
                              background: metodoPagoBadge.background,
                              border: metodoPagoBadge.border,
                              padding: '0.2rem 0.4rem',
                              borderRadius: '0.35rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.01em'
                            }}
                          >
                            <MetodoIcon size={12} color={metodoPagoBadge.color} />
                            {metodoPagoBadge.label}
                          </span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '0.35rem',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            background: pago.estado === 'verificado' ? 'rgba(16, 185, 129, 0.1)' :
                              pago.estado === 'pagado' ? 'rgba(251, 191, 36, 0.1)' :
                                pago.estado === 'vencido' ? 'rgba(239, 68, 68, 0.1)' :
                                  'rgba(156, 163, 175, 0.1)',
                            border: pago.estado === 'verificado' ? '1px solid rgba(16, 185, 129, 0.2)' :
                              pago.estado === 'pagado' ? '1px solid rgba(251, 191, 36, 0.2)' :
                                pago.estado === 'vencido' ? '1px solid rgba(239, 68, 68, 0.2)' :
                                  '1px solid rgba(156, 163, 175, 0.2)',
                            color: pago.estado === 'verificado' ? '#10b981' :
                              pago.estado === 'pagado' ? '#fbbf24' :
                                pago.estado === 'vencido' ? '#ef4444' :
                                  '#9ca3af',
                            letterSpacing: '0.025em'
                          }}>
                            {pago.estado}
                          </span>
                        </div>
                      </div>

                      <h3 style={{
                        color: theme.textPrimary,
                        margin: '0 0 0.1rem 0',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em'
                      }}>
                        {pago.estudiante_apellido}, {pago.estudiante_nombre}
                      </h3>
                      <div style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: 500 }}>
                        ID: {estudiante.estudiante_cedula}
                      </div>
                    </div>

                    {/* Derecha: Selectores de Curso, Cuota y Vencimiento Compactos */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 0.8fr 1fr',
                      gap: '0.35rem',
                      alignItems: 'end',
                      background: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                      padding: '0.25rem',
                      borderRadius: '0.35rem'
                    }}>
                      {/* Curso */}
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.1rem', fontWeight: 600 }}>CURSO</div>
                        {selectedCursoTab !== 'todos' ? (
                          <div style={{
                            color: theme.textPrimary,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {cursoActual.curso_nombre}
                          </div>
                        ) : estudiante.cursos.length > 1 ? (
                          <select
                            value={selectedCurso[estudiante.estudiante_cedula] || cursoActual.id_curso}
                            onChange={(e) => {
                              const newIdCurso = Number(e.target.value);
                              setSelectedCurso(prev => ({ ...prev, [estudiante.estudiante_cedula]: newIdCurso }));
                              const nuevoCurso = estudiante.cursos.find(c => c.id_curso === newIdCurso);
                              if (nuevoCurso && nuevoCurso.pagos.length > 0) {
                                const newKey = buildCuotaKey(estudiante.estudiante_cedula, nuevoCurso.id_curso);
                                setSelectedCuota(prev => {
                                  if (prev[newKey]) return prev;
                                  return { ...prev, [newKey]: nuevoCurso.pagos[0].id_pago };
                                });
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '0.15rem 0.3rem',
                              background: theme.inputBg,
                              border: `1px solid ${theme.inputBorder}`,
                              borderRadius: '0.25rem',
                              color: theme.textPrimary,
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              fontWeight: 700,
                              lineHeight: 1.2
                            }}
                          >
                            {estudiante.cursos.map(curso => (
                              <option
                                key={curso.id_curso}
                                value={curso.id_curso}
                                style={{
                                  background: darkMode ? '#1a1a2e' : '#ffffff',
                                  color: darkMode ? '#f8fafc' : '#0f172a'
                                }}
                              >
                                {curso.curso_nombre}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 700 }}>{cursoActual.curso_nombre}</div>
                        )}
                      </div>

                      {/* Cuota */}
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.1rem', fontWeight: 600 }}>{pago.modalidad_pago === 'clases' ? 'CLASE' : 'CUOTA'}</div>
                        <select
                          value={cuotaSeleccionada}
                          onChange={(e) => {
                            setCuotaSeleccionada(estudiante.estudiante_cedula, cursoActual.id_curso, Number(e.target.value));
                          }}
                          style={{
                            width: '100%',
                            padding: '0.15rem 0.3rem',
                            background: theme.inputBg,
                            border: `1px solid ${theme.inputBorder}`,
                            borderRadius: '0.25rem',
                            color: theme.textPrimary,
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            fontWeight: 800,
                            lineHeight: 1.2
                          }}
                        >
                          {cursoActual.pagos.map(p => (
                            <option
                              key={p.id_pago}
                              value={p.id_pago}
                              style={{
                                background: darkMode ? '#1a1a2e' : '#ffffff',
                                color: darkMode ? '#f8fafc' : '#0f172a'
                              }}
                            >
                              #{p.numero_cuota} - {formatearMonto(p.monto)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Vencimiento */}
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.1rem', fontWeight: 600 }}>VENCE</div>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {formatearFecha(pago.fecha_vencimiento)}
                        </div>
                      </div>
                    </div>
                  </div>    {/* Segunda fila - Número, Comprobante y Estado */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : (pago.metodo_pago === 'efectivo' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'),
                    gap: '0.5rem',
                    alignItems: 'end'
                  }}>
                    {/* Número de comprobante */}
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.05rem', fontWeight: 500 }}>
                        Número Comprobante
                      </div>
                      <div style={{
                        background: pago.numero_comprobante ? 'rgba(239, 68, 68, 0.05)' : 'rgba(107, 114, 128, 0.05)',
                        border: pago.numero_comprobante ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid rgba(107, 114, 128, 0.1)',
                        color: pago.numero_comprobante ? RedColorPalette.primary : 'var(--admin-text-secondary, rgba(255, 255, 255, 0.5))',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontStyle: pago.numero_comprobante ? 'normal' : 'italic'
                      }}>
                        {pago.numero_comprobante || 'N/A'}
                      </div>
                    </div>

                    {/* Recibido por - Solo para efectivo */}
                    {pago.metodo_pago === 'efectivo' && (
                      <div>
                        <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.05rem', fontWeight: 500 }}>Recibido por</div>
                        <div style={{
                          background: 'rgba(180, 83, 9, 0.05)',
                          border: '1px solid rgba(180, 83, 9, 0.1)',
                          color: '#b45309',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          fontStyle: (pago as any).recibido_por ? 'normal' : 'italic'
                        }}>
                          {(pago as any).recibido_por || 'SECRETARIA'}
                        </div>
                      </div>
                    )}

                    {/* Comprobante - Botón */}
                    <div>
                      <div style={{ color: theme.textMuted, fontSize: '0.65rem', marginBottom: '0.05rem', fontWeight: 500 }}>Recibo</div>
                      {pago.numero_comprobante ? (
                        <button
                          onClick={() => openComprobanteModal(pago)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            width: '100%',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
                        >
                          <Download size={13} /> Ver Comprobante
                        </button>
                      ) : (
                        <div style={{
                          background: 'rgba(107, 114, 128, 0.05)',
                          border: '1px solid rgba(107, 114, 128, 0.1)',
                          color: 'var(--admin-text-secondary, rgba(255, 255, 255, 0.5))',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          textAlign: 'center',
                          fontStyle: 'italic',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}>
                          <ImageOff size={13} /> Sin archivo
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.3rem',
                    marginTop: '0'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedPago(pago);
                        setDetalleComprobanteError(false);
                        setShowModal(true);
                      }}
                      style={{
                        background: pick('rgba(59, 130, 246, 0.06)', 'rgba(59, 130, 246, 0.1)'),
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        color: '#3b82f6',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.35rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Eye size={13} /> Ver
                    </button>
                    {pago.numero_comprobante && pago.estado !== 'verificado' && (
                      <>
                        <button
                          onClick={() => handleVerificarPago(pago)}
                          disabled={procesando}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.35rem',
                            cursor: procesando ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: procesando ? 0.6 : 1,
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          <Check size={13} /> Aprobar
                        </button>
                        <button
                          onClick={() => handleRechazarPago(pago)}
                          disabled={procesando}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: RedColorPalette.primary,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.35rem',
                            cursor: procesando ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: procesando ? 0.6 : 1,
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          <X size={13} /> Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )
      }


      {/* Modal de detalle MEJORADO */}
      {
        showModal && selectedPago && createPortal(
          <div
            className="modal-overlay"
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: isMobile ? '1rem' : '2rem',
              backdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.65)',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollBehavior: 'smooth'
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: 'var(--admin-card-bg, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%))',
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: '0.75rem',
                width: isMobile ? '92vw' : '820px',
                maxWidth: isMobile ? '92vw' : '820px',
                maxHeight: '80vh',
                padding: isMobile ? '0.75rem' : '1rem 1.25rem',
                margin: 'auto',
                color: 'var(--admin-text-primary, #fff)',
                boxShadow: '0 20px 60px -16px rgba(0, 0, 0, 0.45)',
                overflowY: 'auto',
                overflowX: 'hidden',
                animation: 'scaleIn 0.3s ease-out'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  marginBottom: '0.75rem',
                  borderBottom: `1px solid ${theme.surfaceBorder}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    background: 'rgba(59,130,246,0.12)',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(59,130,246,0.25)'
                  }}>
                    <FileText size={20} style={{ color: 'var(--admin-text-primary, #fff)' }} />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--admin-text-primary, #fff)'
                    }}>
                      Detalle del Pago
                    </h3>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.8rem',
                      color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                      fontWeight: 500
                    }}>
                      {selectedPago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'} #{selectedPago.numero_cuota} · {selectedPago.curso_nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(148,163,184,0.12)',
                    border: `1px solid ${theme.surfaceBorder}`,
                    borderRadius: '0.5rem',
                    padding: '0.4rem',
                    color: 'var(--admin-text-primary, #fff)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(148,163,184,0.12)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content - Grid compacto de 2 columnas */}
              <div>
                {/* Información Principal - Grid 2 columnas */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                  gap: '0.55rem',
                  marginBottom: '0.75rem'
                }}>
                  {/* Monto */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                    borderRadius: '0.6rem',
                    padding: '0.65rem',
                    border: '1px solid rgba(16, 185, 129, 0.22)',
                    boxShadow: '0 8px 18px rgba(16, 185, 129, 0.08)',
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.18)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarSign size={15} style={{ color: '#10b981' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Monto</span>
                    </div>
                    <div style={{
                      color: '#10b981',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {formatearMonto(selectedPago.monto)}
                    </div>
                  </div>

                  {/* Cuota/Clase */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                    borderRadius: '0.6rem',
                    padding: '0.65rem',
                    border: '1px solid rgba(59, 130, 246, 0.22)',
                    boxShadow: '0 8px 18px rgba(59, 130, 246, 0.08)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: 'rgba(59, 130, 246, 0.18)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Calendar size={15} style={{ color: '#3b82f6' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>{selectedPago.modalidad_pago === 'clases' ? 'Clase' : 'Cuota'}</span>
                    </div>
                    <div style={{
                      color: '#3b82f6',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      #{selectedPago.numero_cuota}
                    </div>
                  </div>

                  {/* Estado */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                    borderRadius: '0.6rem',
                    padding: '0.65rem',
                    border: `1px solid ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.22)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.22)' : 'rgba(239, 68, 68, 0.22)'}`,
                    boxShadow: `0 8px 18px ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.08)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(239, 68, 68, 0.08)'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.18)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BarChart3 size={15} style={{ color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' : selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Estado</span>
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.32rem 0.65rem',
                      borderRadius: '0.4rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.2)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? '#10b981' : selectedPago.estado === 'pendiente' ? '#fbbf24' : '#ef4444',
                      border: `1px solid ${selectedPago.estado === 'verificado' || selectedPago.estado === 'pagado' ? 'rgba(16, 185, 129, 0.25)' : selectedPago.estado === 'pendiente' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                    }}>
                      {selectedPago.estado}
                    </span>
                  </div>

                  {/* Verificado Por - Solo si está verificado */}
                  {(selectedPago.estado === 'verificado' && selectedPago.verificado_por_nombre) && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '0.6rem',
                      padding: '0.65rem',
                      border: '1px solid rgba(16, 185, 129, 0.22)',
                      boxShadow: '0 8px 18px rgba(16, 185, 129, 0.08)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.3rem'
                      }}>
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.18)',
                          borderRadius: '0.4rem',
                          padding: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                        </div>
                        <span style={{
                          color: 'var(--admin-text-secondary, rgba(255,255,255,0.7))',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>Verificado Por</span>
                      </div>
                      <div style={{
                        color: '#10b981',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {selectedPago.verificado_por_nombre} {selectedPago.verificado_por_apellido}
                      </div>
                      {selectedPago.fecha_verificacion && (
                        <div style={{
                          color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                          fontSize: '0.65rem',
                          marginTop: '0.2rem'
                        }}>
                          {formatearFecha(selectedPago.fecha_verificacion)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Estudiante */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.6rem',
                    padding: '0.6rem',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(148,163,184,0.28)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: 'rgba(139, 92, 246, 0.16)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={15} style={{ color: '#8b5cf6' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Estudiante</span>
                    </div>
                    <div style={{
                      color: 'var(--admin-text-primary, #fff)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '0.2rem'
                    }}>
                      {selectedPago.estudiante_nombre} {selectedPago.estudiante_apellido}
                    </div>
                    <div style={{
                      color: 'var(--admin-text-secondary, rgba(255,255,255,0.5))',
                      fontSize: '0.7rem'
                    }}>
                      ID: {selectedPago.estudiante_cedula}
                    </div>
                  </div>

                  {/* Curso */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '0.6rem',
                    padding: '0.6rem',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(148,163,184,0.28)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.16)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BookOpen size={15} style={{ color: '#ef4444' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Curso</span>
                    </div>
                    <div style={{
                      color: 'var(--admin-text-primary, #fff)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {selectedPago.curso_nombre}
                    </div>
                  </div>

                  {/* Comprobante - Solo si existe */}
                  {selectedPago.numero_comprobante && (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '0.6rem',
                      padding: '0.6rem',
                      border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(148,163,184,0.28)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        marginBottom: '0.3rem'
                      }}>
                        <div style={{
                          background: 'rgba(251, 191, 36, 0.16)',
                          borderRadius: '0.4rem',
                          padding: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={15} style={{ color: '#fbbf24' }} />
                        </div>
                        <span style={{
                          color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>Comprobante</span>
                      </div>
                      <div style={{
                        color: '#fbbf24',
                        fontSize: '0.85rem',
                        fontWeight: 600
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
                    borderRadius: '0.6rem',
                    padding: '0.6rem',
                    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(148,163,184,0.28)',
                    gridColumn: isMobile ? '1' : 'span 2'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      marginBottom: '0.3rem'
                    }}>
                      <div style={{
                        background: 'rgba(180, 83, 9, 0.16)',
                        borderRadius: '0.4rem',
                        padding: '0.4rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <DollarSign size={15} style={{ color: '#b45309' }} />
                      </div>
                      <span style={{
                        color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>Información de Pago en Efectivo</span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.45rem'
                    }}>
                      {(selectedPago as any).recibido_por && (
                        <div>
                          <div style={{
                            color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                            fontSize: '0.65rem',
                            marginBottom: '0.25rem'
                          }}>
                            Recibido por
                          </div>
                          <div style={{
                            color: '#b45309',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                            {(selectedPago as any).recibido_por}
                          </div>
                        </div>
                      )}
                      {selectedPago.numero_comprobante && (
                        <div>
                          <div style={{
                            color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))',
                            fontSize: '0.65rem',
                            marginBottom: '0.25rem'
                          }}>
                            Número de Comprobante
                          </div>
                          <div style={{
                            color: '#fbbf24',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}>
                            {selectedPago.numero_comprobante}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Comprobante de Pago - Imagen */}
                {selectedPago.numero_comprobante && selectedPago.comprobante_pago_url && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '0.65rem',
                    padding: '0.75rem',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    marginTop: '0.9rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.6rem'
                    }}>
                      <Download size={18} style={{ color: '#10b981' }} />
                      <span style={{
                        color: '#10b981',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Comprobante de Pago</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.98) 100%)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                      maxHeight: '80vh',
                      overflow: 'auto',
                      border: '1px solid rgba(16, 185, 129, 0.15)',
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      <img
                        src={selectedPago.comprobante_pago_url}
                        alt="Comprobante de pago"
                        style={{
                          width: '75%',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
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
                  borderTop: `1px solid ${theme.surfaceBorder}`
                }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '8px 1.15rem',
                      background: 'rgba(148,163,184,0.12)',
                      color: 'var(--admin-text-primary, #fff)',
                      border: `1px solid ${theme.surfaceBorder}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(148,163,184,0.2)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(148,163,184,0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              {/* Animaciones CSS */}
              <style>{`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
            </div>
          </div>,
          document.body
        )
      }

      {/* Modal Comprobante */}
      {
        showComprobanteModal && createPortal(
          <div
            className="modal-overlay"
            onClick={() => setShowComprobanteModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: isMobile ? '1rem' : '2rem',
              backdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.65)',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollBehavior: 'smooth'
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: 'var(--admin-card-bg, linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%))',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '0.9rem',
                width: isMobile ? '92vw' : '650px',
                maxWidth: isMobile ? '92vw' : '650px',
                maxHeight: '95vh',
                padding: isMobile ? '0.75rem 0.9rem' : '1.25rem 1.5rem',
                margin: 'auto',
                color: theme.textPrimary,
                boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
                overflowY: 'auto',
                overflowX: 'hidden',
                animation: 'scaleIn 0.3s ease-out',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.85rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(16,185,129,0.35)'
                  }}>
                    <Download size={isMobile ? 18 : 20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: isMobile ? '1rem' : '1.15rem',
                      fontWeight: 700,
                      color: theme.textPrimary
                    }}>
                      Comprobante de Pago
                    </h3>
                    <p style={{
                      margin: '0.2rem 0 0 0',
                      color: theme.textSecondary,
                      fontSize: '0.85rem'
                    }}>
                      Verifica y descarga el archivo enviado por el estudiante
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComprobanteModal(false)}
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.45rem',
                    color: theme.textPrimary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.12)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {comprobanteNumero && (
                  <div style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.28)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    color: theme.textPrimary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'
                  }}>
                    <span>Número del comprobante</span>
                    <span style={{ color: '#059669' }}>{comprobanteNumero}</span>
                  </div>
                )}

                <div style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(249,250,251,1) 100%)',
                  borderRadius: '0.85rem',
                  padding: '0.5rem',
                  overflow: 'auto',
                  maxHeight: '80vh',
                  border: '2px solid rgba(16, 185, 129, 0.12)',
                  boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.03)'
                }}>
                  <img
                    src={comprobanteUrl}
                    alt="Comprobante de pago"
                    style={{
                      maxWidth: '50%',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '0.5rem',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.05)'
                    }}
                    onLoad={() => {
                      console.log('Imagen del comprobante cargada correctamente');
                    }}
                    onError={(e) => {
                      console.error('Error al cargar imagen del comprobante:', comprobanteUrl);
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentNode as HTMLElement;
                      if (parent && !parent.querySelector('.error-message')) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-message';
                        errorDiv.innerHTML = `
                      <div style="text-align: center; color: var(--admin-text-secondary, rgba(255,255,255,0.7)); padding: 2rem;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                        <p style="font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 600; color: var(--admin-text-primary, #fff);">No se pudo cargar la imagen del comprobante</p>
                        <p style="font-size: 0.9rem; color: var(--admin-text-secondary, rgba(255,255,255,0.5)); margin-bottom: 1.5rem;">El archivo puede estar dañado o no ser una imagen válida</p>
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
                  marginTop: '0.85rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid rgba(148,163,184,0.2)',
                  flexWrap: 'wrap'
                }}>
                  <a
                    href={comprobanteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '9px 1.25rem',
                      borderRadius: '0.65rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      boxShadow: '0 16px 30px rgba(16,185,129,0.3)'
                    }}
                  >
                    <Download size={16} color="#fff" />
                    Descargar
                  </a>
                  <button
                    onClick={() => setShowComprobanteModal(false)}
                    style={{
                      background: 'rgba(156,163,175,0.15)',
                      border: '1px solid rgba(156,163,175,0.3)',
                      color: theme.textSecondary,
                      padding: '9px 1.25rem',
                      borderRadius: '0.65rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
              {/* Animaciones CSS */}
              <style>{`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
            `}</style>
            </div>
          </div>,
          document.body
        )
      }

      {/* Paginación */}
      {
        estudiantesFiltrados.length > 0 && (
          <div className="pagination-container" style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '0.75rem' : '0',
            padding: isMobile ? '8px' : '0.25rem 1rem',
            background: theme.surface,
            border: `1px solid ${theme.surfaceBorder}`,
            borderRadius: '0.75rem',
            marginBottom: isMobile ? '0.75rem' : '0.5rem',
          }}>
            <div style={{
              color: theme.textSecondary,
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Página {currentPage} de {totalPages} • Total: {estudiantesFiltrados.length} estudiantes
            </div>
            <div style={{
              display: 'flex',
              gap: '0.375rem',
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
                  gap: isMobile ? '4px' : '0.25rem',
                  padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                  background: currentPage === 1 ? theme.neutralBg : theme.surface,
                  border: `1px solid ${theme.surfaceBorder}`,
                  borderRadius: '0.625rem',
                  color: currentPage === 1 ? theme.textMuted : theme.textPrimary,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? '1' : 'initial',
                  boxShadow: 'none'
                }}
              >
                <ChevronLeft size={isMobile ? 14 : 14} />
                {!isMobile && 'Anterior'}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: isMobile ? '6px 0.5rem' : '4px 0.75rem',
                    background: currentPage === pageNum ? theme.buttonPrimaryBg : theme.surface,
                    border: currentPage === pageNum ? `1px solid ${RedColorPalette.primary}` : `1px solid ${theme.surfaceBorder}`,
                    borderRadius: '0.5rem',
                    color: currentPage === pageNum ? theme.buttonPrimaryText : theme.textPrimary,
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: isMobile ? '30px' : '2rem',
                    boxShadow: currentPage === pageNum ? (darkMode ? '0 0.4rem 1rem rgba(239,68,68,0.35)' : '0 0.35rem 0.9rem rgba(239,68,68,0.25)') : 'none'
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
                  gap: isMobile ? '4px' : '0.25rem',
                  padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                  background: currentPage === totalPages ? theme.neutralBg : theme.surface,
                  border: `1px solid ${theme.surfaceBorder}`,
                  borderRadius: '0.625rem',
                  color: currentPage === totalPages ? theme.textMuted : theme.textPrimary,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? '1' : 'initial',
                  boxShadow: 'none'
                }}
              >
                {!isMobile && 'Siguiente'}
                <ChevronRight size={isMobile ? 14 : 14} />
              </button>
            </div>
          </div>
        )
      }

      {/* Modal de Verificación Inteligente */}
      {
        showVerificacionModal && pagoAVerificar && (
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
                    color: theme.textPrimary
                  }}>
                    Verificar Pago
                  </h3>
                </div>
                <button
                  onClick={() => setShowVerificacionModal(false)}
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.16)'}`,
                    borderRadius: '8px',
                    padding: '6px',
                    color: theme.textPrimary,
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
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.08)';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(239,68,68,0.16)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: 0 }}>
                  {pagoAVerificar.estudiante_nombre} {pagoAVerificar.estudiante_apellido}
                </p>
              </div>

              {/* Información del pago */}
              <div style={{
                background: theme.positiveBg,
                border: `1px solid ${theme.positiveBorder}`,
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'grid', gap: '0.5rem', color: theme.textSecondary, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Monto total pagado:</span>
                    <strong style={{ fontSize: '0.95rem', color: mapToRedScheme('#10b981') }}>
                      {(() => {
                        const estudianteActual = estudiantes.find(e => e.estudiante_cedula === pagoAVerificar.estudiante_cedula);
                        const cursoActual = estudianteActual?.cursos.find(c => c.id_curso === pagoAVerificar.id_curso);
                        const cuotasPagadas = cursoActual?.pagos.filter(p => p.numero_cuota >= pagoAVerificar.numero_cuota && p.estado === 'pagado') || [];
                        const montoTotal = cuotasPagadas.reduce((sum, c) => sum + parseFloat(c.monto.toString()), 0);
                        return formatearMonto(montoTotal);
                      })()}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Comprobante:</span>
                    <strong>{pagoAVerificar.numero_comprobante || 'N/A'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Primera cuota:</span>
                    <strong>#{pagoAVerificar.numero_cuota}</strong>
                  </div>
                </div>
              </div>

              {/* Selección de cuotas */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  ¿Cuántas cuotas desea verificar con este pago?
                </label>
                <div style={{
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.04)',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)'}`,
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
                        <div style={{ textAlign: 'center', padding: '0.75rem', color: theme.textSecondary, fontSize: '0.85rem' }}>
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
                        background: cuotasAVerificar.includes(cuota.id_pago) ? theme.positiveBg : 'transparent',
                        border: cuotasAVerificar.includes(cuota.id_pago) ? `1px solid ${theme.positiveBorder}` : '1px solid transparent',
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
                        <div style={{ flex: 1, color: theme.textPrimary }}>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>
                            {cuota.modalidad_pago === 'clases' ? `Clase ${cuota.numero_cuota}` : `Cuota #${cuota.numero_cuota}`}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme.textSecondary }}>
                            {formatearMonto(cuota.monto)} - {cuota.estado}
                          </div>
                        </div>
                      </label>
                    ));
                  })()}
                </div>
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: theme.positiveBg, borderRadius: '0.375rem' }}>
                  <div style={{ color: mapToRedScheme('#10b981'), fontSize: '0.8rem', fontWeight: '600' }}>
                    Total a verificar: {cuotasAVerificar.length} cuota(s)
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(148,163,184,0.25)'}` }}>
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
                    background: theme.neutralBg,
                    border: `1px solid ${theme.neutralBorder}`,
                    borderRadius: '0.5rem',
                    color: theme.textSecondary,
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
        )
      }

      {/* Modal de Rechazo Elegante */}
      {
        showRechazoModal && pagoARechazar && createPortal(
          <div
            className="modal-overlay"
            onClick={() => setShowRechazoModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: isMobile ? '1rem' : '2rem',
              backdropFilter: 'blur(8px)',
              background: 'rgba(0, 0, 0, 0.65)',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollBehavior: 'smooth'
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: 'var(--admin-card-bg, linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%))',
                border: `1px solid ${theme.dangerBorder}`,
                borderRadius: '0.85rem',
                width: isMobile ? '92vw' : '33rem',
                maxWidth: isMobile ? '92vw' : '33rem',
                padding: isMobile ? '0.75rem 0.875rem' : '1.25rem 1.5rem',
                boxShadow: '0 24px 60px rgba(15,23,42,0.25)',
                color: theme.textPrimary
              }}
            >
              {/* Header del modal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: `1px solid ${theme.dangerBorder}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    borderRadius: '0.85rem',
                    background: `linear-gradient(135deg, ${mapToRedScheme('#ef4444')} 0%, ${mapToRedScheme('#dc2626')} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 12px 30px rgba(239,68,68,0.35)'
                  }}>
                    <AlertCircle size={isMobile ? 18 : 20} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: isMobile ? '1rem' : '1.15rem',
                      fontWeight: 700,
                      color: theme.textPrimary
                    }}>
                      Rechazar Pago
                    </h3>
                    <p style={{
                      margin: '0.15rem 0 0 0',
                      color: theme.textSecondary,
                      fontSize: '0.8rem'
                    }}>
                      {pagoARechazar.modalidad_pago === 'clases' ? `Clase ${pagoARechazar.numero_cuota}` : `Cuota #${pagoARechazar.numero_cuota}`} · {pagoARechazar.estudiante_nombre} {pagoARechazar.estudiante_apellido}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRechazoModal(false)}
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: `1px solid ${theme.dangerBorder}`,
                    borderRadius: '0.5rem',
                    padding: '0.45rem',
                    color: theme.textPrimary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Información del pago */}
              <div style={{
                background: theme.dangerBg,
                border: `1px solid ${theme.dangerBorder}`,
                borderRadius: '0.75rem',
                padding: '0.85rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  color: theme.textSecondary,
                  fontSize: '0.78rem',
                  marginBottom: '0.45rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <AlertCircle size={14} style={{ color: mapToRedScheme('#ef4444') }} />
                  Al rechazar este pago:
                </div>
                <ul style={{
                  color: theme.textPrimary,
                  fontSize: '0.78rem',
                  margin: 0,
                  paddingLeft: '1.15rem',
                  lineHeight: 1.5
                }}>
                  <li>El estado volverá a "Pendiente"</li>
                  <li>El estudiante deberá subir un nuevo comprobante</li>
                  <li>Se notificará el motivo del rechazo</li>
                </ul>
              </div>

              {/* Campo de motivo */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.35rem'
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
                    padding: '0.65rem 0.75rem',
                    background: pick('rgba(248,250,252,0.95)', 'rgba(255,255,255,0.08)'),
                    border: `1px solid ${pick('rgba(148,163,184,0.35)', 'rgba(255,255,255,0.18)')}`,
                    borderRadius: '0.65rem',
                    color: theme.textPrimary,
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    boxShadow: pick('0 8px 18px rgba(15,23,42,0.08)', 'none')
                  }}
                />
                <div style={{
                  fontSize: '0.72rem',
                  color: theme.textMuted,
                  marginTop: '0.35rem'
                }}>
                  Este mensaje será visible para el estudiante
                </div>
              </div>

              {/* Botones */}
              <div style={{
                display: 'flex',
                gap: '0.65rem',
                paddingTop: '0.85rem',
                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(148,163,184,0.25)'}`
              }}>
                <button
                  onClick={() => {
                    setShowRechazoModal(false);
                    setPagoARechazar(null);
                    setMotivoRechazo('');
                  }}
                  disabled={procesando}
                  style={{
                    flex: 1,
                    padding: '10px 1rem',
                    background: theme.neutralBg,
                    border: `1px solid ${theme.neutralBorder}`,
                    borderRadius: '0.65rem',
                    color: theme.textSecondary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: procesando ? 'not-allowed' : 'pointer',
                    opacity: procesando ? 0.6 : 1,
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
                    padding: '10px 1rem',
                    background: procesando || !motivoRechazo.trim()
                      ? 'rgba(239, 68, 68, 0.35)'
                      : `linear-gradient(135deg, ${mapToRedScheme('#ef4444')} 0%, ${mapToRedScheme('#b91c1c')} 100%)`,
                    border: 'none',
                    borderRadius: '0.65rem',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: procesando || !motivoRechazo.trim() ? 'not-allowed' : 'pointer',
                    opacity: procesando || !motivoRechazo.trim() ? 0.6 : 1,
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
          </div>,
          document.body
        )
      }

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
    </div >
  );
};

export default GestionPagosEstudiante;



