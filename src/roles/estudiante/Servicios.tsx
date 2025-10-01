import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Mail,
  CheckCircle,
  Search,
  CreditCard
} from 'lucide-react';

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
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: `linear-gradient(135deg, ${theme.success}, #059669)`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.success}30`
          }}>
            <CreditCard size={32} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 8px 0' 
            }}>
              Gestión de Pagos 💳
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '1.1rem', 
              margin: '0 0 4px 0' 
            }}>
              Gestiona y paga las mensualidades de tus cursos de forma rápida y segura
            </p>
          </div>
        </div>

        {/* Búsqueda */}
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '16px',
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
              padding: '12px 16px 12px 50px',
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: `1px solid ${theme.border}`,
              borderRadius: '12px',
              color: theme.textPrimary,
              fontSize: '1rem',
              fontFamily: 'Montserrat, sans-serif'
            }}
          />
        </div>
      </div>

      {/* Servicios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const statusColor = getStatusColor(service.status);
          
          return (
            <div
              key={service.id}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: '20px',
                padding: '32px',
                backdropFilter: 'blur(20px)',
                boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 25px 50px rgba(0, 0, 0, 0.4)' 
                  : '0 25px 50px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = darkMode 
                  ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                  : '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Header del servicio */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: `${theme.accent}20`,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={28} color={theme.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    margin: '0 0 8px 0'
                  }}>
                    {service.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusColor
                    }} />
                    <span style={{
                      color: statusColor,
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p style={{
                color: theme.textSecondary,
                fontSize: '1rem',
                margin: '0 0 20px 0',
                lineHeight: 1.6
              }}>
                {service.description}
              </p>

              {/* Características */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: theme.textPrimary,
                  margin: '0 0 12px 0'
                }}>
                  Características:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {service.features.map((feature, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} color={theme.success} />
                      <span style={{
                        color: theme.textSecondary,
                        fontSize: '0.9rem'
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
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Clock size={16} color={theme.textMuted} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                    {service.schedule}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color={theme.textMuted} />
                  <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
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
                borderRadius: '12px',
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CreditCard size={18} />
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
          borderRadius: '20px',
          padding: '64px 32px',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
          boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
        }}>
          <Search size={48} color={theme.textMuted} style={{ marginBottom: '16px' }} />
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: theme.textPrimary,
            margin: '0 0 12px 0'
          }}>
            No se encontraron servicios
          </h3>
          <p style={{
            color: theme.textSecondary,
            fontSize: '1rem',
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
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: '#fff',
            padding: '12px 16px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'Montserrat, sans-serif',
            zIndex: 2001,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
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
