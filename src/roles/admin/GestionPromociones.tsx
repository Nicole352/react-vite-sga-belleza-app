import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Edit, Trash2, X, Save, Gift, Search, Grid, List, ChevronLeft, ChevronRight,
  Users, BookOpen, CheckCircle, XCircle, Sparkles, FileText
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { showToast } from '../../config/toastConfig';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

type Promocion = {
  id_promocion: number;
  id_curso_principal: number;
  id_curso_promocional: number;
  nombre_promocion: string;
  descripcion?: string;
  meses_gratis?: number;
  clases_gratis?: number;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  activa: boolean;
  cupos_disponibles?: number | null;
  cupos_utilizados?: number;
  created_at?: string;
  
  // Datos del curso principal (JOIN)
  nombre_curso_principal?: string;
  codigo_curso_principal?: string;
  horario_principal?: 'matutino' | 'vespertino';
  capacidad_curso_principal?: number;
  cupos_curso_principal?: number;
  modalidad_principal?: 'mensual' | 'clases';
  
  // Datos del curso promocional (JOIN)
  nombre_curso_promocional?: string;
  codigo_curso_promocional?: string;
  horario_promocional?: 'matutino' | 'vespertino';
  capacidad_curso_promocional?: number;
  cupos_curso_promocional?: number;
  modalidad_promocional?: 'mensual' | 'clases';
  precio_base?: number;
  precio_por_clase?: number;
  
  // Estadísticas
  total_aceptaciones?: number;
  total_matriculados?: number;
};

type Curso = {
  id_curso: number;
  nombre: string;
  codigo_curso: string;
  modalidad_pago?: 'mensual' | 'clases';
  precio_base?: number;
  precio_por_clase?: number;
  estado: string;
  id_tipo_curso: number;
};

