
import { useState, useEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Download,
  Eye,
  Check,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Search,
  RefreshCcw,
  Sheet,
  List,
  Grid,
  ChevronLeft,
  ChevronRight,
  X,
  IdCard,
  Lock,
  CheckCircle2,
  GraduationCap,
  ArrowLeftRight
} from 'lucide-react';
import { showToast } from '../../config/toastConfig';
import { StyledSelect } from '../../components/StyledSelect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
import LoadingModal from '../../components/LoadingModal';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import GlassEffect from '../../components/GlassEffect';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';
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
  numero_comprobante?: string;
  banco_comprobante?: string;
  fecha_transferencia?: string;
  id_estudiante_existente?: number | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'observaciones';
  fecha_solicitud: string;
  comprobante_pago_url?: string;
  documento_identificacion_url?: string;
  documento_estatus_legal_url?: string;
  certificado_cosmetologia_url?: string;
  contacto_emergencia?: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionMatricula = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();

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

  const pick = <T,>(light: T, dark: T): T => (darkMode ? dark : light);

  const theme = {
    pageBackground: pick(
      '#f8fafc',
      'linear-gradient(135deg, rgba(10,10,18,0.95) 0%, rgba(17,17,27,0.95) 100%)'
    ),
    contentBackground: pick(
      '#ffffff',
      'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))'
    ),
    surface: pick('#ffffff', 'rgba(12,12,24,0.94)'),
    surfaceBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    accentBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    textPrimary: pick('#0f172a', 'rgba(255,255,255,0.95)'),
    textSecondary: pick('#475569', 'rgba(226,232,240,0.74)'),
    textMuted: pick('#64748b', 'rgba(148,163,184,0.6)'),
    chipMutedBg: pick('#f1f5f9', 'rgba(255,255,255,0.08)'),
    chipMutedBorder: pick('#e2e8f0', 'rgba(148,163,184,0.28)'),
    chipMutedText: pick('#475569', 'rgba(226,232,240,0.75)'),
    divider: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    inputBg: pick('#ffffff', 'rgba(255,255,255,0.08)'),
    inputBorder: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    inputText: pick('#0f172a', '#f8fafc'),
    inputIcon: pick('#94a3b8', 'rgba(255,255,255,0.55)'),
    controlShadow: pick('0 1px 2px 0 rgba(0, 0, 0, 0.05)', '0 0.25rem 0.75rem rgba(0, 0, 0, 0.3)'),
    paginationBackground: pick(
      '#ffffff',
      'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.92) 100%)'
    ),
    paginationBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    paginationText: pick('#0f172a', 'rgba(226,232,240,0.74)'),
    paginationInactiveBg: pick('#f1f5f9', 'rgba(255,255,255,0.08)'),
    paginationInactiveText: pick('#64748b', 'rgba(255,255,255,0.45)')
  };

  const tableContainerBg = pick(
    '#ffffff',
    'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
  );
  const tableBorder = pick('#e2e8f0', 'rgba(255,255,255,0.08)');
  const tableHeaderBg = pick('#f8fafc', 'rgba(255,255,255,0.02)');
  const tableHeaderBorder = pick('#e2e8f0', 'rgba(255,255,255,0.08)');
  const tableHeaderText = pick('#0f172a', '#ffffff');
  const tableRowDivider = pick('#e2e8f0', 'rgba(255,255,255,0.05)');
  const tableRowHover = pick('#f8fafc', 'rgba(255,255,255,0.04)');

  const estadoTokens: Record<Solicitud['estado'], { bg: string; border: string; text: string }> = {
    pendiente: {
      bg: pick('rgba(148,163,184,0.16)', 'rgba(148,163,184,0.18)'),
      border: pick('rgba(148,163,184,0.28)', 'rgba(148,163,184,0.32)'),
      text: pick('#0f172a', '#cbd5f5')
    },
    aprobado: {
      bg: pick('rgba(16,185,129,0.16)', 'rgba(16,185,129,0.18)'),
      border: pick('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.35)'),
      text: pick('#0f766e', '#34d399')
    },
    rechazado: {
      bg: pick('rgba(239,68,68,0.14)', 'rgba(239,68,68,0.18)'),
      border: pick('rgba(239,68,68,0.32)', 'rgba(239,68,68,0.38)'),
      text: pick('#b91c1c', RedColorPalette.primary)
    },
    observaciones: {
      bg: pick('rgba(251,146,60,0.16)', 'rgba(249,115,22,0.2)'),
      border: pick('rgba(251,146,60,0.32)', 'rgba(249,115,22,0.38)'),
      text: pick('#b45309', '#fb923c')
    }
  };



  const emptyStateTokens = {
    background: pick(
      '#ffffff',
      'linear-gradient(135deg, rgba(17,24,39,0.88), rgba(15,23,42,0.92))'
    ),
    border: pick('#e2e8f0', 'rgba(148,163,184,0.25)'),
    iconBg: pick('#f1f5f9', 'rgba(255,255,255,0.08)'),
    iconColor: pick('#64748b', '#fca5a5'),
    shadow: pick('none', '0 0.25rem 0.75rem rgba(0, 0, 0, 0.3)'),
    cardBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    borderRadius: '0.375rem',
    padding: '0.5rem'
  } as const;

  // View Mode Token
  const toggleGroupBg = pick('rgba(148,163,184,0.12)', 'rgba(255,255,255,0.08)');
  const toggleActiveBg = pick('#ffffff', 'rgba(255,255,255,0.14)');
  const toggleActiveText = pick(RedColorPalette.primary, RedColorPalette.primaryLight);
  const toggleInactiveText = pick('rgba(100,116,139,0.7)', 'rgba(255,255,255,0.6)');

  const actionColors = {
    view: RedColorPalette.primary,
    approve: '#10b981',
    reject: '#ef4444'
  } as const;



  const getEstadoTokens = (estado: Solicitud['estado']) => estadoTokens[estado] ?? estadoTokens.pendiente;

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table'); // Default to table for practicality
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
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
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionData, setRejectionData] = useState<Solicitud | null>(null);
  const [rejectionObservations, setRejectionObservations] = useState('');
  const [cursos, setCursos] = useState<Array<{ id_curso: number; nombre: string; estado: string }>>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useSocket({
    'nueva_solicitud_matricula': (data: any) => {
      showToast.success(`Nueva solicitud: ${data.nombre_solicitante} ${data.apellido_solicitante}`, darkMode);
      void fetchSolicitudes();
    },
    'solicitud_actualizada': () => {
      void fetchSolicitudes();
    }
  });

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
    } catch { }
  };


  const fetchSolicitudes = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setShowLoadingModal(true);
      setError(null);
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

      const totalHeader = res.headers.get('X-Total-Count');
      if (totalHeader) {
        setTotalRecords(parseInt(totalHeader, 10));
      }

      const data = await res.json();
      setSolicitudes(data);
      return true;
    } catch (e: any) {
      const message = e.message || 'Error cargando solicitudes';
      setError(message);
      showToast.error(message, darkMode);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSolicitudes();
    void fetchCursos();
  }, [filterEstado, filterTipo, page, limit]);


  const fetchTipos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tipos-cursos?estado=activo&limit=200`);
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setTipos(list.map((t: any) => ({ id_tipo_curso: t.id_tipo_curso, nombre: t.nombre, codigo: t.codigo })));
    } catch { }
  };

  useEffect(() => { fetchTipos(); }, []);

  const openModal = async (id: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/solicitudes/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener la solicitud');
      const data = await res.json();

      // Si es estudiante existente, cargar datos del perfil para completar información faltante
      if (data.id_estudiante_existente) {
        try {
          const token = sessionStorage.getItem('auth_token');
          // Intentamos obtener los datos del estudiante usando el endpoint específico
          const userRes = await fetch(`${API_BASE}/api/estudiantes/${data.id_estudiante_existente}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (userRes.ok) {
            const userData = await userRes.json();
            // Rellenar datos si faltan en la solicitud
            if (!data.fecha_nacimiento_solicitante) data.fecha_nacimiento_solicitante = userData.fecha_nacimiento;
            // Mapear campos que pueden tener nombres diferentes o ser directos
            if (!data.direccion_solicitante) data.direccion_solicitante = userData.direccion;
            if (!data.genero_solicitante) data.genero_solicitante = userData.genero;
            if (!data.telefono_solicitante) data.telefono_solicitante = userData.telefono;

            // Campos adicionales no presentes en la solicitud estandar
            data.contacto_emergencia = userData.contacto_emergencia;
          }
        } catch (err) {
          console.error("Error cargando datos extra del estudiante", err);
        }
      }

      setSelected(data);
      setShowModal(true);
    } catch (e: any) {
      setError(e.message || 'Error abriendo solicitud');
    } finally {
      setLoading(false);
    }
  };

  const openComprobanteModal = (url: string, numeroComprobante?: string) => {
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
  const openApprovalModal = async (solicitud: Solicitud) => {
    console.log('Solicitud completa:', solicitud);
    console.log('Fecha de nacimiento:', solicitud.fecha_nacimiento_solicitante);

    // Si es estudiante existente, cargar datos del perfil para completar información faltante
    if (solicitud.id_estudiante_existente) {
      try {
        const token = sessionStorage.getItem('auth_token');
        const userRes = await fetch(`${API_BASE}/api/estudiantes/${solicitud.id_estudiante_existente}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          // Rellenar datos si faltan en la solicitud
          if (!solicitud.fecha_nacimiento_solicitante) solicitud.fecha_nacimiento_solicitante = userData.fecha_nacimiento;
          if (!solicitud.direccion_solicitante) solicitud.direccion_solicitante = userData.direccion;
          if (!solicitud.genero_solicitante) solicitud.genero_solicitante = userData.genero;
          if (!solicitud.telefono_solicitante) solicitud.telefono_solicitante = userData.telefono;
          solicitud.contacto_emergencia = userData.contacto_emergencia;
        }
      } catch (err) {
        console.error("Error cargando datos extra del estudiante", err);
      }
    }

    setApprovalData(solicitud);

    // Generar username automáticamente
    const username = generateUsername(solicitud.nombre_solicitante, solicitud.apellido_solicitante);
    setGeneratedUsername(username);

    setShowApprovalModal(true);
  };

  const openRejectionModal = (sol: Solicitud) => {
    const template = `Estimado ${sol.nombre_solicitante} ${sol.apellido_solicitante}, con identificación ${sol.identificacion_solicitante || ''}, se rechazó su solicitud de matrícula por inconsistencias de información o pago. Si cree que es un error, por favor acérquese a la escuela Jessica Vélez.`;
    setRejectionData(sol);
    setRejectionObservations(template);
    setShowRejectionModal(true);
  };

  // Función para crear estudiante desde solicitud aprobada
  const handleCreateStudent = async () => {
    if (!approvalData) return;

    try {
      setDecidiendo(true);

      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      // Obtener el ID del usuario logueado
      let aprobadoPor = 1; // Fallback
      try {
        const userRaw = sessionStorage.getItem('auth_user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (user?.id_usuario) {
            aprobadoPor = user.id_usuario;
          }
        }
      } catch (e) {
        console.error('Error obteniendo usuario logueado:', e);
      }

      const response = await fetch(`${API_BASE}/api/estudiantes/crear-desde-solicitud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_solicitud: approvalData.id_solicitud,
          aprobado_por: aprobadoPor
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
        // Usar los datos de approvalData ya que son los de la solicitud original
        showToast.success(
          `Matrícula aprobada para ${approvalData.nombre_solicitante} ${approvalData.apellido_solicitante}`,
          darkMode
        );
      } else {
        // CASO: Estudiante nuevo - Se creó usuario + matrícula
        const estudiante = data?.estudiante ?? {};
        const nombreCompleto = `${estudiante.nombre ?? ''} ${estudiante.apellido ?? ''}`.trim();
        showToast.success(
          `Estudiante creado: ${nombreCompleto || 'Nuevo estudiante'} | Usuario: ${estudiante.username ?? 'N/D'} | Contraseña temporal: ${estudiante.password_temporal ?? 'N/D'}`,
          darkMode
        );
      }

      // Cerrar modal y refrescar datos
      setShowApprovalModal(false);
      setApprovalData(null);
      setGeneratedUsername('');

      // Refrescar lista de solicitudes
      await fetchSolicitudes();

    } catch (error: any) {
      console.error('Error creando estudiante:', error);
      const message = error?.message ? `Error creando estudiante: ${error.message}` : 'Error creando estudiante';
      showToast.error(message, darkMode);
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

      // Obtener el ID del usuario logueado
      let verificadoPor = null;
      try {
        const userRaw = sessionStorage.getItem('auth_user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          verificadoPor = user?.id_usuario || null;
        }
      } catch (e) {
        console.error('Error obteniendo usuario logueado:', e);
      }

      const res = await fetch(`${API_BASE}/api/solicitudes/${targetId}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, observaciones: observaciones || null, verificado_por: verificadoPor })
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

      // Notificación según el estado
      if (estado === 'aprobado') {
        showToast.success('Solicitud aprobada correctamente', darkMode);
      } else if (estado === 'rechazado') {
        showToast.error('Solicitud rechazada', darkMode);
      } else {
        showToast.info('Observaciones agregadas a la solicitud', darkMode);
      }
    } catch (e: any) {
      setError(e.message || 'Error actualizando estado');
      showToast.error(e.message || 'Error actualizando estado', darkMode);
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
    });

  const totalPages = Math.ceil(totalRecords / limit);
  // Los datos ya vienen paginados del backend, no necesitamos slicing extra
  const paginatedSolicitudes = solicitudesFiltradas;

  // Los contadores ahora vienen del backend (counters)

  // Resetear página cuando cambian filtros principales
  useEffect(() => {
    setPage(1);
  }, [filterEstado, filterTipo]);

  const pageStyle = {
    background: theme.pageBackground,
    color: theme.textPrimary,
    minHeight: '100%',
    transition: 'background 0.3s ease, color 0.3s ease',
    '--admin-card-bg': theme.contentBackground,
    '--admin-bg-secondary': theme.contentBackground,
    '--admin-border': theme.surfaceBorder,
    '--admin-text-primary': theme.textPrimary,
    '--admin-text-secondary': theme.textSecondary,
    '--admin-text-muted': theme.textMuted,
    '--admin-divider': theme.divider,
    '--admin-chip-muted-bg': theme.chipMutedBg,
    '--admin-chip-muted-border': theme.chipMutedBorder,
    '--admin-chip-muted-text': theme.chipMutedText,
    '--admin-input-bg': theme.inputBg,
    '--admin-input-border': theme.inputBorder,
    '--admin-input-text': theme.inputText,
    '--admin-input-icon': theme.inputIcon
  } as CSSProperties;

  return (
    <div style={pageStyle}>
      <AdminSectionHeader
        title="Gestión de Matrículas"
        subtitle="Administra las matrículas y credenciales de acceso de los estudiantes"
        marginBottom="0.5rem"
        rightSlot={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${API_BASE}/api/solicitudes/reporte/excel`);
                  if (!response.ok) throw new Error('Error descargando reporte');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Reporte_Matriculas_${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  showToast.success('Reporte descargado correctamente', darkMode);
                } catch (error) {
                  console.error('Error al descargar el reporte:', error);
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Sheet size={14} color="#fff" />
              Descargar Excel
            </button>
            <button
              onClick={async () => {
                if (loading) return;
                const refreshed = await fetchSolicitudes();
                if (refreshed) {
                  showToast.info('Solicitudes actualizadas', darkMode);
                }
              }}
              disabled={loading}
              aria-label="Refrescar lista"
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
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`
        }}
      >
        <div className="responsive-filters">
          <div
            style={{
              position: 'relative',
              flex: 1,
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.inputIcon
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0 0.5rem 0 2rem',
                background: darkMode ? 'rgba(255,255,255,0.06)' : '#ffffff',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                borderRadius: '0.5rem',
                color: theme.inputText,
                fontSize: '0.75rem',
                boxShadow: 'none',
                height: '2rem'
              }}
            />
          </div>
          <div style={{ minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)', width: isSmallScreen ? '100%' : 'auto' }}>
            <StyledSelect
              name="filterEstado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
              darkMode={darkMode}
              options={[
                { value: 'todos', valueOf: undefined as any, label: 'Todos' } as any,
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'aprobado', label: 'Aprobado' },
                { value: 'rechazado', label: 'Rechazado' },
                { value: 'observaciones', label: 'Observaciones' }
              ]}
            />
          </div>
          <div style={{ minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)', width: isSmallScreen ? '100%' : 'auto' }}>
            <StyledSelect
              name="filterTipo"
              value={String(filterTipo)}
              onChange={(e) => setFilterTipo(e.target.value === 'todos' ? 'todos' : Number(e.target.value))}
              darkMode={darkMode}
              options={[
                { value: 'todos', label: 'Todos los tipos' },
                ...tipos.map(t => ({ value: t.id_tipo_curso, label: t.nombre }))
              ]}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '0.375rem',
            background: toggleGroupBg,
            borderRadius: '0.65rem',
            padding: '0.1875rem',
            width: isSmallScreen ? '100%' : 'auto',
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
                padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                background: viewMode === 'grid' ? toggleActiveBg : 'transparent',
                border: 'none',
                borderRadius: '0.5em',
                color: viewMode === 'grid' ? toggleActiveText : toggleInactiveText,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                flex: 1
              }}
              title="Vista de Tarjetas"
            >
              <Grid size={16} color={viewMode === 'grid' ? toggleActiveText : toggleInactiveText} /> {!isMobile && 'Tarjetas'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3em',
                padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                background: viewMode === 'table' ? toggleActiveBg : 'transparent',
                border: 'none',
                borderRadius: '0.5em',
                color: viewMode === 'table' ? toggleActiveText : toggleInactiveText,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'initial'
              }}
              title="Vista de Tabla"
            >
              <List size={16} color={viewMode === 'table' ? toggleActiveText : toggleInactiveText} /> {!isMobile && 'Tabla'}
            </button>
          </div>
        </div>
      </GlassEffect>

      {/* Lista de Solicitudes - Renderizado Condicional */}
      <div style={{ display: 'grid', gap: isMobile ? '8px' : '0.5rem' }}>
        {loading && (<div style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>Cargando...</div>)}
        {error && (<div style={{ color: RedColorPalette.primary, fontSize: '0.8rem' }}>{error}</div>)}

        {
          !loading && solicitudesFiltradas.length === 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: isMobile ? '2.25rem 1.5rem' : '3rem 2.5rem',
                background: emptyStateTokens.background,
                border: `1px dashed ${emptyStateTokens.border}`,
                borderRadius: '1.25rem',
                boxShadow: emptyStateTokens.shadow,
                textAlign: 'center',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease'
              }}
            >
              <div
                style={{
                  width: '3.25rem',
                  height: '3.25rem',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: emptyStateTokens.iconBg
                }}
              >
                <FileText size={26} color={emptyStateTokens.iconColor} />
              </div>
              <div style={{ fontSize: isMobile ? '1rem' : '1.05rem', fontWeight: 700, color: theme.textPrimary }}>
                No hay solicitudes registradas
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  color: theme.textSecondary,
                  maxWidth: '28rem'
                }}
              >
                Cuando se generen nuevas solicitudes las verás aquí en tiempo real. Puedes usar el botón refrescar si estás esperando un registro reciente.
              </p>
            </div>
          )
        }

        {/* Vista Tabla */}
        {
          !loading && solicitudesFiltradas.length > 0 && viewMode === 'table' && (
            <>
              {/* Indicador de scroll en móvil */}
              {isSmallScreen && (
                <div style={{
                  background: pick('rgba(254,226,226,0.9)', 'rgba(255,255,255,0.04)'),
                  border: `1px solid ${pick('rgba(248,113,113,0.35)', 'rgba(255,255,255,0.08)')}`,
                  borderRadius: '0.5rem',
                  padding: '8px 0.75rem',
                  marginBottom: '0.75rem',
                  color: pick('rgba(153,27,27,0.85)', 'rgba(248,250,252,0.85)'),
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
                border: `1px solid ${tableBorder}`,
                background: tableContainerBg,
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
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', position: 'relative', zIndex: 1 }}>
                  <thead style={{
                    borderBottom: `1px solid ${tableHeaderBorder}`,
                    background: tableHeaderBg
                  }}>
                    <tr>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Código</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Solicitante</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Identificación</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Detalles Curso</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Comprobante</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Estado</th>
                      <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: tableHeaderText, fontWeight: '600', textTransform: 'uppercase', fontSize: '0.65rem' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSolicitudes.map((sol) => {
                      const estadoVisual = getEstadoTokens(sol.estado);
                      const formatearFecha = (fechaString: string) => {
                        const fecha = new Date(fechaString);
                        return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                      };
                      return (
                        <tr key={sol.id_solicitud}
                          style={{
                            borderBottom: `1px solid ${tableRowDivider}`,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = tableRowHover}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '0.25rem 0.5rem', color: theme.textMuted, fontWeight: 500, verticalAlign: 'middle', fontSize: '0.7rem' }}>{sol.codigo_solicitud}</td>
                          <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 600, color: theme.textPrimary, fontSize: '0.7rem' }}>{sol.apellido_solicitante}, {sol.nombre_solicitante}</div>
                            <div style={{ fontSize: '0.65rem', color: theme.textSecondary }}>{sol.email_solicitante}</div>
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', color: theme.textPrimary, verticalAlign: 'middle', fontSize: '0.7rem' }}>{sol.identificacion_solicitante}</td>
                          <td style={{ padding: '0.25rem 0.5rem', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 500, color: theme.textPrimary, fontSize: '0.7rem' }}>{(sol as any).tipo_curso_nombre || 'N/A'}</div>
                            <div style={{ fontSize: '0.65rem', color: theme.textSecondary }}>{formatearFecha(sol.fecha_solicitud)}</div>
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            <button
                              onClick={() => openComprobanteModal(sol.comprobante_pago_url || '', sol.numero_comprobante)}
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
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: estadoVisual.bg,
                              border: `1px solid ${estadoVisual.border}`,
                              color: estadoVisual.text
                            }}>
                              {sol.estado}
                            </span>
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', justifyContent: 'center' }}>
                              <button
                                onClick={() => openModal(sol.id_solicitud)}
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
                              {sol.estado === 'pendiente' && (
                                <>
                                  <button
                                    onClick={() => openApprovalModal(sol)}
                                    disabled={decidiendo}
                                    title="Aprobar"
                                    style={{
                                      padding: '0.25rem',
                                      borderRadius: '0.5rem',
                                      border: '1px solid #10b981',
                                      backgroundColor: 'transparent',
                                      color: '#10b981',
                                      cursor: decidiendo ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s',
                                      opacity: decidiendo ? 0.5 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!decidiendo) {
                                        e.currentTarget.style.backgroundColor = '#10b981';
                                        e.currentTarget.style.color = 'white';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.color = '#10b981';
                                    }}
                                  >
                                    <Check style={{ width: '0.85rem', height: '0.85rem' }} />
                                  </button>
                                  <button
                                    onClick={() => openRejectionModal(sol)}
                                    disabled={decidiendo}
                                    title="Rechazar"
                                    style={{
                                      padding: '0.25rem',
                                      borderRadius: '0.5rem',
                                      border: '1px solid #ef4444',
                                      backgroundColor: 'transparent',
                                      color: '#ef4444',
                                      cursor: decidiendo ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s',
                                      opacity: decidiendo ? 0.5 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!decidiendo) {
                                        e.currentTarget.style.backgroundColor = '#ef4444';
                                        e.currentTarget.style.color = 'white';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.color = '#ef4444';
                                    }}
                                  >
                                    <XCircle style={{ width: '0.85rem', height: '0.85rem' }} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )
        }

        {/* Vista Cards - Modo Horizontal Compacto (Matching Ref image & GestionPagosEstudiante) */}
        {
          !loading && solicitudesFiltradas.length > 0 && viewMode === 'grid' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              padding: '0.25rem 0'
            }}>
              {paginatedSolicitudes.map((sol) => {
                const estadoVisual = getEstadoTokens(sol.estado);
                const labelColor = theme.textMuted;
                const valueColor = theme.textPrimary;

                const fieldLabelStyle = {
                  color: labelColor,
                  fontSize: '0.6rem',
                  fontWeight: 500,
                  marginBottom: '0.125rem'
                } as CSSProperties;

                const fieldValueStyle = {
                  color: valueColor,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                } as CSSProperties;

                const formatearFecha = (fechaString: string) => {
                  const fecha = new Date(fechaString);
                  const meses = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                  ];
                  return `${fecha.getDate()}/${meses[fecha.getMonth()]}/${fecha.getFullYear()}`;
                };

                return (
                  <div
                    key={sol.id_solicitud}
                    style={{
                      background: pick(
                        '#ffffff',
                        'linear-gradient(135deg, rgba(8, 8, 12, 0.96) 0%, rgba(18, 18, 26, 0.98) 100%)'
                      ),
                      border: `1px solid ${pick('#e2e8f0', 'rgba(255, 255, 255, 0.08)')}`,
                      borderRadius: '0.875rem',
                      padding: '0.625rem 0.875rem',
                      boxShadow: darkMode
                        ? '0 4px 20px -5px rgba(0, 0, 0, 0.7)'
                        : '0 4px 12px -2px rgba(15, 23, 42, 0.08)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.625rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.borderColor = pick('#94a3b8', 'rgba(239, 68, 68, 0.45)');
                      e.currentTarget.style.boxShadow = darkMode
                        ? '0 12px 25px -8px rgba(0, 0, 0, 0.8)'
                        : '0 8px 20px -4px rgba(15, 23, 42, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = pick('rgba(15,23,42,0.08)', 'rgba(239, 68, 68, 0.22)');
                      e.currentTarget.style.boxShadow = darkMode
                        ? '0 4px 20px -5px rgba(0, 0, 0, 0.7)'
                        : '0 4px 12px -2px rgba(15, 23, 42, 0.08)';
                    }}
                  >
                    {/* Header Row: Código y Estado */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.55rem',
                        padding: '2px 0.5rem',
                        borderRadius: '0.35rem',
                        fontWeight: 600,
                        background: theme.chipMutedBg,
                        border: `1px solid ${theme.chipMutedBorder}`,
                        color: theme.chipMutedText,
                        letterSpacing: '0.01em'
                      }}>
                        {sol.codigo_solicitud}
                      </span>
                      <span style={{
                        padding: '2px 0.5rem',
                        borderRadius: '0.35rem',
                        fontSize: '0.55rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        background: estadoVisual.bg,
                        border: `1px solid ${estadoVisual.border}`,
                        color: estadoVisual.text,
                        letterSpacing: '0.025em'
                      }}>
                        {sol.estado}
                      </span>
                    </div>

                    {/* Nombre del Solicitante */}
                    <div>
                      <h3 style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: theme.textPrimary,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em'
                      }}>
                        {sol.apellido_solicitante}, {sol.nombre_solicitante}
                      </h3>
                    </div>

                    <div style={{ width: '100%', height: '1px', background: pick('rgba(148,163,184,0.18)', 'rgba(255, 255, 255, 0.08)'), opacity: 0.6 }} />

                    {/* Fila de Detalles (4 columnas) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                      gap: '0.625rem'
                    }}>
                      <div>
                        <div style={fieldLabelStyle}>Identificación</div>
                        <div style={fieldValueStyle}>{sol.identificacion_solicitante || '-'}</div>
                      </div>
                      <div>
                        <div style={fieldLabelStyle}>Email</div>
                        <div style={fieldValueStyle} title={sol.email_solicitante}>{sol.email_solicitante}</div>
                      </div>
                      <div>
                        <div style={fieldLabelStyle}>Fecha de Solicitud</div>
                        <div style={fieldValueStyle}>{formatearFecha(sol.fecha_solicitud)}</div>
                      </div>
                      <div>
                        <div style={fieldLabelStyle}>Tipo de Curso</div>
                        <div style={fieldValueStyle}>{(sol as any).tipo_curso_nombre || '-'}</div>
                      </div>
                    </div>

                    {/* Fila de Comprobante (Boxes) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                      gap: '0.625rem',
                      alignItems: 'end'
                    }}>
                      <div>
                        <div style={fieldLabelStyle}>Número Comprobante</div>
                        <div style={{
                          background: 'rgba(148, 163, 184, 0.1)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          color: theme.textSecondary,
                          padding: '3px 6px',
                          borderRadius: '0.25rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textAlign: 'center'
                        }}>
                          {sol.numero_comprobante || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={fieldLabelStyle}>Recibido por</div>
                        <div style={{
                          background: 'rgba(180, 83, 9, 0.05)',
                          border: '1px solid rgba(180, 83, 9, 0.1)',
                          color: '#b45309',
                          padding: '3px 6px',
                          borderRadius: '0.25rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}>
                          {(sol as any).recibido_por || 'SECRETARIA'}
                        </div>
                      </div>
                      <div>
                        <div style={fieldLabelStyle}>Comprobante</div>
                        <button
                          onClick={() => openComprobanteModal(sol.comprobante_pago_url || '', sol.numero_comprobante)}
                          style={{
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.15)',
                            color: '#10b981',
                            padding: '3px 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            cursor: 'pointer',
                            width: '100%',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
                        >
                          <Download size={12} /> Ver Comprobante
                        </button>
                      </div>
                    </div>

                    {/* Botón Ver (Bottom Right) */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.125rem' }}>
                      <button
                        onClick={() => openModal(sol.id_solicitud)}
                        style={{
                          background: pick('rgba(59, 130, 246, 0.06)', 'rgba(255, 255, 255, 0.04)'),
                          border: `1px solid ${pick('rgba(59, 130, 246, 0.2)', 'rgba(255, 255, 255, 0.08)')}`,
                          color: pick('#2563eb', RedColorPalette.primary),
                          padding: '3px 0.875rem',
                          borderRadius: '0.45rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = pick('rgba(59, 130, 246, 0.12)', 'rgba(239, 68, 68, 0.18)');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = pick('rgba(59, 130, 246, 0.06)', 'rgba(239, 68, 68, 0.1)');
                        }}
                      >
                        <Eye size={13} /> Ver
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        }
      </div >

      {/* Paginación */}
      {
        !loading && solicitudesFiltradas.length > 0 && (
          <div
            className="pagination-container"
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '0.75rem' : '0',
              padding: isMobile ? '8px' : '0.25rem 1rem',
              background: pick(
                'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
                'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
              ),
              border: `1px solid ${pick('#e2e8f0', 'rgba(255,255,255,0.08)')}`,
              borderRadius: '0.75rem',
              marginTop: '0.5rem',
              marginBottom: isMobile ? '0.75rem' : '0.5rem'
            }}
          >
            <div style={{
              color: pick('rgba(30,41,59,0.85)', 'rgba(226,232,240,0.8)'),
              fontSize: isMobile ? '0.75rem' : '0.8rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Página {page} de {totalPages} • Total: {totalRecords} solicitudes
            </div>
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isMobile ? '4px' : '0.25rem',
                  padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                  background: page === 1
                    ? pick('rgba(226,232,240,0.6)', 'rgba(255,255,255,0.05)')
                    : pick('rgba(255,255,255,0.95)', 'rgba(255,255,255,0.1)'),
                  border: `1px solid ${pick('rgba(226,232,240,0.75)', 'rgba(255,255,255,0.2)')}`,
                  borderRadius: '0.625rem',
                  color: page === 1
                    ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.3)')
                    : pick('rgba(30,41,59,0.85)', '#f8fafc'),
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
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
                  onClick={() => setPage(pageNum)}
                  style={{
                    padding: isMobile ? '6px 0.5rem' : '4px 0.75rem',
                    background: page === pageNum
                      ? pick(
                        `linear-gradient(135deg, ${RedColorPalette.primaryLight} 0%, ${RedColorPalette.primary} 100%)`,
                        `linear-gradient(135deg, ${RedColorPalette.primary} 0%, ${RedColorPalette.primaryDark} 100%)`
                      )
                      : pick('rgba(226,232,240,0.9)', 'rgba(255,255,255,0.08)'),
                    border: page === pageNum
                      ? `1px solid ${pick('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.4)')}`
                      : `1px solid ${pick('rgba(148,163,184,0.45)', 'rgba(255,255,255,0.15)')}`,
                    borderRadius: '0.5rem',
                    color: page === pageNum ? '#ffffff' : pick('rgba(30,41,59,0.85)', '#f8fafc'),
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: isMobile ? '30px' : '2rem',
                    boxShadow: 'none'
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
                  gap: isMobile ? '4px' : '0.25rem',
                  padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                  background: page === totalPages
                    ? pick('rgba(226,232,240,0.6)', 'rgba(255,255,255,0.05)')
                    : pick('rgba(255,255,255,0.95)', 'rgba(255,255,255,0.1)'),
                  border: `1px solid ${pick('rgba(226,232,240,0.75)', 'rgba(255,255,255,0.2)')}`,
                  borderRadius: '0.625rem',
                  color: page === totalPages
                    ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.3)')
                    : pick('rgba(30,41,59,0.85)', '#f8fafc'),
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
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

      {/* Modal Detalle Solicitud */}

      {
        showModal && selected && createPortal(
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
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '0.75rem',
                width: isMobile ? '92vw' : '700px',
                maxWidth: isMobile ? '92vw' : '700px',
                maxHeight: '85vh',
                padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
                margin: 'auto',
                color: 'var(--admin-text-primary, #fff)',
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
                overflowY: 'auto',
                overflowX: 'hidden',
                animation: 'scaleIn 0.3s ease-out'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? 12 : 14,
                paddingBottom: isMobile ? 8 : 10,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                  <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>Solicitud {selected.codigo_solicitud}</h3>
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 8 : 10
              }}>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Nombre Completo</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)', fontWeight: '600', fontSize: '0.9rem' }}>{selected.apellido_solicitante}, {selected.nombre_solicitante}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Identificación</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{selected.identificacion_solicitante || '-'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Email</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{selected.email_solicitante}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Teléfono</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{selected.telefono_solicitante || '-'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Fecha de Nacimiento</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {(() => {
                      if (!selected.fecha_nacimiento_solicitante) return 'No especificado';
                      try {
                        // Handle both ISO string and simple date string
                        const dateStr = selected.fecha_nacimiento_solicitante.toString().split('T')[0];
                        const parts = dateStr.split('-');
                        if (parts.length === 3) {
                          const year = parts[0];
                          const month = parseInt(parts[1]);
                          const day = parts[2];
                          const meses = [
                            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                          ];
                          return `${day}/${meses[month - 1]}/${year}`;
                        }
                        // Fallback to Date object if format is unexpected
                        const fecha = new Date(selected.fecha_nacimiento_solicitante);
                        return fecha.toLocaleDateString();
                      } catch (e) {
                        return 'Fecha inválida';
                      }
                    })()}
                  </div>
                </div>
                {selected.genero_solicitante && (
                  <div>
                    <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Género</div>
                    <div style={{ color: 'var(--admin-text-primary, #fff)', textTransform: 'capitalize' }}>{selected.genero_solicitante}</div>
                  </div>
                )}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Dirección</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{selected.direccion_solicitante || '-'}</div>
                </div>
                {/* Added emergency contact display */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Contacto de Emergencia</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{selected.contacto_emergencia || '-'}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Fecha de Solicitud</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
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
                    <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Tipo de Curso</div>
                    <div style={{ color: 'var(--admin-text-primary, #fff)' }}>{(selected as any).tipo_curso_nombre}</div>
                  </div>
                )}
                {selected.horario_preferido && (
                  <div>
                    <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Horario Preferido</div>
                    <div style={{
                      color: 'var(--admin-text-primary, #fff)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textTransform: 'capitalize'
                    }}>
                      <Clock size={16} color="#ef4444" />
                      {selected.horario_preferido}
                    </div>
                  </div>
                )}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Monto de Matrícula</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)', fontWeight: '600', fontSize: '1.1rem' }}>${selected.monto_matricula?.toLocaleString?.() || selected.monto_matricula}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Método de Pago</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)', textTransform: 'capitalize' }}>{selected.metodo_pago}</div>
                </div>

                {/* Información del comprobante - para transferencia */}
                {selected.metodo_pago === 'transferencia' && (
                  <>
                    {selected.numero_comprobante && (
                      <div>
                        <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Número de Comprobante</div>
                        <div style={{
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          {selected.numero_comprobante}
                        </div>
                      </div>
                    )}
                    {selected.banco_comprobante && (
                      <div>
                        <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Banco</div>
                        <div style={{ color: 'var(--admin-text-primary, #fff)', textTransform: 'capitalize' }}>{selected.banco_comprobante}</div>
                      </div>
                    )}
                    {selected.fecha_transferencia && (
                      <div>
                        <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Fecha de Transferencia</div>
                        <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                          {(() => {
                            const fecha = new Date(selected.fecha_transferencia);
                            // Ajustar zona horaria para evitar que se reste un día
                            fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());

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
                        <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Número de Comprobante</div>
                        <div style={{
                          color: '#ef4444',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          padding: '4px 0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          {selected.numero_comprobante}
                        </div>
                      </div>
                    )}
                    {(selected as any).recibido_por && (
                      <div>
                        <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Recibido por</div>
                        <div style={{
                          color: '#b45309',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          background: 'rgba(180, 83, 9, 0.1)',
                          padding: '4px 0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid rgba(180, 83, 9, 0.3)'
                        }}>
                          {(selected as any).recibido_por}
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Estado</div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '6px 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    background: selected.estado === 'aprobado' ? 'rgba(16, 185, 129, 0.15)' :
                      selected.estado === 'rechazado' ? 'rgba(239, 68, 68, 0.15)' :
                        selected.estado === 'observaciones' ? 'rgba(239, 68, 68, 0.15)' :
                          'rgba(156, 163, 175, 0.15)',
                    border: selected.estado === 'aprobado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                      selected.estado === 'rechazado' ? '1px solid rgba(239, 68, 68, 0.3)' :
                        selected.estado === 'observaciones' ? '1px solid rgba(239, 68, 68, 0.3)' :
                          '1px solid rgba(156, 163, 175, 0.3)',
                    color: selected.estado === 'aprobado' ? '#10b981' :
                      selected.estado === 'rechazado' ? '#ef4444' :
                        selected.estado === 'observaciones' ? '#ef4444' :
                          '#9ca3af'
                  }}>
                    {selected.estado}
                  </div>
                </div>
              </div>

              {/* Documentos - Botones con íconos claros */}
              <div style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 10
              }}>
                {/* Comprobante */}
                <a
                  href={selected.comprobante_pago_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    background: 'rgba(16, 185, 129, 0.08)',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Download size={18} color="#10b981" />
                  <span style={{
                    color: '#10b981',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    Comprobante
                  </span>
                </a>

                {/* Documentos */}
                {selected && (() => {
                  const esEcuatoriano = selected.identificacion_solicitante && /^\d{10}$/.test(selected.identificacion_solicitante);

                  if (esEcuatoriano) {
                    return (
                      <a
                        href={selected.documento_identificacion_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          background: 'rgba(59, 130, 246, 0.08)',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <IdCard size={18} color="#3b82f6" />
                        <span style={{
                          color: '#3b82f6',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}>
                          Identificación
                        </span>
                      </a>
                    );
                  } else {
                    return (
                      <>
                        <a
                          href={selected.documento_identificacion_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            background: 'rgba(59, 130, 246, 0.08)',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <IdCard size={18} color="#3b82f6" />
                          <span style={{
                            color: '#3b82f6',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textAlign: 'center'
                          }}>
                            Pasaporte
                          </span>
                        </a>
                        <a
                          href={selected.documento_estatus_legal_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '10px 12px',
                            borderRadius: 8,
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            background: 'rgba(168, 85, 247, 0.08)',
                            textDecoration: 'none',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(168, 85, 247, 0.08)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <FileText size={18} color="#a855f7" />
                          <span style={{
                            color: '#a855f7',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textAlign: 'center'
                          }}>
                            Estatus Legal
                          </span>
                        </a>
                      </>
                    );
                  }
                })()}
                {selected && selected.certificado_cosmetologia_url && (
                  <a
                    href={selected.certificado_cosmetologia_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(236, 72, 153, 0.3)',
                      background: 'rgba(236, 72, 153, 0.08)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <FileText size={18} color="#ec4899" />
                    <span style={{
                      color: '#ec4899',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      Certificado
                    </span>
                  </a>
                )
                }
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
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <Lock size={20} />
                          <h4 style={{ color: '#ef4444', margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            Curso Bloqueado
                          </h4>
                        </div>
                        <p style={{ color: 'var(--admin-text-primary, rgba(255,255,255,0.8))', margin: 0, fontSize: '0.9rem' }}>
                          Este curso está temporalmente bloqueado. Las matrículas están suspendidas hasta que se reactive el curso.
                          Solo se pueden rechazar solicitudes pendientes.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                        <button onClick={() => openRejectionModal(selected)} disabled={decidiendo} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 1rem', borderRadius: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'inline-block'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span>
                            {selected.estado === 'aprobado' ? <CheckCircle2 size={28} color="#10b981" /> : selected.estado === 'rechazado' ? <XCircle size={28} color="#ef4444" /> : <AlertCircle size={28} color="#ef4444" />}
                          </span>
                          <div style={{ textAlign: 'left' }}>
                            <h4 style={{
                              color: selected.estado === 'aprobado' ? '#10b981' : '#ef4444',
                              margin: '0 0 0.25rem 0',
                              fontSize: '1rem',
                              fontWeight: '600',
                              textTransform: 'capitalize'
                            }}>
                              Solicitud {selected.estado}
                            </h4>
                            <p style={{ color: 'var(--admin-text-primary, rgba(255,255,255,0.7))', margin: 0, fontSize: '0.85rem' }}>
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
                  <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column-reverse' : 'row',
                    gap: 12,
                    justifyContent: 'flex-end',
                    marginTop: isMobile ? 20 : 24
                  }}>
                    <button
                      onClick={() => openRejectionModal(selected)}
                      disabled={decidiendo}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        padding: '12px 1.25rem',
                        borderRadius: 12,
                        cursor: decidiendo ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: decidiendo ? 0.6 : 1,
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        width: isMobile ? '100%' : 'auto'
                      }}
                    >
                      <XCircle size={16} /> Rechazar
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false); // Cerrar modal de detalle
                        openApprovalModal(selected); // Abrir modal de aprobación
                      }}
                      disabled={decidiendo}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        padding: '12px 1.25rem',
                        borderRadius: 12,
                        cursor: decidiendo ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: decidiendo ? 0.6 : 1,
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        width: isMobile ? '100%' : 'auto'
                      }}
                    >
                      <Check size={16} /> Aprobar
                    </button>
                  </div>
                );
              })()}
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
                background: 'var(--admin-card-bg, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                width: isMobile ? '92vw' : '600px',
                maxWidth: isMobile ? '92vw' : '600px',
                maxHeight: '85vh',
                padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
                margin: 'auto',
                color: 'var(--admin-text-primary, #fff)',
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
                overflowY: 'auto',
                overflowX: 'hidden',
                animation: 'scaleIn 0.3s ease-out',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? 12 : 14,
                paddingBottom: isMobile ? 8 : 10,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Download size={isMobile ? 18 : 20} style={{ color: '#10b981' }} />
                    <h3 style={{ margin: 0, color: '#10b981', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                      Comprobante de Pago
                    </h3>
                  </div>
                  {comprobanteNumero && (
                    <p style={{
                      margin: '6px 0 0 1.75rem',
                      color: '#ef4444',
                      fontSize: '0.85rem',
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

      {/* Modal de Aprobación */}
      {
        showApprovalModal && approvalData && createPortal(
          <div
            className="modal-overlay"
            onClick={() => setShowApprovalModal(false)}
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
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                width: isMobile ? '92vw' : '700px',
                maxWidth: isMobile ? '92vw' : '700px',
                maxHeight: '85vh',
                padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
                margin: 'auto',
                color: 'var(--admin-text-primary, #fff)',
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
                overflowY: 'auto',
                overflowX: 'hidden',
                animation: 'scaleIn 0.3s ease-out'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isMobile ? 12 : 14,
                paddingBottom: isMobile ? 8 : 10,
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={isMobile ? 18 : 20} style={{ color: '#10b981' }} />
                  <h3 style={{ margin: 0, color: '#10b981', fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                    {approvalData?.id_estudiante_existente ? 'Crear Matrícula' : 'Crear Estudiante'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? 12 : 16
              }}>
                {/* Nombres - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Nombres</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)', fontWeight: '600' }}>
                    {(approvalData?.nombre_solicitante && approvalData.nombre_solicitante.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Apellidos - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Apellidos</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)', fontWeight: '600' }}>
                    {(approvalData?.apellido_solicitante && approvalData.apellido_solicitante.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Identificación - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Identificación</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {(approvalData?.identificacion_solicitante && approvalData.identificacion_solicitante.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Email - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Email</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {(approvalData?.email_solicitante && approvalData.email_solicitante.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Teléfono - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Teléfono</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {(approvalData?.telefono_solicitante && approvalData.telefono_solicitante.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Fecha de Nacimiento - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Fecha de Nacimiento</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {(() => {
                      try {
                        if (approvalData?.fecha_nacimiento_solicitante && approvalData.fecha_nacimiento_solicitante.trim()) {
                          const fecha = new Date(approvalData.fecha_nacimiento_solicitante);
                          // Ajustar por timezone UTC
                          fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());

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
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Tipo de Curso</div>
                  <div style={{ color: 'var(--admin-text-primary, #fff)' }}>
                    {((approvalData as any)?.tipo_curso_nombre && (approvalData as any).tipo_curso_nombre.trim()) || 'No especificado'}
                  </div>
                </div>

                {/* Horario Preferido - Siempre visible */}
                <div>
                  <div style={{ color: 'var(--admin-text-secondary, rgba(255,255,255,0.6))', fontSize: '0.75rem', marginBottom: 3 }}>Horario Preferido</div>
                  <div style={{
                    color: 'var(--admin-text-primary, #fff)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textTransform: 'capitalize'
                  }}>
                    <Clock size={16} color="#ef4444" />
                    {(approvalData?.horario_preferido && approvalData.horario_preferido.trim()) || 'No especificado'}
                  </div>
                </div>
              </div>

              {/* Usuario Generado - Solo mostrar si NO es estudiante existente */}
              {!approvalData?.id_estudiante_existente && (
                <div style={{
                  marginTop: 16,
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(209, 250, 229, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)',
                  border: darkMode
                    ? '1px solid rgba(16, 185, 129, 0.25)'
                    : '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: darkMode
                    ? '0 4px 12px rgba(16, 185, 129, 0.1)'
                    : '0 2px 8px rgba(16, 185, 129, 0.08)'
                }}>
                  <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: darkMode ? '#34d399' : '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '700'
                  }}>
                    <GraduationCap size={20} color={darkMode ? '#34d399' : '#059669'} />
                    Usuario Generado Automáticamente
                  </h4>
                  <div style={{
                    color: darkMode ? '#10b981' : '#047857',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    background: darkMode
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(16, 185, 129, 0.12)',
                    padding: '10px 0.875rem',
                    borderRadius: '0.625rem',
                    border: darkMode
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(16, 185, 129, 0.25)',
                    marginBottom: '0.625rem',
                    letterSpacing: '0.5px',
                    boxShadow: darkMode
                      ? '0 2px 6px rgba(16, 185, 129, 0.15)'
                      : '0 1px 4px rgba(16, 185, 129, 0.1)'
                  }}>
                    {generatedUsername}
                  </div>
                  <div style={{
                    color: darkMode ? 'rgba(255,255,255,0.75)' : '#065f46',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    lineHeight: '1.5'
                  }}>
                    Generado a partir de las iniciales del nombre + primer apellido
                  </div>
                </div>
              )}

              {/* Alerta para estudiante existente */}
              {approvalData?.id_estudiante_existente && (
                <div style={{
                  marginTop: 16,
                  background: darkMode
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(219, 234, 254, 0.8) 0%, rgba(224, 231, 255, 0.6) 100%)',
                  border: darkMode
                    ? '1px solid rgba(59, 130, 246, 0.3)'
                    : '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 12,
                  padding: 16,
                  boxShadow: darkMode
                    ? '0 4px 12px rgba(59, 130, 246, 0.1)'
                    : '0 2px 8px rgba(59, 130, 246, 0.08)'
                }}>
                  <h4 style={{
                    margin: '0 0 0.5rem 0',
                    color: darkMode ? '#60a5fa' : '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '700'
                  }}>
                    <CheckCircle2 size={20} color={darkMode ? '#60a5fa' : '#2563eb'} />
                    Estudiante Existente
                  </h4>
                  <div style={{
                    color: darkMode ? 'rgba(255,255,255,0.85)' : '#1e40af',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
                    Este estudiante ya está registrado en el sistema. Solo se creará la matrícula para el nuevo curso.
                    <br />
                    <strong style={{
                      color: darkMode ? '#60a5fa' : '#2563eb',
                      fontWeight: '700',
                      marginTop: '0.25rem',
                      display: 'inline-block'
                    }}>No se generarán nuevas credenciales.</strong>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column-reverse' : 'row',
                gap: '0.75rem',
                justifyContent: 'flex-end',
                marginTop: isMobile ? '16px' : '1.25rem'
              }}>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  style={{
                    background: 'rgba(156, 163, 175, 0.15)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: '#9ca3af',
                    padding: '10px 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    width: isMobile ? '100%' : 'auto'
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
                    padding: '10px 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: decidiendo ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    opacity: decidiendo ? 0.7 : 1,
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  <Check size={16} />
                  {decidiendo ? 'Procesando...' : (approvalData?.id_estudiante_existente ? 'Crear Matrícula' : 'Crear Estudiante')}
                </button>
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

      {/* Modal de Rechazo */}
      {
        showRejectionModal && rejectionData && createPortal(
          <div
            className="modal-overlay"
            onClick={() => setShowRejectionModal(false)}
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
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                background: pick('#ffffff', 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'),
                border: `1px solid ${pick('rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.08)')}`,
                borderRadius: '16px',
                width: isMobile ? '92vw' : '600px',
                padding: '2rem',
                color: theme.textPrimary,
                boxShadow: darkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.8)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                animation: 'scaleIn 0.3s ease-out'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={20} style={{ color: '#ef4444' }} />
                  <h3 style={{ margin: 0, color: '#ef4444', fontSize: '1.1rem', fontWeight: '600' }}>
                    Rechazar Solicitud
                  </h3>
                </div>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ color: theme.textSecondary, fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: '1.5', opacity: 0.9 }}>
                  Se enviará un correo electrónico al estudiante notificando el rechazo con el siguiente mensaje:
                </p>
                <div style={{ marginBottom: '0.625rem', fontSize: '0.85rem', color: theme.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Motivo de rechazo:</div>
                <textarea
                  value={rejectionObservations}
                  onChange={(e) => setRejectionObservations(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '140px',
                    background: pick('rgba(0, 0, 0, 0.03)', 'rgba(255, 255, 255, 0.04)'),
                    border: `1px solid ${pick('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    color: theme.textPrimary,
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.background = pick('rgba(0, 0, 0, 0.01)', 'rgba(255, 255, 255, 0.06)');
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = pick('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
                    e.currentTarget.style.background = pick('rgba(0, 0, 0, 0.03)', 'rgba(255, 255, 255, 0.04)');
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowRejectionModal(false)}
                  style={{
                    background: pick('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.08)'),
                    border: `1px solid ${pick('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)')}`,
                    color: theme.textPrimary,
                    padding: '12px 1.5rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = pick('rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.12)');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = pick('rgba(0, 0, 0, 0.05)', 'rgba(255, 255, 255, 0.08)');
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    await handleDecision('rechazado', rejectionObservations, rejectionData.id_solicitud);
                    setShowRejectionModal(false);
                  }}
                  disabled={decidiendo || !rejectionObservations.trim()}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    padding: '12px 1.75rem',
                    borderRadius: '10px',
                    cursor: decidiendo ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '700',
                    transition: 'all 0.2s ease',
                    opacity: (decidiendo || !rejectionObservations.trim()) ? 0.6 : 1,
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    if (!decidiendo && rejectionObservations.trim()) {
                      e.currentTarget.style.background = '#dc2626';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.35)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ef4444';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)';
                  }}
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Modal de carga */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando datos..."
        darkMode={darkMode}
        duration={500}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
      />
    </div >
  );
};

export default GestionMatricula;



