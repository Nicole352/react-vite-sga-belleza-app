import React, { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, Clock, Mail } from 'lucide-react';

// Importar el componente de Pagos Mensuales
import PagosMenuales from './PagosMenuales';

interface ServiciosProps {
  darkMode: boolean;
}

const Servicios: React.FC<ServiciosProps> = ({ darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPagosMenuales, setShowPagosMenuales] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Función para obtener colores según el tema
  const getThemeColors = () => {
    if (darkMode) {
      return {
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(251, 191, 36, 0.1)',
        accent: '#fbbf24',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      };
    } else {
      return {
        cardBg: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(251, 191, 36, 0.2)',
        accent: '#f59e0b',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#2563eb'
      };
    }
  };

  const theme = getThemeColors();

  // Solo servicio de Pagar Mensualidad
  const services = [
    {
      id: 1,
      title: 'Pagar Mensualidad',
      description: 'Gestiona y paga las mensualidades de tus cursos matriculados de forma rápida y segura',
      icon: CreditCard,
      status: 'available',
      schedule: '24/7 Online',
      contact: 'pagos@sgabelleza.edu.ec',
      action: 'Gestionar Pagos',
      features: ['Pagos online seguros', 'Historial de pagos', 'Múltiples métodos de pago'],
      isSpecial: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return theme.success;
      case 'limited': return theme.warning;
      case 'unavailable': return theme.danger;
      default: return theme.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'limited': return 'Limitado';
      case 'unavailable': return 'No disponible';
      default: return 'Desconocido';
    }
  };

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: `linear-gradient(135deg, ${theme.success}, #059669)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${theme.success}30`
          }}>
            <CreditCard size={18} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 4px 0' 
            }}>
              <CreditCard size={16} style={{ display: 'inline', marginRight: '6px' }} /> Gestión de Pagos
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.85rem', 
              margin: 0 
            }}>
              Gestiona y paga las mensualidades de tus cursos de forma rápida y segura
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', maxWidth: '360px' }}>
          <Search size={14} style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.textMuted
          }} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 34px',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.textPrimary,
              fontSize: '0.85rem',
              fontFamily: 'Montserrat, sans-serif'
            }}
          />
        </div>
      </div>

      {/* Servicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const statusColor = getStatusColor(service.status);
          
          return (
            <div
              key={service.id}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 16px 32px rgba(0, 0, 0, 0.35)' 
                  : '0 16px 32px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 12px 24px rgba(0, 0, 0, 0.25)' 
                  : '0 12px 24px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Header del servicio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: `${theme.accent}20`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={16} color={theme.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: theme.textPrimary,
                    margin: '0 0 4px 0'
                  }}>
                    {service.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColor
                    }} />
                    <span style={{
                      color: statusColor,
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p style={{
                color: theme.textSecondary,
                fontSize: '0.9rem',
                margin: '0 0 10px 0',
                lineHeight: 1.4
              }}>
                {service.description}
              </p>

              {/* Características */}
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  margin: '0 0 8px 0'
                }}>
                  Características:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {service.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={12} color={theme.success} />
                      <span style={{
                        color: theme.textSecondary,
                        fontSize: '0.85rem'
                      }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de contacto */}
              <div style={{
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Clock size={12} color={theme.textMuted} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                    {service.schedule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={12} color={theme.textMuted} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                    {service.contact}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <button 
                onClick={() => {
                  if ((service as any).isSpecial && service.id === 1) {
                    setShowPagosMenuales(true);
                  }
                }}
                style={{
                width: '100%',
                background: (service as any).isSpecial 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
                color: darkMode ? '#000' : '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <CreditCard size={14} />
                {service.action}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredServices.length === 0 && (
        <div style={{
          background: theme.cardBg,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '32px 16px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)',
          boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)'
        }}>
          <Search size={24} color={theme.textMuted} style={{ marginBottom: '10px' }} />
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: theme.textPrimary,
            margin: '0 0 6px 0'
          }}>
            No se encontraron servicios
          </h3>
          <p style={{
            color: theme.textSecondary,
            fontSize: '0.9rem',
            margin: 0
          }}>
            Intenta con otros términos de búsqueda
        </p>
      </div>
    )}

    {/* Componente de Pagos Mensuales */}
    {showPagosMenuales && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 2000,
        overflow: 'hidden'
      }}>
        {/* Botón de cerrar flotante */}
        <button
          onClick={() => setShowPagosMenuales(false)}
          style={{
            position: 'fixed',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'Montserrat, sans-serif',
            zIndex: 2001,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '800'
          }}
        >
          ✕ Cerrar
        </button>
        
        {/* Componente de Pagos Mensuales a pantalla completa */}
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          <PagosMenuales darkMode={darkMode} />
        </div>
      </div>
    )}
  </div>
);
};

export default Servicios;