type ThemeVars = CSSProperties & {
  '--admin-card-bg'?: string;
  '--admin-input-bg'?: string;
  '--admin-input-border'?: string;
  '--admin-input-text'?: string;
  '--admin-input-icon'?: string;
  '--admin-text-primary'?: string;
  '--admin-text-secondary'?: string;
  '--admin-text-muted'?: string;
  '--admin-border'?: string;
  '--admin-divider'?: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionPromociones: React.FC = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Promocion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Promocion | null>(null);

  // Estados para búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiva, setFilterActiva] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detectar modo oscuro desde localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Escuchar cambios en el modo oscuro
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem('admin-dark-mode');
      const newMode = saved !== null ? JSON.parse(saved) : true;
      if (newMode !== darkMode) {
        setDarkMode(newMode);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [darkMode]);

  const pick = <T,>(light: T, dark: T): T => (darkMode ? dark : light);

  const theme = {
    pageBackground: pick(
      'linear-gradient(135deg, rgba(248,250,252,0.96) 0%, rgba(255,255,255,0.98) 100%)',
      'linear-gradient(135deg, rgba(10,10,18,0.92) 0%, rgba(17,17,27,0.92) 100%)'
    ),
    contentBackground: pick(
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)',
      'linear-gradient(135deg, rgba(13,13,25,0.92) 0%, rgba(26,26,46,0.92) 100%)'
    ),
    surfaceShadow: pick('0 28px 55px rgba(15,23,42,0.18)', '0 28px 55px rgba(0,0,0,0.45)'),
    textPrimary: pick('#0f172a', 'rgba(255,255,255,0.95)'),
    textSecondary: pick('rgba(71,85,105,0.78)', 'rgba(226,232,240,0.74)'),
    textMuted: pick('rgba(100,116,139,0.6)', 'rgba(148,163,184,0.6)'),
    accentText: '#ef4444',
    inputBg: pick('rgba(255,255,255,0.96)', 'rgba(255,255,255,0.08)'),
    inputBorder: pick('rgba(148,163,184,0.28)', 'rgba(255,255,255,0.12)'),
    inputText: pick('#0f172a', '#f8fafc'),
    inputIcon: pick('rgba(100,116,139,0.7)', 'rgba(255,255,255,0.4)'),
    controlGroupBg: pick('rgba(255,255,255,0.85)', 'rgba(255,255,255,0.05)'),
    controlGroupBorder: pick('rgba(148,163,184,0.32)', 'rgba(255,255,255,0.1)'),
    controlInactiveText: pick('rgba(71,85,105,0.68)', 'rgba(255,255,255,0.6)'),
    controlActiveBg: pick('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.2)'),
    controlActiveBorder: pick('rgba(239,68,68,0.25)', 'rgba(239,68,68,0.4)'),
    cardBackground: pick(
      'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
      'linear-gradient(135deg, rgba(10,10,25,0.92) 0%, rgba(20,20,36,0.92) 100%)'
    ),
    cardBorderActive: pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.32)'),
    cardBorderInactive: pick('rgba(148,163,184,0.26)', 'rgba(255,255,255,0.12)'),
    cardShadow: pick('0 20px 40px rgba(15,23,42,0.12)', '0 18px 38px rgba(0,0,0,0.45)'),
    cardHoverShadow: pick('0 24px 50px rgba(239,68,68,0.18)', '0 24px 50px rgba(239,68,68,0.28)'),
    badgeActiveBg: pick('rgba(16,185,129,0.12)', 'rgba(16,185,129,0.18)'),
    badgeActiveBorder: pick('rgba(16,185,129,0.28)', 'rgba(16,185,129,0.35)'),
    badgeInactiveBg: pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.18)'),
    badgeInactiveBorder: pick('rgba(239,68,68,0.28)', 'rgba(239,68,68,0.35)'),
    divider: pick('rgba(148,163,184,0.22)', 'rgba(255,255,255,0.12)'),
    paginationBg: pick('rgba(255,255,255,0.96)', 'rgba(255,255,255,0.08)'),
    paginationBorder: pick('rgba(148,163,184,0.28)', 'rgba(255,255,255,0.12)'),
    paginationText: pick('rgba(15,23,42,0.85)', 'rgba(255,255,255,0.8)'),
    overlay: pick('rgba(248,250,252,0.65)', 'rgba(0,0,0,0.65)'),
    modalBorder: pick('rgba(239,68,68,0.18)', 'rgba(239,68,68,0.24)'),
    modalDivider: pick('rgba(148,163,184,0.2)', 'rgba(255,255,255,0.1)')
  };

  const accentGradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  const benefitTokens = {
    background: pick('linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.1) 100%)', 'linear-gradient(135deg, rgba(239,68,68,0.22) 0%, rgba(220,38,38,0.18) 100%)'),
    border: pick('1px solid rgba(239,68,68,0.22)', '1px solid rgba(239,68,68,0.3)'),
    title: '#ef4444'
  } as const;

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: 5,
    color: theme.textPrimary,
    fontWeight: 500,
    fontSize: '0.8rem'
  } as const;

  const fieldInputStyle = {
    width: '100%',
    padding: '7px 10px',
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 6,
    color: theme.inputText,
    fontSize: '0.8rem',
    transition: 'all 0.2s ease'
  } as const;

  // Estados del formulario
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);

  // Helper: formato de precio
  const formatPrice = (v?: number | null) => {
    if (v === null || v === undefined || isNaN(Number(v))) return '-';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(v));
  };

  // Obtener curso seleccionado
  const cursoSeleccionado = useMemo(() => {
    return cursos.find(c => c.id_curso === selectedCursoId) || null;
  }, [cursos, selectedCursoId]);

  // Filtrado y paginación
  const filteredPromociones = useMemo(() => {
    let result = promociones;

    // Filtro por activa/inactiva
    if (filterActiva === 'activas') result = result.filter(p => p.activa);
    if (filterActiva === 'inactivas') result = result.filter(p => !p.activa);

    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nombre_promocion.toLowerCase().includes(term) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(term)) ||
        (p.nombre_curso_principal && p.nombre_curso_principal.toLowerCase().includes(term)) ||
        (p.nombre_curso_promocional && p.nombre_curso_promocional.toLowerCase().includes(term))
      );
    }

    return result;
  }, [promociones, filterActiva, searchTerm]);

  const totalPages = Math.ceil(filteredPromociones.length / itemsPerPage);
  const paginatedPromociones = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPromociones.slice(start, start + itemsPerPage);
  }, [filteredPromociones, currentPage, itemsPerPage]);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterActiva]);

  // Cargar datos iniciales
  const fetchPromociones = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/promociones`);

      if (res.status === 401) {
        throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
      }

      if (res.status === 403) {
        throw new Error('No tienes permisos para ver promociones. Verifica tu rol de usuario.');
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'No se pudo cargar las promociones');
      }
      
      const data = await res.json();
      setPromociones(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error('Error cargando promociones:', e);
      const message = e.message || 'Error cargando promociones';
      setError(message);
      showToast.error(message, darkMode);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cursos?limit=500`);
      if (!res.ok) throw new Error('No se pudo cargar los cursos');
      const data = await res.json();
      
      // Filtrar solo cursos activos
      const cursosList = Array.isArray(data) ? data : [];
      setCursos(cursosList.filter((c: Curso) => c.estado === 'activo'));
    } catch (e: any) {
      console.error('Error cargando cursos:', e);
      showToast.error('Error cargando cursos', darkMode);
    }
  };

  useEffect(() => {
    fetchPromociones();
    fetchCursos();
  }, []);

  const openCreate = () => {
    setSelected(null);
    setSelectedCursoId(null);
    setModalType('create');
    setShowModal(true);
  };

  const openEdit = (p: Promocion) => {
    setSelected(p);
    setSelectedCursoId(p.id_curso_promocional);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/promociones/${deleteTarget.id_promocion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('No se pudo eliminar la promoción');

      setPromociones(prev => prev.filter(p => p.id_promocion !== deleteTarget.id_promocion));
      showToast.deleted('Promoción eliminada exitosamente', darkMode);
      setDeleteTarget(null);
    } catch (e: any) {
      showToast.error(e.message || 'Error eliminando promoción', darkMode);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleActiva = async (id: number, activa: boolean) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      
      const res = await fetch(`${API_BASE}/api/promociones/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activa: !activa })
      });

      if (!res.ok) throw new Error('No se pudo cambiar el estado');
      
      showToast.success(activa ? 'Promoción desactivada' : 'Promoción activada', darkMode);
      await fetchPromociones();
    } catch (e: any) {
      showToast.error(e.message || 'Error al cambiar estado', darkMode);
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Validaciones
    const id_curso_principal = Number(fd.get('id_curso_principal'));
    const id_curso_promocional = Number(fd.get('id_curso_promocional'));

    if (!id_curso_principal || !id_curso_promocional) {
      showToast.error('Selecciona ambos cursos (principal y promocional)', darkMode);
      return;
    }

    if (!selectedCursoId) {
      showToast.error('Selecciona el curso promocional', darkMode);
      return;
    }

    const curso = cursos.find(c => c.id_curso === selectedCursoId);
    const modalidad = curso?.modalidad_pago || 'mensual';

    // Construir payload según modalidad
    const payload: any = {
      id_curso_principal,
      id_curso_promocional,
      nombre_promocion: String(fd.get('nombre_promocion') || '').trim(),
      descripcion: String(fd.get('descripcion') || '').trim(),
      activa: fd.get('activa') === 'true',
      cupos_disponibles: fd.get('cupos_disponibles') ? Number(fd.get('cupos_disponibles')) : null
    };

    if (modalidad === 'mensual') {
      payload.meses_gratis = Number(fd.get('meses_gratis') || 1);
      payload.clases_gratis = null;
    } else {
      payload.clases_gratis = Number(fd.get('clases_gratis') || 1);
      payload.meses_gratis = null;
    }

    if (!payload.nombre_promocion) {
      showToast.error('El nombre de la promoción es obligatorio', darkMode);
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const url = modalType === 'create'
        ? `${API_BASE}/api/promociones`
        : `${API_BASE}/api/promociones/${selected?.id_promocion}`;
      
      const method = modalType === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al guardar promoción');
      }

      const updatedPromoId = modalType === 'edit' ? selected?.id_promocion || null : null;

      const successMessage = modalType === 'create'
        ? 'Promoción creada exitosamente'
        : 'Promoción actualizada exitosamente';

      setShowModal(false);

      requestAnimationFrame(() => {
        showToast.success(successMessage, darkMode);
      });

      await fetchPromociones();

      if (updatedPromoId) {
        requestAnimationFrame(() => {
          const card = document.getElementById(`promo-card-${updatedPromoId}`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const element = card as HTMLElement;
            const originalBoxShadow = element.style.boxShadow;
            const originalTransform = element.style.transform;
            const originalTransition = element.style.transition;
            element.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
            element.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.35)';
            element.style.transform = 'scale(1.01)';
            setTimeout(() => {
              element.style.boxShadow = originalBoxShadow;
              element.style.transform = originalTransform;
              element.style.transition = originalTransition;
            }, 800);
          }
        });
      }
    } catch (e: any) {
      showToast.error(e.message || 'Error al guardar promoción', darkMode);
    } finally {
      setLoading(false);
    }
  };

  // Calcular ahorro de la promoción
  const calcularAhorro = (promo: Promocion) => {
    if (promo.modalidad_promocional === 'clases' && promo.clases_gratis && promo.precio_por_clase) {
      return promo.clases_gratis * promo.precio_por_clase;
    }
    if (promo.modalidad_promocional === 'mensual' && promo.meses_gratis && promo.precio_base) {
      return promo.meses_gratis * promo.precio_base;
    }
    return 0;
  };

  const pageStyle: ThemeVars = {
    color: theme.textPrimary,
    minHeight: '100%',
    transition: 'color 0.3s ease',
    '--admin-card-bg': theme.contentBackground,
    '--admin-input-bg': theme.inputBg,
    '--admin-input-border': theme.inputBorder,
    '--admin-input-text': theme.inputText,
    '--admin-input-icon': theme.inputIcon,
    '--admin-text-primary': theme.textPrimary,
    '--admin-text-secondary': theme.textSecondary,
    '--admin-text-muted': theme.textMuted,
    '--admin-border': theme.controlGroupBorder,
    '--admin-divider': theme.divider
  };

  const isCardsView = viewMode === 'cards';
  const isTableView = viewMode === 'table';
  const toggleGroupBg = pick('rgba(148, 163, 184, 0.12)', 'rgba(255, 255, 255, 0.08)');
  const toggleActiveBg = pick('#ffffff', 'rgba(255, 255, 255, 0.14)');
  const toggleActiveText = theme.accentText;
  const toggleInactiveText = pick('rgba(100,116,139,0.7)', 'rgba(255,255,255,0.6)');
  const controlPanelStyle = {
    marginBottom: isMobile ? '12px' : '1.125rem',
    padding: isMobile ? '0.75rem' : '1rem',
    borderRadius: '1rem',
    border: `1px solid ${pick('rgba(239,68,68,0.24)', 'rgba(239,68,68,0.4)')}`,
    background: pick('rgba(255,255,255,0.95)', 'rgba(255,255,255,0.04)'),
    boxShadow: pick('0 18px 35px rgba(15,23,42,0.12)', '0 20px 40px rgba(0,0,0,0.45)')
  } as const;
  const controlsRowStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '8px' : '0.75rem',
    alignItems: isMobile ? 'stretch' : 'center',
    flexWrap: 'wrap'
  } as const;

  return (
    <div style={pageStyle}>
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Promociones"
        subtitle="Administra las campañas promocionales y beneficios disponibles"
        marginBottom={isMobile ? '12px' : '1.125rem'}
      />

      {/* Búsqueda y filtros */}
      <div style={controlPanelStyle}>
        <div style={controlsRowStyle}>
          {/* Buscador */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.inputIcon,
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '0.5rem',
                color: theme.inputText,
                fontSize: '0.8rem',
                boxShadow: darkMode ? 'none' : '0 12px 30px rgba(15,23,42,0.08)',
                transition: 'background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease'
              }}
            />
          </div>

          {/* Filtro Estado */}
          <div style={{ minWidth: isMobile ? '100%' : '160px' }}>
            <StyledSelect
              name="filtro_estado"
              value={filterActiva}
              onChange={(e) => setFilterActiva(e.target.value)}
              darkMode={darkMode}
              style={{
                ...fieldInputStyle,
                boxShadow: darkMode ? 'none' : '0 12px 30px rgba(15,23,42,0.08)'
              }}
              options={[
                { value: 'todas', label: 'Todas' },
                { value: 'activas', label: 'Activas' },
                { value: 'inactivas', label: 'Inactivas' }
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
            flexShrink: 0
          }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: isMobile ? '8px 0.75rem' : '9px 1rem',
                background: isCardsView ? toggleActiveBg : 'transparent',
                border: 'none',
                outline: 'none',
                borderRadius: '0.5rem',
                color: isCardsView ? toggleActiveText : toggleInactiveText,
                cursor: 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              <Grid
                size={16}
                color={isCardsView ? toggleActiveText : toggleInactiveText}
              />
              {!isMobile && 'Tarjetas'}
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
                outline: 'none',
                borderRadius: '0.5rem',
                color: isTableView ? toggleActiveText : toggleInactiveText,
                cursor: 'pointer',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
            >
              <List
                size={16}
                color={isTableView ? toggleActiveText : toggleInactiveText}
              />
              {!isMobile && 'Tabla'}
            </button>
          </div>

          <button
            onClick={openCreate}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              padding: isMobile ? '8px 14px' : '9px 16px',
              background: accentGradient,
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontWeight: 600,
              fontSize: isMobile ? '0.78rem' : '0.82rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1,
              flexShrink: 0,
              minWidth: isMobile ? '100%' : 'auto'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Plus size={isMobile ? 14 : 16} />
            Nueva Promoción
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 12px',
          background: pick('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.16)'),
          border: `1px solid ${pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.35)')}`,
          borderRadius: '0.75rem',
          color: theme.accentText,
          fontSize: '0.8rem',
          marginBottom: '12px',
          boxShadow: pick('0 14px 28px rgba(239,68,68,0.15)', '0 14px 28px rgba(239,68,68,0.22)')
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && promociones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: theme.textSecondary }}>
          Cargando promociones...
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredPromociones.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: theme.textSecondary,
          fontSize: '0.9rem',
          background: pick('rgba(255,255,255,0.85)', 'rgba(15,23,42,0.2)'),
          borderRadius: '1rem',
          border: `1px dashed ${pick('rgba(148,163,184,0.35)', 'rgba(148,163,184,0.25)')}`,
          boxShadow: pick('0 16px 40px rgba(15,23,42,0.12)', '0 16px 40px rgba(0,0,0,0.35)')
        }}>
          {searchTerm || filterActiva !== 'todas'
            ? 'No se encontraron promociones con los filtros aplicados'
            : 'No hay promociones creadas. Haz clic en "Nueva Promoción" para comenzar.'
          }
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && !loading && paginatedPromociones.length > 0 && (
        <div
          style={{
            marginBottom: isMobile ? '12px' : '1.125rem',
            background: theme.contentBackground,
            border: `1px solid ${theme.controlGroupBorder}`,
            borderRadius: '1rem',
            boxShadow: theme.surfaceShadow,
            overflow: 'hidden'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '900px',
                color: theme.textPrimary
              }}
            >
              <thead>
                <tr>
                  {[
                    'Estado',
                    'Promoción',
                    'Curso Principal',
                    'Curso Promocional',
                    'Beneficio',
                    'Cupos',
                    'Vigencia',
                    'Acciones'
                  ].map((header) => (
                    <th
                      key={header}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem 1rem',
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        fontWeight: 700,
                        color: theme.textSecondary,
                        borderBottom: `1px solid ${theme.divider}`,
                        background: pick('rgba(255,255,255,0.92)', 'rgba(17,24,39,0.65)')
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedPromociones.map((promo) => {
                  const ahorro = calcularAhorro(promo);
                  const cuposRestantes = promo.cupos_disponibles
                    ? (promo.cupos_disponibles || 0) - (promo.cupos_utilizados || 0)
                    : null;
                  const esCupoCritico = typeof cuposRestantes === 'number' && cuposRestantes <= 0;

                  const vigencia = promo.fecha_inicio || promo.fecha_fin
                    ? `${promo.fecha_inicio ? new Date(promo.fecha_inicio).toLocaleDateString('es-EC') : 'Desde'} → ${
                        promo.fecha_fin ? new Date(promo.fecha_fin).toLocaleDateString('es-EC') : 'Indefinida'
                      }`
                    : 'Sin definir';

                  return (
                    <tr
                      key={promo.id_promocion}
                      style={{
                        transition: 'background 0.2s ease',
                        borderBottom: `1px solid ${theme.divider}`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = pick('rgba(248,250,252,0.9)', 'rgba(45,55,72,0.3)');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '0.5rem',
                            background: promo.activa ? theme.badgeActiveBg : theme.badgeInactiveBg,
                            border: `1px solid ${promo.activa ? theme.badgeActiveBorder : theme.badgeInactiveBorder}`,
                            color: promo.activa ? '#10b981' : '#ef4444'
                          }}
                        >
                          {promo.activa ? (
                            <CheckCircle size={12} color="#10b981" />
                          ) : (
                            <XCircle size={12} color="#ef4444" />
                          )}
                          {promo.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem' }}>
                        <div style={{ fontWeight: 600, color: theme.textPrimary }}>{promo.nombre_promocion}</div>
                        {promo.descripcion && (
                          <div style={{ fontSize: '0.68rem', color: theme.textSecondary, marginTop: '3px' }}>
                            {promo.descripcion}
                          </div>
                        )}
                        {ahorro > 0 && (
                          <div
                            style={{
                              marginTop: '6px',
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              color: '#f59e0b',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(245,158,11,0.15)',
                              borderRadius: '999px',
                              padding: '2px 8px'
                            }}
                          >
                            <Sparkles size={12} color="#f59e0b" /> Ahorro {formatPrice(ahorro)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'rgba(59,130,246,0.95)' }}>
                          {promo.nombre_curso_principal || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.codigo_curso_principal || 'Sin código'} · {promo.horario_principal || 'Horario no definido'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'rgba(16,185,129,0.95)' }}>
                          {promo.nombre_curso_promocional || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.codigo_curso_promocional || 'Sin código'} · {promo.horario_promocional || 'Horario no definido'}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {promo.modalidad_promocional === 'clases'
                          ? `${promo.clases_gratis || 0} clases gratis`
                          : `${promo.meses_gratis || 0} meses gratis`}
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.modalidad_promocional === 'clases'
                            ? `Valor referencial ${formatPrice((promo.clases_gratis || 0) * (promo.precio_por_clase || 0))}`
                            : `Valor referencial ${formatPrice((promo.meses_gratis || 0) * (promo.precio_base || 0))}`}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem' }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: esCupoCritico ? '#ef4444' : theme.textPrimary
                          }}
                        >
                          {promo.cupos_disponibles
                            ? `${Math.max(cuposRestantes || 0, 0)} / ${promo.cupos_disponibles}`
                            : 'Ilimitados'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.cupos_utilizados || 0} aceptados
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', color: theme.textSecondary }}>
                        {vigencia}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggleActiva(promo.id_promocion, promo.activa)}
                            style={{
                              padding: '5px 10px',
                              background: promo.activa
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(16, 185, 129, 0.15)',
                              border: promo.activa
                                ? '1px solid rgba(239, 68, 68, 0.3)'
                                : '1px solid rgba(16, 185, 129, 0.3)',
                              borderRadius: '0.5rem',
                              color: promo.activa ? '#ef4444' : '#10b981',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {promo.activa ? (
                              <XCircle size={12} color="#ef4444" />
                            ) : (
                              <CheckCircle size={12} color="#10b981" />
                            )}
                            {promo.activa ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => openEdit(promo)}
                            style={{
                              padding: '5px 8px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.5rem',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Edit size={14} color="#3b82f6" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(promo)}
                            style={{
                              padding: '5px 8px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '0.5rem',
                              color: '#ef4444',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista Cards */}
      {viewMode === 'cards' && !loading && paginatedPromociones.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isSmallScreen ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '12px' : '1rem',
          marginBottom: isMobile ? '12px' : '1.125rem'
        }}>
          {paginatedPromociones.map((promo) => {
            const ahorro = calcularAhorro(promo);

            return (
              <div
                key={promo.id_promocion}
                id={`promo-card-${promo.id_promocion}`}
                style={{
                  background: theme.cardBackground,
                  border: `1px solid ${promo.activa ? theme.cardBorderActive : theme.cardBorderInactive}`,
                  borderRadius: '1rem',
                  padding: '1rem',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: theme.cardShadow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = theme.cardHoverShadow;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.cardShadow;
                }}
              >
                {/* Badge de ahorro (esquina superior derecha) */}
                {ahorro > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Sparkles size={10} color="#ffffff" />
                    Ahorra {formatPrice(ahorro)}
                  </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{
                      background: promo.activa ? theme.badgeActiveBg : theme.badgeInactiveBg,
                      border: `1px solid ${promo.activa ? theme.badgeActiveBorder : theme.badgeInactiveBorder}`,
                      color: promo.activa ? '#10b981' : '#ef4444',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {promo.activa
                        ? <CheckCircle size={10} color="#10b981" />
                        : <XCircle size={10} color="#ef4444" />}
                      {promo.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>

                  <h3 style={{
                    color: theme.textPrimary,
                    margin: '0 0 0.375rem 0',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    lineHeight: 1.3
                  }}>
                    {promo.nombre_promocion}
                  </h3>

                  {/* Cursos: Principal → Promocional */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    fontSize: '0.65rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'rgba(59, 130, 246, 0.9)'
                    }}>
                      <BookOpen size={11} color="rgba(59,130,246,0.9)" />
                      <strong>Paga:</strong> {promo.nombre_curso_principal || 'N/A'}
                      <span style={{
                        marginLeft: '4px',
                        padding: '1px 4px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: '3px',
                        fontSize: '0.6rem',
                        textTransform: 'capitalize'
                      }}>
                        {promo.horario_principal || 'N/A'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'rgba(16, 185, 129, 0.9)'
                    }}>
                      <Gift size={11} color="rgba(16,185,129,0.9)" />
                      <strong>Gratis:</strong> {promo.nombre_curso_promocional || 'N/A'}
                      <span style={{
                        marginLeft: '4px',
                        padding: '1px 4px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '3px',
                        fontSize: '0.6rem',
                        textTransform: 'capitalize'
                      }}>
                        {promo.horario_promocional || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beneficio Principal */}
                <div style={{
                  background: benefitTokens.background,
                  border: benefitTokens.border,
                  borderRadius: '0.5rem',
                  padding: '10px',
                  marginBottom: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: benefitTokens.title,
                    lineHeight: 1,
                    marginBottom: '4px'
                  }}>
                    {promo.modalidad_promocional === 'clases' ? promo.clases_gratis : promo.meses_gratis}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: theme.textSecondary,
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {promo.modalidad_promocional === 'clases' ? 'Clases Gratis' : 'Meses Gratis'}
                  </div>
                </div>

                {/* Descripción */}
                {promo.descripcion && (
                  <p style={{
                    color: theme.textSecondary,
                    fontSize: '0.7rem',
                    margin: '0 0 0.75rem 0',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {promo.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: `1px solid ${theme.divider}`
                }}>
                  {/* Cupos Promocionales */}
                  <div>
                    <div style={{
                      color: theme.textMuted,
                      fontSize: '0.6rem',
                      marginBottom: '2px'
                    }}>
                      Cupos Promo
                    </div>
                    <div style={{
                      color: promo.cupos_disponibles && (promo.cupos_disponibles - (promo.cupos_utilizados || 0)) <= 0
                        ? '#ef4444'
                        : theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {promo.cupos_disponibles
                        ? `${(promo.cupos_disponibles || 0) - (promo.cupos_utilizados || 0)}/${promo.cupos_disponibles}`
                        : 'Ilimitados'
                      }
                    </div>
                    <div style={{
                      color: theme.textMuted,
                      fontSize: '0.55rem',
                      marginTop: '1px'
                    }}>
                      {promo.cupos_utilizados || 0} aceptados
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <div style={{
                      color: theme.textMuted,
                      fontSize: '0.6rem',
                      marginBottom: '2px'
                    }}>
                      Modalidad
                    </div>
                    <div style={{
                      color: theme.textPrimary,
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {promo.modalidad_promocional === 'clases' ? 'Por Clases' : 'Mensual'}
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  paddingTop: '0.75rem',
                  borderTop: `1px solid ${theme.divider}`
                }}>
                  <button
                    onClick={() => handleToggleActiva(promo.id_promocion, promo.activa)}
                    style={{
                      flex: 1,
                      padding: '6px',
                      background: promo.activa
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                      border: promo.activa
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      color: promo.activa ? '#ef4444' : '#10b981',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {promo.activa
                      ? <XCircle size={12} color="#ef4444" />
                      : <CheckCircle size={12} color="#10b981" />}
                    {promo.activa ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    onClick={() => openEdit(promo)}
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Edit size={14} color="#3b82f6" />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(promo)}
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '6px 10px',
              background: theme.paginationBg,
              border: `1px solid ${theme.paginationBorder}`,
              borderRadius: '0.625rem',
              color: currentPage === 1 ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.35)') : theme.paginationText,
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronLeft
              size={16}
              color={currentPage === 1 ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.35)') : theme.paginationText}
            />
          </button>

          <span style={{
            color: theme.paginationText,
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 10px',
              background: theme.paginationBg,
              border: `1px solid ${theme.paginationBorder}`,
              borderRadius: '0.625rem',
              color: currentPage === totalPages ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.35)') : theme.paginationText,
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronRight
              size={16}
              color={currentPage === totalPages ? pick('rgba(148,163,184,0.6)', 'rgba(255,255,255,0.35)') : theme.paginationText}
            />
          </button>
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
            WebkitBackdropFilter: 'blur(8px)',
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
              background: pick(
                'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
                'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)'
              ),
              border: `1px solid ${pick('rgba(239,68,68,0.2)', 'rgba(239,68,68,0.24)')}`,
              borderRadius: '12px',
              width: isMobile ? '92vw' : '600px',
              maxWidth: isMobile ? '92vw' : '600px',
              maxHeight: '85vh',
              padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
              margin: 'auto',
              color: theme.textPrimary,
              boxShadow: theme.surfaceShadow,
              overflowY: 'auto',
              overflowX: 'hidden',
              animation: 'scaleIn 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? 12 : 14,
              paddingBottom: isMobile ? 8 : 10,
              borderBottom: `1px solid ${theme.modalDivider}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? '0.95rem' : '1.05rem',
                  fontWeight: '600',
                  letterSpacing: '-0.01em',
                  color: theme.textPrimary
                }}>
                  {modalType === 'create' ? 'Nueva Promoción' : 'Editar Promoción'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)'),
                  border: `1px solid ${theme.modalDivider}`,
                  borderRadius: '0.6rem',
                  padding: '6px',
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = pick('rgba(239,68,68,0.12)', 'rgba(239,68,68,0.2)');
                  e.currentTarget.style.borderColor = pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.32)');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)');
                  e.currentTarget.style.borderColor = theme.modalDivider;
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? 10 : 12,
                columnGap: isSmallScreen ? 0 : 16
              }}>
                {/* Curso Principal (que el estudiante paga) */}
                <div>
                  <label style={labelStyle}>
                    <BookOpen size={14} style={{ color: '#3b82f6' }} />
                    Curso Principal (que paga)
                  </label>
                  <StyledSelect
                    name="id_curso_principal"
                    defaultValue={selected?.id_curso_principal || ''}
                    darkMode={darkMode}
                    style={{
                      ...fieldInputStyle
                    }}
                    options={[
                      { value: '', label: 'Selecciona curso principal...' },
                      ...cursos.map(c => ({
                        value: String(c.id_curso),
                        label: `${c.codigo_curso} - ${c.nombre}`
                      }))
                    ]}
                    required
                  />
                </div>

                {/* Curso Promocional (que recibe gratis) */}
                <div>
                  <label style={labelStyle}>
                    <Gift size={14} style={{ color: '#10b981' }} />
                    Curso Promocional (gratis)
                  </label>
                  <StyledSelect
                    name="id_curso_promocional"
                    value={selectedCursoId || ''}
                    onChange={(e) => setSelectedCursoId(Number(e.target.value))}
                    darkMode={darkMode}
                    style={{
                      ...fieldInputStyle
                    }}
                    options={[
                      { value: '', label: 'Selecciona curso promocional...' },
                      ...cursos.map(c => ({
                        value: String(c.id_curso),
                        label: `${c.codigo_curso} - ${c.nombre} (${c.modalidad_pago === 'clases' ? 'Por Clases' : 'Mensual'})`
                      }))
                    ]}
                    required
                  />
                </div>

                {/* Nombre Promoción */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>
                    <Sparkles size={14} style={{ color: '#f59e0b' }} />
                    Nombre de la promoción
                  </label>
                  <input
                    name="nombre_promocion"
                    placeholder="Ej. Promo Lanzamiento 2025, Black Friday, etc."
                    defaultValue={selected?.nombre_promocion || ''}
                    required
                    style={fieldInputStyle}
                  />
                </div>

                {/* Descripción */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>
                    <FileText size={14} style={{ color: '#8b5cf6' }} />
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    defaultValue={selected?.descripcion || ''}
                    placeholder="Describe los detalles de la promoción..."
                    rows={2}
                    style={{
                      ...fieldInputStyle,
                      resize: 'vertical',
                      minHeight: '50px'
                    }}
                  />
                </div>

                {/* Beneficio (meses o clases según modalidad) */}
                {cursoSeleccionado && (
                  <div>
                    <label style={labelStyle}>
                      <Gift size={14} style={{ color: '#10b981' }} />
                      {cursoSeleccionado.modalidad_pago === 'clases' ? 'Clases Gratis' : 'Meses Gratis'}
                    </label>
                    <input
                      name={cursoSeleccionado.modalidad_pago === 'clases' ? 'clases_gratis' : 'meses_gratis'}
                      type="number"
                      min="1"
                      defaultValue={
                        cursoSeleccionado.modalidad_pago === 'clases'
                          ? selected?.clases_gratis || 1
                          : selected?.meses_gratis || 1
                      }
                      required
                      style={fieldInputStyle}
                    />
                  </div>
                )}

                {/* Cupos */}
                <div>
                  <label style={labelStyle}>
                    <Users size={14} style={{ color: '#06b6d4' }} />
                    Cupos (vacío = ilimitado)
                  </label>
                  <input
                    name="cupos_disponibles"
                    type="number"
                    min="0"
                    placeholder="Ilimitado"
                    defaultValue={selected?.cupos_disponibles || ''}
                    style={fieldInputStyle}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label style={labelStyle}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} />
                    Estado
                  </label>
                  <StyledSelect
                    name="activa"
                    defaultValue={selected?.activa ? 'true' : 'false'}
                    darkMode={darkMode}
                    style={{
                      ...fieldInputStyle
                    }}
                    options={[
                      { value: 'true', label: 'Activa' },
                      { value: 'false', label: 'Inactiva' }
                    ]}
                  />
                </div>
              </div>

              {/* Botones */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: isMobile ? 12 : 14,
              paddingTop: isMobile ? 10 : 12,
              borderTop: `1px solid ${theme.modalDivider}`
            }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '0.625rem 0.5rem',
                  background: pick('rgba(255,255,255,0.88)', 'rgba(255,255,255,0.05)'),
                  border: `1px solid ${theme.modalDivider}`,
                  borderRadius: '0.625rem',
                  color: theme.textPrimary,
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: pick('0 10px 20px rgba(15,23,42,0.08)', 'none')
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.625rem 0.5rem',
                  background: loading ? 'rgba(239, 68, 68, 0.35)' : accentGradient,
                  border: 'none',
                  borderRadius: '0.625rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: loading ? 'none' : '0 16px 30px rgba(239,68,68,0.25)'
                }}
              >
                <Save size={14} />
                {loading ? 'Guardando...' : modalType === 'create' ? 'Crear Promoción' : 'Actualizar'}
              </button>
            </div>
          </form>
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

      {deleteTarget && createPortal(
        <div
          className="modal-overlay"
          onClick={closeDeleteModal}
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
            backdropFilter: 'blur(14px)',
            background: pick(
              'linear-gradient(140deg, rgba(30,41,59,0.45) 0%, rgba(148,163,184,0.36) 100%)',
              'linear-gradient(140deg, rgba(2,6,23,0.72) 0%, rgba(30,41,59,0.55) 100%)'
            )
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: pick(
                'linear-gradient(165deg, rgba(241,245,249,0.96) 0%, rgba(226,232,240,0.94) 55%, rgba(248,250,252,0.98) 100%)',
                'linear-gradient(165deg, rgba(21,30,46,0.95) 0%, rgba(15,23,42,0.93) 60%, rgba(15,23,42,0.97) 100%)'
              ),
              border: `1px solid ${pick('rgba(148,163,184,0.35)', 'rgba(71,85,105,0.45)')}`,
              borderRadius: '1rem',
              width: isMobile ? '92vw' : '420px',
              maxWidth: isMobile ? '92vw' : '420px',
              padding: isMobile ? '1rem' : '1.25rem',
              boxShadow: pick('0 28px 65px rgba(15,23,42,0.22)', '0 32px 70px rgba(0,0,0,0.45)'),
              color: theme.textPrimary,
              animation: 'scaleIn 0.25s ease-out'
            }}
          >
            <div style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
              <h3 style={{
                margin: 0,
                fontSize: isMobile ? '1rem' : '1.1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: theme.textPrimary
              }}>
                Eliminar Promoción
              </h3>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: theme.textSecondary
              }}>
                ¿Estás seguro de eliminar la promoción{' '}
                <strong style={{ color: theme.textPrimary }}>{deleteTarget.nombre_promocion}</strong>? Esta acción no se puede deshacer.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                style={{
                  padding: '0.625rem 1.1rem',
                  background: pick('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.08)'),
                  border: `1px solid ${theme.modalDivider}`,
                  borderRadius: '0.65rem',
                  color: theme.textPrimary,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                style={{
                  padding: '0.625rem 1.1rem',
                  background: deleteLoading ? 'rgba(239,68,68,0.35)' : accentGradient,
                  border: 'none',
                  borderRadius: '0.65rem',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: deleteLoading ? 'none' : '0 16px 30px rgba(239,68,68,0.25)'
                }}
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
            <style>{`
              @keyframes scaleIn {
                from {
                  opacity: 0;
                  transform: scale(0.92);
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
  </div>
  );
};

export default GestionPromociones;
