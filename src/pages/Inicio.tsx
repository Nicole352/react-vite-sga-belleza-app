import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  Award, 
  ArrowRight, 
  Star, 
  Heart
} from 'lucide-react';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { gsap } from 'gsap';

const PaginaInicio: React.FC = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Manteniendo exactamente las URLs proporcionadas para el hero
  const heroImages = [
    {
      url: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758847053/WhatsApp_Image_2025-09-25_at_4.45.29_PM_ikeigz.jpg',
      title: 'Técnicas Avanzadas en Estética',
      subtitle: 'Aprende con la mejor tecnología del mercado'
    },
    {
      url: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846500/DSC00311_fkcmay.jpg',
      title: 'Tratamientos Faciales de Lujo',
      subtitle: 'Formación integral en cuidado facial profesional'
    },
    {
      url: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846500/DSC00505_p2d798.jpg',
      title: 'Medicina Estética Moderna',
      subtitle: 'Cursos especializados en las últimas tendencias'
    },
    {
      url: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758846970/WhatsApp_Image_2025-09-25_at_4.59.46_PM_yueit3.jpg',
      title: 'Instalaciones de Primera Clase',
      subtitle: 'Ambiente profesional para tu formación'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    AOS.init({
      duration: 1000,
      delay: 100,
      once: true,
      easing: 'ease-out-quart',
    });
  }, []);

  // Typewriter sutil con GSAP para título y subtítulo al cambiar de imagen (sin remount)
  useEffect(() => {
    if (!titleRef.current || !subtitleRef.current) return;
    const titleText = heroImages[currentHeroImage]?.title || '';
    const subtitleText = heroImages[currentHeroImage]?.subtitle || '';

    // Limpia y cancela animaciones previas
    gsap.killTweensOf([titleRef.current, subtitleRef.current]);
    if (titleRef.current) titleRef.current.textContent = '';
    if (subtitleRef.current) subtitleRef.current.textContent = '';

    const titleProxy = { len: 0 };
    const subtitleProxy = { len: 0 };

    const tl = gsap.timeline();
    tl.to(titleProxy, {
      len: titleText.length,
      duration: Math.min(1.2, 0.04 * titleText.length),
      ease: 'none',
      onUpdate: () => {
        if (titleRef.current) {
          titleRef.current.textContent = titleText.slice(0, Math.floor(titleProxy.len));
        }
      }
    })
    .to(subtitleProxy, {
      len: subtitleText.length,
      duration: Math.min(1.0, 0.035 * subtitleText.length),
      ease: 'none',
      onUpdate: () => {
        if (subtitleRef.current) {
          subtitleRef.current.textContent = subtitleText.slice(0, Math.floor(subtitleProxy.len));
        }
      }
    }, '>-0.1');

    return () => {
      tl.kill();
    };
  }, [currentHeroImage]);

  // Auto-scroll del hero cada 8 segundos
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 8000);
    return () => clearInterval(heroInterval);
  }, [heroImages.length]);

  // Autoplay del video cuando entra en vista
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Asegurar políticas de autoplay (iOS/Android/desktop)
    el.muted = true;

    const playSafely = () => {
      try {
        const p = el.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      } catch (error) {
        // Error silenciado intencionalmente
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            playSafely();
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // CSS para fijar el bloque de texto del hero y evitar que empuje el contenido inferior
  const heroTextStyles = `
    /* Reservar más altura para eliminar cualquier micro-salto del layout */
    .hero-text { min-height: 240px; display: flex; flex-direction: column; justify-content: center; }
    @media (max-width: 480px) { .hero-text { min-height: 150px; } }
    @media (min-width: 481px) and (max-width: 768px) { .hero-text { min-height: 170px; } }
    @media (min-width: 769px) and (max-width: 1024px) { .hero-text { min-height: 200px; } }
  `;

  return (
    <div className="container">

      {/* Efectos de fondo con partículas animadas */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section con Carrusel */}
      <section className="hero-section">
        {/* Carrusel de imágenes de fondo */}
        <div className="hero-background">
          {heroImages.map((image, index) => (
            <div key={index} className={`hero-image ${index === currentHeroImage ? 'active' : ''}`}>
              <img src={image.url} alt={image.title} />
            </div>
          ))}
        </div>
        
        {/* Overlay adicional para mejor legibilidad */}
        <div className="hero-overlay" />

        <div className="content">
          <style>{heroTextStyles}</style>
          <div className="hero-content" data-aos="fade-up" data-aos-delay="100">
            {/* Badge removido a solicitud del usuario */}

            <div className="hero-text">
              {/* Título Principal dinámico con typewriter (solo texto, sin remount) */}
              <h1 className="hero-title" data-aos="fade-up" data-aos-delay="120">
                <span className="gradient-text" ref={titleRef}></span>
              </h1>

              {/* Subtítulo principal dinámico con typewriter */}
              <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="180">
                <span ref={subtitleRef}></span>
              </p>
            </div>

            {/* Botón CTA principal */}
            <div className="button-container" data-aos="fade-up" data-aos-delay="240">
              <Link to="/cursos" className="primary-button">
                Ver Cursos Disponibles
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Estadísticas */}
            <div className="stats-grid">
              <div className="stat-card" data-aos="fade-up" data-aos-delay="0">
                <div className="stat-number">500+</div>
                <div className="stat-text">
                  <Users size={16} />
                  Estudiantes Graduados
                </div>
              </div>
              <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
                <div className="stat-number">15+</div>
                <div className="stat-text">
                  <Sparkles size={16} />
                  Cursos Especializados
                </div>
              </div>
              <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
                <div className="stat-number">98%</div>
                <div className="stat-text">
                  <Star size={16} />
                  Empleabilidad
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores del Hero */}
        <div className="hero-indicators">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className={`hero-indicator ${index === currentHeroImage ? 'active' : ''}`}
              onClick={() => setCurrentHeroImage(index)}
            />
          ))}
        </div>
      </section>

      {/* Video Presentation Section */}
      <section className="video-section" data-aos="fade-up" data-aos-offset="120">
        <div className="content">
          <div className="video-container">
            <div className="video-content">
              <div className="video-text" data-aos="fade-right">
                <h2 className="video-title">
                  Conoce la 
                  <span className="gradient-text">Escuela Jessica Vélez</span>
                </h2>
                <p className="video-description">
                  Descubre cómo hemos transformado la vida de cientos de estudiantes a través de 
                  una educación de excelencia en estética. Con más de 15 años de experiencia, 
                  somos líderes en formación profesional con instalaciones modernas y 
                  tecnología de vanguardia.
                </p>
                <Link to="/sobre-nosotros" className="video-cta-button">
                  <Heart size={18} />
                  Conoce Nuestras Instalaciones
                </Link>
              </div>
              <div className="video-player" data-aos="fade-left">
                <video 
                  ref={videoRef}
                  controls 
                  muted
                  playsInline
                  preload="metadata"
                  poster="https://res.cloudinary.com/di090ggjn/image/upload/v1755893582/catjq75bgehyzkzb0ryc.jpg"
                  className="presentation-video"
                >
                  <source src="https://res.cloudinary.com/dfczvdz7b/video/upload/v1758847064/WhatsApp_Video_2025-09-25_at_4.45.51_PM_ylzapp.mp4" type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="content">
          <h2 className="section-title" data-aos="fade-up">
            ¿Por qué elegir la 
            <span className="gradient-text"> Escuela Jessica Vélez?</span>
          </h2>
          <p className="section-subtitle" data-aos="fade-up" data-aos-delay="100">
            Líder en formación de esteticistas profesionales con más de 10 años de experiencia
          </p>

          <div className="features-grid" data-aos="fade-up" data-aos-delay="150">
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="0">
              <span className="shimmer-overlay" aria-hidden="true" />
              <div className="feature-icon">
                <Heart size={28} color="black" />
              </div>
              <h3 className="feature-title">Atención Personalizada</h3>
              <p className="feature-description">
                Grupos reducidos y atención individual para garantizar el mejor aprendizaje. 
                Cada estudiante recibe seguimiento personalizado durante todo el proceso.
              </p>
            </div>

            <div className="feature-card" data-aos="zoom-in" data-aos-delay="100">
              <span className="shimmer-overlay" aria-hidden="true" />
              <div className="feature-icon">
                <Sparkles size={28} color="black" />
              </div>
              <h3 className="feature-title">Técnicas Avanzadas</h3>
              <p className="feature-description">
                Aprende las últimas técnicas en tratamientos faciales, corporales, 
                depilación láser y medicina estética con equipos de última generación.
              </p>
            </div>

            <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
              <span className="shimmer-overlay" aria-hidden="true" />
              <div className="feature-icon">
                <Award size={28} color="black" />
              </div>
              <h3 className="feature-title">Certificación Profesional</h3>
              <p className="feature-description">
                Obtén tu certificación reconocida nacionalmente y accede a oportunidades 
                laborales en los mejores spas y centros estéticos del país.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="cta-section">
        <div className="content">
          <div className="cta-content" data-aos="fade-up" data-aos-delay="100">
            <h2 className="cta-title">
              ¿Quieres comenzar tu carrera?
            </h2>
            <p className="cta-text">
              Únete a cientos de profesionales de la estética que se formaron en nuestra escuela
            </p>
            <Link to="/cursos" className="cta-button">
              <Sparkles size={18} />
              Comenzar Ahora
            </Link>
          </div>
        </div>
      </section>
      <Footer />

      <style>{`
        .container {
          min-height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          position: relative;
          overflow: hidden;
          font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.12;
          z-index: 0;
        }

        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background-color: #fbbf24;
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .hero-section {
          position: relative;
          padding: 90px 0 30px;
          overflow: hidden;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        .hero-image {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 1.5s ease-in-out;
        }

        .hero-image.active {
          opacity: 1;
        }

        .hero-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center center;
          filter: contrast(1.1) brightness(1.05) saturate(1.1);
          transform: scale(1.02);
        }

        .hero-image::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.6) 100%);
          z-index: 1;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 0;
        }

        .content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
        }

        .hero-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 4.2rem;
          font-weight: 400;
          color: white;
          margin-bottom: 16px;
          line-height: 1.05;
          text-shadow: 0 8px 40px rgba(0, 0, 0, 0.9);
          font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
          letter-spacing: -0.02em;
        }

        .gradient-text {
          background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24, #d97706);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: block;
          animation: gradientShift 3s ease-in-out infinite;
          font-style: italic;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .dynamic-subtitle {
          font-size: 1.15rem;
          color: #fde68a;
          margin-bottom: 28px;
          font-style: italic;
          text-shadow: 0 2px 15px rgba(0, 0, 0, 0.7);
          font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
          opacity: 0.95;
          transition: all 1s ease-in-out;
          font-weight: 300;
          letter-spacing: 0.5px;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #f3f4f6;
          margin: 0 auto 32px;
          max-width: 750px;
          line-height: 1.7;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        .button-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
          justify-content: center;
          align-items: center;
          margin-bottom: 40px;
        }

        .primary-button {
          background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
          background-size: 300% 300%;
          color: black;
          padding: 14px 28px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(251, 191, 36, 0.3);
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          animation: gradientShift 6s ease-in-out infinite, glowPulse 5.5s ease-in-out infinite;
          will-change: transform, box-shadow, background-position;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 50px rgba(251, 191, 36, 0.5);
        }

        .primary-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.5), 0 14px 40px rgba(251, 191, 36, 0.45);
          transform: translateY(-1px);
        }

        .primary-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
          transform: skewX(-15deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .primary-button:hover::after {
          left: 130%;
        }

        .secondary-button {
          border: 2px solid rgba(251, 191, 36, 0.5);
          color: white;
          padding: 14px 28px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(15px);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
          text-decoration: none;
        }

        .secondary-button:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.8);
          transform: translateY(-2px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .stat-card {
          background-color: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 20px;
          padding: 28px 36px;
          transform: translateY(0);
          opacity: 1;
          transition: all 0.8s ease-out;
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.4);
          text-align: center;
        }

        .stat-number {
          font-size: 3.5rem;
          font-weight: 300;
          color: #fbbf24;
          margin-bottom: 12px;
          text-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
          font-family: 'Cormorant Garamond', 'Playfair Display', 'Georgia', serif;
          letter-spacing: -0.02em;
        }

        .stat-text {
          color: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1rem;
          font-family: 'Montserrat', sans-serif;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        .hero-indicators {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 5;
        }

        .hero-indicator {
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hero-indicator.active {
          width: 32px;
          background-color: #fbbf24;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
        }

        .section-title {
          font-size: 2.6rem;
          font-weight: 700;
          color: white;
          margin-bottom: 32px;
          text-align: center;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          font-family: 'Playfair Display', 'Georgia', serif;
          letter-spacing: -0.01em;
        }

        .features-section {
          padding: 80px 0;
          position: relative;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #d1d5db;
          max-width: 600px;
          margin: 0 auto 32px;
          text-align: center;
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          font-weight: 400;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(251, 191, 36, 0.15);
          border-radius: 16px;
          padding: 28px 32px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.12);
          border-color: rgba(251, 191, 36, 0.25);
        }

        .feature-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          transition: transform 0.3s;
          box-shadow: 0 10px 30px rgba(251, 191, 36, 0.3);
        }

        .feature-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
          font-family: 'Montserrat', sans-serif;
        }

        .feature-description {
          color: #d1d5db;
          line-height: 1.6;
          font-family: 'Montserrat', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
        }

        .cta-section {
          padding: 80px 0 120px;
        }

        .cta-content {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.08));
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 20px;
          padding: 32px 40px;
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .cta-title {
          font-size: 2.8rem;
          font-weight: 700;
          color: white;
          margin-bottom: 16px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          font-family: 'Playfair Display', 'Georgia', serif;
          letter-spacing: -0.01em;
        }

        .cta-text {
          font-size: 1.1rem;
          color: #d1d5db;
          margin-bottom: 24px;
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          font-weight: 400;
        }

        .cta-button {
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          color: black;
          padding: 12px 24px;
          border-radius: 20px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.3);
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          background-size: 300% 300%;
          animation: gradientShift 6.5s ease-in-out infinite, glowPulse 6s ease-in-out infinite;
          will-change: transform, box-shadow, background-position;
        }

        .cta-button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 30px rgba(251, 191, 36, 0.45);
        }

        .cta-button:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.5), 0 12px 30px rgba(251, 191, 36, 0.4);
          transform: translateY(-1px);
        }

        .cta-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0));
          transform: skewX(-15deg);
          transition: left 0.6s ease;
          pointer-events: none;
        }

        .cta-button:hover::after {
          left: 130%;
        }

        .installations-cta {
          text-align: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(251, 191, 36, 0.1);
        }

        .installations-button {
          border: 2px solid rgba(251, 191, 36, 0.4);
          color: white;
          padding: 12px 24px;
          border-radius: 20px;
          font-size: 0.95rem;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(15px);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
          text-decoration: none;
        }

        .installations-button:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.6);
          transform: translateY(-2px);
        }

        .video-section {
          padding: 80px 0;
          position: relative;
        }

        .video-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .video-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
        }

        .video-text {
          padding-right: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .video-title {
          font-size: 2.4rem;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          font-family: 'Playfair Display', 'Georgia', serif;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .video-description {
          font-size: 1.1rem;
          color: #d1d5db;
          line-height: 1.7;
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          margin-bottom: 24px;
        }

        .video-cta-button {
          border: 2px solid rgba(251, 191, 36, 0.4);
          color: white;
          padding: 12px 24px;
          border-radius: 20px;
          font-size: 0.95rem;
          font-weight: 500;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(15px);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          font-family: 'Montserrat', sans-serif;
          letter-spacing: 0.3px;
          text-decoration: none;
          width: auto;
          max-width: max-content;
        }

        .video-cta-button:hover {
          background: rgba(251, 191, 36, 0.1);
          border-color: rgba(251, 191, 36, 0.6);
          transform: translateY(-2px);
        }

        .video-player {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(251, 191, 36, 0.2);
          aspect-ratio: 9/16;
          max-width: 350px;
          margin: 0 auto;
        }

        .presentation-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 20px;
        }

        /* Video responsive */
        @media (max-width: 768px) {
          .video-content {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
            text-align: center;
          }
          
          .video-text {
            padding-right: 0 !important;
          }
          
          .video-title {
            font-size: 2rem !important;
          }
          
          .video-description {
            font-size: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .video-section {
            padding: 40px 0 !important;
          }
          
          .video-title {
            font-size: 1.8rem !important;
          }
          
          .video-description {
            font-size: 0.95rem !important;
          }
        }

        /* RESPONSIVE DESIGN - MÓVIL */
        @media (max-width: 480px) {
          .content {
            padding: 0 16px;
          }

          .hero-title {
            font-size: 2.2rem !important;
            line-height: 1.1 !important;
            margin-bottom: 12px !important;
          }

          .hero-subtitle {
            font-size: 1rem !important;
            margin-bottom: 20px !important;
          }

          .dynamic-subtitle {
            font-size: 0.95rem !important;
            margin-bottom: 20px !important;
          }

          .button-container {
            width: 100%;
          }

          .primary-button, .secondary-button {
            padding: 14px 24px !important;
            font-size: 1rem !important;
            width: 100% !important;
            justify-content: center !important;
            max-width: 280px;
          }

          /* Stats en una sola columna compacta */
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 0 10px;
            max-width: 320px;
            margin: 0 auto;
          }

          .stat-card {
            padding: 16px 20px !important;
            border-radius: 12px !important;
          }

          .stat-number {
            font-size: 2.2rem !important;
            margin-bottom: 6px !important;
          }

          .stat-text {
            font-size: 0.9rem !important;
          }

          .section-title {
            font-size: 2rem !important;
            margin-bottom: 20px !important;
          }

          /* Features en una sola columna compacta */
          .features-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
            padding: 0 10px;
            max-width: 350px;
            margin: 0 auto;
          }

          .feature-card {
            padding: 20px 24px !important;
            border-radius: 16px !important;
          }

          .feature-icon {
            width: 48px !important;
            height: 48px !important;
            margin-bottom: 12px !important;
          }

          .feature-title {
            font-size: 1.1rem !important;
            margin-bottom: 8px !important;
          }

          .feature-description {
            font-size: 0.9rem !important;
            line-height: 1.5 !important;
          }

          .cta-content {
            padding: 24px 28px !important;
            margin: 0 16px;
          }

          .cta-title {
            font-size: 1.8rem !important;
          }

          .cta-text {
            font-size: 0.95rem !important;
          }

          .hero-indicators {
            bottom: 16px !important;
          }

          /* Reducir espaciado general */
          .features-section {
            padding: 35px 0 !important;
          }

          .video-section {
            padding: 35px 0 !important;
          }

          .cta-section {
            padding: 35px 0 50px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .hero-title {
            font-size: 3rem !important;
            line-height: 1.1 !important;
          }

          .hero-subtitle {
            font-size: 1.2rem !important;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }

          .features-section,
          .video-section,
          .cta-section {
            padding: 60px 0 !important;
          }

          .cta-section {
            padding-bottom: 90px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-title {
            font-size: 3.5rem !important;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 32px !important;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px !important;
          }
        }

        @media (min-width: 1025px) {
          .features-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }

        /* Shimmer/reflect overlay like Contactenos CTA (más notorio y periódico) */
        @keyframes shimmer {
          0% { left: -130%; }
          100% { left: 130%; }
        }
        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -130%;
          width: 70%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0));
          transform: skewX(-15deg);
          pointer-events: none;
          animation: shimmer 4s ease-in-out infinite;
        }
        /* Stagger de inicio para cada card */
        .features-grid .feature-card:nth-child(1) .shimmer-overlay { animation-delay: 0.4s; }
        .features-grid .feature-card:nth-child(2) .shimmer-overlay { animation-delay: 0.8s; }
        .features-grid .feature-card:nth-child(3) .shimmer-overlay { animation-delay: 1.2s; }
        /* En hover acelera y sube levemente la intensidad */
        .feature-card:hover .shimmer-overlay {
          animation-duration: 1.5s;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 8px 25px rgba(251, 191, 36, 0.28); }
          50% { box-shadow: 0 12px 40px rgba(251, 191, 36, 0.45); }
        }
        @media (hover: none) {
          .social-link:hover {
            transform: none !important;
            background: rgba(255, 255, 255, 0.08) !important;
          }
          .primary-button,
          .cta-button {
            animation: none !important;
          }
 
          .footer-logo:hover {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PaginaInicio;