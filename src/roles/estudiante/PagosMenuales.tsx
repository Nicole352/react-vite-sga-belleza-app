import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, XCircle, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import ModalPagoMensualidad from './ModalPagoMensualidad';
import EstudianteThemeWrapper from '../../components/EstudianteThemeWrapper';
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
      toast.success(`¡Tu pago de la cuota #${data.numero_cuota} ha sido verificado!`);
      loadData();
      // Recargar cuotas si el curso está expandido
      if (cursoExpandido) {
        loadCuotasMatricula(cursoExpandido);
      }
    },
    'pago_verificado': (data: any) => {
      console.log('✅ Pago verificado (broadcast):', data);
      toast.success('¡Tu pago ha sido verificado!');
      loadData();
      // Recargar cuotas si el curso está expandido
      if (cursoExpandido) {
        loadCuotasMatricula(cursoExpandido);
      }
    },
    'pago_rechazado': (data: any) => {
      console.log('❌ Pago rechazado:', data);
      toast.error(`Pago rechazado: ${data.observaciones}`);
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
      toast.error('Error cargando cuotas');
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
        backgroundColor: darkMode ? '#1a1a1a' : '#f9fafb',
        color: darkMode ? '#fff' : '#1f2937',
        padding: '1rem',
        paddingBottom: '2rem',
        paddingTop: '3rem'
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: darkMode ? '#fff' : '#1f2937' }}>
                        {curso.curso_nombre}
                      </h3>
                      {curso.es_curso_promocional && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25em',
                          padding: '0.25em 0.5em',
                          backgroundColor: '#10b981',
                          color: 'white',
                          borderRadius: '0.375em',
                          fontSize: '0.7rem',
                          fontWeight: '700'
                        }}>
                          🎁 CURSO PROMOCIONAL
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginTop: '0.25em' }}>
                      {curso.tipo_curso_nombre} • {curso.codigo_matricula}
                    </div>
                    {curso.es_curso_promocional && curso.nombre_promocion && (
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#10b981',
                        fontWeight: '600',
                        marginTop: '0.25em'
                      }}>
                        ✨ {curso.nombre_promocion} - {curso.meses_gratis} {curso.meses_gratis === 1 ? 'mes' : 'meses'} GRATIS
                        {curso.fecha_inicio_cobro && (
                          <span style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', fontWeight: '400' }}>
                            {' '}• Inicio de cobros: {new Date(curso.fecha_inicio_cobro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
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
                      gap: '0.375em',
                      padding: '0.375em 0.625em',
                      backgroundColor: cursoExpandido === curso.id_matricula ? '#ef4444' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5em',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {cursoExpandido === curso.id_matricula ? (
                      <>
                        <XCircle size={14} />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye size={14} />
                        Ver Cuotas
                      </>
                    )}
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

                  {!curso.es_curso_promocional && curso.proxima_fecha_vencimiento && (
                    <div>
                      <div style={{ fontSize: '0.72rem', color: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280', marginBottom: '0.125em' }}>Próximo Vencimiento</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: darkMode ? '#fff' : '#1f2937' }}>
                        {formatearFecha(curso.proxima_fecha_vencimiento)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Información y opciones para curso promocional */}
                {curso.es_curso_promocional && (
                  <div style={{
                    marginTop: '0.75em',
                    padding: '0.75em',
                    backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
                    border: `0.125rem solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : '#10b981'}`,
                    borderRadius: '0.5em'
                  }}>
                    <div style={{ fontSize: '0.85rem', color: darkMode ? '#d1fae5' : '#065f46', marginBottom: '0.5em' }}>
                      <strong>🎁 Beneficio Promocional:</strong>
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
                            padding: '0.5em 1em',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5em',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          onClick={() => toast.success('¡Excelente! Continuarás con el curso después del período gratuito')}
                        >
                          ✅ Quiero Continuar
                        </button>
                        <button
                          style={{
                            flex: 1,
                            minWidth: '150px',
                            padding: '0.5em 1em',
                            backgroundColor: darkMode ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                            color: darkMode ? '#fca5a5' : '#dc2626',
                            border: `0.0625rem solid ${darkMode ? 'rgba(239, 68, 68, 0.4)' : '#fca5a5'}`,
                            borderRadius: '0.5em',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            if (confirm('¿Estás seguro de que no deseas continuar con este curso después del período gratuito?')) {
                              toast('Se notificará al administrador de tu decisión', { icon: 'ℹ️' });
                            }
                          }}
                        >
                          ❌ No Continuaré
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Cuotas expandidas inline */}
                {cursoExpandido === curso.id_matricula && (
                  <div style={{
                    marginTop: '1em',
                    padding: '1em',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
                    borderRadius: '0.5em',
                    border: darkMode ? '0.0625rem solid rgba(255,255,255,0.1)' : '0.0625rem solid #e5e7eb'
                  }}>
                    <h4 style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      marginBottom: '0.75em',
                      color: darkMode ? '#fff' : '#1f2937'
                    }}>
                      📋 Cuotas de {curso.curso_nombre}
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
                                    padding: '0.375em 0.75em',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375em',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  💳 Pagar
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
