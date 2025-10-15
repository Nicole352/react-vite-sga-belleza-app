import { X, UserCircle, Clock, Activity, Shield, BookOpen } from 'lucide-react';

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
  activa: boolean;
}

interface Accion {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  ip_address: string;
  fecha_operacion: string;
}

interface ModalDetalleProps {
  show: boolean;
  usuario: Usuario | null;
  tabActiva: 'info' | 'sesiones' | 'acciones';
  sesiones: Sesion[];
  acciones: Accion[];
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
  loadingModal,
  onClose,
  onChangeTab,
  formatFecha,
  getRolColor,
  getEstadoColor,
  getOperacionColor
}: ModalDetalleProps) => {
  if (!show || !usuario) return null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '40px 16px',
        overflowY: 'auto'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'modalFadeIn 0.2s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                marginBottom: '4px'
              }}>
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p style={{
                fontSize: '0.9rem',
                color: '#64748b',
                margin: 0
              }}>
                {usuario.username || usuario.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '20px', height: '20px', color: '#64748b' }} />
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
                sesiones.map((sesion) => (
                  <div key={sesion.id_sesion} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: sesion.activa ? '#10b981' : '#94a3b8'
                          }}></div>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>
                            {sesion.activa ? 'Sesión Activa' : 'Sesión Finalizada'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><strong>IP:</strong> {sesion.ip_address}</div>
                          <div><strong>Inicio:</strong> {formatFecha(sesion.fecha_inicio)}</div>
                          <div><strong>Expira:</strong> {formatFecha(sesion.fecha_expiracion)}</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '8px', color: '#94a3b8' }}>{sesion.user_agent}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tabActiva === 'acciones' && (
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
              ) : acciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Activity style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#cbd5e1' }} />
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No hay acciones registradas para este usuario</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Las acciones aparecerán cuando el usuario realice cambios en el sistema</p>
                </div>
              ) : (
                acciones.map((accion) => (
                  <div key={accion.id_auditoria} style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getOperacionColor(accion.operacion)}`}>
                            {accion.operacion}
                          </span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{accion.tabla_afectada}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div><strong>Registro ID:</strong> {accion.id_registro}</div>
                          <div><strong>IP:</strong> {accion.ip_address}</div>
                          <div><strong>Fecha:</strong> {formatFecha(accion.fecha_operacion)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">
          {accion.tipo === 'activar' ? 'Activar Usuario' : 'Desactivar Usuario'}
        </h3>
        <p className="mb-6 opacity-70">
          ¿Estás seguro de {accion.tipo} a <strong>{accion.usuario.nombre} {accion.usuario.apellido}</strong>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              accion.tipo === 'activar'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/10">
        <h3 className="text-xl font-bold mb-4">🔐 Contraseña Reseteada</h3>
        <p className="mb-4 opacity-70">Las nuevas credenciales son:</p>
        <div className="space-y-3 mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div>
            <div className="text-sm opacity-70 mb-1">Usuario</div>
            <div className="font-mono font-bold text-blue-400">{credenciales.username}</div>
          </div>
          <div>
            <div className="text-sm opacity-70 mb-1">Contraseña Temporal</div>
            <div className="font-mono font-bold text-blue-400">{credenciales.password_temporal}</div>
          </div>
        </div>
        <p className="text-sm opacity-70 mb-4">
          ⚠️ El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
