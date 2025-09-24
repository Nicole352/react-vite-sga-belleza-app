import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Upload,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Award,
  Users,
  Video,
  Headphones,
  Globe,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';

interface ServiciosProps {
  darkMode: boolean;
}

const Servicios: React.FC<ServiciosProps> = ({ darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('academicos');
  const [searchTerm, setSearchTerm] = useState('');

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

  const categories = [
    { id: 'academicos', name: 'Servicios Académicos', icon: BookOpen },
    { id: 'soporte', name: 'Soporte Técnico', icon: HelpCircle },
    { id: 'bienestar', name: 'Bienestar Estudiantil', icon: Users },
    { id: 'biblioteca', name: 'Biblioteca Digital', icon: FileText }
  ];

  const services = {
    academicos: [
      {
        id: 1,
        title: 'Tutoría Académica',
        description: 'Sesiones personalizadas de apoyo académico con profesores especializados',
        icon: Users,
        status: 'available',
        schedule: 'Lun-Vie 8:00-18:00',
        contact: 'tutoria@sgabelleza.edu.ec',
        action: 'Solicitar Cita',
        features: ['Apoyo personalizado', 'Refuerzo en materias', 'Preparación para exámenes']
      },
      {
        id: 2,
        title: 'Certificaciones',
        description: 'Gestiona y descarga tus certificados académicos y de competencias',
        icon: Award,
        status: 'available',
        schedule: '24/7 Online',
        contact: 'certificados@sgabelleza.edu.ec',
        action: 'Ver Certificados',
        features: ['Certificados digitales', 'Validación online', 'Historial académico']
      },
      {
        id: 3,
        title: 'Aula Virtual Extendida',
        description: 'Acceso a clases grabadas, material adicional y recursos interactivos',
        icon: Video,
        status: 'available',
        schedule: '24/7 Online',
        contact: 'aula@sgabelleza.edu.ec',
        action: 'Acceder al Aula',
        features: ['Clases grabadas', 'Material interactivo', 'Recursos multimedia']
      },
      {
        id: 4,
        title: 'Evaluaciones Online',
        description: 'Sistema de evaluaciones y exámenes en línea con retroalimentación inmediata',
        icon: CheckCircle,
        status: 'available',
        schedule: 'Según programación',
        contact: 'evaluaciones@sgabelleza.edu.ec',
        action: 'Ver Evaluaciones',
        features: ['Exámenes online', 'Retroalimentación', 'Calificaciones automáticas']
      }
    ],
    soporte: [
      {
        id: 5,
        title: 'Mesa de Ayuda Técnica',
        description: 'Soporte técnico para problemas con la plataforma, acceso y herramientas',
        icon: HelpCircle,
        status: 'available',
        schedule: 'Lun-Vie 7:00-19:00',
        contact: 'soporte@sgabelleza.edu.ec',
        action: 'Crear Ticket',
        features: ['Soporte 24/7', 'Chat en vivo', 'Resolución rápida']
      },
      {
        id: 6,
        title: 'Guías y Tutoriales',
        description: 'Biblioteca de guías paso a paso para usar todas las funcionalidades',
        icon: BookOpen,
        status: 'available',
        schedule: '24/7 Online',
        contact: 'guias@sgabelleza.edu.ec',
        action: 'Ver Guías',
        features: ['Videos tutoriales', 'Guías PDF', 'FAQ completo']
      },
      {
        id: 7,
        title: 'Configuración de Cuenta',
        description: 'Ayuda para configurar tu perfil, notificaciones y preferencias',
        icon: Users,
        status: 'available',
        schedule: 'Lun-Vie 8:00-17:00',
        contact: 'cuentas@sgabelleza.edu.ec',
        action: 'Solicitar Ayuda',
        features: ['Configuración perfil', 'Recuperación acceso', 'Cambio datos']
      }
    ],
    bienestar: [
      {
        id: 8,
        title: 'Consejería Estudiantil',
        description: 'Apoyo psicológico y orientación académica para estudiantes',
        icon: MessageCircle,
        status: 'available',
        schedule: 'Lun-Vie 9:00-16:00',
        contact: 'consejeria@sgabelleza.edu.ec',
        action: 'Agendar Cita',
        features: ['Apoyo psicológico', 'Orientación vocacional', 'Confidencial']
      },
      {
        id: 9,
        title: 'Becas y Financiamiento',
        description: 'Información sobre becas, descuentos y opciones de financiamiento',
        icon: Award,
        status: 'available',
        schedule: 'Lun-Vie 8:00-16:00',
        contact: 'becas@sgabelleza.edu.ec',
        action: 'Consultar Becas',
        features: ['Becas académicas', 'Descuentos', 'Planes de pago']
      },
      {
        id: 10,
        title: 'Actividades Extracurriculares',
        description: 'Participación en eventos, talleres y actividades complementarias',
        icon: Users,
        status: 'available',
        schedule: 'Según calendario',
        contact: 'actividades@sgabelleza.edu.ec',
        action: 'Ver Actividades',
        features: ['Talleres', 'Eventos', 'Competencias']
      }
    ],
    biblioteca: [
      {
        id: 11,
        title: 'Biblioteca Digital',
        description: 'Acceso a libros digitales, revistas especializadas y recursos académicos',
        icon: BookOpen,
        status: 'available',
        schedule: '24/7 Online',
        contact: 'biblioteca@sgabelleza.edu.ec',
        action: 'Acceder a Biblioteca',
        features: ['Libros digitales', 'Revistas', 'Base de datos']
      },
      {
        id: 12,
        title: 'Repositorio Institucional',
        description: 'Tesis, trabajos de investigación y proyectos de estudiantes',
        icon: FileText,
        status: 'available',
        schedule: '24/7 Online',
        contact: 'repositorio@sgabelleza.edu.ec',
        action: 'Explorar Repositorio',
        features: ['Tesis digitales', 'Proyectos', 'Investigaciones']
      },
      {
        id: 13,
        title: 'Préstamo de Equipos',
        description: 'Solicitud de equipos especializados para prácticas y proyectos',
        icon: Video,
        status: 'limited',
        schedule: 'Lun-Vie 8:00-17:00',
        contact: 'equipos@sgabelleza.edu.ec',
        action: 'Solicitar Equipo',
        features: ['Equipos especializados', 'Reserva online', 'Inventario actualizado']
      }
    ]
  };

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

  const filteredServices = services[activeCategory as keyof typeof services]?.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.accent}30`
          }}>
            <HelpCircle size={32} color={darkMode ? '#000' : '#fff'} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2.2rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 8px 0' 
            }}>
              Servicios Estudiantiles 🎓
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '1.1rem', 
              margin: '0 0 4px 0' 
            }}>
              Accede a todos los servicios y recursos disponibles para estudiantes
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
            placeholder="Buscar servicios..."
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

      {/* Categorías */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  padding: '12px 24px',
                  background: isActive ? theme.accent : 'transparent',
                  color: isActive ? (darkMode ? '#000' : '#fff') : theme.textSecondary,
                  border: isActive ? 'none' : `1px solid ${theme.border}`,
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.accent + '20';
                    e.currentTarget.style.color = theme.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                <Icon size={18} />
                {category.name}
              </button>
            );
          })}
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
              <button style={{
                width: '100%',
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
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
                <ExternalLink size={18} />
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
            Intenta con otros términos de búsqueda o cambia de categoría
          </p>
        </div>
      )}
    </div>
  );
};

export default Servicios;
