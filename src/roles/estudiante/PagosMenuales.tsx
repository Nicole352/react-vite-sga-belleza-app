import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, XCircle, CreditCard, Gift, Calendar, DollarSign, Clock, FileText, Sparkles } from 'lucide-react';
import { showToast } from '../../config/toastConfig';
import ModalPagoMensualidad from './ModalPagoMensualidad';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';
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
  monto_matricula: number;
  es_curso_promocional: boolean;
  id_promocion?: number;
  nombre_promocion?: string;
  meses_gratis?: number;
  fecha_inicio_cobro?: string;
  meses_gratis_aplicados?: number;
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
  const { isMobile } = useBreakpoints();
  const [cursosConPagos, setCursosConPagos] = useState<CursoConPagos[]>([]);
  const [resumenPagos, setResumenPagos] = useState<ResumenPagos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | undefined>(undefined);

  // Estados para expandir cuotas inline
  const [cursoExpandido, setCursoExpandido] = useState<number | null>(null);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [cuotasPorCurso, setCuotasPorCurso] = useState<{[key: number]: Cuota[]}>({});
  const [loadingCuotas, setLoadingCuotas] = useState<{[key: number]: boolean}>({});

  // Obtener userId del token al montar
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id_usuario);
        console.log('👤 userId obtenido para WebSocket:', payload.id_usuario);
      } catch (error) {
        console.error('Error decodificando token:', error);
      }
    }
  }, []);

  useSocket({
    'pago_verificado_estudiante': (data: any) => {
      console.log('✅ Pago verificado (estudiante):', data);
      showToast.success(`¡Tu pago de la cuota #${data.numero_cuota} ha sido verificado!`, darkMode);
      loadData();
      // Recargar cuotas si el curso está expandido
      if (cursoExpandido) {
        loadCuotasMatricula(cursoExpandido);
      }
    },
    'pago_verificado': (data: any) => {
      console.log('✅ Pago verificado (broadcast):', data);
      showToast.success('¡Tu pago ha sido verificado!', darkMode);
      loadData();
      // Recargar cuotas si el curso está expandido
      if (cursoExpandido) {
        loadCuotasMatricula(cursoExpandido);
      }
    },
    'pago_rechazado': (data: any) => {
      console.log('❌ Pago rechazado:', data);
      showToast.error(`Pago rechazado: ${data.observaciones}`, darkMode);
      loadData();
      // Recargar cuotas si el curso está expandido
      if (cursoExpandido) {
        loadCuotasMatricula(cursoExpandido);
      }
    }
  }, userId); // <-- Pasar userId como segundo parámetro

  const loadCuotasMatricula = async (id_matricula: number) => {
    try {
      setLoadingCuotas(prev => ({ ...prev, [id_matricula]: true }));
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
      setCuotasPorCurso(prev => ({ ...prev, [id_matricula]: cuotas }));
    } catch (error) {
      console.error('Error cargando cuotas:', error);
      showToast.error('Error cargando cuotas', darkMode);
    } finally {
      setLoadingCuotas(prev => ({ ...prev, [id_matricula]: false }));
    }
  };

  const handleToggleCuotas = async (curso: CursoConPagos) => {
    if (cursoExpandido === curso.id_matricula) {
      // Si ya está expandido, colapsar
      setCursoExpandido(null);
    } else {
      // Expandir y cargar cuotas
      setCursoExpandido(curso.id_matricula);
      if (!cuotasPorCurso[curso.id_matricula]) {
        await loadCuotasMatricula(curso.id_matricula);
      }
    }
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
        backgroundColor: 'transparent',
        color: darkMode ? '#fff' : '#1f2937',
        padding: '0',
        paddingBottom: '1.5rem',
        paddingTop: '0.75rem'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
            borderRadius: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
          }}>
            <CreditCard size={24} strokeWidth={2.5} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: '800', margin: 0, color: darkMode ? '#fff' : '#1f2937' }}>
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
            padding: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.25rem' }}>
              {resumenPagos.total_cuotas}
            </div>
            <div style={{ fontSize: '0.7rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Total Cuotas</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.5em',
            padding: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
              {resumenPagos.cuotas_verificadas}
            </div>
            <div style={{ fontSize: '0.7rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Verificadas</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.5em',
            padding: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem' }}>
              {resumenPagos.cuotas_pendientes}
            </div>
            <div style={{ fontSize: '0.7rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Pendientes</div>
          </div>

          <div style={{
            backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
            border: darkMode ? '0.0625rem solid rgba(255,255,255,0.2)' : '0.0625rem solid #e5e7eb',
            borderRadius: '0.5em',
            padding: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.25rem' }}>
              {formatearMonto(resumenPagos.monto_pendiente)}
            </div>
            <div style={{ fontSize: '0.7rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280' }}>Monto Pendiente</div>
          </div>
        </div>
      )}

      {/* Cursos con pagos pendientes */}
      <div id="cursos-pagos" style={{ marginBottom: '0.75em' }}>
        <h2 style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', fontWeight: '700', marginBottom: '0.75em', color: darkMode ? '#fff' : '#1f2937' }}>
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
            {cursosConPagos
              .filter(curso => curso.curso_nombre.toString() !== "0" && curso.curso_nombre.toString().trim() !== "")
              .map((curso) => (
              <div
                key={curso.id_matricula}
                style={{
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  border: `1px solid ${darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.2)'}`,
                  borderRadius: '1rem',
                  padding: '1.15em 1.25em',
                  backdropFilter: 'blur(10px)',
                  boxShadow: darkMode 
                    ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(251, 191, 36, 0.1)' 
                    : '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(251, 191, 36, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: 0, marginBottom: '0.75em' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: darkMode ? '#fff' : '#1f2937' }}>
                        {curso.curso_nombre.toString().replace(/\s*0\s*$/, '')}
                      </h3>
                      {curso.es_curso_promocional && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375em',
                          padding: '0.25em 0.625em',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          borderRadius: '0.5em',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}>
                          <Gift size={12} strokeWidth={2.5} />
                          CURSO PROMOCIONAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '0.25em' }}>
                      {curso.tipo_curso_nombre} {!curso.es_curso_promocional && curso.codigo_matricula && curso.codigo_matricula.toString() !== "0" && `• ${curso.codigo_matricula.toString().replace(/\s*0\s*$/, '')}`}
                    </div>
                    {curso.es_curso_promocional && curso.nombre_promocion && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#10b981',
                        fontWeight: '600',
                        marginTop: '0.25em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375em',
                        flexWrap: 'wrap'
                      }}>
                        <Sparkles size={14} strokeWidth={2.5} />
                        <span>{curso.nombre_promocion} - {curso.meses_gratis} {curso.meses_gratis === 1 ? 'mes' : 'meses'} GRATIS</span>
                        {curso.fecha_inicio_cobro && (
                          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', fontWeight: '400' }}>
                            • Inicio de cobros: {new Date(curso.fecha_inicio_cobro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleCuotas(curso)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em',
                      padding: '0.5em 0.875em',
                      background: cursoExpandido === curso.id_matricula 
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                        : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.625em',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0,
                      boxShadow: cursoExpandido === curso.id_matricula
                        ? '0 2px 8px rgba(239, 68, 68, 0.3)'
                        : '0 2px 8px rgba(251, 191, 36, 0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = cursoExpandido === curso.id_matricula
                        ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                        : '0 4px 12px rgba(251, 191, 36, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = cursoExpandido === curso.id_matricula
                        ? '0 2px 8px rgba(239, 68, 68, 0.3)'
                        : '0 2px 8px rgba(251, 191, 36, 0.3)';
                    }}
                  >
                    {cursoExpandido === curso.id_matricula ? (
                      <>
                        <XCircle size={16} strokeWidth={2.5} color="#fff" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye size={16} strokeWidth={2.5} color="#fff" />
                        Ver Cuotas
                      </>
                    )}
                  </button>
                </div>

                <div className="responsive-grid-auto" style={{ gap: '0.5em', marginTop: '0.25em' }}>
                  <div style={{
                    padding: '0.625em',
                    background: darkMode ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '0.625em',
                    border: `1px solid ${darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.2)'}`
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginBottom: '0.375em', display: 'flex', alignItems: 'center', gap: '0.25em', fontWeight: '600' }}>
                      <Clock size={12} strokeWidth={2.5} color="#f59e0b" />
                      Cuotas Pendientes
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#f59e0b' }}>
                      {curso.cuotas_pendientes > 0 ? curso.cuotas_pendientes : 1}
                    </div>
                  </div>

                  <div style={{
                    padding: '0.625em',
                    background: darkMode ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '0.625em',
                    border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', marginBottom: '0.375em', display: 'flex', alignItems: 'center', gap: '0.25em', fontWeight: '600' }}>
                      <AlertCircle size={12} strokeWidth={2.5} color="#ef4444" />
                      Cuotas Vencidas
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#ef4444' }}>
                      {curso.cuotas_vencidas > 0 ? curso.cuotas_vencidas : 0}
                    </div>
                  </div>

                  <div style={{
                    padding: '0.625em',
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '0.625em',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`
                  }}>
                    <div style={{ fontSize: '0.72rem', color: darkMode ? '#fbbf24' : '#f59e0b', marginBottom: '0.375em', display: 'flex', alignItems: 'center', gap: '0.25em', fontWeight: '600' }}>
                      <DollarSign size={12} strokeWidth={2.5} color={darkMode ? '#fbbf24' : '#f59e0b'} />
                      Monto Pendiente
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: darkMode ? '#fbbf24' : '#f59e0b' }}>
                      {formatearMonto(curso.monto_pendiente)}
                    </div>
                  </div>

                  {!curso.es_curso_promocional && curso.proxima_fecha_vencimiento && (
                    <div style={{
                      padding: '0.625em',
                      background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '0.625em',
                      border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.2)'}`
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginBottom: '0.375em', display: 'flex', alignItems: 'center', gap: '0.25em', fontWeight: '600' }}>
                        <Calendar size={12} strokeWidth={2.5} color="#3b82f6" />
                        Próximo Vencimiento
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#3b82f6' }}>
                        {formatearFecha(curso.proxima_fecha_vencimiento)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Información y opciones para curso promocional */}
                {curso.es_curso_promocional && (
                  <div style={{
                    marginTop: '0.5em',
                    padding: '0.875em 1em',
                    background: darkMode 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))' 
                      : 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : '#10b981'}`,
                    borderRadius: '0.75em',
                    boxShadow: darkMode 
                      ? '0 4px 12px rgba(16, 185, 129, 0.1)' 
                      : '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: darkMode ? '#d1fae5' : '#065f46', 
                      marginBottom: '0.625em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em',
                      fontWeight: '700'
                    }}>
                      <Gift size={16} strokeWidth={2.5} />
                      <strong>Beneficio Promocional:</strong>
                    </div>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '1.5em', 
                      fontSize: '0.8rem', 
                      color: darkMode ? 'rgba(209, 250, 229, 0.9)' : '#047857',
                      lineHeight: '1.6'
                    }}>
                      <li>Este curso es completamente <strong>GRATIS</strong> por {curso.meses_gratis} {curso.meses_gratis === 1 ? 'mes' : 'meses'}</li>
                      {curso.fecha_inicio_cobro && (
                        <li>Los cobros iniciarán en: <strong>{new Date(curso.fecha_inicio_cobro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></li>
                      )}
                      <li>Puedes decidir si deseas continuar antes de que termine el período gratuito</li>
                    </ul>
                    
                    {/* Botones de decisión (solo si está cerca del fin del período gratuito) */}
                    {curso.fecha_inicio_cobro && new Date(curso.fecha_inicio_cobro).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000 && (
                      <div style={{ 
                        marginTop: '0.75em', 
                        display: 'flex', 
                        gap: '0.5em',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '0.625em 1em',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.625em',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5em',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => showToast.success('¡Excelente! Continuarás con el curso después del período gratuito', darkMode)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                          }}
                        >
                          <CheckCircle size={16} strokeWidth={2.5} />
                          Quiero Continuar
                        </button>
                        <button
                          style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '0.625em 1em',
                            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                            color: darkMode ? '#fca5a5' : '#dc2626',
                            border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5'}`,
                            borderRadius: '0.625em',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5em',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            if (confirm('¿Estás seguro de que no deseas continuar con este curso después del período gratuito?')) {
                              showToast.info('Se notificará al administrador de tu decisión', darkMode);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <XCircle size={16} strokeWidth={2.5} />
                          No Continuaré
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cuotas expandidas inline */}
                {cursoExpandido === curso.id_matricula && (
                  <div style={{
                    marginTop: '0.75em',
                    padding: '0.875em 1em',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                    borderRadius: '0.75em',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75em',
                      color: darkMode ? '#fff' : '#1f2937',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em'
                    }}>
                      <FileText size={18} strokeWidth={2.5} color={darkMode ? '#fbbf24' : '#f59e0b'} />
                      Cuotas de {curso.curso_nombre}
                    </h4>

                    {loadingCuotas[curso.id_matricula] ? (
                      <div style={{ 
                        textAlign: 'center', 
                        padding: '1.5em',
                        color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280'
                      }}>
                        Cargando cuotas...
                      </div>
                    ) : cuotasPorCurso[curso.id_matricula]?.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '1.5em',
                        color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280'
                      }}>
                        <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '0.5em' }} />
                        <div>No hay cuotas registradas</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                        {cuotasPorCurso[curso.id_matricula]?.map((cuota) => (
                          <div
                            key={cuota.id_pago}
                            style={{
                              backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : '#ffffff',
                              border: darkMode ? '0.0625rem solid rgba(255,255,255,0.15)' : '0.0625rem solid #e5e7eb',
                              borderRadius: '0.5em',
                              padding: '0.75em',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '0.5em'
                            }}
                          >
                            <div style={{ flex: 1, minWidth: '180px' }}>
                              <div style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: '700',
                                color: darkMode ? '#fff' : '#1f2937',
                                marginBottom: '0.25em'
                              }}>
                                Cuota #{cuota.numero_cuota}
                                {cuota.modalidad_pago === 'clases' && (
                                  <span style={{ 
                                    fontSize: '0.75rem', 
                                    color: darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280',
                                    fontWeight: '400'
                                  }}>
                                    {' '}• Clase {cuota.numero_cuota} de {cuota.numero_clases}
                                  </span>
                                )}
                              </div>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280'
                              }}>
                                Vence: {formatearFecha(cuota.fecha_vencimiento)}
                              </div>
                            </div>

                            <div style={{ 
                              fontSize: '0.9rem', 
                              fontWeight: '800',
                              color: darkMode ? '#fff' : '#1f2937'
                            }}>
                              {formatearMonto(cuota.monto)}
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5em'
                            }}>
                              <span
                                style={{
                                  padding: '0.25em 0.625em',
                                  borderRadius: '0.375em',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  backgroundColor: getEstadoColor(cuota.estado) + '20',
                                  color: getEstadoColor(cuota.estado)
                                }}
                              >
                                {getEstadoTexto(cuota.estado)}
                              </span>

                              {cuota.estado === 'pendiente' && (
                                <button
                                  onClick={() => handlePagarCuota(cuota)}
                                  style={{
                                    padding: '0.5em 0.875em',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5em',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375em',
                                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(16, 185, 129, 0.3)';
                                  }}
                                >
                                  <CreditCard size={14} strokeWidth={2.5} color="#fff" />
                                  Pagar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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
            // Recargar cuotas del curso expandido si existe
            if (cursoExpandido) {
              loadCuotasMatricula(cursoExpandido);
            }
          }}
        />
      )}
    </div>
  );
};

export default PagosMenuales;
