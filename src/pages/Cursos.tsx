import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Star,
  Clock,
  Users,
  Award,
  Eye,
  Palette,
  Hand,
  Heart,
  ChevronRight
} from 'lucide-react';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useTheme } from '../context/ThemeContext';

type Curso = {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  enlace: string;
  duracion: string;
  estudiantes: number;
  rating: number;
  icon: React.ReactNode;
  color: string;
  categoria: string;
  certificacion?: string;
};

const cursosData: Curso[] = [
  {
    id: 1,
    titulo: 'Cosmetología',
    descripcion: 'Programa integral de 12 meses. Modalidad: pago mensual de $90 (sin inscripción). Empieza y aprende con materiales incluidos.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758908042/cosme1_cjsu3k.jpg',
    enlace: '/detalle-curso?curso=cosmetologia',
    duracion: '12 meses • $90/mes',
    estudiantes: 850,
    rating: 4.9,
    icon: <Eye size={24} />,
    color: '#ff6b6b',
    categoria: 'Facial'
  },
  {
    id: 2,
    titulo: 'Cosmiatría',
    descripcion: 'Especialización con aparatología. Modalidad: $90/mes durante 7 meses. Requisito: ser Cosmetóloga graduada.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758901284/cosmeto_cy3e36.jpg',
    enlace: '/detalle-curso?curso=cosmiatria',
    duracion: '7 meses • $90/mes',
    estudiantes: 620,
    rating: 4.8,
    icon: <Award size={24} />,
    color: '#4ecdc4',
    categoria: 'Avanzado'
  },
  {
    id: 3,
    titulo: 'Maquillaje Profesional',
    descripcion: 'De básico a avanzado en 6 meses. Modalidad: $90/mes. Sin inscripción, inicia con tu primer pago.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758899626/eff_rxclz1.jpg',
    enlace: '/detalle-curso?curso=maquillaje',
    duracion: '6 meses • $90/mes',
    estudiantes: 1200,
    rating: 4.9,
    icon: <Palette size={24} />,
    color: '#ff9f43',
    categoria: 'Artístico'
  },
  {
    id: 4,
    titulo: 'Lashista Profesional',
    descripcion: 'Plan por clases: inicia con $50 y paga $26 por cada una de las 5 clases restantes. 1 clase por semana (6 en total).',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758900822/lashi_vuiiiv.jpg',
    enlace: '/detalle-curso?curso=lashista',
    duracion: '6 clases • $50 inicio + $26/clase',
    estudiantes: 950,
    rating: 4.8,
    icon: <Eye size={24} />,
    color: '#a55eea',
    categoria: 'Especializado'
  },
  {
    id: 5,
    titulo: 'Técnico en Uñas',
    descripcion: 'Plan por clases: inicia con $50 y paga $15.40 por cada una de las 15 clases restantes. 2 clases por semana (16 en total).',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758902047/una_yzabr3.jpg',
    enlace: '/detalle-curso?curso=unas',
    duracion: '16 clases • $50 inicio + $15.40/clase',
    estudiantes: 1100,
    rating: 4.7,
    icon: <Hand size={24} />,
    color: '#fd79a8',
    categoria: 'Manual'
  },
  {
    id: 6,
    titulo: 'Belleza Integral',
    descripcion: 'Programa completo 12 meses. Modalidad mensual $90 (sin inscripción). Incluye cosmetología, maquillaje, uñas y más.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758908293/cos2_se1xyb.jpg',
    enlace: '/detalle-curso?curso=integral',
    duracion: '12 meses • $90/mes',
    estudiantes: 780,
    rating: 5.0,
    icon: <Heart size={24} />,
    color: '#00b894',
    categoria: 'Completo',
    certificacion: 'Certificado Profesional'
  },
  {
    id: 7,
    titulo: 'Alta Peluquería',
    descripcion: 'Formación premium en cortes avanzados, colorimetría, balayage, mechas y peinados de alta moda. Orientado a quienes buscan destacar en salones profesionales.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758920782/pelu_hvfyfn.png',
    enlace: '/detalle-curso?curso=alta-peluqueria',
    duracion: '8 meses • $90/mes',
    estudiantes: 680,
    rating: 4.9,
    icon: <Award size={24} />,
    color: '#f39c12',
    categoria: 'Peluquería',
    certificacion: 'Certificado Profesional'
  },
  {
    id: 8,
    titulo: 'Moldin Queen',
    descripcion: 'Técnicas especializadas de modelado y estilizado con enfoque en precisión, simetría y acabado impecable. Ideal para elevar tu portafolio profesional.',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758915245/mold_o5qksq.png',
    enlace: '/detalle-curso?curso=moldin-queen',
    duracion: '6 meses • $90/mes',
    estudiantes: 540,
    rating: 4.8,
    icon: <Hand size={24} />,
    color: '#8e44ad',
    categoria: 'Especializado'
  }
];

