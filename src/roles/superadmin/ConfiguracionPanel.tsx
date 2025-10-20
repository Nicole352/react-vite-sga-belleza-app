import React from 'react';
import { 
  Settings, UserCheck, Key, Save, Plus, Edit3, Lock, Server, Database, 
  Mail, Activity, CheckCircle
} from 'lucide-react';

const ConfiguracionPanel: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1em' }}>
        <h2 style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          fontSize: '1.625rem',
          fontWeight: '700'
        }}>
          <Settings size={26} color="#ef4444" />
          Configuración del Sistema
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: '0.85rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}>
          Configuraciones generales y perfil del Super Administrador
        </p>
      </div>

      {/* Grid de Configuraciones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(25rem, 100%), 1fr))', gap: '1em' }}>
        
        {/* Perfil del Super Administrador */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          borderRadius: '0.875em',
          padding: '1.5em',
          boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginBottom: '1.5em' }}>
            <div style={{
              width: '2.5em',
              height: '2.5em',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '0.0625rem solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.625em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCheck size={20} color="#3b82f6" />
            </div>
            <h2 style={{ 
              color: 'rgba(255,255,255,0.95)', 
              fontSize: '1.125rem', 
              fontWeight: '700', 
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              Perfil del Administrador
            </h2>
          </div>

          {/* Foto de Perfil */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700' }}>SA</span>
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}>
                <Edit3 size={16} color="#fff" />
              </div>
            </div>
            <button style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '0.0625rem solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5em',
              color: '#3b82f6',
              padding: '0.5em 1em',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375em',
              margin: '0 auto',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            }}>
              <Plus size={14} />
              Cambiar Foto
            </button>
          </div>

          {/* Información del Perfil */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
            <div>
              <label style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                marginBottom: '0.375em', 
                display: 'block',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                Nombre Completo
              </label>
              <input
                type="text"
                defaultValue="Super Administrador"
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              />
            </div>
            
            <div>
              <label style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                marginBottom: '0.375em', 
                display: 'block',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                Email
              </label>
              <input
                type="email"
                defaultValue="superadmin@instituto.edu"
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              />
            </div>

            <div>
              <label style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                marginBottom: '0.375em', 
                display: 'block',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue="+593 99 123 4567"
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                }}
              />
            </div>

            <button style={{
              padding: '0.75em 1.5em',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              borderRadius: '0.625em',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              boxShadow: '0 0.25rem 0.75em rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0.25rem 0.75em rgba(59, 130, 246, 0.3)';
            }}>
              <Save size={16} />
              Guardar Cambios
            </button>
          </div>
        </div>

        {/* Seguridad y Contraseña */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(1.25rem)',
          border: '0.0625rem solid rgba(255,255,255,0.1)',
          borderRadius: '0.875em',
          padding: '1.5em',
          boxShadow: '0 0.5em 1.5em rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em', marginBottom: '1.5em' }}>
            <div style={{
              width: '2.5em',
              height: '2.5em',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '0.0625rem solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.625em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Key size={20} color="#ef4444" />
            </div>
            <h2 style={{ 
              color: 'rgba(255,255,255,0.95)', 
              fontSize: '1.125rem', 
              fontWeight: '700', 
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
            }}>
              Seguridad
            </h2>
          </div>

          {/* Cambiar Contraseña */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1em', marginBottom: '1.5em' }}>
            <div>
              <label style={{ 
                color: 'rgba(255,255,255,0.8)', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                marginBottom: '0.375em', 
                display: 'block',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
              }}>
                Contraseña Actual
              </label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña actual"
                style={{
                  width: '100%',
                  padding: '0.625em 0.75em',
                  background: 'rgba(255,255,255,0.1)',
                  border: '0.0625rem solid rgba(255,255,255,0.2)',
                  borderRadius: '0.625em',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  transition: 'all 0.2s'
                }}
              />
            </div>
            
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                placeholder="Repite la nueva contraseña"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>

            <button style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s'
            }}>
              <Lock size={16} />
              Cambiar Contraseña
            </button>
          </div>

          {/* Configuración de Seguridad */}
          <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
              Configuración de Seguridad
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    Autenticación de dos factores
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    Añade una capa extra de seguridad
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '24px',
                  background: '#10b981',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    transition: 'all 0.2s'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                    Notificaciones de inicio de sesión
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                    Recibe alertas de nuevos accesos
                  </div>
                </div>
                <div style={{
                  width: '48px',
                  height: '24px',
                  background: '#10b981',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: '#fff',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    transition: 'all 0.2s'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuraciones del Sistema */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
          }}>
            <Server size={24} color="#fff" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
            Configuraciones del Sistema
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Configuración de Backup */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Database size={20} color="#10b981" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Backup Automático
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Configura la frecuencia de respaldos automáticos
            </p>
            <select style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              marginBottom: '16px'
            }}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem' }}>
              <CheckCircle size={16} />
              Último backup: Hoy 22:00
            </div>
          </div>

          {/* Configuración de Notificaciones */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Mail size={20} color="#3b82f6" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Notificaciones
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Gestiona las notificaciones del sistema
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                Errores críticos
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                Nuevos registros
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                <input type="checkbox" style={{ accentColor: '#3b82f6' }} />
                Actualizaciones del sistema
              </label>
            </div>
          </div>

          {/* Configuración de Mantenimiento */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Activity size={20} color="#f59e0b" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                Mantenimiento
              </h3>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Herramientas de mantenimiento del sistema
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button style={{
                padding: '8px 16px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                color: '#f59e0b',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
                Limpiar caché
              </button>
              <button style={{
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '6px',
                color: '#10b981',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
                Optimizar BD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionPanel;
