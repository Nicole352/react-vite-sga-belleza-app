import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// Interfaces para tipado
interface CursoInfo {
  titulo: string;
  precio: number;
  duracion: string;
  imagen: string;
}

interface DetallesCursos {
  [key: string]: CursoInfo;
}

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  cedula: string;
}

interface PaymentCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}
import { 
  ArrowLeftCircle,
  CreditCard,
  QrCode,
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  FileImage,
  Sparkles,
  Shield
} from 'lucide-react';
import Footer from '../components/Footer';

// Datos de cursos (mismos que en DetalleCurso)
const detallesCursos: DetallesCursos = {
  cosmetologia: {
    titulo: 'Cosmetología',
    precio: 2500,
    duracion: '6 meses',
    imagen: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80'
  },
  cosmiatria: {
    titulo: 'Cosmiatría',
    precio: 3200,
    duracion: '8 meses',
    imagen: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
  },
  maquillaje: {
    titulo: 'Maquillaje Profesional',
    precio: 1800,
    duracion: '4 meses',
    imagen: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'
  },
  lashista: {
    titulo: 'Lashista Profesional',
    precio: 1500,
    duracion: '3 meses',
    imagen: 'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?auto=format&fit=crop&w=600&q=80'
  },
  unas: {
    titulo: 'Técnico en Uñas',
    precio: 2000,
    duracion: '5 meses',
    imagen: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
  },
  integral: {
    titulo: 'Belleza Integral',
    precio: 4500,
    duracion: '12 meses',
    imagen: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80'
  },
  facial: {
    titulo: 'Cosmetología',
    precio: 2500,
    duracion: '6 meses',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1755893924/cursos_xrnjuu.png'
  }
};

