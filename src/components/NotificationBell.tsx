import React, { useState } from 'react';
import { Bell, X, CheckCircle, FileText, DollarSign, BookOpen } from 'lucide-react';

interface Notificacion {
  id: string;
  tipo: 'modulo' | 'tarea' | 'pago' | 'calificacion' | 'matricula' | 'general';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  link?: string;
  data?: any;
}

interface NotificationBellProps {
  notificaciones: Notificacion[];
  onLimpiar: () => void;
  darkMode?: boolean;
  bellColor?: string;
  iconColor?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notificaciones, 
  onLimpiar, 
  darkMode = false,
  bellColor = 'linear-gradient(135deg, #f59e0b, #d97706)',
  iconColor = '#ffffff'
}) => {
  const [mostrarPanel, setMostrarPanel] = useState(false);

  const noLeidas = notificaciones.filter(n => !n.leida).length;

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'modulo': return <BookOpen size={18} color="#f59e0b" />;
      case 'tarea': return <FileText size={18} color="#3b82f6" />;
      case 'pago': return <DollarSign size={18} color="#10b981" />;
      case 'calificacion': return <CheckCircle size={18} color="#8b5cf6" />;
      default: return <Bell size={18} color="#f59e0b" />;
    }
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos}m`;
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${dias}d`;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Botón de campana */}
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        style={{
          position: 'relative',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          border: 'none',
          background: bellColor,
          color: iconColor,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: noLeidas > 0 ? '0 0 20px rgba(251, 191, 36, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = noLeidas > 0 ? '0 0 20px rgba(251, 191, 36, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        <Bell size={20} color={iconColor} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.7rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            animation: noLeidas > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div
            onClick={() => setMostrarPanel(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998
            }}
          />
          
          {/* Panel */}
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: '90vw',
            maxHeight: '500px',
            background: darkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            border: darkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 20px 60px -12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: darkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: darkMode ? 'rgba(251, 191, 36, 0.05)' : 'rgba(251, 191, 36, 0.03)'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: darkMode ? '#fff' : '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Bell size={18} color="#f59e0b" />
                  Notificaciones
                </h3>
                {noLeidas > 0 && (
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#f59e0b',
                    marginTop: '0.25rem',
                    fontWeight: '600'
                  }}>
                    {noLeidas} {noLeidas === 1 ? 'nueva' : 'nuevas'}
                  </p>
                )}
              </div>
              {notificaciones.length > 0 && (
                <button
                  onClick={() => {
                    onLimpiar();
                    setMostrarPanel(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Lista de notificaciones */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {notificaciones.length === 0 ? (
                <div style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
                }}>
                  <Bell size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
                    No tienes notificaciones
                  </p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem' }}>
                    Te avisaremos cuando haya algo nuevo
                  </p>
                </div>
              ) : (
                notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.link) {
                        window.location.href = notif.link;
                        setMostrarPanel(false);
                      }
                    }}
                    style={{
                      padding: '0.875rem',
                      margin: '0.5rem',
                      borderRadius: '0.75rem',
                      background: !notif.leida
                        ? (darkMode ? 'rgba(251, 191, 36, 0.08)' : 'rgba(251, 191, 36, 0.05)')
                        : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      border: !notif.leida
                        ? (darkMode ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(251, 191, 36, 0.15)')
                        : (darkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'),
                      cursor: notif.link ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (notif.link) {
                        e.currentTarget.style.transform = 'translateX(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {!notif.leida && (
                      <div style={{
                        position: 'absolute',
                        top: '0.875rem',
                        right: '0.875rem',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#f59e0b',
                        boxShadow: '0 0 8px rgba(251, 191, 36, 0.5)'
                      }} />
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{
                        flexShrink: 0,
                        width: '36px',
                        height: '36px',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                      }}>
                        {getIcono(notif.tipo)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: darkMode ? '#fff' : '#1f2937',
                          marginBottom: '0.25rem'
                        }}>
                          {notif.titulo}
                        </h4>
                        <p style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                          lineHeight: '1.4',
                          wordBreak: 'break-word'
                        }}>
                          {notif.mensaje}
                        </p>
                        <span style={{
                          fontSize: '0.7rem',
                          color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                          marginTop: '0.375rem',
                          display: 'block'
                        }}>
                          {formatearFecha(notif.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Estilos de animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;
