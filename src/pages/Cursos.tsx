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
  ChevronRight,
  Calendar
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
            background: theme === 'dark' ? '#0b0b0b' : '#ffffff',
            borderRadius: '24px',
            boxShadow: isHovered
              ? `0 18px 36px rgba(0,0,0,0.35), 0 0 0 1px ${curso.color}22, 0 6px 24px rgba(251,191,36,0.12)`
              : theme === 'dark' ? '0 12px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)' : '0 8px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(209, 160, 42, 0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 520ms cubic-bezier(0.22, 1, 0.36, 1)',
            transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
            position: 'relative',
            height: '460px',
            border: theme === 'dark' ? '1px solid #222' : '1px solid rgba(209, 160, 42, 0.25)',
            willChange: 'transform, box-shadow'
          }}
        >
          {/* Reflejo tipo shimmer (como en Inicio) */}
          <span className="shimmer-overlay" aria-hidden="true" />
          {/* Badge de categoría */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: curso.color,
              color: '#0b0b0b',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              zIndex: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {curso.categoria}
          </div>

          {/* Thumbnail estilo news card */}
          <div style={{ position: 'relative', height: '280px', background: '#000', overflow: 'hidden' }}>
            <img
              src={curso.imagen}
              alt={curso.titulo}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                willChange: 'transform'
              }}
            />

            {/* Desvanecido inferior para integrar imagen con el panel (glass) */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '140px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.38) 45%, rgba(0,0,0,0.65) 100%)',
                opacity: isHovered ? 0.96 : 0.88,
                transition: 'opacity 520ms ease',
                pointerEvents: 'none'
              }}
            />

            {/* Icono circular sobre la imagen */}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                left: 18,
                background: curso.color,
                borderRadius: '999px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0b0b0b',
                transform: isHovered ? 'translateY(-72px)' : 'translateY(0)',
                opacity: isHovered ? 0 : 1,
                transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), opacity 520ms ease',
                boxShadow: '0 8px 18px rgba(0,0,0,0.25)'
              }}
            >
              {curso.icon}
            </div>
          </div>

          {/* Panel de contenido que se superpone hacia arriba sin cambiar el alto externo */}
          <div
            style={{
              position: 'relative',
              background: theme === 'dark' ? '#0b0b0b' : '#ffffff',
              width: '100%',
              padding: '22px 24px',
              marginTop: isHovered ? -68 : -10,
              transition: 'margin-top 520ms cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: '0 -1px 0 rgba(0,0,0,0.28) inset',
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
                  lineHeight: 1.25
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
                  fontWeight: 700
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
                  transition: 'max-height 520ms cubic-bezier(0.37, 0.75, 0.61, 1.05), opacity 480ms ease'
                }}
              >
                {curso.descripcion}
              </p>

              {/* Métricas del curso */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 14,
                  padding: '12px 14px',
                  background: theme === 'dark' ? '#151515' : '#f9fafb',
                  borderRadius: 14,
                  border: theme === 'dark' ? '1px solid #222' : '1px solid rgba(209, 160, 42, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} color="rgba(255,255,255,0.75)" />
                  <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', fontWeight: 500 }}>
                    {curso.duracion}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={16} color="rgba(255,255,255,0.75)" />
                  <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', fontWeight: 500 }}>
                    {curso.estudiantes}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ fontSize: '0.9rem', color: theme === 'dark' ? 'rgba(255,255,255,0.75)' : 'rgba(31, 41, 55, 0.75)', fontWeight: 500 }}>
                    {curso.rating}
                  </span>
                </div>
              </div>

              {/* Botón */}
              <Link
                to={curso.enlace}
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
                  boxShadow: `0 10px 28px rgba(0,0,0,0.35)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textDecoration: 'none',
                  transition: 'transform 520ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 520ms ease',
                  transform: isHovered ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.45)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 10px 28px rgba(0,0,0,0.35)';
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
          
          /* Reflejo tipo Inicio para cards de cursos */
          .shimmer-overlay {
            position: absolute;
            top: 0;
            left: -130%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0));
            transform: skewX(-15deg);
            animation: shimmer 7s ease-in-out infinite;
            pointer-events: none;
            z-index: 2;
          }
          
          .curso-card:hover .shimmer-overlay {
            animation-duration: 2.8s;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
          }
          
          /* Responsive ajustes para Próximamente */
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
                gap: '12px',
                fontSize: '1.4rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                marginBottom: '16px'
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
                lineHeight: 1.6
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

          {/* Sección de próximos cursos */}
          <div
            className="proximamente-card"
            style={{
              background: theme === 'dark' ? '#0d0d0d' : '#ffffff',
              borderRadius: '24px',
              padding: '20px 18px',
              textAlign: 'center',
              border: theme === 'dark' ? '1px solid #222' : '1px solid rgba(209, 160, 42, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: '40px',
              marginBottom: '64px',
              maxWidth: '780px',
              marginLeft: 'auto',
              marginRight: 'auto'
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
                animationName: isVisible ? 'shimmer' : 'none',
                animationDuration: '7s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: '1.2s'
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '50%',
                  width: '64px',
                  height: '64px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)'
                }}
              >
                <Calendar size={28} color="#000" />
              </div>

              <h2
                className="proximamente-title"
                style={{
                  fontSize: '2.2rem',
                  fontWeight: '800',
                  color: '#fbbf24',
                  marginBottom: '12px',
                  textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
                }}
              >
                ¡Próximamente!
              </h2>

              <h3
                className="proximamente-subtitle"
                style={{
                  fontSize: '1.4rem',
                  fontWeight: '700',
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  marginBottom: '12px'
                }}
              >
                Peluquería: Cortes y Tintes
              </h3>

              <p
                className="proximamente-desc"
                style={{
                  fontSize: '1rem',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.85)',
                  maxWidth: '680px',
                  margin: '0 auto 20px',
                  lineHeight: 1.55
                }}
              >
                Domina las técnicas más innovadoras en cortes de cabello, colorimetría profesional y tendencias de la alta peluquería. 
                Un curso completo que te convertirá en el estilista que siempre soñaste ser.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '16px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                    borderRadius: '25px',
                    color: theme === 'dark' ? '#fff' : '#1f2937',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                >
                  <Sparkles size={20} color="#fbbf24" />
                  Técnicas Avanzadas
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                    borderRadius: '25px',
                    color: theme === 'dark' ? '#fff' : '#1f2937',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                >
                  <Palette size={20} color="#fbbf24" />
                  Colorimetría Profesional
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(251, 191, 36, 0.08)',
                    borderRadius: '25px',
                    color: theme === 'dark' ? '#fff' : '#1f2937',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}
                >
                  <Star size={20} color="#fbbf24" />
                  Certificado Profesional
                </div>
              </div>

              <Link
                to="/contacto"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#000',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '40px',
                  padding: '14px 28px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(-2px) scale(1.03)';
                  el.style.boxShadow = '0 14px 40px rgba(251, 191, 36, 0.45)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as unknown as HTMLElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.boxShadow = '0 12px 32px rgba(251, 191, 36, 0.4)';
                }}
              >
                <Calendar size={20} />
                Notificarme Cuando Esté Disponible
              </Link>

              <p
                style={{
                  fontSize: '0.85rem',
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.7)',
                  marginTop: '12px',
                  fontStyle: 'italic'
                }}
              >
                Sé el primero en enterarte cuando abramos las inscripciones
              </p>

            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Cursos;