const Pago: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const cursoKey = params.get('curso') || 'facial';
  const curso = detallesCursos[cursoKey];

  const [selectedPayment, setSelectedPayment] = useState('paypal');
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    cedula: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

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
        <Link to="/cursos" style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#000',
          padding: '12px 32px',
          borderRadius: '30px',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '700'
        }}>
          Ver Cursos
        </Link>
        <Footer />
      </div>
    );
  }

  const handleFileUpload = (file: File | null) => {
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
      setUploadedFile(file);
    } else {
      alert('Por favor, sube solo archivos de imagen (JPG, PNG)');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPayment === 'transferencia' && !uploadedFile) {
      alert('Por favor, sube el comprobante de transferencia');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      navigate('/cursos');
    }, 3000);
  };

  const PaymentCard: React.FC<PaymentCardProps> = ({ title, icon, description, isSelected, onClick }) => (
    <div
      onClick={onClick}
      style={{
        padding: '24px',
        borderRadius: '20px',
        border: isSelected ? '2px solid #fbbf24' : '2px solid rgba(255, 255, 255, 0.1)',
        background: isSelected 
          ? 'rgba(251, 191, 36, 0.1)' 
          : 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isSelected 
          ? '0 12px 40px rgba(251, 191, 36, 0.3)' 
          : '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: isSelected 
            ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' 
            : 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isSelected ? '#000' : '#fbbf24'
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{
            color: isSelected ? '#fbbf24' : '#fff',
            fontSize: '1.3rem',
            fontWeight: '700',
            margin: 0
          }}>
            {title}
          </h3>
        </div>
      </div>
      <p style={{
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '1rem',
        margin: 0,
        lineHeight: 1.5
      }}>
        {description}
      </p>
    </div>
  );

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 110
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.92), rgba(26,26,26,0.92))',
          borderRadius: '32px',
          padding: '60px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '0 24px',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            animation: 'pulse 2s infinite'
          }}>
            <CheckCircle size={40} color="#fff" />
          </div>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#fff',
            marginBottom: '16px'
          }}>
            ¡Pago Procesado!
          </h2>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Hemos recibido tu solicitud de inscripción para <strong>{curso.titulo}</strong>. 
            Te contactaremos pronto para confirmar tu matrícula.
          </p>
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            padding: '20px',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <p style={{
              color: '#b45309',
              fontWeight: '600',
              margin: 0
            }}>
              Redirigiendo a cursos en 3 segundos...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
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
        `}
      </style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 110,
        paddingBottom: 0
      }}>
        {/* Partículas flotantes */}
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

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Botón volver */}
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
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateX(-5px)';
              target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.2)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateX(0)';
              target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            }}
          >
            <ArrowLeftCircle size={24} />
            Volver
          </button>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start'
          }}>
            {/* Panel izquierdo - Información del curso */}
            <div style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '24px',
                lineHeight: 1.2
              }}>
                Finalizar Inscripción
              </h1>

              {/* Card del curso */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))',
                borderRadius: '24px',
                padding: '32px',
                marginBottom: '40px',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <img 
                    src={curso.imagen} 
                    alt={curso.titulo}
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '16px',
                      objectFit: 'cover',
                      boxShadow: '0 8px 24px rgba(251, 191, 36, 0.2)'
                    }}
                  />
                  <div>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#fff',
                      marginBottom: '8px'
                    }}>
                      {curso.titulo}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} color="#fbbf24" />
                        <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{curso.duracion}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '800',
                      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ${curso.precio.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de seguridad */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '32px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <Shield size={24} color="#10b981" />
                  <span style={{ 
                    color: '#10b981', 
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    Pago Seguro
                  </span>
                </div>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Todos los pagos son procesados de forma segura. Tu información está protegida.
                </p>
              </div>
            </div>

            {/* Panel derecho - Formulario de pago */}
            <div style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '200ms'
            }}>
              <form onSubmit={handleSubmit}>
                {/* Información personal */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <User size={24} color="#fbbf24" />
                    Información Personal
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Cédula/DNI *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.cedula}
                        onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                    </div>
                  </div>
                </div>

                {/* Métodos de pago */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))',
                  borderRadius: '24px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                }}>
                  <h3 style={{
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <CreditCard size={24} color="#fbbf24" />
                    Método de Pago
                  </h3>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <PaymentCard
                      title="PayPal"
                      icon={<CreditCard size={24} />}
                      description="Pago seguro y rápido con tu cuenta de PayPal"
                      isSelected={selectedPayment === 'paypal'}
                      onClick={() => setSelectedPayment('paypal')}
                    />
                    
                    <PaymentCard
                      title="Transferencia Bancaria"
                      icon={<QrCode size={24} />}
                      description="Transfiere directamente a nuestra cuenta bancaria"
                      isSelected={selectedPayment === 'transferencia'}
                      onClick={() => setSelectedPayment('transferencia')}
                    />
                  </div>

                  {/* Contenido específico según método seleccionado */}
                  {selectedPayment === 'paypal' && (
                    <div style={{
                      padding: '24px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }}>
                      <h4 style={{
                        color: '#b45309',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        marginBottom: '16px'
                      }}>
                        Pagar con PayPal
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '20px',
                        lineHeight: 1.6
                      }}>
                        Serás redirigido a PayPal para completar tu pago de forma segura.
                      </p>
                      <div style={{
                        background: '#0070ba',
                        color: '#fff',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        PayPal - ${curso.precio.toLocaleString()}
                      </div>
                    </div>
                  )}

                  {selectedPayment === 'transferencia' && (
                    <div style={{
                      padding: '24px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '16px',
                      border: '1px solid rgba(251, 191, 36, 0.3)'
                    }}>
                      <h4 style={{
                        color: '#b45309',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <QrCode size={20} />
                        Datos para Transferencia
                      </h4>
                      
                      {/* QR Code placeholder */}
                      <div style={{
                        display: 'flex',
                        gap: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          width: '150px',
                          height: '150px',
                          background: 'rgba(0, 0, 0, 0.6)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                          flexShrink: 0
                        }}>
                          <QrCode size={100} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '12px'
                          }}>
                            <div style={{ marginBottom: '8px' }}>
                              <strong style={{ color: '#fff' }}>Banco:</strong>
                              <span style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '8px' }}>Banco Nacional</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong style={{ color: '#fff' }}>Cuenta:</strong>
                              <span style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '8px' }}>123-456789-0</span>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              <strong style={{ color: '#fff' }}>Titular:</strong>
                              <span style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '8px' }}>Academia SGA Belleza</span>
                            </div>
                            <div>
                              <strong style={{ color: '#fff' }}>Monto:</strong>
                              <span style={{ 
                                color: '#fbbf24', 
                                marginLeft: '8px',
                                fontWeight: '700',
                                fontSize: '1.1rem'
                              }}>
                                ${curso.precio.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                            margin: 0,
                            fontStyle: 'italic'
                          }}>
                            Escanea el QR o usa los datos bancarios para realizar la transferencia
                          </p>
                        </div>
                      </div>

                      {/* Subida de comprobante */}
                      <div>
                        <h5 style={{
                          color: '#b45309',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Upload size={18} />
                          Subir Comprobante de Pago *
                        </h5>
                        
                        <div
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          style={{
                            border: `2px dashed ${dragActive || uploadedFile ? '#fbbf24' : 'rgba(251, 191, 36, 0.3)'}`,
                            borderRadius: '16px',
                            padding: '32px',
                            textAlign: 'center',
                            background: dragActive ? 'rgba(251, 191, 36, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                          onClick={() => document.getElementById('fileInput')?.click()}
                        >
                          <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                            style={{ display: 'none' }}
                            required
                          />
                          
                          {uploadedFile ? (
                            <div>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                              }}>
                                <CheckCircle size={30} color="#fff" />
                              </div>
                              <p style={{
                                color: '#10b981',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                marginBottom: '8px'
                              }}>
                                ¡Archivo subido correctamente!
                              </p>
                              <p style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem',
                                marginBottom: '16px'
                              }}>
                                {uploadedFile?.name} ({((uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadedFile(null);
                                }}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '8px',
                                  padding: '8px 16px',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  fontWeight: '500'
                                }}
                              >
                                Cambiar archivo
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div style={{
                                width: '60px',
                                height: '60px',
                                background: 'rgba(251, 191, 36, 0.2)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                              }}>
                                <FileImage size={30} color="#fbbf24" />
                              </div>
                              <p style={{
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '1.1rem',
                                marginBottom: '8px'
                              }}>
                                Arrastra y suelta tu comprobante aquí
                              </p>
                              <p style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem',
                                marginBottom: '16px'
                              }}>
                                o haz clic para seleccionar archivo
                              </p>
                              <p style={{
                                color: '#999',
                                fontSize: '0.8rem'
                              }}>
                                Formatos: JPG, PNG (Máx. 10MB)
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '12px',
                          padding: '16px',
                          marginTop: '16px'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                          }}>
                            <AlertCircle size={18} color="#3b82f6" />
                            <span style={{
                              color: '#3b82f6',
                              fontWeight: '600',
                              fontSize: '0.9rem'
                            }}>
                              Importante
                            </span>
                          </div>
                          <p style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.85rem',
                            margin: 0,
                            lineHeight: 1.4
                          }}>
                            Asegúrate de que el comprobante sea legible y muestre claramente el monto, 
                            fecha y datos de la transferencia. Revisaremos tu pago en máximo 24 horas.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '20px 32px',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 12px 40px rgba(251, 191, 36, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'translateY(-3px) scale(1.02)';
                    target.style.boxShadow = '0 16px 50px rgba(251, 191, 36, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLElement;
                    target.style.transform = 'translateY(0) scale(1)';
                    target.style.boxShadow = '0 12px 40px rgba(251, 191, 36, 0.4)';
                  }}
                >
                  <Sparkles size={20} />
                  {selectedPayment === 'paypal' ? 'Pagar con PayPal' : 'Confirmar Inscripción'}
                </button>

                <p style={{
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.9rem',
                  marginTop: '20px',
                  lineHeight: 1.5
                }}>
                  Al proceder con el pago, aceptas nuestros términos y condiciones.
                  <br />
                  Recibirás un email de confirmación una vez procesado el pago.
                </p>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Pago;