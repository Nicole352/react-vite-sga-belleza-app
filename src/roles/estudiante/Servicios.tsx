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
      transform: isVisible ? 'translateY(0)' : 'translateY(-1.875rem)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{
        background: theme.cardBg,
        border: `0.0625rem solid ${theme.border}`,
        borderRadius: '0.75em',
        padding: '0.75em',
        marginBottom: '0.75em',
        backdropFilter: 'blur(0.625rem)',
        boxShadow: darkMode ? '0 0.75rem 1.5rem rgba(0, 0, 0, 0.25)' : '0 0.75rem 1.5rem rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625em', marginBottom: '0.625em' }}>
          <div style={{
            width: '2.5em',
            height: '2.5em',
            background: `linear-gradient(135deg, ${theme.success}, #059669)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0.25rem 0.75rem ${theme.success}30`
          }}>
            <CreditCard size={18} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 0.25em 0' 
            }}>
              <CreditCard size={16} style={{ display: 'inline', marginRight: '0.375em' }} /> Gestión de Pagos
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
        <div style={{ position: 'relative', maxWidth: '22.5rem' }}>
          <Search size={14} style={{
            position: 'absolute',
            left: '0.625em',
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
              padding: '0.5em 0.625em 0.5em 2.125em',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `0.0625rem solid ${theme.border}`,
              borderRadius: '0.5em',
              color: theme.textPrimary,
              fontSize: '0.85rem',
              fontFamily: 'Montserrat, sans-serif'
            }}
          />
        </div>
      </div>

      {/* Servicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(18.75rem, 90vw), 1fr))', gap: '0.75em' }}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const statusColor = getStatusColor(service.status);
          
          return (
            <div
              key={service.id}
              style={{
                background: theme.cardBg,
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.75em',
                padding: '1em',
                backdropFilter: 'blur(0.625rem)',
                boxShadow: darkMode ? '0 0.75rem 1.5rem rgba(0, 0, 0, 0.25)' : '0 0.75rem 1.5rem rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-0.125rem)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 1rem 2rem rgba(0, 0, 0, 0.35)' 
                  : '0 1rem 2rem rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 0.75rem 1.5rem rgba(0, 0, 0, 0.25)' 
                  : '0 0.75rem 1.5rem rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Header del servicio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.75em' }}>
                <div style={{
                  width: '2.25em',
                  height: '2.25em',
                  background: `${theme.accent}20`,
                  borderRadius: '0.625em',
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
                    margin: '0 0 0.25em 0'
                  }}>
                    {service.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
                    <div style={{
                      width: '0.5em',
                      height: '0.5em',
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
                margin: '0 0 0.625em 0',
                lineHeight: 1.4
              }}>
                {service.description}
              </p>

              {/* Características */}
              <div style={{ marginBottom: '0.75em' }}>
                <h4 style={{
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: theme.textPrimary,
                  margin: '0 0 0.5em 0'
                }}>
                  Características:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375em' }}>
                  {service.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
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
                borderRadius: '0.5em',
                padding: '0.625em',
                marginBottom: '0.75em'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em', marginBottom: '0.375em' }}>
                  <Clock size={12} color={theme.textMuted} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>
                    {service.schedule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375em' }}>
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
                borderRadius: '0.625em',
                padding: '0.625em 0.75em',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375em'
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
          border: `0.0625rem solid ${theme.border}`,
          borderRadius: '0.75em',
          padding: '2em 1em',
          textAlign: 'center',
          backdropFilter: 'blur(0.625rem)',
          boxShadow: darkMode ? '0 0.75rem 1.5rem rgba(0, 0, 0, 0.25)' : '0 0.75rem 1.5rem rgba(0, 0, 0, 0.08)'
        }}>
          <Search size={24} color={theme.textMuted} style={{ marginBottom: '0.625em' }} />
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '800',
            color: theme.textPrimary,
            margin: '0 0 0.375em 0'
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
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* Botón de cerrar flotante */}
        <button
          onClick={() => setShowPagosMenuales(false)}
          style={{
            position: 'fixed',
            top: '0.75em',
            right: '0.75em',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '0.0625rem solid rgba(255, 255, 255, 0.2)',
            borderRadius: '0.5em',
            color: '#fff',
            padding: '0.5em 0.75em',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'Montserrat, sans-serif',
            zIndex: 2001,
            display: 'flex',
            alignItems: 'center',
            gap: '0.375em',
            fontWeight: '800'
          }}
        >
          ✕ Cerrar
        </button>
        
        {/* Componente de Pagos Mensuales a pantalla completa */}
        <div style={{ width: '100%', minHeight: '100%' }}>
          <PagosMenuales darkMode={darkMode} />
        </div>
      </div>
    )}
  </div>
);
};

export default Servicios;