const Cursos = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: 'ease-out-quart'
    });
  }, []);

  const particles = useMemo(() => (
    Array.from({ length: 16 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 4 + 2}px`,
      height: `${Math.random() * 4 + 2}px`,
      delay: `${Math.random() * 6}s`,
      duration: `${Math.random() * 3 + 4}s`
    }))
  ), []);

  const AnimatedCard: React.FC<{ curso: Curso; index: number }> = ({ curso, index }) => {
    const isHovered = hoveredCard === curso.id;

    return (
      <div
        data-aos="zoom-in-up"
        data-aos-delay={index * 140}
        data-aos-duration="1100"
        data-aos-offset="140"
        data-aos-anchor-placement="top-bottom"
        data-aos-easing="ease-out-back"
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `opacity 600ms ease, transform 600ms ease`,
          transitionDelay: `${index * 150}ms`,
          perspective: '1000px',
          height: '360px'
        }}
        onMouseEnter={() => setHoveredCard(curso.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          className="flip-card-inner"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.15s ease-out',
            transformStyle: 'preserve-3d',
            transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* FRENTE DE LA CARD */}
          <div
            className="flip-card-front"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: theme === 'dark'
                ? 'rgba(255, 255, 255, 0.08)'
                : 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
              overflow: 'hidden',
              border: theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {/* Imagen */}
            <div style={{ height: '290px', overflow: 'hidden', borderRadius: '1rem 1rem 0 0' }}>
              <img
                src={curso.imagen}
                alt={curso.titulo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>

            {/* Contenido básico */}
            <div style={{ padding: '0.85rem' }}>
              <h3
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: theme === 'dark' ? 'rgba(255,255,255,0.98)' : 'rgba(31, 41, 55, 0.98)',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}
              >
                {curso.titulo}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color={theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)'} />
                  <span style={{ fontSize: '0.65rem', color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)' }}>
                    {curso.duracion}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={12} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: '0.65rem', color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)' }}>
                    {curso.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* REVERSO DE LA CARD */}
          <div
            className="flip-card-back"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
              backdropFilter: 'blur(25px) saturate(180%)',
              WebkitBackdropFilter: 'blur(25px) saturate(180%)',
              borderRadius: '1rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              border: '2px solid #fbbf24',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  margin: 0,
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {React.cloneElement(curso.icon as React.ReactElement, { size: 20, color: '#fbbf24' })}
                {curso.titulo}
              </h3>

              <p
                style={{
                  fontSize: '0.75rem',
                  color: theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(31, 41, 55, 0.85)',
                  lineHeight: 1.6,
                  margin: 0,
                  marginBottom: '1rem'
                }}
              >
                {curso.descripcion}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <div
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}
                >
                  <Users size={14} color="#fbbf24" style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#fff' : '#1f2937', fontWeight: 600 }}>
                    {curso.estudiantes}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(31,41,55,0.6)' }}>
                    Estudiantes
                  </div>
                </div>
                <div
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    padding: '0.5rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}
                >
                  <Award size={14} color="#fbbf24" style={{ marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#fff' : '#1f2937', fontWeight: 600 }}>
                    {curso.rating}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(31,41,55,0.6)' }}>
                    Rating
                  </div>
                </div>
              </div>
            </div>

            <Link
              to={curso.enlace}
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#fff',
                fontWeight: 800,
                border: 'none',
                borderRadius: '999px',
                padding: '0.65rem 1rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 10px 28px rgba(251, 191, 36, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textDecoration: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(251, 191, 36, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(251, 191, 36, 0.4)';
              }}
            >
              <Sparkles size={16} />
              Ver Curso Completo
              <ChevronRight size={16} />
            </Link>
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
          
          /* Animación microinteracción badge */
          .badge-categoria:hover {
            transform: scale(1.08) translateY(-3px) !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
          }
          
          /* Efecto de presión en botón */
          .btn-ver-curso:active {
            transform: translateY(0) scale(0.97) !important;
            transition: transform 0.1s ease !important;
          }
          
          /* Responsive ajustes */
          @media (max-width: 640px) {
            .proximamente-card { padding: 16px 14px !important; }
            .proximamente-title { font-size: 1.8rem !important; }
            .proximamente-subtitle { font-size: 1.2rem !important; }
            .proximamente-desc { font-size: 0.95rem !important; }
            
            .curso-card {
              height: auto !important;
              min-height: 420px !important;
            }
          }
          
          @media (max-width: 768px) {
            .curso-card {
              border-radius: 24px !important;
            }
            
            .thumbnail-container {
              height: 240px !important;
              border-radius: 24px 24px 0 0 !important;
            }
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
          paddingBottom: '0px'
        }}
      >
        {/* Partículas flotantes */}
        <div className="floating-particles">
          {particles.map((p, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.width,
                height: p.height,
                animationDelay: p.delay,
                animationDuration: p.duration
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
            data-aos="fade-up"
            style={{
              textAlign: 'center',
              marginBottom: '0.75rem',
              transform: isVisible ? 'translateY(0)' : 'translateY(1.875rem)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h1
              className="gradient-text"
              style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: '#1a1a1a',
                marginTop: '-8px',
                marginBottom: '0.5rem',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)'
              }}
            >
              Nuestros Cursos
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                marginBottom: '0.5rem',
                flexWrap: 'wrap',
                padding: '0 0.75rem'
              }}
            >
              <Sparkles size={16} color="#fbbf24" />
              <span style={{ textAlign: 'center' }}>Elige el curso que más te inspire y comienza tu transformación profesional</span>
            </div>
            <p
              style={{
                fontSize: '0.75rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.7)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.5,
                padding: '0 0.75rem'
              }}
            >
              Programas diseñados por expertos de la industria con certificados profesionales
            </p>
          </div>

          {/* Grid de cursos - primeras 4 cards */}
          <div
            data-aos="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            {cursosData.slice(0, 4).map((curso, index) => (
              <AnimatedCard key={curso.id} curso={curso} index={index} />
            ))}
          </div>

          {/* Grid de 4 columnas para las últimas 4 cards */}
          <div
            data-aos="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            {cursosData.slice(4).map((curso, index) => (
              <AnimatedCard key={curso.id} curso={curso} index={index + 4} />
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Cursos;