import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Users,
  Award,
  Target,
  Eye,
  Clock,
  Star,
  Calendar,
  Trophy,
  Lightbulb,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import SpotlightCard from '../components/cards/SpotlightCard';
import LogoLoop from '../components/LogoLoop';
import { useTheme } from '../context/ThemeContext';

// Tipos para los datos
interface Valor {
  id: number;
  titulo: string;
  descripcion: string;
  icono: React.ReactNode;
  color: string;
}



interface HistoriaItem {
  año: string;
  evento: string;
  descripcion: string;
}

interface EquipoMiembro {
  nombre: string;
  cargo: string;
  especializacion: string;
  experiencia: string;
  descripcion: string;
  imagen: string;
}

interface Logro {
  numero: string;
  texto: string;
  icono: React.ReactElement;
}

interface Certificate {
  id: number;
  imageUrl: string;
  title: string;
}

const SobreNosotros: React.FC = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    AOS.init({ duration: 900, once: true, easing: 'ease-out-quart' });
  }, []);



  // Card shuffle on hover
  const [isHovering, setIsHovering] = useState(false);

  const valores: Valor[] = [
    {
      id: 1,
      titulo: 'Excelencia Educativa',
      descripcion: 'Comprometidos con la más alta calidad en formación profesional',
      icono: <Award size={20} />,
      color: '#fbbf24'
    },
    {
      id: 2,
      titulo: 'Innovación Constante',
      descripcion: 'Siempre a la vanguardia en técnicas y tecnologías de belleza',
      icono: <Lightbulb size={20} />,
      color: '#fbbf24'
    },
    {
      id: 3,
      titulo: 'Atención Personalizada',
      descripcion: 'Cada estudiante es único y merece atención individualizada',
      icono: <Heart size={20} />,
      color: '#fbbf24'
    },
    {
      id: 4,
      titulo: 'Compromiso Social',
      descripcion: 'Transformamos vidas y contribuimos al desarrollo de la comunidad',
      icono: <UserCheck size={20} />,
      color: '#fbbf24'
    }
  ];

  const historia: HistoriaItem[] = [
    {
      año: '2020',
      evento: 'Fundación de la Escuela',
      descripcion: 'Jessica Vélez crea la Escuela como un centro de capacitación en estética, con el propósito de formar profesionales íntegros, competentes y altamente capacitados.'
    },
    {
      año: '2021',
      evento: 'Crecimiento Académico',
      descripcion: 'Se amplían los programas formativos y se incorpora una metodología más práctica y personalizada para fortalecer el aprendizaje técnico.'
    },
    {
      año: '2022',
      evento: 'Modernización de Espacios',
      descripcion: 'La escuela renueva sus instalaciones con ambientes especializados diseñados exclusivamente para la formación en estética.'
    },
    {
      año: '2024',
      evento: 'Reconocimiento por la Comunidad Estudiantil',
      descripcion: 'La escuela alcanza un crecimiento significativo, consolidándose como una institución líder en capacitación estética dentro de la provincia.'
    },
    {
      año: '2025',
      evento: 'Apertura de un Nuevo Edificio',
      descripcion: 'Con el crecimiento de la demanda, la institución inaugura un segundo edificio destinado a nuevas aulas, laboratorios de práctica y espacios para cursos especializados.'
    },
    {
      año: '2026',
      evento: 'Proyección y Expansión',
      descripcion: 'La Escuela Jessica Vélez continúa su crecimiento, ampliando su oferta de cursos especializados y fortaleciendo su modelo educativo para nuevas generaciones de esteticistas.'
    }
  ];

  const equipo: EquipoMiembro[] = [
    {
      nombre: 'Jessica Vélez',
      cargo: 'Directora y Fundadora',
      especializacion: 'Cosmetología Avanzada',
      experiencia: '+10 años',
      descripcion: 'Pionera en la formación de esteticistas profesionales, con especialización en técnicas avanzadas de rejuvenecimiento facial',
      imagen: 'https://www.lahora.com.ec/__export/1753063265364/sites/lahora/img/2025/07/20/jexssica_vexlez.jpeg_1981115046.jpeg'
    }
  ];

  const logros: Logro[] = [
    { numero: '1,200+', texto: 'Estudiantes Graduadas', icono: <Users size={24} /> },
    { numero: '100%', texto: 'Tasa de Empleabilidad', icono: <Trophy size={24} /> },
    { numero: '6', texto: 'Años de Experiencia', icono: <Calendar size={24} /> },
    { numero: '3', texto: 'Certificaciones Oficiales', icono: <Award size={24} /> }
  ];

  const certificates: Certificate[] = [
    {
      id: 1,
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768761814/WhatsApp_Image_2026-01-14_at_10.04.31_AM_lmh4rp.jpg',
      title: 'Certificación Profesional en Estética'
    },
    {
      id: 2,
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768761825/WhatsApp_Image_2026-01-14_at_10.20.13_AM_zkjsl2.jpg',
      title: 'Reconocimiento Ministerial'
    },
    {
      id: 3,
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768764255/images_2_tuwcuw.jpg',
      title: 'Certificación en Cosmetología Avanzada'
    },
    {
      id: 4,
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768764251/images_1_yxxpy2.jpg',
      title: 'Diploma en Medicina Estética'
    },
    {
      id: 5,
      imageUrl: 'https://res.cloudinary.com/dq8lou9re/image/upload/v1768764253/images_i6klxs.jpg',
      title: 'Certificación Técnica Superior'
    }
  ];

  // Hover effect for card shuffle
  useEffect(() => {
    if (!isHovering) return;

    const interval = setInterval(() => {
      if (!isShuffling) {
        setIsShuffling(true);
        setTimeout(() => {
          setShuffleIndex((prev) => (prev + 1) % certificates.length);
          setIsShuffling(false);
        }, 600);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isHovering, isShuffling]);

  const historiaNodes = useMemo(() => historia.map((hito) => ({
    node: (
      <SpotlightCard spotlightColor="rgba(251, 191, 36, 0.2)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 280, maxWidth: 320 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: '0.7rem', flexShrink: 0 }}>
            {hito.año}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? '#f3f4f6' : '#1f2937', margin: 0, lineHeight: 1.2 }}>
              {hito.evento}
            </h3>
            <p style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563', fontSize: '0.7rem', lineHeight: 1.4, margin: '0.25rem 0 0 0' }}>
              {hito.descripcion}
            </p>
          </div>
        </div>
      </SpotlightCard>
    ),
    title: hito.evento,
  })), [theme]);

  const sectionStyle: React.CSSProperties = {
    marginBottom: '1.25rem'
  };

  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '1rem',
    textAlign: 'center'
  };

  const iconContainerStyle = (color: string, isHovered: boolean): React.CSSProperties => ({
    width: '34px',
    height: '34px',
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    margin: '0 auto 0.5rem',
    boxShadow: `0 8px 25px ${color}40`,
    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  const titleStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: theme === 'dark' ? '#fff' : '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: 1.2,
    minHeight: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const missionVisionGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '1.25rem',
    margin: '0 0 1.25rem',
    alignItems: 'stretch'
  };

  const ValueCard: React.FC<{ valor: Valor; index: number }> = ({ valor, index }) => {
    const isHovered = hoveredCard === valor.id;

    return (
      <div
        style={{
          height: '100%',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
          transitionDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredCard(valor.id)}
        onMouseLeave={() => setHoveredCard(null)}
        data-aos="fade-up"
        data-aos-delay={`${index * 100}`}
      >
        <SpotlightCard
          spotlightColor={`${valor.color}40`}
          className="custom-spotlight-card"
          style={{ height: '100%' }}
        >
          <div style={cardContentStyle}>
            <div style={iconContainerStyle(valor.color, isHovered)}>
              {valor.icono}
            </div>
            <h3 style={titleStyle}>
              {valor.titulo}
            </h3>
            <p style={paragraphStyle}>
              {valor.descripcion}
            </p>
          </div>
        </SpotlightCard>
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





          .carousel-track {
            display: flex;
            width: 600%; /* Espacio para imágenes duplicadas */
            height: 100%;
            transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .carousel-track.no-transition {
            transition: none;
          }

          .slide {
            width: 20%;
            height: 100%;
            position: relative;
            perspective: 1500px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .slide-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform-style: preserve-3d;
          }
          
          .slide:hover .slide-inner {
            transform: rotateY(180deg);
          }

          .slide-image {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }

          .slide-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            filter: brightness(0.9) contrast(1.05);
          }

          .slide-content {
  text-align: center;
  color: ${theme === 'dark' ? 'white' : '#1f2937'};
  padding: 1.25rem 1.5rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flexDirection: column;
  alignItems: center;
  justifyContent: center;
  background: ${theme === 'dark'
            ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(15, 15, 35, 0.75))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(248, 250, 252, 0.1))'};
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid ${theme === 'dark'
            ? 'rgba(251, 191, 36, 0.4)'
            : 'rgba(251, 191, 36, 0.25)'};
  box-shadow: ${theme === 'dark'
            ? '0 30px 80px rgba(0,0,0,0.8), 0 0 80px rgba(251,191,36,0.2) inset'
            : '0 30px 80px rgba(0,0,0,0.15), 0 0 1px rgba(255,255,255,0.8) inset'};
  transform: rotateY(180deg);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}


.slide-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: ${theme === 'dark'
            ? '0 6px 20px rgba(0,0,0,0.5)'
            : '0 2px 8px rgba(0,0,0,0.1)'};
  background: linear-gradient(135deg, #fbbf24, #f59e0b, #eab308);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Playfair Display', 'Georgia', serif;
  animation: shimmerText 3s ease-in-out infinite;
}

@keyframes shimmerText {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.slide-description {
  font-size: 0.85rem;
  opacity: 0.95;
  text-shadow: ${theme === 'dark'
            ? '0 3px 10px rgba(0,0,0,0.5)'
            : '0 1px 4px rgba(0,0,0,0.1)'};
  max-width: 520px;
  margin: 0 auto;
  font-family: 'Inter', 'Helvetica', sans-serif;
  line-height: 1.6;
  color: ${theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#4b5563'};
}

          .carousel-dots {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .dot.active {
            width: 28px;
            background-color: #fbbf24;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
          }

          .content {
            max-width: 90%;
            margin: 0 auto;
            padding: 0 0.75rem;
            position: relative;
            font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
          }

          /* RESPONSIVE PARA CARRUSEL */
          @media (max-width: 480px) {
            .carousel-container {
              height: 300px !important;
              margin: 0 10px;
            }

            .carousel-nav {
              padding: 12px !important;
              display: none;
            }

            .carousel-nav.left {
              left: 10px !important;
            }

            .carousel-nav.right {
              right: 10px !important;
            }

            .slide-title {
              font-size: 1.5rem !important;
              margin-bottom: 12px !important;
            }

            .slide-description {
              font-size: 1rem !important;
            }

            .slide-content {
              padding: 20px !important;
            }

            .carousel-dots {
              margin-top: 16px !important;
            }
          }

          @media (min-width: 481px) and (max-width: 768px) {
            .carousel-container {
              height: 350px !important;
            }

            .slide-title {
              font-size: 1.8rem !important;
            }

            .carousel-nav {
              padding: 14px !important;
            }
          }

          @media (min-width: 769px) and (max-width: 1024px) {
            .carousel-container {
              height: 400px !important;
            }

            .slide-title {
              font-size: 2.2rem !important;
            }
          }

          /* Touch gestures para móviles */
          @media (hover: none) and (pointer: coarse) {
            .carousel-nav {
              display: block;
              opacity: 0.8;
            }
            
            .carousel-container {
              touch-action: pan-x;
            }
          }

          /* Liderazgo: dos columnas responsivo */
          .liderazgo-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          
          
          .card-stack-container {
            position: relative;
            width: 100%;
            height: 280px;
            display: flex;
            align-items: center;
            justifyContent: center;
            cursor: pointer;
            perspective: 1000px;
          }
          
          .card-stack {
            position: relative;
            width: 85%;
            height: 240px;
            margin: 0 auto;
          }
          
          .shuffle-card {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 1rem;
            overflow: hidden;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: ${theme === 'dark' ? '0 10px 40px rgba(0, 0, 0, 0.6)' : '0 8px 30px rgba(0, 0, 0, 0.2)'};
            border: 1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(209, 160, 42, 0.3)'};
            background: ${theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.95)'};
          }
          
          .shuffle-card img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
          }
          
          .shuffle-card.shuffling {
            animation: shuffleOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          
          @keyframes shuffleOut {
            0% {
              transform: translateX(0) translateY(0) rotate(0deg) scale(1);
              opacity: 1;
              z-index: 10;
            }
            50% {
              transform: translateX(120%) translateY(-30px) rotate(15deg) scale(0.9);
              opacity: 0.5;
            }
            100% {
              transform: translateX(0) translateY(0) rotate(0deg) scale(1);
              opacity: 1;
              z-index: 1;
            }
          }
          
          .card-click-hint {
            position: absolute;
            bottom: -30px;
            left: 50%;
            transform: translateX(-50%);
            color: #fbbf24;
            font-size: 0.75rem;
            font-weight: 600;
            text-align: center;
            opacity: 0.8;
            animation: pulse 2s ease-in-out infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          
          @media (max-width: 768px) {
            .card-stack-container {
              height: 240px;
            }
            
            .card-stack {
              height: 200px;
            }
          }
          @media (max-width: 768px) {
            .liderazgo-grid {
              grid-template-columns: 1fr;
            }
            /* Stats en una columna en móvil */
            .about-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
            /* Misión y Visión en una columna en móvil */
            .mission-vision-grid {
              grid-template-columns: 1fr !important;
              gap: 16px !important;
            }
          }
          /* Grid por defecto (desktop) para Misión/Visión */
          .mission-vision-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: stretch;
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
              marginBottom: '0.75rem',
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
              Sobre Nosotros
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
              Transformamos vidas a través de la educación en belleza y estética,
              formando profesionales de excelencia con más de 5 años de experiencia
            </p>

            {/* Estadísticas destacadas */}
            <div
              className="about-stats-grid"
              style={{
                marginTop: '1rem',
                marginBottom: '1.25rem',
                gap: '0.75rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                alignItems: 'stretch'
              }}
              data-aos="fade-up"
              data-aos-delay="150"
            >
              {logros.map((logro, index) => (
                <div
                  key={index}
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))'
                      : 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1rem',
                    padding: '0.75rem 1rem',
                    border: theme === 'dark' ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(209, 160, 42, 0.25)',
                    textAlign: 'center',
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: `${index * 100 + 300}ms`,
                    boxShadow: theme === 'dark' ? '0 20px 40px rgba(0, 0, 0, 0.4)' : '0 10px 28px rgba(0,0,0,0.12)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'translateY(-3px)';
                    target.style.boxShadow = '0 22px 60px rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = '0 16px 50px rgba(0,0,0,0.4)';
                  }}
                  data-aos="zoom-in"
                  data-aos-delay={`${index * 100}`}
                >
                  <div style={{
                    color: '#fbbf24',
                    marginBottom: '0.25rem',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(logro.icono as React.ReactElement<any>, { size: 16 })}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                    marginBottom: '0.25rem',
                    textShadow: '0 6px 20px rgba(251, 191, 36, 0.5)'
                  }}>
                    {logro.numero}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                  }}>
                    {logro.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección Misión y Visión */}
          <div
            className="mission-vision-grid"
            style={{ ...missionVisionGridStyle, gridTemplateColumns: undefined }}
          >
            {/* Misión */}
            <div
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '800ms'
              }}
              data-aos="fade-right"
            >
              <div style={{ height: '100%' }}>
                <SpotlightCard spotlightColor="rgba(251, 191, 36, 0.2)" style={{ height: '100%', minHeight: '200px' }}>
                  <div style={cardContentStyle}>
                    <div style={iconContainerStyle('#f59e0b', false)}>
                      <Target size={16} color="#fff" />
                    </div>

                    <h2 style={{ ...titleStyle, fontSize: '0.95rem' }}>
                      Nuestra Misión
                    </h2>

                    <p style={paragraphStyle}>
                      Formar profesionales en el área de la estética y belleza,
                      brindando educación de calidad con tecnología de vanguardia,
                      contribuyendo al desarrollo personal y profesional de nuestras
                      estudiantes para que se conviertan en líderes transformadoras de la
                      industria.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </div>

            {/* Visión */}
            <div
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '900ms'
              }}
              data-aos="fade-left"
            >
              <div style={{ height: '100%' }}>
                <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)" style={{ height: '100%', minHeight: '200px' }}>
                  <div style={cardContentStyle}>
                    <div style={iconContainerStyle('#10b981', false)}>
                      <Eye size={16} color="#fff" />
                    </div>

                    <h2 style={{ ...titleStyle, fontSize: '0.95rem' }}>
                      Nuestra Visión
                    </h2>

                    <p style={paragraphStyle}>
                      Ser la institución líder en Ecuadoren formación de profesionales
                      en estética y belleza, reconocida por nuestra excelencia académica,
                      innovación tecnológica y compromiso social, expandiendo nuestro impacto
                      a nivel regional e internacional.
                    </p>
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </div>

          {/* Valores */}
          <div style={sectionStyle}>
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
              Nuestros Valores
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
              Los pilares fundamentales que guían nuestro trabajo diario
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                alignItems: 'stretch'
              }}
            >
              {valores.map((valor, index) => (
                <div key={valor.id} style={{ height: '100%' }}>
                  <ValueCard valor={valor} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Línea de tiempo */}
          <div style={{ ...sectionStyle, marginBottom: '1.25rem' }}>
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
              Nuestra Historia
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
              15 años de crecimiento y excelencia educativa
            </p>

            <div style={{ position: 'relative', padding: '4px 0' }}>
              <LogoLoop
                logos={historiaNodes}
                speed={50}
                direction="left"
                logoHeight={16}
                gap={20}
                pauseOnHover
                className="historia-loop"
                fadeOut={theme === 'dark'}
                fadeOutColor={theme === 'dark' ? '#161616' : undefined}
                ariaLabel="Historia SGA Belleza"
              />
            </div>
          </div>

          {/* Equipo directivo */}
          <div style={{ ...sectionStyle, marginTop: '0px', marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Nuestro Liderazgo
            </h2>

            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {equipo.map((miembro, index) => (
                <div
                  key={index}
                  style={{
                    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '1500ms'
                  }}
                  data-aos="zoom-in"
                >
                  <SpotlightCard spotlightColor="rgba(251, 191, 36, 0.2)">
                    <div className="liderazgo-grid">
                      {/* Columna izquierda: Información del liderazgo */}
                      <div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                          <img
                            src={miembro.imagen}
                            alt={miembro.nombre}
                            style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '1rem',
                              objectFit: 'cover',
                              boxShadow: '0 8px 18px rgba(251, 191, 36, 0.15)'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                  color: '#000',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '1rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600'
                                }}
                              >
                                {miembro.cargo}
                              </span>
                              <span
                                style={{
                                  display: 'inline-block',
                                  background: 'rgba(251, 191, 36, 0.15)',
                                  color: '#fbbf24',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '0.75rem',
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  border: '1px solid rgba(251, 191, 36, 0.35)'
                                }}
                              >
                                {miembro.experiencia}
                              </span>
                            </div>
                          </div>
                        </div>

                        <h3
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '800',
                            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                            marginBottom: '0.5rem'
                          }}
                        >
                          {miembro.nombre}
                        </h3>

                        <p
                          style={{
                            color: '#fbbf24',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginBottom: '0.75rem'
                          }}
                        >
                          {miembro.especializacion}
                        </p>

                        <p
                          style={{
                            color: theme === 'dark' ? '#d1d5db' : '#4b5563',
                            fontSize: '0.85rem',
                            lineHeight: 1.6,
                            margin: 0
                          }}
                        >
                          {miembro.descripcion}
                        </p>
                      </div>

                      {/* Columna derecha: Card Shuffle de certificados */}
                      <div>
                        <h4 style={{
                          color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                          fontSize: '0.95rem',
                          fontWeight: '700',
                          marginBottom: '0.75rem',
                          textAlign: 'center'
                        }}>
                          Certificaciones y Reconocimientos
                        </h4>

                        <div
                          className="card-stack-container"
                          onMouseEnter={() => setIsHovering(true)}
                          onMouseLeave={() => setIsHovering(false)}
                        >
                          <div className="card-stack">
                            {certificates.map((cert, index) => {
                              const position = (index - shuffleIndex + certificates.length) % certificates.length;
                              const isTop = position === 0;

                              return (
                                <div
                                  key={cert.id}
                                  className={`shuffle-card ${isShuffling && isTop ? 'shuffling' : ''}`}
                                  style={{
                                    zIndex: certificates.length - position,
                                    transform: `translateY(${position * -4}px) translateX(${position * 2}px) scale(${1 - position * 0.02})`,
                                    opacity: position > 2 ? 0 : 1 - position * 0.15
                                  }}
                                >
                                  <img src={cert.imageUrl} alt={cert.title} />
                                </div>
                              );
                            })}
                          </div>
                          <div className="card-click-hint">
                            Pasa el mouse para barajar
                          </div>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>


        </div>

        <Footer />
      </div>
    </>
  );
}

export default SobreNosotros;