import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, XCircle, CreditCard } from 'lucide-react';
import ModalPagoMensualidad from './ModalPagoMensualidad';
import EstudianteThemeWrapper from '../../components/EstudianteThemeWrapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = 'http://localhost:3000';

interface CursoConPagos {
  id_matricula: number;
  codigo_matricula: string;
  curso_nombre: string;
  codigo_curso: string;
  tipo_curso_nombre: string;
  total_cuotas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
  proxima_fecha_vencimiento: string;
  monto_pendiente: number;
}

interface Cuota {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  fecha_pago: string | null;
  numero_comprobante: string | null;
  estado: 'pendiente' | 'pagado' | 'verificado' | 'vencido';
  observaciones: string | null;
  curso_nombre: string;
  tipo_curso_nombre: string;
  modalidad_pago?: 'mensual' | 'clases';
  numero_clases?: number;
  precio_por_clase?: number;
}

interface ResumenPagos {
  total_cuotas: number;
  cuotas_pagadas: number;
  cuotas_pendientes: number;
  cuotas_vencidas: number;
  cuotas_verificadas: number;
  monto_total: number;
  monto_pagado: number;
  monto_pendiente: number;
}

interface PagosMenualesProps {
  darkMode?: boolean;
}

const PagosMenuales: React.FC<PagosMenualesProps> = ({ darkMode = false }) => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  const [cursosConPagos, setCursosConPagos] = useState<CursoConPagos[]>([]);
  const [resumenPagos, setResumenPagos] = useState<ResumenPagos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales
  const [showCuotasModal, setShowCuotasModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedMatricula, setSelectedMatricula] = useState<CursoConPagos | null>(null);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [cuotasMatricula, setCuotasMatricula] = useState<Cuota[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);

  const loadCuotasMatricula = async (id_matricula: number) => {
    try {
      setLoadingCuotas(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_BASE}/api/pagos-mensuales/cuotas/${id_matricula}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Error cargando cuotas');
      }

      const cuotas = await response.json();
      setCuotasMatricula(cuotas);
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      setError(error instanceof Error ? error.message : 'Error cargando cuotas');
    } finally {
      setLoadingCuotas(false);
    }
  };

  const handleVerCuotas = async (curso: CursoConPagos) => {
    setSelectedMatricula(curso);
    setShowCuotasModal(true);
    await loadCuotasMatricula(curso.id_matricula);
  };

  const handlePagarCuota = (cuota: Cuota) => {
    setSelectedCuota(cuota);
    setShowPagoModal(true);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Cargar cursos con pagos pendientes
      const resCursos = await fetch(`${API_BASE}/api/pagos-mensuales/cursos-pendientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resCursos.ok) {
        throw new Error('Error cargando cursos');
      }

      const cursos = await resCursos.json();
      setCursosConPagos(cursos);

      // Cargar resumen de pagos
      const resResumen = await fetch(`${API_BASE}/api/pagos-mensuales/resumen`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resResumen.ok) {
        throw new Error('Error cargando resumen');
      }

      const resumen = await resResumen.json();
      setResumenPagos(resumen);

    } catch (error) {
      console.error('Error cargando datos:', error);
      setError(error instanceof Error ? error.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatearMonto = (monto: number | string) => {
    const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;
    return `$${(montoNumerico || 0).toFixed(2)}`;
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pagado': return '#10b981';
      case 'verificado': return '#3b82f6';
      case 'vencido': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'En Verificación';
      case 'verificado': return 'Verificado';
      case 'vencido': return 'Vencido';
      default: return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2.5em',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <div style={{ fontSize: '1.1rem' }}>Cargando pagos mensuales...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f9fafb',
          color: '#1f2937',
          padding: '1.25em'
        }}
      >
        <AlertCircle size={48} style={{ marginBottom: '1em', color: '#ef4444' }} />
        <div style={{ fontSize: '1.1rem', marginBottom: '0.5em' }}>Error al cargar datos</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error}</div>
        <button
          onClick={loadData}
          style={{
            marginTop: '1em',
            padding: '0.5em 1em',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375em',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100%',
        backgroundColor: darkMode ? '#1a1a1a' : '#f9fafb',
        color: darkMode ? '#fff' : '#1f2937',
        padding: '1rem',
        paddingBottom: '2rem'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={16} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '0.9rem' : '1rem', fontWeight: '800', margin: 0, color: darkMode ? '#fff' : '#1f2937' }}>
              Gestión de Pagos
            </h1>
            <p style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', margin: 0 }}>
              Gestiona y paga las mensualidades de tus cursos de forma rápida y segura
            </p>
          </div>
        </div>
      </div>

      {/* Info compacta */}
      <div style={{
        background: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: darkMode ? '0.0625rem solid rgba(255,255,255,0.15)' : '0.0625rem solid #e5e7eb',
        borderRadius: '0.625em',
        padding: '0.75rem',
        marginBottom: '0.75rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '0.375em'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em', alignItems: 'center', fontSize: '0.78rem' }}>
          <span style={{ fontWeight: 700, color: darkMode ? '#fff' : '#1f2937' }}>Disponible</span>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Pagos online seguros</span>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Historial de pagos</span>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Múltiples métodos de pago</span>
          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>24/7 Online</span>
          <span style={{ color: darkMode ? '#fbbf24' : '#b45309' }}>pagos@sgabelleza.edu.ec</span>
        </div>
        <button
          onClick={() => {
            const el = document.getElementById('cursos-pagos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5em',
            padding: '0.375em 0.625em',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Gestionar Pagos
        </button>
      </div>

      {/* Resumen de pagos */}
      {resumenPagos && (
        <div className="responsive-grid-4" style={{
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.5em',
            padding: '0.625rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6', marginBottom: '0.125em' }}>
              {resumenPagos.total_cuotas}
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Total Cuotas</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.625em',
            padding: '0.375em',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981', marginBottom: '0.125em' }}>
              {resumenPagos.cuotas_verificadas}
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Verificadas</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.625em',
            padding: '0.375em',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#f59e0b', marginBottom: '0.125em' }}>
              {resumenPagos.cuotas_pendientes}
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Pendientes</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.625em',
            padding: '0.375em',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ef4444', marginBottom: '0.125em' }}>
              {formatearMonto(resumenPagos.monto_pendiente)}
            </div>
            <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Monto Pendiente</div>
          </div>
        </div>
      )}

      {/* Cursos con pagos pendientes */}
      <div id="cursos-pagos" style={{ marginBottom: '0.75em' }}>
        <h2 style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: '800', marginBottom: '0.5em', color: darkMode ? '#fff' : '#1f2937' }}>
          Cursos con Pagos Pendientes
        </h2>

        {cursosConPagos.length === 0 ? (
          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.75em',
            padding: '2.5em',
            textAlign: 'center'
          }}>
            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1em' }} />
            <div style={{ fontSize: '1.1rem', color: darkMode ? '#fff' : '#1f2937', marginBottom: '0.5em' }}>
              ¡Excelente! No tienes pagos pendientes
            </div>
            <div style={{ fontSize: '0.9rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
              Todas tus mensualidades están al día
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
            {cursosConPagos.map((curso) => (
              <div
                key={curso.id_matricula}
                style={{
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#ffffff',
                  border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
                  borderRadius: '0.625em',
                  padding: '0.625em'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5em' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: '0 0 0.125em 0', color: darkMode ? '#fff' : '#1f2937' }}>
                      {curso.curso_nombre}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                      {curso.tipo_curso_nombre} • {curso.codigo_matricula}
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerCuotas(curso)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375em',
                      padding: '0.375em 0.625em',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5em',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={14} />
                    Ver Cuotas
                  </button>
                </div>

                <div className="responsive-grid-auto" style={{ gap: '0.375em' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '0.125em' }}>Cuotas Pendientes</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#f59e0b' }}>
                      {curso.cuotas_pendientes}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '0.125em' }}>Cuotas Vencidas</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ef4444' }}>
                      {curso.cuotas_vencidas}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '0.125em' }}>Monto Pendiente</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: darkMode ? '#fff' : '#1f2937' }}>
                      {formatearMonto(curso.monto_pendiente)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '0.125em' }}>Próximo Vencimiento</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: darkMode ? '#fff' : '#1f2937' }}>
                      {formatearFecha(curso.proxima_fecha_vencimiento)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de cuotas */}
      {showCuotasModal && selectedMatricula && (
        <EstudianteThemeWrapper darkMode={darkMode}>
          <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(0.375rem)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1em',
          overflowY: 'auto'
        }}>
          <div style={{
            backgroundColor: darkMode ? 'rgba(0,0,0,0.95)' : '#ffffff',
            borderRadius: '0.75em',
            width: '100%',
            maxWidth: '50rem',
            maxHeight: '85vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.15)' : '0.0625rem solid #e5e7eb',
            boxShadow: darkMode ? '0 1.25rem 3rem rgba(0,0,0,0.5)' : '0 1.25rem 3rem rgba(0,0,0,0.2)',
            margin: 'auto'
          }}>
            {/* Header del modal */}
            <div style={{
              padding: '0.75em',
              borderBottom: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: '0 0 0.125em 0', color: darkMode ? '#fff' : '#1f2937' }}>
                  Cuotas de {selectedMatricula.curso_nombre}
                </h3>
                <div style={{ fontSize: '0.78rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                  {selectedMatricula.codigo_matricula}
                </div>
              </div>
              <button
                onClick={() => setShowCuotasModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280',
                  padding: '0.25em'
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del modal */}
            <div style={{ padding: '0.75em', overflow: 'auto' }}>
              {loadingCuotas ? (
                <div style={{ textAlign: 'center', padding: '1.25em', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                  Cargando cuotas...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                  {cuotasMatricula.map((cuota) => (
                    <div
                      key={cuota.id_pago}
                      style={{
                        backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                        border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
                        borderRadius: '0.5em',
                        padding: '0.625em'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em' }}>
                          <div style={{
                            backgroundColor: getEstadoColor(cuota.estado),
                            color: 'white',
                            padding: '0.1875em 0.375em',
                            borderRadius: '0.25em',
                            fontSize: '0.75rem',
                            fontWeight: '700'
                          }}>
                            {getEstadoTexto(cuota.estado)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '800', color: darkMode ? '#fff' : '#1f2937', fontSize: '0.9rem' }}>
                              {cuota.modalidad_pago === 'clases'
                                ? `Clase ${cuota.numero_cuota} - ${formatearMonto(cuota.monto)}`
                                : `Cuota ${cuota.numero_cuota} - ${formatearMonto(cuota.monto)}`
                              }
                            </div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                              {cuota.modalidad_pago === 'clases'
                                ? `Fecha programada: ${formatearFecha(cuota.fecha_vencimiento)}`
                                : `Vence: ${formatearFecha(cuota.fecha_vencimiento)}`
                              }
                            </div>
                            {cuota.modalidad_pago === 'clases' && cuota.numero_clases && (
                              <div style={{ fontSize: '0.75rem', color: darkMode ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
                                Clase {cuota.numero_cuota} de {cuota.numero_clases} total
                              </div>
                            )}
                          </div>
                        </div>

                        {cuota.estado === 'pendiente' || cuota.estado === 'vencido' ? (
                          <button
                            onClick={() => handlePagarCuota(cuota)}
                            style={{
                              padding: '0.375em 0.625em',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.375em',
                              fontSize: '0.8rem',
                              fontWeight: '800',
                              cursor: 'pointer'
                            }}
                          >
                            {cuota.modalidad_pago === 'clases' ? 'Pagar Clase' : 'Pagar'}
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.78rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>
                            {cuota.fecha_pago && `Pagado: ${formatearFecha(cuota.fecha_pago)}`}
                          </div>
                        )}
                      </div>

                      {/* Alerta de pago en verificación */}
                      {cuota.estado === 'pagado' && (
                        <div style={{
                          marginTop: '0.5em',
                          padding: '0.5em',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '0.0625rem solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '0.375em',
                          display: 'flex',
                          gap: '0.375em',
                          alignItems: 'flex-start'
                        }}>
                          <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.125em' }} />
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#10b981', marginBottom: '0.125em' }}>
                              ⏳ Pago en Verificación
                            </div>
                            <div style={{ fontSize: '0.8rem', color: darkMode ? 'rgba(255,255,255,0.8)' : '#1f2937' }}>
                              Tu comprobante ha sido recibido y está siendo revisado por el administrador.
                            </div>
                            <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280', marginTop: '0.125em' }}>
                              Recibirás una notificación cuando sea verificado.
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Alerta de pago rechazado */}
                      {cuota.observaciones && (cuota.estado === 'pendiente' || cuota.estado === 'vencido') &&
                        (cuota.observaciones.toLowerCase().includes('rechazado') ||
                          cuota.observaciones.toLowerCase().includes('incorrecto') ||
                          cuota.observaciones.toLowerCase().includes('error') ||
                          cuota.observaciones.toLowerCase().includes('inválido')) && (
                          <div style={{
                            marginTop: '0.5em',
                            padding: '0.5em',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.375em',
                            display: 'flex',
                            gap: '0.375em',
                            alignItems: 'flex-start'
                          }}>
                            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.125em' }} />
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.125em' }}>
                                <XCircle size={16} style={{ display: 'inline', marginRight: '0.25em' }} /> Pago Rechazado
                              </div>
                              <div style={{ fontSize: '0.8rem', color: darkMode ? 'rgba(255,255,255,0.8)' : '#1f2937' }}>
                                {cuota.observaciones}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280', marginTop: '0.125em' }}>
                                Por favor, vuelve a subir el comprobante correcto.
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </EstudianteThemeWrapper>
      )}

      {/* Modal de pago */}
      {showPagoModal && selectedCuota && (
        <ModalPagoMensualidad
          cuota={selectedCuota}
          darkMode={darkMode}
          onClose={() => {
            setShowPagoModal(false);
            setSelectedCuota(null);
          }}
          onSuccess={() => {
            // Recargar datos después del pago exitoso
            loadData();
            if (selectedMatricula) {
              loadCuotasMatricula(selectedMatricula.id_matricula);
            }
          }}
        />
      )}
    </div>
  );
};

export default PagosMenuales;
