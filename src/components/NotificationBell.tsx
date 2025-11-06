import React, { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { useBreakpoints } from "../hooks/useMediaQuery";

interface Notificacion {
  id: string;
  tipo: "modulo" | "tarea" | "pago" | "calificacion" | "matricula" | "general";
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  link?: string;
}

interface NotificationBellProps {
  notificaciones: Notificacion[];
  onMarcarTodasLeidas: () => void;
  darkMode?: boolean;
  bellColor?: string; // Color del gradiente para el botón de campana
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  notificaciones, 
  onMarcarTodasLeidas, 
  darkMode = false,
  bellColor = "linear-gradient(135deg, #ef4444, #dc2626)" // Rojo por defecto (admin)
}) => {
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const { isMobile, isTablet } = useBreakpoints();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Cerrar el panel al hacer clic fuera (solo en PC/Tablet)
  useEffect(() => {
    if (!mostrarPanel || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMostrarPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mostrarPanel, isMobile]);
  
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const notificacionesRecientes = notificaciones.slice(0, 10);

  // Determinar ancho del panel según dispositivo
  const getModalWidth = () => {
    if (isMobile) return "calc(100vw - 3rem)"; // Móvil: un poco más de margen
    if (isTablet) return "340px"; // Tablet: más compacto
    return "400px"; // PC: más compacto (reducido de 450px)
  };

  // Determinar posición del panel
  const getModalPosition = () => {
    if (isMobile) {
      return {
        position: "fixed" as const,
        top: "4rem", // Desde arriba, debajo del navbar
        left: "50%",
        transform: "translateX(-50%)",
        right: "auto"
      };
    }
    // En PC/Tablet: posición absoluta debajo de la campana
    return {
      position: "absolute" as const,
      top: "calc(100% + 0.75rem)",
      right: "0", // Alineado a la derecha de la campana
      left: "auto",
      transform: "translateX(calc(100% - 100%))"
    };
  };

  const formatearFecha = (fecha: Date) => {
    const diff = Date.now() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return "Ahora";
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${Math.floor(horas / 24)}d`;
  };

  return (
    <div style={{ position: "relative", zIndex: 99999 }}>
      <button
        ref={buttonRef}
        onClick={() => setMostrarPanel(!mostrarPanel)}
        style={{
          position: "relative",
          width: isMobile ? "2.25rem" : "2.75rem",
          height: isMobile ? "2.25rem" : "2.75rem",
          borderRadius: "50%",
          border: "none",
          background: bellColor,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: noLeidas > 0 ? "0 0 1.25rem rgba(0, 0, 0, 0.3)" : "0 0.125rem 0.5rem rgba(0,0,0,0.15)",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 0.25rem 1.25rem rgba(0, 0, 0, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = noLeidas > 0 ? "0 0 1.25rem rgba(0, 0, 0, 0.3)" : "0 0.125rem 0.5rem rgba(0,0,0,0.15)";
        }}
      >
        <Bell size={isMobile ? 18 : 22} color="#fff" />
        {noLeidas > 0 && (
          <span style={{
            position: "absolute",
            top: "-0.375rem",
            right: "-0.375rem",
            background: "#fbbf24",
            color: "#000",
            borderRadius: "50%",
            width: isMobile ? "1.25rem" : "1.375rem",
            height: isMobile ? "1.25rem" : "1.375rem",
            fontSize: isMobile ? "0.7rem" : "0.75rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "0.125rem solid #fff",
            boxShadow: "0 0.125rem 0.5rem rgba(0,0,0,0.2)",
            animation: "pulse 2s infinite"
          }}>
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {mostrarPanel && (
        <>
          {/* Overlay solo en móvil */}
          {isMobile && (
            <div 
              onClick={() => setMostrarPanel(false)} 
              style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 99998, 
                background: "rgba(0,0,0,0.5)" 
              }} 
            />
          )}
          
          {/* Rabito/Flecha superior (solo en PC/Tablet) */}
          {!isMobile && (
            <>
              {/* Sombra del rabito para efecto 3D suave */}
              <div style={{
                position: "absolute",
                top: "calc(100% + 0.5rem)",
                right: "1.5rem", // Cerca del borde derecho
                width: 0,
                height: 0,
                borderLeft: "0.45rem solid transparent",
                borderRight: "0.45rem solid transparent",
                borderBottom: darkMode 
                  ? "0.45rem solid rgba(0,0,0,0.3)"
                  : "0.45rem solid rgba(0,0,0,0.08)",
                zIndex: 99998
              }} />
              {/* Rabito principal */}
              <div style={{
                position: "absolute",
                top: "calc(100% + 0.55rem)",
                right: "1.5rem", // Cerca del borde derecho
                width: 0,
                height: 0,
                borderLeft: "0.45rem solid transparent",
                borderRight: "0.45rem solid transparent",
                borderBottom: darkMode 
                  ? "0.45rem solid rgba(50, 50, 50, 0.98)"
                  : "0.45rem solid #ffffff",
                zIndex: 100000
              }} />
            </>
          )}
          
          <div 
            ref={panelRef}
            style={{
            ...getModalPosition(),
            width: getModalWidth(),
            maxWidth: isMobile ? "none" : "28rem",
            maxHeight: isMobile ? "85vh" : "calc(100vh - 7rem)",
            background: darkMode 
              ? "linear-gradient(135deg, rgba(38, 38, 38, 0.98) 0%, rgba(38, 38, 38, 0.95) 100%)" 
              : "#ffffff",
            border: darkMode 
              ? "1px solid rgba(255, 255, 255, 0.1)" 
              : "0.0625rem solid rgba(0,0,0,0.08)",
            borderRadius: isMobile ? "1.25rem" : "1rem",
            boxShadow: isMobile 
              ? "0 1.5625rem 4.375rem rgba(0,0,0,0.3)" 
              : darkMode 
                ? "0 1.25rem 3.75rem rgba(0,0,0,0.6), 0 0 0.0625rem rgba(255,255,255,0.1)"
                : "0 1.25rem 3.75rem rgba(0,0,0,0.2), 0 0 0.0625rem rgba(0,0,0,0.15)",
            zIndex: 99999,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            animation: isMobile ? "scaleIn 0.2s ease-out" : "slideDown 0.2s ease-out"
          }}>
            {/* Header responsive */}
            <div style={{ 
              padding: isMobile ? "1rem 1.25rem" : "1.25rem 1.5rem", 
              background: darkMode 
                ? "rgba(28, 28, 28, 0.6)" 
                : "#f8fafc",
              borderBottom: darkMode 
                ? "1px solid rgba(255, 255, 255, 0.1)" 
                : "0.0625rem solid #e2e8f0",
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: isMobile ? "wrap" : "nowrap",
              gap: isMobile ? "0.75rem" : "0"
            }}>
              <div style={{ flex: isMobile ? "1 1 100%" : "1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: isMobile ? "0.9rem" : "0.95rem", 
                    fontWeight: "600", 
                    color: darkMode ? "#f1f5f9" : "#1e293b", 
                    letterSpacing: "-0.01em" 
                  }}>
                    Notificaciones
                  </h3>
                  {noLeidas > 0 && (
                    <span 
                      onClick={() => {
                        onMarcarTodasLeidas();
                        setMostrarPanel(false);
                      }} 
                      style={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        fontWeight: "600",
                        background: bellColor,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        cursor: "pointer",
                        transition: "opacity 0.2s ease",
                        userSelect: "none"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.7";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      Marcar todas como leídas
                    </span>
                  )}
                </div>
                {noLeidas > 0 && (
                  <p style={{ 
                    margin: "0", 
                    fontSize: isMobile ? "0.7rem" : "0.75rem", 
                    color: darkMode ? "#94a3b8" : "#64748b" 
                  }}>
                    Tienes {noLeidas} {noLeidas === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
                  </p>
                )}
              </div>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "flex-end" : "flex-start"
              }}>
                {/* Botón de cerrar (X) */}
                <button
                  onClick={() => setMostrarPanel(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2rem",
                    height: "2rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    color: darkMode ? "#cbd5e1" : "#64748b",
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = darkMode 
                      ? "rgba(255, 255, 255, 0.1)" 
                      : "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ 
              overflowY: "auto", 
              flex: 1, 
              background: darkMode 
                ? "rgba(38, 38, 38, 0.4)" 
                : "#ffffff",
              WebkitOverflowScrolling: "touch" // Smooth scroll en móvil
            }}>
              {notificaciones.length === 0 ? (
                <div style={{ 
                  padding: isMobile ? "3rem 1.5rem" : "4rem 2rem", 
                  textAlign: "center", 
                  color: darkMode ? "#64748b" : "#94a3b8" 
                }}>
                  <Bell size={isMobile ? 48 : 56} style={{ margin: "0 auto", opacity: 0.3, strokeWidth: 1.5 }} />
                  <p style={{ 
                    marginTop: "1.25rem", 
                    fontSize: isMobile ? "0.9rem" : "0.95rem", 
                    fontWeight: "500" 
                  }}>
                    No hay notificaciones
                  </p>
                  <p style={{ 
                    marginTop: "0.5rem", 
                    fontSize: isMobile ? "0.75rem" : "0.8rem", 
                    opacity: 0.7 
                  }}>
                    Cuando recibas notificaciones aparecerán aquí
                  </p>
                </div>
              ) : (
                <>
                  {notificacionesRecientes.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: isMobile ? "1rem 1.25rem" : "1.25rem 1.5rem",
                        borderBottom: `0.0625rem solid ${darkMode ? "#334155" : "#f1f5f9"}`,
                        cursor: "default",
                        background: !notif.leida 
                          ? (darkMode ? "rgba(100, 100, 100, 0.1)" : "rgba(150, 150, 150, 0.05)") 
                          : "transparent",
                        transition: "all 0.15s ease",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", gap: isMobile ? "0.75rem" : "1rem", alignItems: "start" }}>
                        <div style={{ flex: 1, minWidth: 0 }}> {/* minWidth: 0 para permitir text-overflow */}
                          <div style={{ 
                            fontSize: isMobile ? "0.825rem" : "0.875rem",
                            fontWeight: notif.leida ? "500" : "600", 
                            color: darkMode ? "#f1f5f9" : "#1e293b", 
                            marginBottom: "0.375rem",
                            lineHeight: "1.4",
                            wordBreak: "break-word"
                          }}>
                            {notif.titulo}
                          </div>
                          <div style={{ 
                            fontSize: isMobile ? "0.75rem" : "0.8rem", 
                            color: darkMode ? "#cbd5e1" : "#64748b",
                            lineHeight: "1.5",
                            marginBottom: "0.5rem",
                            wordBreak: "break-word"
                          }}>
                            {notif.mensaje}
                          </div>
                          <div style={{ 
                            fontSize: isMobile ? "0.675rem" : "0.7rem", 
                            color: darkMode ? "#64748b" : "#94a3b8",
                            fontWeight: "500"
                          }}>
                            {formatearFecha(notif.fecha)}
                          </div>
                        </div>
                        {!notif.leida && (
                          <span style={{ 
                            width: isMobile ? "0.5rem" : "0.625rem", 
                            height: isMobile ? "0.5rem" : "0.625rem", 
                            borderRadius: "50%", 
                            background: bellColor,
                            flexShrink: 0,
                            marginTop: "0.25rem",
                            boxShadow: "0 0 0 0.1875rem rgba(0, 0, 0, 0.08)"
                          }} />
                        )}
                      </div>
                    </div>
                  ))}
                  {notificaciones.length > 10 && (
                    <div style={{
                      padding: isMobile ? "0.875rem 1.25rem" : "1rem 1.5rem",
                      textAlign: "center",
                      fontSize: isMobile ? "0.75rem" : "0.8rem",
                      color: darkMode ? "#94a3b8" : "#64748b",
                      fontWeight: "500",
                      background: darkMode ? "#0f172a" : "#f8fafc",
                      borderTop: `0.0625rem solid ${darkMode ? "#334155" : "#e2e8f0"}`
                    }}>
                      Y {notificaciones.length - 10} notificación{notificaciones.length - 10 !== 1 ? 'es' : ''} más
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-0.625rem);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @keyframes scaleIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
