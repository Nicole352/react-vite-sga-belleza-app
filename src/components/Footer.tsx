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

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerStyle: CSSProperties = {
    background: 'linear-gradient(135deg, var(--page-grad-from) 0%, var(--page-grad-mid) 50%, var(--page-grad-to) 100%)',
    backdropFilter: 'blur(20px)',
    borderTop: '2px solid rgba(251, 191, 36, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    color: 'var(--fg)',
    padding: '60px 0 30px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: '100%',
    margin: '0',
    padding: '0 5%',
    position: 'relative',
    zIndex: 1,
  };

  const footerMainStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '40px',
    marginBottom: '30px',
    alignItems: 'start',
    maxWidth: '1400px',
    margin: '0 auto 30px auto',
  };

  const logoSectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px', 
  };

  const logoContainerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0', 
    marginTop: '-49px', // subir más el logo 
  };

  const descriptionStyle: CSSProperties = {
    color: 'var(--fg)',
    lineHeight: '1.6',
    marginBottom: '0',
    marginTop: '-40px',
    fontFamily: "'Montserrat', sans-serif",
    fontSize: '15px',
    maxWidth: '300px',
    textAlign: 'justify',
  };

  const contactInfoStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '14px',
  };

  const contactItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: '400',
    flexWrap: 'wrap',
  };

  const iconStyle: CSSProperties = {
    color: '#fbbf24',
    flexShrink: 0,
  };

  const sectionStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fbbf24',
    marginBottom: '0',
    fontFamily: "'Montserrat', sans-serif",
    letterSpacing: '0.5px',
  };

  const linkListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '14px',
  };

  const linkStyle: CSSProperties = {
    color: 'var(--fg)',
    textDecoration: 'none',
    fontSize: '15px',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: '400',
    transition: 'all 0.3s ease',
    padding: '0',
    letterSpacing: '0.3px',
    display: 'inline-block',
  };

  const socialGridStyle: CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '0px',
    flexWrap: 'wrap',
    alignItems: 'center',
  };

  const socialLinkStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    transition: 'transform 0.25s ease, background 0.25s ease, border-color 0.25s ease',
    textDecoration: 'none',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    background: 'var(--surface-2)', // base consistente con estado de salida
    willChange: 'transform, background, border-color',
  };

  const bottomBarStyle: CSSProperties = {
    borderTop: '1px solid var(--border)',
    paddingTop: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  };

  const copyrightStyle: CSSProperties = {
    color: 'var(--fg)',
    fontSize: '14px',
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
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '20px',
    color: '#fbbf24',
    fontSize: '13px',
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: '500',
    whiteSpace: 'nowrap',
  };

  // Icono personalizado de TikTok usando CSS
  const TikTokIcon = () => (
    <div style={{
      width: '20px',
      height: '20px',
      background: '#fff',
      maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z'/%3E%3C/svg%3E")`,
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      maskSize: 'contain',
    }} />
  );

  return (
    <footer style={footerStyle}>
      <div style={containerStyle} className="footer-container">
        {/* Main Footer Content */}
        <div style={footerMainStyle} className="footer-main">
          {/* Logo & Description */}
          <div style={logoSectionStyle} className="footer-logo-section" data-aos="fade-right">
            <div style={logoContainerStyle}>
              <img 
                src="https://res.cloudinary.com/di090ggjn/image/upload/v1757037016/clbfrmifo1mbpzma5qts.png"
                alt="Jessica Vélez - Escuela de Esteticistas"
                style={{
                  height: '200px',
                  width: '200px',
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
              Líder en formación de esteticistas profesionales en Ecuador. Más de 15 años transformando vidas a través de la belleza.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div style={sectionStyle} className="footer-links" data-aos="fade-up" data-aos-delay="150">
            <h3 style={sectionTitleStyle}>Enlaces</h3>
            <div style={linkListStyle}>
              <Link 
                to="/" 
                style={linkStyle}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
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
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
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
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
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
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
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
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
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
                  el.style.color = '#fbbf24';
                  el.style.paddingLeft = '8px';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = 'var(--fg)';
                  el.style.paddingLeft = '0px';
                }}
              >
                Aula Virtual
              </Link>
            </div>
          </div>

          {/* Información de Contacto */}
          <div style={sectionStyle} className="footer-contact-section" data-aos="fade-up" data-aos-delay="200">
            <h3 style={sectionTitleStyle}>Contacto</h3>
            <div style={contactInfoStyle} className="footer-contact">
              <div style={contactItemStyle} className="contact-item">
                <MapPin size={16} style={iconStyle} />
                <span>Santo Domingo, Ecuador</span>
              </div>
              <div style={contactItemStyle} className="contact-item">
                <Phone size={16} style={iconStyle} />
                <span>+593 2 275 0123</span>
              </div>
              <div style={contactItemStyle} className="contact-item">
                <Mail size={16} style={iconStyle} />
                <span>info@jessicavelez.edu.ec</span>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div style={sectionStyle} className="footer-social-section" data-aos="fade-left" data-aos-delay="250">
            <h3 style={sectionTitleStyle}>Síguenos</h3>
            <p style={{
              color: 'var(--fg)',
              fontSize: '14px',
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: '1.5',
              marginTop: '14px',
              marginBottom: '14px',
            }} className="social-description">
              Conecta con nosotras en redes sociales
            </p>
            
            <div style={{marginTop: '0px'}}>
              <div style={socialGridStyle} className="social-grid">
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
                    el.style.background = 'var(--surface-2)';
                    el.style.borderColor = 'var(--border)';
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
                    el.style.background = 'var(--surface-2)';
                    el.style.borderColor = 'var(--border)';
                  }}
                >
                  <Instagram size={20} color="var(--fg)" />
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
                    el.style.background = 'var(--surface-2)';
                    el.style.borderColor = 'var(--border)';
                  }}
                >
                  <Facebook size={20} color="var(--fg)" />
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
                    el.style.background = 'rgba(255, 255, 255, 0.08)';
                    el.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  <Mail size={20} color="#fff" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={bottomBarStyle} className="footer-bottom" data-aos="fade-up" data-aos-delay="120">
          <div style={copyrightStyle} className="copyright">
            <Heart size={16} color="#fbbf24" />
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

        /* Extra Large Desktop (1400px+) */
        @media (min-width: 1400px) {
          .footer-container {
            padding: 0 8% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr 1fr 1fr 1fr !important;
            gap: 50px !important;
          }
          
          .footer-description {
            max-width: 300px !important;
            font-size: 16px !important;
          }
        }

        /* Large Desktop (1200px - 1399px) */
        @media (max-width: 1399px) and (min-width: 1200px) {
          .footer-container {
            padding: 0 6% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr 1fr 1fr 1fr !important;
            gap: 35px !important;
          }
        }

        /* Medium Desktop (992px - 1199px) */
        @media (max-width: 1199px) and (min-width: 992px) {
          .footer-container {
            padding: 0 4% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr 1fr !important;
            gap: 30px !important;
          }
          
          .footer-contact-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
          }
          
          .footer-description {
            max-width: 280px !important;
            font-size: 15px !important;
          }
          
          .footer-logo {
            height: 190px !important;
            width: 190px !important;
          }
        }

        /* Small Desktop/Large Tablet (768px - 991px) */
        @media (max-width: 991px) and (min-width: 768px) {
          .footer-container {
            padding: 0 4% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr 1fr !important;
            gap: 30px !important;
            text-align: left !important;
          }
          
          .footer-social-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
            margin-top: 20px !important;
          }
          
          .footer-contact-section {
            grid-column: 1 / -1 !important;
            text-align: center !important;
            margin-top: 15px !important;
          }
          
          .social-grid {
            justify-content: center !important;
          }
          
          .footer-description {
            max-width: none !important;
          }
          
          .footer-logo {
            height: 170px !important;
            width: 170px !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 16px !important;
            justify-content: center !important;
          }
        }

        /* Tablet Portrait (481px - 767px) */
        @media (max-width: 767px) and (min-width: 481px) {
          footer {
            padding: 40px 0 20px !important;
          }
          
          .footer-container {
            padding: 0 4% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 25px !important;
            text-align: center !important;
            margin-bottom: 25px !important;
          }
          
          .footer-logo-section {
            align-items: center !important;
            gap: 16px !important;
          }
          
          .footer-logo {
            height: 150px !important;
            width: 150px !important;
          }
          
          .footer-description {
            max-width: 90% !important;
            font-size: 14px !important;
            text-align: center !important;
            line-height: 1.6 !important;
            margin: 0 auto !important;
          }
          
          .footer-contact {
            align-items: center !important;
            gap: 12px !important;
          }
          
          .contact-item {
            justify-content: center !important;
            font-size: 14px !important;
            gap: 10px !important;
          }
          
          .social-description {
            font-size: 13px !important;
            margin-bottom: 16px !important;
          }
          
          .social-grid {
            justify-content: center !important;
            gap: 12px !important;
          }
          
          .social-link {
            width: 46px !important;
            height: 46px !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 16px !important;
            justify-content: center !important;
            padding-top: 20px !important;
          }
          
          .copyright {
            font-size: 13px !important;
            justify-content: center !important;
            width: 100% !important;
            line-height: 1.5 !important;
          }
          
          .certification-badge {
            font-size: 12px !important;
            padding: 6px 12px !important;
          }
        }

        /* Mobile Large (376px - 480px) */
        @media (max-width: 480px) and (min-width: 376px) {
          footer {
            padding: 30px 0 20px !important;
          }
          
          .footer-container {
            padding: 0 5% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            text-align: center !important;
            margin-bottom: 20px !important;
          }
          
          .footer-logo-section {
            align-items: center !important;
            gap: 12px !important;
          }
          
          .footer-logo {
            height: 130px !important;
            width: 130px !important;
          }
          
          .footer-description {
            font-size: 13px !important;
            line-height: 1.5 !important;
            max-width: 95% !important;
            margin: 0 auto !important;
            text-align: center !important;
          }
          
          .footer-contact {
            align-items: center !important;
            gap: 10px !important;
          }
          
          .contact-item {
            font-size: 13px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
          }
          
          .social-description {
            font-size: 12px !important;
            margin-bottom: 12px !important;
          }
          
          .social-grid {
            gap: 10px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          
          .social-link {
            width: 40px !important;
            height: 40px !important;
          }
          
          .social-link svg,
          .social-link div {
            width: 16px !important;
            height: 16px !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 12px !important;
            padding-top: 15px !important;
          }
          
          .copyright {
            font-size: 11px !important;
            line-height: 1.4 !important;
            justify-content: center !important;
          }
          
          .certification-badge {
            font-size: 10px !important;
            padding: 5px 10px !important;
          }
        }

        /* Mobile Small (320px - 375px) */
        @media (max-width: 375px) {
          footer {
            padding: 25px 0 15px !important;
          }
          
          .footer-container {
            padding: 0 4% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 18px !important;
            text-align: center !important;
            margin-bottom: 18px !important;
          }
          
          .footer-logo-section {
            align-items: center !important;
            gap: 10px !important;
          }
          
          .footer-logo {
            height: 130px !important;
            width: 130px !important;
          }
          
          .footer-description {
            font-size: 12px !important;
            line-height: 1.4 !important;
            max-width: 100% !important;
            text-align: center !important;
          }
          
          .footer-contact {
            align-items: center !important;
            gap: 8px !important;
          }
          
          .contact-item {
            font-size: 11px !important;
            gap: 6px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          
          .contact-item svg {
            width: 12px !important;
            height: 12px !important;
          }
          
          .social-description {
            font-size: 11px !important;
            margin-bottom: 10px !important;
          }
          
          .social-grid {
            gap: 8px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          
          .social-link {
            width: 36px !important;
            height: 36px !important;
          }
          
          .social-link svg,
          .social-link div {
            width: 14px !important;
            height: 14px !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 10px !important;
            padding-top: 12px !important;
          }
          
          .copyright {
            flex-direction: column !important;
            gap: 4px !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
            justify-content: center !important;
          }
          
          .certification-badge {
            font-size: 9px !important;
            padding: 4px 8px !important;
          }
          
          .certification-badge svg {
            width: 10px !important;
            height: 10px !important;
          }
        }

        /* Extra Small Mobile (< 320px) */
        @media (max-width: 319px) {
          footer {
            padding: 20px 0 12px !important;
          }
          
          .footer-container {
            padding: 0 3% !important;
          }
          
          .footer-main {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            text-align: center !important;
            margin-bottom: 15px !important;
          }
          
          .footer-logo-section {
            align-items: center !important;
            gap: 8px !important;
          }
          
          .footer-logo {
            height: 115px !important;
            width: 115px !important;
          }
          
          .footer-description {
            font-size: 11px !important;
            line-height: 1.3 !important;
            max-width: 100% !important;
            text-align: center !important;
          }
          
          .footer-contact {
            align-items: center !important;
            gap: 6px !important;
          }
          
          .contact-item {
            font-size: 10px !important;
            gap: 4px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          
          .contact-item svg {
            width: 10px !important;
            height: 10px !important;
          }
          
          .social-description {
            font-size: 10px !important;
            margin-bottom: 8px !important;
          }
          
          .social-grid {
            gap: 6px !important;
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
          
          .social-link {
            width: 32px !important;
            height: 32px !important;
          }
          
          .social-link svg,
          .social-link div {
            width: 12px !important;
            height: 12px !important;
          }
          
          .footer-bottom {
            flex-direction: column !important;
            text-align: center !important;
            gap: 8px !important;
            padding-top: 10px !important;
          }
          
          .copyright {
            flex-direction: column !important;
            gap: 3px !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
            justify-content: center !important;
          }
          
          .certification-badge {
            font-size: 8px !important;
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
            background: rgba(255, 255, 255, 0.08) !important;
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
            border-top: 3px solid #fbbf24 !important;
          }
          .social-link {
            border: 2px solid var(--border) !important;
          }
          .social-link:hover {
            background: var(--accent-hover) !important;
          }
        }
      `
      }</style>
    </footer>
  );
};
export default Footer;