import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Users, 
  Award, 
  Target,
  Eye,
  Sparkles,
  Clock,
  MapPin,
  Star,
  Calendar,
  Trophy,
  Lightbulb,
  UserCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Footer from '../components/Footer';

const SobreNosotros = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Imágenes del carrusel de instalaciones - EXACTAMENTE IGUAL que en Inicio.js
  const carouselImages = [
    {
      id: 1,
      title: "Tratamientos Faciales de Lujo",
      description: "Tecnología de vanguardia para el cuidado facial profesional",
      imageUrl: "https://www.lahora.com.ec/__export/1753063265364/sites/lahora/img/2025/07/20/jexssica_vexlez.jpeg_1981115046.jpeg",
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
      imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1559599238-1c04a77c2c9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      gradient: "linear-gradient(135deg, rgba(250, 112, 154, 0.8) 0%, rgba(254, 225, 64, 0.8) 100%)",
    }
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Auto-scroll del carrusel cada 4 segundos - IGUAL que en Inicio.js
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const valores = [
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

  const historia = [
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

  const equipo = [
    {
      nombre: 'Jessica Vélez',
      cargo: 'Directora y Fundadora',
      especializacion: 'Cosmetología Avanzada y Medicina Estética',
      experiencia: '15+ años',
      descripcion: 'Pionera en la formación de esteticistas profesionales, con especialización en técnicas avanzadas de rejuvenecimiento facial',
      imagen: 'https://www.lahora.com.ec/__export/1753063265364/sites/lahora/img/2025/07/20/jexssica_vexlez.jpeg_1981115046.jpeg'
    }
  ];

  const logros = [
    { numero: '1,200+', texto: 'Estudiantes Graduadas', icono: <Users size={24} /> },
    { numero: '98%', texto: 'Tasa de Empleabilidad', icono: <Trophy size={24} /> },
    { numero: '15', texto: 'Años de Experiencia', icono: <Calendar size={24} /> },
    { numero: '4', texto: 'Certificaciones Oficiales', icono: <Award size={24} /> }
  ];

  const ValueCard = ({ valor, index }) => {
    const isHovered = hoveredCard === valor.id;

    return (
      <div
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1)`,
          transitionDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredCard(valor.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: isHovered 
              ? `0 25px 50px ${valor.color}30, 0 0 0 1px ${valor.color}40`
              : '0 15px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: `linear-gradient(135deg, ${valor.color}, ${valor.color}dd)`,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 24px',
              boxShadow: `0 8px 25px ${valor.color}40`,
              transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {valor.icono}
          </div>
          
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginBottom: '16px',
              lineHeight: 1.2
            }}
          >
            {valor.titulo}
          </h3>
          
          <p
            style={{
              fontSize: '1rem',
              color: '#666',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            {valor.descripcion}
          </p>
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

          /* ESTILOS DEL CARRUSEL - EXACTAMENTE IGUALES QUE INICIO.JS */
          .carousel-section {
            padding: 0px 0 5px 0; // Reducido aún más
            position: relative;
          }

          .section-title {
            font-size: 2.8rem;
            font-weight: 700;
            color: white;
            margin-bottom: 15px; // Reducido de 20px
            text-align: center;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            font-family: 'Playfair Display', 'Georgia', serif;
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
            width: 500%;
            height: 100%;
            transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .slide {
            width: 20%;
            height: 100%;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .slide-image {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
          }

          .slide-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            filter: brightness(0.7) contrast(1.1);
          }

          .slide-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 2;
          }

          .slide-content {
            text-align: center;
            color: white;
            z-index: 3;
            padding: 32px;
            position: relative;
            transform: scale(1);
            transition: transform 0.5s ease-in-out;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .slide-title {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 16px;
            text-shadow: 0 6px 20px rgba(0,0,0,0.5);
            background: linear-gradient(45deg, #fff, #fbbf24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-family: 'Playfair Display', 'Georgia', serif;
          }

          .slide-description {
            font-size: 1.2rem;
            opacity: 0.95;
            text-shadow: 0 3px 10px rgba(0,0,0,0.5);
            max-width: 480px;
            margin: 0 auto;
            font-family: 'Inter', 'Helvetica', sans-serif;
          }

          .carousel-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.7);
            border: 2px solid rgba(251, 191, 36, 0.3);
            color: #fbbf24;
            padding: 16px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 10;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
          }

          .carousel-nav:hover {
            background-color: rgba(251, 191, 36, 0.2);
            border-color: rgba(251, 191, 36, 0.6);
            transform: translateY(-50%) scale(1.1);
          }

          .carousel-nav.left {
            left: 20px;
          }

          .carousel-nav.right {
            right: 20px;
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
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '100px', // Reducido de 110px
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
              marginBottom: '30px', // Reducido de 50px
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
              <Heart size={20} color="#fbbf24" />
              <span style={{ 
                color: '#fde68a', 
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px'
              }}>
                NUESTRA HISTORIA Y VALORES
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
                color: 'rgba(255, 255, 255, 0.8)',
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
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '24px',
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {logros.map((logro, index) => (
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
                    {logro.icono}
                  </div>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '4px'
                  }}>
                    {logro.numero}
                  </div>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    {logro.texto}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARRUSEL DE INSTALACIONES - EXACTAMENTE IGUAL QUE INICIO.JS */}
          <section className="carousel-section">
            <div className="content">
              <h2 className="section-title" style={{ textAlign: 'center' }}>
                Conoce Nuestras 
                <span className="gradient-text"> Instalaciones</span>
              </h2>
              
              <div className="carousel-container">
                <div className="carousel-track" style={{
                  transform: `translateX(-${currentSlide * (100 / carouselImages.length)}%)`
                }}>
                  {carouselImages.map((image, index) => (
                    <div key={image.id} className="slide">
                      {/* Imagen de fondo */}
                      <div className="slide-image">
                        <img src={image.imageUrl} alt={image.title} />
                      </div>
                      
                      {/* Overlay con gradiente */}
                      <div className="slide-overlay" style={{ background: image.gradient }} />
                      
                      {/* Contenido */}
                      <div className="slide-content">
                        <h3 className="slide-title">{image.title}</h3>
                        <p className="slide-description">{image.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Navegación */}
                <button className="carousel-nav left" onClick={prevSlide}>
                  <ChevronLeft size={20} />
                </button>
                <button className="carousel-nav right" onClick={nextSlide}>
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Indicadores */}
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

          {/* Sección Misión y Visión */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              marginBottom: '30px', // Reducido de 50px
              marginTop: '20px' // Reducido de 25px
            }}
          >
            {/* Misión */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '40px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '800ms'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)'
                }}
              >
                <Target size={36} color="#fff" />
              </div>
              
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '20px'
                }}
              >
                Nuestra Misión
              </h2>
              
              <p
                style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: 1.7,
                  margin: 0
                }}
              >
                Formar profesionales integrales en el área de la estética y belleza, 
                brindando educación de calidad con tecnología de vanguardia, 
                contribuyendo al desarrollo personal y profesional de nuestras 
                estudiantes para que se conviertan en líderes transformadoras de la 
                industria.
              </p>
            </div>

            {/* Visión */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '40px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '900ms'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                }}
              >
                <Eye size={36} color="#fff" />
              </div>
              
              <h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '20px'
                }}
              >
                Nuestra Visión
              </h2>
              
              <p
                style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  lineHeight: 1.7,
                  margin: 0
                }}
              >
                Ser la institución líder en Ecuador en formación de profesionales 
                en estética y belleza, reconocida por nuestra excelencia académica, 
                innovación tecnológica y compromiso social, expandiendo nuestro impacto 
                a nivel regional e internacional.
              </p>
            </div>
          </div>

          {/* Valores */}
          <div style={{ marginBottom: '30px' }}> {/* Reducido de 50px */}
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
              Nuestros Valores
            </h2>
            
            <p
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
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
                gap: '32px'
              }}
            >
              {valores.map((valor, index) => (
                <ValueCard key={valor.id} valor={valor} index={index} />
              ))}
            </div>
          </div>

          {/* Línea de tiempo */}
          <div style={{ marginBottom: '30px' }}> {/* Reducido de 50px */}
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
              Nuestra Historia
            </h2>
            
            <p
              style={{
                textAlign: 'center',
                fontSize: '1.2rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '25px', // Reducido de 40px
                maxWidth: '600px',
                margin: '0 auto 25px'
              }}
            >
              15 años de crecimiento y excelencia educativa
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
              }}
            >
              {historia.map((hito, index) => (
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
                      right: 16,
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '700',
                      fontSize: '1rem'
                    }}
                  >
                    {hito.año}
                  </div>
                  
                  <div style={{ paddingRight: '80px' }}>
                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        marginBottom: '12px',
                        lineHeight: 1.3
                      }}
                    >
                      {hito.evento}
                    </h3>
                    
                    <p
                      style={{
                        color: '#666',
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {hito.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipo directivo */}
          <div style={{ marginBottom: '30px' }}> {/* Reducido de 50px */}
            <h2
              style={{
                fontSize: '2.8rem',
                fontWeight: '700',
                textAlign: 'center',
                color: '#fff',
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
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '32px',
                    padding: '40px',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(251, 191, 36, 0.3)',
                    boxShadow: '0 25px 50px rgba(251, 191, 36, 0.2)',
                    transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '1500ms',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '40px'
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={miembro.imagen}
                      alt={miembro.nombre}
                      style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '20px',
                        objectFit: 'cover',
                        boxShadow: '0 15px 35px rgba(251, 191, 36, 0.3)'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        right: 12,
                        background: 'rgba(251, 191, 36, 0.9)',
                        borderRadius: '12px',
                        padding: '8px',
                        textAlign: 'center'
                      }}
                    >
                      <div
                        style={{
                          color: '#000',
                          fontWeight: '700',
                          fontSize: '0.9rem'
                        }}
                      >
                        {miembro.experiencia}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: '#1a1a1a',
                        marginBottom: '8px'
                      }}
                    >
                      {miembro.nombre}
                    </h3>

                    <div
                      style={{
                        display: 'inline-block',
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: '#000',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '16px'
                      }}
                    >
                      {miembro.cargo}
                    </div>

                    <p
                      style={{
                        color: '#666',
                        fontSize: '1rem',
                        fontWeight: '600',
                        marginBottom: '16px'
                      }}
                    >
                      {miembro.especializacion}
                    </p>

                    <p
                      style={{
                        color: '#555',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        margin: 0
                      }}
                    >
                      {miembro.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Llamada a la acción final */}
          <div
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              backdropFilter: 'blur(20px)',
              borderRadius: '32px',
              padding: '40px 35px', // Reducido más el padding
              textAlign: 'center',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '1800ms',
              marginBottom: '25px' // Reducido de 40px
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
              <Heart size={36} color="#000" />
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
              ¿Lista para Ser Parte de Nuestra Historia?
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
              Únete a más de 1,200 profesionales exitosas que han transformado sus vidas 
              con nosotras. Tu futuro en la belleza comienza aquí.
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
                Explorar Cursos
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
                Contáctanos
              </a>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default SobreNosotros;