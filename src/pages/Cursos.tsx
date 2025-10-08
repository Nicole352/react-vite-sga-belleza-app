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
          transitionDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredCard(curso.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          className="curso-card"
          style={{
            background: theme === 'dark' 
              ? 'rgba(255, 255, 255, 0.08)' 
              : 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(25px) saturate(180%)',
            WebkitBackdropFilter: 'blur(25px) saturate(180%)',
            borderRadius: '32px',
            boxShadow: isHovered
              ? '0 20px 50px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
              : '0 10px 30px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
            transform: isHovered ? 'translateY(-6px) scale(1.005)' : 'translateY(0) scale(1)',
            position: 'relative',
            height: '460px',
            border: theme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(255, 255, 255, 0.3)',
            willChange: 'transform, box-shadow'
          }}
        >
          {/* Reflejo tipo shimmer */}
          <span className="shimmer-overlay" aria-hidden="true" />
          
          {/* Badge de categoría con glassmorphism */}
          <div
            className="badge-categoria"
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: `linear-gradient(135deg, ${curso.color}ee, ${curso.color}cc)`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '0.82rem',
              fontWeight: '700',
              zIndex: 3,
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.25s ease-out, box-shadow 0.25s ease-out',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              letterSpacing: '0.5px',
              transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0)'
            }}
          >
            {curso.categoria}
          </div>

          {/* Thumbnail con parallax y profundidad */}
          <div 
            className="thumbnail-container"
            style={{ 
              position: 'relative', 
              height: '280px', 
              background: 'linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.65))', 
              overflow: 'hidden',
              borderRadius: '32px 32px 0 0'
            }}
          >
            <img
              src={curso.imagen}
              alt={curso.titulo}
              className="curso-thumbnail"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease-out, filter 0.3s ease-out',
                transform: isHovered ? 'scale(1.04) translateY(-2px)' : 'scale(1) translateY(0)',
                filter: isHovered ? 'brightness(1.08) contrast(1.02)' : 'brightness(1) contrast(1)',
                willChange: 'transform, filter'
              }}
            />

            {/* Desvanecido inferior con luz difusa */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '140px',
                background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 45%, ${theme === 'dark' ? 'rgba(11,11,11,0.85)' : 'rgba(255,255,255,0.85)'} 100%)`,
                opacity: isHovered ? 0.96 : 0.88,
                transition: 'opacity 520ms ease',
                pointerEvents: 'none'
              }}
            />

            {/* Icono circular sobre la imagen con efecto líquido */}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                background: `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)`,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '999px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transform: isHovered ? 'translateY(-72px) scale(1.1)' : 'translateY(0) scale(1)',
                opacity: isHovered ? 0 : 1,
                transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              {curso.icon}
            </div>
          </div>

          {/* Panel de contenido glassmorphism */}
          <div
            style={{
              position: 'relative',
              background: theme === 'dark' 
                ? 'rgba(11, 11, 11, 0.75)' 
                : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px) saturate(150%)',
              WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              width: '100%',
              padding: '22px 24px',
              marginTop: isHovered ? -68 : -10,
              transition: 'margin-top 0.3s ease-out',
              boxShadow: '0 -1px 0 rgba(0,0,0,0.08) inset',
              borderTop: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
              willChange: 'margin-top'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: theme === 'dark' ? 'rgba(255,255,255,0.98)' : 'rgba(31, 41, 55, 0.98)',
                  margin: 0,
                  paddingBottom: 6,
                  lineHeight: 1.25,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                  letterSpacing: '-0.5px'
                }}
              >
                {curso.titulo}
              </h3>

              <h4
                style={{
                  margin: 0,
                  paddingBottom: 8,
                  color: '#fbbf24',
                  fontSize: '1rem',
                  fontWeight: 700,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                }}
              >
                {curso.categoria}
              </h4>

              <p
                style={{
                  fontSize: '0.98rem',
                  color: theme === 'dark' ? 'rgba(255,255,255,0.78)' : 'rgba(31, 41, 55, 0.78)',
                  lineHeight: 1.6,
                  margin: 0,
                  overflow: 'hidden',
                  maxHeight: isHovered ? 132 : 0,
                  opacity: isHovered ? 1 : 0,
                  transition: 'max-height 0.3s ease-out, opacity 0.25s ease-out',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                }}
              >
                {curso.descripcion}
              </p>

              {/* Métricas del curso con glassmorphism */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 14,
                  padding: '12px 14px',
                  background: theme === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(249, 250, 251, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: 16,
                  border: theme === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.08)' 
                    : '1px solid rgba(209, 160, 42, 0.15)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color={theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)'} />
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', 
                    fontWeight: 500,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                  }}>
                    {curso.duracion}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color={theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)'} />
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', 
                    fontWeight: 500,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                  }}>
                    {curso.estudiantes}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ 
                    fontSize: '0.9rem', 
                    color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', 
                    fontWeight: 500,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
                  }}>
                    {curso.rating}
                  </span>
                </div>
              </div>

              {/* Botón táctil iOS con glassmorphism */}
              <Link
                to={curso.enlace}
                className="btn-ver-curso"
                style={{
                  marginTop: 14,
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#0b0b0b',
                  fontWeight: 800,
                  border: 'none',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  boxShadow: `0 10px 28px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
                  transform: isHovered ? 'translateY(-1px) scale(1.02)' : 'translateY(0) scale(1)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                  letterSpacing: '0.3px'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(-1px) scale(1.02)';
                  el.style.boxShadow = '0 12px 36px rgba(251, 191, 36, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 10px 28px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                }}
                onMouseDown={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(0) scale(0.97)';
                }}
                onMouseUp={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(-1px) scale(1.02)';
                }}
              >
                <Sparkles size={18} />
                Ver Curso
                <ChevronRight
                  size={18}
                  style={{
                    transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
                    transition: 'transform 500ms ease'
                  }}
                />
              </Link>
            </div>
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
            0% { left: -130%; }
            100% { left: 130%; }
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
          
          /* Reflejo tipo shimmer glassmorphism */
          .shimmer-overlay {
            position: absolute;
            top: 0;
            left: -130%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
            transform: skewX(-15deg);
            animation: shimmer 8s ease-in-out infinite;
            pointer-events: none;
            z-index: 2;
          }
          
          .curso-card:hover .shimmer-overlay {
            animation-duration: 3s;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.25), rgba(255,255,255,0));
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
          paddingTop: '168px',
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
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Header de la página */}
          <div
            data-aos="fade-up"
            style={{
              textAlign: 'center',
              marginBottom: '80px',
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <h1
              className="gradient-text"
              style={{
                fontSize: '4rem',
                fontWeight: '800',
                color: '#1a1a1a',
                marginBottom: '24px',
                lineHeight: 1.1,
                textShadow: '0 4px 20px rgba(251, 191, 36, 0.3)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                letterSpacing: '-1px'
              }}
            >
              Nuestros Cursos
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '1.4rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                marginBottom: '16px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              <Sparkles size={24} color="#fbbf24" />
              <span>Elige el curso que más te inspire y comienza tu transformación profesional</span>
            </div>
            <p
              style={{
                fontSize: '1.1rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.7)',
                maxWidth: '600px',
                margin: '0 auto 32px',
                lineHeight: 1.6,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
            >
              Programas diseñados por expertos de la industria con certificados profesionales
            </p>
          </div>

          {/* Grid de cursos - primeras 6 cards */}
          <div
            data-aos="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '40px',
              marginBottom: '40px'
            }}
          >
            {cursosData.slice(0, 6).map((curso, index) => (
              <AnimatedCard key={curso.id} curso={curso} index={index} />
            ))}
          </div>

          {/* Grid de 2 columnas centrado para las últimas 2 cards */}
          <div
            data-aos="fade-up"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(360px, 460px))',
              gap: '40px',
              marginBottom: '100px',
              justifyContent: 'center'
            }}
          >
            {cursosData.slice(6).map((curso, index) => (
              <AnimatedCard key={curso.id} curso={curso} index={index + 6} />
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Cursos;