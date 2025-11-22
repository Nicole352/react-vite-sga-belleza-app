import { useState, useEffect } from 'react';
import type { CSSProperties, ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Eye, UserCheck, Calendar, Phone, Mail, User, X, Plus, Edit, Lock, Info, Grid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import { showToast } from '../../config/toastConfig';
import StyledSelect from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import UserAvatar from '../../components/UserAvatar';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import LoadingModal from '../../components/LoadingModal';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';

// Tipos
interface Docente {
  id_docente: number;
  id_usuario?: number;
  nombres: string;
  apellidos: string;
  identificacion: string;
  fecha_nacimiento?: string;
  telefono?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  direccion?: string;
  titulo_profesional: string;
  gmail?: string;
  username?: string;
  password_temporal?: string;
  experiencia_anos: number;
  estado: 'activo' | 'inactivo';
  foto_perfil?: string | null; // URL de Cloudinary
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionDocentes = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit] = useState(3); // 3 docentes por página
  const [totalCount, setTotalCount] = useState(0);
  const [previewUsername, setPreviewUsername] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('admin-dark-mode');
      const newMode = saved !== null ? JSON.parse(saved) : true;
      setDarkMode(prev => (prev === newMode ? prev : newMode));
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const pick = <T,>(light: T, dark: T): T => (darkMode ? dark : light);

  const theme = {
    background: pick(
      'linear-gradient(135deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 100%)',
      'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)'
    ),
    textPrimary: pick('#0f172a', 'rgba(255,255,255,0.95)'),
    textSecondary: pick('rgba(71,85,105,0.85)', 'rgba(226,232,240,0.7)'),
    textMuted: pick('rgba(100,116,139,0.65)', 'rgba(148,163,184,0.6)'),
    surface: pick('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.05)'),
    surfaceBorder: pick('rgba(15,23,42,0.08)', 'rgba(255,255,255,0.08)'),
    inputBg: pick('#ffffff', 'rgba(255,255,255,0.1)'),
    inputBorder: pick('rgba(148,163,184,0.35)', 'rgba(255,255,255,0.2)'),
    inputIcon: pick('rgba(100,116,139,0.55)', 'rgba(255,255,255,0.5)'),
    toggleBg: pick('rgba(248,250,252,0.95)', 'rgba(255,255,255,0.05)'),
    toggleInactive: pick('rgba(100,116,139,0.7)', 'rgba(255,255,255,0.6)'),
    cardBackground: pick(
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,248,252,0.94) 100%)',
      'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
    ),
    cardBorder: pick('rgba(226,232,240,0.85)', 'rgba(239,68,68,0.2)'),
    badgeBg: pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)'),
    badgeText: pick('rgba(71,85,105,0.78)', 'rgba(255,255,255,0.6)'),
    divider: pick('rgba(226,232,240,0.68)', 'rgba(255,255,255,0.1)'),
    tableWrapperBg: pick('rgba(255,255,255,0.95)', 'rgba(255,255,255,0.05)'),
    tableWrapperBorder: pick('rgba(226,232,240,0.65)', 'rgba(255,255,255,0.1)'),
    tableHeaderBg: pick('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.15)'),
    tableHeaderText: pick('#9f1239', '#ffffff'),
    tableRowAlt: pick('rgba(15,23,42,0.035)', 'rgba(255,255,255,0.02)'),
    tableText: pick('rgba(71,85,105,0.9)', 'rgba(255,255,255,0.8)'),
    buttonPrimaryBg: pick(RedColorPalette.primary, `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`),
    buttonPrimaryText: pick('#ffffff', '#fff'),
    infoPanelBg: pick('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.1)'),
    infoPanelBorder: pick('rgba(59,130,246,0.2)', 'rgba(59,130,246,0.3)'),
    neutralPanelBg: pick('rgba(255,255,255,0.82)', 'rgba(255,255,255,0.02)'),
    chipBg: pick('rgba(15,23,42,0.05)', 'rgba(255,255,255,0.05)')
  };

  const selectOptionStyle: CSSProperties = {
    background: theme.inputBg,
    color: theme.textPrimary
  };

  const isCardsView = viewMode === 'cards';
  const isTableView = viewMode === 'table';
  const toggleGroupBg = pick('rgba(148, 163, 184, 0.12)', 'rgba(255, 255, 255, 0.08)');
  const toggleActiveBg = pick('#ffffff', 'rgba(255, 255, 255, 0.14)');
  const toggleActiveText = pick(RedColorPalette.primary, RedColorPalette.primaryLight);
  const toggleInactiveText = theme.toggleInactive;
  const viewDetailsColor = pick('#1d4ed8', '#3b82f6');
  const editButtonTextColor = mapToRedScheme('#d97706');
  const infoBannerStyles = {
    background: pick('rgba(59,130,246,0.08)', 'rgba(59,130,246,0.18)'),
    border: `1px solid ${pick('rgba(59,130,246,0.22)', 'rgba(59,130,246,0.32)')}`,
    iconBackground: pick('rgba(59,130,246,0.16)', 'rgba(59,130,246,0.28)'),
    iconColor: pick('#2563eb', '#93c5fd'),
    titleColor: pick('#1d4ed8', '#bfdbfe'),
    descriptionColor: pick('rgba(71,85,105,0.75)', 'rgba(226,232,240,0.72)')
  };
  const autoUsernameStyles = {
    background: pick('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.2)'),
    border: `1px solid ${pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.32)')}`,
    headingColor: pick('#b91c1c', '#fca5a5'),
    iconColor: pick('#ef4444', '#fca5a5'),
    badgeBackground: pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.28)'),
    badgeBorder: `1px solid ${pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.35)')}`,
    badgeText: pick('#b91c1c', '#fca5a5'),
    helperText: pick('rgba(71,85,105,0.75)', 'rgba(226,232,240,0.7)')
  };

  const isStackedLayout = isMobile || isSmallScreen;

  const getStatusBadgeStyle = (estado: Docente['estado']): CSSProperties => ({
    display: 'inline-flex',
    padding: '0.45rem 0.95rem',
    borderRadius: '9999px',
    fontSize: '0.78rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    background: estado === 'activo'
      ? pick('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.18)')
      : pick('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.18)'),
    border: `1px solid ${estado === 'activo'
      ? pick('rgba(16,185,129,0.24)', 'rgba(16,185,129,0.32)')
      : pick('rgba(248,113,113,0.24)', 'rgba(248,113,113,0.32)')}`,
    color: estado === 'activo'
      ? pick('#047857', '#34d399')
      : pick('#b91c1c', '#fca5a5')
  });

  const viewSummaryStyles: CSSProperties = {
    background: pick('linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(239,246,255,0.88) 100%)',
      'linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(30,41,59,0.9) 100%)'),
    border: `1px solid ${pick('rgba(191,219,254,0.5)', 'rgba(59,130,246,0.35)')}`,
    borderRadius: 14,
    padding: isMobile ? 16 : 20,
    boxShadow: darkMode ? '0 18px 40px rgba(15,23,42,0.35)' : '0 18px 40px rgba(148,163,184,0.25)'
  };

  const viewSummaryLabelStyle: CSSProperties = {
    color: pick('rgba(30,64,175,0.85)', 'rgba(191,219,254,0.85)'),
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 6
  };

  const viewSectionCardStyles: CSSProperties = {
    background: theme.surface,
    border: `1px solid ${theme.surfaceBorder}`,
    borderRadius: 14,
    padding: isMobile ? 14 : 18,
    boxShadow: darkMode ? '0 18px 32px rgba(15,23,42,0.28)' : '0 14px 28px rgba(148,163,184,0.18)'
  };

  const viewSectionTitleStyle: CSSProperties = {
    color: theme.textPrimary,
    fontWeight: 600,
    fontSize: '0.9rem',
    marginBottom: 12
  };

  const viewContentGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isStackedLayout ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    gap: isMobile ? 12 : 16
  };

  const viewDetailsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isStackedLayout ? '1fr' : 'repeat(2, minmax(0, 1fr))',
    gap: isMobile ? 10 : 12
  };

  const viewLabelStyle: CSSProperties = {
    color: theme.textSecondary,
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: 4
  };

  const viewValueStyle: CSSProperties = {
    color: theme.textPrimary,
    fontWeight: 600,
    fontSize: '0.9rem',
    lineHeight: 1.35
  };

  const viewChipStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '0.4rem 0.75rem',
    borderRadius: '9999px',
    background: theme.chipBg,
    border: `1px solid ${theme.surfaceBorder}`,
    color: theme.textPrimary,
    fontSize: '0.78rem',
    fontWeight: 500
  };

  const credentialCardStyles: CSSProperties = {
    background: pick('rgba(59,130,246,0.08)', 'rgba(30,64,175,0.25)'),
    border: `1px solid ${pick('rgba(59,130,246,0.24)', 'rgba(30,64,175,0.4)')}`,
    borderRadius: 12,
    padding: isMobile ? 14 : 16
  };

  const credentialIconWrapperStyle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: pick('rgba(59,130,246,0.16)', 'rgba(59,130,246,0.28)')
  };

  const credentialHeadingStyle: CSSProperties = {
    color: pick('#1d4ed8', '#bfdbfe'),
    fontWeight: 600,
    fontSize: '0.85rem'
  };

  const credentialHelperStyle: CSSProperties = {
    color: pick('rgba(71,85,105,0.75)', 'rgba(226,232,240,0.72)'),
    fontSize: '0.78rem'
  };

  // Función para obtener docentes
  const fetchDocentes = async () => {
    try {
      setLoading(true);
      setShowLoadingModal(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);

      const response = await fetch(`${API_BASE}/api/docentes?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error cargando docentes');
      }

      const data = await response.json();
      const headerVal = response.headers.get('X-Total-Count');
      const totalHeader = headerVal !== null ? Number(headerVal) : NaN;

      const computedTotal = Number.isFinite(totalHeader) && totalHeader >= 0
        ? totalHeader
        : (typeof data?.total === 'number' ? data.total : (Array.isArray(data) ? data.length : 0));

      setDocentes(Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : []));
      setTotalCount(computedTotal);
    } catch (err: any) {
      setError(err.message || 'Error cargando docentes');
    } finally {
      setLoading(false);
      // Cerrar modal después de un pequeño delay para que se vea
      setTimeout(() => setShowLoadingModal(false), 300);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, [page, limit, searchTerm]);

  const docentesFiltrados = docentes
    .filter(docente => {
      const matchesEstado = filterEstado === 'todos' || docente.estado === filterEstado;
      return matchesEstado;
    })
    .sort((a, b) => {
      // Ordenar por ID (más antiguos primero - los que se registraron primero)
      return a.id_docente - b.id_docente;
    });

  const handleViewDocente = (docente: Docente) => {
    setSelectedDocente(docente);
    setModalMode('view');
    setShowModal(true);
  };

  // Función para generar preview del username
  const generateUsernamePreview = (nombres: string, apellidos: string) => {
    if (!nombres.trim() || !apellidos.trim()) {
      return '';
    }

    try {
      // Extraer iniciales del nombre (todas las palabras)
      const nombreParts = nombres.trim().split(' ').filter(part => part.length > 0);
      const inicialesNombre = nombreParts.map(part => part.charAt(0).toLowerCase()).join('');

      // Extraer primer apellido
      const apellidoParts = apellidos.trim().split(' ').filter(part => part.length > 0);
      const primerApellido = apellidoParts[0]?.toLowerCase() || '';

      // Crear username base
      return inicialesNombre + primerApellido;
    } catch (error) {
      return '';
    }
  };

  // Función para convertir texto a MAYÚSCULAS
  const toUpperCase = (text: string) => {
    return text.toUpperCase();
  };

  // Función para permitir solo números en teléfono
  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, ''); // Elimina todo lo que no sea dígito
  };

  // Función para convertir email a minúsculas
  const formatEmail = (value: string) => {
    return value.toLowerCase();
  };

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

  // Función para manejar cambios en los campos de nombre
  const handleNameChange = (nombres: string, apellidos: string) => {
    const preview = generateUsernamePreview(nombres, apellidos);
    setPreviewUsername(preview);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const formData = new FormData(e.target as HTMLFormElement);

    const docenteData = {
      identificacion: formData.get('identificacion') as string,
      nombres: formData.get('nombres') as string,
      apellidos: formData.get('apellidos') as string,
      fecha_nacimiento: formData.get('fecha_nacimiento') as string || null,
      telefono: formData.get('telefono') as string || null,
      genero: formData.get('genero') as string || null,
      direccion: formData.get('direccion') as string || null,
      titulo_profesional: formData.get('titulo_profesional') as string,
      gmail: formData.get('gmail') as string || null,
      experiencia_anos: parseInt(formData.get('experiencia_anos') as string) || 0,
      estado: formData.get('estado') as string || 'activo'
    };

    try {
      setSubmitting(true);
      setError(null);

      const url = modalMode === 'edit'
        ? `${API_BASE}/api/docentes/${selectedDocente?.id_docente}`
        : `${API_BASE}/api/docentes`;

      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docenteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar docente');
      }

      const result = await response.json();

      const successMessage = modalMode === 'edit'
        ? 'Docente actualizado correctamente.'
        : 'Docente creado exitosamente.';
      showToast.success(successMessage, darkMode);

      if (modalMode === 'create' && result.docente?.username && result.docente?.password_temporal) {
        const credentialsMessage = `Usuario: ${result.docente.username} • Contraseña temporal: ${result.docente.password_temporal}`;
        showToast.info(credentialsMessage, darkMode);
      }

      setShowModal(false);
      setSelectedDocente(null);
      setPreviewUsername('');
      fetchDocentes();
    } catch (err: any) {
      const message = err.message || 'Error al guardar docente';
      const normalizedMessage = normalize(message);
      const isDuplicateId = normalizedMessage.includes('identificacion');

      if (isDuplicateId) {
        setShowModal(false);
        setSelectedDocente(null);
        setPreviewUsername('');
        setError(null);
      } else {
        setError(message);
      }

      showToast.error(message, darkMode);
    } finally {
      setSubmitting(false);
    }
  };

  // const totalPages = Math.ceil(totalCount / limit); // Para uso futuro en paginación

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
      background: theme.background,
      color: theme.textPrimary,
      transition: 'background 0.3s ease, color 0.3s ease',
      '--admin-card-bg': theme.cardBackground,
      '--admin-text-primary': theme.textPrimary,
      '--admin-text-secondary': theme.textSecondary,
      '--admin-text-muted': theme.textMuted,
      '--admin-input-bg': theme.inputBg,
      '--admin-input-border': theme.inputBorder,
      '--admin-input-text': theme.textPrimary,
      '--admin-border': theme.surfaceBorder,
      '--admin-bg-secondary': theme.surface,
      '--admin-table-header-bg': theme.tableHeaderBg
    } as CSSProperties}>
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Docentes"
        subtitle="Administra y visualiza la información de todos los docentes registrados"
      />

      {/* Controles */}
      <GlassEffect variant="card" tint="neutral" intensity="light" style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem',
            alignItems: isMobile ? 'stretch' : 'center',
            flex: 1
          }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', minWidth: isMobile ? 'auto' : '17.5rem', flex: isMobile ? '1' : 'initial' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: theme.inputIcon }} />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar por nombre, apellido, identificación..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 0.625rem 0.625rem 2.375rem',
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '0.625rem',
                  color: theme.textPrimary,
                  fontSize: '0.8rem',
                  transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: darkMode ? '0 0.35rem 1rem rgba(15,23,42,0.08)' : '0 0.25rem 0.75rem rgba(15,23,42,0.08)'
                }}
              />
            </div>

            {/* Filtros */}
            <div style={{ minWidth: isMobile ? 'auto' : 'min(12.5rem, 25vw)', flex: isMobile ? '1' : 'initial' }}>
              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => setFilterEstado(event.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activos' },
                  { value: 'inactivo', label: 'Inactivos' }
                ]}
              />
            </div>

            {/* Toggle Vista */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              background: toggleGroupBg,
              borderRadius: '0.625rem',
              padding: '0.1875rem',
              width: isSmallScreen ? '100%' : 'auto'
            }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3125rem',
                  padding: isMobile ? '8px 0.75rem' : '9px 1rem',
                  background: isCardsView ? toggleActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: isCardsView ? toggleActiveText : toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <Grid size={16} color={isCardsView ? toggleActiveText : toggleInactiveText} /> {!isMobile && 'Tarjetas'}
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: isMobile ? '8px 0.75rem' : '9px 1rem',
                  background: isTableView ? toggleActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: isTableView ? toggleActiveText : toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.875rem' : '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <List size={16} color={isTableView ? toggleActiveText : toggleInactiveText} /> {!isMobile && 'Tabla'}
              </button>
            </div>
          </div>

          {/* Botón Crear */}
          <button
            onClick={() => {
              setSelectedDocente(null);
              setModalMode('create');
              setPreviewUsername('');
              setShowModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: isMobile ? '10px 1rem' : '12px 1.5rem',
              background: theme.buttonPrimaryBg,
              border: 'none',
              borderRadius: '0.625rem',
              color: theme.buttonPrimaryText,
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: pick('0 0.35rem 0.85rem rgba(239,68,68,0.25)', '0 0.35rem 0.85rem rgba(239,68,68,0.4)'),
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Plus size={16} color={theme.buttonPrimaryText} />
            Nuevo Docente
          </button>
        </div>
      </GlassEffect>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(8.75rem, 45vw), 1fr))', gap: '0.75em', marginBottom: '1em' }}>
        <GlassEffect variant="card" tint="red" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: RedColorPalette.primary, marginBottom: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: '0.7rem' }}>
            Total Docentes
          </div>
        </GlassEffect>

        <GlassEffect variant="card" tint="success" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: mapToRedScheme('#10b981'), marginBottom: '0.25rem' }}>
            {docentes.filter(d => d.estado === 'activo').length}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: '0.7rem' }}>
            Docentes Activos
          </div>
        </GlassEffect>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75em',
          padding: '1em',
          marginBottom: '1.5em',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(17.5rem, 90vw), 1fr))', gap: '1em', marginBottom: '1.125em' }}>
          {docentesFiltrados.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '2.5em 1.25em', textAlign: 'center', color: theme.textMuted, fontSize: '0.85rem' }}>
              {loading ? 'Cargando docentes...' : 'No hay docentes registrados'}
            </div>
          ) : (
            docentesFiltrados.map((docente) => (
              <div
                key={docente.id_docente}
                style={{
                  background: theme.cardBackground,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: '0.75rem',
                  padding: '0.875rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: pick('0 0.35rem 1rem rgba(15,23,42,0.08)', 'none')
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = pick('0 0.75rem 1.75rem rgba(15,23,42,0.12)', '0 0.75rem 1.75rem rgba(239, 68, 68, 0.25)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = pick('0 0.35rem 1rem rgba(15,23,42,0.08)', 'none');
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.375rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      color: theme.badgeText,
                      fontSize: '0.7rem',
                      background: theme.badgeBg,
                      padding: '3px 0.5rem',
                      borderRadius: '0.3125rem',
                      border: `1px solid ${theme.surfaceBorder}`
                    }}>
                      <Mail size={14} color={theme.badgeText} />
                      <span>{docente.gmail || 'Sin correo'}</span>
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
                      background: docente.estado === 'activo' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: docente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                      color: docente.estado === 'activo' ? '#10b981' : RedColorPalette.primary
                    }}>
                      {docente.estado}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <UserAvatar
                      userId={docente.id_usuario || 0}
                      nombre={docente.nombres}
                      apellido={docente.apellidos}
                      size={2}
                      showBorder={true}
                      borderColor={pick('rgba(148,163,184,0.35)', 'rgba(239, 68, 68, 0.3)')}
                      fotoUrl={docente.foto_perfil}
                    />
                    <h3 style={{
                      color: theme.textPrimary,
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}>
                      {docente.nombres} {docente.apellidos}
                    </h3>
                  </div>
                </div>

                <div style={{
                  paddingTop: '0.625rem',
                  borderTop: `1px solid ${theme.divider}`,
                  marginBottom: '0.875rem'
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Cédula
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.identificacion}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Usuario
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.username || 'Sin usuario'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Título
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.titulo_profesional}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.65rem', marginBottom: '0.1875rem' }}>
                        Experiencia
                      </div>
                      <div style={{ color: theme.textPrimary, fontSize: '0.75rem', fontWeight: 600 }}>
                        {docente.experiencia_anos} años
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  borderTop: `1px solid ${theme.divider}`,
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    onClick={() => handleViewDocente(docente)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '6px 0.75rem',
                      background: theme.infoPanelBg,
                      border: `1px solid ${theme.infoPanelBorder}`,
                      borderRadius: '0.5rem',
                      color: viewDetailsColor,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = pick('rgba(59,130,246,0.18)', 'rgba(59,130,246,0.25)');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.infoPanelBg;
                    }}
                  >
                    <Eye size={12} color={viewDetailsColor} /> Ver Detalles
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <div style={{
          background: theme.tableWrapperBg,
          borderRadius: '1em',
          overflow: 'hidden',
          border: `0.0625rem solid ${theme.tableWrapperBorder}`,
          marginBottom: '1.5em',
          boxShadow: pick('0 0.75rem 2rem rgba(15,23,42,0.08)', '0 0.75rem 2.25rem rgba(15,15,35,0.35)')
        }}>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5em',
              padding: '0.5em 0.75em',
              margin: '0.75em',
              color: '#ef4444',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375em'
            }}>
              <ChevronRight size={16} />
              <span>Desliza horizontalmente para ver toda la tabla</span>
              <ChevronLeft size={16} />
            </div>
          )}

          <div className="responsive-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: theme.tableHeaderBg,
                  borderBottom: `0.0625rem solid ${theme.tableWrapperBorder}`
                }}>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                      <User size={14} />
                      Docente
                    </div>
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Identificación
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Usuario
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Título Profesional
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'center', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'left', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Experiencia
                  </th>
                  <th style={{ padding: '0.625em 0.75em', textAlign: 'center', color: theme.tableHeaderText, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2.5rem', textAlign: 'center', color: theme.textMuted }}>
                      {loading ? 'Cargando docentes...' : 'No hay docentes registrados'}
                    </td>
                  </tr>
                ) : (
                  docentesFiltrados.map((docente, index) => (
                    <tr
                      key={docente.id_docente}
                      style={{
                        borderBottom: `0.0625rem solid ${theme.divider}`,
                        background: index % 2 === 0 ? theme.tableRowAlt : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = pick('rgba(248,113,113,0.12)', 'rgba(248,113,113,0.18)');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? theme.tableRowAlt : 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                          <UserAvatar
                            userId={docente.id_usuario || docente.id_docente}
                            nombre={docente.nombres}
                            apellido={docente.apellidos}
                            size={2}
                            showBorder={true}
                            borderColor={pick('rgba(148,163,184,0.35)', 'rgba(239, 68, 68, 0.3)')}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: theme.textPrimary, fontSize: '0.85rem' }}>
                              {docente.nombres} {docente.apellidos}
                            </div>
                            {docente.telefono && (
                              <div style={{ color: theme.textSecondary, fontSize: '0.7rem' }}>
                                {docente.telefono}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: theme.tableText, fontSize: '0.8rem' }}>
                        {docente.identificacion}
                      </td>
                      <td style={{ padding: '0.75rem', color: theme.tableText, fontSize: '0.8rem' }}>
                        {docente.username ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <User size={12} color={mapToRedScheme('#60a5fa')} />
                            <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>
                              {docente.username}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: theme.textMuted, fontSize: '0.7rem' }}>
                            Sin usuario
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', color: theme.tableText, fontSize: '0.8rem' }}>
                        {docente.titulo_profesional}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 0.625rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: docente.estado === 'activo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          border: docente.estado === 'activo' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                          color: docente.estado === 'activo' ? '#10b981' : '#9ca3af'
                        }}>
                          {docente.estado}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', color: theme.tableText, fontSize: '0.8rem' }}>
                        {docente.experiencia_anos} años
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewDocente(docente)}
                            style={{
                              background: theme.infoPanelBg,
                              border: `0.0625rem solid ${theme.infoPanelBorder}`,
                              color: viewDetailsColor,
                              padding: '0.375em 0.625em',
                              borderRadius: '0.375em',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = pick('rgba(59,130,246,0.22)', 'rgba(59,130,246,0.3)');
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.infoPanelBg;
                            }}
                          >
                            <Eye size={12} color={viewDetailsColor} />
                            Ver
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDocente(docente);
                              setModalMode('edit');
                              setShowModal(true);
                            }}
                            style={{
                              background: pick('rgba(245,158,11,0.18)', 'rgba(245,158,11,0.22)'),
                              border: `0.0625rem solid ${pick('rgba(245,158,11,0.25)', 'rgba(245,158,11,0.35)')}`,
                              color: editButtonTextColor,
                              padding: '0.375em 0.625em',
                              borderRadius: '0.375em',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = pick('rgba(245,158,11,0.24)', 'rgba(245,158,11,0.32)');
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = pick('rgba(245,158,11,0.18)', 'rgba(245,158,11,0.22)');
                            }}
                          >
                            <Edit size={12} color={editButtonTextColor} />
                            Editar
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
      )}

      {/* Paginación */}
      {!loading && docentesFiltrados.length > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '16px' : '20px 1.5rem',
          background: theme.cardBackground,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: '1rem',
          boxShadow: pick('0 0.5rem 1.5rem rgba(15,23,42,0.08)', '0 0.5rem 1.75rem rgba(15,15,35,0.32)')
        }}>
          <div style={{
            color: theme.textSecondary,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {Math.ceil(totalCount / limit)} • Total: {totalCount} docentes
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
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
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: page === 1 ? pick('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.05)') : theme.toggleBg,
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: '0.625rem',
                color: page === 1 ? theme.textMuted : theme.textPrimary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1' : 'initial'
              }}
            >
              <ChevronLeft size={isMobile ? 14 : 16} />
              {!isMobile && 'Anterior'}
            </button>
            {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                  background: page === pageNum ? theme.buttonPrimaryBg : theme.toggleBg,
                  border: page === pageNum ? `1px solid ${RedColorPalette.primary}` : `1px solid ${theme.surfaceBorder}`,
                  borderRadius: '0.625rem',
                  color: page === pageNum ? theme.buttonPrimaryText : theme.textPrimary,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: isMobile ? '36px' : '2.5rem',
                  boxShadow: page === pageNum ? pick('0 0.35rem 0.85rem rgba(239,68,68,0.18)', '0 0.35rem 0.85rem rgba(239,68,68,0.28)') : 'none'
                }}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(totalCount / limit), p + 1))}
              disabled={page === Math.ceil(totalCount / limit)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                background: page === Math.ceil(totalCount / limit) ? pick('rgba(226,232,240,0.7)', 'rgba(255,255,255,0.05)') : theme.toggleBg,
                border: `1px solid ${theme.surfaceBorder}`,
                borderRadius: '0.625rem',
                color: page === Math.ceil(totalCount / limit) ? theme.textMuted : theme.textPrimary,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === Math.ceil(totalCount / limit) ? 'not-allowed' : 'pointer',
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

      {/* Modal */}
      {showModal && createPortal(
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
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              width: isMobile ? '92vw' : '50rem',
              maxWidth: isMobile ? '92vw' : '50rem',
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
            {/* Header del Modal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.125rem',
              paddingBottom: '0.875rem',
              borderBottom: `1px solid ${theme.divider}`,
            }}>
              <h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em' }}>
                <UserCheck size={20} />
                {modalMode === 'view' ? 'Información del Docente' :
                  modalMode === 'create' ? 'Crear Nuevo Docente' : 'Editar Docente'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: theme.toggleBg,
                  border: `1px solid ${theme.surfaceBorder}`,
                  borderRadius: '0.5rem',
                  padding: '0.375rem',
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = pick('rgba(252,165,165,0.35)', 'rgba(239,68,68,0.25)');
                  e.currentTarget.style.borderColor = pick('rgba(248,113,113,0.3)', 'rgba(239,68,68,0.45)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.toggleBg;
                  e.currentTarget.style.borderColor = theme.surfaceBorder;
                }}
              >
                <X size={18} />
              </button>
            </div>

            {modalMode === 'view' && selectedDocente ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 16 }}>
                <div style={viewSummaryStyles}>
                  <div style={{
                    display: 'flex',
                    flexDirection: isStackedLayout ? 'column' : 'row',
                    gap: isStackedLayout ? 12 : 20,
                    alignItems: isStackedLayout ? 'flex-start' : 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={viewSummaryLabelStyle}>Docente</div>
                      <div style={{
                        fontSize: isStackedLayout ? '1.35rem' : '1.5rem',
                        fontWeight: 700,
                        color: theme.textPrimary,
                        lineHeight: 1.2
                      }}>
                        {`${selectedDocente.nombres} ${selectedDocente.apellidos}`}
                      </div>
                      <div style={{ marginTop: 6, color: theme.textSecondary, fontSize: '0.85rem' }}>
                        {selectedDocente.titulo_profesional}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      alignItems: isStackedLayout ? 'flex-start' : 'flex-end'
                    }}>
                      <span style={getStatusBadgeStyle(selectedDocente.estado)}>
                        {selectedDocente.estado}
                      </span>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        justifyContent: isStackedLayout ? 'flex-start' : 'flex-end'
                      }}>
                        <div style={viewChipStyle}>
                          <span style={{ fontWeight: 600 }}>ID</span>
                          <span>{selectedDocente.identificacion}</span>
                        </div>
                        <div style={viewChipStyle}>
                          <span style={{ fontWeight: 600 }}>Experiencia</span>
                          <span>{selectedDocente.experiencia_anos} años</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedDocente.username || selectedDocente.password_temporal) && (
                  <div style={credentialCardStyles}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: 12 }}>
                      <div style={credentialIconWrapperStyle}>
                        <Lock size={18} color={pick('#1d4ed8', '#bfdbfe')} />
                      </div>
                      <div>
                        <div style={credentialHeadingStyle}>Credenciales de acceso</div>
                        <div style={credentialHelperStyle}>Comparte estos datos con el docente al momento de su incorporación.</div>
                      </div>
                    </div>
                    <div style={viewDetailsGridStyle}>
                      {selectedDocente.username && (
                        <div>
                          <div style={viewLabelStyle}>Usuario</div>
                          <div style={viewValueStyle}>{selectedDocente.username}</div>
                        </div>
                      )}
                      {selectedDocente.password_temporal && (
                        <div>
                          <div style={viewLabelStyle}>Contraseña temporal</div>
                          <div style={viewValueStyle}>{selectedDocente.password_temporal}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={viewContentGridStyle}>
                  <div style={viewSectionCardStyles}>
                    <div style={viewSectionTitleStyle}>Información personal</div>
                    <div style={viewDetailsGridStyle}>
                      <div>
                        <div style={viewLabelStyle}>Título profesional</div>
                        <div style={viewValueStyle}>{selectedDocente.titulo_profesional}</div>
                      </div>
                      {selectedDocente.fecha_nacimiento && (
                        <div>
                          <div style={viewLabelStyle}>Fecha de nacimiento</div>
                          <div style={viewValueStyle}>{formatDate(selectedDocente.fecha_nacimiento)}</div>
                        </div>
                      )}
                      {selectedDocente.genero && (
                        <div>
                          <div style={viewLabelStyle}>Género</div>
                          <div style={{ ...viewValueStyle, textTransform: 'capitalize' }}>{selectedDocente.genero}</div>
                        </div>
                      )}
                      {selectedDocente.direccion && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <div style={viewLabelStyle}>Dirección</div>
                          <div style={viewValueStyle}>{selectedDocente.direccion}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={viewSectionCardStyles}>
                    <div style={viewSectionTitleStyle}>Contacto</div>
                    <div style={{ ...viewDetailsGridStyle, gridTemplateColumns: '1fr' }}>
                      {selectedDocente.telefono && (
                        <div>
                          <div style={viewLabelStyle}>Teléfono</div>
                          <div style={{ ...viewValueStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={16} color={pick('#059669', '#34d399')} />
                            <span>{selectedDocente.telefono}</span>
                          </div>
                        </div>
                      )}
                      {selectedDocente.gmail && (
                        <div>
                          <div style={viewLabelStyle}>Email</div>
                          <div style={{ ...viewValueStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Mail size={16} color={pick('#1d4ed8', '#93c5fd')} />
                            <span>{selectedDocente.gmail}</span>
                          </div>
                        </div>
                      )}
                      {!selectedDocente.telefono && !selectedDocente.gmail && (
                        <div>
                          <div style={viewLabelStyle}>Sin datos de contacto</div>
                          <div style={viewValueStyle}>Añade teléfono o correo desde la edición del docente.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Formulario de Crear/Editar */
              <form onSubmit={handleSubmit}>
                {modalMode === 'create' && (
                  <div style={{
                    background: infoBannerStyles.background,
                    border: infoBannerStyles.border,
                    borderRadius: 10,
                    padding: isMobile ? 12 : 14,
                    marginBottom: 20
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: infoBannerStyles.iconBackground,
                        flexShrink: 0
                      }}>
                        <Info size={18} color={infoBannerStyles.iconColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: infoBannerStyles.titleColor,
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          marginBottom: 4
                        }}>
                          Credenciales automáticas
                        </div>
                        <div style={{
                          color: infoBannerStyles.descriptionColor,
                          fontSize: '0.78rem',
                          lineHeight: 1.4
                        }}>
                          El sistema generará automáticamente un username único (iniciales + apellido) y usará la identificación como contraseña temporal.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: isMobile ? 8 : 10,
                  marginBottom: isMobile ? 10 : 12
                }}>
                  {/* Identificación */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Identificación *
                    </label>
                    <input
                      type="text"
                      name="identificacion"
                      required
                      defaultValue={selectedDocente?.identificacion || ''}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Nombres */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Nombres *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      required
                      defaultValue={selectedDocente?.nombres || ''}
                      onChange={(e) => {
                        // Aplicar formato MAYÚSCULAS automáticamente
                        const formattedValue = toUpperCase(e.target.value);
                        e.target.value = formattedValue;

                        const apellidosInput = document.querySelector('input[name="apellidos"]') as HTMLInputElement;
                        handleNameChange(formattedValue, apellidosInput?.value || '');
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Apellidos */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      required
                      defaultValue={selectedDocente?.apellidos || ''}
                      onChange={(e) => {
                        // Aplicar formato MAYÚSCULAS automáticamente
                        const formattedValue = toUpperCase(e.target.value);
                        e.target.value = formattedValue;

                        const nombresInput = document.querySelector('input[name="nombres"]') as HTMLInputElement;
                        handleNameChange(nombresInput?.value || '', formattedValue);
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Título Profesional */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Título Profesional *
                    </label>
                    <input
                      type="text"
                      name="titulo_profesional"
                      required
                      defaultValue={selectedDocente?.titulo_profesional || ''}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="gmail"
                      defaultValue={selectedDocente?.gmail || ''}
                      onChange={(e) => {
                        // Convertir automáticamente a minúsculas
                        const formattedValue = formatEmail(e.target.value);
                        e.target.value = formattedValue;
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      defaultValue={selectedDocente?.telefono || ''}
                      onChange={(e) => {
                        // Permitir solo números
                        const formattedValue = formatPhoneNumber(e.target.value);
                        e.target.value = formattedValue;
                      }}
                      onKeyPress={(e) => {
                        // Prevenir entrada de caracteres no numéricos
                        if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="fecha_nacimiento"
                      defaultValue={selectedDocente?.fecha_nacimiento || ''}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                  {/* Género */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Género
                    </label>
                    <select
                      name="genero"
                      defaultValue={selectedDocente?.genero || ''}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="" style={selectOptionStyle}>Seleccionar</option>
                      <option value="masculino" style={selectOptionStyle}>Masculino</option>
                      <option value="femenino" style={selectOptionStyle}>Femenino</option>
                      <option value="otro" style={selectOptionStyle}>Otro</option>
                    </select>
                  </div>

                  {/* Experiencia */}
                  <div>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Experiencia (años)
                    </label>
                    <input
                      type="number"
                      name="experiencia_anos"
                      min="0"
                      defaultValue={selectedDocente?.experiencia_anos || 0}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>

                </div>

                {/* Estado y Dirección */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'minmax(160px, 0.35fr) 1fr',
                  gap: isMobile ? 8 : 12,
                  marginBottom: isMobile ? 10 : 12,
                  alignItems: 'stretch'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Estado
                    </label>
                    <select
                      name="estado"
                      defaultValue={selectedDocente?.estado || 'activo'}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem',
                        minHeight: isMobile ? 40 : 44
                      }}
                    >
                      <option value="activo" style={selectOptionStyle}>Activo</option>
                      <option value="inactivo" style={selectOptionStyle}>Inactivo</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gridColumn: isMobile ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', marginBottom: 5, color: 'var(--admin-text-secondary, rgba(255,255,255,0.8))', fontSize: '0.8rem' }}>
                      Dirección
                    </label>
                    <textarea
                      name="direccion"
                      rows={isMobile ? 3 : 2}
                      defaultValue={selectedDocente?.direccion || ''}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--admin-border, rgba(255,255,255,0.2))',
                        background: 'var(--admin-input-bg, rgba(255,255,255,0.1))',
                        color: 'var(--admin-text-primary, #fff)',
                        fontSize: '0.8rem',
                        resize: 'vertical',
                        minHeight: isMobile ? 88 : 56
                      }}
                    />
                  </div>
                </div>

                {/* Usuario Generado - Solo en modo crear */}
                {modalMode === 'create' && previewUsername && (
                  <div style={{
                    marginTop: 12,
                    background: autoUsernameStyles.background,
                    border: autoUsernameStyles.border,
                    borderRadius: 10,
                    padding: 12
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: 8,
                      color: autoUsernameStyles.headingColor,
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}>
                      <div style={{
                        width: 30,
                        height: 30,
                        borderRadius: '9999px',
                        background: autoUsernameStyles.badgeBackground,
                        border: autoUsernameStyles.badgeBorder,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <User size={16} color={autoUsernameStyles.iconColor} />
                      </div>
                      <span style={{ flex: 1 }}>Usuario generado automáticamente</span>
                    </div>
                    <div style={{
                      color: autoUsernameStyles.badgeText,
                      fontSize: '1rem',
                      fontWeight: 700,
                      background: autoUsernameStyles.badgeBackground,
                      padding: '6px 0.625rem',
                      borderRadius: '0.375rem',
                      border: autoUsernameStyles.badgeBorder,
                      display: 'inline-block'
                    }}>
                      {previewUsername}
                    </div>
                    <div style={{
                      color: autoUsernameStyles.helperText,
                      fontSize: '0.7rem',
                      marginTop: 6
                    }}>
                      Generado a partir de las iniciales del nombre + primer apellido
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    color: '#ef4444',
                    fontSize: '0.8rem'
                  }}>
                    {error}
                  </div>
                )}

                {/* Botones */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column-reverse' : 'row',
                  gap: 12,
                  justifyContent: 'flex-end',
                  marginTop: 20
                }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'rgba(156, 163, 175, 0.15)',
                      border: '1px solid rgba(156, 163, 175, 0.3)',
                      color: '#9ca3af',
                      padding: '10px 1.25rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: submitting ? 'rgba(239, 68, 68, 0.35)' : theme.buttonPrimaryBg,
                      border: `1px solid ${mapToRedScheme('rgba(239, 68, 68, 0.35)')}`,
                      color: submitting ? 'rgba(255,255,255,0.65)' : theme.buttonPrimaryText,
                      padding: '10px 1.25rem',
                      borderRadius: '0.5rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: isMobile ? '100%' : 'auto'
                    }}
                  >
                    {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear Docente' : 'Actualizar')}
                  </button>
                </div>
              </form>
            )}

            {/* Botón Cerrar solo para vista */}
            {modalMode === 'view' && (
              <div style={{ marginTop: isMobile ? 20 : 24, textAlign: isMobile ? 'center' : 'right' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: isMobile ? '100%' : 'auto',
                    background: 'rgba(156, 163, 175, 0.15)',
                    border: '1px solid rgba(156, 163, 175, 0.3)',
                    color: '#9ca3af',
                    padding: '10px 1.25rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}
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
      )}

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

export default GestionDocentes;




