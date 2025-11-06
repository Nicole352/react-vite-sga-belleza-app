import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit, Trash2, X, Save, Gift, Search, Grid, List, ChevronLeft, ChevronRight,
  Users, BookOpen, CheckCircle, XCircle, Sparkles, FileText
} from 'lucide-react';
import { StyledSelect } from '../../components/StyledSelect';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import toast from 'react-hot-toast';
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

  // Estados para búsqueda, filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiva, setFilterActiva] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
      setError(e.message || 'Error cargando promociones');
      toast.error(e.message || 'Error cargando promociones');
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
      toast.error('Error cargando cursos');
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

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta promoción? Esta acción no se puede deshacer.')) return;
    
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const res = await fetch(`${API_BASE}/api/promociones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('No se pudo eliminar la promoción');
      
      toast.success('Promoción eliminada exitosamente');
      setPromociones(prev => prev.filter(p => p.id_promocion !== id));
    } catch (e: any) {
      toast.error(e.message || 'Error eliminando promoción');
    } finally {
      setLoading(false);
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
      
      toast.success(activa ? 'Promoción desactivada' : 'Promoción activada');
      fetchPromociones();
    } catch (e: any) {
      toast.error(e.message || 'Error al cambiar estado');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Validaciones
    const id_curso_principal = Number(fd.get('id_curso_principal'));
    const id_curso_promocional = Number(fd.get('id_curso_promocional'));

    if (!id_curso_principal || !id_curso_promocional) {
      toast.error('Selecciona ambos cursos (principal y promocional)');
      return;
    }

    if (!selectedCursoId) {
      toast.error('Selecciona el curso promocional');
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
      toast.error('El nombre de la promoción es obligatorio');
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

      toast.success(modalType === 'create' ? 'Promoción creada exitosamente' : 'Promoción actualizada exitosamente');
      setShowModal(false);
      fetchPromociones();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar promoción');
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

  return (
    <div style={{ padding: isMobile ? '12px' : '1.125rem' }}>
      {/* Header */}
      <div style={{
        marginBottom: isMobile ? '12px' : '1.125rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '0.75rem',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift size={isMobile ? 22 : 24} style={{ color: '#ef4444' }} />
          <h2 style={{
            margin: 0,
            fontSize: isMobile ? '1.15rem' : '1.35rem',
            fontWeight: '700',
            color: 'var(--admin-text-primary, #fff)'
          }}>
            Gestión de Promociones
          </h2>
        </div>

        <button
          onClick={openCreate}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: isMobile ? '7px 12px' : '8px 14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            borderRadius: '0.5rem',
            color: '#fff',
            fontWeight: '600',
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.6 : 1
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <Plus size={isMobile ? 14 : 16} />
          Nueva Promoción
        </button>
      </div>

      {/* Búsqueda y filtros */}
      <div style={{
        marginBottom: isMobile ? '12px' : '1.125rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '8px' : '0.75rem',
        alignItems: 'stretch'
      }}>
        {/* Buscador */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'rgba(255,255,255,0.4)',
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
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.75rem'
            }}
          />
        </div>

        {/* Filtro Estado */}
        <div style={{ minWidth: isMobile ? '100%' : '160px' }}>
          <StyledSelect
            name="filtro_estado"
            value={filterActiva}
            onChange={(e) => setFilterActiva(e.target.value)}
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
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.5rem',
          padding: '2px'
        }}>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              padding: '6px 10px',
              background: viewMode === 'cards' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              border: viewMode === 'cards' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              borderRadius: '0.375rem',
              color: viewMode === 'cards' ? '#ef4444' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 10px',
              background: viewMode === 'table' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
              border: viewMode === 'table' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              borderRadius: '0.375rem',
              color: viewMode === 'table' ? '#ef4444' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#ef4444',
          fontSize: '0.75rem',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && promociones.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
          Cargando promociones...
        </div>
      )}

      {/* Sin resultados */}
      {!loading && filteredPromociones.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.85rem'
        }}>
          {searchTerm || filterActiva !== 'todas'
            ? 'No se encontraron promociones con los filtros aplicados'
            : 'No hay promociones creadas. Haz clic en "Nueva Promoción" para comenzar.'
          }
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
                style={{
                  background: 'var(--admin-bg-secondary, linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%))',
                  border: promo.activa ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  padding: '0.875rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 0.5rem 1.5rem rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
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
                    <Sparkles size={10} />
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
                      background: promo.activa
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(239, 68, 68, 0.15)',
                      border: promo.activa
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(239, 68, 68, 0.3)',
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
                      {promo.activa ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {promo.activa ? 'Activa' : 'Inactiva'}
                    </div>
                  </div>

                  <h3 style={{
                    color: '#fff',
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
                      <BookOpen size={11} />
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
                      <Gift size={11} />
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
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '10px',
                  marginBottom: '0.75rem',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#ef4444',
                    lineHeight: 1,
                    marginBottom: '4px'
                  }}>
                    {promo.modalidad_promocional === 'clases' ? promo.clases_gratis : promo.meses_gratis}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {promo.modalidad_promocional === 'clases' ? 'Clases Gratis' : 'Meses Gratis'}
                  </div>
                </div>

                {/* Descripción */}
                {promo.descripcion && (
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
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
                  borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {/* Cupos Promocionales */}
                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.6rem',
                      marginBottom: '2px'
                    }}>
                      Cupos Promo
                    </div>
                    <div style={{
                      color: promo.cupos_disponibles && (promo.cupos_disponibles - (promo.cupos_utilizados || 0)) <= 0
                        ? '#ef4444'
                        : 'rgba(255,255,255,0.9)',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {promo.cupos_disponibles
                        ? `${(promo.cupos_disponibles || 0) - (promo.cupos_utilizados || 0)}/${promo.cupos_disponibles}`
                        : 'Ilimitados'
                      }
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '0.55rem',
                      marginTop: '1px'
                    }}>
                      {promo.cupos_utilizados || 0} aceptados
                    </div>
                  </div>

                  {/* Modalidad */}
                  <div>
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.6rem',
                      marginBottom: '2px'
                    }}>
                      Modalidad
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.9)',
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
                  borderTop: '1px solid rgba(255,255,255,0.1)'
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
                    {promo.activa ? <XCircle size={12} /> : <CheckCircle size={12} />}
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
                    <Edit size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(promo.id_promocion)}
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
                    <Trash2 size={14} />
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
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Modal - Continuará en el siguiente mensaje por límite de caracteres */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: isMobile ? '95%' : '600px' }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: isMobile ? 12 : 14,
              paddingBottom: isMobile ? 8 : 10,
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={isMobile ? 18 : 20} style={{ color: '#ef4444' }} />
                <h3 style={{
                  margin: 0,
                  fontSize: isMobile ? '0.95rem' : '1.05rem',
                  fontWeight: '600',
                  letterSpacing: '-0.01em'
                }}>
                  {modalType === 'create' ? 'Nueva Promoción' : 'Editar Promoción'}
                </h3>
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
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isSmallScreen ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? 10 : 12,
                columnGap: isSmallScreen ? 0 : 16
              }}>
                {/* Curso Principal (que el estudiante paga) */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <BookOpen size={14} style={{ color: '#3b82f6' }} />
                    Curso Principal (que paga)
                  </label>
                  <StyledSelect
                    name="id_curso_principal"
                    defaultValue={selected?.id_curso_principal || ''}
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
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <Gift size={14} style={{ color: '#10b981' }} />
                    Curso Promocional (gratis)
                  </label>
                  <StyledSelect
                    name="id_curso_promocional"
                    value={selectedCursoId || ''}
                    onChange={(e) => setSelectedCursoId(Number(e.target.value))}
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
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <Sparkles size={14} style={{ color: '#f59e0b' }} />
                    Nombre de la promoción
                  </label>
                  <input
                    name="nombre_promocion"
                    placeholder="Ej. Promo Lanzamiento 2025, Black Friday, etc."
                    defaultValue={selected?.nombre_promocion || ''}
                    required
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </div>

                {/* Descripción */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <FileText size={14} style={{ color: '#8b5cf6' }} />
                    Descripción (opcional)
                  </label>
                  <textarea
                    name="descripcion"
                    defaultValue={selected?.descripcion || ''}
                    placeholder="Describe los detalles de la promoción..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.8rem',
                      resize: 'vertical',
                      minHeight: '50px'
                    }}
                  />
                </div>

                {/* Beneficio (meses o clases según modalidad) */}
                {cursoSeleccionado && (
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: 5,
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 500,
                      fontSize: '0.8rem'
                    }}>
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
                      style={{
                        width: '100%',
                        padding: '7px 10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: '0.8rem'
                      }}
                    />
                  </div>
                )}

                {/* Cupos */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <Users size={14} style={{ color: '#06b6d4' }} />
                    Cupos (vacío = ilimitado)
                  </label>
                  <input
                    name="cupos_disponibles"
                    type="number"
                    min="0"
                    placeholder="Ilimitado"
                    defaultValue={selected?.cupos_disponibles || ''}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 6,
                      color: '#fff',
                      fontSize: '0.8rem'
                    }}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: 5,
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: '0.8rem'
                  }}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} />
                    Estado
                  </label>
                  <StyledSelect
                    name="activa"
                    defaultValue={selected?.activa ? 'true' : 'false'}
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
                borderTop: '1px solid rgba(255,255,255,0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: loading
                      ? 'rgba(239, 68, 68, 0.5)'
                      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    borderRadius: 6,
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={14} />
                  {loading ? 'Guardando...' : modalType === 'create' ? 'Crear Promoción' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPromociones;
