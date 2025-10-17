import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, X, MapPin, Save, Calendar, Clock, Users, AlertCircle, CheckCircle2, Grid, List, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StyledSelect } from '../../components/StyledSelect';

const API_BASE = 'http://localhost:3000';

type EstadoAsignacion = 'activa' | 'inactiva' | 'cancelada';
type EstadoFiltro = 'todas' | EstadoAsignacion;

interface Asignacion {
  id_asignacion: number;
  id_aula: number;
  id_curso: number;
  id_docente: number;
  hora_inicio: string;
  hora_fin: string;
  dias: string;
  estado: EstadoAsignacion;
  observaciones?: string;
  // Datos relacionados
  codigo_aula: string;
  aula_nombre: string;
  ubicacion?: string;
  codigo_curso: string;
  curso_nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima: number;
  tipo_curso_nombre: string;
  docente_nombres: string;
  docente_apellidos: string;
  estudiantes_matriculados: number;
  porcentaje_ocupacion: number;
}

interface Aula {
  id_aula: number;
  codigo_aula: string;
  nombre: string;
  ubicacion?: string;
  estado: string;
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  horario: string;
  fecha_inicio: string;
  fecha_fin: string;
  capacidad_maxima: number;
  estado: string;
}

interface Docente {
  id_docente: number;
  identificacion: string;
  nombres: string;
  apellidos: string;
  estado: string;
}

