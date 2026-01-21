import type { CSSProperties, ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Eye, GraduationCap, Calendar, Phone, MapPin, User, X, Grid, List, ChevronLeft, ChevronRight, Mail, IdCard, Download, FileText, Shield, Sheet, RefreshCcw, Power, AlertCircle, ArrowLeftRight
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import UserAvatar from '../../components/UserAvatar';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import LoadingModal from '../../components/LoadingModal';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { showToast } from '../../config/toastConfig';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

// Tipos
interface Curso {
  id_curso: number;
  nombre: string;
  codigo_curso: string;
  horario: string;
  estado: string;
}

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
  foto_perfil?: string | null; // URL de Cloudinary
  // Nuevos campos de documentos y contacto
  contacto_emergencia?: string;
  tipo_documento?: 'ecuatoriano' | 'extranjero';
  documento_identificacion_url?: string;
  documento_estatus_legal_url?: string;
  certificado_cosmetologia_url?: string;
  id_solicitud?: number; // Para descargar documentos
  cursos?: Curso[]; // Cursos inscritos
}


interface PersonalField {
  key: string;
  label: string;
  icon: ReactElement;
  value: string;
  capitalize?: boolean;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionEstudiantes = () => {
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
      '#0f172a'
    ),
    contentBackground: pick(
      '#ffffff',
      '#1e293b'
    ),
    surface: pick('#ffffff', '#1e293b'),
    surfaceBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    accentBorder: pick('#e2e8f0', 'rgba(255,255,255,0.08)'),
    textPrimary: pick('#0f172a', '#f8fafc'),
    textSecondary: pick('#475569', '#cbd5e1'),
    textMuted: pick('#64748b', '#94a3b8'),
    inputBg: pick('#ffffff', 'rgba(255,255,255,0.05)'),
    inputBorder: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    inputText: pick('#0f172a', '#f8fafc'),
    inputIcon: pick('#94a3b8', '#94a3b8'),
    chipBg: pick('#f1f5f9', 'rgba(255,255,255,0.06)'),
    chipBorder: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    toggleBg: pick('#f1f5f9', 'rgba(255,255,255,0.05)'),
    toggleMuted: pick('#64748b', '#94a3b8'),
    cardShadow: pick('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', 'none'),
    cardHoverShadow: pick('0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', 'none'),
    divider: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    emptyStateText: pick('#94a3b8', '#94a3b8'),
    tableHeaderBg: pick('#f8fafc', 'rgba(255,255,255,0.03)'),
    tableHeaderText: pick('#64748b', '#94a3b8'),
    tableCellText: pick('#334155', '#e2e8f0'),
    tableRowBorder: pick('#e2e8f0', 'rgba(255,255,255,0.05)'),
    tableActionBg: pick('#eff6ff', 'rgba(59,130,246,0.1)'),
    tableActionBorder: pick('#bfdbfe', 'rgba(59,130,246,0.2)'),
    tableActionText: pick('#2563eb', '#60a5fa'),
    paginationBackground: pick('#ffffff', '#1e293b'),
    paginationBorder: pick('#e2e8f0', 'rgba(255,255,255,0.1)'),
    paginationText: pick('#64748b', '#94a3b8'),
    paginationInactiveBg: pick('#f8fafc', 'rgba(255,255,255,0.03)'),
    paginationInactiveText: pick('#94a3b8', '#64748b'),
    cardBackground: pick('#ffffff', '#1e293b')
  };

  const estadoStyles: Record<Estudiante['estado'], { bg: string; border: string; color: string }> = {
    activo: {
      bg: pick('rgba(16,185,129,0.15)', 'rgba(16,185,129,0.18)'),
      border: pick('rgba(16,185,129,0.3)', 'rgba(16,185,129,0.35)'),
      color: pick('#0f766e', '#34d399')
    },
    inactivo: {
      bg: pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.15)'),
      border: pick('rgba(239,68,68,0.3)', 'rgba(239,68,68,0.35)'),
      color: pick('#c2410c', RedColorPalette.primary)
    },
    pendiente: {
      bg: pick('rgba(251,191,36,0.16)', 'rgba(251,191,36,0.2)'),
      border: pick('rgba(251,191,36,0.32)', 'rgba(251,191,36,0.38)'),
      color: pick('#b45309', '#fbbf24')
    }
  };

  const getEstadoTokens = (estado: Estudiante['estado']) => estadoStyles[estado] ?? estadoStyles.activo;

  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterEstadoCurso, setFilterEstadoCurso] = useState('todos');
  const [filterTipoCurso, setFilterTipoCurso] = useState('todos');
  const [tiposCurso, setTiposCurso] = useState<{ id: number, nombre: string }[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // 10 estudiantes por página
  const [totalCount, setTotalCount] = useState(0);

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Estado para confirmación de cambio de estado
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<{ tipo: 'activar' | 'desactivar', estudiante: Estudiante } | null>(null);

  const confirmarCambioEstado = (estudiante: Estudiante) => {
    const nuevoEstado = estudiante.estado === 'activo' ? 'desactivar' : 'activar';
    setAccionConfirmar({ tipo: nuevoEstado, estudiante });
    setShowConfirmModal(true);
  };

  const ejecutarAccion = async () => {
    if (!accionConfirmar) return;

    try {
      const token = sessionStorage.getItem('auth_token');
      const nuevoEstado = accionConfirmar.tipo === 'activar' ? 'activo' : 'inactivo';

      const response = await fetch(`${API_BASE}/api/usuarios/${accionConfirmar.estudiante.id_usuario}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      showToast.success(`Estudiante ${accionConfirmar.tipo === 'activar' ? 'activado' : 'inactivado'} correctamente`, darkMode);
      await fetchEstudiantes(); // Recargar lista
      setShowConfirmModal(false);
      setAccionConfirmar(null);
    } catch (err: any) {
      showToast.error(err?.message || 'Error al cambiar estado', darkMode);
    }
  };

  // Función para obtener estudiantes
  const fetchEstudiantes = async (options?: { successMessage?: string }) => {
    try {
      setLoading(true);
      setShowLoadingModal(true);
      setError(null);

      const token = sessionStorage.getItem('auth_token');
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (filterEstado !== 'todos') params.set('estado', filterEstado);
      if (filterEstadoCurso !== 'todos') params.set('estadoCurso', filterEstadoCurso);
      if (filterTipoCurso !== 'todos') params.set('tipoCurso', filterTipoCurso);

      const response = await fetch(`${API_BASE}/api/estudiantes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error cargando estudiantes');
      }

      const data = await response.json();
      const headerVal = response.headers.get('X-Total-Count');
      const totalHeader = headerVal !== null ? Number(headerVal) : NaN;



      const computedTotal = Number.isFinite(totalHeader) && totalHeader >= 0
        ? totalHeader
        : (typeof data?.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0));

      setEstudiantes(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []));
      setTotalCount(computedTotal);


      if (options?.successMessage) {
        showToast.success(options.successMessage, darkMode);
      }
    } catch (err: any) {
      const message = err.message || 'Error cargando estudiantes';
      setError(message);
      showToast.error(message, darkMode);
    } finally {
      setLoading(false);
      // Cerrar modal después de un pequeño delay para que se vea
      setTimeout(() => setShowLoadingModal(false), 300);
    }
  };

  useEffect(() => {
    fetchEstudiantes();
  }, [page, limit, searchTerm, filterEstado, filterEstadoCurso, filterTipoCurso]);

  // Resetear página cuando cambia el filtro o búsqueda
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterEstado, filterEstadoCurso, filterTipoCurso]);

  // Cargar tipos de curso al iniciar
  useEffect(() => {
    const fetchTiposCurso = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/api/tipos-cursos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTiposCurso(Array.isArray(data) ? data.map((t: any) => ({ id: t.id_tipo_curso, nombre: t.nombre })) : []);
        }
      } catch (err) {
        console.error('Error cargando tipos de curso:', err);
      }
    };
    fetchTiposCurso();
  }, []);

  // Los estudiantes ya vienen filtrados y paginados del backend
  const estudiantesFiltrados = estudiantes;

  const handleViewEstudiante = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setShowModal(true);
  };

  const totalPages = Math.ceil(totalCount / limit);

  const isCardsView = viewMode === 'cards';
  const isTableView = viewMode === 'table';
  const toggleGroupBg = pick('rgba(148, 163, 184, 0.12)', 'rgba(255, 255, 255, 0.08)');
  const viewActionColor = pick('#1d4ed8', '#60a5fa');
  const modalAccent = pick(RedColorPalette.primary, RedColorPalette.primaryLight);
  const modalAccentBg = pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.24)');
  const modalSectionBackground = pick('rgba(255,255,255,0.94)', 'rgba(12,19,33,0.85)');
  const modalSectionBorder = pick('rgba(239, 68, 68, 0.18)', 'rgba(255, 255, 255, 0.08)');
  const modalLabelColor = pick('rgba(71,85,105,0.85)', 'rgba(226,232,240,0.75)');
  const modalValueColor = pick('#0f172a', '#f8fafc');
  const modalDivider = pick('rgba(148,163,184,0.22)', 'rgba(255,255,255,0.12)');

  const modalFieldLabelStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
    color: modalLabelColor,
    fontWeight: 600,
    fontSize: isMobile ? '0.75rem' : '0.78rem',
    letterSpacing: '-0.01em'
  };

  const modalFieldValueStyle: CSSProperties = {
    color: modalValueColor,
    fontSize: isMobile ? '0.88rem' : '0.92rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    wordBreak: 'break-word'
  };

  const modalSectionStyle: CSSProperties = {
    background: modalSectionBackground,
    border: `1px solid ${modalSectionBorder}`,
    borderRadius: isMobile ? 10 : 12,
    padding: isMobile ? '0.75rem 0.85rem' : '0.95rem 1.15rem',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? 10 : 14
  };

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
    <div
      style={{
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
        '--admin-input-bg': theme.inputBg,
        '--admin-input-border': theme.inputBorder,
        '--admin-input-text': theme.inputText,
        '--admin-input-icon': theme.inputIcon
      } as CSSProperties}
    >
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Estudiantes"
        subtitle="Administra y visualiza la información de los estudiantes matriculados"
        rightSlot={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={async () => {
                try {
                  showToast.info('Generando reporte de estudiantes...', darkMode);
                  const token = sessionStorage.getItem('auth_token');
                  const params = new URLSearchParams();
                  if (searchTerm) params.set('search', searchTerm);
                  if (filterEstado !== 'todos') params.set('estado', filterEstado);
                  if (filterEstadoCurso !== 'todos') params.set('estadoCurso', filterEstadoCurso);
                  if (filterTipoCurso !== 'todos') params.set('tipoCurso', filterTipoCurso);
                  const url = `${API_BASE}/api/estudiantes/reporte/excel${params.toString() ? '?' + params.toString() : ''}`;
                  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                  if (!response.ok) throw new Error('Error descargando reporte');
                  const blob = await response.blob();
                  const blobUrl = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = `Reporte_Estudiantes_${new Date().toISOString().split('T')[0]}.xlsx`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(blobUrl);
                  document.body.removeChild(a);
                  showToast.success('Reporte descargado correctamente.', darkMode);
                } catch (error) {
                  showToast.error('No se pudo descargar el reporte.', darkMode);
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
                await fetchEstudiantes({ successMessage: 'Listado actualizado.' });
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
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`
        }}
      >
        <div className="responsive-filters">
          <div style={{ display: 'flex', flexDirection: isSmallScreen ? 'column' : 'row', gap: '0.75rem', alignItems: isSmallScreen ? 'stretch' : 'center', flex: 1, width: isSmallScreen ? '100%' : 'auto' }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', flex: 2, width: isSmallScreen ? '100%' : 'auto' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: theme.inputIcon }} />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar por nombre o identificación..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0 0.5rem 0 2rem',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : '#ffffff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
                  borderRadius: '0.5rem',
                  color: theme.inputText,
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  height: '2rem'
                }}
              />
            </div>

            {/* Filtro Estado Estudiante */}
            <div style={{ minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)', width: isSmallScreen ? '100%' : 'auto' }}>
              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                darkMode={darkMode}
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' }
                ]}
              />
            </div>

            {/* Filtro Estado Curso */}
            <div style={{ minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)', width: isSmallScreen ? '100%' : 'auto' }}>
              <StyledSelect
                name="filterEstadoCurso"
                value={filterEstadoCurso}
                onChange={(e) => setFilterEstadoCurso(e.target.value)}
                darkMode={darkMode}
                options={[
                  { value: 'todos', label: 'Todos los cursos' },
                  { value: 'activo', label: 'Cursos Activos' },
                  { value: 'finalizado', label: 'Cursos Finalizados' }
                ]}
              />
            </div>

            {/* Filtro Tipo Curso */}
            <div style={{ minWidth: isSmallScreen ? 'auto' : 'min(12.5rem, 25vw)', width: isSmallScreen ? '100%' : 'auto' }}>
              <StyledSelect
                name="filterTipoCurso"
                value={filterTipoCurso}
                onChange={(e) => setFilterTipoCurso(e.target.value)}
                darkMode={darkMode}
                options={[
                  { value: 'todos', label: 'Todos los tipos' },
                  ...tiposCurso.map(tc => ({ value: String(tc.id), label: tc.nombre }))
                ]}
              />
            </div>

            {/* Toggle Vista */}
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
                  onClick={() => setViewMode('cards')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3em',
                    padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                    background: isCardsView ? (darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff') : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: isCardsView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)'),
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    flex: isSmallScreen ? 1 : 'initial',
                  }}
                >
                  <Grid size={16} color={isCardsView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)')} /> {!isMobile && 'Tarjetas'}
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3em',
                    padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                    background: isTableView ? (darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff') : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: isTableView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)'),
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    flex: isSmallScreen ? 1 : 'initial'
                  }}
                >
                  <List size={16} color={isTableView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : (darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)')} /> {!isMobile && 'Tabla'}
                </button>
              </div>


            </div>
          </div>
        </div>
      </GlassEffect>


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
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0.75rem',
          padding: '0.25rem',
          marginBottom: isMobile ? '12px' : '0.5rem'
        }}>
          {estudiantesFiltrados.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px 1.25rem', textAlign: 'center', color: theme.emptyStateText, fontSize: '0.85rem' }}>
              {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
            </div>
          ) : (
            estudiantesFiltrados.map((estudiante) => {
              const estadoTokens = getEstadoTokens(estudiante.estado);

              return (
                <div
                  key={estudiante.id_usuario}
                  style={{
                    background: theme.cardBackground,
                    border: `1px solid ${pick('rgba(148,163,184,0.22)', 'rgba(255, 255, 255, 0.08)')}`,
                    borderRadius: '0.75rem',
                    padding: '0.5rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: theme.cardShadow,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = theme.cardHoverShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = theme.cardShadow;
                  }}
                >
                  {/* Header Grid: 2 Columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr',
                    gap: '0.5rem',
                    alignItems: 'start'
                  }}>
                    {/* Left Column: Status, Avatar, Name, ID */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.1875rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: estadoTokens.bg,
                          border: `1px solid ${estadoTokens.border}`,
                          color: estadoTokens.color,
                          width: 'fit-content'
                        }}>
                          {estudiante.estado}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserAvatar
                          userId={estudiante.id_usuario}
                          nombre={estudiante.nombre}
                          apellido={estudiante.apellido}
                          size={1.8}
                          showBorder={true}
                          borderColor={darkMode ? 'rgba(239, 68, 68, 0.3)' : '#cbd5e1'}
                          fotoUrl={estudiante.foto_perfil}
                        />
                        <div>
                          <h3 style={{
                            color: theme.textPrimary,
                            margin: 0,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            lineHeight: 1.2
                          }}>
                            {estudiante.apellido}, {estudiante.nombre}
                          </h3>
                          <div style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: 500, marginTop: '0.1rem' }}>
                            ID: {estudiante.identificacion}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Usuario & Registro Compact Box */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      padding: '0.35rem',
                      borderRadius: '0.35rem',
                      border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600 }}>Usuario:</span>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                          {estudiante.username || 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: theme.textMuted, fontSize: '0.65rem', fontWeight: 600 }}>Registro:</span>
                        <div style={{ color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 600 }}>
                          {formatDate(estudiante.fecha_registro)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Section - Compact */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.3rem 0.5rem',
                    background: pick('rgba(59, 130, 246, 0.04)', 'rgba(59, 130, 246, 0.08)'),
                    border: `1px solid ${pick('rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.15)')}`,
                    borderRadius: '0.35rem',
                    marginTop: '0'
                  }}>
                    <Mail size={13} color={theme.textMuted} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.7rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {estudiante.email}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.1rem' }}>
                    <button
                      onClick={() => handleViewEstudiante(estudiante)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.5rem',
                        background: pick('rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.1)'),
                        border: `1px solid ${pick('rgba(59,130,246,0.24)', 'rgba(59,130,246,0.3)')}`,
                        borderRadius: '0.35rem',
                        color: viewActionColor,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = pick('rgba(59,130,246,0.18)', 'rgba(59, 130, 246, 0.2)');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = pick('rgba(59, 130, 246, 0.12)', 'rgba(59, 130, 246, 0.1)');
                      }}
                    >
                      <Eye size={13} color={viewActionColor} /> Ver
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmarCambioEstado(estudiante);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.5rem',
                        background: estudiante.estado === 'activo'
                          ? pick('rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.1)')
                          : pick('rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.1)'),
                        border: `1px solid ${estudiante.estado === 'activo'
                          ? pick('rgba(239,68,68,0.24)', 'rgba(239,68,68,0.3)')
                          : pick('rgba(16,185,129,0.24)', 'rgba(16,185,129,0.3)')}`,
                        borderRadius: '0.35rem',
                        color: estudiante.estado === 'activo'
                          ? pick('#ef4444', '#f87171')
                          : pick('#10b981', '#34d399'),
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = estudiante.estado === 'activo'
                          ? pick('rgba(239,68,68,0.18)', 'rgba(239, 68, 68, 0.2)')
                          : pick('rgba(16,185,129,0.18)', 'rgba(16, 185, 129, 0.2)');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = estudiante.estado === 'activo'
                          ? pick('rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.1)')
                          : pick('rgba(16, 185, 129, 0.12)', 'rgba(16, 185, 129, 0.1)');
                      }}
                    >
                      <Power size={13} /> {estudiante.estado === 'activo' ? 'Inactivar' : 'Activar'}
                    </button>
                  </div>
                </div>
              );
            })
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
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '8px' : '0.25rem 1rem',
          background: theme.paginationBackground,
          border: `1px solid ${theme.paginationBorder}`,
          borderRadius: '0.75rem'
        }}>
          <div style={{
            color: theme.textSecondary,
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {totalPages} • Total: {totalCount} estudiantes
          </div>
          <div style={{
            display: 'flex',
            gap: '0.375rem',
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
                gap: isMobile ? '4px' : '0.25rem',
                padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                background: page === 1 ? theme.paginationInactiveBg : theme.surface,
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: '0.625rem',
                color: page === 1 ? theme.paginationInactiveText : theme.textPrimary,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1' : 'initial'
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
                  background: page === pageNum ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})` : theme.surface,
                  border: page === pageNum ? `1px solid ${RedColorPalette.primary}` : `1px solid ${theme.surfaceBorder}`,
                  borderRadius: '0.5rem',
                  color: page === pageNum ? '#fff' : theme.textPrimary,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: isMobile ? '30px' : '2rem',
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
                background: page === totalPages ? theme.paginationInactiveBg : theme.surface,
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: '0.625rem',
                color: page === totalPages ? theme.paginationInactiveText : theme.textPrimary,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1' : 'initial'
              }}
            >
              {!isMobile && 'Siguiente'}
              <ChevronRight size={isMobile ? 14 : 14} />
            </button>
          </div>
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <>
          <div style={{
            background: theme.surface,
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: `1px solid ${theme.surfaceBorder}`,
            boxShadow: 'none'
          }}>
            {/* Indicador de scroll en móvil */}
            {isSmallScreen && (
              <div style={{
                background: pick('#f1f5f9', 'rgba(255,255,255,0.05)'),
                border: `1px solid ${pick('#cbd5e1', 'rgba(255,255,255,0.1)')}`,
                borderRadius: '0.5rem',
                padding: '8px 0.75rem',
                marginBottom: '0.75rem',
                color: pick('#64748b', 'rgba(248,250,252,0.85)'),
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

            <div
              className="responsive-table-container"
              style={{
                overflowX: 'auto',
                borderRadius: isMobile ? '12px' : '0.75rem',
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
                marginBottom: isMobile ? '12px' : '0.5rem',
                position: 'relative'
              }}
            >
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
              <table style={{ width: '100%', borderCollapse: 'collapse', position: 'relative', zIndex: 1 }}>
                <thead style={{
                  borderBottom: `1px solid ${theme.tableRowBorder}`,
                  background: theme.tableHeaderBg
                }}>
                  <tr>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Estudiante
                    </th>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Identificación
                    </th>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Usuario
                    </th>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Estado
                    </th>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Registro
                    </th>
                    <th style={{ padding: '0.25rem 0.5rem', textAlign: 'center', color: theme.tableHeaderText, fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: theme.emptyStateText }}>
                        {loading ? 'Cargando estudiantes...' : 'No hay estudiantes registrados'}
                      </td>
                    </tr>
                  ) : (
                    estudiantesFiltrados.map((estudiante) => (
                      <tr
                        key={estudiante.id_usuario}
                        style={{
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}`,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 600, verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <UserAvatar
                              nombre={estudiante.nombre}
                              apellido={estudiante.apellido}
                              userId={estudiante.id_usuario}
                              size={1.75}
                            />
                            <div>
                              <div style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '0.7rem' }}>
                                {estudiante.apellido}, {estudiante.nombre}
                              </div>
                              {estudiante.telefono && (
                                <div style={{ color: theme.textMuted, fontSize: '0.65rem' }}>
                                  {estudiante.telefono}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textPrimary, fontSize: '0.7rem', fontWeight: 600, verticalAlign: 'middle' }}>
                          {estudiante.identificacion}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textSecondary, fontSize: '0.7rem', verticalAlign: 'middle' }}>
                          {estudiante.username || 'N/A'}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 0.625rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            background: estudiante.estado === 'activo'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                            color: estudiante.estado === 'activo'
                              ? '#10b981'
                              : '#ef4444',
                            border: `1px solid ${estudiante.estado === 'activo'
                              ? 'rgba(10, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)'}`,
                            textTransform: 'uppercase'
                          }}>
                            {estudiante.estado}
                          </span>
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', color: theme.textSecondary, fontSize: '0.7rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          {formatDate(estudiante.fecha_registro)}
                        </td>
                        <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={() => handleViewEstudiante(estudiante)}
                              title="Ver detalles"
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
                            <button
                              onClick={() => confirmarCambioEstado(estudiante)}
                              title={estudiante.estado === 'activo' ? 'Inactivar' : 'Activar'}
                              style={{
                                padding: '0.25rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${estudiante.estado === 'activo' ? '#ef4444' : '#10b981'}`,
                                backgroundColor: 'transparent',
                                color: estudiante.estado === 'activo' ? '#ef4444' : '#10b981',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                const color = estudiante.estado === 'activo' ? '#ef4444' : '#10b981';
                                e.currentTarget.style.backgroundColor = color;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                const color = estudiante.estado === 'activo' ? '#ef4444' : '#10b981';
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = color;
                              }}
                            >
                              <Power style={{ width: '0.85rem', height: '0.85rem' }} />
                            </button>
                          </div>
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
              gap: isMobile ? '0.75rem' : '0',
              padding: isMobile ? '8px' : '0.25rem 1rem',
              background: theme.paginationBackground,
              border: `1px solid ${theme.paginationBorder}`,
              borderRadius: '0.75rem',
              marginTop: '0.25rem',
              marginBottom: isMobile ? '0.75rem' : '0.5rem',
            }}>
              <div style={{
                color: theme.textSecondary,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                Página {page} de {totalPages} • Total: {totalCount} estudiantes
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
                      ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.85)')
                      : (darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff'),
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.625rem',
                    color: page === 1 ? (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(148,163,184,0.85)') : theme.textPrimary,
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 600,
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    flex: isMobile ? '1' : 'initial'
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
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : (darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff'),
                      border: page === pageNum
                        ? `1px solid ${darkMode ? '#ef4444' : '#dc2626'}`
                        : `1px solid ${theme.inputBorder}`,
                      borderRadius: '0.5rem',
                      color: page === pageNum ? '#fff' : theme.textPrimary,
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minWidth: isMobile ? '30px' : '2rem',
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
                      ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(241,245,249,0.85)')
                      : (darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff'),
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.625rem',
                    color: page === totalPages ? (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(148,163,184,0.85)') : theme.textPrimary,
                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                    fontWeight: 600,
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    flex: isMobile ? '1' : 'initial'
                  }}
                >
                  {!isMobile && 'Siguiente'}
                  <ChevronRight size={isMobile ? 14 : 14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalle */}
      {showModal && selectedEstudiante && createPortal(
        (() => {
          const personalFields: PersonalField[] = [];

          personalFields.push(
            {
              key: 'identificacion',
              label: 'Identificación',
              icon: <IdCard size={14} color={modalAccent} />,
              value: selectedEstudiante.identificacion
            },
            {
              key: 'username',
              label: 'Usuario',
              icon: <User size={14} color={modalAccent} />,
              value: selectedEstudiante.username || 'No asignado'
            },
            {
              key: 'email',
              label: 'Email',
              icon: <Mail size={14} color={modalAccent} />,
              value: selectedEstudiante.email
            }
          );

          if (selectedEstudiante.telefono) {
            personalFields.push({
              key: 'telefono',
              label: 'Teléfono',
              icon: <Phone size={14} color={modalAccent} />,
              value: selectedEstudiante.telefono
            });
          }

          personalFields.push({
            key: 'registro',
            label: 'Registro',
            icon: <Calendar size={14} color={modalAccent} />,
            value: formatDate(selectedEstudiante.fecha_registro)
          });

          if (selectedEstudiante.fecha_nacimiento) {
            personalFields.push({
              key: 'fecha_nacimiento',
              label: 'Fecha de nacimiento',
              icon: <Calendar size={14} color={modalAccent} />,
              value: formatDate(selectedEstudiante.fecha_nacimiento)
            });
          }

          if (selectedEstudiante.genero) {
            personalFields.push({
              key: 'genero',
              label: 'Género',
              icon: <User size={14} color={modalAccent} />,
              value: selectedEstudiante.genero,
              capitalize: true
            });
          }

          if (selectedEstudiante.tipo_documento) {
            personalFields.push({
              key: 'tipo_documento',
              label: 'Tipo de documento',
              icon: <IdCard size={14} color={modalAccent} />,
              value: selectedEstudiante.tipo_documento,
              capitalize: true
            });
          }

          if (selectedEstudiante.direccion) {
            personalFields.push({
              key: 'direccion',
              label: 'Dirección',
              icon: <MapPin size={14} color={modalAccent} />,
              value: selectedEstudiante.direccion
            });
          }

          if (selectedEstudiante.contacto_emergencia) {
            personalFields.push({
              key: 'contacto_emergencia',
              label: 'Contacto de emergencia',
              icon: <Phone size={14} color={modalAccent} />,
              value: selectedEstudiante.contacto_emergencia
            });
          }

          const columnsCount = isMobile ? 1 : isSmallScreen ? 2 : 3;
          const distributedColumns = Array.from({ length: columnsCount }, () => [] as PersonalField[]);
          personalFields.forEach((field, index) => {
            distributedColumns[index % columnsCount].push(field);
          });
          const personalFieldColumns = distributedColumns.filter(column => column.length > 0);
          const personalGridTemplate = personalFieldColumns.length <= 1
            ? '1fr'
            : `repeat(${personalFieldColumns.length}, minmax(0, 1fr))`;

          const showCourses = Array.isArray(selectedEstudiante.cursos) && selectedEstudiante.cursos.length > 0;
          const showDocuments = Boolean(selectedEstudiante.documento_identificacion_url || selectedEstudiante.documento_estatus_legal_url || selectedEstudiante.certificado_cosmetologia_url);
          const additionalSectionsTemplate = !isMobile && showCourses && showDocuments
            ? 'repeat(2, minmax(0, 1fr))'
            : '1fr';

          return (
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
                  background: 'var(--admin-card-bg, linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.92) 100%))',
                  border: `1px solid ${modalSectionBorder}`,
                  borderRadius: isMobile ? 14 : 16,
                  width: isMobile ? '92vw' : '680px',
                  maxWidth: isMobile ? '92vw' : '680px',
                  maxHeight: '82vh',
                  padding: isMobile ? '0.7rem 0.85rem' : '0.95rem 1.2rem',
                  margin: 'auto',
                  color: modalValueColor,
                  boxShadow: '0 22px 48px rgba(15,23,42,0.22)',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  animation: 'scaleIn 0.3s ease-out'
                }}
              >
                {/* Header del Modal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '0.65rem',
                  flexWrap: 'wrap',
                  marginBottom: isMobile ? 10 : 14,
                  paddingBottom: isMobile ? 6 : 8,
                  borderBottom: `1px solid ${modalDivider}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{
                      width: isMobile ? 30 : 34,
                      height: isMobile ? 30 : 34,
                      borderRadius: '9999px',
                      background: modalAccentBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <GraduationCap size={isMobile ? 15 : 17} color={modalAccent} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '0.98rem' : '1.08rem', fontWeight: 700, color: modalAccent, letterSpacing: '-0.01em' }}>
                      Información del Estudiante
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: toggleGroupBg,
                      border: `1px solid ${modalSectionBorder}`,
                      borderRadius: '0.7rem',
                      padding: '0.4rem',
                      color: modalValueColor,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = modalAccentBg;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = toggleGroupBg;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <X size={16} color={modalAccent} />
                  </button>
                </div>

                {/* Información del Estudiante */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 18 }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    alignItems: isSmallScreen ? 'flex-start' : 'center',
                    gap: isSmallScreen ? 10 : 14,
                    background: modalAccentBg,
                    border: `1px solid ${modalSectionBorder}`,
                    borderRadius: isMobile ? 10 : 12,
                    padding: isMobile ? '0.65rem 0.8rem' : '0.9rem 1.05rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: modalLabelColor, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Estudiante</div>
                      <div style={{ color: modalValueColor, fontSize: isMobile ? '0.98rem' : '1.08rem', fontWeight: 700 }}>
                        {selectedEstudiante.apellido}, {selectedEstudiante.nombre}
                      </div>
                      <div style={{ color: modalLabelColor, fontSize: '0.76rem', marginTop: '0.32rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <IdCard size={14} color={modalAccent} />
                        {selectedEstudiante.identificacion}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      padding: '0.32rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: estadoStyles[selectedEstudiante.estado].bg,
                      border: `1px solid ${estadoStyles[selectedEstudiante.estado].border}`,
                      color: estadoStyles[selectedEstudiante.estado].color
                    }}>
                      {selectedEstudiante.estado}
                    </span>
                  </div>

                  <div style={modalSectionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '9999px', background: modalAccentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={15} color={modalAccent} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: modalAccent }}>Datos personales</h4>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: personalGridTemplate,
                        gap: isMobile ? '0.55rem' : '0.7rem'
                      }}
                    >
                      {personalFieldColumns.map((column, columnIndex) => (
                        <div
                          key={`personal-column-${columnIndex}`}
                          style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.45rem' : '0.6rem' }}
                        >
                          {column.map((field) => (
                            <div key={field.key}>
                              <div style={modalFieldLabelStyle}>
                                {field.icon}
                                <span>{field.label}</span>
                              </div>
                              <div
                                style={{
                                  ...modalFieldValueStyle,
                                  textTransform: field.capitalize ? 'capitalize' : 'none'
                                }}
                              >
                                {field.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(showCourses || showDocuments) && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: additionalSectionsTemplate,
                        gap: isMobile ? '0.7rem' : '0.85rem'
                      }}
                    >
                      {showCourses && (
                        <div style={modalSectionStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '9999px', background: modalAccentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <GraduationCap size={15} color={modalAccent} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: modalAccent }}>Cursos inscritos</h4>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(210px, 1fr))',
                              gap: isMobile ? '0.55rem' : '0.7rem'
                            }}
                          >
                            {selectedEstudiante.cursos!.map((curso) => (
                              <div
                                key={curso.id_curso}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: isSmallScreen ? '1fr' : '1fr auto',
                                  alignItems: isSmallScreen ? 'flex-start' : 'center',
                                  gap: isSmallScreen ? '0.4rem' : '0.6rem',
                                  padding: isMobile ? '0.55rem 0.75rem' : '0.65rem 0.85rem',
                                  borderRadius: isMobile ? 9 : 11,
                                  border: `1px solid ${modalSectionBorder}`,
                                  background: pick('rgba(255,255,255,0.65)', 'rgba(15,23,42,0.85)')
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.18rem' }}>
                                  <div style={{ color: modalAccent, fontWeight: 600, fontSize: '0.85rem' }}>{curso.nombre}</div>
                                  <div style={{ color: modalLabelColor, fontSize: '0.72rem' }}>
                                    {curso.codigo_curso} • {curso.horario}
                                  </div>
                                </div>
                                <span style={{
                                  justifySelf: isSmallScreen ? 'flex-start' : 'flex-end',
                                  display: 'inline-flex',
                                  padding: '0.3rem 0.65rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                  background: curso.estado === 'activo' ? 'rgba(22,163,74,0.15)' : 'rgba(248,113,113,0.15)',
                                  border: curso.estado === 'activo' ? '1px solid rgba(22,163,74,0.35)' : '1px solid rgba(248,113,113,0.35)',
                                  color: curso.estado === 'activo' ? '#16a34a' : '#ef4444'
                                }}>
                                  {curso.estado}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {showDocuments && (
                        <div style={modalSectionStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '9999px', background: modalAccentBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FileText size={15} color={modalAccent} />
                            </div>
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: modalAccent }}>Documentos del estudiante</h4>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: !isMobile && (selectedEstudiante.documento_estatus_legal_url || selectedEstudiante.certificado_cosmetologia_url) ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                              gap: isMobile ? '0.55rem' : '0.7rem'
                            }}
                          >
                            {selectedEstudiante.documento_identificacion_url && (
                              <a
                                href={selectedEstudiante.documento_identificacion_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.4rem',
                                  padding: isMobile ? '0.6rem 0.85rem' : '0.7rem 0.95rem',
                                  background: toggleGroupBg,
                                  border: `1px solid ${modalSectionBorder}`,
                                  borderRadius: isMobile ? 9 : 11,
                                  color: modalAccent,
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = modalAccentBg;
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = toggleGroupBg;
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <Download size={16} color={modalAccent} />
                                {selectedEstudiante.tipo_documento === 'extranjero' ? 'Ver Pasaporte' : 'Ver Cédula'}
                              </a>
                            )}
                            {selectedEstudiante.documento_estatus_legal_url && (
                              <a
                                href={selectedEstudiante.documento_estatus_legal_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.4rem',
                                  padding: isMobile ? '0.6rem 0.85rem' : '0.7rem 0.95rem',
                                  background: toggleGroupBg,
                                  border: `1px solid ${modalSectionBorder}`,
                                  borderRadius: isMobile ? 9 : 11,
                                  color: modalAccent,
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = modalAccentBg;
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <Shield size={16} color={modalAccent} />
                                Ver Estatus Legal
                              </a>
                            )}
                            {selectedEstudiante.certificado_cosmetologia_url && (
                              <a
                                href={selectedEstudiante.certificado_cosmetologia_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.4rem',
                                  padding: isMobile ? '0.6rem 0.85rem' : '0.7rem 0.95rem',
                                  background: 'rgba(168, 85, 247, 0.12)',
                                  border: '1px solid rgba(168, 85, 247, 0.28)',
                                  borderRadius: isMobile ? 9 : 11,
                                  color: '#a855f7',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.18)';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.12)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                <FileText size={16} color="#a855f7" />
                                Ver Certificado
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: isMobile ? 8 : 12
                    }}
                  >
                    <button
                      onClick={() => setShowModal(false)}
                      style={{
                        padding: isMobile ? '0.65rem 0.95rem' : '0.75rem 1.1rem',
                        background: toggleGroupBg,
                        border: `1px solid ${modalSectionBorder}`,
                        borderRadius: isMobile ? 10 : 12,
                        color: modalAccent,
                        cursor: 'pointer',
                        fontSize: isMobile ? '0.88rem' : '0.92rem',
                        fontWeight: 600,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = modalAccentBg;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = toggleGroupBg;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })(),
        document.body
      )}

      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando datos..."
        darkMode={darkMode}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
      />
      {/* Modal de Confirmación */}
      {showConfirmModal && accionConfirmar && createPortal(
        <div
          className="modal-overlay"
          onClick={() => setShowConfirmModal(false)}
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
            zIndex: 100000,
            backdropFilter: 'blur(8px)',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '1rem'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.contentBackground,
              borderRadius: isMobile ? 14 : 16,
              padding: isMobile ? '1.5rem' : '2rem',
              maxWidth: 400,
              width: '100%',
              boxShadow: theme.cardShadow,
              border: `1px solid ${theme.surfaceBorder}`,
              textAlign: 'center',
              animation: 'scaleIn 0.2s ease-out'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: accionConfirmar.tipo === 'activar'
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              {accionConfirmar.tipo === 'activar' ? (
                <Power size={28} color="#10b981" />
              ) : (
                <AlertCircle size={28} color="#ef4444" />
              )}
            </div>

            <h3 style={{
              marginBottom: '0.75rem',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: theme.textPrimary
            }}>
              {accionConfirmar.tipo === 'activar' ? '¿Activar estudiante?' : '¿Inactivar estudiante?'}
            </h3>

            <p style={{
              marginBottom: '1.75rem',
              color: theme.textSecondary,
              lineHeight: 1.5,
              fontSize: '0.95rem'
            }}>
              {accionConfirmar.tipo === 'activar'
                ? `Estás a punto de activar a ${accionConfirmar.estudiante.nombre} ${accionConfirmar.estudiante.apellido}. Podrá acceder al sistema nuevamente.`
                : `Estás a punto de inactivar a ${accionConfirmar.estudiante.nombre} ${accionConfirmar.estudiante.apellido}. Perderá el acceso al sistema inmediatamente.`
              }
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.625rem',
                  border: `1px solid ${theme.surfaceBorder}`,
                  background: 'transparent',
                  color: theme.textPrimary,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = theme.surface}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarAccion}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  background: accionConfirmar.tipo === 'activar'
                    ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})` // Usamos rojo también para activar por consistencia de marca o verde si se prefiere semántica
                    : `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default GestionEstudiantes;



