import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, X, ChevronLeft, ChevronRight, Eye, Download, User, Database, Activity } from 'lucide-react';
import * as XLSX from 'xlsx';

// Tipos
interface Auditoria {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  usuario_id: number;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string;
  user_agent: string;
  fecha_operacion: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_username: string;
}

interface Estadisticas {
  total: number;
  actividadReciente: number;
  porTabla: Array<{ tabla_afectada: string; cantidad: number }>;
  porUsuario: Array<{ usuario_id: number; nombre: string; apellido: string; cantidad: number }>;
  porOperacion: Array<{ operacion: string; cantidad: number }>;
}

const HistorialAuditoria: React.FC = () => {
  // Estados
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [tablasDisponibles, setTablasDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tabla: '',
    operacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_registro: '',
    usuario_id: ''
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const limite = 10;

  // Modal
  const [modalDetalle, setModalDetalle] = useState<Auditoria | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas();
    cargarTablasDisponibles();
  }, []);

  // Cargar auditorías cuando cambian filtros o página
  useEffect(() => {
    cargarAuditorias();
  }, [paginaActual, filtros]);

  /**
   * Cargar auditorías con filtros y paginación
   */
  const cargarAuditorias = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        return;
      }

      // Construir query params
      const params = new URLSearchParams({
        pagina: paginaActual.toString(),
        limite: limite.toString(),
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.tabla && { tabla: filtros.tabla }),
        ...(filtros.operacion && { operacion: filtros.operacion }),
        ...(filtros.fecha_inicio && { fecha_inicio: filtros.fecha_inicio }),
        ...(filtros.fecha_fin && { fecha_fin: filtros.fecha_fin }),
        ...(filtros.id_registro && { id_registro: filtros.id_registro }),
        ...(filtros.usuario_id && { usuario_id: filtros.usuario_id })
      });

      const response = await fetch(`http://localhost:3000/api/auditoria?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar auditorías');
      }

      const data = await response.json();

      if (data.success) {
        setAuditorias(data.data.auditorias);
        setTotal(data.data.total);
        setTotalPaginas(data.data.totalPaginas);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar auditorías');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auditoria/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEstadisticas(data.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  /**
   * Cargar tablas disponibles
   */
  const cargarTablasDisponibles = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auditoria/tablas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTablasDisponibles(data.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar tablas:', err);
    }
  };

  /**
   * Manejar cambio de filtros
   */
  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaActual(1); // Resetear a primera página
  };

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tabla: '',
      operacion: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_registro: '',
      usuario_id: ''
    });
    setPaginaActual(1);
  };

  /**
   * Ver detalle de auditoría
   */
  const verDetalle = (auditoria: Auditoria) => {
    setModalDetalle(auditoria);
    setShowModal(true);
  };

  /**
   * Exportar a Excel
   */
  const exportarExcel = () => {
    const datosExcel = auditorias.map(a => ({
      'ID': a.id_auditoria,
      'Fecha/Hora': formatearFecha(a.fecha_operacion),
      'Usuario': `${a.usuario_nombre} ${a.usuario_apellido}`,
      'Username': a.usuario_username,
      'Operación': a.operacion,
      'Tabla': a.tabla_afectada,
      'ID Registro': a.id_registro,
      'IP': a.ip_address
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    XLSX.writeFile(wb, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Obtener color según operación
   */
  const getColorOperacion = (operacion: string) => {
    switch (operacion) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  /**
   * Renderizar diff de cambios
   */
  const renderDiff = () => {
    if (!modalDetalle) return null;

    const anterior = modalDetalle.datos_anteriores ? JSON.parse(modalDetalle.datos_anteriores) : null;
    const nuevo = modalDetalle.datos_nuevos ? JSON.parse(modalDetalle.datos_nuevos) : null;

    if (!anterior && !nuevo) {
      return <p className="text-gray-500">No hay datos de cambios disponibles</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Datos anteriores */}
        <div>
          <h4 className="font-semibold mb-2 text-red-600">Antes:</h4>
          <div className="bg-red-50 p-3 rounded border border-red-200 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {anterior ? JSON.stringify(anterior, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>

        {/* Datos nuevos */}
        <div>
          <h4 className="font-semibold mb-2 text-green-600">Después:</h4>
          <div className="bg-green-50 p-3 rounded border border-green-200 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {nuevo ? JSON.stringify(nuevo, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        color: '#fff',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1em' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1em' }}>
            <div>
              <h2 style={{
                color: 'rgba(255,255,255,0.95)',
                margin: '0 0 0.375rem 0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontSize: '1.625rem',
                fontWeight: '700'
              }}>
                <FileText size={26} color="#ef4444" />
                Historial de Auditoría
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                fontSize: '0.85rem',
              }}>
                Registro completo de operaciones del sistema
              </p>
            </div>

            <button
              onClick={exportarExcel}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5em',
                padding: '0.75em 1.5em',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '0.625em',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 0.25rem 0.75em rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.25rem 0.75em rgba(16, 185, 129, 0.3)';
              }}
            >
              <Download size={16} />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(15rem, 90vw), 1fr))',
            gap: '0.875em',
            marginBottom: '1.125em'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.0625rem solid rgba(255,255,255,0.08)',
              borderRadius: '0.75em',
              padding: '0.625em',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.12)',
                  borderRadius: '0.375em',
                  padding: '0.3em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Database size={14} color="#3b82f6" strokeWidth={2} />
                </div>
                <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Total Registros</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: '1', letterSpacing: '-0.02em' }}>
                {estadisticas.total.toLocaleString()}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.0625rem solid rgba(255,255,255,0.08)',
              borderRadius: '0.75em',
              padding: '0.625em',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  borderRadius: '0.375em',
                  padding: '0.3em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Activity size={14} color="#10b981" strokeWidth={2} />
                </div>
                <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Últimas 24h</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: '1', letterSpacing: '-0.02em' }}>
                {estadisticas.actividadReciente.toLocaleString()}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.0625rem solid rgba(255,255,255,0.08)',
              borderRadius: '0.75em',
              padding: '0.625em',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
                <div style={{
                  background: 'rgba(168, 85, 247, 0.12)',
                  borderRadius: '0.375em',
                  padding: '0.3em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Database size={14} color="#a855f7" strokeWidth={2} />
                </div>
                <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Tablas Auditadas</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: '1', letterSpacing: '-0.02em' }}>
                {estadisticas.porTabla.length.toLocaleString()}
              </p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.0625rem solid rgba(255,255,255,0.08)',
              borderRadius: '0.75em',
              padding: '0.625em',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  borderRadius: '0.375em',
                  padding: '0.3em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={14} color="#f59e0b" strokeWidth={2} />
                </div>
                <h3 style={{ color: 'rgba(255,255,255,0.9)', margin: 0 }}>Usuarios Activos</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: '1', letterSpacing: '-0.02em' }}>
                {estadisticas.porUsuario.length.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          borderRadius: '0.875em',
          padding: '1em',
          marginBottom: '1em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '1em' }}>
            <Filter size={18} color="rgba(255,255,255,0.9)" />
            <h2 style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0,
            }}>Filtros</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(12.5rem, 100%), 1fr))',
            gap: '0.75em'
          }}>
            {/* Búsqueda */}
            <div>
              <label style={{
                display: 'block',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '0.75rem',
                fontWeight: '500',
                marginBottom: '0.375em',
              }}>
                Búsqueda
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  placeholder="Usuario, tabla..."
                  style={{
                    width: '100%',
                    padding: '0.625em 0.625em 0.625em 2.375em',
                    background: 'rgba(255,255,255,0.1)',
                    border: '0.0625rem solid rgba(255,255,255,0.2)',
                    borderRadius: '0.625em',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            </div>

            {/* Tabla */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.375em', }}>
                Tabla
              </label>
              <select
                value={filtros.tabla}
                onChange={(e) => handleFiltroChange('tabla', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                                  }}
              >
                <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Todas</option>
                {tablasDisponibles.map(tabla => (
                  <option key={tabla} value={tabla} style={{ background: '#1a1a2e', color: '#fff' }}>{tabla}</option>
                ))}
              </select>
            </div>

            {/* Operación */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.375em', }}>
                Operación
              </label>
              <select
                value={filtros.operacion}
                onChange={(e) => handleFiltroChange('operacion', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                                  }}
              >
                <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Todas</option>
                <option value="INSERT" style={{ background: '#1a1a2e', color: '#fff' }}>INSERT</option>
                <option value="UPDATE" style={{ background: '#1a1a2e', color: '#fff' }}>UPDATE</option>
                <option value="DELETE" style={{ background: '#1a1a2e', color: '#fff' }}>DELETE</option>
              </select>
            </div>

            {/* ID Registro */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.375em', }}>
                ID Registro
              </label>
              <input
                type="number"
                value={filtros.id_registro}
                onChange={(e) => handleFiltroChange('id_registro', e.target.value)}
                placeholder="ID..."
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                                  }}
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.375em', }}>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                                  }}
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.375em', }}>
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                                  }}
              />
            </div>

            {/* Botón limpiar */}
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={limpiarFiltros}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5em',
                  padding: '0.625em 1em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                                  }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
              >
                <X size={14} />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de auditorías */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          borderRadius: '0.875em',
          overflow: 'hidden',
          boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
        }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3em' }}>
              <div style={{
                width: '3em',
                height: '3em',
                border: '0.1875em solid rgba(239, 68, 68, 0.2)',
                borderTop: '0.1875em solid #ef4444',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : error ? (
            <div style={{ padding: '2em', textAlign: 'center', color: '#ef4444' }}>
              <p>{error}</p>
            </div>
          ) : auditorias.length === 0 ? (
            <div style={{ padding: '3em', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <FileText size={48} style={{ margin: '0 auto 1em', opacity: 0.5 }} />
              <p style={{ }}>No se encontraron registros de auditoría</p>
            </div>
          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(248, 113, 113, 0.15)',
                      borderBottom: '0.0625rem solid rgba(248, 113, 113, 0.3)'
                    }}>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>ID</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>Fecha/Hora</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>Usuario</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>Operación</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>Tabla</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>ID Registro</th>
                      <th style={{ padding: '0.75em', textAlign: 'left', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>IP</th>
                      <th style={{ padding: '0.75em', textAlign: 'center', color: '#fff', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditorias.map((auditoria, index) => (
                      <tr
                        key={auditoria.id_auditoria}
                        style={{
                          borderBottom: '0.0625rem solid rgba(255,255,255,0.05)',
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
                        <td style={{ padding: '0.75em', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>
                          {auditoria.id_auditoria}
                        </td>
                        <td style={{ padding: '0.75em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', }}>
                          {formatearFecha(auditoria.fecha_operacion)}
                        </td>
                        <td style={{ padding: '0.75em' }}>
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.95)', margin: '0 0 0.125em 0', }}>
                              {auditoria.usuario_nombre} {auditoria.usuario_apellido}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                              @{auditoria.usuario_username}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '0.75em' }}>
                          <span style={{
                            display: 'inline-flex',
                            padding: '0.25em 0.625em',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            borderRadius: '0.5em',
                            textTransform: 'uppercase',
                            background: auditoria.operacion === 'INSERT' ? 'rgba(16, 185, 129, 0.15)' :
                              auditoria.operacion === 'UPDATE' ? 'rgba(245, 158, 11, 0.15)' :
                                'rgba(239, 68, 68, 0.15)',
                            color: auditoria.operacion === 'INSERT' ? '#10b981' :
                              auditoria.operacion === 'UPDATE' ? '#f59e0b' :
                                '#ef4444',
                            border: `0.0625rem solid ${auditoria.operacion === 'INSERT' ? 'rgba(16, 185, 129, 0.3)' :
                              auditoria.operacion === 'UPDATE' ? 'rgba(245, 158, 11, 0.3)' :
                                'rgba(239, 68, 68, 0.3)'}`,
                                                      }}>
                            {auditoria.operacion}
                          </span>
                        </td>
                        <td style={{ padding: '0.75em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
                          {auditoria.tabla_afectada}
                        </td>
                        <td style={{ padding: '0.75em', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                          #{auditoria.id_registro}
                        </td>
                        <td style={{ padding: '0.75em', fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>
                          {auditoria.ip_address}
                        </td>
                        <td style={{ padding: '0.75em', textAlign: 'center' }}>
                          <button
                            onClick={() => verDetalle(auditoria)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375em',
                              padding: '0.5em 0.875em',
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '0.0625rem solid rgba(59, 130, 246, 0.3)',
                              borderRadius: '0.5em',
                              color: '#3b82f6',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                                                          }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '1em 1.5em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '0.0625rem solid rgba(255,255,255,0.08)',
                flexWrap: 'wrap',
                gap: '1em'
              }}>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.7)',
                                  }}>
                  Mostrando {((paginaActual - 1) * limite) + 1} - {Math.min(paginaActual * limite, total)} de {total} registros
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    disabled={paginaActual === 1}
                    style={{
                      padding: '0.5em',
                      background: paginaActual === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      border: '0.0625rem solid rgba(255,255,255,0.2)',
                      borderRadius: '0.5em',
                      color: paginaActual === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                      cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      opacity: paginaActual === 1 ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (paginaActual !== 1) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (paginaActual !== 1) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <span style={{
                    padding: '0.5em 1em',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.9)',
                                      }}>
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaActual === totalPaginas}
                    style={{
                      padding: '0.5em',
                      background: paginaActual === totalPaginas ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      border: '0.0625rem solid rgba(255,255,255,0.2)',
                      borderRadius: '0.5em',
                      color: paginaActual === totalPaginas ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                      cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      opacity: paginaActual === totalPaginas ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (paginaActual !== totalPaginas) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (paginaActual !== totalPaginas) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal de detalle */}
        {showModal && modalDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Detalle de Auditoría #{modalDetalle.id_auditoria}</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Operación</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getColorOperacion(modalDetalle.operacion)}`}>
                      {modalDetalle.operacion}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tabla</p>
                    <p className="font-semibold text-gray-900 font-mono">{modalDetalle.tabla_afectada}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ID Registro</p>
                    <p className="font-semibold text-gray-900">#{modalDetalle.id_registro}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Fecha/Hora</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatearFecha(modalDetalle.fecha_operacion)}</p>
                  </div>
                </div>

                {/* Usuario e IP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">Usuario</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {modalDetalle.usuario_nombre} {modalDetalle.usuario_apellido}
                    </p>
                    <p className="text-sm text-gray-600">@{modalDetalle.usuario_username}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {modalDetalle.usuario_id}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-semibold text-purple-900">Conexión</p>
                    </div>
                    <p className="font-mono text-sm text-gray-900">{modalDetalle.ip_address}</p>
                    <p className="text-xs text-gray-600 mt-2 truncate" title={modalDetalle.user_agent}>
                      {modalDetalle.user_agent}
                    </p>
                  </div>
                </div>

                {/* Diff de cambios */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Cambios Realizados</h4>
                  {renderDiff()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    </>
  );
};

export default HistorialAuditoria;
