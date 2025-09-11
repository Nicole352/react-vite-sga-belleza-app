import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Mail,
  Shield,
  ArrowRight,
  Lock,
  LogIn
} from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Efecto para manejar redirección cuando cambia el estado de autenticación
  useEffect(() => {
    console.log('🔄 Login useEffect - isAuthenticated:', isAuthenticated, 'user:', user?.rol, 'authLoading:', authLoading);
    
    if (!authLoading && isAuthenticated && user) {
      console.log('✅ Usuario autenticado, redirigiendo según rol:', user.rol);
      
      // Usar setTimeout para asegurar que la redirección ocurra después del render
      setTimeout(() => {
        switch (user.rol) {
          case 'superadmin':
            console.log('🚀 Redirigiendo a panel superadmin');
            navigate('/panel/superadmin', { replace: true });
            break;
          case 'administrativo':
            console.log('🚀 Redirigiendo a panel administrativo');
            navigate('/panel/administrativo', { replace: true });
            break;
          default:
            console.log('🚀 Redirigiendo a aula virtual');
            navigate('/aula-virtual', { replace: true });
            break;
        }
      }, 100);
    }
  }, [isAuthenticated, user, navigate, authLoading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('🔐 Iniciando proceso de login...');

    try {
      const result = await login(formData.email, formData.password);
      
      console.log('📝 Resultado del login:', result);
      
      if (result.success) {
        console.log('✅ Login exitoso, esperando redirección...');
        // No hacemos nada aquí, el useEffect se encargará de la redirección
      } else {
        console.log('❌ Login fallido:', result.error);
        setError(result.error || 'Error en el login');
      }
    } catch (err) {
      console.error('❌ Error en el proceso de login:', err);
      setError('Error de conexión con el servidor');
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

  // Mostrar loading mientras se verifica la autenticación inicial
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #ef4444',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Verificando sesión...
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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '60px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo/Icono */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          borderRadius: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
        }}>
          <Shield size={32} color="#fff" />
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0 0 12px 0'
          }}>
            Panel Administrativo
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Accede a tu panel de administración
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                placeholder="admin@belleza.edu"
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Mail size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.5)'
              }} />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 56px 16px 48px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <Lock size={20} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.5)'
              }} />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.3s ease'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              color: '#ef4444',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '16px',
              background: isLoading 
                ? 'rgba(239, 68, 68, 0.5)' 
                : 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              boxShadow: isLoading ? 'none' : '0 12px 24px rgba(239, 68, 68, 0.3)'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Iniciando Sesión...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Ingresar al Panel
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.1)',
          borderRadius: '12px'
        }}>
          <h4 style={{
            color: '#10b981',
            fontSize: '0.9rem',
            fontWeight: '600',
            margin: '0 0 12px 0',
            textAlign: 'center'
          }}>
            Credenciales de Prueba
          </h4>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>SuperAdmin:</strong><br />
              Email: admin@belleza.edu<br />
              Password: admin123
            </div>
            <div>
              <strong>Administrativo:</strong><br />
              Email: coord@belleza.edu<br />
              Password: coord123
            </div>
          </div>
        </div>

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
};

export default Login;