import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detectar scroll para efecto glass
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detectar resize y cerrar menú automáticamente
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      
      // Si cambia de móvil a desktop, cerrar el menú automáticamente
      if (!mobile && isMobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
      
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, isMenuOpen]); // Agregar dependencias para que detecte los cambios

  // Cerrar menú cuando cambia la ruta (navegación)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Forzar scroll al tope y estado visual consistente del header en cada navegación (antes del paint)
  useLayoutEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (_) {
      // Fallback si el navegador no soporta opciones
      window.scrollTo(0, 0);
    }
    setScrolled(false);
  }, [location.pathname]);

  const isActive = (path: string): boolean => location.pathname === path;

  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    width: '100%',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
    // Efecto glass más transparente
    background: scrolled 
      ? 'rgba(0, 0, 0, 0.6)'
      : 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: scrolled 
      ? '0 8px 40px rgba(0, 0, 0, 0.4)' 
      : '0 4px 20px rgba(0, 0, 0, 0.2)',
    padding: '12px 0',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '100%',
    margin: '0',
    padding: '0 2rem',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    maxWidth: '1920px',
    margin: '0 auto',
    width: '100%',
  };

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
  };

  const logoImageStyle: React.CSSProperties = {
    height: '60px',
    width: 'auto',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: 'drop-shadow(0 4px 15px rgba(251, 191, 36, 0.3))',
    borderRadius: '50%',
  };

  const navLinksStyle: React.CSSProperties = {
    display: isMobile ? 'none' : 'flex',
    gap: '2rem',
    alignItems: 'center',
  };

  const linkStyle = (active: boolean, isAulaVirtual: boolean = false): React.CSSProperties => ({
    fontWeight: isAulaVirtual ? '700' : '600',
    fontSize: isAulaVirtual ? '16px' : '15px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    color: active ? '#fbbf24' : 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    position: 'relative',
    padding: isAulaVirtual ? '12px 20px' : '12px 16px',
    textShadow: active ? '0 0 15px rgba(251, 191, 36, 0.6)' : 'none',
    transform: active ? 'translateY(-2px)' : 'translateY(0)',
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    background: isAulaVirtual 
      ? (active 
          ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))'
          : 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))'
        )
      : 'transparent',
    borderRadius: isAulaVirtual ? '12px' : '8px',
    border: isAulaVirtual ? '1px solid rgba(251, 191, 36, 0.3)' : 'none',
    backdropFilter: isAulaVirtual ? 'blur(10px)' : 'none',
    boxShadow: isAulaVirtual 
      ? (active 
          ? '0 6px 25px rgba(251, 191, 36, 0.3)'
          : '0 4px 20px rgba(251, 191, 36, 0.2)'
        )
      : 'none',
  });

  const linkUnderlineStyle = (active: boolean, isAulaVirtual: boolean = false): React.CSSProperties => ({
    position: 'absolute',
    bottom: isAulaVirtual ? '4px' : '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: active ? '80%' : '0%',
    height: '2px',
    background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)',
    borderRadius: '2px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? '0 0 15px rgba(251, 191, 36, 0.8)' : 'none',
    display: isAulaVirtual ? 'none' : 'block',
  });

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '2px solid rgba(251, 191, 36, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  };

  const mobileMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    background: 'rgba(0, 0, 0, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(251, 191, 36, 0.2)',
    borderRadius: '0 0 20px 20px',
    padding: '20px',
    transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
    opacity: isMenuOpen ? 1 : 0,
    visibility: isMenuOpen ? 'visible' : 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  };

  const mobileLinksStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const mobileLinkStyle = (active: boolean): React.CSSProperties => ({
    fontWeight: '600',
    fontSize: '16px',
    color: active ? '#fbbf24' : 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    position: 'relative',
    padding: '16px 20px',
    borderRadius: '12px',
    background: active 
      ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))' 
      : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
    border: active 
      ? '1px solid rgba(251, 191, 36, 0.4)' 
      : '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontFamily: "'Montserrat', 'Inter', 'Helvetica', sans-serif",
    whiteSpace: 'normal',
  });


// Lista de navegación actualizada
const navigationItems = [
  { path: '/', label: 'Inicio' },
  { path: '/cursos', label: 'Cursos' },
  { path: '/avales', label: 'Avales' },
  { path: '/sobre-nosotros', label: 'Sobre Nosotros' },
  { path: '/contactenos', label: 'Contáctenos' }
];

