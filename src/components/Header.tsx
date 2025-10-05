import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import ThemeToggleButton from './ThemeToggleButton';
import { useTheme } from '../context/ThemeContext'; // Importar el hook del tema

const Header: React.FC = () => {
  const { colors, theme } = useTheme(); // Obtener colores y tema actual
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (!mobile && isMobile && isMenuOpen) setIsMenuOpen(false);
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setScrolled(false);
  }, [location.pathname]);

  const isActive = (path: string): boolean => location.pathname === path;

  // Estilos dinámicos basados en el tema - usando CSS variables
  const headerStyle: React.CSSProperties = {
    position: 'fixed',
    width: '100%',
    left: 0, right: 0, top: 0,
    zIndex: 1000,
    background: scrolled ? 'var(--header-bg)' : 'transparent',
    backdropFilter: 'blur(24px) saturate(140%)',
    WebkitBackdropFilter: 'blur(24px) saturate(140%)',
    borderBottom: '1px solid var(--header-border)',
    boxShadow: scrolled ? '0 8px 40px var(--shadow)' : 'none',
    padding: '12px 0',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const containerStyle: React.CSSProperties = { maxWidth: '100%', margin: '0', padding: '0 2rem' };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1920px',
    margin: '0 auto',
    width: '100%',
  };

  const logoImageStyle: React.CSSProperties = {
    height: '60px',
    width: 'auto',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: 'drop-shadow(0 4px 15px var(--primary)4D)',
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
    color: active ? 'var(--accent)' : 'var(--text-primary)',
    textDecoration: 'none',
    position: 'relative',
    padding: isAulaVirtual ? '12px 20px' : '12px 16px',
    textShadow: active ? '0 0 15px var(--accent)99' : 'none',
    transform: active ? 'translateY(-2px)' : 'translateY(0)',
    fontFamily: "'Inter', 'Montserrat', sans-serif",
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    background: isAulaVirtual 
      ? (theme === 'dark' 
          ? (active ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.3)')
          : (active ? 'rgba(251, 191, 36, 0.06)' : 'rgba(251, 191, 36, 0.04)'))
      : 'transparent',
    borderRadius: isAulaVirtual ? '12px' : '8px',
    border: isAulaVirtual 
      ? (theme === 'dark'
          ? '1.5px solid rgba(251, 191, 36, 0.5)'
          : '1px solid rgba(251, 191, 36, 0.15)')
      : 'none',
    backdropFilter: isAulaVirtual ? 'blur(10px)' : 'none',
    boxShadow: isAulaVirtual 
      ? (theme === 'dark'
          ? (active 
              ? '0 6px 25px rgba(251, 191, 36, 0.3)' 
              : '0 4px 15px rgba(251, 191, 36, 0.15)')
          : (active
              ? '0 2px 6px rgba(251, 191, 36, 0.04)'
              : '0 1px 4px rgba(251, 191, 36, 0.03)'))
      : 'none',
  });
  
  const linkUnderlineStyle = (active: boolean, isAulaVirtual: boolean = false): React.CSSProperties => ({
    position: 'absolute',
    bottom: isAulaVirtual ? '4px' : '6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: active ? '80%' : '0%',
    height: '2px',
    background: 'linear-gradient(90deg, var(--accent), var(--primary), var(--accent))',
    borderRadius: '2px',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: active ? '0 0 15px var(--accent)CC' : 'none',
    display: isAulaVirtual ? 'none' : 'block',
  });

  const mobileMenuButtonStyle: React.CSSProperties = {
    display: isMobile ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--primary)1A',
    border: '2px solid var(--primary)4D',
    borderRadius: '12px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  };

  const mobileMenuStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 1px)',
    left: 0, right: 0,
    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--header-border)',
    borderRadius: '0 0 20px 20px',
    padding: '20px',
    transform: isMenuOpen ? 'translateY(0)' : 'translateY(-20px)',
    opacity: isMenuOpen ? 1 : 0,
    visibility: isMenuOpen ? 'visible' : 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 20px 40px var(--shadow)',
  };

  const mobileLinkStyle = (active: boolean): React.CSSProperties => ({
    fontWeight: '600',
    fontSize: '16px',
    color: active ? 'var(--accent)' : 'var(--text-primary)',
    textDecoration: 'none',
    position: 'relative',
    padding: '16px 20px',
    borderRadius: '12px',
    background: active ? 'var(--primary)33' : 'var(--primary)1A',
    border: active ? '1px solid var(--primary)66' : '1px solid var(--header-border)',
    textAlign: 'center',
    fontFamily: "'Montserrat', 'Inter', 'Helvetica', sans-serif",
    whiteSpace: 'normal',
  });

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
            <Link to="/" style={{display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'all 0.3s ease'}} data-aos="zoom-in" data-aos-duration="600">
              <img 
                src="https://res.cloudinary.com/di090ggjn/image/upload/v1757037016/clbfrmifo1mbpzma5qts.png"
                alt="Jessica Vélez - Escuela de Esteticistas"
                style={logoImageStyle}
                className="logo-img"
              />
            </Link>

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
              <ThemeToggleButton />
            </div>

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

        <div style={mobileMenuStyle}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
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

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <ThemeToggleButton />
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        .glass-header {
          position: sticky;
        }
        .glass-header::after {
          content: '';
          position: absolute;
          left: 0; right: 0; top: 0; bottom: 0;
          pointer-events: none;
          background: linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0));
        }
        @media (min-width: 1920px) { .header-container { padding: 0 4rem !important; } }
        @media (max-width: 1440px) { .header-container { padding: 0 2rem !important; } }
        @media (max-width: 1200px) { .header-container { padding: 0 1.5rem !important; } }
        @media (max-width: 1024px) { .header-container { padding: 0 1rem !important; } }
        @media (max-width: 768px) { .header-container { padding: 0 1rem !important; } }
        @media (max-width: 480px) { .header-container { padding: 0 0.75rem !important; } }
        .aula-virtual-link { 
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative;
          overflow: hidden;
        }
        
        .aula-virtual-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          transition: left 0.6s ease;
        }
        
        .aula-virtual-link:hover::before {
          left: 100%;
        }
        
        .aula-virtual-link[data-active="false"]:hover {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(245, 158, 11, 0.2)) !important;
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: 0 8px 30px rgba(251, 191, 36, 0.4) !important;
          border-color: rgba(251, 191, 36, 0.6) !important;
        }
        
        .aula-virtual-link[data-active="true"] {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 6px 25px rgba(251, 191, 36, 0.3);
          }
          50% {
            box-shadow: 0 6px 35px rgba(251, 191, 36, 0.5);
          }
        }
        
        .nav-link { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .nav-link[data-active="false"]:hover {
          color: #fbbf24 !important;
          transform: translateY(-3px) scale(1.05);
          text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
          background: rgba(251, 191, 36, 0.1);
        }
        .logo-img:hover {
          transform: scale(1.05) !important;
          filter: drop-shadow(0 6px 20px rgba(251, 191, 36, 0.5)) !important;
        }
        .mobile-menu-btn:hover {
          background: rgba(251, 191, 36, 0.2) !important;
          border-color: rgba(251, 191, 36, 0.5) !important;
        }
        .nav-link, .aula-virtual-link, .mobile-menu-btn, .logo-img {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
};
export default Header;