const AsignacionAula: React.FC = () => {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('activa');
  const [saving, setSaving] = useState(false);
  
  // Estados para paginación y vista
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(1);
  const limit = 5; // 5 asignaciones por página

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Función para formatear fechas: 03/Oct/2025
  const formatearFecha = (fecha: string): string => {
    if (!fecha) return '';
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = meses[date.getMonth()];
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar asignaciones
      const params = new URLSearchParams();
      if (filtroEstado !== 'todas') {
        params.set('estado', filtroEstado);
      }
      params.set('limit', '100');

      const [asignacionesRes, aulasRes, cursosRes, docentesRes] = await Promise.all([
        fetch(`${API_BASE}/api/asignaciones-aulas?${params.toString()}`),
        fetch(`${API_BASE}/api/aulas?limit=100`),
        fetch(`${API_BASE}/api/cursos?limit=100`),
        fetch(`${API_BASE}/api/docentes?limit=100`)
      ]);

      if (!asignacionesRes.ok) throw new Error('Error cargando asignaciones');
      if (!aulasRes.ok) throw new Error('Error cargando aulas');
      if (!cursosRes.ok) throw new Error('Error cargando cursos');
      if (!docentesRes.ok) throw new Error('Error cargando docentes');

      const asignacionesData = await asignacionesRes.json();
      const aulasData = await aulasRes.json();
      const cursosData = await cursosRes.json();
      const docentesData = await docentesRes.json();

      console.log('Datos cargados:', {
        asignaciones: asignacionesData,
        aulas: aulasData,
        cursos: cursosData,
        docentes: docentesData
      });

      // Manejar diferentes formatos de respuesta
      const asignacionesList = asignacionesData.asignaciones || [];
      const aulasList = aulasData.aulas || [];
      const cursosList = Array.isArray(cursosData) ? cursosData : (cursosData.cursos || []);
      const docentesList = Array.isArray(docentesData) ? docentesData : (docentesData.docentes || []);

      setAsignaciones(asignacionesList);
      setAulas(aulasList);
      setCursos(cursosList);
      setDocentes(docentesList);
      
      console.log('Estados actualizados:', {
        totalAsignaciones: asignacionesList.length,
        totalAulas: aulasList.length,
        totalCursos: cursosList.length,
        totalDocentes: docentesList.length,
        docentesActivos: docentesList.filter((d: any) => d.estado === 'activo').length
      });
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const asignacionesFiltradas = asignaciones.filter((asignacion: Asignacion) => {
    const matchesSearch = asignacion.aula_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.docente_nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asignacion.docente_apellidos.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Paginación
  const totalCount = asignacionesFiltradas.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const asignacionesPaginadas = asignacionesFiltradas.slice(startIndex, endIndex);

  const handleCreateAsignacion = () => {
    setSelectedAsignacion(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditAsignacion = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const diasSeleccionados = Array.from(formData.getAll('dias')) as string[];
    
    if (diasSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un día de clase', {
        icon: <AlertCircle size={20} />,
      });
      return;
    }

    const horaInicio = String(formData.get('hora_inicio') || '');
    const horaFin = String(formData.get('hora_fin') || '');
    
    const asignacionData = {
      id_aula: Number(formData.get('id_aula')),
      id_curso: Number(formData.get('id_curso')),
      id_docente: Number(formData.get('id_docente')),
      hora_inicio: `${horaInicio}:00`,
      hora_fin: `${horaFin}:00`,
      dias: diasSeleccionados.join(','),
      observaciones: String(formData.get('observaciones') || '')
    };

    try {
      setSaving(true);
      
      if (modalType === 'create') {
        const res = await fetch(`${API_BASE}/api/asignaciones-aulas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacionData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error creando asignación');
        }

        toast.success('Asignación creada exitosamente', {
          icon: <CheckCircle2 size={20} />,
        });
      } else if (modalType === 'edit' && selectedAsignacion) {
        const res = await fetch(`${API_BASE}/api/asignaciones-aulas/${selectedAsignacion.id_asignacion}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacionData)
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Error actualizando asignación');
        }

        toast.success('Asignación actualizada exitosamente', {
          icon: <CheckCircle2 size={20} />,
        });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      console.error('Error guardando asignación:', err);
      toast.error(err.message || 'Error guardando asignación', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setSaving(false);
    }
  };

  const getOcupacionColor = (inscritos: number, capacidad: number) => {
    const porcentaje = (inscritos / capacidad) * 100;
    if (porcentaje >= 90) return '#ef4444';
    if (porcentaje >= 70) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 6px 0',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <MapPin size={26} color="#ef4444" />
          Asignación de Aulas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.85rem' }}>
          Gestiona la asignación de aulas, horarios y profesores
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '16px', padding: '16px', marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text" placeholder="Buscar por aula, curso o profesor..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 38px',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px', color: '#fff', fontSize: '0.8rem'
                }}
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <StyledSelect
                name="filtroEstado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
                options={[
                  { value: 'todas', label: 'Todas' },
                  { value: 'activa', label: 'Activas' },
                  { value: 'inactiva', label: 'Inactivas' },
                ]}
              />
            </div>
            {/* Toggle Vista */}
            <div style={{ display: 'flex', gap: '0' }}>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 16px',
                  background: viewMode === 'cards' ? '#f87171' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '7px 0 0 7px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <Grid size={14} /> Tarjetas
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '8px 16px',
                  background: viewMode === 'table' ? '#f87171' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderLeft: 'none',
                  borderRadius: '0 7px 7px 0',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                <List size={14} /> Tabla
              </button>
            </div>
          </div>
          <button
            onClick={handleCreateAsignacion}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
              borderRadius: '10px', color: '#fff', fontSize: '0.8rem', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={16} />
            Nueva Asignación
          </button>
        </div>
      </div>

      {/* Estados de carga y error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
          Cargando asignaciones...
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px', padding: '16px', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Vista Cards - Tarjetas Compactas */}
      {!loading && !error && viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          {asignacionesPaginadas.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px 20px', color: 'rgba(255,255,255,0.7)' }}>
              <MapPin size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>No se encontraron asignaciones</div>
            </div>
          ) : (
            asignacionesPaginadas.map(asignacion => (
              <div key={asignacion.id_asignacion} style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(248, 113, 113, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(248, 113, 113, 0.2)';
              }}
              >
                {/* Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #fca5a5 0%, #f87171 100%)',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: 30,
                      height: 30,
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={16} color="#fff" />
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', margin: 0 }}>
                        {asignacion.aula_nombre}
                      </h3>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>
                        {asignacion.codigo_aula}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: asignacion.estado === 'activa' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.3)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    {asignacion.estado}
                  </div>
                </div>

                {/* Contenido */}
                <div style={{ padding: '12px 14px' }}>
                  {/* Curso y Docente */}
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={10} />
                      CURSO
                    </div>
                    <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>
                      {asignacion.curso_nombre}
                    </div>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Users size={10} />
                      DOCENTE
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}>
                      {asignacion.docente_nombres} {asignacion.docente_apellidos}
                    </div>
                  </div>

                  {/* Horario y Período */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} />
                        HORARIO
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.7rem', fontWeight: '600' }}>
                        {asignacion.hora_inicio.substring(0, 5)} - {asignacion.hora_fin.substring(0, 5)}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '4px' }}>
                        PERÍODO
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.75rem' }}>
                        {formatearFecha(asignacion.fecha_inicio)}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                        {formatearFecha(asignacion.fecha_fin)}
                      </div>
                    </div>
                  </div>

                  {/* Días */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '6px' }}>
                      DÍAS DE CLASE
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {asignacion.dias.split(',').map((dia: string, idx: number) => (
                        <div key={idx} style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          {dia.trim()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ocupación */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: '600' }}>
                        OCUPACIÓN
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700' }}>
                        {asignacion.estudiantes_matriculados}/{asignacion.capacidad_maxima}
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${asignacion.porcentaje_ocupacion}%`,
                        height: '100%',
                        background: asignacion.porcentaje_ocupacion > 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 
                                   asignacion.porcentaje_ocupacion > 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 
                                   'linear-gradient(90deg, #10b981, #059669)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginTop: '4px', textAlign: 'right' }}>
                      {asignacion.porcentaje_ocupacion}% ocupado
                    </div>
                  </div>

                  {/* Botón */}
                  <button
                    onClick={() => handleEditAsignacion(asignacion)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                    }}
                  >
                    <Edit size={14} />
                    Editar Asignación
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vista Tabla Compacta */}
      {!loading && !error && viewMode === 'table' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(248, 113, 113, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}>
          {asignacionesPaginadas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.7)' }}>
              <MapPin size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>No se encontraron asignaciones</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    background: 'rgba(248, 113, 113, 0.15)',
                    borderBottom: '1px solid rgba(248, 113, 113, 0.3)'
                  }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} />
                        Aula
                      </div>
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Curso</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Docente</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} />
                        Horario
                      </div>
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Días</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        Período
                      </div>
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                        <Users size={14} />
                        Ocupación
                      </div>
                    </th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asignacionesPaginadas.map((asignacion, index) => (
                    <tr 
                      key={asignacion.id_asignacion} 
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
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: 'rgba(248, 113, 113, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(248, 113, 113, 0.3)'
                          }}>
                            <MapPin size={14} color="#f87171" />
                          </div>
                          <div>
                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.85rem' }}>{asignacion.aula_nombre}</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{asignacion.codigo_aula}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.8rem' }}>{asignacion.curso_nombre}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>{asignacion.tipo_curso_nombre}</div>
                      </td>
                      <td style={{ padding: '12px', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                        {asignacion.docente_nombres} {asignacion.docente_apellidos}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <Clock size={12} color="#60a5fa" />
                          <span style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.75rem' }}>
                            {asignacion.hora_inicio.substring(0, 5)} - {asignacion.hora_fin.substring(0, 5)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {asignacion.dias.split(',').map((dia, idx) => (
                            <span key={idx} style={{ 
                              background: 'rgba(139, 92, 246, 0.2)', 
                              color: '#a78bfa', 
                              padding: '2px 6px', 
                              borderRadius: '4px', 
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}>
                              {dia.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '600' }}>
                          {formatearFecha(asignacion.fecha_inicio)}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                          {formatearFecha(asignacion.fecha_fin)}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '700', marginBottom: '4px' }}>
                          {asignacion.estudiantes_matriculados}/{asignacion.capacidad_maxima}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                          {asignacion.porcentaje_ocupacion}%
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{
                          background: asignacion.estado === 'activa' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(156, 163, 175, 0.2)',
                          color: asignacion.estado === 'activa' ? '#10b981' : '#9ca3af',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          display: 'inline-block',
                          textTransform: 'uppercase',
                          border: `1px solid ${asignacion.estado === 'activa' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`
                        }}>
                          {asignacion.estado}
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditAsignacion(asignacion)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '6px',
                            color: '#fbbf24',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
                          }}
                        >
                          <Edit size={12} />
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Paginación */}
      {!loading && asignacionesFiltradas.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          marginTop: '90px',
          marginBottom: '24px',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
            Página {page} de {totalPages} • Total: {totalCount} asignaciones
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                color: page === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                style={{
                  padding: '8px 14px',
                  background: page === pageNum ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.08)',
                  border: page === pageNum ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '40px',
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
                gap: '6px',
                padding: '8px 16px',
                background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                color: page === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '700px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Nueva Asignación' : 'Editar Asignación'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Aula</label>
                  <StyledSelect
                    name="id_aula"
                    required
                    defaultValue={selectedAsignacion?.id_aula || ''}
                    placeholder="Seleccionar aula"
                    options={aulas.filter(a => a.estado === 'activa').map(a => ({ 
                      value: a.id_aula, 
                      label: `${a.nombre} - ${a.ubicacion || 'Sin ubicación'}` 
                    }))}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Curso</label>
                  <StyledSelect
                    name="id_curso"
                    required
                    defaultValue={selectedAsignacion?.id_curso || ''}
                    placeholder="Seleccionar curso"
                    options={cursos.filter(c => c.estado === 'activo' || c.estado === 'planificado').map(c => {
                      const horario = c.horario ? ` - ${c.horario.charAt(0).toUpperCase() + c.horario.slice(1)}` : '';
                      return {
                        value: c.id_curso, 
                        label: `${c.nombre}${horario} (${formatearFecha(c.fecha_inicio)} - ${formatearFecha(c.fecha_fin)})`
                      };
                    })}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Docente {docentes.length > 0 && `(${docentes.filter(d => d.estado === 'activo').length} disponibles)`}
                </label>
                {docentes.length === 0 ? (
                  <div style={{ 
                    padding: '12px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.9rem'
                  }}>
                    No hay docentes disponibles. Por favor, cree docentes primero.
                  </div>
                ) : (
                  <StyledSelect
                    name="id_docente"
                    required
                    defaultValue={selectedAsignacion?.id_docente || ''}
                    placeholder="Seleccionar docente"
                    options={docentes.filter(d => d.estado === 'activo').map(d => ({ 
                      value: d.id_docente, 
                      label: `${d.nombres} ${d.apellidos}` 
                    }))}
                  />
                )}
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Días de Clase</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {diasSemana.map(dia => {
                    const diasArray = selectedAsignacion?.dias?.split(',') || [];
                    return (
                      <label key={dia} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox" name="dias" value={dia}
                          defaultChecked={diasArray.includes(dia)}
                          style={{ accentColor: '#ef4444' }}
                        />
                        {dia}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Hora Inicio</label>
                  <input
                    type="time" name="hora_inicio" required
                    defaultValue={selectedAsignacion?.hora_inicio?.substring(0, 5) || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Hora Fin</label>
                  <input
                    type="time" name="hora_fin" required
                    defaultValue={selectedAsignacion?.hora_fin?.substring(0, 5) || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Observaciones (opcional)</label>
                <textarea
                  name="observaciones"
                  rows={3}
                  defaultValue={selectedAsignacion?.observaciones || ''}
                  placeholder="Notas adicionales sobre la asignación..."
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', background: saving ? 'rgba(156, 163, 175, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer', 
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Guardando...' : (modalType === 'create' ? 'Crear Asignación' : 'Guardar Cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignacionAula;
