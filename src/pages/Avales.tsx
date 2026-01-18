import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Award,
  Shield,
  CheckCircle,
  Trophy,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

type Certificacion = {
  id: number;
  titulo: string;
  descripcion: string;
  entidad: string;
  vigencia: string;
  tipo: string;
  icono: React.ReactNode;
  color: string;
  prestigio?: string;
  documento?: string;
  valorAdicional?: boolean;
  detalles?: string[];
  imageUrl?: string;
};

type Reconocimiento = {
  año: string;
  titulo: string;
  otorgante: string;
  descripcion: string;
};

const Avales = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [showMoreCerts, setShowMoreCerts] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    AOS.init({
      duration: 800,
      delay: 100,
      once: true
    });
  }, []);

  const certificaciones: Certificacion[] = [
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
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768761825/WhatsApp_Image_2026-01-14_at_10.20.13_AM_zkjsl2.jpg',
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
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768454647/WhatsApp_Image_2026-01-14_at_10.04.51_PM_m8xacb.jpg',
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
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768762198/1c230258-5e34-4430-91c3-3ca21a4fea06.png',
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
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768454654/WhatsApp_Image_2026-01-14_at_9.58.27_PM_mvkqqx.jpg',
      detalles: [
        'Representación gremial profesional',
        'Participación en estándares del sector',
        'Networking profesional nacional',
        'Actualización continua de conocimientos'
      ]
    },
    {
      id: 5,
      titulo: 'Instituto Superior Tecnológico Lendan',
      descripcion: 'Certificación de formación técnica superior en estética y cosmetología profesional',
      entidad: 'IST Lendan - Ecuador',
      vigencia: '2023-2026',
      tipo: 'Educativo',
      icono: <Award size={32} />,
      color: '#8b5cf6',
      prestigio: 'Alto',
      documento: 'IST-CERT-2023-156',
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768454652/WhatsApp_Image_2026-01-14_at_10.00.25_PM_r0cixo.jpg',
      detalles: [
        'Formación técnica superior certificada',
        'Programas avalados por SENESCYT',
        'Certificación con validez académica',
        'Reconocimiento nacional e internacional'
      ]
    },
    {
      id: 6,
      titulo: 'Asociación Nacional de Artesanos del Ecuador',
      descripcion: 'Certificación artesanal en técnicas de belleza y estética profesional',
      entidad: 'ANAE - Asociación Nacional de Artesanos',
      vigencia: '2023-2026',
      tipo: 'Artesanal',
      icono: <Award size={32} />,
      color: '#ec4899',
      prestigio: 'Alto',
      documento: 'ANAE-CERT-2023-089',
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768454658/WhatsApp_Image_2026-01-14_at_9.48.26_PM_smgj3f.jpg',
      detalles: [
        'Certificación artesanal oficial',
        'Reconocimiento de técnicas tradicionales',
        'Validez nacional para artesanos',
        'Respaldo gremial artesanal'
      ]
    },
    {
      id: 7,
      titulo: 'Certificación Técnica Profesional',
      descripcion: 'Certificación en competencias técnicas profesionales en estética y cosmetología',
      entidad: 'Instituto de Certificación Profesional',
      vigencia: '2024-2027',
      tipo: 'Profesional',
      icono: <Trophy size={32} />,
      color: '#06b6d4',
      prestigio: 'Premium',
      documento: 'ICP-CERT-2024-234',
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768761814/WhatsApp_Image_2026-01-14_at_10.04.31_AM_lmh4rp.jpg',
      detalles: [
        'Certificación de competencias profesionales',
        'Reconocimiento técnico especializado',
        'Validez para ejercicio profesional',
        'Actualización continua de habilidades'
      ]
    }
  ];

  const reconocimientos: Reconocimiento[] = [
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

  const CertificationCard: React.FC<{ cert: Certificacion; index: number }> = ({ cert, index }) => {
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
        data-aos="fade-up"
        data-aos-delay={`${index * 100}`}
      >
        <div
          className="card-gloss"
          style={{
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
            borderRadius: '1rem',
            padding: cert.imageUrl ? '0' : '1rem',
            boxShadow: isHovered
              ? `0 15px 30px ${cert.color}20, 0 0 0 1px ${cert.color}40`
              : theme === 'dark' ? '0 8px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.08)' : '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(209, 160, 42, 0.25)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(14px)',
            border: `1px solid ${isHovered ? cert.color + '40' : 'rgba(251, 191, 36, 0.25)'}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            paddingBottom: cert.imageUrl ? '0' : '1rem',
            paddingTop: cert.imageUrl ? '0' : '2.5rem'
          }}
        >
          {/* Reflection overlay */}
          <span className="shimmer-overlay" aria-hidden="true" />
          {/* Badge de prestigio y valor adicional - only show if NO image */}
          {!cert.imageUrl && (
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: '0.35rem', zIndex: 2 }}>
              {cert.valorAdicional && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                    color: '#fff',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.55rem',
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
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.55rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)'
                  }}
                >
                  PREMIUM
                </div>
              )}
            </div>
          )}

          {/* Certificate Image - SOLO LA IMAGEN LIMPIA */}
          {cert.imageUrl ? (
            <div style={{
              width: '100%',
              borderRadius: '1rem',
              overflow: 'hidden'
            }}>
              <img
                src={cert.imageUrl}
                alt={cert.titulo}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : null}

          {/* Todo el contenido siguiente SOLO se muestra si NO hay imagen */}
          {!cert.imageUrl && (
            <>
              {/* Icono y header */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    background: `linear-gradient(135deg, ${cert.color}, ${cert.color}dd)`,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    boxShadow: `0 8px 25px ${cert.color}40`,
                    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  {React.cloneElement(cert.icono as React.ReactElement<any>, { size: 22 })}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'inline-block',
                      background: `${cert.color}20`,
                      color: cert.color,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      marginBottom: '0.35rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {cert.tipo}
                  </div>

                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                      marginBottom: '0.35rem',
                      lineHeight: 1.2
                    }}
                  >
                    {cert.titulo}
                  </h3>

                  <p
                    style={{
                      color: cert.color,
                      fontWeight: '600',
                      fontSize: '0.75rem',
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
                  fontSize: '0.75rem',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(31, 41, 55, 0.75)',
                  marginBottom: '0.75rem',
                  lineHeight: 1.5
                }}
              >
                {cert.descripcion}
              </p>

              {/* Detalles adicionales */}
              {cert.detalles && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <h4 style={{
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px'
                  }}>
                    Beneficios y Alcances:
                  </h4>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'grid',
                    gap: '0.35rem'
                  }}>
                    {cert.detalles.map((detalle, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.7rem',
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(31, 41, 55, 0.85)'
                      }}>
                        <CheckCircle size={10} color={cert.color} />
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
                  gap: '0.5rem',
                  padding: '0.65rem',
                  background: 'rgba(251, 191, 36, 0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: theme === 'dark' ? '#cbd5e1' : '#6b7280',
                    marginBottom: '0.2rem',
                    fontWeight: '500'
                  }}>
                    VIGENCIA
                  </div>
                  <div style={{
                    fontWeight: '600',
                    color: theme === 'dark' ? '#e5e7eb' : '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem'
                  }}>
                    <Calendar size={10} color={cert.color} />
                    {cert.vigencia}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: '0.65rem',
                    color: theme === 'dark' ? '#cbd5e1' : '#6b7280',
                    marginBottom: '0.2rem',
                    fontWeight: '500'
                  }}>
                    DOCUMENTO
                  </div>
                  <div style={{
                    fontWeight: '600',
                    color: theme === 'dark' ? '#e5e7eb' : '#374151',
                    fontSize: '0.7rem'
                  }}>
                    {cert.documento}
                  </div>
                </div>
              </div>

              {/* Verificación */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '0.75rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: '#10b981',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  <CheckCircle size={12} />
                  Verificado
                </div>

                <button
                  style={{
                    background: 'transparent',
                    border: `1px solid ${cert.color}66`,
                    color: cert.color,
                    padding: '0.35rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = `${cert.color}1a`;
                    el.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'transparent';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  Ver Certificado
                </button>
              </div>
            </>
          )}
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
          
          /* Gloss/reflection overlay for certification cards */
          .card-gloss { position: relative; overflow: hidden; }
          .card-gloss .shimmer-overlay {
            position: absolute;
            top: 0;
            left: -130%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0));
            transform: skewX(-15deg);
            pointer-events: none;
            animation: shimmer 3.8s ease-in-out infinite;
          }
          .card-gloss:hover .shimmer-overlay {
            animation-duration: 1.6s;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.20), rgba(255,255,255,0));
          }
          /* Responsive grids for Certificaciones and Reconocimientos */
          .grid-certificaciones {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.25rem;
            align-items: stretch;
            margin-bottom: 1.25rem;
          }
          .grid-reconocimientos {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          @media (max-width: 1024px) {
            .grid-reconocimientos { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 768px) {
            .grid-certificaciones { grid-template-columns: 1fr; }
            .grid-reconocimientos { grid-template-columns: 1fr; }
          }
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #ffffff 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '7rem',
          paddingBottom: '0px',
          fontFamily: 'Montserrat, sans-serif'
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
            maxWidth: '90%',
            margin: '0 auto',
            padding: '0 0.75rem',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Header de la página */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '1.25rem',
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            data-aos="fade-up"
          >
            <h1
              className="gradient-text"
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                marginTop: '-8px',
                marginBottom: '0.5rem',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
              }}
            >
              Nuestros Avales
            </h1>

            <p
              style={{
                fontSize: '0.85rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Contamos con el respaldo oficial del <strong style={{ color: '#fbbf24' }}>Ministerio del Trabajo del Ecuador</strong> y <strong style={{ color: '#fbbf24' }}>SENESCYT</strong>,
              garantizando la validez nacional e internacional de nuestros certificados
            </p>

            {/* ¿Por Qué Elegirnos? - bloque compacto */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.08), rgba(245, 158, 11, 0.06))',
                border: '1px solid rgba(251, 191, 36, 0.22)',
                borderRadius: '1rem',
                padding: '1rem',
                margin: '0.75rem auto',
                maxWidth: '90%',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Award size={14} color="#000" />
                </div>
                <h3 style={{ margin: 0, color: theme === 'dark' ? '#e5e7eb' : '#374151', fontWeight: 700, fontSize: '0.95rem' }}>¿Por Qué Elegirnos?</h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.5rem'
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
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: theme === 'dark' ? 'rgba(255,255,255,0.92)' : 'rgba(31, 41, 55, 0.92)',
                      fontSize: '0.7rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(251, 191, 36, 0.06)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'rgba(251, 191, 36, 0.10)';
                      el.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                      el.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.background = 'rgba(251, 191, 36, 0.06)';
                      el.style.borderColor = 'rgba(251, 191, 36, 0.25)';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    <CheckCircle size={12} color="#10b981" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '1rem',
                padding: '0.5rem 0.75rem',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginTop: '0.75rem'
              }}
            >
              <CheckCircle size={12} />
              Certificados con Validez Oficial
            </div>

            {/* Estadísticas destacadas */}
            {/* Eliminado por no ser relevante en esta página */}
            {/* <div ...> ... </div> */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px'
              }}
            >
              {/* Eliminado */}
            </div>
          </div>

          {/* Grid de certificaciones */}
          <div
            className="grid-certificaciones"
            style={{}}
            data-aos="fade-up"
          >
            {certificaciones.slice(0, showMoreCerts ? certificaciones.length : 3).map((cert, index) => (
              <CertificationCard key={cert.id} cert={cert} index={index} />
            ))}
          </div>

          {/* Toggle Ver más certificaciones */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-1rem', marginBottom: '1.25rem' }}>
            <button
              style={{
                background: showMoreCerts ? 'transparent' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: showMoreCerts ? '#fbbf24' : '#000',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.75rem',
                border: showMoreCerts ? '1px solid rgba(251, 191, 36, 0.6)' : 'none',
                cursor: 'pointer',
                boxShadow: showMoreCerts ? 'none' : '0 8px 24px rgba(251, 191, 36, 0.35)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowMoreCerts(v => !v)}
            >
              {showMoreCerts ? 'Ver menos' : 'Ver más certificaciones'}
            </button>
          </div>

          {/* Sección especial - Respaldo Gubernamental */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
              backdropFilter: 'blur(20px)',
              borderRadius: '1rem',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              marginBottom: '1.25rem'
            }}
            data-aos="fade-up"
          >
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(16, 185, 129, 0.35)'
                }}>
                  <Shield size={18} color="#fff" />
                </div>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.35)'
                }}>
                  <Trophy size={18} color="#fff" />
                </div>
              </div>

              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}
              >
                Respaldo Gubernamental
              </h2>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#1f2937', marginBottom: '0.5rem' }}>
                Ministerio del Trabajo + SENESCYT
              </h3>
              <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31, 41, 55, 0.9)', maxWidth: 700, margin: '0 auto 0.75rem', lineHeight: 1.5, fontSize: '0.75rem' }}>
                Doble aval gubernamental: certificación laboral del Ministerio del Trabajo y reconocimiento educativo de SENESCYT.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                  <Shield size={16} color="#10b981" style={{ marginBottom: '0.35rem' }} />
                  <h4 style={{ color: '#10b981', fontWeight: 700, margin: '0 0 0.25rem 0', fontSize: '0.75rem' }}>Validez Laboral Nacional</h4>
                  <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(31, 41, 55, 0.85)', margin: 0, fontSize: '0.7rem' }}>Certificados reconocidos por empleadores en todo Ecuador.</p>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.18)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '0.75rem', padding: '0.75rem' }}>
                  <Trophy size={16} color="#3b82f6" style={{ marginBottom: '0.35rem' }} />
                  <h4 style={{ color: '#3b82f6', fontWeight: 700, margin: '0 0 0.25rem 0', fontSize: '0.75rem' }}>Nivel Técnico Superior</h4>
                  <p style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(31, 41, 55, 0.85)', margin: 0, fontSize: '0.7rem' }}>Títulos con equivalencia educativa oficial.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Reconocimientos */}
          <div
            style={{
              marginBottom: '1.25rem'
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                marginBottom: '0.5rem',
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
                fontSize: '0.85rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                marginBottom: '0.75rem',
                maxWidth: '700px',
                margin: '0 auto 0.75rem'
              }}
            >
              Nuestra trayectoria de excelencia avalada por las instituciones más prestigiosas
            </p>

            <div
              className="grid-reconocimientos"
              style={{}}
              data-aos="fade-up"
            >
              {reconocimientos.map((reconocimiento, index) => (
                <div
                  key={index}
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '1rem',
                    padding: '1rem',
                    backdropFilter: 'blur(14px)',
                    border: '1px solid rgba(251, 191, 36, 0.25)',
                    boxShadow: theme === 'dark' ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isVisible ? 1 : 0,
                    transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
                    transitionDelay: `${index * 150 + 1200}ms`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(-3px) scale(1.01)';
                    el.style.boxShadow = theme === 'dark' ? '0 15px 30px rgba(0, 0, 0, 0.4)' : '0 8px 20px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = 'translateY(0) scale(1)';
                    el.style.boxShadow = theme === 'dark' ? '0 8px 20px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      width: '35px',
                      height: '35px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '700',
                      fontSize: '0.75rem'
                    }}
                  >
                    {reconocimiento.año}
                  </div>

                  <div style={{ paddingTop: '2rem' }}>
                    <h3
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                        marginBottom: '0.35rem',
                        lineHeight: 1.3
                      }}
                    >
                      {reconocimiento.titulo}
                    </h3>

                    <p
                      style={{
                        color: '#fbbf24',
                        fontWeight: '600',
                        fontSize: '0.7rem',
                        marginBottom: '0.5rem'
                      }}
                    >
                      {reconocimiento.otorgante}
                    </p>

                    <p
                      style={{
                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(31, 41, 55, 0.75)',
                        fontSize: '0.7rem',
                        lineHeight: 1.4,
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
              borderRadius: '1rem',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '1500ms',
              marginBottom: '1.25rem'
            }}
          >
            <div
              style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem',
                boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)'
              }}
            >
              <Award size={22} color="#000" />
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#fbbf24',
                marginBottom: '0.5rem',
                textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
              }}
            >
              ¿Lista para Formar Parte de la Excelencia?
            </h2>

            <p
              style={{
                fontSize: '0.85rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                marginBottom: '0.75rem',
                maxWidth: '600px',
                margin: '0 auto 0.75rem',
                lineHeight: 1.5
              }}
            >
              Únete a una institución respaldada por los más altos estándares
              de calidad y reconocimiento oficial.
            </p>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a
                href="/cursos"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#000',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 8px 24px rgba(251, 191, 36, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(-2px) scale(1.05)';
                  el.style.boxShadow = '0 12px 35px rgba(251, 191, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 8px 24px rgba(251, 191, 36, 0.4)';
                }}
              >
                <Sparkles size={14} />
                Ver Nuestros Cursos
              </a>

              <a
                href="/contactenos"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = 'rgba(251, 191, 36, 0.1)';
                  el.style.borderColor = 'rgba(251, 191, 36, 0.6)';
                  el.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.08)';
                  el.style.borderColor = 'rgba(251, 191, 36, 0.3)';
                  el.style.transform = 'translateY(0)';
                }}
              >
                <MapPin size={14} />
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