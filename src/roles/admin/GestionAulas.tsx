import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Edit, X, MapPin, Building2, Calendar, Grid, List, ChevronLeft, ChevronRight, Hash, FileText
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { showToast } from '../../config/toastConfig';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

// Tipos
interface Aula {
  id_aula: number;
  codigo_aula: string;
  nombre: string;
  ubicacion?: string;
  descripcion?: string;
  estado: 'activa' | 'inactiva' | 'mantenimiento' | 'reservada';
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type FormState = {
  nombre: string;
  ubicacion: string;
  descripcion: string;
  estado: 'activa' | 'inactiva' | 'mantenimiento' | 'reservada';
};

const createEmptyForm = (): FormState => ({
  nombre: '',
  ubicacion: '',
  descripcion: '',
  estado: 'activa'
});

const GestionAulas = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();

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

  const pick = (light: string, dark: string) => (darkMode ? dark : light);

  const textPrimary = 'var(--admin-text-primary, #1f2937)';
  const textSecondary = 'var(--admin-text-secondary, rgba(30,41,59,0.85))';
  const textMuted = 'var(--admin-text-muted, rgba(71,85,105,0.6))';

  const palette = {
    toggleGroupBg: pick('rgba(148, 163, 184, 0.12)', 'rgba(255, 255, 255, 0.08)'),
    toggleInactiveText: pick('rgba(71, 85, 105, 0.75)', 'rgba(226, 232, 240, 0.7)'),
    toggleInactiveBorder: pick('rgba(148, 163, 184, 0.2)', 'rgba(148, 163, 184, 0.18)'),
    toggleActiveBg: pick('rgba(248, 250, 252, 0.95)', 'rgba(255, 255, 255, 0.12)'),
    toggleActiveShadow: pick('0 0.75rem 1.5rem rgba(15, 23, 42, 0.12)', '0 0.75rem 1.8rem rgba(0, 0, 0, 0.4)'),
    searchIcon: pick('rgba(100, 116, 139, 0.6)', 'rgba(226, 232, 240, 0.6)'),
    inputBg: 'var(--admin-input-bg, rgba(15,23,42,0.05))',
    inputBorder: 'var(--admin-input-border, rgba(15,23,42,0.1))',
    inputText: pick('#1f2937', '#f8fafc'),
    placeholder: pick('rgba(100, 116, 139, 0.6)', 'rgba(148, 163, 184, 0.65)'),
    paginationSurface: pick(
      'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)',
      'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
    ),
    paginationBorder: pick('rgba(239, 68, 68, 0.14)', 'rgba(239, 68, 68, 0.25)'),
    paginationText: pick('rgba(30, 41, 59, 0.85)', 'rgba(226, 232, 240, 0.9)'),
    paginationButtonBg: pick('rgba(248, 250, 252, 0.9)', 'rgba(255, 255, 255, 0.1)'),
    paginationButtonBorder: pick('rgba(226, 232, 240, 0.7)', 'rgba(255, 255, 255, 0.2)'),
    paginationButtonText: pick('rgba(30, 41, 59, 0.85)', '#f8fafc'),
    paginationButtonDisabledBg: pick('rgba(226, 232, 240, 0.5)', 'rgba(255, 255, 255, 0.05)'),
    paginationButtonDisabledText: pick('rgba(148, 163, 184, 0.6)', 'rgba(255, 255, 255, 0.3)'),
    paginationButtonShadow: pick('0 0.5rem 1.5rem rgba(15, 23, 42, 0.12)', '0 0.5rem 1.5rem rgba(0, 0, 0, 0.35)'),
    tableActionBg: pick('rgba(245, 158, 11, 0.15)', 'rgba(245, 158, 11, 0.2)'),
    tableActionBorder: pick('rgba(245, 158, 11, 0.24)', 'rgba(245, 158, 11, 0.3)'),
    tableActionText: pick('#b45309', '#fbbf24')
  };

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const styleId = 'gestion-aulas-search-placeholder-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;
    let created = false;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        .gestion-aulas-search-input::placeholder {
          color: var(--gestion-aulas-placeholder);
          opacity: 1;
        }
      `;
      document.head.appendChild(styleElement);
      created = true;
    }

    return () => {
      if (created && styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  const [aulas, setAulas] = useState<Aula[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const [formData, setFormData] = useState<FormState>(() => createEmptyForm());

  const [autoGeneratedCode, setAutoGeneratedCode] = useState('');

  const generateInitials = (nombre: string): string => {
    return nombre
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const generateAulaCode = async (nombreAula: string): Promise<string> => {
    if (!nombreAula.trim()) return '';

    const initials = generateInitials(nombreAula);

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/aulas?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return `${initials}-AUL-001`;
      }

      const data = await response.json();
      const existingCodes = data.aulas?.map((a: any) => a.codigo_aula) || [];

      let nextNumber = 1;
      let newCode = '';

      do {
        newCode = `${initials}-AUL-${nextNumber.toString().padStart(3, '0')}`;
        nextNumber++;
      } while (existingCodes.includes(newCode));

      return newCode;

    } catch (error) {
      return `${initials}-AUL-001`;
    }
  };

  const fetchAulas = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (searchTerm) params.set('search', searchTerm);
      if (filterEstado !== 'todos') params.set('estado', filterEstado);

      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/aulas?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAulas(data.aulas || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      console.error('Error al obtener aulas:', err);
      showToast.error(err instanceof Error ? err.message : 'Error desconocido', darkMode);
      setAulas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAula = async () => {
    try {
      setLoading(true);

      const codigo = autoGeneratedCode || await generateAulaCode(formData.nombre);

      const aulaData = {
        ...formData,
        codigo_aula: codigo
      };

      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/aulas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(aulaData),
      });

      if (!response.ok) {
        throw new Error('Error al crear aula');
      }

      await fetchAulas();
      setShowCreateModal(false);
      setFormData(createEmptyForm());
      setAutoGeneratedCode('');
      setSelectedAula(null);
      showToast.success('Aula creada correctamente', darkMode);
    } catch (err) {
      console.error('Error al crear aula:', err);
      showToast.error(err instanceof Error ? err.message : 'Error al crear aula', darkMode);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAula = async () => {
    if (!selectedAula) return;

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/aulas/${selectedAula.id_aula}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar aula');
      }

      await fetchAulas();
      setShowModal(false);
      setSelectedAula(null);
      setFormData(createEmptyForm());
      setAutoGeneratedCode('');
      showToast.success('Aula actualizada correctamente', darkMode);
    } catch (err) {
      console.error('Error al actualizar aula:', err);
      showToast.error(err instanceof Error ? err.message : 'Error al actualizar aula', darkMode);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAulas();
  }, [page, limit, searchTerm, filterEstado]);

  const openEditModal = (aula: Aula) => {
    setShowCreateModal(false);
    setSelectedAula(aula);
    setFormData({
      nombre: aula.nombre,
      ubicacion: aula.ubicacion || '',
      descripcion: aula.descripcion || '',
      estado: aula.estado
    });
    setAutoGeneratedCode('');
    setShowModal(true);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return '#10b981';
      case 'inactiva': return '#6b7280';
      case 'mantenimiento': return '#f59e0b';
      case 'reservada': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'inactiva': return 'Inactiva';
      case 'mantenimiento': return 'Mantenimiento';
      case 'reservada': return 'Reservada';
      default: return estado;
    }
  };

  const aulasSorted = [...aulas].sort((a, b) => a.id_aula - b.id_aula);
  const totalPages = Math.ceil(totalCount / limit);
  const aulasActivas = aulasSorted.filter(a => a.estado === 'activa').length;
  const isCardsView = viewMode === 'cards';
  const isTableView = viewMode === 'table';

  const searchInputStyles: (CSSProperties & Record<'--gestion-aulas-placeholder', string>) = {
    width: '100%',
    padding: '0.625em 0.625em 0.625em 2.375em',
    background: palette.inputBg,
    border: `0.0625rem solid ${palette.inputBorder}`,
    borderRadius: '0.625em',
    color: palette.inputText,
    fontSize: '0.875rem',
    transition: 'background 0.2s ease, border 0.2s ease',
    outline: 'none',
    '--gestion-aulas-placeholder': palette.placeholder
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
      color: textPrimary
    }}>
      {/* Header */}
      <AdminSectionHeader
        title="Gestión de Aulas"
        subtitle="Administra las aulas y espacios físicos de la institución"
      />

      {/* Controles */}
      <GlassEffect variant="card" tint="neutral" intensity="light" style={{ marginBottom: '1em' }}>
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
            <div style={{ position: 'relative', minWidth: isMobile ? 'auto' : 'min(17.5rem, 30vw)', flex: isMobile ? '1' : 'initial' }}>
              <Search
                size={isMobile ? 14 : 16}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: palette.searchIcon,
                  transition: 'color 0.2s ease',
                  pointerEvents: 'none'
                }}
                color={palette.searchIcon}
              />
              <input
                className="gestion-aulas-search-input"
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar por código, nombre o ubicación..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyles}
              />
            </div>

            {/* Filtros */}
            <div style={{ minWidth: isMobile ? 'auto' : 'min(12.5rem, 20vw)', flex: isMobile ? '1' : 'initial' }}>

              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                options={[
                  { value: 'todos', label: 'Todos los estados' },
                  { value: 'activa', label: 'Activa' },
                  { value: 'inactiva', label: 'Inactiva' },
                  { value: 'mantenimiento', label: 'Mantenimiento' },
                  { value: 'reservada', label: 'Reservada' }
                ]}
              />
            </div>

            {/* Toggle Vista */}
            <div style={{
              display: 'flex',
              gap: '0.375em',
              background: palette.toggleGroupBg,
              borderRadius: '0.625em',
              padding: '0.1875em',
              width: isSmallScreen ? '100%' : 'auto'
            }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35em',
                  padding: isMobile ? '0.4em 0.6em' : '0.4em 0.85em',
                  background: isCardsView ? palette.toggleActiveBg : 'transparent',
                  border: `0.0625rem solid ${isCardsView ? palette.toggleInactiveBorder : 'transparent'}`,
                  borderRadius: '0.55em',
                  color: isCardsView ? RedColorPalette.primary : palette.toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: isCardsView ? palette.toggleActiveShadow : 'none',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <Grid size={16} color={isCardsView ? RedColorPalette.primary : palette.toggleInactiveText} />
                {!isMobile && (
                  <span style={{ color: isCardsView ? RedColorPalette.primary : palette.toggleInactiveText }}>
                    Tarjetas
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35em',
                  padding: isMobile ? '0.4em 0.6em' : '0.5em 0.95em',
                  background: isTableView ? palette.toggleActiveBg : 'transparent',
                  border: `0.0625rem solid ${isTableView ? palette.toggleInactiveBorder : 'transparent'}`,
                  borderRadius: '0.55em',
                  color: isTableView ? RedColorPalette.primary : palette.toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  boxShadow: isTableView ? palette.toggleActiveShadow : 'none',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <List size={16} color={isTableView ? RedColorPalette.primary : palette.toggleInactiveText} />
                {!isMobile && (
                  <span style={{ color: isTableView ? RedColorPalette.primary : palette.toggleInactiveText }}>
                    Tabla
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Botón Crear */}
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedAula(null);
              setShowCreateModal(true);
              setFormData(createEmptyForm());
              setAutoGeneratedCode('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              padding: isMobile ? '0.625em 1em' : '0.75em 1.5em',
              background: `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
              border: 'none',
              borderRadius: '0.625em',
              color: textPrimary,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 0.25rem 0.75em rgba(239, 68, 68, 0.3)',
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Plus size={16} />
            Nueva Aula
          </button>
        </div>
      </GlassEffect>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(8.75rem, 45vw), 1fr))', gap: '0.75em', marginBottom: '1em' }}>
        <GlassEffect variant="card" tint="red" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: RedColorPalette.primary, marginBottom: '0.25rem' }}>
            {totalCount}
          </div>
          <div style={{ color: textSecondary, fontSize: '0.7rem' }}>
            Total Aulas
          </div>
        </GlassEffect>

        <GlassEffect variant="card" tint="success" intensity="light" style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: mapToRedScheme('#10b981'), marginBottom: '0.25rem' }}>
            {aulasActivas}
          </div>
          <div style={{ color: textSecondary, fontSize: '0.7rem' }}>
            Aulas Activas
          </div>
        </GlassEffect>
      </div>

      {/* Vista Cards */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(16rem, 90vw), 1fr))', gap: '0.9em', marginBottom: '1.125em' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', padding: '2.5em 1.25em', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
              Cargando aulas...
            </div>
          ) : aulasSorted.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '2.5em 1.25em', textAlign: 'center', color: textMuted, fontSize: '0.85rem' }}>
              No hay aulas registradas
            </div>
          ) : (
            aulasSorted.map((aula) => (
              <GlassEffect
                key={aula.id_aula}
                variant="card"
                tint="red"
                intensity="light"
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 size={18} color={RedColorPalette.primary} />
                    </div>
                    <div>
                      <h3 style={{ color: textPrimary, margin: '0 0 0.2rem 0', fontSize: '0.95rem', fontWeight: 700 }}>
                        {aula.nombre}
                      </h3>
                      <span style={{
                        display: 'inline-flex',
                        padding: '0.15rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: `${getEstadoColor(aula.estado)}20`,
                        border: `1px solid ${getEstadoColor(aula.estado)}40`,
                        color: getEstadoColor(aula.estado),
                        letterSpacing: '0.05em',
                        marginBottom: '0.3rem'
                      }}>
                        {getEstadoText(aula.estado)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                  gap: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    <div>
                      <div style={{ color: textMuted, fontSize: '0.65rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <Hash size={12} />
                        Código
                      </div>
                      <div style={{ color: textPrimary, fontSize: '0.8rem', fontWeight: 600 }}>
                        {aula.codigo_aula}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: textMuted, fontSize: '0.65rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <Calendar size={12} />
                        Fecha Creación
                      </div>
                      <div style={{ color: textPrimary, fontSize: '0.75rem' }}>
                        {new Date(aula.fecha_creacion).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.55rem' }}>
                    <div>
                      <div style={{ color: textMuted, fontSize: '0.65rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <MapPin size={12} />
                        Ubicación
                      </div>
                      <div style={{ color: textPrimary, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {aula.ubicacion || 'No especificada'}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: textMuted, fontSize: '0.65rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                        <FileText size={12} />
                        Descripción
                      </div>
                      <div style={{
                        color: textPrimary,
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {aula.descripcion || 'Sin descripción registrada'}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(aula)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.6rem',
                    background: palette.tableActionBg,
                    border: `0.0625rem solid ${palette.tableActionBorder}`,
                    borderRadius: '0.5rem',
                    color: palette.tableActionText,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    marginTop: '0.55rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = pick('rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.3)');
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.tableActionBg;
                  }}
                >
                  <Edit size={14} color={palette.tableActionText} />
                  Editar
                </button>
              </GlassEffect>
            ))
          )}
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '1em',
          overflow: 'hidden',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          marginBottom: '1.5em'
        }}>
          {/* Indicador de scroll en móvil */}
          {isSmallScreen && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '8px 0.75rem',
              margin: '0.75rem',
              color: '#ef4444',
              fontSize: '0.75rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem'
            }}>
              <span>👉</span>
              <span>Desliza horizontalmente para ver toda la tabla</span>
              <span>👈</span>
            </div>
          )}

          <div className="responsive-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  background: 'rgba(248, 113, 113, 0.15)',
                  borderBottom: '1px solid rgba(248, 113, 113, 0.3)'
                }}>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'left', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Código
                  </th>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'left', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    NOMBRE
                  </th>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'left', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Ubicación
                  </th>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'center', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Estado
                  </th>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'left', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Fecha Creación
                  </th>
                  <th style={{ padding: '10px 0.75rem', textAlign: 'center', color: textPrimary, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: textMuted }}>
                      Cargando aulas...
                    </td>
                  </tr>
                ) : aulasSorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: textMuted }}>
                      No hay aulas registradas
                    </td>
                  </tr>
                ) : (
                  aulasSorted.map((aula, index) => (
                    <tr
                      key={aula.id_aula}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#f87171',
                          fontSize: '0.8rem'
                        }}>
                          {aula.codigo_aula}
                        </div>
                      </td>
                      <td className="table-nombre-uppercase" style={{ padding: '0.75rem' }}>
                        <div style={{
                          fontWeight: '600',
                          color: textPrimary,
                          fontSize: '0.85rem',
                          marginBottom: '0.125rem'
                        }}>
                          {aula.nombre}
                        </div>
                        {aula.descripcion && (
                          <div style={{
                            fontSize: '0.7rem',
                            color: textMuted,
                            maxWidth: '12.5rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {aula.descripcion}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          color: textSecondary,
                          fontSize: '0.8rem'
                        }}>
                          <MapPin size={12} />
                          {aula.ubicacion || 'No especificada'}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 0.625rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: `${getEstadoColor(aula.estado)}20`,
                          color: getEstadoColor(aula.estado),
                          border: `1px solid ${getEstadoColor(aula.estado)}40`
                        }}>
                          {getEstadoText(aula.estado)}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          color: textSecondary,
                          fontSize: '0.75rem'
                        }}>
                          <Calendar size={12} />
                          {new Date(aula.fecha_creacion).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => openEditModal(aula)}
                          style={{
                            padding: '0.375rem 0.625rem',
                            background: palette.tableActionBg,
                            border: `0.0625rem solid ${palette.tableActionBorder}`,
                            color: palette.tableActionText,
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = pick('rgba(245, 158, 11, 0.22)', 'rgba(245, 158, 11, 0.3)');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = palette.tableActionBg;
                          }}
                        >
                          <Edit size={12} color={palette.tableActionText} />
                          Editar
                        </button>
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
      {!loading && aulasSorted.length > 0 && totalPages > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '16px' : '20px 1.5rem',
          background: palette.paginationSurface,
          border: `1px solid ${palette.paginationBorder}`,
          borderRadius: '1rem',
          boxShadow: darkMode
            ? '0 1rem 2.5rem rgba(0, 0, 0, 0.35)'
            : '0 1rem 2.5rem rgba(15, 23, 42, 0.12)',
        }}>
          <div style={{
            color: palette.paginationText,
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {totalPages} • Total: {totalCount} aulas
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
            alignItems: 'stretch',
            width: isMobile ? '100%' : 'auto'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '0 0.75rem' : '0 1rem',
                height: isMobile ? '2.75rem' : '2.5rem',
                minHeight: isMobile ? '2.75rem' : '2.5rem',
                minWidth: isMobile ? '3.25rem' : 'auto',
                background: page === 1 ? palette.paginationButtonDisabledBg : palette.paginationButtonBg,
                border: `1px solid ${palette.paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: page === 1 ? palette.paginationButtonDisabledText : palette.paginationButtonText,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1 1 100%' : '0 0 auto',
                boxShadow: page === 1 ? 'none' : palette.paginationButtonShadow,
                whiteSpace: 'nowrap'
              }}
            >
              <ChevronLeft size={isMobile ? 14 : 16} />
              {!isMobile && 'Anterior'}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? '0 0.75rem' : '0 0.875rem',
                  height: isMobile ? '2.75rem' : '2.5rem',
                  minHeight: isMobile ? '2.75rem' : '2.5rem',
                  minWidth: isMobile ? '3rem' : '2.75rem',
                  background: page === pageNum
                    ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`
                    : palette.paginationButtonBg,
                  border: `1px solid ${page === pageNum ? RedColorPalette.primary : palette.paginationButtonBorder}`,
                  borderRadius: '0.625rem',
                  color: page === pageNum ? '#fff' : palette.paginationButtonText,
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? '1 1 3rem' : '0 0 auto',
                  boxShadow: page === pageNum ? palette.paginationButtonShadow : 'none',
                  whiteSpace: 'nowrap'
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
                gap: isMobile ? '4px' : '0.375rem',
                padding: isMobile ? '0 0.75rem' : '0 1rem',
                height: isMobile ? '2.75rem' : '2.5rem',
                minHeight: isMobile ? '2.75rem' : '2.5rem',
                minWidth: isMobile ? '3.25rem' : 'auto',
                background: page === totalPages ? palette.paginationButtonDisabledBg : palette.paginationButtonBg,
                border: `1px solid ${palette.paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: page === totalPages ? palette.paginationButtonDisabledText : palette.paginationButtonText,
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1 1 100%' : '0 0 auto',
                boxShadow: page === totalPages ? 'none' : palette.paginationButtonShadow,
                whiteSpace: 'nowrap'
              }}
            >
              {!isMobile && 'Siguiente'}
              <ChevronRight size={isMobile ? 14 : 16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Crear Aula */}
      {showCreateModal && createPortal(
        <div
          className="modal-overlay"
          onClick={() => {
            setShowCreateModal(false);
            setFormData(createEmptyForm());
            setAutoGeneratedCode('');
            setSelectedAula(null);
          }}
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
            padding: '1rem',
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
              width: '92vw',
              maxWidth: '600px',
              maxHeight: '85vh',
              margin: 'auto',
              padding: '1.5rem',
              color: textPrimary,
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
              animation: 'scaleIn 0.3s ease-out',
              overflowY: 'auto'
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
                <Building2 size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                  Nueva Aula
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData(createEmptyForm());
                  setAutoGeneratedCode('');
                  setSelectedAula(null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
                  color: textPrimary,
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '1.25rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '16px' : '1.25rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Código
                  </label>
                  <input
                    type="text"
                    value={autoGeneratedCode || 'Se genera automáticamente'}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      color: textMuted,
                      fontSize: '0.8rem',
                      cursor: 'not-allowed'
                    }}
                  />
                  <div style={{
                    fontSize: '0.75rem',
                    color: textMuted,
                    marginTop: '0.25rem'
                  }}>
                    Se genera automáticamente
                  </div>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={async (e) => {
                      const nombre = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, nombre }));

                      if (nombre.trim().length > 2) {
                        try {
                          const codigo = await generateAulaCode(nombre);
                          setAutoGeneratedCode(codigo);
                        } catch (error) {
                          const initials = generateInitials(nombre);
                          setAutoGeneratedCode(`${initials}-AUL-001`);
                        }
                      } else {
                        setAutoGeneratedCode('');
                      }
                    }}
                    placeholder="Ej: Aula de Cosmetología"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.08)',
                      color: textPrimary,
                      fontSize: '0.8rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: textSecondary,
                  fontSize: '0.875rem'
                }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del aula..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                    borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: textPrimary,
                    fontSize: '0.8rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="Ej: Edificio A - Piso 2"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.08)',
                      color: textPrimary,
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    color: textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Estado
                  </label>
                  <StyledSelect
                    name="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as FormState['estado'] }))}
                    options={[
                      { value: 'activa', label: 'Activa' },
                      { value: 'inactiva', label: 'Inactiva' },
                      { value: 'mantenimiento', label: 'Mantenimiento' },
                      { value: 'reservada', label: 'Reservada' }
                    ]}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      background: 'rgba(255,255,255,0.08)',
                      color: textPrimary,
                      fontSize: '0.8rem'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: '0.75rem',
              marginTop: isMobile ? '24px' : '2rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData(createEmptyForm());
                  setAutoGeneratedCode('');
                  setSelectedAula(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  color: textSecondary,
                  border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
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
                onClick={handleCreateAula}
                disabled={!formData.nombre.trim() || loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: !formData.nombre.trim() || loading ? 'rgba(255,255,255,0.05)' : RedColorPalette.primary,
                  color: !formData.nombre.trim() || loading ? textMuted : '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: !formData.nombre.trim() || loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Creando...
                  </>
                ) : (
                  <>
                    <Building2 size={16} />
                    Crear Aula
                  </>
                )}
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
        </div>,
        document.body
      )}

      {/* Modal Editar Aula */}
      {showModal && selectedAula && createPortal(
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setSelectedAula(null);
            setFormData(createEmptyForm());
            setAutoGeneratedCode('');
          }}
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
            padding: '1rem',
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
              width: '92vw',
              maxWidth: '600px',
              maxHeight: '85vh',
              margin: 'auto',
              padding: '1.5rem',
              color: textPrimary,
              boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
              animation: 'scaleIn 0.3s ease-out',
              overflowY: 'auto'
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
                <Edit size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                  Editar Aula
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAula(null);
                  setFormData(createEmptyForm());
                  setAutoGeneratedCode('');
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '6px',
                  color: textPrimary,
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
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <Building2 size={16} color={RedColorPalette.primary} />
                <span style={{
                  fontWeight: '600',
                  color: textPrimary
                }}>
                  {selectedAula.codigo_aula}
                </span>
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: textSecondary
              }}>
                Creada el {new Date(selectedAula.fecha_creacion).toLocaleDateString('es-ES')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '1.25rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '16px' : '1.25rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: textSecondary
                  }}>
                    Nombre del Aula *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                    placeholder="Ej: Aula de Teoría 1"
                    style={{
                      width: '100%',
                      padding: '10px 0.75rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.08)',
                      color: textPrimary,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    color: textSecondary
                  }}>
                    Estado
                  </label>
                  <StyledSelect
                    name="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as FormState['estado'] }))}
                    options={[
                      { value: 'activa', label: 'Activa' },
                      { value: 'inactiva', label: 'Inactiva' },
                      { value: 'mantenimiento', label: 'Mantenimiento' },
                      { value: 'reservada', label: 'Reservada' }
                    ]}
                    style={{
                      width: '100%',
                      padding: '10px 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                      background: 'rgba(255,255,255,0.08)',
                      color: textPrimary,
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: textSecondary
                }}>
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del aula..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 0.75rem',
                    border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                    borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: textPrimary,
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  color: textSecondary
                }}>
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
                  placeholder="Ej: Edificio A - Piso 2"
                  style={{
                    width: '100%',
                    padding: '10px 0.75rem',
                    border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
                    borderRadius: '0.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: textPrimary,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease',
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: '0.75rem',
              marginTop: isMobile ? '24px' : '2rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedAula(null);
                  setFormData(createEmptyForm());
                  setAutoGeneratedCode('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  color: textSecondary,
                  border: '1px solid var(--admin-border, rgba(255,255,255,0.15))',
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
                onClick={handleUpdateAula}
                disabled={!formData.nombre.trim() || loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: !formData.nombre.trim() || loading ? 'rgba(255,255,255,0.05)' : RedColorPalette.primary,
                  color: !formData.nombre.trim() || loading ? textMuted : '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: !formData.nombre.trim() || loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Edit size={16} />
                    Guardar Cambios
                  </>
                )}
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
        </div>,
        document.body
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GestionAulas;






