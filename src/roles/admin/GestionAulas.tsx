import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, Plus, Edit, X, MapPin, Building2, Calendar, Grid, List, ChevronLeft, ChevronRight, Hash, FileText, ArrowLeftRight, Eye, Power
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import GlassEffect from '../../components/GlassEffect';
import AdminSectionHeader from '../../components/AdminSectionHeader';
import { RedColorPalette } from '../../utils/colorMapper';
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
    toggleInactiveText: pick('rgba(100, 116, 139, 0.7)', 'rgba(255, 255, 255, 0.6)'),
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
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Estados para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [aulaToToggle, setAulaToToggle] = useState<Aula | null>(null);

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

  const handleViewAula = (aula: Aula) => {
    setSelectedAula(aula);
    setModalMode('view');
    setShowModal(true);
  };

  const handleToggleEstadoAula = (aula: Aula) => {
    setAulaToToggle(aula);
    setShowConfirmModal(true);
  };

  const confirmToggleEstado = async () => {
    if (!aulaToToggle) return;

    const nuevoEstado = aulaToToggle.estado === 'activa' ? 'inactiva' : 'activa';
    const accion = nuevoEstado === 'inactiva' ? 'inactivar' : 'activar';

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/aulas/${aulaToToggle.id_aula}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre: aulaToToggle.nombre,
          ubicacion: aulaToToggle.ubicacion || '',
          descripcion: aulaToToggle.descripcion || '',
          estado: nuevoEstado
        }),
      });

      if (!response.ok) {
        throw new Error(`Error al ${accion} aula`);
      }

      await fetchAulas();
      showToast.success(`Aula ${nuevoEstado === 'inactiva' ? 'inactivada' : 'activada'} correctamente`, darkMode);
      setShowConfirmModal(false);
      setAulaToToggle(null);
    } catch (err) {
      console.error(`Error al ${accion} aula:`, err);
      showToast.error(err instanceof Error ? err.message : `Error al ${accion} aula`, darkMode);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (aula: Aula) => {
    setShowCreateModal(false);
    setSelectedAula(aula);
    setModalMode('edit');
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

  const isCardsView = viewMode === 'cards';
  const isTableView = viewMode === 'table';

  const searchInputStyles: (CSSProperties & Record<'--gestion-aulas-placeholder', string>) = {
    width: '100%',
    padding: '10px 0.625rem 0.625rem 2.375rem',
    background: palette.inputBg,
    border: `1px solid ${palette.inputBorder}`,
    borderRadius: '0.5rem',
    color: palette.inputText,
    fontSize: '0.8rem',
    transition: 'background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    boxShadow: darkMode ? '0 0.35rem 1rem rgba(15,23,42,0.08)' : '0 0.25rem 0.75rem rgba(15,23,42,0.08)',
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
      <GlassEffect 
        variant="card" 
        tint="neutral" 
        intensity="light" 
        style={{ 
          marginBottom: isMobile ? '0.5rem' : '0.5rem', 
          borderRadius: '0.375rem', 
          padding: '0.5rem', 
          boxShadow: 'none',
          border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.18)'}`
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
            flex: 1,
            width: isMobile ? '100%' : 'auto'
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
                  color: palette.searchIcon
                }}
              />
              <input
                type="text"
                placeholder={isMobile ? "Buscar..." : "Buscar por código, nombre o ubicación..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0 0.5rem 0 2rem',
                  background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(248,250,252,0.95)',
                  border: `1px solid ${darkMode ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)'}`,
                  borderRadius: '0.5rem',
                  color: palette.inputText,
                  fontSize: '0.75rem',
                  boxShadow: 'none',
                  height: '2rem'
                }}
              />
            </div>

            {/* Filtros */}
            <div style={{ minWidth: isMobile ? 'auto' : 'min(12.5rem, 25vw)', width: isMobile ? '100%' : 'auto' }}>
              <StyledSelect
                name="filterEstado"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                darkMode={darkMode}
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
            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                gap: '0.375rem',
                background: palette.toggleGroupBg,
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
                  color: isCardsView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : palette.toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <Grid size={16} color={isCardsView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : palette.toggleInactiveText} />
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
                  background: isTableView ? (darkMode ? 'rgba(255,255,255,0.14)' : '#ffffff') : 'transparent',
                  border: 'none',
                  borderRadius: '0.5em',
                  color: isTableView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : palette.toggleInactiveText,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  flex: isSmallScreen ? 1 : 'initial'
                }}
              >
                <List size={16} color={isTableView ? (darkMode ? RedColorPalette.primaryLight : RedColorPalette.primary) : palette.toggleInactiveText} />
                {!isMobile && 'Tabla'}
              </button>
            </div>


            </div>
          </div>

          <button
            onClick={() => {
              setShowModal(false);
              setSelectedAula(null);
              setModalMode('create');
              setShowCreateModal(true);
              setFormData(createEmptyForm());
              setAutoGeneratedCode('');
            }}
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
              width: isSmallScreen ? '100%' : 'auto'
            }}
          >
            <Plus size={16} color="currentColor" />
            Nueva Aula
          </button>
        </div>
      </GlassEffect>



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
                      <h3 style={{ color: textPrimary, margin: '0 0 0.2rem 0', fontSize: '0.85rem', fontWeight: 700 }}>
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
                      <div style={{ color: textPrimary, fontSize: '0.7rem' }}>
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
                        fontSize: '0.7rem',
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



                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.55rem' }}>
                  <button
                    onClick={() => handleViewAula(aula)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      background: pick('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.18)'),
                      border: `0.0625rem solid ${pick('rgba(59,130,246,0.22)', 'rgba(59,130,246,0.32)')}`,
                      borderRadius: '0.5rem',
                      color: pick('#1d4ed8', '#93c5fd'),
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = pick('rgba(59,130,246,0.18)', 'rgba(59,130,246,0.25)');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = pick('rgba(59,130,246,0.1)', 'rgba(59,130,246,0.18)');
                    }}
                  >
                    <Eye size={14} color={pick('#1d4ed8', '#93c5fd')} />
                    Ver
                  </button>
                  <button
                    onClick={() => openEditModal(aula)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      background: palette.tableActionBg,
                      border: `0.0625rem solid ${palette.tableActionBorder}`,
                      borderRadius: '0.5rem',
                      color: palette.tableActionText,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
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
                  <button
                    onClick={() => handleToggleEstadoAula(aula)}
                    style={{
                      gridColumn: '1 / -1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      padding: '0.375rem 0.5rem',
                      background: aula.estado === 'activa'
                        ? pick('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.18)')
                        : pick('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.18)'),
                      border: `0.0625rem solid ${aula.estado === 'activa'
                        ? pick('rgba(239,68,68,0.22)', 'rgba(239,68,68,0.32)')
                        : pick('rgba(16,185,129,0.22)', 'rgba(16,185,129,0.32)')}`,
                      borderRadius: '0.5rem',
                      color: aula.estado === 'activa'
                        ? pick('#b91c1c', '#fca5a5')
                        : pick('#047857', '#34d399'),
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = aula.estado === 'activa'
                        ? pick('rgba(239,68,68,0.18)', 'rgba(239,68,68,0.25)')
                        : pick('rgba(16,185,129,0.18)', 'rgba(16,185,129,0.25)');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = aula.estado === 'activa'
                        ? pick('rgba(239,68,68,0.1)', 'rgba(239,68,68,0.18)')
                        : pick('rgba(16,185,129,0.1)', 'rgba(16,185,129,0.18)');
                    }}
                  >
                    <Power size={14} color={aula.estado === 'activa' ? pick('#b91c1c', '#fca5a5') : pick('#047857', '#34d399')} />
                    {aula.estado === 'activa' ? 'Inactivar' : 'Activar'}
                  </button>
                </div>
              </GlassEffect>
            ))
          )}
        </div>
      )}

      {/* Vista Tabla */}
      {viewMode === 'table' && (
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

          <div style={{
            background: darkMode
              ? 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(252,252,253,0.96) 100%)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            border: `1px solid ${darkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.18)'}`,
            marginBottom: '0.5rem',
            boxShadow: darkMode
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 4px 20px rgba(239,68,68,0.08)',
            position: 'relative'
          }}>
            {/* Marca de agua de scroll */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 0
            }}>
              <ArrowLeftRight size={120} strokeWidth={1.5} color={darkMode ? '#ffffff' : '#ef4444'} />
            </div>

            <div className="responsive-table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{
                    background: darkMode ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.12)',
                    borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}`
                  }}>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                      Código
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                      NOMBRE
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                      Ubicación
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                      Estado
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
                      Fecha Creación
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center', color: darkMode ? '#ffffff' : '#9f1239', fontWeight: '600', fontSize: '0.7rem', textTransform: 'uppercase', verticalAlign: 'middle' }}>
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
                    aulasSorted.map((aula) => (
                      <tr
                        key={aula.id_aula}
                        style={{
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}`,
                          background: 'transparent',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = darkMode ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
                          <div style={{
                            fontWeight: '600',
                            color: textPrimary,
                            fontSize: '0.75rem'
                          }}>
                            {aula.codigo_aula}
                          </div>
                        </td>
                        <td className="table-nombre-uppercase" style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
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
                        <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
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
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', verticalAlign: 'middle' }}>
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
                        <td style={{ padding: '0.5rem 0.75rem', verticalAlign: 'middle' }}>
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
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewAula(aula)}
                              title="Ver detalles"
                              style={{
                                padding: '0.375rem',
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
                              <Eye style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                              onClick={() => openEditModal(aula)}
                              title="Editar"
                              style={{
                                padding: '0.375rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #f59e0b',
                                backgroundColor: 'transparent',
                                color: '#f59e0b',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f59e0b';
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#f59e0b';
                              }}
                            >
                              <Edit style={{ width: '1rem', height: '1rem' }} />
                            </button>
                            <button
                              onClick={() => handleToggleEstadoAula(aula)}
                              title={aula.estado === 'activa' ? 'Inactivar' : 'Activar'}
                              style={{
                                padding: '0.375rem',
                                borderRadius: '0.5rem',
                                border: `1px solid ${aula.estado === 'activa' ? '#ef4444' : '#10b981'}`,
                                backgroundColor: 'transparent',
                                color: aula.estado === 'activa' ? '#ef4444' : '#10b981',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                const color = aula.estado === 'activa' ? '#ef4444' : '#10b981';
                                e.currentTarget.style.backgroundColor = color;
                                e.currentTarget.style.color = 'white';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = aula.estado === 'activa' ? '#ef4444' : '#10b981';
                              }}
                            >
                              <Power style={{ width: '1rem', height: '1rem' }} />
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
        </>
      )}

      {/* Paginación */}
      {!loading && aulasSorted.length > 0 && totalPages > 0 && (
        <div className="pagination-container" style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '0.75rem' : '0',
          padding: isMobile ? '8px' : '0.25rem 1rem',
          background: palette.paginationSurface,
          border: `1px solid ${palette.paginationBorder}`,
          borderRadius: '0.75rem',
          marginBottom: isMobile ? '0.75rem' : '0.5rem',
          boxShadow: darkMode
            ? '0 0.5rem 1.5rem rgba(0, 0, 0, 0.35)'
            : '0 0.5rem 1.5rem rgba(15, 23, 42, 0.12)',
        }}>
          <div style={{
            color: palette.paginationText,
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            Página {page} de {totalPages} • Total: {totalCount} aulas
          </div>
          <div style={{
            display: 'flex',
            gap: '0.375rem',
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
                gap: isMobile ? '4px' : '0.25rem',
                padding: isMobile ? '0 0.625rem' : '0 0.75rem',
                height: isMobile ? '2.5rem' : '2rem',
                minHeight: isMobile ? '2.5rem' : '2rem',
                minWidth: isMobile ? '3rem' : 'auto',
                background: page === 1 ? palette.paginationButtonDisabledBg : palette.paginationButtonBg,
                border: `1px solid ${palette.paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: page === 1 ? palette.paginationButtonDisabledText : palette.paginationButtonText,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1 1 100%' : '0 0 auto',
                boxShadow: 'none',
                whiteSpace: 'nowrap'
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: isMobile ? '0 0.5rem' : '0 0.75rem',
                  height: isMobile ? '2.5rem' : '2rem',
                  minHeight: isMobile ? '2.5rem' : '2rem',
                  minWidth: isMobile ? '2.5rem' : '2rem',
                  background: page === pageNum
                    ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`
                    : palette.paginationButtonBg,
                  border: `1px solid ${page === pageNum ? RedColorPalette.primary : palette.paginationButtonBorder}`,
                  borderRadius: '0.5rem',
                  color: page === pageNum ? '#fff' : palette.paginationButtonText,
                  fontSize: isMobile ? '0.75rem' : '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? '1 1 2.5rem' : '0 0 auto',
                  boxShadow: 'none',
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
                gap: isMobile ? '4px' : '0.25rem',
                padding: isMobile ? '0 0.625rem' : '0 0.75rem',
                height: isMobile ? '2.5rem' : '2rem',
                minHeight: isMobile ? '2.5rem' : '2rem',
                minWidth: isMobile ? '3rem' : 'auto',
                background: page === totalPages ? palette.paginationButtonDisabledBg : palette.paginationButtonBg,
                border: `1px solid ${palette.paginationButtonBorder}`,
                borderRadius: '0.625rem',
                color: page === totalPages ? palette.paginationButtonDisabledText : palette.paginationButtonText,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: isMobile ? '1 1 100%' : '0 0 auto',
                boxShadow: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {!isMobile && 'Siguiente'}
              <ChevronRight size={isMobile ? 14 : 14} />
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
                {modalMode === 'view' ? (
                  <>
                    <Eye size={isMobile ? 18 : 20} style={{ color: '#3b82f6' }} />
                    <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                      Detalles del Aula
                    </h3>
                  </>
                ) : (
                  <>
                    <Edit size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                    <h3 style={{ margin: 0, fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '600', letterSpacing: '-0.01em' }}>
                      Editar Aula
                    </h3>
                  </>
                )}
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

            {modalMode === 'view' ? (
              // Vista de solo lectura
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '1.25rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '16px' : '1.25rem'
                }}>
                  <div>
                    <div style={{
                      color: textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Nombre
                    </div>
                    <div style={{
                      color: textPrimary,
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}>
                      {selectedAula.nombre}
                    </div>
                  </div>

                  <div>
                    <div style={{
                      color: textMuted,
                      fontSize: '0.75rem',
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Estado
                    </div>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      background: `${getEstadoColor(selectedAula.estado)}20`,
                      color: getEstadoColor(selectedAula.estado),
                      border: `1px solid ${getEstadoColor(selectedAula.estado)}40`
                    }}>
                      {getEstadoText(selectedAula.estado)}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{
                    color: textMuted,
                    fontSize: '0.75rem',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Ubicación
                  </div>
                  <div style={{
                    color: textPrimary,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <MapPin size={16} color={textSecondary} />
                    {selectedAula.ubicacion || 'No especificada'}
                  </div>
                </div>

                <div>
                  <div style={{
                    color: textMuted,
                    fontSize: '0.75rem',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Descripción
                  </div>
                  <div style={{
                    color: textPrimary,
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {selectedAula.descripcion || 'Sin descripción registrada'}
                  </div>
                </div>
              </div>
            ) : (
              // Formulario de edición
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
            )}

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column-reverse' : 'row',
              gap: '0.75rem',
              marginTop: isMobile ? '24px' : '2rem',
              justifyContent: modalMode === 'view' ? 'center' : 'flex-end'
            }}>
              {modalMode === 'view' ? (
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedAula(null);
                    setFormData(createEmptyForm());
                    setAutoGeneratedCode('');
                  }}
                  style={{
                    padding: '0.75rem 2rem',
                    background: `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Cerrar
                </button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
          {/* Animaciones CSS */}
          < style > {`
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
        </div >,
        document.body
      )}

      {/* Modal de Confirmación para Inactivar/Activar */}
      {showConfirmModal && aulaToToggle && createPortal(
        <div
          onClick={() => {
            setShowConfirmModal(false);
            setAulaToToggle(null);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: darkMode
                ? 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
              borderRadius: '16px',
              padding: isMobile ? '1.5rem' : '2rem',
              maxWidth: '400px',
              width: '90%',
              boxShadow: darkMode
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: `1px solid ${darkMode ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.2)'}`,
              animation: 'modalSlideIn 0.3s ease-out'
            }}
          >
            <div style={{
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: aulaToToggle.estado === 'activa'
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: `2px solid ${aulaToToggle.estado === 'activa' ? '#ef4444' : '#10b981'}`
              }}>
                <Power
                  size={32}
                  color={aulaToToggle.estado === 'activa' ? '#ef4444' : '#10b981'}
                  strokeWidth={2}
                />
              </div>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.25rem',
                fontWeight: '700',
                color: textPrimary
              }}>
                {aulaToToggle.estado === 'activa' ? '¿Inactivar Aula?' : '¿Activar Aula?'}
              </h3>
              <p style={{
                margin: 0,
                fontSize: '0.95rem',
                color: textSecondary,
                lineHeight: '1.5'
              }}>
                ¿Está seguro que desea {aulaToToggle.estado === 'activa' ? 'inactivar' : 'activar'} el aula <strong style={{ color: textPrimary }}>"{aulaToToggle.nombre}"</strong>?
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              flexDirection: isMobile ? 'column-reverse' : 'row'
            }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setAulaToToggle(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'}`,
                  background: 'transparent',
                  color: textSecondary,
                  fontSize: '0.95rem',
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
                Cancelar
              </button>
              <button
                onClick={confirmToggleEstado}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: aulaToToggle.estado === 'activa'
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Procesando...
                  </>
                ) : (
                  <>Aceptar</>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div >
  );
};

export default GestionAulas;





