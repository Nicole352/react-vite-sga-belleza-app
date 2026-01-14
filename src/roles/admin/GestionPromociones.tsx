import React, { useState, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Edit, Trash2, X, Save, Gift, Search, Grid, List, ChevronLeft, ChevronRight,
  Users, BookOpen, Sparkles, FileText, ArrowLeftRight, Power, CheckCircle, Eye
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { showToast } from '../../config/toastConfig';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import GlassEffect from '../../components/GlassEffect';
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
  const [toggleTarget, setToggleTarget] = useState<Promocion | null>(null);
  const [viewTarget, setViewTarget] = useState<Promocion | null>(null);

  // Estados para búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiva, setFilterActiva] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
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

  const theme = useMemo(() => ({
    pageBackground: darkMode
      ? 'linear-gradient(135deg, rgba(10,10,18,0.95) 0%, rgba(17,17,27,0.95) 100%)'
      : 'linear-gradient(135deg, rgba(248,250,252,0.98) 0%, rgba(255,255,255,0.98) 100%)',
    contentBackground: darkMode
      ? 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,245,245,0.92) 100%)', // Consistent with other components
    surfaceShadow: 'none', // Removed for flat look
    textPrimary: darkMode ? '#ffffff' : '#1f2937',
    textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : '#384152',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280',
    accentText: '#ef4444',
    inputBg: darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
    inputBorder: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(148,163,184,0.45)',
    inputText: darkMode ? '#f8fafc' : '#1f2937',
    inputIcon: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(148,163,184,0.7)',
    controlGroupBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.12)',
    controlGroupBorder: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
    controlInactiveText: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)',
    controlActiveBg: darkMode ? 'rgba(239,68,68,0.15)' : '#ffffff',
    controlActiveBorder: darkMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.2)',
    cardBackground: darkMode
      ? 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,245,245,0.92) 100%)',
    cardBorderActive: darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.5)',
    cardBorderInactive: darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.25)',
    cardShadow: 'none',
    cardHoverShadow: darkMode ? '0 0.5rem 1.5rem rgba(239, 68, 68, 0.24)' : '0 12px 28px rgba(239, 68, 68, 0.12)',
    badgeActiveBg: darkMode ? mapToRedScheme('rgba(16,185,129,0.15)') : 'rgba(16,185,129,0.12)',
    badgeActiveBorder: darkMode ? mapToRedScheme('rgba(16,185,129,0.3)') : 'rgba(16,185,129,0.3)',
    badgeInactiveBg: darkMode ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.12)',
    badgeInactiveBorder: darkMode ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.3)',
    divider: 'rgba(239, 68, 68, 0.15)',
    paginationBg: darkMode ? 'rgba(0,0,0,0.2)' : '#ffffff',
    paginationBorder: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    paginationText: darkMode ? '#ffffff' : '#1f2937',
    overlay: darkMode ? 'rgba(0,0,0,0.65)' : 'rgba(248,250,252,0.65)',
    modalBorder: darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.25)',
    modalDivider: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.2)',
    tableHeaderBg: darkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(248, 113, 113, 0.05)',
  }), [darkMode]);

  const accentGradient = `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`;

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
  const [selectedCursoPrincipalId, setSelectedCursoPrincipalId] = useState<number | null>(null);
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

  // Obtener IDs de cursos que ya están siendo usados en otras promociones
  const cursosUsadosEnOtrasPromociones = useMemo(() => {
    const cursosUsados = new Set<number>();

    promociones.forEach(promo => {
      // Si estamos editando, excluir la promoción actual
      if (modalType === 'edit' && selected && promo.id_promocion === selected.id_promocion) {
        return;
      }

      // Agregar cursos principales y promocionales de otras promociones
      if (promo.id_curso_principal) {
        cursosUsados.add(promo.id_curso_principal);
      }
      if (promo.id_curso_promocional) {
        cursosUsados.add(promo.id_curso_promocional);
      }
    });

    return cursosUsados;
  }, [promociones, modalType, selected]);

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
    setSelectedCursoPrincipalId(null);
    setSelectedCursoId(null);
    setModalType('create');
    setShowModal(true);
  };

  const openEdit = (p: Promocion) => {
    setSelected(p);
    setSelectedCursoPrincipalId(p.id_curso_principal);
    setSelectedCursoId(p.id_curso_promocional);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewPromocion = (p: Promocion) => {
    setViewTarget(p);
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

  const handleToggleActiva = (promo: Promocion) => {
    setToggleTarget(promo);
  };

  const confirmToggleActiva = async () => {
    if (!toggleTarget) return;

    const nuevoEstado = !toggleTarget.activa;

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/promociones/${toggleTarget.id_promocion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activa: nuevoEstado })
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      showToast.success(`Promoción ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`, darkMode);
      setToggleTarget(null);
      await fetchPromociones();
    } catch (err: any) {
      showToast.error(err.message || 'Error al cambiar estado', darkMode);
    } finally {
      setLoading(false);
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
  const toggleGroupBg = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.12)';
  const toggleActiveBg = darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff';
  const toggleActiveText = darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary;
  const toggleInactiveText = darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)';
  const controlPanelStyle = {
    marginBottom: isMobile ? '0.5rem' : '0.5rem',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: `1px solid ${pick('rgba(239,68,68,0.24)', 'rgba(239,68,68,0.4)')}`,
    background: pick('rgba(255,255,255,0.95)', 'rgba(255,255,255,0.04)'),
    boxShadow: 'none'
  } as const;
  const controlsRowStyle = {
    display: 'flex',
    flexDirection: isSmallScreen ? 'column' : 'row',
    gap: '0.75rem',
    alignItems: isSmallScreen ? 'stretch' : 'center',
    flex: 1,
    width: isSmallScreen ? '100%' : 'auto'
  } as const;

  return (
    <div style={pageStyle}>
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Promociones"
        subtitle="Administra las campañas promocionales y beneficios disponibles"
        marginBottom={isMobile ? '0.5rem' : '0.5rem'}
      />

      {/* Búsqueda y filtros */}
      <GlassEffect
        variant="card"
        tint="neutral"
        intensity="light"
        style={{
          marginBottom: isMobile ? '0.5rem' : '0.5rem',
          padding: '0.5rem',
          boxShadow: 'none',
          borderRadius: '0.375rem',
          border: `1px solid ${theme.inputBorder}`
        }}
      >
        <div className="responsive-filters">
          <div style={controlsRowStyle}>
            {/* Buscador */}
            <div style={{ flex: 1, position: 'relative', width: isSmallScreen ? '100%' : 'auto' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.5rem',
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
                  padding: '0 0.5rem 0 2rem',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,250,252,0.95)',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: theme.inputText,
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  height: '2rem'
                }}
              />
            </div>

            {/* Filtro Estado */}
            <div style={{ minWidth: isMobile ? '100%' : 'min(12.5rem, 25vw)', width: isMobile ? '100%' : 'auto' }}>
              <StyledSelect
                name="filtro_estado"
                value={filterActiva}
                onChange={(e) => setFilterActiva(e.target.value)}
                darkMode={darkMode}
                options={[
                  { value: 'todas', label: 'Todas' },
                  { value: 'activas', label: 'Activas' },
                  { value: 'inactivas', label: 'Inactivas' }
                ]}
              />
            </div>

            {/* Toggle Vista */}
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                gap: '0.375rem',
                background: toggleGroupBg,
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
                    background: isCardsView ? toggleActiveBg : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: isCardsView ? toggleActiveText : toggleInactiveText,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    flex: isSmallScreen ? 1 : 'initial'
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
                    gap: '0.3em',
                    padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                    background: isTableView ? toggleActiveBg : 'transparent',
                    border: 'none',
                    borderRadius: '0.5em',
                    color: isTableView ? toggleActiveText : toggleInactiveText,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    flex: isSmallScreen ? 1 : 'initial'
                  }}
                >
                  <List
                    size={16}
                    color={isTableView ? toggleActiveText : toggleInactiveText}
                  />
                  {!isMobile && 'Tabla'}
                </button>
              </div>


            </div>
          </div>

          {/* Botón Crear */}
          <button
            onClick={openCreate}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
              background: accentGradient,
              border: 'none',
              borderRadius: '0.625em',
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '0.8rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: loading ? 'none' : '0 0.35rem 1rem rgba(239,68,68,0.35)',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Plus size={16} color="currentColor" />
            Nueva Promoción
          </button>
        </div>
      </GlassEffect>

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
        <>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: pick('rgba(254,226,226,0.9)', 'rgba(239,68,68,0.12)'),
              border: `1px solid ${pick('rgba(248,113,113,0.35)', 'rgba(248,113,113,0.4)')}`,
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

          <div
            className="responsive-table-container"
            style={{
              overflowX: 'auto',
              borderRadius: isMobile ? '12px' : '1rem',
              border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.18)'}`,
              background: darkMode
                ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
              marginBottom: isMobile ? '12px' : '0.5rem',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isSmallScreen ? 'min(56.25rem, 95vw)' : 'auto' }}>
              <thead style={{
                borderBottom: `1px solid ${darkMode ? 'rgba(248,113,113,0.3)' : 'rgba(248,113,113,0.18)'}`,
                background: darkMode ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.12)'
              }}>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Promoción</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Curso Principal</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Curso Promocional</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Beneficio</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Cupos</th>
                  <th style={{ padding: '0.25rem 0.5rem', color: darkMode ? '#ffffff' : '#9f1239', textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>Acciones</th>
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
                    ? `${promo.fecha_inicio ? new Date(promo.fecha_inicio).toLocaleDateString('es-EC') : 'Desde'} → ${promo.fecha_fin ? new Date(promo.fecha_fin).toLocaleDateString('es-EC') : 'Indefinida'
                    }`
                    : 'Sin definir';

                  return (
                    <tr
                      key={promo.id_promocion}
                      style={{
                        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}`,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = darkMode ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center', verticalAlign: 'middle' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '2px 8px',
                            borderRadius: '0.5rem',
                            background: promo.activa ? theme.badgeActiveBg : theme.badgeInactiveBg,
                            border: `1px solid ${promo.activa ? theme.badgeActiveBorder : theme.badgeInactiveBorder}`,
                            color: promo.activa ? '#10b981' : '#ef4444'
                          }}
                        >
                          <Power size={10} color={promo.activa ? '#10b981' : '#ef4444'} />
                          {promo.activa ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: theme.textPrimary }}>{promo.nombre_promocion}</div>
                        {promo.descripcion && (
                          <div style={{ fontSize: '0.68rem', color: theme.textSecondary, marginTop: '3px' }}>
                            {promo.descripcion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: 'rgba(59,130,246,0.95)' }}>
                          {promo.nombre_curso_principal || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.codigo_curso_principal || 'Sin código'} · {promo.horario_principal || 'Horario no definido'}
                        </div>
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 600, color: 'rgba(16,185,129,0.95)' }}>
                          {promo.nombre_curso_promocional || 'N/A'}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: theme.textSecondary, marginTop: '3px' }}>
                          {promo.codigo_curso_promocional || 'Sin código'} · {promo.horario_promocional || 'Horario no definido'}
                        </div>
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, verticalAlign: 'middle' }}>
                        {promo.modalidad_promocional === 'clases'
                          ? `${promo.clases_gratis || 0} clases gratis`
                          : `${promo.meses_gratis || 0} meses gratis`}
                      </td>
                      <td style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', textAlign: 'center', verticalAlign: 'middle' }}>
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
                      <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                          <button
                            onClick={() => handleViewPromocion(promo)}
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
                            onClick={() => openEdit(promo)}
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
                            title="Editar promoción"
                          >
                            <Edit style={{ width: '0.85rem', height: '0.85rem' }} />
                          </button>
                          <button
                            onClick={() => handleToggleActiva(promo)}
                            style={{
                              padding: '0.25rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${promo.activa ? '#ef4444' : '#10b981'}`,
                              backgroundColor: 'transparent',
                              color: promo.activa ? '#ef4444' : '#10b981',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              const color = promo.activa ? '#ef4444' : '#10b981';
                              e.currentTarget.style.backgroundColor = color;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              const color = promo.activa ? '#ef4444' : '#10b981';
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = color;
                            }}
                            title={promo.activa ? 'Desactivar promoción' : 'Activar promoción'}
                          >
                            <Power style={{ width: '0.85rem', height: '0.85rem' }} />
                          </button>
                          <button
                            onClick={() => {
                              if ((promo.cupos_utilizados || 0) > 0) return;
                              setDeleteTarget(promo);
                            }}
                            style={{
                              padding: '0.25rem',
                              borderRadius: '0.5rem',
                              border: (promo.cupos_utilizados || 0) > 0 ? '1px solid transparent' : '1px solid #ef4444',
                              backgroundColor: 'transparent',
                              color: (promo.cupos_utilizados || 0) > 0 ? (darkMode ? '#64748b' : '#94a3b8') : '#ef4444',
                              cursor: (promo.cupos_utilizados || 0) > 0 ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: (promo.cupos_utilizados || 0) > 0 ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if ((promo.cupos_utilizados || 0) > 0) return;
                              e.currentTarget.style.backgroundColor = '#ef4444';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              if ((promo.cupos_utilizados || 0) > 0) return;
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#ef4444';
                            }}
                            title={(promo.cupos_utilizados || 0) > 0 ? "No se puede eliminar: tiene estudiantes inscritos" : "Eliminar promoción"}
                          >
                            <Trash2 style={{ width: '0.85rem', height: '0.85rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Vista Cards */}
      {viewMode === 'cards' && !loading && paginatedPromociones.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: isMobile ? '8px' : '0.75rem',
          marginBottom: isMobile ? '12px' : '0.5rem'
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
                  borderRadius: '0.625rem',
                  padding: '0.625rem',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: theme.cardShadow
                }}
              >
                {/* Badge de ahorro (esquina superior derecha) */}
                {ahorro > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.6rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 1px 4px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Sparkles size={8} color="#ffffff" />
                    PROMO
                  </div>
                )}
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.375rem'
                  }}>
                    <div style={{
                      background: promo.activa ? theme.badgeActiveBg : theme.badgeInactiveBg,
                      border: `1px solid ${promo.activa ? theme.badgeActiveBorder : theme.badgeInactiveBorder}`,
                      color: promo.activa ? '#10b981' : '#ef4444',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}>
                      <Power size={8} color={promo.activa ? '#10b981' : '#ef4444'} />
                      {promo.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>

                  <h3 style={{
                    color: theme.textPrimary,
                    margin: '0 0 0.25rem 0',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    lineHeight: '1.2'
                  }}>
                    {promo.nombre_promocion}
                  </h3>

                  {/* Cursos: Principal → Promocional */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    fontSize: '0.65rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: 'rgba(59, 130, 246, 0.9)'
                    }}>
                      <BookOpen size={10} color="rgba(59,130,246,0.9)" />
                      <strong>Paga:</strong> {promo.nombre_curso_principal || 'N/A'}
                      <span style={{
                        marginLeft: '3px',
                        padding: '0 3px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: '3px',
                        fontSize: '0.55rem',
                        textTransform: 'capitalize'
                      }}>
                        {promo.horario_principal || 'N/A'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: 'rgba(16, 185, 129, 0.9)'
                    }}>
                      <Gift size={10} color="rgba(16,185,129,0.9)" />
                      <strong>Gratis:</strong> {promo.nombre_curso_promocional || 'N/A'}
                      <span style={{
                        marginLeft: '3px',
                        padding: '0 3px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        borderRadius: '3px',
                        fontSize: '0.55rem',
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
                  padding: '0.375rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: benefitTokens.title,
                    lineHeight: 1,
                    marginBottom: '2px'
                  }}>
                    {promo.modalidad_promocional === 'clases' ? promo.clases_gratis : promo.meses_gratis}
                  </div>
                  <div style={{
                    fontSize: '0.6rem',
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
                    fontSize: '0.65rem',
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '1.7rem'
                  }}>
                    {promo.descripcion}
                  </p>
                )}

                {/* Info adicional */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                  gap: '0.375rem 0.5rem',
                  marginBottom: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${theme.divider}`
                }}>
                  {/* Cupos Promocionales */}
                  <div>
                    <div style={{
                      color: theme.textMuted,
                      fontSize: '0.6rem',
                      marginBottom: '0'
                    }}>
                      Cupos Promo
                    </div>
                    <div style={{
                      color: promo.cupos_disponibles && (promo.cupos_disponibles - (promo.cupos_utilizados || 0)) <= 0
                        ? '#ef4444'
                        : theme.textPrimary,
                      fontSize: '0.65rem',
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
                      marginTop: '0'
                    }}>
                      {promo.cupos_utilizados || 0} aceptados
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <div style={{
                      color: theme.textMuted,
                      fontSize: '0.6rem',
                      marginBottom: '0'
                    }}>
                      Modalidad
                    </div>
                    <div style={{
                      color: theme.textPrimary,
                      fontSize: '0.65rem',
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
                  gap: '0.25rem',
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${theme.divider}`
                }}>
                  <button
                    onClick={() => handleViewPromocion(promo)}
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      height: '24px',
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}
                  >
                    <Eye size={12} color="#3b82f6" /> Ver
                  </button>

                  <button
                    onClick={() => openEdit(promo)}
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '0.375rem',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      height: '24px',
                      fontSize: '0.65rem',
                      fontWeight: 600
                    }}
                  >
                    <Edit size={12} color="#3b82f6" /> Editar
                  </button>

                  <button
                    onClick={() => handleToggleActiva(promo)}
                    style={{
                      flex: 1.5,
                      padding: '0.25rem',
                      background: promo.activa
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(16, 185, 129, 0.15)',
                      border: promo.activa
                        ? '1px solid rgba(239, 68, 68, 0.3)'
                        : '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '0.375rem',
                      color: promo.activa ? '#ef4444' : '#10b981',
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '3px',
                      height: '24px'
                    }}
                  >
                    <Power size={12} color={promo.activa ? '#ef4444' : '#10b981'} />
                    {promo.activa ? 'Desactivar' : 'Activar'}
                  </button>

                  <button
                    onClick={() => {
                      if ((promo.cupos_utilizados || 0) > 0) return;
                      setDeleteTarget(promo);
                    }}
                    style={{
                      flex: 1,
                      padding: '0.25rem 0.5rem',
                      background: (promo.cupos_utilizados || 0) > 0
                        ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                        : 'rgba(239, 68, 68, 0.15)',
                      border: (promo.cupos_utilizados || 0) > 0
                        ? '1px solid transparent'
                        : '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '0.375rem',
                      color: (promo.cupos_utilizados || 0) > 0
                        ? (darkMode ? '#64748b' : '#94a3b8')
                        : '#ef4444',
                      cursor: (promo.cupos_utilizados || 0) > 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      height: '24px',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      opacity: (promo.cupos_utilizados || 0) > 0 ? 0.6 : 1
                    }}
                    title={(promo.cupos_utilizados || 0) > 0 ? "No se puede eliminar: tiene estudiantes inscritos" : "Eliminar promoción"}
                  >
                    <Trash2 size={12} color={(promo.cupos_utilizados || 0) > 0 ? "currentColor" : "#ef4444"} /> Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '8px' : '0.25rem 1rem',
          background: darkMode
            ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
          border: `1px solid ${darkMode ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.14)'}`,
          borderRadius: '0.75rem',
          marginTop: '0.5rem',
          marginBottom: isMobile ? '0.75rem' : '0.5rem'
        }}>
          <div style={{
            color: darkMode ? 'rgba(226,232,240,0.8)' : 'rgba(30,41,59,0.85)',
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {currentPage} de {totalPages} • Total: {filteredPromociones.length} promociones
          </div>

          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.25rem',
                padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                background: currentPage === 1
                  ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.6)')
                  : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)'),
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(226,232,240,0.75)'}`,
                borderRadius: '0.625rem',
                color: currentPage === 1
                  ? (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(148,163,184,0.6)')
                  : (darkMode ? '#f8fafc' : 'rgba(30,41,59,0.85)'),
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
                  background: currentPage === pageNum
                    ? (darkMode
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)')
                    : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.9)'),
                  border: currentPage === pageNum
                    ? `1px solid ${darkMode ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`
                    : `1px solid ${darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(148,163,184,0.45)'}`,
                  borderRadius: '0.5rem',
                  color: currentPage === pageNum ? '#ffffff' : (darkMode ? '#f8fafc' : 'rgba(30,41,59,0.85)'),
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.25rem',
                padding: isMobile ? '6px 0.625rem' : '4px 0.75rem',
                background: currentPage === totalPages
                  ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(226,232,240,0.6)')
                  : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)'),
                border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(226,232,240,0.75)'}`,
                borderRadius: '0.625rem',
                color: currentPage === totalPages
                  ? (darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(148,163,184,0.6)')
                  : (darkMode ? '#f8fafc' : 'rgba(30,41,59,0.85)'),
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
                    value={selectedCursoPrincipalId || ''}
                    onChange={(e) => setSelectedCursoPrincipalId(Number(e.target.value))}
                    darkMode={darkMode}
                    style={{
                      ...fieldInputStyle
                    }}
                    options={[
                      { value: '', label: 'Selecciona curso principal...' },
                      ...cursos
                        .filter(c => {
                          // Solo cursos activos
                          if (c.estado !== 'activo') return false;

                          // Si estamos editando, permitir el curso que ya está seleccionado
                          if (modalType === 'edit' && selected && c.id_curso === selected.id_curso_principal) {
                            return true;
                          }

                          // Excluir cursos que ya están en otras promociones
                          if (cursosUsadosEnOtrasPromociones.has(c.id_curso)) return false;

                          // Excluir el curso promocional seleccionado actualmente
                          if (selectedCursoId && c.id_curso === selectedCursoId) return false;

                          return true;
                        })
                        .map(c => ({
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
                      ...cursos
                        .filter(c => {
                          // Solo cursos activos
                          if (c.estado !== 'activo') return false;

                          // Si estamos editando, permitir el curso que ya está seleccionado
                          if (modalType === 'edit' && selected && c.id_curso === selected.id_curso_promocional) {
                            return true;
                          }

                          // Excluir cursos que ya están en otras promociones
                          if (cursosUsadosEnOtrasPromociones.has(c.id_curso)) return false;

                          // Excluir el curso principal seleccionado actualmente
                          if (selectedCursoPrincipalId && c.id_curso === selectedCursoPrincipalId) return false;

                          return true;
                        })
                        .map(c => ({
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
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            background: 'rgba(0, 0, 0, 0.65)'
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
              width: isMobile ? '92vw' : '420px',
              maxWidth: isMobile ? '92vw' : '420px',
              padding: isMobile ? '1rem' : '1.25rem',
              margin: 'auto',
              color: theme.textPrimary,
              boxShadow: theme.surfaceShadow,
              animation: 'scaleIn 0.3s ease-out'
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

      {/* Modal de confirmación para activar/desactivar */}
      {toggleTarget && createPortal(
        <div
          className="modal-overlay"
          onClick={() => setToggleTarget(null)}
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
            background: 'rgba(0, 0, 0, 0.65)'
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
              width: isMobile ? '92vw' : '420px',
              maxWidth: isMobile ? '92vw' : '420px',
              padding: isMobile ? '1rem' : '1.25rem',
              margin: 'auto',
              color: theme.textPrimary,
              boxShadow: theme.surfaceShadow,
              animation: 'scaleIn 0.3s ease-out',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: toggleTarget.activa
                ? 'rgba(239, 68, 68, 0.1)'
                : 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Power size={28} color={toggleTarget.activa ? '#ef4444' : '#10b981'} />
            </div>

            <h3 style={{
              margin: 0,
              fontSize: isMobile ? '1rem' : '1.1rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: theme.textPrimary
            }}>
              ¿{toggleTarget.activa ? 'Desactivar' : 'Activar'} promoción?
            </h3>

            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: theme.textSecondary
            }}>
              Estás a punto de {toggleTarget.activa ? 'desactivar' : 'activar'} la promoción{' '}
              <strong style={{ color: theme.textPrimary }}>{toggleTarget.nombre_promocion}</strong>.
            </p>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                type="button"
                onClick={() => setToggleTarget(null)}
                disabled={loading}
                style={{
                  padding: '0.625rem 1.1rem',
                  background: pick('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.08)'),
                  border: `1px solid ${theme.modalDivider}`,
                  borderRadius: '0.65rem',
                  color: theme.textPrimary,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleActiva}
                disabled={loading}
                style={{
                  padding: '0.625rem 1.1rem',
                  background: loading
                    ? 'rgba(239,68,68,0.35)'
                    : (toggleTarget.activa
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #10b981, #059669)'),
                  border: 'none',
                  borderRadius: '0.65rem',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: loading ? 'none' : '0 16px 30px rgba(239,68,68,0.25)'
                }}
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de ver detalles */}
      {viewTarget && createPortal(
        <div
          className="modal-overlay"
          onClick={() => setViewTarget(null)}
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
            overflowY: 'auto'
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
              padding: isMobile ? '1.25rem' : '1.5rem',
              margin: 'auto',
              color: theme.textPrimary,
              boxShadow: theme.surfaceShadow,
              animation: 'scaleIn 0.3s ease-out',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? '0.75rem' : '1rem',
              paddingBottom: isMobile ? '0.5rem' : '0.75rem',
              borderBottom: `1px solid ${theme.modalDivider}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? '1.125rem' : '1.25rem',
                  fontWeight: 700,
                  color: theme.textPrimary
                }}>
                  Detalles de Promoción
                </h2>
              </div>
              <button
                onClick={() => setViewTarget(null)}
                style={{
                  background: pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)'),
                  border: `1px solid ${theme.modalDivider}`,
                  borderRadius: '0.5rem',
                  padding: '0.375rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
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
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {/* Nombre de la Promoción */}
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.textMuted,
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase'
                }}>
                  <Sparkles size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Nombre
                </div>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: pick('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.12)'),
                  border: `1px solid ${pick('rgba(239,68,68,0.2)', 'rgba(239,68,68,0.24)')}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#ef4444'
                }}>
                  {viewTarget.nombre_promocion}
                </div>
              </div>

              {/* Cursos */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    <BookOpen size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Curso Principal
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {viewTarget.nombre_curso_principal}
                    <div style={{ fontSize: '0.65rem', color: theme.textMuted, fontWeight: 400, marginTop: '0.125rem' }}>
                      {viewTarget.codigo_curso_principal}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    <Gift size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Curso Gratis
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#10b981'
                  }}>
                    {viewTarget.nombre_curso_promocional}
                    <div style={{ fontSize: '0.65rem', color: theme.textMuted, fontWeight: 400, marginTop: '0.125rem' }}>
                      {viewTarget.codigo_curso_promocional}
                    </div>
                  </div>
                </div>
              </div>

              {/* Beneficio y Cupos */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    Beneficio
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                      {viewTarget.modalidad_promocional === 'clases' ? viewTarget.clases_gratis : viewTarget.meses_gratis}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: theme.textMuted, marginTop: '0.125rem' }}>
                      {viewTarget.modalidad_promocional === 'clases' ? 'Clases Gratis' : 'Meses Gratis'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    Cupos
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: theme.textPrimary }}>
                      {viewTarget.cupos_disponibles
                        ? `${(viewTarget.cupos_disponibles || 0) - (viewTarget.cupos_utilizados || 0)}/${viewTarget.cupos_disponibles}`
                        : 'Ilimitados'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: theme.textMuted, marginTop: '0.125rem' }}>
                      {viewTarget.cupos_utilizados || 0} aceptados
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.textMuted,
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase'
                }}>
                  Estado
                </div>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: viewTarget.activa ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${viewTarget.activa ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '0.5rem',
                  color: viewTarget.activa ? '#10b981' : '#ef4444',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  {viewTarget.activa ? 'Activa' : 'Inactiva'}
                </div>
              </div>

              {/* Descripción */}
              {viewTarget.descripcion && (
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    Descripción
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    lineHeight: 1.5,
                    color: theme.textSecondary
                  }}>
                    {viewTarget.descripcion}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.modalDivider}` }}>
              <button
                onClick={() => setViewTarget(null)}
                style={{
                  width: '100%',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '10px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'}`,
                  background: 'transparent',
                  color: theme.textSecondary,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GestionPromociones;
