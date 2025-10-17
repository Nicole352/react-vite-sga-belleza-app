import React from 'react';
import { X, UserCircle, Clock, Activity, Shield, BookOpen, Monitor, Globe, Calendar, CheckCircle, XCircle, Edit, Trash2, Plus, DollarSign, FileText, CreditCard, Building2 } from 'lucide-react';

interface Usuario {
  id_usuario: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string | null;
  username: string | null;
  telefono: string | null;
  estado: 'activo' | 'inactivo' | 'pendiente';
  fecha_ultima_conexion: string | null;
  fecha_registro: string;
  nombre_rol: string;
  // Trazabilidad
  creado_por?: string;
  fecha_creacion?: string;
  modificado_por?: string;
  fecha_modificacion?: string;
  // Información académica (estudiantes)
  cursos_matriculados?: number;
  pagos_pendientes?: number;
  pagos_completados?: number;
  // Información académica (docentes)
  cursos_asignados?: number;
  estudiantes_activos?: number;
  // Actividad del sistema
  matriculas_aprobadas?: number;
  pagos_verificados?: number;
  total_acciones?: number;
}

interface Sesion {
  id_sesion: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  fecha_cierre?: string;
  activa: boolean;
}

interface Accion {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  descripcion?: string;
  detalles?: string;
  ip_address: string;
  fecha_operacion: string;
}

interface Pago {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  numero_comprobante: string;
  banco_comprobante?: string;
  recibido_por?: string;
  estado: string;
  observaciones?: string;
  curso_nombre: string;
  curso_codigo: string;
}

interface Deber {
  id_entrega: number;
  fecha_entrega: string;
  calificacion?: number;
  comentario_docente?: string;
  estado: string;
  archivo_nombre: string;
  archivo_size_kb: number;
  deber_titulo: string;
  deber_descripcion?: string;
  deber_fecha_limite: string;
  curso_nombre: string;
  curso_codigo: string;
  docente_nombre?: string;
}

interface ModalDetalleProps {
  show: boolean;
  usuario: Usuario | null;
  tabActiva: 'info' | 'sesiones' | 'acciones';
  sesiones: Sesion[];
  acciones: Accion[];
  pagos: Pago[];
  deberes: Deber[];
  loadingModal: boolean;
  onClose: () => void;
  onChangeTab: (tab: 'info' | 'sesiones' | 'acciones') => void;
  formatFecha: (fecha: string | null) => string;
  getRolColor: (rol: string) => string;
  getEstadoColor: (estado: string) => string;
  getOperacionColor: (operacion: string) => string;
}