const aulaVirtualItem = { path: '/aula-virtual', label: 'Aula Virtual', icon: GraduationCap };

return (
  <>
    <nav style={headerStyle} className="glass-header" data-aos="fade-down" data-aos-duration="500">
      <div style={containerStyle} className="header-container">
        <div style={navStyle}>
          {/* Logo con imagen */}
          <Link to="/" style={logoContainerStyle} data-aos="zoom-in" data-aos-duration="600">
            <img 
              src="https://res.cloudinary.com/di090ggjn/image/upload/v1755893582/catjq75bgehyzkzb0ryc.jpg"
              alt="Jessica Vélez - Escuela de Esteticistas"
              style={logoImageStyle}
              className="logo-img"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <div style={navLinksStyle}>
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                style={linkStyle(isActive(item.path))}
                className="nav-link"
                data-active={isActive(item.path)}
              >
                {item.label}
                <div style={linkUnderlineStyle(isActive(item.path))} />
              </Link>
            ))}
            
            {/* Aula Virtual - Destacado */}
            <Link 
              to={aulaVirtualItem.path}
              style={linkStyle(isActive(aulaVirtualItem.path), true)}
              className="aula-virtual-link"
              data-active={isActive(aulaVirtualItem.path)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={18} />
                <span>{aulaVirtualItem.label}</span>
              </div>
              <div style={linkUnderlineStyle(isActive(aulaVirtualItem.path), true)} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={mobileMenuButtonStyle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? 
              <X size={24} color="#fbbf24" /> : 
              <Menu size={24} color="#fbbf24" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div style={mobileMenuStyle}>
        <div style={mobileLinksStyle}>
          {navigationItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              style={mobileLinkStyle(isActive(item.path))}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Aula Virtual Mobile */}
          <Link 
            to={aulaVirtualItem.path}
            style={{
              ...mobileLinkStyle(isActive(aulaVirtualItem.path)),
              background: isActive(aulaVirtualItem.path)
                ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.15))'
                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05))',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              fontWeight: '700',
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <GraduationCap size={20} />
              <span>{aulaVirtualItem.label}</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>

    {/* Estilos CSS para animaciones */}
    <style>{`
      /* Glass effect refinements */
      .glass-header {
        position: sticky; /* mantiene z-index y ayuda a compositing */
      }
      .glass-header::after {
        content: '';
        position: absolute;
        left: 0; right: 0; top: 0; bottom: 0;
        pointer-events: none;
        background: linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0));
      }
      @media (min-width: 1920px) {
        .header-container {
          padding: 0 4rem !important;
        }
      }

      @media (max-width: 1440px) {
        .header-container {
          padding: 0 2rem !important;
        }
      }

      @media (max-width: 1200px) {
        .header-container {
          padding: 0 1.5rem !important;
        }
      }

      @media (max-width: 1024px) {
        .header-container {
          padding: 0 1rem !important;
        }
      }

      @media (max-width: 768px) {
        .header-container {
          padding: 0 1rem !important;
        }
      }

      @media (max-width: 480px) {
        .header-container {
          padding: 0 0.75rem !important;
        }
      }

      /* Estilos para Aula Virtual */
      .aula-virtual-link {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      .aula-virtual-link[data-active="false"]:hover {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2)) !important;
        transform: translateY(-3px) scale(1.05) !important;
        box-shadow: 0 8px 30px rgba(251, 191, 36, 0.4) !important;
        border-color: rgba(251, 191, 36, 0.6) !important;
      }

      /* Hover para links normales cuando no están activos */
      .nav-link {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .nav-link[data-active="false"]:hover {
        color: #fbbf24 !important;
        transform: translateY(-3px) scale(1.05);
        text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
        background: rgba(251, 191, 36, 0.1);
      }

      /* Hover para el logo */
      .logo-img:hover {
        transform: scale(1.05) !important;
        filter: drop-shadow(0 6px 20px rgba(251, 191, 36, 0.5)) !important;
      }

      /* Hover para el botón del menú móvil */
      .mobile-menu-btn:hover {
        background: rgba(251, 191, 36, 0.2) !important;
        border-color: rgba(251, 191, 36, 0.5) !important;
      }

      /* Limitar transiciones a elementos interactivos del header para evitar cambios globales de layout */
      .nav-link,
      .aula-virtual-link,
      .mobile-menu-btn,
      .logo-img {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
    `}</style>
  </>
);
};
export default Header;