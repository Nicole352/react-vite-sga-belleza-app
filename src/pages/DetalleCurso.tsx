import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeftCircle, 
  Clock, 
  Users, 
  Award, 
  Star, 
  ChevronDown, 
  Play, 
  Check,
  BookOpen,
  Gift,
  Calendar
} from 'lucide-react';
import Footer from '../components/Footer';

// Simulación de datos detallados por curso
const detallesCursos = {
  facial: {
    titulo: 'Cosmetología',
    descripcion: 'Aprende técnicas profesionales de limpieza, hidratación y rejuvenecimiento facial.',
    duracion: '6 meses',
    requisitos: [
      'Ser mayor de 16 años',
      'Secundaria completa',
      'Entrevista personal'
    ],
    malla: [
      'Anatomía y fisiología de la piel',
      'Técnicas de limpieza facial',
      'Tratamientos hidratantes',
      'Rejuvenecimiento facial',
      'Prácticas supervisadas'
    ],
    promociones: [
      '10% de descuento por pago al contado',
      'Matrícula gratis hasta el 30 de septiembre'
    ],
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1755893924/cursos_xrnjuu.png',
    rating: 4.9,
    estudiantes: 1250,
    instructor: 'María González',
    precio: '$2,500',
    certificacion: 'Certificado Profesional'
  },
  cosmetologia: {
    titulo: 'Cosmetología',
    descripcion: 'Aprende técnicas profesionales de limpieza, hidratación y rejuvenecimiento facial.',
    duracion: '6 meses',
    requisitos: [
      'Ser mayor de 16 años',
      'Secundaria completa',
      'Entrevista personal'
    ],
    malla: [
      'Anatomía y fisiología de la piel',
      'Técnicas de limpieza facial',
      'Tratamientos hidratantes',
      'Rejuvenecimiento facial',
      'Prácticas supervisadas'
    ],
    promociones: [
      '10% de descuento por pago al contado',
      'Matrícula gratis hasta el 30 de septiembre'
    ],
    imagen: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    estudiantes: 850,
    instructor: 'María González',
    precio: '$2,500',
    certificacion: 'Certificado Profesional'
  },
  cosmiatria: {
    titulo: 'Cosmiatría',
    descripcion: 'Especialízate en tratamientos estéticos avanzados y equipos de última tecnología.',
    duracion: '8 meses',
    requisitos: [
      'Ser mayor de 18 años',
      'Bachillerato completo',
      'Curso básico de cosmetología'
    ],
    malla: [
      'Equipos de alta tecnología',
      'Tratamientos faciales avanzados',
      'Microdermoabrasión',
      'Radiofrecuencia',
      'Prácticas con equipos'
    ],
    promociones: [
      '15% de descuento por pago al contado',
      'Financiamiento en 6 cuotas sin interés'
    ],
    imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    estudiantes: 620,
    instructor: 'Dr. Carlos Mendoza',
    precio: '$3,200',
    certificacion: 'Certificado Profesional'
  },
  maquillaje: {
    titulo: 'Maquillaje Profesional',
    descripcion: 'Domina el arte del maquillaje social, artístico y de alta costura.',
    duracion: '4 meses',
    requisitos: [
      'Ser mayor de 16 años',
      'Secundaria completa',
      'Portafolio básico'
    ],
    malla: [
      'Teoría del color',
      'Maquillaje social',
      'Maquillaje artístico',
      'Técnicas de contouring',
      'Portfolio profesional'
    ],
    promociones: [
      'Kit de maquillaje profesional incluido',
      '20% de descuento por pago anticipado'
    ],
    imagen: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    estudiantes: 1200,
    instructor: 'Isabella Rodríguez',
    precio: '$1,800',
    certificacion: 'Certificado Profesional'
  }
};

