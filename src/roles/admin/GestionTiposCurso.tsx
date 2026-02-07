import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus, Edit, Trash2, X, Save, Search, Grid, List, ChevronLeft, ChevronRight,
  FileText, Calendar, DollarSign, CreditCard, Hash, CheckCircle, BookOpen, AlertTriangle, ArrowLeftRight, Eye
} from 'lucide-react';
import { showToast } from '../../config/toastConfig';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

type TipoCurso = {
  id_tipo_curso: number;
  nombre: string;
  descripcion?: string | null;
  duracion_meses?: number | null;
  precio_base?: number | null;
  modalidad_pago?: 'mensual' | 'clases';
  numero_clases?: number | null;
  precio_por_clase?: number | null;
  matricula_incluye_primera_clase?: boolean;
  estado?: 'activo' | 'inactivo';
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

const GestionTiposCurso: React.FC = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [tipos, setTipos] = useState<TipoCurso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<TipoCurso | null>(null);
  const [viewTarget, setViewTarget] = useState<TipoCurso | null>(null); // Estado para modal de ver detalles
  const [tipoToDelete, setTipoToDelete] = useState<TipoCurso | null>(null);

  // Detectar modo oscuro desde localStorage (mismo que usa PanelAdministrativos)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Escuchar cambios en el modo oscuro
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin-dark-mode');
      setDarkMode(saved !== null ? JSON.parse(saved) : true);
    };

    window.addEventListener('storage', handleStorageChange);
    // También escuchar cambios locales
    const interval = setInterval(() => {
      const saved = localStorage.getItem('admin-dark-mode');
      const newMode = saved !== null ? JSON.parse(saved) : true;
      if (newMode !== darkMode) {
        setDarkMode(newMode);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  // Helper function to pick color based on dark mode (matching ControlUsuarios.tsx exactly)
  const pick = (light: string, dark: string) => (darkMode ? dark : light);

  // Color variables matching ControlUsuarios.tsx exactly
  // Color variables matching ControlUsuarios.tsx clean white/slate theme
  const textPrimaryColor = pick('#0f172a', 'rgba(255,255,255,0.98)');
  const textSecondaryColor = pick('#475569', 'rgba(226,232,240,0.7)');
  const textMutedColor = pick('#64748b', 'rgba(148,163,184,0.65)');

  const filterInputBg = pick('#ffffff', 'rgba(255,255,255,0.1)');
  const filterInputBorder = pick('#e2e8f0', 'rgba(255,255,255,0.18)');
  const filterIconColor = pick('#94a3b8', 'rgba(226,232,240,0.6)');

  const tableContainerBg = pick(
    '#ffffff',
    'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
  );
  const tableBorder = pick('#e2e8f0', 'rgba(255,255,255,0.08)');
  const tableHeaderBg = pick('#f8fafc', 'rgba(255,113,113,0.02)');
  const tableHeaderBorder = pick('#e2e8f0', 'rgba(255,255,255,0.08)');
  const tableHeaderText = pick('#64748b', '#ffffff');
  const tableRowDivider = pick('#f1f5f9', 'rgba(255,255,255,0.05)');
  const tableRowHover = pick('#f8fafc', 'rgba(248,113,113,0.08)');

  const paginationSurface = pick(
    '#ffffff',
    'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
  );
  const paginationBorder = pick('#e2e8f0', 'rgba(239,68,68,0.25)');
  const paginationText = pick('#64748b', 'rgba(226,232,240,0.8)');
  const paginationButtonBg = pick('#ffffff', 'rgba(255,255,255,0.1)');
  const paginationButtonBorder = pick('#e2e8f0', 'rgba(255,255,255,0.2)');
  const paginationButtonText = pick('#475569', '#f8fafc');
  const paginationButtonDisabledBg = pick('#f1f5f9', 'rgba(255,255,255,0.05)');
  const paginationButtonDisabledText = pick('#94a3b8', 'rgba(255,255,255,0.3)');
  const activePageBg = pick(
    `linear-gradient(135deg, ${RedColorPalette.primaryLight} 0%, ${RedColorPalette.primary} 100%)`,
    `linear-gradient(135deg, ${RedColorPalette.primary} 0%, ${RedColorPalette.primaryDark} 100%)`
  );
  const activePageBorder = pick('rgba(239,68,68,0.2)', 'rgba(239,68,68,0.4)');
  const inactivePageBg = pick('#f8fafc', 'rgba(255,255,255,0.08)');
  const inactivePageBorder = pick('#e2e8f0', 'rgba(255,255,255,0.15)');

  // Legacy theme object for backwards compatibility with existing code
  const theme = useMemo(() => ({
    cardBg: tableContainerBg,
    cardBorder: tableBorder,
    textPrimary: textPrimaryColor,
    textSecondary: textSecondaryColor,
    textMuted: textMutedColor,
    pillBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.12)',
    pillText: darkMode ? 'rgba(255,255,255,0.6)' : '#b91c1c',
    infoText: paginationText,
    inputBg: filterInputBg,
    inputBorder: filterInputBorder,
    inputIcon: filterIconColor,
    toggleContainerBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(148,163,184,0.12)',
    toggleContainerBorder: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.04)',
    toggleInactive: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(100,116,139,0.7)',
    toggleActiveBg: darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff',
    toggleActiveBorder: darkMode ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.2)',
    toggleActiveShadow: 'none',
    toggleInactiveBg: 'transparent',
    toggleInactiveBorder: '1px solid transparent',
    tableHeaderBg: tableHeaderBg,
    tableHeaderBorder: tableHeaderBorder,
    tableHeaderText: tableHeaderText,
    tableRowDivider: tableRowDivider,
    tableRowAlt: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    tableRowHover: darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    tableText: textPrimaryColor,
    tableMuted: textMutedColor,
    emptyStateBg: darkMode
      ? 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(254,242,242,0.92) 100%)',
    emptyStateText: darkMode ? 'rgba(255,255,255,0.5)' : '#6b7280',
    paginationBg: paginationSurface,
    paginationBorder: paginationBorder,
    modalBg: darkMode
      ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(26,26,46,0.98) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
    modalText: darkMode ? '#fff' : '#1e293b',
    modalInputBg: darkMode ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    modalInputBorder: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
    divider: 'rgba(239, 68, 68, 0.15)',
    priceText: darkMode ? mapToRedScheme('#10b981') : '#047857',
    statusActiveBg: 'rgba(16,185,129,0.1)',
    statusActiveText: '#10b981',
    statusInactiveBg: 'rgba(239,68,68,0.1)',
    statusInactiveText: '#ef4444',
  }), [darkMode, tableContainerBg, tableBorder, textPrimaryColor, textSecondaryColor, textMutedColor, filterInputBg, filterInputBorder, filterIconColor, tableHeaderBg, tableHeaderBorder, tableHeaderText, tableRowDivider, tableRowHover, paginationSurface, paginationBorder, paginationText]);

  // Estados para búsqueda, vista y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Helper: formato de precio consistente
  const formatPrice = (v?: number | null) => {
    if (v === null || v === undefined || isNaN(Number(v))) return '-';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Number(v));
  };

  // Filtrado y paginación
  const filteredTipos = useMemo(() => {
    if (!searchTerm.trim()) return tipos;
    const term = searchTerm.toLowerCase();
    return tipos.filter(t =>
      t.nombre.toLowerCase().includes(term) ||
      (t.descripcion && t.descripcion.toLowerCase().includes(term))
    );
  }, [tipos, searchTerm]);

  const totalPages = Math.ceil(filteredTipos.length / itemsPerPage);
  const paginatedTipos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTipos.slice(start, start + itemsPerPage);
  }, [filteredTipos, currentPage, itemsPerPage]);

  // Reset página al buscar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchTipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/tipos-cursos?limit=200`);
      if (!res.ok) throw new Error('No se pudo cargar tipos de curso');
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.rows)
            ? (data as any).rows
            : [];
      setTipos(list);
    } catch (e: any) {
      const message = e.message || 'Error cargando tipos de curso';
      setError(message);
      showToast.error(message, darkMode);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTipos();
  }, []);

  const openCreate = () => {
    setSelected(null);
    setModalType('create');
    setShowModal(true);
  };
  const openEdit = (t: TipoCurso) => {
    setSelected(t);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewTipo = (t: TipoCurso) => {
    setViewTarget(t);
  };

  const requestDelete = (tipo: TipoCurso) => {
    setTipoToDelete(tipo);
  };

  const handleConfirmDelete = async () => {
    if (!tipoToDelete) return;
    const { id_tipo_curso: id, nombre } = tipoToDelete;
    const deletedName = nombre;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/tipos-cursos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el tipo de curso');
      // Actualizar lista local inmediatamente sin recargar
      setTipos((prev) => prev.filter((t) => t.id_tipo_curso !== id));
      showToast.deleted(
        deletedName
          ? `Tipo de curso "${deletedName}" eliminado`
          : 'Tipo de curso eliminado',
        darkMode
      );
      setTipoToDelete(null);
    } catch (e: any) {
      const message = e.message || 'Error eliminando tipo de curso';
      setError(message);
      showToast.error(message, darkMode);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      nombre: String(fd.get('nombre') || '').trim(),
      descripcion: String(fd.get('descripcion') || ''),
      duracion_meses: fd.get('duracion_meses') ? Number(fd.get('duracion_meses')) : null,
      precio_base: fd.get('precio_base') ? Number(fd.get('precio_base')) : null,
      modalidad_pago: String(fd.get('modalidad_pago') || 'mensual'),
      numero_clases: fd.get('numero_clases') ? Number(fd.get('numero_clases')) : null,
      precio_por_clase: fd.get('precio_por_clase') ? Number(fd.get('precio_por_clase')) : null,
      matricula_incluye_primera_clase: true, // Siempre true por defecto
      estado: String(fd.get('estado') || 'activo'),
    } as Record<string, any>;

    if (!payload.nombre) {
      const message = 'El nombre es obligatorio';
      setError(message);
      showToast.error(message, darkMode);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (modalType === 'create') {
        const res = await fetch(`${API_BASE}/api/tipos-cursos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo crear el tipo de curso');
        const newTipo = await res.json();
        // Agregar el nuevo tipo a la lista inmediatamente
        setTipos(prev => [newTipo, ...prev]);
        showToast.success('Tipo de curso creado correctamente', darkMode);
      } else if (modalType === 'edit' && selected) {
        const res = await fetch(`${API_BASE}/api/tipos-cursos/${selected.id_tipo_curso}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('No se pudo actualizar el tipo de curso');
        const updatedTipo = await res.json();
        // Actualizar el tipo en la lista inmediatamente
        setTipos(prev => prev.map(t =>
          t.id_tipo_curso === selected.id_tipo_curso
            ? { ...t, ...updatedTipo }
            : t
        ));
        showToast.success('Tipo de curso actualizado correctamente', darkMode);
      }
      setShowModal(false);
    } catch (e: any) {
      const message = e.message || 'Error guardando tipo de curso';
      setError(message);
      showToast.error(message, darkMode);
    } finally {
      setLoading(false);
    }
  };

  const placeholderColor = darkMode ? 'rgba(255,255,255,0.6)' : '#9ca3af';
  const textareaPlaceholderColor = darkMode ? 'rgba(255,255,255,0.55)' : '#94a3b8';
  const editActionColor = darkMode ? '#3b82f6' : '#1d4ed8';
  const deleteActionColor = darkMode ? RedColorPalette.primaryDeep : '#b91c1c';
  const cardsTabColor = viewMode === 'cards' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : theme.toggleInactive;
  const tableTabColor = viewMode === 'table' ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : theme.toggleInactive;

  return (
    <div className="gestion-tipos-curso" data-dark={darkMode ? 'true' : 'false'}>
      <style>{`
        .gestion-tipos-curso[data-dark="true"] input::placeholder,
        .gestion-tipos-curso[data-dark="true"] textarea::placeholder {
          color: ${placeholderColor};
        }
        .gestion-tipos-curso[data-dark="false"] input::placeholder {
          color: ${placeholderColor};
        }
        .gestion-tipos-curso[data-dark="false"] textarea::placeholder {
          color: ${textareaPlaceholderColor};
        }
      `}</style>
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Tipos de Curso"
        subtitle="Administra los tipos de curso antes de crear cursos."
        marginBottom={isMobile ? '12px' : '0.5rem'}
      />

      {/* Controles */}
      <GlassEffect
        variant="card"
        tint="neutral"
        intensity="light"
        style={{
          marginBottom: isMobile ? '8px' : '0.5rem',
          padding: '0.5rem',
          boxShadow: 'none',
          borderRadius: '0.375rem',
          border: `1px solid ${filterInputBorder}`
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          gap: '0.75em',
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
            <div style={{ position: 'relative', flex: 1, width: isMobile ? '100%' : 'auto' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: theme.inputIcon,
                }}
              />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar tipo de curso..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0 0.5rem 0 2rem',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,250,252,0.95)',
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: theme.textPrimary,
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  height: '2rem'
                }}
              />
            </div>

            {/* Toggle Vista */}
            <div style={{
              display: 'flex',
              gap: '0.375rem',
              background: theme.toggleContainerBg,
              borderRadius: '0.65rem',
              padding: '0.1875rem',
              width: isSmallScreen ? '100%' : 'auto',
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
                  background: viewMode === 'cards' ? theme.toggleActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '0.5em',
                  color: cardsTabColor,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
              >
                <Grid size={16} color={cardsTabColor} /> {!isMobile && 'Tarjetas'}
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3em',
                  padding: isMobile ? '0.3125rem 0.5rem' : '0.3125rem 0.75rem',
                  background: viewMode === 'table' ? theme.toggleActiveBg : 'transparent',
                  border: 'none',
                  borderRadius: '0.5em',
                  color: tableTabColor,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: 1
                }}
              >
                <List size={16} color={tableTabColor} /> {!isMobile && 'Tabla'}
              </button>
            </div>
          </div>

          {/* Botón Crear */}
          <button
            onClick={openCreate}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
              background: `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
              border: 'none',
              borderRadius: '0.625em',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 0.35rem 1rem rgba(239,68,68,0.35)',
              width: isSmallScreen ? '100%' : 'auto',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} color="currentColor" />
            Nuevo Tipo
          </button>
        </div>


      </GlassEffect>

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(16rem, 90vw), 1fr))',
          gap: '0.9em',
          marginBottom: '1.125em'
        }}>
          {paginatedTipos.map((t) => (
            <div
              key={t.id_tipo_curso}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: '0.625rem',
                padding: '0.625rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.375rem'
                }}>
                  <span
                    style={{
                      color: theme.pillText,
                      fontSize: '0.65rem',
                      background: theme.pillBg,
                      padding: '1px 0.375rem',
                      borderRadius: '0.25rem',
                      border: darkMode ? '1px solid transparent' : '1px solid rgba(239,68,68,0.25)',
                      fontWeight: 600
                    }}
                  >
                    TC-{String(t.id_tipo_curso).padStart(3, '0')}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.125rem',
                      padding: '1px 0.375rem',
                      borderRadius: 4,
                      background: t.estado === 'activo' ? theme.statusActiveBg : theme.statusInactiveBg,
                      color: t.estado === 'activo' ? theme.statusActiveText : theme.statusInactiveText,
                      border: t.estado === 'activo' ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase'
                    }}
                  >
                    {t.estado || 'activo'}
                  </span>
                </div>
                <h3 style={{
                  color: theme.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  lineHeight: '1.2'
                }}>
                  {t.nombre}
                </h3>
              </div>

              <div
                style={{
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,113,113,0.15)'}`,
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.375rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} color={theme.textMuted} />
                    <span style={{ color: theme.textSecondary, fontSize: '0.7rem' }}>
                      {t.duracion_meses != null ? `${t.duracion_meses} meses` : '-'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={12} color={theme.priceText} />
                    <span style={{ color: theme.priceText, fontSize: '0.75rem', fontWeight: 700 }}>
                      {formatPrice(t.precio_base ?? null)}
                    </span>
                  </div>
                </div>

                <p style={{
                  color: theme.textMuted,
                  fontSize: '0.65rem',
                  margin: 0,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '1.85rem'
                }}>
                  {t.descripcion || 'Sin descripción disponible para este tipo de curso.'}
                </p>
              </div>

              {/* Información de modalidad de pago */}
              {t.modalidad_pago === 'clases' && (
                <div style={{
                  marginBottom: '0.5rem',
                  padding: '0.375rem',
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      width: '0.25rem',
                      height: '0.25rem',
                      borderRadius: '50%',
                      background: '#3b82f6'
                    }} />
                    <span style={{ color: '#3b82f6', fontSize: '0.65rem', fontWeight: 600 }}>
                      x Clases ({t.numero_clases || 0})
                    </span>
                  </div>
                  <span style={{
                    color: theme.textSecondary,
                    fontSize: '0.65rem',
                    fontWeight: 500
                  }}>
                    {formatPrice(t.precio_por_clase ?? null)} / clase
                  </span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '0.25rem',
                  borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,113,113,0.15)'}`,
                  paddingTop: '0.5rem',
                  marginTop: 'auto',
                }}
              >
                <button
                  onClick={() => handleViewTipo(t)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem',
                    background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '0.375rem',
                    color: editActionColor,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '24px'
                  }}
                >
                  <Eye size={12} /> Ver
                </button>
                <button
                  onClick={() => openEdit(t)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem',
                    background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '0.375rem',
                    color: editActionColor,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '24px'
                  }}
                >
                  <Edit size={12} /> Editar
                </button>
                <button
                  onClick={() => requestDelete(t)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem',
                    background: darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '0.375rem',
                    color: deleteActionColor,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '24px'
                  }}
                >
                  <Trash2 size={12} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación para vista de cards */}
      {viewMode === 'cards' && totalPages > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '8px' : '0.25rem 1rem',
          background: paginationSurface,
          border: `1px solid ${paginationBorder}`,
          borderRadius: '0.75rem',
          marginTop: '0.5rem',
          marginBottom: isMobile ? '0.75rem' : '0.5rem',
        }}>
          <div style={{
            color: paginationText,
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {currentPage} de {totalPages} • Total: {filteredTipos.length} tipos
          </div>
          <div style={{
            display: 'flex',
            gap: '0.375rem',
            justifyContent: isMobile ? 'center' : 'flex-start',
            flexWrap: 'wrap'
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
                background: currentPage === 1 ? paginationButtonDisabledBg : paginationButtonBg,
                border: `1px solid ${paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: currentPage === 1 ? paginationButtonDisabledText : paginationButtonText,
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
                  background: currentPage === pageNum ? activePageBg : inactivePageBg,
                  border: currentPage === pageNum ? `1px solid ${activePageBorder}` : `1px solid ${inactivePageBorder}`,
                  borderRadius: '0.5rem',
                  color: currentPage === pageNum ? '#ffffff' : paginationButtonText,
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
                background: currentPage === totalPages ? paginationButtonDisabledBg : paginationButtonBg,
                border: `1px solid ${paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: currentPage === totalPages ? paginationButtonDisabledText : paginationButtonText,
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

      {/* Vista Tabla */}
      {viewMode === 'table' && (
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
              border: `1px solid ${theme.cardBorder}`,
              background: theme.cardBg,
              marginBottom: isMobile ? '0.75rem' : '0.5rem'
            }}
          >
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: isSmallScreen ? '700px' : 'auto'
            }}>
              <thead style={{
                borderBottom: `1px solid ${theme.tableHeaderBorder}`,
                background: theme.tableHeaderBg
              }}>
                <tr>
                  <th style={{ padding: '0.25rem 0.5rem', color: theme.tableHeaderText, textAlign: 'left', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '35%' }}>
                    NOMBRE
                  </th>
                  <th style={{ padding: '0.25rem 0.5rem', color: theme.tableHeaderText, textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '15%' }}>
                    Duración
                  </th>
                  <th style={{ padding: '0.25rem 0.5rem', color: theme.tableHeaderText, textAlign: 'right', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '20%' }}>
                    Precio
                  </th>
                  <th style={{ padding: '0.25rem 0.5rem', color: theme.tableHeaderText, textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '15%' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.25rem 0.5rem', color: theme.tableHeaderText, textAlign: 'center', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', width: '15%' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTipos.map((t) => (
                  <tr
                    key={t.id_tipo_curso}
                    style={{
                      borderBottom: `1px solid ${theme.tableRowDivider}`,
                      transition: 'all 0.2s ease',
                      background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.tableRowHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td className="table-nombre-uppercase" style={{ padding: '0.25rem 0.5rem', color: theme.tableText, fontWeight: 600, fontSize: '0.7rem' }}>
                      {t.nombre}
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem', color: theme.textSecondary, textAlign: 'center', fontSize: '0.65rem' }}>
                      {t.duracion_meses != null ? `${t.duracion_meses} meses` : '-'}
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem', color: theme.tableText, textAlign: 'right', fontWeight: 600, fontSize: '0.7rem' }}>
                      {formatPrice(t.precio_base ?? null)}
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem', textAlign: 'center' }}>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[0.65rem] font-medium border ${t.estado === 'activo' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}
                      >
                        {t.estado ? t.estado.toUpperCase() : 'ACTIVO'}
                      </span>
                    </td>
                    <td style={{ padding: '0.25rem 0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleViewTipo(t)}
                          style={{
                            padding: '0.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #3b82f6',
                            backgroundColor: 'transparent',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          title="Ver detalles"
                        >
                          <Eye style={{ width: '0.85rem', height: '0.85rem' }} />
                        </button>
                        <button
                          onClick={() => openEdit(t)}
                          style={{
                            padding: '0.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #3b82f6',
                            backgroundColor: 'transparent',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3b82f6';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          title="Editar"
                        >
                          <Edit style={{ width: '0.85rem', height: '0.85rem' }} />
                        </button>
                        <button
                          onClick={() => requestDelete(t)}
                          style={{
                            padding: '0.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #ef4444',
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          title="Eliminar"
                        >
                          <Trash2 style={{ width: '0.85rem', height: '0.85rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 0 && (
            <div className="pagination-container" style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              gap: isMobile ? '0.75rem' : '0',
              padding: isMobile ? '8px' : '0.25rem 1rem',
              background: paginationSurface,
              border: `1px solid ${paginationBorder}`,
              borderRadius: '0.75rem',
              marginTop: '0.5rem',
              marginBottom: isMobile ? '0.75rem' : '0.5rem',
            }}>
              <div style={{
                color: paginationText,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                Página {currentPage} de {totalPages} • Total: {filteredTipos.length} tipos
              </div>
              <div style={{
                display: 'flex',
                gap: '0.375rem',
                justifyContent: isMobile ? 'center' : 'flex-start',
                flexWrap: 'wrap'
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
                    background: currentPage === 1 ? paginationButtonDisabledBg : paginationButtonBg,
                    border: `1px solid ${paginationButtonBorder}`,
                    borderRadius: '0.625rem',
                    color: currentPage === 1 ? paginationButtonDisabledText : paginationButtonText,
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
                      background: currentPage === pageNum ? activePageBg : inactivePageBg,
                      border: currentPage === pageNum ? `1px solid ${activePageBorder}` : `1px solid ${inactivePageBorder}`,
                      borderRadius: '0.5rem',
                      color: currentPage === pageNum ? '#ffffff' : paginationButtonText,
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
                    background: currentPage === totalPages ? paginationButtonDisabledBg : paginationButtonBg,
                    border: `1px solid ${paginationButtonBorder}`,
                    borderRadius: '0.625rem',
                    color: currentPage === totalPages ? paginationButtonDisabledText : paginationButtonText,
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
        </>
      )}

      {/* Estados vacíos y errores */}
      {
        !loading && filteredTipos.length === 0 && (
          <div
            style={{
              color: theme.emptyStateText,
              padding: '60px 1.25rem',
              textAlign: 'center',
              fontSize: '1rem',
              background: theme.emptyStateBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {searchTerm ? 'No se encontraron tipos de curso' : 'No hay tipos de curso registrados'}
          </div>
        )
      }
      {
        loading && (
          <div
            style={{
              color: theme.emptyStateText,
              padding: '60px 1.25rem',
              textAlign: 'center',
              fontSize: '1rem',
              background: theme.emptyStateBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            Cargando tipos de curso...
          </div>
        )
      }
      {
        error && (
          <div style={{
            color: '#ef4444',
            padding: '1.25rem',
            textAlign: 'center',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1rem',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )
      }



      {
        showModal && createPortal(
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
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                width: isMobile ? '92vw' : '60vw',
                maxWidth: isMobile ? '92vw' : '60vw',
                maxHeight: '85vh',
                padding: isMobile ? '0.75rem 0.875rem' : '1rem 1.5rem',
                margin: 'auto',
                color: darkMode ? '#fff' : '#1e293b',
                boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
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
                  marginBottom: isMobile ? 12 : 14,
                  paddingBottom: isMobile ? 8 : 10,
                  borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={isMobile ? 18 : 20} />
                  <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em', color: darkMode ? '#fff' : '#1e293b' }}>
                    {modalType === 'create' ? 'Nuevo Tipo de Curso' : 'Editar Tipo de Curso'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '8px',
                    padding: '6px',
                    color: darkMode ? '#fff' : '#1e293b',
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
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 10 : 12, columnGap: isSmallScreen ? 0 : 16 }}>
                  {/* Nombre - 2 columnas */}
                  <div style={{ gridColumn: isSmallScreen ? '1 / -1' : 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <FileText size={14} />
                      Nombre del tipo
                    </label>
                    <input
                      name="nombre"
                      placeholder="Ej. Cosmetología, Maquillaje Profesional"
                      defaultValue={selected?.nombre || ''}
                      required
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.8rem',
                        transition: 'all 0.2s ease',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
                      }}
                    />
                  </div>

                  {/* Estado - 1 columna */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <CheckCircle size={14} />
                      Estado
                    </label>
                    <StyledSelect
                      name="estado"
                      defaultValue={selected?.estado || 'activo'}
                      options={[
                        { value: 'activo', label: 'Activo' },
                        { value: 'inactivo', label: 'Inactivo' },
                      ]}
                      darkMode={darkMode}
                      style={{
                        padding: '7px 10px',
                        fontSize: '0.8rem',
                        borderRadius: 6
                      }}
                    />
                  </div>

                  {/* Descripción - ancho completo, más compacta */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <FileText size={14} />
                      Descripción (opcional)
                    </label>
                    <textarea
                      name="descripcion"
                      defaultValue={selected?.descripcion || ''}
                      placeholder="Resumen del programa, objetivos y beneficios."
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.75rem',
                        resize: 'vertical',
                        minHeight: '50px'
                      }}
                    />
                  </div>

                  {/* Separador */}
                  <div style={{ gridColumn: '1 / -1', height: 1, background: 'rgba(239, 68, 68, 0.2)', margin: '6px 0' }} />

                  {/* Modalidad de Pago */}
                  <div style={{ gridColumn: isSmallScreen ? '1 / -1' : 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <CreditCard size={14} />
                      Modalidad de Pago
                    </label>
                    <StyledSelect
                      name="modalidad_pago"
                      defaultValue={selected?.modalidad_pago || 'mensual'}
                      options={[
                        { value: 'mensual', label: 'Mensual - Cuotas por meses' },
                        { value: 'clases', label: 'Por Clases - Pago individual por clase' },
                      ]}
                      darkMode={darkMode}
                      style={{
                        padding: '7px 10px',
                        fontSize: '0.8rem',
                        borderRadius: 6
                      }}
                      onChange={(e) => {
                        const isClases = e.target.value === 'clases';
                        const numeroClasesDiv = document.querySelector('[data-field="numero_clases"]') as HTMLDivElement;
                        const precioPorClaseDiv = document.querySelector('[data-field="precio_por_clase"]') as HTMLDivElement;
                        if (numeroClasesDiv && precioPorClaseDiv) {
                          numeroClasesDiv.style.display = isClases ? 'block' : 'none';
                          precioPorClaseDiv.style.display = isClases ? 'block' : 'none';
                        }
                      }}
                    />
                  </div>

                  {/* Duración */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <Calendar size={14} />
                      Duración (meses)
                    </label>
                    <input
                      type="number"
                      min={1}
                      name="duracion_meses"
                      placeholder="Ej. 6"
                      defaultValue={selected?.duracion_meses ?? ''}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  {/* Precio base */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <DollarSign size={14} />
                      Precio base (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name="precio_base"
                      placeholder="Ej. 2500"
                      defaultValue={selected?.precio_base ?? ''}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  {/* Campos específicos para modalidad "clases" */}
                  <div data-field="numero_clases" style={{ display: selected?.modalidad_pago === 'clases' ? 'block' : 'none' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <Hash size={14} />
                      Número de Clases
                    </label>
                    <input
                      type="number"
                      min={1}
                      name="numero_clases"
                      placeholder="Ej. 16"
                      defaultValue={selected?.numero_clases ?? ''}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>

                  <div data-field="precio_por_clase" style={{ display: selected?.modalidad_pago === 'clases' ? 'block' : 'none' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 5, color: darkMode ? 'rgba(255,255,255,0.9)' : '#1e293b', fontWeight: 500, fontSize: '0.8rem' }}>
                      <DollarSign size={14} />
                      Precio por Clase (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      name="precio_por_clase"
                      placeholder="Ej. 15.40"
                      defaultValue={selected?.precio_por_clase ?? ''}
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
                        borderRadius: 6,
                        color: darkMode ? '#fff' : '#1e293b',
                        fontSize: '0.8rem',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: isSmallScreen ? 'column-reverse' : 'row', gap: isMobile ? 10 : 12, marginTop: isMobile ? 16 : 24, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                      background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      border: darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                      borderRadius: isMobile ? 10 : 12,
                      color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.8)',
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      width: isSmallScreen ? '100%' : 'auto'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: isMobile ? 10 : 12,
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      width: isSmallScreen ? '100%' : 'auto'
                    }}
                  >
                    <Save size={16} />
                    {modalType === 'create' ? 'Crear' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>

            {/* Animaciones CSS */}
            <style>{`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(100%);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
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
          </div>,
          document.body
        )
      }

      {
        tipoToDelete && createPortal(
          <div
            onClick={() => !loading && setTipoToDelete(null)}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(10px)',
              zIndex: 99990,
              padding: isMobile ? '1.25rem' : '2rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: isMobile ? '360px' : '420px',
                background: darkMode
                  ? 'linear-gradient(135deg, rgba(31,31,31,0.95) 0%, rgba(60,16,16,0.92) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,228,228,0.92) 100%)',
                borderRadius: '1rem',
                border: `1px solid ${darkMode ? 'rgba(239,68,68,0.35)' : 'rgba(239,68,68,0.45)'}`,
                boxShadow: darkMode
                  ? '0 24px 48px rgba(239,68,68,0.22)'
                  : '0 24px 48px rgba(239,68,68,0.18)',
                padding: isMobile ? '1.25rem' : '1.75rem',
                color: darkMode ? '#fff' : '#1f2937',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: darkMode ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.15)',
                    border: darkMode ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(239,68,68,0.35)'
                  }}
                >
                  <AlertTriangle size={26} color={darkMode ? '#f87171' : '#dc2626'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    ¿Eliminar tipo de curso?
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: darkMode ? 'rgba(255,255,255,0.75)' : '#4b5563', lineHeight: 1.5 }}>
                    Esta acción eliminará permanentemente el tipo de curso
                    <strong> "{tipoToDelete.nombre}"</strong> y no podrá deshacerse.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem' }}>
                <button
                  onClick={() => setTipoToDelete(null)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: darkMode ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(239,68,68,0.2)',
                    background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: darkMode ? 'rgba(255,255,255,0.85)' : '#1f2937',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    background: loading
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.6), rgba(220,38,38,0.6))'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 12px 24px rgba(239,68,68,0.32)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

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
              boxShadow: theme.toggleActiveShadow,
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
              borderBottom: `1px solid ${theme.divider}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h2 style={{
                  margin: 0,
                  fontSize: isMobile ? '1.125rem' : '1.25rem',
                  fontWeight: 700,
                  color: theme.textPrimary
                }}>
                  Detalles del Tipo de Curso
                </h2>
              </div>
              <button
                onClick={() => setViewTarget(null)}
                style={{
                  background: pick('rgba(15,23,42,0.06)', 'rgba(255,255,255,0.05)'),
                  border: `1px solid ${theme.divider}`,
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
                  e.currentTarget.style.borderColor = theme.divider;
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido */}
            <div style={{ display: 'grid', gap: '0.875rem' }}>
              {/* Código y Estado */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    <Hash size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Código
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}>
                    TC-{String(viewTarget.id_tipo_curso).padStart(3, '0')}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
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
                    background: viewTarget.estado === 'activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${viewTarget.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '0.5rem',
                    color: viewTarget.estado === 'activo' ? '#10b981' : '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    textTransform: 'uppercase'
                  }}>
                    {viewTarget.estado || 'ACTIVO'}
                  </div>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: theme.textMuted,
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase'
                }}>
                  <FileText size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Nombre
                </div>
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: pick('rgba(239,68,68,0.08)', 'rgba(239,68,68,0.12)'),
                  border: `1px solid ${pick('rgba(239,68,68,0.2)', 'rgba(239,68,68,0.24)')}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#ef4444'
                }}>
                  {viewTarget.nombre}
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

              {/* Detalles Financieros y Duración */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: theme.textMuted,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase'
                  }}>
                    <Calendar size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Duración
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {viewTarget.duracion_meses ? `${viewTarget.duracion_meses} meses` : '-'}
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
                    <DollarSign size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Precio Base
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#10b981',
                    textAlign: 'center'
                  }}>
                    {formatPrice(viewTarget.precio_base)}
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
                    <CreditCard size={10} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    Modalidad
                  </div>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {viewTarget.modalidad_pago === 'clases' ? 'Por Clases' : 'Mensual'}
                  </div>
                </div>
              </div>

              {/* Detalles Específicos Clases */}
              {viewTarget.modalidad_pago === 'clases' && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '0.5rem',
                  marginTop: '0.25rem'
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#3b82f6',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}>
                    Detalles de Modalidad por Clases
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: theme.textMuted, marginBottom: '2px' }}>Total Clases</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.textPrimary }}>{viewTarget.numero_clases || 0}</div>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(59, 130, 246, 0.2)' }}></div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.65rem', color: theme.textMuted, marginBottom: '2px' }}>Precio por Clase</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>{formatPrice(viewTarget.precio_por_clase)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${theme.divider}` }}>
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
    </div >
  );
};

export default GestionTiposCurso;



