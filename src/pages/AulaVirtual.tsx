import React, { 
  useState, 
  useEffect 
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Importar useAuth
import AOS from 'aos';
import 'aos/dist/aos.css';
import { 
  Eye, 
  EyeOff, 
  Mail,
  Shield,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  User,
  Lock
} from 'lucide-react';

const AulaVirtual = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth(); // Usar AuthContext
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
    AOS.init({ duration: 1000, once: true, easing: 'ease-out-back' });
    setTimeout(() => AOS.refresh(), 0);
  }, []);

  // Manejar redirección automática si ya está autenticado
  useEffect(() => {
    console.log('🎓 AulaVirtual - isAuthenticated:', isAuthenticated, 'user:', user?.rol);
    
    if (!authLoading && isAuthenticated && user) {
      console.log('✅ Usuario ya autenticado, redirigiendo...');
      
      setTimeout(() => {
        switch (user.rol) {
          case 'superadmin':
            navigate('/panel/superadmin');
            break;
          case 'administrativo':
            navigate('/panel/administrativo');
            break;
          default:
            // Para estudiantes y otros roles, mostrar éxito
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            break;
        }
      }, 500);
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    console.log('🎓 AulaVirtual - Intentando login...');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ Login exitoso desde AulaVirtual');
        // La redirección se maneja en el useEffect
      } else {
        setErrorMsg(result.error || 'No se pudo iniciar sesión');
      }
    } catch (err: any) {
      console.error('❌ Error en AulaVirtual login:', err);
      setErrorMsg(err.message || 'No se pudo iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 110,
        fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif"
      }}>
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '60px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 24px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 25px 50px rgba(251, 191, 36, 0.2)'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(251, 191, 36, 0.3)',
            borderTop: '4px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666', fontSize: '1.2rem' }}>
            Verificando sesión...
          </p>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 110,
        fontFamily: "'Cormorant Garamond', 'Playfair Display', 'Georgia', serif"
      }}>
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '60px',
            textAlign: 'center',
            maxWidth: '500px',
            margin: '0 24px',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 25px 50px rgba(251, 191, 36, 0.2)'
          }}
          data-aos="fade-up"
          data-aos-delay="60"
        >
          <div 
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              animation: 'pulse 2s infinite'
            }}
          >
            <CheckCircle size={40} color="#fff" />
          </div>
          <h2 
            style={{
              fontSize: '2.5rem',
              fontWeight: '800',
              color: '#1a1a1a',
              marginBottom: '16px',
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            ¡Bienvenida!
          </h2>
          <p 
            style={{
              color: '#666',
              fontSize: '1.2rem',
              marginBottom: '32px',
              lineHeight: 1.6,
              fontFamily: "'Crimson Text', serif"
            }}
          >
            Has ingresado exitosamente al Aula Virtual como <strong>{user?.rol}</strong>.
          </p>
          <div 
            style={{
              background: 'rgba(251, 191, 36, 0.1)',
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px'
            }}
          >
            <p style={{
              color: '#b45309',
              fontWeight: '600',
              margin: 0,
              fontFamily: "'Montserrat', sans-serif"
            }}>
              {user?.rol === 'estudiante' ? 'Accediendo a tu panel de estudiante...' : 'Redirigiendo...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24, #d97706);
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: inline-block;
            animation: gradientShift 3s ease-in-out infinite;
          }
          
          .login-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #000 0%, #101010 50%, #000 100%);
            position: relative;
            overflow: hidden;
            font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            padding-top: 0;
            display: flex;
            align-items: center;
          }
          
          .main-content {
            max-width: none;
            margin: 0;
            padding: 0;
            position: relative;
            z-index: 1;
            width: 100vw;
          }
          
          .login-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            align-items: stretch;
            min-height: 100vh;
            position: relative;
          }
          
          .image-section {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
            overflow: hidden;
          }
          
          .image-section::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 48px;
            height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.95) 100%);
            z-index: 2;
          }
          
          .hero-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            filter: brightness(0.85) contrast(1.1) saturate(1.05);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .hero-image:hover {
            filter: brightness(0.9) contrast(1.15) saturate(1.1);
            transform: scale(1.02);
          }
          
          .login-section {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 92px 48px 52px;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(14, 14, 14, 0.9) 100%);
            position: relative;
          }
          
          .login-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at left center, rgba(251, 191, 36, 0.03) 0%, transparent 70%);
            z-index: 0;
          }
          
          .login-header {
            text-align: center;
            margin-top: 0;
            margin-bottom: 24px;
            position: relative;
            z-index: 1;
          }
          
          .badge {
            display: inline-flex;
            align-items: center;
            background-color: rgba(251, 191, 36, 0.28);
            border: 1px solid rgba(251, 191, 36, 0.55);
            border-radius: 24px;
            padding: 10px 20px;
            margin-bottom: 12px;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(251, 191, 36, 0.22), inset 0 0 0 1px rgba(0,0,0,0.12);
            font-family: 'Montserrat', 'Inter', 'Helvetica', sans-serif;
            font-weight: 500;
            letter-spacing: 0.5px;
            gap: 8px;
          }
          
          .badge svg {
            color: #fbbf24;
          }
          
          .badge span {
            color: #fff1bf;
            font-size: 1rem;
            font-weight: 500;
          }
          
          .main-title {
            font-size: 3.05rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 12px;
            line-height: 1.1;
            text-shadow: 0 8px 40px rgba(0, 0, 0, 0.9);
            font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            letter-spacing: -0.01em;
            text-align: center;
          }
          
          .subtitle {
            font-size: 1.05rem;
            color: rgba(255, 255, 255, 0.86);
            margin-bottom: 16px;
            line-height: 1.6;
            text-shadow: 0 4px 20px rgba(0, 0, 0, 0.7);
            font-family: 'Montserrat', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            font-weight: 500;
            text-align: center;
          }
          
          .login-form {
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(24px) saturate(140%);
            -webkit-backdrop-filter: blur(24px) saturate(140%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 28px;
            padding: 32px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06);
            position: relative;
            z-index: 1;
            max-width: 640px;
            margin: 0 auto;
            color: #fff;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            align-items: start;
          }
          
          .login-form::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent);
          }
          
          .login-form-section {
            display: flex;
            flex-direction: column;
          }
          
          .form-inputs {
            display: flex;
            flex-direction: column;
          }
          
          .form-group {
            margin-bottom: 16px;
          }
          
          .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: rgba(255,255,255,0.95);
            font-size: 1rem;
            font-family: 'Montserrat', sans-serif;
          }
          
          .input-wrapper {
            position: relative;
          }
          
          .form-input {
            width: 100%;
            padding: 16px 48px 16px 48px;
            border: 1.5px solid rgba(255, 255, 255, 0.15);
            border-radius: 14px;
            font-size: 1.05rem;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 500;
          }
          .form-input::placeholder { color: rgba(255,255,255,0.65); }
          
          .form-input:focus {
            outline: none;
            border-color: rgba(251, 191, 36, 0.7);
            box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
            transform: translateY(-2px);
          }
          
          .input-icon {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.7);
            transition: all 0.3s ease;
            z-index: 1;
          }
          
          .form-input:focus + .input-icon,
          .form-input:not(:placeholder-shown) + .input-icon {
            color: #fbbf24;
            transform: translateY(-50%) scale(1.1);
          }
          
          .password-toggle {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: rgba(255,255,255,0.75);
            transition: all 0.3s ease;
            padding: 4px;
            border-radius: 8px;
          }
          
          .password-toggle:hover {
            color: #fbbf24;
            background: rgba(251, 191, 36, 0.1);
          }
          
          .login-button {
            width: 100%;
            background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
            background-size: 200% 200%;
            color: black;
            padding: 16px 28px;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 12px 40px rgba(251, 191, 36, 0.4);
            font-family: 'Montserrat', 'Inter', 'Helvetica', sans-serif;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 16px;
            position: relative;
            overflow: hidden;
          }
          
          .login-button:hover:not(:disabled) {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 16px 50px rgba(251, 191, 36, 0.5);
          }
          
          .login-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }
          
          .features-list {
            margin-top: 0;
            padding-top: 0;
            border-top: none;
            padding-left: 0;
          }
          
          .features-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 16px;
            font-family: 'Montserrat', sans-serif;
          }
          
          .feature-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: rgba(255,255,255,0.75);
            font-size: 0.9rem;
            font-family: 'Montserrat', sans-serif;
          }
          
          .loading-spinner {
            width: 24px;
            height: 24px;
            border: 3px solid rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s ease-in-out infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* RESPONSIVE DESIGN */
          @media (max-width: 991px) {
            .login-form {
              grid-template-columns: 1fr;
              gap: 24px;
              max-width: 480px;
              padding: 32px;
            }
            .features-list {
              border-top: 1px solid rgba(251, 191, 36, 0.2);
              padding-top: 16px;
              margin-top: 16px;
            }
          }
        `}
      </style>

      <div className="login-container">
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

        <div className="main-content">
          <div className="login-grid">
            <div 
              className="image-section"
              data-aos="zoom-in"
              data-aos-offset="140"
              style={{
                transform: isVisible ? 'translateX(0)' : 'translateX(-50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80"
                alt="Aula Virtual - Jessica Vélez Escuela de Esteticistas"
                className="hero-image"
              />
            </div>

            <div 
              className="login-section"
              data-aos="zoom-in-up"
              data-aos-delay="120"
              data-aos-offset="140"
              style={{
                transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '200ms'
              }}
            >
              <div className="login-header">
                <div className="badge">
                  <Eye size={16} />
                  <span>Plataforma Virtual de Aprendizaje</span>
                </div>

                <h1 className="main-title">
                  Aula
                  <span className="gradient-text"> Virtual</span>
                </h1>

                <p className="subtitle">
                  Accede a tu plataforma de aprendizaje personalizada. 
                  Continúa tu formación profesional desde cualquier lugar.
                </p>
              </div>

              <form 
                onSubmit={handleSubmit} 
                className="login-form" 
                data-aos="fade-up" 
                data-aos-delay="200"
              >
                <div className="login-form-section">
                  <h3 className="features-title">¿Por qué elegir nuestro Aula Virtual?</h3>
                  <div className="features-list">
                    <div className="feature-item">
                      <Shield size={16} color="#10b981" />
                      <span>Acceso seguro y encriptado</span>
                    </div>
                    <div className="feature-item">
                      <BookOpen size={16} color="#3b82f6" />
                      <span>Material de estudio actualizado</span>
                    </div>
                    <div className="feature-item">
                      <GraduationCap size={16} color="#8b5cf6" />
                      <span>Seguimiento de progreso académico</span>
                    </div>
                    <div className="feature-item">
                      <User size={16} color="#ef4444" />
                      <span>Soporte personalizado 24/7</span>
                    </div>
                  </div>
                </div>

                <div className="login-form-section">
                  <div className="form-inputs">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Correo Electrónico
                      </label>
                      <div className="input-wrapper">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="admin@belleza.edu"
                          required
                        />
                        <Mail size={20} className="input-icon" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="password" className="form-label">
                        Contraseña
                      </label>
                      <div className="input-wrapper">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="••••••••"
                          required
                        />
                        <Lock size={20} className="input-icon" />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="password-toggle"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {errorMsg && (
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#fecaca',
                          padding: '10px 14px',
                          borderRadius: 12,
                          marginBottom: 10
                        }}
                      >
                        {errorMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="login-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner" />
                          Iniciando Sesión...
                        </>
                      ) : (
                        <>
                          Ingresar
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>

                    {/* Credenciales de prueba */}
                    <div style={{
                      marginTop: '20px',
                      padding: '12px',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.1)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      <div style={{ 
                        color: '#10b981', 
                        fontWeight: '600', 
                        marginBottom: '8px', 
                        textAlign: 'center' 
                      }}>
                        Credenciales de Prueba
                      </div>
                      <div>
                        <strong>Admin:</strong> admin@belleza.edu / admin123<br />
                        <strong>Coord:</strong> coord@belleza.edu / coord123
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AulaVirtual;