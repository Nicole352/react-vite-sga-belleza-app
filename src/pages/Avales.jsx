import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Shield, 
  Star, 
  CheckCircle, 
  Users, 
  Trophy,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import Footer from '../components/Footer';

const Avales = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const certificaciones = [
    {
      id: 1,
      titulo: 'Ministerio del Trabajo del Ecuador',
      descripcion: 'Certificación oficial como centro de capacitación laboral autorizado para la formación en oficios técnicos de belleza y estética',
      entidad: 'Ministerio del Trabajo - Ecuador',
      vigencia: '2024-2027',
      tipo: 'Gubernamental',
      icono: <Shield size={32} />,
      color: '#10b981',
      prestigio: 'Premium',
      documento: 'MDT-CERT-2024-EST-089',
      valorAdicional: true,
      detalles: [
        'Autorización para emisión de certificados laborales',
        'Reconocimiento oficial de competencias profesionales',
        'Validez nacional para ejercer la profesión',
        'Respaldo gubernamental para empleabilidad'
      ]
    },
    {
      id: 2,
      titulo: 'SENESCYT - Secretaría de Educación Superior',
      descripcion: 'Aval educativo para programas de formación técnica superior en estética integral y cosmetología profesional',
      entidad: 'SENESCYT - Ecuador',
      vigencia: '2023-2026',
      tipo: 'Educativo Superior',
      icono: <Trophy size={32} />,
      color: '#3b82f6',
      prestigio: 'Premium',
      documento: 'SENESCYT-RPC-SE-13-No.048-2024',
      valorAdicional: true,
      detalles: [
        'Reconocimiento de títulos técnicos superiores',
        'Programas académicos registrados oficialmente',
        'Certificación con validez universitaria',
        'Continuidad educativa garantizada'
      ]
    },
    {
      id: 3,
      titulo: 'Ministerio de Salud Pública',
      descripcion: 'Certificación oficial para procedimientos estéticos no invasivos y protocolos de bioseguridad',
      entidad: 'MSP Ecuador',
      vigencia: '2024-2027',
      tipo: 'Sanitario',
      icono: <Award size={32} />,
      color: '#ef4444',
      prestigio: 'Alto',
      documento: 'MSP-2024-EST-001',
      detalles: [
        'Autorización para procedimientos estéticos',
        'Cumplimiento de normas sanitarias',
        'Protocolos de bioseguridad certificados',
        'Habilitación para tratamientos faciales'
      ]
    },
    {
      id: 4,
      titulo: 'Asociación Ecuatoriana de Estética',
      descripcion: 'Miembro fundador activo de la asociación nacional de profesionales en estética y cosmética',
      entidad: 'AEE - Asociación Ecuatoriana de Estética',
      vigencia: '2020-2025',
      tipo: 'Gremial',
      icono: <Award size={32} />,
      color: '#f59e0b',
      prestigio: 'Alto',
      documento: 'AEE-CERT-2024-156',
      detalles: [
        'Representación gremial profesional',
        'Participación en estándares del sector',
        'Networking profesional nacional',
        'Actualización continua de conocimientos'
      ]
    }
  ];

  const reconocimientos = [
    {
      año: '2024',
      titulo: 'Centro de Excelencia en Formación Técnica',
      otorgante: 'Ministerio del Trabajo del Ecuador',
      descripcion: 'Reconocimiento especial por contribución al desarrollo de competencias laborales en el sector de servicios de belleza'
    },
    {
      año: '2024',
      titulo: 'Institución Educativa Destacada',
      otorgante: 'SENESCYT',
      descripcion: 'Por excelencia académica en programas de formación técnica superior y alta tasa de empleabilidad de egresados'
    },
    {
      año: '2023',
      titulo: 'Mejor Escuela de Estética de la Región',
      otorgante: 'Cámara de Comercio de Santo Domingo',
      descripcion: 'Reconocimiento a la calidad educativa y contribución al desarrollo económico local'
    },
    {
      año: '2022',
      titulo: 'Premio a la Innovación Educativa',
      otorgante: 'Consejo de Educación Superior (CES)',
      descripcion: 'Por implementación de metodologías pedagógicas avanzadas y uso de tecnología educativa'
    }
  ];

  const estadisticas = [
    { numero: '98%', texto: 'Tasa de Empleabilidad', icono: <Users size={24} /> },
    { numero: '1,200+', texto: 'Egresadas Exitosas', icono: <Trophy size={24} /> },
    { numero: '15', texto: 'Años de Experiencia', icono: <Calendar size={24} /> },
    { numero: '5★', texto: 'Calificación Promedio', icono: <Star size={24} /> }
  ];

  const CertificationCard = ({ cert, index }) => {
    const isHovered = hoveredCard === cert.id;

    return (
      <div
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
          transitionDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredCard(cert.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: isHovered 
              ? `0 25px 50px ${cert.color}30, 0 0 0 1px ${cert.color}40`
              : '0 15px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            border: `2px solid ${isHovered ? cert.color + '40' : 'rgba(255, 255, 255, 0.1)'}`
          }}
        >
          {/* Badge de prestigio y valor adicional */}
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: '8px' }}>
            {cert.valorAdicional && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  animation: 'pulse 2s infinite'
                }}
              >
                VALOR ADICIONAL
              </div>
            )}
            {cert.prestigio === 'Premium' && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#000',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                }}
              >
                PREMIUM
              </div>
            )}
          </div>

          {/* Icono y header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${cert.color}, ${cert.color}dd)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 8px 25px ${cert.color}40`,
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {cert.icono}
            </div>
            
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  background: `${cert.color}20`,
                  color: cert.color,
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {cert.tipo}
              </div>
              
              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '8px',
                  lineHeight: 1.2
                }}
              >
                {cert.titulo}
              </h3>
              
              <p
                style={{
                  color: cert.color,
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  margin: 0
                }}
              >
                {cert.entidad}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <p
            style={{
              fontSize: '1rem',
              color: '#666',
              marginBottom: '20px',
              lineHeight: 1.6
            }}
          >
            {cert.descripcion}
          </p>

          {/* Detalles adicionales */}
          {cert.detalles && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Beneficios y Alcances:
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'grid',
                gap: '8px'
              }}>
                {cert.detalles.map((detalle, idx) => (
                  <li key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.9rem',
                    color: '#555'
                  }}>
                    <CheckCircle size={14} color={cert.color} />
                    {detalle}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Información adicional */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              padding: '16px',
              background: 'rgba(251, 191, 36, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(251, 191, 36, 0.1)'
            }}
          >
            <div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#999',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                VIGENCIA
              </div>
              <div style={{ 
                fontWeight: '600', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Calendar size={14} color={cert.color} />
                {cert.vigencia}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#999',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                DOCUMENTO
              </div>
              <div style={{ 
                fontWeight: '600', 
                color: '#333',
                fontSize: '0.9rem'
              }}>
                {cert.documento}
              </div>
            </div>
          </div>

          {/* Verificación */}
          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#10b981',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              <CheckCircle size={16} />
              Verificado
            </div>
            
            <button
              style={{
                background: `${cert.color}20`,
                border: `1px solid ${cert.color}40`,
                color: cert.color,
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = `${cert.color}30`;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = `${cert.color}20`;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Ver Certificado
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.1;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 0.3;
            }
          }
          
          .floating-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }
          
          .particle {
            position: absolute;
            background: #fbbf24;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '110px',
          paddingBottom: '0px'
        }}
      >
        {/* Partículas flotantes */}
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            />
          ))}
        </div>

        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Header de la página */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '80px',
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '25px',
                padding: '12px 24px',
                marginBottom: '24px',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Shield size={20} color="#fbbf24" />
              <span style={{ 
                color: '#fde68a', 
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px'
              }}>
                CERTIFICACIONES Y RECONOCIMIENTOS
              </span>
            </div>

            <h1
              className="gradient-text"
              style={{
                fontSize: '4rem',
                fontWeight: '800',
                marginBottom: '24px',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
              }}
            >
              Nuestros Avales
            </h1>
            
            <p
              style={{
                fontSize: '1.4rem',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '800px',
                margin: '0 auto 16px',
                lineHeight: 1.6
              }}
            >
              Contamos con el respaldo oficial del <strong style={{color: '#fbbf24'}}>Ministerio del Trabajo del Ecuador</strong> y <strong style={{color: '#fbbf24'}}>SENESCYT</strong>, 
              garantizando la validez nacional e internacional de nuestros certificados
            </p>
            
            {/* ¿Por Qué Elegirnos? - bloque compacto */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.06))',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: '20px',
                padding: '20px',
                margin: '16px auto 24px',
                maxWidth: '900px',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Award size={18} color="#000" />
                </div>
                <h3 style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>¿Por Qué Elegirnos?</h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}
              >
                {[
                  'Certificación oficial del Ministerio del Trabajo',
                  'Aval educativo de SENESCYT',
                  '98% de empleabilidad de nuestras egresadas',
                  'Instalaciones con tecnología de vanguardia',
                  'Profesores con experiencia internacional',
                  'Bolsa de trabajo exclusiva para estudiantes'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                    <CheckCircle size={16} color="#10b981" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '20px',
                padding: '8px 16px',
                color: '#10b981',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '32px'
              }}
            >
              <CheckCircle size={16} />
              Certificados con Validez Oficial
            </div>

            {/* Estadísticas destacadas */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {estadisticas.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    textAlign: 'center',
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isVisible ? 1 : 0,
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
                    transitionDelay: `${index * 100 + 600}ms`
                  }}
                >
                  <div style={{
                    color: '#fbbf24',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {stat.icono}
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px'
                  }}>
                    {stat.numero}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {stat.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de certificaciones */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '40px',
              marginBottom: '100px'
            }}
          >
            {certificaciones.map((cert, index) => (
              <CertificationCard key={cert.id} cert={cert} index={index} />
            ))}
          </div>

          {/* Sección especial - Valor Adicional Gubernamental */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '60px 40px',
              textAlign: 'center',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '1000ms',
              marginBottom: '80px'
            }}
          >
            {/* Efecto de brillo */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                animation: isVisible ? 'shimmer 3s ease-in-out infinite' : 'none',
                animationDelay: '2s'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '32px'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  <Shield size={36} color="#fff" />
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                  animation: 'float 3s ease-in-out infinite',
                  animationDelay: '0.5s'
                }}>
                  <Trophy size={36} color="#fff" />
                </div>
              </div>

              <h2
                style={{
                  fontSize: '2.8rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '20px',
                  textShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                Respaldo Gubernamental
              </h2>

              <h3
                style={{
                  fontSize: '1.8rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '24px'
                }}
              >
                Ministerio del Trabajo + SENESCYT
              </h3>

              <p
                style={{
                  fontSize: '1.2rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '32px',
                  maxWidth: '800px',
                  margin: '0 auto 32px',
                  lineHeight: 1.6
                }}
              >
                Somos la <strong>única institución en la región</strong> que cuenta con el doble aval gubernamental: 
                certificación laboral del Ministerio del Trabajo y reconocimiento educativo de SENESCYT.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '24px',
                  marginBottom: '40px'
                }}
              >
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Shield size={24} color="#10b981" style={{ marginBottom: '12px' }} />
                  <h4 style={{ 
                    color: '#10b981', 
                    fontSize: '1.2rem', 
                    fontWeight: '700',
                    marginBottom: '8px' 
                  }}>
                    Validez Laboral Nacional
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '0.95rem',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    Certificados reconocidos por empleadores en todo Ecuador
                  </p>
                </div>

                <div
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <Trophy size={24} color="#3b82f6" style={{ marginBottom: '12px' }} />
                  <h4 style={{ 
                    color: '#3b82f6', 
                    fontSize: '1.2rem', 
                    fontWeight: '700',
                    marginBottom: '8px' 
                  }}>
                    Nivel Técnico Superior
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '0.95rem',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    Títulos con equivalencia universitaria oficial
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: '#fbbf24',
                  fontWeight: '700',
                  fontSize: '1.1rem'
                }}
              >
                <Sparkles size={20} />
                Certificación con Garantía de Empleabilidad del 98%
              </div>
            </div>
          </div>

          {/* Sección de Reconocimientos */}
          <div
            style={{
              marginBottom: '80px'
            }}
          >
            <h2
              style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                textAlign: 'center',
                color: '#fff',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Reconocimientos Recibidos
            </h2>
            
            <p
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '60px',
                maxWidth: '600px',
                margin: '0 auto 60px'
              }}
            >
              Nuestra trayectoria de excelencia avalada por las instituciones más prestigiosas
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
              }}
            >
              {reconocimientos.map((reconocimiento, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '28px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isVisible ? 1 : 0,
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
                    transitionDelay: `${index * 150 + 1200}ms`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px) scale(1.02)';
                    e.target.style.boxShadow = '0 25px 50px rgba(251, 191, 36, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '700',
                      fontSize: '1.1rem'
                    }}
                  >
                    {reconocimiento.año}
                  </div>
                  
                  <div style={{ paddingTop: '40px' }}>
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        lineHeight: 1.3
                      }}
                    >
                      {reconocimiento.titulo}
                    </h3>
                    
                    <p
                      style={{
                        color: '#fbbf24',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        marginBottom: '12px'
                      }}
                    >
                      {reconocimiento.otorgante}
                    </p>
                    
                    <p
                      style={{
                        color: '#666',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                        margin: 0
                      }}
                    >
                      {reconocimiento.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección final de llamada a la acción */}
          <div
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '60px 40px',
              textAlign: 'center',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '1500ms',
              marginBottom: '60px'
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)'
              }}
            >
              <Award size={36} color="#000" />
            </div>

            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: '800',
                color: '#fbbf24',
                marginBottom: '16px',
                textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
              }}
            >
              ¿Lista para Formar Parte de la Excelencia?
            </h2>

            <p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '32px',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.6
              }}
            >
              Únete a una institución respaldada por los más altos estándares 
              de calidad y reconocimiento oficial.
            </p>

            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/cursos"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#000',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 12px 35px rgba(251, 191, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
                }}
              >
                <Sparkles size={18} />
                Ver Nuestros Cursos
              </a>

              <a
                href="/contactenos"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  padding: '16px 32px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                  e.target.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <MapPin size={18} />
                Más Información
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Avales;