export const ModalDetalle = ({
  show,
  usuario,
  tabActiva,
  sesiones,
  acciones,
  pagos,
  deberes,
  loadingModal,
  onClose,
  onChangeTab,
  formatFecha,
  getRolColor,
  getEstadoColor,
  getOperacionColor
}: ModalDetalleProps) => {
  if (!show || !usuario) return null;

  // Verificar si el usuario es estudiante
  const esEstudiante = usuario.nombre_rol?.toLowerCase() === 'estudiante';

  // Debug: Log para verificar datos
  console.log('🔍 Modal - Datos recibidos:', {
    esEstudiante,
    pagosLength: pagos?.length || 0,
    deberesLength: deberes?.length || 0,
    tabActiva
  });

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCircle style={{ width: '28px', height: '28px', color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                marginBottom: '4px',
                letterSpacing: '-0.02em'
              }}>
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                margin: 0
              }}>
                {usuario.username || usuario.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#fff',
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
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', backgroundColor: 'white' }}>
          <button
            onClick={() => onChangeTab('info')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'info' ? '#ef4444' : '#64748b',
              borderBottom: tabActiva === 'info' ? '3px solid #ef4444' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'info') e.currentTarget.style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'info') e.currentTarget.style.color = '#64748b';
            }}
          >
            <UserCircle style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Información General
          </button>
          <button
            onClick={() => onChangeTab('sesiones')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'sesiones' ? '#ef4444' : '#64748b',
              borderBottom: tabActiva === 'sesiones' ? '3px solid #ef4444' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'sesiones') e.currentTarget.style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'sesiones') e.currentTarget.style.color = '#64748b';
            }}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Últimas Sesiones
          </button>
          <button
            onClick={() => onChangeTab('acciones')}
            style={{
              flex: 1,
              padding: '16px 24px',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'acciones' ? '#ef4444' : '#64748b',
              borderBottom: tabActiva === 'acciones' ? '3px solid #ef4444' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'acciones') e.currentTarget.style.color = '#1e293b';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'acciones') e.currentTarget.style.color = '#64748b';
            }}
          >
            <Activity style={{ width: '16px', height: '16px', display: 'inline', marginRight: '8px' }} />
            Últimas Acciones
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '32px', overflowY: 'auto', maxHeight: 'calc(90vh - 250px)', backgroundColor: 'white' }}>
          {tabActiva === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Información Básica */}
              <div style={{ 
                backgroundColor: '#f8fafc', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  color: '#1e293b', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <UserCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                  Información Básica
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>CÉDULA</div>
                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{usuario.cedula}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>ROL</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                      {usuario.nombre_rol}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>EMAIL</div>
                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{usuario.email || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>TELÉFONO</div>
                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{usuario.telefono || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>ESTADO</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>ÚLTIMA CONEXIÓN</div>
                    <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
                  </div>
                </div>
              </div>

              {/* Trazabilidad del Sistema */}
              <div style={{ 
                backgroundColor: '#fef3c7', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid #fde047'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: '700', 
                  color: '#92400e', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Shield style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                  Trazabilidad del Sistema
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>CREADO POR</div>
                    <div style={{ fontSize: '0.95rem', color: '#78350f', fontWeight: '500' }}>
                      {usuario.creado_por || 'Sistema'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>FECHA DE CREACIÓN</div>
                    <div style={{ fontSize: '0.95rem', color: '#78350f', fontWeight: '500' }}>
                      {formatFecha(usuario.fecha_creacion || usuario.fecha_registro)}
                    </div>
                  </div>
                  {usuario.modificado_por && (
                    <>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>MODIFICADO POR</div>
                        <div style={{ fontSize: '0.95rem', color: '#78350f', fontWeight: '500' }}>
                          {usuario.modificado_por}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '4px', fontWeight: '600' }}>ÚLTIMA MODIFICACIÓN</div>
                        <div style={{ fontSize: '0.95rem', color: '#78350f', fontWeight: '500' }}>
                          {formatFecha(usuario.fecha_modificacion || null)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Información Académica - ESTUDIANTES */}
              {usuario.nombre_rol?.toLowerCase() === 'estudiante' && (
                <div style={{ 
                  backgroundColor: '#dbeafe', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #93c5fd'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#1e40af', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <BookOpen style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '4px', fontWeight: '600' }}>CURSOS MATRICULADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#1e3a8a', fontWeight: '700' }}>
                        {usuario.cursos_matriculados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '4px', fontWeight: '600' }}>PAGOS COMPLETADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#059669', fontWeight: '700' }}>
                        {usuario.pagos_completados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '4px', fontWeight: '600' }}>PAGOS PENDIENTES</div>
                      <div style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: '700' }}>
                        {usuario.pagos_pendientes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información Académica - DOCENTES */}
              {usuario.nombre_rol?.toLowerCase() === 'docente' && (
                <div style={{ 
                  backgroundColor: '#dcfce7', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #86efac'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#166534', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <BookOpen style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>CURSOS ASIGNADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#15803d', fontWeight: '700' }}>
                        {usuario.cursos_asignados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>ESTUDIANTES ACTIVOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#15803d', fontWeight: '700' }}>
                        {usuario.estudiantes_activos || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actividad del Sistema - ADMIN */}
              {usuario.nombre_rol?.toLowerCase() === 'administrativo' && (
                <div style={{ 
                  backgroundColor: '#fee2e2', 
                  padding: '20px', 
                  borderRadius: '12px',
                  border: '1px solid #fca5a5'
                }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#991b1b', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Activity style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    Actividad del Sistema
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>MATRÍCULAS APROBADAS</div>
                      <div style={{ fontSize: '1.5rem', color: '#7f1d1d', fontWeight: '700' }}>
                        {usuario.matriculas_aprobadas || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>PAGOS VERIFICADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#7f1d1d', fontWeight: '700' }}>
                        {usuario.pagos_verificados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>TOTAL ACCIONES</div>
                      <div style={{ fontSize: '1.5rem', color: '#7f1d1d', fontWeight: '700' }}>
                        {usuario.total_acciones || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tabActiva === 'sesiones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loadingModal ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '4px solid #fee2e2',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : sesiones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Clock style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#cbd5e1' }} />
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No hay sesiones registradas para este usuario</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Las sesiones aparecerán cuando el usuario inicie sesión</p>
                </div>
              ) : (
                sesiones.map((sesion) => {
                  // Detectar dispositivo y navegador del user agent
                  const userAgent = sesion.user_agent || '';
                  const esMovil = /Mobile|Android|iPhone|iPad/i.test(userAgent);
                  const navegador = userAgent.includes('Chrome') ? 'Chrome' :
                                   userAgent.includes('Firefox') ? 'Firefox' :
                                   userAgent.includes('Safari') ? 'Safari' :
                                   userAgent.includes('Edge') ? 'Edge' : 'Otro';
                  
                  return (
                    <div key={sesion.id_sesion} style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: sesion.activa ? '2px solid #10b981' : '1px solid #e2e8f0',
                      backgroundColor: sesion.activa ? '#f0fdf4' : '#f8fafc',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: sesion.activa ? '#10b981' : '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {sesion.activa ? <CheckCircle size={20} color="#fff" /> : <XCircle size={20} color="#fff" />}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                              {sesion.activa ? 'Sesión Activa' : 'Sesión Finalizada'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {esMovil ? <Monitor size={14} /> : <Globe size={14} />}
                              <span>{esMovil ? 'Móvil' : 'Escritorio'} • {navegador}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: sesion.activa ? '#dcfce7' : '#f1f5f9',
                          color: sesion.activa ? '#166534' : '#64748b'
                        }}>
                          ID: {sesion.id_sesion.substring(0, 8)}...
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <Calendar size={16} color="#ef4444" />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Inicio de Sesión</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatFecha(sesion.fecha_inicio)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <Clock size={16} color={sesion.activa ? '#10b981' : '#ef4444'} />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                              {sesion.activa ? 'Expira' : 'Cerró Sesión'}
                            </div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {sesion.activa ? formatFecha(sesion.fecha_expiracion) : formatFecha(sesion.fecha_cierre || sesion.fecha_expiracion)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>User Agent:</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>{sesion.user_agent}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tabActiva === 'acciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loadingModal ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '4px solid #fee2e2',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                <>
                  {/* Sección de Pagos - Solo para estudiantes */}
                  {esEstudiante && pagos && pagos.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <DollarSign size={20} color='#10b981' />
                        Pagos Realizados ({pagos.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pagos.map((pago) => (
                          <div key={pago.id_pago} style={{
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #10b98140',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  backgroundColor: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <DollarSign size={20} color="#fff" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                                    Pago Cuota #{pago.numero_cuota} - ${parseFloat(pago.monto).toFixed(2)}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                    {pago.curso_nombre} ({pago.curso_codigo})
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: pago.estado === 'verificado' ? '#dcfce7' : '#fef3c7',
                                color: pago.estado === 'verificado' ? '#10b981' : '#f59e0b'
                              }}>
                                {pago.estado === 'verificado' ? 'Verificado' : 'Pagado'}
                              </span>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                <Calendar size={16} color="#10b981" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fecha de Pago</div>
                                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatFecha(pago.fecha_pago)}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                {pago.metodo_pago === 'transferencia' ? <Building2 size={16} color="#3b82f6" /> : <CreditCard size={16} color="#f59e0b" />}
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Método de Pago</div>
                                  <div style={{ fontWeight: '600', color: '#1e293b', textTransform: 'capitalize' }}>{pago.metodo_pago}</div>
                                </div>
                              </div>
                              {pago.numero_comprobante && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                  <FileText size={16} color="#64748b" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>N° Comprobante</div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{pago.numero_comprobante}</div>
                                  </div>
                                </div>
                              )}
                              {pago.recibido_por && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                  <UserCircle size={16} color="#f59e0b" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Recibido por</div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{pago.recibido_por}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Deberes - Solo para estudiantes */}
                  {esEstudiante && deberes && deberes.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={20} color="#3b82f6" />
                        Deberes Entregados ({deberes.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {deberes.map((deber) => (
                          <div key={deber.id_entrega} style={{
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #3b82f640',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  backgroundColor: '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <BookOpen size={20} color="#fff" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                                    {deber.deber_titulo}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                                    {deber.curso_nombre} ({deber.curso_codigo})
                                  </div>
                                </div>
                              </div>
                              {deber.calificacion !== null && deber.calificacion !== undefined && (
                                <span style={{
                                  padding: '4px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: deber.calificacion >= 7 ? '#dcfce7' : '#fee2e2',
                                  color: deber.calificacion >= 7 ? '#10b981' : '#ef4444'
                                }}>
                                  {deber.calificacion}/10
                                </span>
                              )}
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                <Calendar size={16} color="#3b82f6" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fecha de Entrega</div>
                                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatFecha(deber.fecha_entrega)}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                <FileText size={16} color="#64748b" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Archivo</div>
                                  <div style={{ fontWeight: '600', color: '#1e293b' }}>{deber.archivo_nombre}</div>
                                </div>
                              </div>
                              {deber.docente_nombre && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', gridColumn: '1 / -1' }}>
                                  <UserCircle size={16} color="#64748b" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Docente</div>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{deber.docente_nombre}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {deber.comentario_docente && (
                              <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: '#fff', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>Comentario del Docente:</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{deber.comentario_docente}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sección de Acciones de Auditoría */}
                  {acciones.length === 0 && (!esEstudiante || (pagos.length === 0 && deberes.length === 0)) ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <Activity style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#cbd5e1' }} />
                      <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No hay acciones registradas para este usuario</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Las acciones aparecerán cuando el usuario realice cambios en el sistema</p>
                    </div>
                  ) : acciones.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={20} color="#ef4444" />
                        Acciones del Sistema ({acciones.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {acciones.map((accion) => {
                  // Determinar icono y color según operación
                  const operacionConfig = {
                    'INSERT': { icono: Plus, color: '#10b981', bg: '#dcfce7', label: 'Creación' },
                    'UPDATE': { icono: Edit, color: '#f59e0b', bg: '#fef3c7', label: 'Actualización' },
                    'DELETE': { icono: Trash2, color: '#ef4444', bg: '#fee2e2', label: 'Eliminación' }
                  }[accion.operacion] || { icono: Activity, color: '#64748b', bg: '#f1f5f9', label: accion.operacion };

                  return (
                    <div key={accion.id_auditoria} style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `1px solid ${operacionConfig.color}40`,
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: operacionConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {React.createElement(operacionConfig.icono, { size: 20, color: '#fff' })}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                              {accion.descripcion || operacionConfig.label}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                              {accion.detalles || `Tabla: ${accion.tabla_afectada}`}
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: operacionConfig.bg,
                          color: operacionConfig.color
                        }}>
                          {operacionConfig.label}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                          <Calendar size={16} color="#ef4444" />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Fecha de Operación</div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{formatFecha(accion.fecha_operacion)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModalConfirmacionProps {
  show: boolean;
  accion: {tipo: 'activar' | 'desactivar', usuario: Usuario} | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModalConfirmacion = ({ show, accion, onConfirm, onCancel }: ModalConfirmacionProps) => {
  if (!show || !accion) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        padding: '18px 28px 22px 28px',
        color: '#fff',
        margin: '0 auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          {accion.tipo === 'activar' ? 'Activar Usuario' : 'Desactivar Usuario'}
        </h3>
        <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          ¿Estás seguro de {accion.tipo} a <strong style={{ color: '#fff' }}>{accion.usuario.nombre} {accion.usuario.apellido}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: accion.tipo === 'activar' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            {accion.tipo === 'activar' ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ModalCredencialesProps {
  show: boolean;
  credenciales: {username: string, password_temporal: string} | null;
  onClose: () => void;
}

export const ModalCredenciales = ({ show, credenciales, onClose }: ModalCredencialesProps) => {
  if (!show || !credenciales) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '500px',
        padding: '18px 28px 22px 28px',
        color: '#fff',
        margin: '0 auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          🔐 Contraseña Reseteada
        </h3>
        <p style={{ marginBottom: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          Las nuevas credenciales son:
        </p>
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: '8px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Usuario</div>
            <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.username}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>Contraseña Temporal</div>
            <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.password_temporal}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
          ⚠️ El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