const DetalleCurso = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const cursoKey = params.get('curso') || 'facial';
  const curso = detallesCursos[cursoKey];

  const [activeSection, setActiveSection] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  if (!curso) {
    return (
      <div style={{ 
        paddingTop: 120, 
        textAlign: 'center', 
        color: '#fbbf24',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)'
      }}>
        <h2>Curso no encontrado</h2>
        <Link 
          to="/" 
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: '#000',
            padding: '12px 32px',
            borderRadius: '30px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            boxShadow: '0 8px 32px rgba(251,191,36,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          <Sparkles size={16} />
          Volver al inicio
        </Link>
        <Footer />
      </div>
    );
  }

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const SectionCard = ({ 
    children, 
    variant = 'default', 
    delay = 0, 
    icon, 
    title,
    isExpandable = false,
    sectionId
  }) => {
    const baseStyle = {
      borderRadius: '24px',
      marginBottom: '32px',
      padding: '32px',
      cursor: isExpandable ? 'pointer' : 'default',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
      opacity: isVisible ? 1 : 0,
      transitionDelay: `${delay}ms`,
      position: 'relative',
      overflow: 'hidden'
    };

    const variants = {
      default: {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(251, 191, 36, 0.1)',
        color: '#fff'
      },
      gold: {
        ...baseStyle,
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        boxShadow: '0 20px 40px rgba(251, 191, 36, 0.3), 0 0 60px rgba(251, 191, 36, 0.2)',
        color: '#000',
        border: 'none'
      },
      glass: {
        ...baseStyle,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        color: '#fff'
      },
      premium: {
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '2px solid #fbbf24',
        boxShadow: '0 20px 40px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        color: '#fff'
      }
    };

    const hoverEffect = variant === 'default' ? {
      transform: 'translateY(-5px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(251, 191, 36, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.2)'
    } : variant === 'gold' ? {
      transform: 'translateY(-5px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(251, 191, 36, 0.4), 0 0 80px rgba(251, 191, 36, 0.3)'
    } : {
      transform: 'translateY(-5px) scale(1.02)',
      boxShadow: '0 25px 50px rgba(251, 191, 36, 0.3)'
    };

    return (
      <div
        style={variants[variant]}
        onMouseEnter={(e) => {
          Object.assign(e.target.style, hoverEffect);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.target.style, variants[variant]);
        }}
        onClick={isExpandable ? () => handleSectionClick(sectionId) : undefined}
      >
        {/* Efecto de brillo animado */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: isVisible ? 'shimmer 3s ease-in-out infinite' : 'none',
          animationDelay: `${delay + 1000}ms`
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {title && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '20px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {icon}
                <h2 style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: '700',
                  margin: 0,
                  background: variant === 'gold' || variant === 'premium' ? 
                    'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'inherit',
                  WebkitBackgroundClip: variant === 'gold' || variant === 'premium' ? 'text' : 'inherit',
                  WebkitTextFillColor: variant === 'gold' || variant === 'premium' ? 'transparent' : 'inherit'
                }}>
                  {title}
                </h2>
              </div>
              {isExpandable && (
                <div style={{ 
                  transition: 'transform 0.3s ease',
                  transform: activeSection === sectionId ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  <ChevronDown size={24} />
                </div>
              )}
            </div>
          )}
          
          <div style={{
            maxHeight: isExpandable && activeSection !== sectionId ? '0px' : '1000px',
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: isExpandable && activeSection !== sectionId ? 0 : 1,
            transitionProperty: 'max-height, opacity'
          }}>
            {children}
          </div>
        </div>
      </div>
    );
  };

  const AnimatedButton = ({ children, href, variant = 'primary' }) => {
    const baseStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 32px',
      borderRadius: '50px',
      fontWeight: '700',
      fontSize: '1.1rem',
      textDecoration: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      marginTop: '20px'
    };

    const variants = {
      primary: {
        ...baseStyle,
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#000',
        boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)'
      },
      secondary: {
        ...baseStyle,
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#fbbf24',
        border: '2px solid #fbbf24',
        backdropFilter: 'blur(10px)'
      }
    };

    return (
      <Link
        to={href}
        style={variants[variant]}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px) scale(1.05)';
          e.target.style.boxShadow = variant === 'primary' ? 
            '0 12px 40px rgba(251, 191, 36, 0.4)' : 
            '0 12px 40px rgba(251, 191, 36, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0) scale(1)';
          e.target.style.boxShadow = variants[variant].boxShadow;
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          transition: 'left 0.6s ease'
        }} />
        {children}
      </Link>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
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
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
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
          
          .gradient-text {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        paddingTop: 110,
        paddingBottom: 0
      }}>
        {/* Partículas flotantes de fondo */}
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            />
          ))}
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          {/* Botón volver mejorado */}
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '50px',
              padding: '12px 24px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              color: '#fbbf24',
              margin: '24px 0 40px 0',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateX(-5px)';
              e.target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateX(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
          >
            <ArrowLeftCircle size={24} />
            Volver
          </button>

          {/* Header del curso mejorado */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            marginBottom: 60,
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(251, 191, 36, 0.3)'
            }}>
              <img 
                src={curso.imagen} 
                alt={curso.titulo} 
                style={{ 
                  width: 180, 
                  height: 180, 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="gradient-text" style={{ 
                fontSize: '3rem', 
                fontWeight: '800', 
                marginBottom: 16,
                lineHeight: 1.2
              }}>
                {curso.titulo}
              </h1>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '1.3rem', 
                marginBottom: 24,
                lineHeight: 1.6
              }}>
                {curso.descripcion}
              </p>
              
              {/* Métricas del curso */}
              <div style={{ 
                display: 'flex', 
                gap: 32, 
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={20} fill="#fbbf24" color="#fbbf24" />
                  <span style={{ color: '#fbbf24', fontWeight: '600' }}>{curso.rating}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={20} color="#fff" />
                  <span style={{ color: '#fff' }}>{curso.estudiantes} estudiantes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={20} color="#fbbf24" />
                  <span style={{ color: '#fff' }}>{curso.certificacion}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Duración */}
          <SectionCard 
            variant="default" 
            delay={200}
            icon={<Clock size={28} color="#fbbf24" />}
            title="Duración del Curso"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 24,
                  marginBottom: 24
                }}>
                  <div style={{
                    padding: '20px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    <Calendar size={24} color="#fbbf24" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '1.2rem' }}>
                      {curso.duracion}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Duración total</div>
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}>
                    <BookOpen size={24} color="#fbbf24" style={{ marginBottom: 8 }} />
                    <div style={{ fontWeight: '600', color: '#fff', fontSize: '1.2rem' }}>
                      Modalidad Mixta
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Presencial + Virtual</div>
                  </div>
                </div>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Nuestro programa está diseñado para ofrecerte una experiencia de aprendizaje completa 
                  y flexible, combinando la práctica presencial con recursos digitales de vanguardia.
                </p>
              </div>
              <img 
                src={curso.imagen} 
                alt="Duración" 
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: 20,
                  objectFit: 'cover',
                  boxShadow: '0 12px 32px rgba(251, 191, 36, 0.2)'
                }}
              />
            </div>
            <AnimatedButton href={`/pago?curso=${cursoKey}`}>
              <Sparkles size={18} />
              Inscríbete Ahora
            </AnimatedButton>
          </SectionCard>

          {/* Sección Requisitos */}
          <SectionCard 
            variant="gold" 
            delay={400}
            icon={<Check size={28} color="#000" />}
            title="Requisitos de Ingreso"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 24,
              marginBottom: 24
            }}>
              {curso.requisitos.map((req, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  background: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={20} color="#000" />
                  </div>
                  <span style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: '500',
                    color: '#000'
                  }}>
                    {req}
                  </span>
                </div>
              ))}
            </div>
            <p style={{ 
              color: 'rgba(0, 0, 0, 0.7)', 
              fontSize: '1rem',
              fontStyle: 'italic',
              marginBottom: 0
            }}>
              Todos los requisitos son flexibles y evaluamos cada caso de manera individual.
            </p>
            <AnimatedButton href={`/pago?curso=${cursoKey}`} variant="secondary">
              <Sparkles size={18} />
              Consultar Admisión
            </AnimatedButton>
          </SectionCard>

          {/* Sección Malla Curricular */}
          <SectionCard 
            variant="premium" 
            delay={600}
            icon={<BookOpen size={28} color="#fbbf24" />}
            title="Malla Curricular"
            isExpandable={true}
            sectionId="malla"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: 24 
            }}>
              {curso.malla.map((modulo, idx) => (
                <div 
                  key={idx} 
                  style={{
                    padding: '24px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px)';
                    e.target.style.boxShadow = '0 12px 32px rgba(251, 191, 36, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 16,
                    marginBottom: 12
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {idx + 1}
                    </div>
                    <Play size={16} color="#fbbf24" />
                  </div>
                  <h3 style={{ 
                    color: '#fff', 
                    fontSize: '1.2rem', 
                    fontWeight: '600',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {modulo}
                  </h3>
                </div>
              ))}
            </div>
            <AnimatedButton href={`/pago?curso=${cursoKey}`}>
              <BookOpen size={18} />
              Ver Programa Completo
            </AnimatedButton>
          </SectionCard>

          {/* Sección Promociones */}
          <SectionCard 
            variant="glass" 
            delay={800}
            icon={<Gift size={28} color="#fbbf24" />}
            title="Promociones Especiales"
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: 24,
              marginBottom: 24
            }}>
              {curso.promociones.map((promo, idx) => (
                <div key={idx} style={{
                  padding: '24px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '20px',
                  border: '2px solid rgba(251, 191, 36, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s infinite'
                  }}>
                    <Gift size={20} color="#000" />
                  </div>
                  <h4 style={{ 
                    color: '#fbbf24', 
                    fontSize: '1.3rem', 
                    fontWeight: '700',
                    marginBottom: 12,
                    paddingRight: 60
                  }}>
                    Oferta Especial {idx + 1}
                  </h4>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.9)', 
                    fontSize: '1.1rem',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {promo}
                  </p>
                </div>
              ))}
            </div>
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))',
              borderRadius: '20px',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              textAlign: 'center'
            }}>
              <h3 className="gradient-text" style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700',
                marginBottom: 12
              }}>
                {curso.precio}
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '1rem',
                margin: 0
              }}>
                Precio especial por tiempo limitado
              </p>
            </div>
            <AnimatedButton href={`/pago?curso=${cursoKey}`}>
              <Gift size={18} />
              Aprovechar Promoción
            </AnimatedButton>
          </SectionCard>

          {/* Sección de llamada a la acción final */}
          <SectionCard 
            variant="gold" 
            delay={1000}
          >
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800',
                color: '#000',
                marginBottom: 20
              }}>
                ¡Transforma tu Futuro Hoy!
              </h2>
              <p style={{ 
                fontSize: '1.3rem', 
                color: 'rgba(0, 0, 0, 0.8)',
                marginBottom: 32,
                lineHeight: 1.6
              }}>
                Únete a los miles de profesionales que han cambiado sus vidas con nuestros cursos.
                <br />
                Tu nueva carrera en belleza te está esperando.
              </p>
              
              <div style={{ 
                display: 'flex', 
                gap: 20, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <AnimatedButton href={`/pago?curso=${cursoKey}`}>
                  <Sparkles size={20} />
                  Inscribirme Ahora
                </AnimatedButton>
                <Link
                  to="/contacto"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    textDecoration: 'none',
                    background: 'rgba(0, 0, 0, 0.2)',
                    color: '#000',
                    border: '2px solid rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    marginTop: '20px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(0, 0, 0, 0.2)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <Users size={18} />
                  Más Información
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DetalleCurso;