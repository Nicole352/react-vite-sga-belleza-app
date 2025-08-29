import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Send,
  Mail,
  CheckCircle,
  Sparkles,
  Calendar,
  Award,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';
import Footer from '../components/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Contactenos = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
    curso: '',
    horario: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    AOS.init({ duration: 900, once: true, easing: 'ease-out-quart' });
  }, []);

  const cursosDisponibles = [
    'Cosmetología',
    'Cosmiatría',
    'Maquillaje Profesional',
    'Lashista Profesional',
    'Técnico en Uñas',
    'Belleza Integral',
    'Información General'
  ];

  const horariosDisponibles = [
    'Matutino (8:00 AM - 12:00 PM)',
    'Vespertino (2:00 PM - 6:00 PM)',
    'Nocturno (6:00 PM - 10:00 PM)',
    'Fines de Semana',
    'Modalidad Intensiva'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: '',
        curso: '',
        horario: ''
      });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Icono local de TikTok (SVG) porque la versión de lucide-react usada no lo exporta
  const TikTokIcon = ({ size = 18, color = '#fff' }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 8.5c-2.3 0-4.3-1.2-5.5-3V16a6 6 0 1 1-6-6c.35 0 .69.03 1.02.1V12.2a3.5 3.5 0 1 0 2.48 3.35V2h2.13c.6 2.38 2.74 4.14 5.27 4.31V8.5z" />
    </svg>
  );

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
          
          .gradient-text {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          /* Layout responsiveness */
          @media (max-width: 1024px) {
            .contact-page .main-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
            .contact-page .form-card, .contact-page .map-card { padding: 28px !important; }
            .contact-page .form-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
            .contact-page .map-embed { min-height: 260px !important; }
            .contact-page .gradient-text { font-size: 3rem !important; }
          }
          
          /* Mobile: make action buttons icon-only to reduce visual load */
          @media (max-width: 640px) {
            .contact-page .main-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
            .contact-page .form-card, .contact-page .map-card { padding: 20px !important; }
            .contact-page .form-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
            .contact-page .map-embed { min-height: 220px !important; }
            .contact-page .gradient-text { font-size: 2.2rem !important; }
            .contact-page .map-actions {
              display: flex !important;
              gap: 10px !important;
              flex-wrap: nowrap !important;
              justify-content: space-between !important;
            }
            .contact-page .map-actions a,
            .contact-page .social-actions a {
              font-size: 0 !important; /* hide text labels without changing JSX */
              padding: 10px !important;
              border-radius: 12px !important;
              gap: 0 !important;
              min-width: 44px;
              min-height: 44px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            }
            .contact-page .map-actions a svg,
            .contact-page .social-actions a svg {
              width: 18px;
              height: 18px;
            }
            .contact-page .social-actions {
              display: grid !important;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px !important;
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
          paddingTop: '110px',
          paddingBottom: '0px',
          fontFamily: 'Montserrat, sans-serif'
        }}
        className="contact-page"
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
              <Mail size={20} color="#fbbf24" />
              <span style={{ 
                color: '#fde68a', 
                fontWeight: '600',
                fontSize: '0.9rem',
                letterSpacing: '0.5px'
              }}>
                Conversemos sobre tu futuro
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
              Contáctanos
            </h1>
            
            <p
              style={{
                fontSize: '1.4rem',
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: 1.6
              }}
            >
              Estamos aquí para ayudarte a dar el primer paso hacia tu nueva carrera profesional. 
              ¡Tu transformación comienza con una conversación!
            </p>
          </div>



          {/* Sección principal con formulario y mapa */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'stretch',
              marginBottom: '60px'
            }}
            className="main-grid"
          >
            {/* Formulario de contacto */}
            <div
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '600ms',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
              data-aos="zoom-in"
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  borderRadius: '24px',
                  padding: '40px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="form-card"
              >
                <span className="shimmer-overlay" aria-hidden="true" style={{ animationDelay: '0.4s', borderRadius: 'inherit' }} />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '32px'
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={22} color="#000" />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#fff',
                        margin: 0
                      }}
                    >
                      Envíanos un Mensaje
                    </h2>
                    <p
                      style={{
                        color: '#d1d5db',
                        fontSize: '0.95rem',
                        margin: 0
                      }}
                    >
                      Te respondemos en menos de 24 horas
                    </p>
                  </div>
                </div>

                {showSuccess && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      padding: '20px',
                      borderRadius: '16px',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      animation: 'pulse 2s infinite',
                      border: '1px solid rgba(255,255,255,0.12)'
                    }}
                  >
                    <CheckCircle size={24} />
                    <div>
                      <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                        ¡Mensaje Enviado!
                      </div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        Nos pondremos en contacto contigo pronto.
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}
                    className="form-grid"
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#f3f4f6'
                        }}
                      >
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease, background 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#f3f4f6'
                        }}
                      >
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease, background 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#f3f4f6'
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease, background 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.4)',
                        color: '#fff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}
                    className="form-grid"
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#f3f4f6'
                        }}
                      >
                        Curso de Interés
                      </label>
                      <select
                        name="curso"
                        value={formData.curso}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease, background 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                      >
                        <option value="">Seleccionar curso</option>
                        {cursosDisponibles.map((curso, index) => (
                          <option key={index} value={curso}>{curso}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#f3f4f6'
                        }}
                      >
                        Horario Preferido
                      </label>
                      <select
                        name="horario"
                        value={formData.horario}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(251, 191, 36, 0.25)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease, background 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                      >
                        <option value="">Seleccionar horario</option>
                        {horariosDisponibles.map((horario, index) => (
                          <option key={index} value={horario}>{horario}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#f3f4f6'
                      }}
                    >
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Cuéntanos sobre tus objetivos profesionales, experiencia previa o cualquier pregunta específica..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease, background 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.4)',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        color: '#fff'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.25)'}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '16px 32px',
                      fontSize: '1.1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 25px rgba(251, 191, 36, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px) scale(1.02)';
                      e.target.style.boxShadow = '0 12px 35px rgba(251, 191, 36, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 25px rgba(251, 191, 36, 0.4)';
                    }}
                  >
                    <Send size={18} />
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>

            {/* Mapa y información adicional */}
            <div
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '800ms',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Google Maps Real */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  borderRadius: '24px',
                  padding: '32px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="map-card"
                data-aos="zoom-in"
              >
                <span className="shimmer-overlay" aria-hidden="true" style={{ animationDelay: '0.8s', borderRadius: 'inherit' }} />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px'
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MapPin size={22} color="#fff" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#fff',
                        margin: 0
                      }}
                    >
                      Nuestra Ubicación
                    </h3>
                    <p
                      style={{
                        color: '#d1d5db',
                        fontSize: '0.95rem',
                        margin: 0
                      }}
                    >
                      Jessica Vélez Escuela de Esteticistas
                    </p>
                  </div>
                </div>

                {/* Mapa de Google Maps Real */}
                <div
                  style={{
                    width: '100%',
                    flex: 1,
                    minHeight: '300px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(251, 191, 36, 0.2)'
                  }}
                  className="map-embed"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1995.302847397829!2d-79.16408692922363!3d-0.24497261742799875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d54750b6178cdf%3A0x5b29d4b832ad5669!2sJESSICA%20VELEZ%20ESCUELA%20DE%20ESTETICISTAS!5e0!3m2!1ses!2sec!4v1735065432101!5m2!1ses!2sec"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      borderRadius: '14px'
                    }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Jessica Vélez Escuela de Esteticistas - Ubicación"
                  />
                </div>

                {/* Acciones de Google Maps */}
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flexWrap: 'wrap',
                  marginBottom: '8px'
                }} className="map-actions">
                  <a
                    href="https://www.google.com/maps/place/JESSICA+VELEZ+ESCUELA+DE+ESTETICISTAS/@-0.2449726,-79.1640869,18.02z/data=!4m6!3m5!1s0x91d54750b6178cdf:0x5b29d4b832ad5669!8m2!3d-0.2471762!4d-79.1658452!16s%2Fg%2F11qptlxnw9?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: '#fbbf24',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <MapPin size={16} />
                    Ver en Google Maps
                  </a>

                  <a
                    href="https://www.google.com/maps/dir//JESSICA+VELEZ+ESCUELA+DE+ESTETICISTAS,+Santo+Domingo+de+los+Colorados/@-0.2471762,-79.1658452,16z"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      color: '#fbbf24',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(251, 191, 36, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(251, 191, 36, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Calendar size={16} />
                    Cómo Llegar
                  </a>
                </div>

                {/* Información adicional (oculta; contenido reubicado a Avales) */}
                {false && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    boxShadow: '0 15px 35px rgba(251, 191, 36, 0.1)'
                  }}
                  data-aos="fade-up"
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '16px'
                    }}
                  >
                    {['Docentes Expertos', 'Prácticas Reales', 'Bolsa de Empleo'].map((item, idx) => (
                      <div key={idx} style={{ color: '#fff' }}>{item}</div>
                    ))}
                  </div>
                </div>
                )}
              </div>

              {/* Redes Sociales (bento) como caja separada en la misma columna */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
                  borderRadius: '18px',
                  padding: '24px',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  boxShadow: '0 16px 30px rgba(0, 0, 0, 0.35)',
                  position: 'relative',
                  overflow: 'hidden',
                  marginTop: '20px'
                }}
                data-aos="fade-up"
              >
                <span className="shimmer-overlay" aria-hidden="true" style={{ animationDelay: '1.2s', borderRadius: 'inherit' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageCircle size={22} color="#000" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>Redes Sociales</h3>
                    <p style={{ color: '#d1d5db', fontSize: '0.95rem', margin: 0 }}>Síguenos y contáctanos directamente en nuestras redes.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="social-actions">
                  {/* Botones existentes: WhatsApp, Instagram, TikTok, Facebook */}
                  <a
                    href="https://wa.me/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: '#000',
                      padding: '12px 18px',
                      borderRadius: '28px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.filter = 'brightness(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.filter = 'none';
                    }}
                  >
                    <MessageCircle size={18} /> WhatsApp
                  </a>

                  <a
                    href="https://www.instagram.com/escuelajessicavelez/?igshid=MWtxMXBhMmFxMmN5bg%3D%3D#"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(225, 48, 108, 0.15)',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '28px',
                      textDecoration: 'none',
                      border: '1px solid rgba(225, 48, 108, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.background = 'rgba(225, 48, 108, 0.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.background = 'rgba(225, 48, 108, 0.15)';
                    }}
                  >
                    <Instagram size={18} /> Instagram
                  </a>

                  <a
                    href="#tiktok"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '28px',
                      textDecoration: 'none',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    }}
                  >
                    <TikTokIcon size={18} /> TikTok
                  </a>

                  <a
                    href="#facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(66, 103, 178, 0.15)',
                      color: '#fff',
                      padding: '12px 18px',
                      borderRadius: '28px',
                      textDecoration: 'none',
                      border: '1px solid rgba(66, 103, 178, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.background = 'rgba(66, 103, 178, 0.22)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.background = 'rgba(66, 103, 178, 0.15)';
                    }}
                  >
                    <Facebook size={18} /> Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>



          {/* Llamada a la acción final */}
          {false && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid rgba(251, 191, 36, 0.15)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              overflow: 'hidden',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '1200ms',
              marginBottom: '60px'
            }}
            data-aos="fade-up"
          >
            <span className="shimmer-overlay" aria-hidden="true" style={{ animationDelay: '1.2s' }} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={22} color="#000" />
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#fff',
                    margin: 0
                  }}
                >
                  Redes Sociales
                </h3>
                <p
                  style={{
                    color: '#d1d5db',
                    fontSize: '0.95rem',
                    margin: 0
                  }}
                >
                  Síguenos y contáctanos directamente en nuestras redes.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Botones existentes: WhatsApp, Instagram, TikTok, Facebook */}
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#000',
                  padding: '12px 18px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.filter = 'brightness(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.filter = 'none';
                }}
              >
                <MessageCircle size={18} /> WhatsApp
              </a>

              <a
                href="https://www.instagram.com/escuelajessicavelez/?igshid=MWtxMXBhMmFxMmN5bg%3D%3D#"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(225, 48, 108, 0.15)',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  border: '1px solid rgba(225, 48, 108, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.background = 'rgba(225, 48, 108, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(225, 48, 108, 0.15)';
                }}
              >
                <Instagram size={18} /> Instagram
              </a>

              <a
                href="#tiktok"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <TikTokIcon size={18} /> TikTok
              </a>

              <a
                href="#facebook"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(66, 103, 178, 0.15)',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  border: '1px solid rgba(66, 103, 178, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.background = 'rgba(66, 103, 178, 0.22)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.background = 'rgba(66, 103, 178, 0.15)';
                }}
              >
                <Facebook size={18} /> Facebook
              </a>
            </div>
          </div>
          )}
        </div>

        <Footer />
      </div>

      {/* CSS del efecto shimmer (reflejo) */}
      <style>{`
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -130%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0));
          transform: skewX(-15deg);
          animation: shimmer 5.5s ease-in-out infinite;
          pointer-events: none;
          border-radius: inherit;
        }
        /* En hover acelera y sube levemente la intensidad */
        div:hover > .shimmer-overlay {
          animation-duration: 2s;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0));
        }
      `}</style>
    </>
  );
};

export default Contactenos;