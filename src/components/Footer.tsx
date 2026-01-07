import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Heart,
  Award,
  Instagram,
  Facebook
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const footerStyle: CSSProperties = {
    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderTop: `2px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
    boxShadow: `0 8px 32px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
    color: theme === 'dark' ? 'white' : '#1a1a1a',
    padding: 'clamp(0.75rem, 1.5vw, 1rem) 0 clamp(0.5rem, 1vw, 0.75rem)',
    position: 'relative',
    overflow: 'hidden',
  };

  const descriptionStyle: CSSProperties = {
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
    lineHeight: '1.4',
    marginBottom: '0',
    marginTop: '0',
    fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
    maxWidth: '300px',
    textAlign: 'left',
  };

  const contactItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
    fontSize: '0.85rem',
    fontWeight: '400',
    flexWrap: 'wrap',
  };

  const iconStyle: CSSProperties = {
    color: theme === 'dark' ? '#fbbf24' : '#d69e2e',
    flexShrink: 0,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: '700',
    color: theme === 'dark' ? '#fbbf24' : '#d69e2e',
    marginBottom: '8px',
    letterSpacing: '0.5px',
  };

  const linkStyle: CSSProperties = {
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '400',
    transition: 'all 0.3s ease',
    padding: '0',
    letterSpacing: '0.3px',
    display: 'inline-block',
  };

  const socialLinkStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.25rem',
    height: '2.25rem',
    borderRadius: '0.5rem',
    transition: 'transform 0.25s ease, background 0.25s ease, border-color 0.25s ease',
    textDecoration: 'none',
    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)'}`,
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    willChange: 'transform, background, border-color',
  };

  const bottomBarStyle: CSSProperties = {
    borderTop: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    paddingTop: '0.75rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  };

  const copyrightStyle: CSSProperties = {
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)',
    fontSize: 'clamp(10px, 2vw, 14px)',
    fontFamily: "'Montserrat', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: '400',
    flexWrap: 'wrap',
    textAlign: 'center',
    width: '100%',
  };

  const badgeStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(214, 158, 46, 0.1)',
    border: `1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(214, 158, 46, 0.3)'}`,
    borderRadius: '20px',
    color: theme === 'dark' ? '#fbbf24' : '#d69e2e',
    fontSize: 'clamp(10px, 2vw, 13px)',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: '500',
    whiteSpace: 'nowrap',
  };

  // Icono personalizado de TikTok usando CSS
  const TikTokIcon = () => (
    <div style={{
      width: '1.25rem',
      height: '1.25rem',
      background: theme === 'dark' ? '#fff' : '#1a1a1a',
      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z'/%3E%3C/svg%3E")`,
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      maskSize: 'contain',
    }} />
  );

  return (
    <footer style={footerStyle}>
      <div style={{
        maxWidth: '100%',
        margin: '0',
        padding: '0 clamp(16px, 5vw, 5%)',
        position: 'relative',
        zIndex: 1,
      }} className="footer-container">
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '24px',
          marginBottom: '1rem',
          alignItems: 'start',
          maxWidth: '90%',
          margin: '0 auto 1rem auto',
        }} className="footer-main">
          {/* Logo & Description */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }} className="footer-logo-section" data-aos="fade-right">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: '0',
              marginTop: '0',
            }}>
              <img
                src="https://res.cloudinary.com/di090ggjn/image/upload/v1757037016/clbfrmifo1mbpzma5qts.png"
                alt="Jessica Vélez - Escuela de Esteticistas"
                style={{
                  height: '5rem',
                  width: '5rem',
                  borderRadius: '50%',
                  filter: 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3))',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                className="footer-logo"
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'scale(1.05)';
                  el.style.filter = 'drop-shadow(0 6px 20px rgba(251, 191, 36, 0.5))';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = 'scale(1)';
                  el.style.filter = 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3))';
                }}
              />
            </div>

            <p style={descriptionStyle} className="footer-description" data-aos="fade-up" data-aos-delay="100">
              Líder en la formación de esteticistas profesionales en Ecuador, con 6 años impulsando el crecimiento
              de mujeres que desean transformar su futuro a través de la estética.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }} className="footer-links" data-aos="fade-up" data-aos-delay="150">
            <h3 style={sectionTitleStyle}>Enlaces</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '0',
            }}>
              <Link
                to="/"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Inicio
              </Link>
              <Link
                to="/cursos"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Cursos
              </Link>
              <Link
                to="/avales"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Avales
              </Link>
              <Link
                to="/sobre-nosotros"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Sobre nosotros
              </Link>
              <Link
                to="/contactenos"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Contáctenos
              </Link>
              <Link
                to="/aula-virtual"
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? '#fbbf24' : '#d69e2e';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.8)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Aula Virtual
              </Link>
            </div>
          </div>

          {/* Información de Contacto */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }} className="footer-contact-section" data-aos="fade-up" data-aos-delay="200">
            <h3 style={sectionTitleStyle}>Contacto</h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '0',
            }} className="footer-contact">
              <div style={contactItemStyle} className="contact-item">
                <MapPin size={16} style={iconStyle} />
                <span>Santo Domingo, Ecuador</span>
              </div>
              <div style={contactItemStyle} className="contact-item">
                <Phone size={16} style={iconStyle} />
                <a href="tel:0995562241" style={{ ...linkStyle, color: 'inherit' }}>+593 99 556 2241</a>
              </div>
              <div style={contactItemStyle} className="contact-item">
                <Mail size={16} style={iconStyle} />
                <a href="mailto:escuelajessicavelez@gmail.com" style={{ ...linkStyle, color: 'inherit' }}>escuelajessicavelez@gmail.com</a>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
          }} className="footer-social-section" data-aos="fade-left" data-aos-delay="250">
            <h3 style={sectionTitleStyle}>Síguenos</h3>
            <p style={{
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(26, 26, 26, 0.7)',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              marginTop: '0',
              marginBottom: '8px',
            }} className="social-description">
              Conecta con nosotras en redes sociales
            </p>

            <div style={{ marginTop: '0px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '0px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }} className="social-grid">
                <a
                  href="https://www.tiktok.com/@escuelajessicavelez?_t=ZM-8z5xZqX5GTN&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  className="social-link tiktok-link"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.background = 'rgba(255, 0, 80, 0.15)';
                    el.style.borderColor = 'rgba(255, 0, 80, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    el.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <TikTokIcon />
                </a>

                <a
                  href="https://www.instagram.com/escuelajessicavelez/?igshid=MWtxMXBhMmFxMmN5bg%3D%3D#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  className="social-link instagram-link"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.background = 'rgba(225, 48, 108, 0.15)';
                    el.style.borderColor = 'rgba(225, 48, 108, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    el.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <Instagram size={20} color={theme === 'dark' ? "#fff" : "#1a1a1a"} />
                </a>

                <a
                  href="#facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  className="social-link facebook-link"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.background = 'rgba(66, 103, 178, 0.15)';
                    el.style.borderColor = 'rgba(66, 103, 178, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    el.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <Facebook size={20} color={theme === 'dark' ? "#fff" : "#1a1a1a"} />
                </a>

                <a
                  href="#whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={socialLinkStyle}
                  className="social-link whatsapp-link"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(-2px)';
                    el.style.background = 'rgba(37, 211, 102, 0.15)';
                    el.style.borderColor = 'rgba(37, 211, 102, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = 'translateY(0)';
                    el.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)';
                    el.style.borderColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
                  }}
                >
                  <Mail size={20} color={theme === 'dark' ? "#fff" : "#1a1a1a"} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyle} className="footer-bottom" data-aos="fade-up" data-aos-delay="120">
          <div style={copyrightStyle} className="copyright">
            <Heart size={16} color={theme === 'dark' ? "#fbbf24" : "#d69e2e"} />
            <span>  {currentYear} Jessica Vélez - Escuela de Esteticistas. Todos los derechos reservados.</span>
          </div>

          <div style={badgeStyle} className="certification-badge">
            <Award size={14} />
            <span>Educación Certificada</span>
          </div>
        </div>
      </div>

      {/* Estilos CSS Completamente Responsivos */}
      <style>{`
        /* BREAKPOINTS RESPONSIVOS COMPLETOS */

        /* Medium Desktop (992px - 1199px) */
        @media (max-width: 1199px) and (min-width: 992px) {
          .footer-main {
            gap: 1.875rem !important;
          }

          .footer-contact-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
          }
        }

        /* Small Desktop/Large Tablet (768px - 991px) */
        @media (max-width: 991px) and (min-width: 768px) {
          .footer-main {
            gap: 1.875rem !important;
            text-align: left !important;
          }

          .footer-social-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
            margin-top: 1.25rem !important;
          }

          .footer-contact-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
            margin-top: 1rem !important;
          }

          .social-grid {
            justify-content: center !important;
          }

          .footer-description {
            max-width: none !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
            justify-content: center !important;
          }
        }

        /* Tablet Portrait (481px - 767px) */
        @media (max-width: 767px) and (min-width: 481px) {
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            text-align: center !important;
            margin-bottom: 1.5rem !important;
          }

          .footer-logo-section {
            align-items: center !important;
            gap: 1rem !important;
          }

          .footer-description {
            max-width: 90% !important;
            text-align: center !important;
            line-height: 1.6 !important;
            margin: 0 auto !important;
          }

          .footer-contact {
            align-items: center !important;
            gap: 0.75rem !important;
          }

          .contact-item {
            justify-content: center !important;
            gap: 0.625rem !important;
          }

          .social-description {
            margin-bottom: 1rem !important;
          }

          .social-grid {
            justify-content: center !important;
            gap: 0.75rem !important;
          }

          .social-link {
            width: 3rem !important;
            height: 3rem !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1rem !important;
            justify-content: center !important;
            padding-top: 1.25rem !important;
          }

          .copyright {
            justify-content: center !important;
            width: 100% !important;
            line-height: 1.5 !important;
          }

          .certification-badge {
            padding: 0.375rem 0.75rem !important;
          }
        }

        /* Mobile Large (376px - 480px) */
        @media (max-width: 480px) and (min-width: 376px) {
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
            text-align: center !important;
            margin-bottom: 1.25rem !important;
          }

          .footer-logo-section {
            align-items: center !important;
            gap: 0.75rem !important;
          }

          .footer-description {
            line-height: 1.5 !important;
            max-width: 95% !important;
            margin: 0 auto !important;
            text-align: center !important;
          }

          .footer-contact {
            align-items: center !important;
            gap: 0.625rem !important;
          }

          .contact-item {
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.5rem !important;
          }

          .social-description {
            margin-bottom: 0.75rem !important;
          }

          .social-grid {
            gap: 0.625rem !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }

          .social-link {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }

          .social-link svg,
          .social-link div {
            width: 1rem !important;
            height: 1rem !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.75rem !important;
            padding-top: 1rem !important;
          }

          .copyright {
            line-height: 1.4 !important;
            justify-content: center !important;
          }

          .certification-badge {
            padding: 0.3125rem 0.625rem !important;
          }
        }

        /* Mobile Small (320px - 375px) */
        @media (max-width: 375px) {
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 1.125rem !important;
            text-align: center !important;
            margin-bottom: 1.125rem !important;
          }

          .footer-logo-section {
            align-items: center !important;
            gap: 0.625rem !important;
          }

          .footer-description {
            line-height: 1.4 !important;
            max-width: 100% !important;
            text-align: center !important;
          }

          .footer-contact {
            align-items: center !important;
            gap: 0.5rem !important;
          }

          .contact-item {
            gap: 0.375rem !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }

          .contact-item svg {
            width: 0.75rem !important;
            height: 0.75rem !important;
          }

          .social-description {
            margin-bottom: 0.625rem !important;
          }

          .social-grid {
            gap: 0.5rem !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }

          .social-link {
            width: 2.25rem !important;
            height: 2.25rem !important;
          }

          .social-link svg,
          .social-link div {
            width: 0.875rem !important;
            height: 0.875rem !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.625rem !important;
            padding-top: 0.75rem !important;
          }

          .copyright {
            flex-direction: column !important;
            gap: 0.25rem !important;
            line-height: 1.3 !important;
            justify-content: center !important;
          }

          .certification-badge {
            padding: 0.25rem 0.5rem !important;
          }

          .certification-badge svg {
            width: 0.625rem !important;
            height: 0.625rem !important;
          }
        }

        /* Extra Small Mobile (< 320px) */
        @media (max-width: 319px) {
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 0.9375rem !important;
            text-align: center !important;
            margin-bottom: 0.9375rem !important;
          }

          .footer-logo-section {
            align-items: center !important;
            gap: 0.5rem !important;
          }

          .footer-description {
            line-height: 1.3 !important;
            max-width: 100% !important;
            text-align: center !important;
          }

          .footer-contact {
            align-items: center !important;
            gap: 0.375rem !important;
          }

          .contact-item {
            gap: 0.25rem !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }

          .contact-item svg {
            width: 0.625rem !important;
            height: 0.625rem !important;
          }

          .social-description {
            margin-bottom: 0.5rem !important;
          }

          .social-grid {
            gap: 0.375rem !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }

          .social-link {
            width: 2rem !important;
            height: 2rem !important;
          }

          .social-link svg,
          .social-link div {
            width: 0.75rem !important;
            height: 0.75rem !important;
          }

          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 0.5rem !important;
            padding-top: 0.625rem !important;
          }

          .copyright {
            flex-direction: column !important;
            gap: 0.1875rem !important;
            line-height: 1.2 !important;
            justify-content: center !important;
          }

          .certification-badge {
            padding: 3px 6px !important;
          }

          .certification-badge svg {
            width: 8px !important;
            height: 8px !important;
          }
        }

        /* Landscape Mobile Fixes */
        @media (max-height: 500px) and (orientation: landscape) {
          footer {
            padding: 20px 0 15px !important;
          }

          .footer-main {
            gap: 20px !important;
            margin-bottom: 20px !important;
          }

          .footer-bottom {
            padding-top: 15px !important;
          }
        }

        /* High Resolution Displays */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .footer-logo {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
        }

        /* Hover Effects for Touch Devices */
        @media (hover: none) {
          .social-link:hover {
            transform: none !important;
            background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)'} !important;
          }

          .footer-logo:hover {
            transform: none !important;
          }
        }

        /* Reduced Motion Support */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            animation: none !important;
          }
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          footer {
            border-top: 3px solid ${theme === 'dark' ? '#fbbf24' : '#d69e2e'} !important;
          }

          .social-link {
            border: 2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'} !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
