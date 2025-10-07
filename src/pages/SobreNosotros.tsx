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

interface CarouselImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  gradient: string;
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
  icono: React.ReactNode;
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [currentCertSlide, setCurrentCertSlide] = useState(0);
  // Imágenes del carrusel de instalaciones - EXACTAMENTE IGUAL que en Inicio.js
  const carouselImages: CarouselImage[] = [
    {
      id: 1,
      title: "Tratamientos Faciales de Lujo",
      description: "Tecnología de vanguardia para el cuidado facial profesional",
      imageUrl: "https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846500/DSC00126_oute0e.jpg",
      gradient: "linear-gradient(135deg, rgba(18, 19, 19, 0.8) 0%, rgba(212, 199, 225, 0.8) 100%)",
    },
    {
      id: 2,
      title: "Depilación Láser Premium",
      description: "Equipos de última generación para resultados perfectos",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(240, 147, 251, 0.8) 0%, rgba(245, 87, 108, 0.8) 100%)",
    },
    {
      id: 3,
      title: "Microblading Especializado",
      description: "Técnicas avanzadas en micropigmentación de cejas",
      imageUrl: "https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846500/DSC00311_fkcmay.jpg",
      gradient: "linear-gradient(135deg, rgba(79, 172, 254, 0.8) 0%, rgba(0, 242, 254, 0.8) 100%)",
    },
    {
      id: 4,
      title: "Instalaciones Modernas",
      description: "Ambiente profesional con la mejor tecnología",
      imageUrl: "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(67, 233, 123, 0.8) 0%, rgba(56, 249, 215, 0.8) 100%)",
    },
    {
      id: 5,
      title: "Práctica Profesional",
      description: "Aprendizaje hands-on con casos reales",
      imageUrl: "https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846500/DSC00505_p2d798.jpg",
      gradient: "linear-gradient(135deg, rgba(250, 112, 154, 0.8) 0%, rgba(254, 225, 64, 0.8) 100%)",
    }
  ];
  useEffect(() => {
    setIsVisible(true);
    AOS.init({ duration: 900, once: true, easing: 'ease-out-quart' });
  }, []);

  // Auto-scroll del carrusel infinito cada 4 segundos
  useEffect(() => {
    if (isCarouselPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Reset cuando llega al final (después de mostrar la imagen duplicada)
  useEffect(() => {
    if (currentSlide === carouselImages.length) {
      const timeout = setTimeout(() => {
        setCurrentSlide(0);
      }, 1000); // Espera a que termine la transición
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, carouselImages.length]);

  // Auto-scroll del carrusel de certificados cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCertSlide((prev) => (prev + 1) % certificates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const valores: Valor[] = [
    {
      id: 1,
      titulo: 'Excelencia Educativa',
      descripcion: 'Comprometidos con la más alta calidad en formación profesional',
      icono: <Award size={32} />,
      color: '#fbbf24'
    },
    {
      id: 2,
      titulo: 'Innovación Constante',
      descripcion: 'Siempre a la vanguardia en técnicas y tecnologías de belleza',
      icono: <Lightbulb size={32} />,
      color: '#10b981'
    },
    {
      id: 3,
      titulo: 'Atención Personalizada',
      descripcion: 'Cada estudiante es único y merece atención individualizada',
      icono: <Heart size={32} />,
      color: '#ef4444'
    },
    {
      id: 4,
      titulo: 'Compromiso Social',
      descripcion: 'Transformamos vidas y contribuimos al desarrollo de la comunidad',
      icono: <UserCheck size={32} />,
      color: '#8b5cf6'
    }
  ];

  const historia: HistoriaItem[] = [
    {
      año: '2010',
      evento: 'Fundación de la Escuela',
      descripcion: 'Jessica Vélez funda la escuela con una visión clara: formar profesionales de excelencia en estética'
    },
    {
      año: '2015',
      evento: 'Expansión de Instalaciones',
      descripcion: 'Ampliación de las instalaciones con tecnología de última generación y nuevos laboratorios'
    },
    {
      año: '2018',
      evento: 'Certificación Ministerial',
      descripcion: 'Obtención del reconocimiento oficial del Ministerio del Trabajo del Ecuador'
    },
    {
      año: '2020',
      evento: 'Modalidad Virtual',
      descripcion: 'Implementación de plataforma virtual manteniendo la calidad educativa'
    },
    {
      año: '2023',
      evento: 'Aval SENESCYT',
      descripcion: 'Reconocimiento como institución de educación técnica superior'
    },
    {
      año: '2024',
      evento: 'Más de 1000 Egresadas',
      descripcion: 'Celebramos más de 1000 profesionales graduadas transformando el sector'
    }
  ];

  const equipo: EquipoMiembro[] = [
    {
      nombre: 'Jessica Vélez',
      cargo: 'Directora y Fundadora',
      especializacion: 'Cosmetología Avanzada y Medicina Estética',
      experiencia: '15+ años',
      descripcion: 'Pionera en la formación de esteticistas profesionales, con especialización en técnicas avanzadas de rejuvenecimiento facial',
      imagen: 'https://www.lahora.com.ec/__export/1753063265364/sites/lahora/img/2025/07/20/jexssica_vexlez.jpeg_1981115046.jpeg'
    }
  ];

  const logros: Logro[] = [
    { numero: '1,200+', texto: 'Estudiantes Graduadas', icono: <Users size={24} /> },
    { numero: '98%', texto: 'Tasa de Empleabilidad', icono: <Trophy size={24} /> },
    { numero: '15', texto: 'Años de Experiencia', icono: <Calendar size={24} /> },
    { numero: '4', texto: 'Certificaciones Oficiales', icono: <Award size={24} /> }
  ];

  const certificates: Certificate[] = [
    {
      id: 1,
      imageUrl: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1757103322/36946ae7-49b0-4961-b04d-1e91a6caba02.png',
      title: 'Certificación en Cosmetología Avanzada'
    },
    {
      id: 2,
      imageUrl: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1757103322/36946ae7-49b0-4961-b04d-1e91a6caba02.png',
      title: 'Diploma en Medicina Estética'
    },
    {
      id: 3,
      imageUrl: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1757103322/36946ae7-49b0-4961-b04d-1e91a6caba02.png',
      title: 'Reconocimiento Ministerial'
    }
  ];

  const historiaNodes = useMemo(() => historia.map((hito) => ({
    node: (
      <SpotlightCard spotlightColor="rgba(251, 191, 36, 0.2)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 420 }}>
          <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
            {hito.año}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: theme === 'dark' ? '#f3f4f6' : '#1f2937', margin: 0, lineHeight: 1.3 }}>
              {hito.evento}
            </h3>
            <p style={{ color: theme === 'dark' ? '#cbd5e1' : '#4b5563', fontSize: '0.95rem', lineHeight: 1.6, margin: '6px 0 0 0' }}>
              {hito.descripcion}
            </p>
          </div>
        </div>
      </SpotlightCard>
    ),
    title: hito.evento,
  })), [theme]);

  const sectionStyle: React.CSSProperties = {
    marginBottom: '80px'
  };

  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '20px',
    textAlign: 'center'
  };

  const iconContainerStyle = (color: string, isHovered: boolean): React.CSSProperties => ({
    width: '70px',
    height: '70px',
    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    margin: '0 auto 16px',
    boxShadow: `0 8px 25px ${color}40`,
    transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
  });

  const titleStyle: React.CSSProperties = {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
    marginBottom: '12px',
    lineHeight: 1.2,
    minHeight: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    color: theme === 'dark' ? '#cbd5e1' : '#4b5563',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const missionVisionGridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '30px',
    margin: '20px 0 80px',
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

          /* ESTILOS DEL CARRUSEL - EXACTAMENTE IGUALES QUE INICIO.JS */
          .carousel-section {
            padding: 0 0 24px 0; // Reducido para menor separación
            position: relative;
          }

          .section-title {
            font-size: 2.8rem;
            font-weight: 700;
            color: ${theme === 'dark' ? 'white' : '#1f2937'};
            margin-bottom: 15px; // Reducido de 20px
            text-align: center;
            text-shadow: ${theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 2px 10px rgba(0, 0, 0, 0.1)'};
            font-family: 'Montserrat', sans-serif;
            letter-spacing: -0.01em;
          }

          .carousel-container {
            position: relative;
            width: 100%;
            height: 450px;
            margin: 0 auto;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
            border: 1px solid rgba(251, 191, 36, 0.2);
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
  padding: 32px 40px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
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
  font-size: 1.2rem;
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
            gap: 12px;
            margin-top: 15px; // Reducido de 20px
          }

          .dot {
            width: 12px;
            height: 12px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .dot.active {
            width: 40px;
            background-color: #fbbf24;
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
          }

          .content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 24px;
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
          
          .cert-carousel-container {
            position: relative;
            width: 100%;
            height: 320px;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.25)' : 'rgba(209, 160, 42, 0.3)'};
            box-shadow: ${theme === 'dark' ? '0 20px 50px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.15)'};
            background: ${theme === 'dark' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.9)'};
            backdrop-filter: blur(6px);
          }
          
          .cert-carousel-track {
            display: flex;
            height: 100%;
            transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .cert-slide {
            flex: 0 0 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 20px;
          }
          
          .cert-slide img {
            max-width: 85%;
            max-height: 70%;
            object-fit: contain;
            filter: ${theme === 'dark' ? 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))' : 'drop-shadow(0 5px 15px rgba(0,0,0,0.2))'};
            border-radius: 12px;
            margin-bottom: 16px;
          }
          
          .cert-title {
            color: #fbbf24;
            font-size: 1.1rem;
            font-weight: 600;
            text-align: center;
            text-shadow: ${theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.2)'};
          }
          
          .cert-dots {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 16px;
          }
          
          .cert-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255,255,255,0.4);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .cert-dot.active {
            width: 28px;
            border-radius: 8px;
            background: #fbbf24;
            box-shadow: 0 0 16px rgba(251, 191, 36, 0.6);
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
          paddingTop: '100px', // Reducido de 110px
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
              marginBottom: '30px', // Reducido de 50px
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            data-aos="fade-up"
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
              <Heart size={20} color="#fbbf24" />
              <span style={{
                color: '#fde68a',
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px'
              }}>
                Nuestra historia y valores
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
              Sobre Nosotros
            </h1>

            <p
              style={{
                fontSize: '1.4rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                maxWidth: '800px',
                margin: '0 auto 32px',
                lineHeight: 1.6
              }}
            >
              Transformamos vidas a través de la educación en belleza y estética,
              formando profesionales de excelencia con más de 15 años de experiencia
            </p>

            {/* Estadísticas destacadas */}
            <div
              className="about-stats-grid"
              style={{
                marginTop: '32px',
                marginBottom: '56px',
                gap: '28px',
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
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(25px)',
                    borderRadius: '20px',
                    padding: '28px 32px',
                    border: `1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(209, 160, 42, 0.4)'}`,
                    textAlign: 'center',
                    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: `${index * 100 + 300}ms`,
                    boxShadow: theme === 'dark' ? '0 16px 50px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.1)'
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
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {logro.icono}
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 600,
                    color: '#fbbf24',
                    marginBottom: '6px',
                    textShadow: '0 6px 20px rgba(251, 191, 36, 0.5)'
                  }}>
                    {logro.numero}
                  </div>
                  <div style={{
                    fontSize: '0.95rem',
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
                <SpotlightCard spotlightColor="rgba(251, 191, 36, 0.2)" style={{ height: '100%', minHeight: '280px' }}>
                  <div style={cardContentStyle}>
                    <div style={iconContainerStyle('#f59e0b', false)}>
                      <Target size={36} color="#fff" />
                    </div>

                    <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>
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
                <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)" style={{ height: '100%', minHeight: '280px' }}>
                  <div style={cardContentStyle}>
                    <div style={iconContainerStyle('#10b981', false)}>
                      <Eye size={36} color="#fff" />
                    </div>

                    <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>
                      Nuestra Visión
                    </h2>

                    <p style={paragraphStyle}>
                      Ser la institución líder en Ecuador en formación de profesionales
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
                fontSize: '2.8rem',
                fontWeight: '700',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                marginBottom: '16px',
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
                fontSize: '1.2rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                marginBottom: '25px', // Reducido de 40px
                maxWidth: '600px',
                margin: '0 auto 25px'
              }}
            >
              Los pilares fundamentales que guían nuestro trabajo diario
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '32px',
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
          <div style={{ ...sectionStyle, marginBottom: '80px' }}> {/* Acerca el carrusel */}
            <h2
              style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                marginBottom: '16px',
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
                fontSize: '1.2rem',
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                marginBottom: '25px', // Reducido de 40px
                maxWidth: '600px',
                margin: '0 auto 25px'
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
          <div style={{ ...sectionStyle, marginTop: '0px', marginBottom: '80px' }}>
            <h2
              style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                textAlign: 'center',
                color: theme === 'dark' ? '#fff' : '#1f2937',
                marginBottom: '25px', // Reducido de 40px
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
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
                          <img
                            src={miembro.imagen}
                            alt={miembro.nombre}
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '20px',
                              objectFit: 'cover',
                              boxShadow: '0 8px 18px rgba(251, 191, 36, 0.15)'
                            }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '12px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                  color: '#000',
                                  padding: '6px 12px',
                                  borderRadius: '16px',
                                  fontSize: '0.85rem',
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
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '0.8rem',
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
                            fontSize: '2.2rem',
                            fontWeight: '800',
                            color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                            marginBottom: '12px'
                          }}
                        >
                          {miembro.nombre}
                        </h3>

                        <p
                          style={{
                            color: '#fbbf24',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '16px'
                          }}
                        >
                          {miembro.especializacion}
                        </p>

                        <p
                          style={{
                            color: theme === 'dark' ? '#cbd5e1' : '#4b5563',
                            fontSize: '1rem',
                            lineHeight: 1.6,
                            margin: 0
                          }}
                        >
                          {miembro.descripcion}
                        </p>
                      </div>

                      {/* Columna derecha: Carrusel de certificados */}
                      <div>
                        <h4 style={{
                          color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
                          fontSize: '1.3rem',
                          fontWeight: '700',
                          marginBottom: '16px',
                          textAlign: 'center'
                        }}>
                          Certificaciones y Reconocimientos
                        </h4>

                        <div className="cert-carousel-container">
                          <div
                            className="cert-carousel-track"
                            style={{
                              width: `${certificates.length * 100}%`,
                              transform: `translateX(-${currentCertSlide * (100 / certificates.length)}%)`
                            }}
                          >
                            {certificates.map((cert) => (
                              <div key={cert.id} className="cert-slide">
                                <img src={cert.imageUrl} alt={cert.title} />
                                <div className="cert-title">{cert.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="cert-dots">
                          {certificates.map((_, i) => (
                            <div
                              key={i}
                              className={`cert-dot ${i === currentCertSlide ? 'active' : ''}`}
                              onClick={() => setCurrentCertSlide(i)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>

          {/* CARRUSEL MOVIDO AL FINAL */}
          <section className="carousel-section" data-aos="fade-up" style={{ scrollMarginTop: '16px', marginBottom: '80px' }}>
            <div className="content">
              <h2 className="section-title" style={{ textAlign: 'center' }}>
                Conoce Nuestras
                <span className="gradient-text"> Instalaciones</span>
              </h2>

              <div className="carousel-container">
                <div
                  className={`carousel-track ${currentSlide === 0 && currentSlide !== carouselImages.length ? 'no-transition' : ''}`}
                  style={{
                    transform: `translateX(-${currentSlide * (100 / (carouselImages.length + 1))}%)`
                  }}
                >
                  {[...carouselImages, carouselImages[0]].map((image, index) => (
                    <div
                      key={`${image.id}-${index}`}
                      className="slide"
                      style={{ width: `${100 / (carouselImages.length + 1)}%`, flex: `0 0 ${100 / (carouselImages.length + 1)}%` }}
                      onMouseEnter={() => setIsCarouselPaused(true)}
                      onMouseLeave={() => setIsCarouselPaused(false)}
                    >
                      <div className="slide-inner">
                        {/* Imagen de fondo - Frente */}
                        <div className="slide-image">
                          <img src={image.imageUrl} alt={image.title} />
                        </div>

                        {/* Contenido - Parte trasera del flip */}
                        <div className="slide-content">
                          <h3 className="slide-title">{image.title}</h3>
                          <p className="slide-description">{image.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="carousel-dots">
                {carouselImages.map((_, index) => (
                  <div
                    key={index}
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
}

export default SobreNosotros;