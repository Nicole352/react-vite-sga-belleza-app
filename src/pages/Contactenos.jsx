import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Send,
  Mail,
  CheckCircle,
  Sparkles,
  Calendar,
  Award
} from 'lucide-react';
import Footer from '../components/Footer';

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
                CONVERSEMOS SOBRE TU FUTURO
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
              alignItems: 'start',
              marginBottom: '100px'
            }}
          >
            {/* Formulario de contacto */}
            <div
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '600ms'
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '32px',
                  padding: '40px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)'
                }}
              >
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
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Send size={24} color="#000" />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        margin: 0
                      }}
                    >
                      Envíanos un Mensaje
                    </h2>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '1rem',
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
                      animation: 'pulse 2s infinite'
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
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#1a1a1a'
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
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#1a1a1a'
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
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#1a1a1a'
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
                        border: '2px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.8)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      marginBottom: '20px'
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: '#1a1a1a'
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
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
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
                          color: '#1a1a1a'
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
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(255, 255, 255, 0.8)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
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
                        color: '#1a1a1a'
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
                        border: '2px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        background: 'rgba(255, 255, 255, 0.8)',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.2)'}
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
                transitionDelay: '800ms'
              }}
            >
              {/* Google Maps Real */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
                }}
              >
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
                    <MapPin size={20} color="#fff" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        color: '#1a1a1a',
                        margin: 0
                      }}
                    >
                      Nuestra Ubicación
                    </h3>
                    <p
                      style={{
                        color: '#666',
                        fontSize: '0.9rem',
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
                    height: '350px',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                    border: '2px solid rgba(251, 191, 36, 0.2)'
                  }}
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

                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flexWrap: 'wrap'
                }}>
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
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      padding: '12px 20px',
                      borderRadius: '25px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Calendar size={16} />
                    Cómo Llegar
                  </a>
                </div>
              </div>

              {/* Información adicional */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))',
                  borderRadius: '24px',
                  padding: '32px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  boxShadow: '0 15px 35px rgba(251, 191, 36, 0.1)'
                }}
              >
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
                    <Award size={20} color="#000" />
                  </div>
                  <h3
                    style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#fff',
                      margin: 0
                    }}
                  >
                    ¿Por Qué Elegirnos?
                  </h3>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    '✓ Certificación oficial del Ministerio del Trabajo',
                    '✓ Aval educativo de SENESCYT',
                    '✓ 98% de empleabilidad de nuestras egresadas',
                    '✓ Instalaciones con tecnología de vanguardia',
                    '✓ Profesores con experiencia internacional',
                    '✓ Bolsa de trabajo exclusiva para estudiantes'
                  ].map((beneficio, index) => (
                    <div
                      key={index}
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <CheckCircle size={16} color="#10b981" />
                      {beneficio}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>



          {/* Llamada a la acción final */}
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
              transitionDelay: '1200ms',
              marginBottom: '60px'
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
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <Sparkles size={36} color="#000" />
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
                ¿Lista para Comenzar?
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
                No esperes más para transformar tu futuro. Contáctanos hoy mismo y 
                descubre cómo podemos ayudarte a alcanzar tus sueños profesionales.
              </p>

              <div style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <a
                  href="https://wa.me/593999999999?text=Hola!%20Me%20interesa%20obtener%20información%20sobre%20los%20cursos%20de%20la%20Escuela%20Jessica%20Vélez"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #25d366, #128c7e)',
                    color: '#fff',
                    padding: '16px 32px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.4)';
                  }}
                >
                  <Mail size={18} />
                  WhatsApp Directo
                </a>

                <a
                  href="/cursos"
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
                  <Calendar size={18} />
                  Ver Cursos
                </a>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Contactenos;