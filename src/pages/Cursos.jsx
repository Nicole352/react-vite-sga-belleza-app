import React, { useState, useEffect } from 'react';
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

const cursosData = [
  {
    id: 1,
    titulo: 'Cosmetología',
    descripcion: 'Aprende técnicas profesionales de limpieza, hidratación y rejuvenecimiento facial para transformar la piel de tus clientes.',
    imagen: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso?curso=cosmetologia',
    duracion: '6 meses',
    estudiantes: 850,
    rating: 4.9,
    icon: <Eye size={24} />,
    color: '#ff6b6b',
    categoria: 'Facial'
  },
  {
    id: 2,
    titulo: 'Cosmiatría',
    descripcion: 'Especialízate en tratamientos estéticos avanzados y equipos de última tecnología para el cuidado profesional de la piel.',
    imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso',
    duracion: '8 meses',
    estudiantes: 620,
    rating: 4.8,
    icon: <Award size={24} />,
    color: '#4ecdc4',
    categoria: 'Avanzado'
  },
  {
    id: 3,
    titulo: 'Maquillaje Profesional',
    descripcion: 'Domina el arte del maquillaje social, artístico y de alta costura con técnicas profesionales y productos premium.',
    imagen: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso',
    duracion: '4 meses',
    estudiantes: 1200,
    rating: 4.9,
    icon: <Palette size={24} />,
    color: '#ff9f43',
    categoria: 'Artístico'
  },
  {
    id: 4,
    titulo: 'Lashista Profesional',
    descripcion: 'Conviértete en experta en extensiones de pestañas, lifting de pestañas y todas las técnicas de embellecimiento de mirada.',
    imagen: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso',
    duracion: '3 meses',
    estudiantes: 950,
    rating: 4.8,
    icon: <Eye size={24} />,
    color: '#a55eea',
    categoria: 'Especializado'
  },
  {
    id: 5,
    titulo: 'Técnico en Uñas',
    descripcion: 'Perfecciona el arte de la manicura, esmaltado semipermanente, acrílicas, gel y las últimas tendencias en nail art.',
    imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso',
    duracion: '5 meses',
    estudiantes: 1100,
    rating: 4.7,
    icon: <Hand size={24} />,
    color: '#fd79a8',
    categoria: 'Manual'
  },
  {
    id: 6,
    titulo: 'Belleza Integral',
    descripcion: 'Curso completo que abarca todas las áreas de la belleza: facial, corporal, uñas y maquillaje en un programa integral.',
    imagen: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80',
    enlace: '/detalle-curso',
    duracion: '12 meses',
    estudiantes: 780,
    rating: 5.0,
    icon: <Heart size={24} />,
    color: '#00b894',
    categoria: 'Completo',
    certificacion: 'Certificado Profesional'
  }
];

const Cursos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const AnimatedCard = ({ curso, index }) => {
    const isHovered = hoveredCard === curso.id;

    return (
      <div
        style={{
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
          opacity: isVisible ? 1 : 0,
          transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
          transitionDelay: `${index * 150}ms`
        }}
        onMouseEnter={() => setHoveredCard(curso.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '24px',
            boxShadow: isHovered 
              ? `0 25px 50px rgba(251, 191, 36, 0.3), 0 0 0 1px ${curso.color}20`
              : '0 15px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
            position: 'relative',
            height: '100%',
            backdropFilter: 'blur(20px)'
          }}
        >
          {/* Badge de categoría */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: curso.color,
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: '600',
              zIndex: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            {curso.categoria}
          </div>

          {/* Imagen con overlay */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img 
              src={curso.imagen} 
              alt={curso.titulo} 
              style={{
                width: '100%',
                height: '220px',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '100px',
                background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '20px'
              }}
            >
              <div
                style={{
                  background: curso.color,
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  transform: isHovered ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {curso.icon}
              </div>
            </div>
          </div>

          {/* Contenido de la tarjeta */}
          <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '12px',
                lineHeight: 1.2
              }}
            >
              {curso.titulo}
            </h3>

            <p
              style={{
                fontSize: '1rem',
                color: '#666',
                marginBottom: '20px',
                flex: 1,
                lineHeight: 1.6
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
                marginBottom: '24px',
                padding: '16px',
                background: 'rgba(251, 191, 36, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(251, 191, 36, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#666" />
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                  {curso.duracion}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#666" />
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                  {curso.estudiantes}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>
                  {curso.rating}
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <Link
              to={curso.enlace}
              style={{
                background: isHovered 
                  ? `linear-gradient(135deg, ${curso.color}, ${curso.color}dd)` 
                  : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                color: '#fff',
                fontWeight: '700',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 24px',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: `0 8px 25px ${curso.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)'
              }}
            >
              <Sparkles size={18} />
              Ver Curso
              <ChevronRight 
                size={18} 
                style={{
                  transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
                  transition: 'transform 0.3s ease'
                }}
              />
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
              Nuestros Cursos
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontSize: '1.4rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '16px'
              }}
            >
              <Sparkles size={24} color="#fbbf24" />
              <span>Elige el curso que más te inspire y comienza tu transformación profesional</span>
            </div>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Programas diseñados por expertos de la industria con certificados profesionales
            </p>
          </div>

          {/* Grid de cursos */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '40px',
              marginBottom: '100px'
            }}
          >
            {cursosData.map((curso, index) => (
              <AnimatedCard key={curso.id} curso={curso} index={index} />
            ))}
          </div>

          {/* Sección de próximos cursos */}
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
              transitionDelay: '800ms'
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
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)'
                }}
              >
                <Calendar size={36} color="#000" />
              </div>

              <h2
                style={{
                  fontSize: '2.8rem',
                  fontWeight: '800',
                  color: '#fbbf24',
                  marginBottom: '20px',
                  textShadow: '0 2px 10px rgba(251, 191, 36, 0.3)'
                }}
              >
                ¡Próximamente!
              </h2>

              <h3
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#fff',
                  marginBottom: '16px'
                }}
              >
                Peluquería: Cortes y Tintes
              </h3>

              <p
                style={{
                  fontSize: '1.3rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: '32px',
                  maxWidth: '800px',
                  margin: '0 auto 32px',
                  lineHeight: 1.6
                }}
              >
                Domina las técnicas más innovadoras en cortes de cabello, colorimetría profesional y tendencias de la alta peluquería. 
                Un curso completo que te convertirá en el estilista que siempre soñaste ser.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginBottom: '24px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '25px',
                    color: '#fff',
                    fontSize: '1rem',
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
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '25px',
                    color: '#fff',
                    fontSize: '1rem',
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
                    padding: '12px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '25px',
                    color: '#fff',
                    fontSize: '1rem',
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
                  borderRadius: '50px',
                  padding: '20px 40px',
                  fontSize: '1.2rem',
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
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.boxShadow = '0 16px 50px rgba(251, 191, 36, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.4)';
                }}
              >
                <Calendar size={20} />
                Notificarme Cuando Esté Disponible
              </Link>

              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '16px',
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