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
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  fechaNacimiento: string;
  direccion: string;
  genero: '' | 'masculino' | 'femenino' | 'otro';
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  telefono?: string;
  email?: string;
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

// Backend API base (sin proxy de Vite)
const API_BASE = 'http://localhost:3000/api';

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
  // Permitir recibir id_curso por URL, si no, mapear por clave localmente
  const cursoIdMap: Record<string, number> = {
    cosmetologia: 1,
    cosmiatria: 2,
    maquillaje: 3,
    lashista: 4,
    unas: 5,
    integral: 6,
    facial: 1 // facial apunta a cosmetología en este dataset
  };
  const idCursoFromUrl = params.get('id_curso');
  const cursoId = Number(idCursoFromUrl ?? cursoIdMap[cursoKey] ?? 0);
  const curso = detallesCursos[cursoKey];

  const [selectedPayment, setSelectedPayment] = useState('paypal');
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    fechaNacimiento: '',
    direccion: '',
    genero: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [codigoSolicitud, setCodigoSolicitud] = useState<string | null>(null);

  // Validador estricto de cédula ecuatoriana
  const validateCedulaEC = (ced: string): { ok: boolean; reason?: string } => {
    if (!/^\d{10}$/.test(ced)) return { ok: false, reason: 'La cédula debe tener exactamente 10 dígitos' };
    // Rechazar repetitivas (0000000000, 1111111111, ...)
    if (/^(\d)\1{9}$/.test(ced)) return { ok: false, reason: 'La cédula es inválida (repetitiva)' };
    const prov = parseInt(ced.slice(0, 2), 10);
    if (prov < 1 || prov > 24) return { ok: false, reason: 'Código de provincia inválido (01-24)' };
    const digits = ced.split('').map(n => parseInt(n, 10));
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let val = digits[i];
      if ((i + 1) % 2 !== 0) { // posiciones impares 1,3,5,7,9
        val = val * 2;
        if (val > 9) val -= 9;
      }
      sum += val;
    }
    const nextTen = Math.ceil(sum / 10) * 10;
    const verifier = (nextTen - sum) % 10; // si es 10, queda 0
    if (verifier !== digits[9]) return { ok: false, reason: 'Dígito verificador inválido' };
    return { ok: true };
  };

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
    if (!file) { setUploadedFile(null); return; }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(file.type)) {
      alert('Formato no permitido. Usa PDF, JPG, PNG o WEBP.');
      return;
    }
    if (file.size > maxBytes) {
      alert('El archivo supera 5MB. Por favor, sube un archivo más pequeño.');
      return;
    }
    setUploadedFile(file);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validaciones mínimas
    if (!formData.apellido) {
      alert('Apellido es obligatorio');
      return;
    }
    // Email formato básico
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email);
    if (!emailOk) {
      setErrors((prev) => ({ ...prev, email: 'Ingresa un correo válido' }));
      alert('Correo electrónico inválido.');
      return;
    }
    // Cédula: validar solo que tenga exactamente 10 dígitos en el submit
    if (!/^\d{10}$/.test(formData.cedula)) {
      alert('La cédula debe tener exactamente 10 dígitos.');
      return;
    }
    // Teléfono Ecuador: 10 dígitos iniciando con 09
    if (!/^09\d{8}$/.test(formData.telefono)) {
      alert('El teléfono debe tener 10 dígitos y comenzar con 09 (formato Ecuador).');
      return;
    }
    if (selectedPayment === 'transferencia') {
      if (!uploadedFile) {
        alert('Por favor, sube el comprobante de transferencia');
        return;
      }
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(uploadedFile.type)) {
        alert('Formato no permitido. Usa PDF, JPG, PNG o WEBP.');
        return;
      }
      if (uploadedFile.size > 5 * 1024 * 1024) {
        alert('El archivo supera 5MB.');
        return;
      }
    }

    try {
      let response: Response;
      if (selectedPayment === 'transferencia') {
        const body = new FormData();
        body.append('cedula_solicitante', formData.cedula);
        body.append('nombre_solicitante', formData.nombre);
        body.append('apellido_solicitante', formData.apellido);
        body.append('telefono_solicitante', formData.telefono);
        body.append('email_solicitante', formData.email);
        if (formData.fechaNacimiento) body.append('fecha_nacimiento_solicitante', formData.fechaNacimiento);
        if (formData.direccion) body.append('direccion_solicitante', formData.direccion);
        if (formData.genero) body.append('genero_solicitante', formData.genero);
        body.append('id_curso', String(cursoId));
        body.append('monto_matricula', String(curso.precio));
        body.append('metodo_pago', 'transferencia');
        if (uploadedFile) body.append('comprobante', uploadedFile);

        response = await fetch(`${API_BASE}/solicitudes`, {
          method: 'POST',
          body
        });
      } else {
        const payload = {
          cedula_solicitante: formData.cedula,
          nombre_solicitante: formData.nombre,
          apellido_solicitante: formData.apellido,
          telefono_solicitante: formData.telefono,
          email_solicitante: formData.email,
          fecha_nacimiento_solicitante: formData.fechaNacimiento || null,
          direccion_solicitante: formData.direccion || null,
          genero_solicitante: formData.genero || null,
          id_curso: cursoId,
          monto_matricula: curso.precio,
          metodo_pago: 'paypal'
        };

        response = await fetch(`${API_BASE}/solicitudes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Error al enviar la solicitud');
      }
      const data = await response.json();
      if (data?.codigo_solicitud) setCodigoSolicitud(data.codigo_solicitud);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/cursos');
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('No se pudo enviar la solicitud. Intenta nuevamente.');
    }
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
          {codigoSolicitud && (
            <p style={{
              color: '#fbbf24',
              fontWeight: 700,
              marginTop: -8,
              marginBottom: 16
            }}>
              Código de solicitud: {codigoSolicitud}
            </p>
          )}
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
                        Nombre *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          const removedInvalid = val.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                          const filtered = removedInvalid.toUpperCase();
                          setFormData({ ...formData, nombre: filtered });
                          const hadInvalid = removedInvalid.length !== val.length;
                          setErrors((prev) => ({ ...prev, nombre: hadInvalid ? 'Este dato es solo letras' : undefined }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: errors.nombre ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                      {errors.nombre && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.nombre}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.apellido}
                        onChange={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          const removedInvalid = val.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
                          const filtered = removedInvalid.toUpperCase();
                          setFormData({ ...formData, apellido: filtered });
                          const hadInvalid = removedInvalid.length !== val.length;
                          setErrors((prev) => ({ ...prev, apellido: hadInvalid ? 'Este dato es solo letras' : undefined }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: errors.apellido ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                      {errors.apellido && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.apellido}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campos adicionales solicitados */}
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
                        Cédula/DNI *
                      </label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        pattern="^[0-9]{10}$"
                        maxLength={10}
                        minLength={10}
                        title="Ingrese exactamente 10 dígitos de cédula ecuatoriana"
                        value={formData.cedula}
                        onChange={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          const filtered = val.replace(/\D/g, '');
                          setFormData({ ...formData, cedula: filtered });
                          // Validación en vivo
                          let msg: string | undefined = undefined;
                          if (val !== filtered) {
                            msg = 'Este dato es solo numérico';
                          } else if (filtered.length === 10) {
                            const res = validateCedulaEC(filtered);
                            if (!res.ok) msg = res.reason || 'Cédula inválida';
                          } else if (filtered.length > 0 && filtered.length < 10) {
                            msg = 'Debe tener 10 dígitos';
                          }
                          setErrors((prev) => ({ ...prev, cedula: msg }));
                        }}
                        onInvalid={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('La cédula debe tener exactamente 10 dígitos numéricos');
                        }}
                        onInput={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: errors.cedula ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                      {errors.cedula && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.cedula}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '600',
                        color: '#fff'
                      }}>
                        Fecha de Nacimiento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.fechaNacimiento}
                        onChange={(e) => setFormData({ ...formData, fechaNacimiento: (e.target as HTMLInputElement).value })}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => {
                          const el = e.target as HTMLInputElement;
                          const val = el.value.trim();
                          // Permitir que el usuario escriba DD/MM/AAAA o DD-MM-AAAA y normalizar a AAAA-MM-DD
                          const m1 = val.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
                          if (m1) {
                            const [_, dd, mm, yyyy] = m1;
                            const norm = `${yyyy}-${mm}-${dd}`;
                            setFormData(prev => ({ ...prev, fechaNacimiento: norm }));
                            el.value = norm;
                            el.setCustomValidity('');
                            // Restaurar borde original al salir
                            el.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                            return;
                          }
                          // Validar AAAA-MM-DD; si no cumple, mostrar mensaje
                          if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                            el.setCustomValidity('Formato de fecha inválido. Usa el selector o escribe DD/MM/AAAA.');
                          } else {
                            el.setCustomValidity('');
                          }
                          // Restaurar borde original al salir
                          el.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                        }}
                        onInvalid={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('Formato de fecha inválido. Usa el selector o escribe DD/MM/AAAA.');
                        }}
                        onInput={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('');
                        }}
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
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#fff'
                    }}>
                      Dirección
                    </label>
                    <textarea
                      required
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: (e.target as HTMLTextAreaElement).value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid rgba(251, 191, 36, 0.2)',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        transition: 'border-color 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.4)',
                        color: '#fff',
                        minHeight: '90px'
                      }}
                      onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#fbbf24'}
                      onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: '600',
                      color: '#fff'
                    }}>
                      Género
                    </label>
                    <select
                      required
                      value={formData.genero}
                      onChange={(e) => setFormData({ ...formData, genero: (e.target as HTMLSelectElement).value as FormData['genero'] })}
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
                      onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#fbbf24'}
                      onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                    >
                      <option value="" disabled>Seleccionar</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                    </select>
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
                        inputMode="email"
                        pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                        title="Ingresa un correo válido (ej: usuario@dominio.com)"
                        value={formData.email}
                        onChange={(e) => {
                          const raw = (e.target as HTMLInputElement).value;
                          const val = raw.toLowerCase();
                          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);
                          setFormData({ ...formData, email: val });
                          setErrors((prev) => ({ ...prev, email: ok || val === '' ? undefined : 'Ingresa un correo válido' }));
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: errors.email ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                      {errors.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.email}</span>
                        </div>
                      )}
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
                        inputMode="numeric"
                        pattern="^09[0-9]{8}$"
                        maxLength={10}
                        minLength={10}
                        title="Formato Ecuador: 10 dígitos y empieza con 09"
                        value={formData.telefono}
                        onChange={(e) => {
                          const val = (e.target as HTMLInputElement).value;
                          const filtered = val.replace(/\D/g, '');
                          setFormData({ ...formData, telefono: filtered });
                          let msg: string | undefined = undefined;
                          if (val !== filtered) {
                            msg = 'Este dato es solo numérico';
                          } else if (filtered && !filtered.startsWith('09')) {
                            msg = 'El teléfono debe empezar con 09';
                          }
                          setErrors((prev) => ({ ...prev, telefono: msg }));
                        }}
                        onInvalid={(e) => {
                          (e.target as HTMLInputElement).setCustomValidity('Formato Ecuador: debe empezar con 09 y tener 10 dígitos');
                        }}
                        onInput={(e) => {
                          const el = e.target as HTMLInputElement;
                          const v = el.value;
                          if (v && !/^09/.test(v)) {
                            el.setCustomValidity('El teléfono debe empezar con 09');
                          } else {
                            el.setCustomValidity('');
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: errors.telefono ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: 'rgba(0, 0, 0, 0.4)',
                          color: '#fff'
                        }}
                        onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      />
                      {errors.telefono && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.telefono}</span>
                        </div>
                      )}
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
                            accept=".pdf,image/jpeg,image/png,image/webp"
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
                                Formatos: PDF, JPG, PNG, WEBP (Máx. 5MB)
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