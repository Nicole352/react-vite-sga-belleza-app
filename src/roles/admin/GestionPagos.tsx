import { useState, useEffect } from 'react';
import { 
  DollarSign, Search, Eye, Download, X, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000';

interface Pago {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  metodo_pago: string;
  numero_comprobante: string | null;
  banco_comprobante: string | null;
  estado: 'pendiente' | 'pagado' | 'verificado' | 'vencido';
  observaciones: string | null;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cedula: string;
  curso_nombre: string;
  codigo_matricula: string;
}

interface Estadisticas {
  total_pagos: number;
  pagos_pendientes: number;
  pagos_verificados: number;
  monto_total_pendiente: number;
  monto_total_verificado: number;
}

const GestionPagos = () => {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [comprobanteNumero, setComprobanteNumero] = useState<string>('');
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      // Cargar pagos con filtros
      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') {
        params.set('estado', filtroEstado);
      }
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      params.set('limit', '100');
      
      const resPagos = await fetch(`${API_BASE}/api/admin/pagos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!resPagos.ok) {
        throw new Error('Error cargando pagos');
      }
      
      const dataPagos = await resPagos.json();
      setPagos(dataPagos);

      // Cargar estadísticas
      const resStats = await fetch(`${API_BASE}/api/admin/pagos/estadisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!resStats.ok) {
        throw new Error('Error cargando estadísticas');
      }
      
      const dataStats = await resStats.json();
      setEstadisticas(dataStats);

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos de pagos', {
        icon: <AlertCircle size={20} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'verificado': return '#10b981';
      case 'pagado': return '#f59e0b';
      case 'pendiente': return '#6b7280';
      case 'vencido': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'verificado': return 'Verificado';
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente';
      case 'vencido': return 'Vencido';
      default: return estado;
    }
  };

  const handleVerComprobante = (pago: Pago) => {
    const url = `${API_BASE}/api/admin/pagos/${pago.id_pago}/comprobante`;
    setComprobanteUrl(url);
    setComprobanteNumero(pago.numero_comprobante || 'N/A');
    setShowComprobanteModal(true);
  };

  // Filtrar y ordenar pagos
  const pagosFiltrados = pagos
    .filter(pago => {
      const matchSearch = 
        pago.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.estudiante_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.estudiante_cedula.includes(searchTerm) ||
        pago.curso_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pago.codigo_matricula.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado = filtroEstado === 'todos' || pago.estado === filtroEstado;

      return matchSearch && matchEstado;
    })
    .sort((a, b) => {
      // Ordenar por fecha de vencimiento, más antiguos primero (prioridad)
      const dateA = new Date(a.fecha_vencimiento).getTime();
      const dateB = new Date(b.fecha_vencimiento).getTime();
      return dateA - dateB;
    });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pagosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pagosFiltrados.length / itemsPerPage);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '25rem',
        color: 'var(--admin-text-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '3.125rem', 
            height: '3.125rem', 
            border: '4px solid var(--admin-border)', 
            borderTop: '4px solid var(--admin-accent)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Cargando pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 0.5rem 0',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem'
        }}>
          <DollarSign size={32} color="#ef4444" />
          Gestión de Pagos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra y verifica los pagos mensuales de los estudiantes
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.25rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1.5rem',
            borderRadius: '1.25rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Total Pagos
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff' }}>
              {estadisticas.total_pagos}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1.5rem',
            borderRadius: '1.25rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Pendientes
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b' }}>
              {estadisticas.pagos_pendientes}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1.5rem',
            borderRadius: '1.25rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Verificados
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {estadisticas.pagos_verificados}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1.5rem',
            borderRadius: '1.25rem'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Monto Pendiente
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
              {formatearMonto(estadisticas.monto_total_pendiente)}
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(1.25rem)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '18.75rem' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Buscar por estudiante, cédula, curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 0.75rem 0.75rem 2.75rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{
                padding: '10px 1rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.75rem',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                minWidth: '11.25rem'
              }}
            >
              <option value="todos" style={{ background: '#1a1a2e', color: '#fff' }}>Todos los estados</option>
              <option value="pendiente" style={{ background: '#1a1a2e', color: '#fff' }}>Pendientes</option>
              <option value="pagado" style={{ background: '#1a1a2e', color: '#fff' }}>Pagados</option>
              <option value="verificado" style={{ background: '#1a1a2e', color: '#fff' }}>Verificados</option>
              <option value="vencido" style={{ background: '#1a1a2e', color: '#fff' }}>Vencidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(1.25rem)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '1.25rem',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--admin-hover-bg)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Estudiante</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Curso</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Cuota</th>
                <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Monto</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Vencimiento</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Estado</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-primary)', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((pago) => (
                <tr 
                  key={pago.id_pago}
                  style={{ 
                    borderTop: '1px solid var(--admin-border)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--admin-hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--admin-text-primary)', fontWeight: '600' }}>
                      {pago.estudiante_nombre} {pago.estudiante_apellido}
                    </div>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                      {pago.estudiante_cedula}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--admin-text-secondary)' }}>
                    {pago.curso_nombre}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-primary)', fontWeight: '600' }}>
                    #{pago.numero_cuota}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--admin-text-primary)', fontWeight: '700' }}>
                    {formatearMonto(pago.monto)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
                    {formatearFecha(pago.fecha_vencimiento)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '6px 0.75rem',
                      borderRadius: '1.25rem',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      background: `${getEstadoColor(pago.estado)}20`,
                      color: getEstadoColor(pago.estado)
                    }}>
                      {getEstadoLabel(pago.estado)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => {
                        setSelectedPago(pago);
                        setShowModal(true);
                      }}
                      style={{
                        padding: '8px 1rem',
                        background: 'var(--admin-accent)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem'
                      }}
                    >
                      <Eye size={16} />
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagosFiltrados.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 1.5rem',
            borderTop: '1px solid var(--admin-border)'
          }}>
            <div style={{ color: 'var(--admin-text-secondary)', fontSize: '0.9rem' }}>
              Página {currentPage} de {totalPages} • Total: {pagosFiltrados.length} pagos
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '8px 1rem',
                  background: currentPage === 1 ? 'var(--admin-input-bg)' : 'var(--admin-hover-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '0.625rem',
                  color: currentPage === 1 ? 'var(--admin-text-muted)' : 'var(--admin-text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '8px 0.875rem',
                    background: currentPage === pageNum ? 'var(--admin-accent)' : 'var(--admin-input-bg)',
                    border: currentPage === pageNum ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                    borderRadius: '0.625rem',
                    color: currentPage === pageNum ? '#fff' : 'var(--admin-text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '2.5rem',
                  }}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '8px 1rem',
                  background: currentPage === totalPages ? 'var(--admin-input-bg)' : 'var(--admin-hover-bg)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: '0.625rem',
                  color: currentPage === totalPages ? 'var(--admin-text-muted)' : 'var(--admin-text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle (placeholder) */}
      {showModal && selectedPago && (
        <div 
          data-modal-overlay="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem'
          }}
        >
          <div style={{
            background: 'var(--admin-bg-secondary)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '37.5rem',
            width: '100%',
            border: '1px solid var(--admin-border)'
          }}>
            <h2 style={{ color: 'var(--admin-text-primary)', marginBottom: '1.5rem' }}>
              Detalle del Pago
            </h2>
            
            {/* Sección de Comprobante */}
            {selectedPago.numero_comprobante && (
              <div style={{ marginTop: 16, marginBottom: 24, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: 12, padding: 16 }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--admin-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                  <Download size={18} color="#10b981" />
                  Comprobante
                </h4>
                <div style={{ marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => handleVerComprobante(selectedPago)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 1rem',
                      borderRadius: 8,
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} /> Ver Comprobante
                  </button>
                </div>
                <p style={{ color: 'var(--admin-text-muted)', margin: 0, fontSize: '0.8rem' }}>
                  Haz clic para ver el comprobante de pago en un modal.
                </p>
              </div>
            )}
            
            <p style={{ color: 'var(--admin-text-secondary)' }}>
              Funcionalidad de detalle completo en desarrollo...
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '1.5rem',
                padding: '12px 1.5rem',
                background: 'var(--admin-accent)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal Comprobante */}
      {showComprobanteModal && (
        <div 
          data-modal-overlay="true"
          style={{ 
            position: 'fixed', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 60 
          }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 16, 
            width: 'min(90vw, 50rem)', 
            maxHeight: '90vh',
            padding: 24, 
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={20} />
                  Comprobante de Pago
                </h3>
                {comprobanteNumero && (
                  <p style={{ 
                    margin: '4px 0 0 1.75rem', 
                    color: '#fbbf24', 
                    fontSize: '0.9rem',
                    fontFamily: 'monospace',
                    fontWeight: '600'
                  }}>
                    Número de Comprobante: {comprobanteNumero}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setShowComprobanteModal(false)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#fff', 
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '1rem',
              overflow: 'hidden'
            }}>
              <img 
                src={comprobanteUrl} 
                alt="Comprobante de pago"
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '100%', 
                  objectFit: 'contain',
                  borderRadius: '0.5rem'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const errorDiv = document.createElement('div');
                  errorDiv.innerHTML = `
                    <div style="text-align: center; color: rgba(255,255,255,0.7);">
                      <p>No se pudo cargar la imagen del comprobante</p>
                      <a href="${comprobanteUrl}" target="_blank" style="color: #10b981; text-decoration: underline;">
                        Abrir en nueva pestaña
                      </a>
                    </div>
                  `;
                  (e.target as HTMLImageElement).parentNode?.appendChild(errorDiv);
                }}
              />
            </div>
            
            <div style={{ 
              marginTop: '1rem', 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.75rem' 
            }}>
              <a 
                href={comprobanteUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  padding: '10px 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <Download size={16} />
                Descargar
              </a>
              <button
                onClick={() => setShowComprobanteModal(false)}
                style={{
                  background: 'rgba(156, 163, 175, 0.15)',
                  border: '1px solid rgba(156, 163, 175, 0.3)',
                  color: '#9ca3af',
                  padding: '10px 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GestionPagos;



