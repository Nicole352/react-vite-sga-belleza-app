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
  pasaporte?: string;
  tipoDocumento: '' | 'ecuatoriano' | 'extranjero';
  fechaNacimiento: string;
  direccion: string;
  genero: '' | 'masculino' | 'femenino' | 'otro';
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  pasaporte?: string;
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
  Shield,
  Globe
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
  // Detección automática de similitud entre nombres de cursos y cards
  const getMatchingTipoCurso = (cursoKey: string, tiposCursos: any[]) => {
    // Nombres base de las cards para comparación automática
    const cardNames: Record<string, string[]> = {
      maquillaje: ['maquillaje', 'makeup', 'make up'],
      unas: ['uñas', 'unas', 'manicure', 'pedicure', 'nail'],
      cosmetologia: ['cosmetología', 'cosmetologia', 'depilación', 'depilacion'],
      facial: ['facial', 'faciales', 'rostro', 'cara'],
      cosmiatria: ['cosmiatría', 'cosmiatria', 'masajes', 'massage'],
      integral: ['integral', 'belleza', 'peluquería', 'peluqueria', 'estilismo', 'hair'],
      lashista: ['pestañas', 'pestanas', 'lashes', 'extensiones', 'lash']
    };
    
    // Función para calcular similitud entre strings
    const calculateSimilarity = (str1: string, str2: string): number => {
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      
      // Coincidencia exacta
      if (s1 === s2) return 1.0;
      
      // Contiene la palabra completa
      if (s1.includes(s2) || s2.includes(s1)) return 0.8;
      
      // Similitud por palabras comunes
      const words1 = s1.split(/\s+/);
      const words2 = s2.split(/\s+/);
      const commonWords = words1.filter(w => words2.some(w2 => w2.includes(w) || w.includes(w2)));
      
      if (commonWords.length > 0) {
        return commonWords.length / Math.max(words1.length, words2.length) * 0.6;
      }
      
      return 0;
    };
    
    let bestMatch: any = null;
    let bestScore = 0;
    
    // Buscar el mejor match para cada curso
    tiposCursos.forEach((tc: any) => {
      const nombreCurso = tc.nombre;
      
      // Comparar con nombres base de la card
      const cardKeywords = cardNames[cursoKey] || [cursoKey];
      
      cardKeywords.forEach(keyword => {
        const score = calculateSimilarity(nombreCurso, keyword);
        if (score > bestScore && score > 0.3) { // Umbral mínimo de similitud
          bestScore = score;
          bestMatch = tc;
        }
      });
      
      // También comparar directamente con el nombre de la card
      const directScore = calculateSimilarity(nombreCurso, cursoKey);
      if (directScore > bestScore && directScore > 0.3) {
        bestScore = directScore;
        bestMatch = tc;
      }
    });
    
    console.log(`Mejor match para card '${cursoKey}':`, bestMatch?.nombre, `(score: ${bestScore.toFixed(2)})`);
    return bestMatch;
  };
  // Eliminamos la referencia al mapeo estático ya que ahora es dinámico
  const [tipoCursoId, setTipoCursoId] = useState<number>(0);
  const curso = detallesCursos[cursoKey];

  const [selectedPayment, setSelectedPayment] = useState<'transferencia' | 'payphone' | 'efectivo'>('transferencia');
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitAlert, setSubmitAlert] = useState<null | { type: 'error' | 'info' | 'success'; text: string }>(null);
  const [alertAnimatingOut, setAlertAnimatingOut] = useState(false);
  const [tipoCursoBackend, setTipoCursoBackend] = useState<any | null>(null);
  const [tiposCursosDisponibles, setTiposCursosDisponibles] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    pasaporte: '',
    tipoDocumento: '',
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


  // Cargar tipos de cursos disponibles
  useEffect(() => {
    let cancelled = false;

    const loadTiposCursos = async () => {
      if (cancelled) return;
      try {
        const resTipo = await fetch(`${API_BASE}/tipos-cursos?estado=activo`);
        if (!resTipo.ok) return;
        const tiposCursos = await resTipo.json();
        setTiposCursosDisponibles(tiposCursos);
        
        // Resolución por card_key (preferida) y fallback a similitud
        console.log('=== RESOLUCIÓN TIPO ===');
        console.log('Card (query ?curso=):', cursoKey);
        console.log('Tipos disponibles:', tiposCursos.map((tc: any) => `${tc.card_key || '-'} | ${tc.nombre}`));

        // 1) Intentar por card_key directa
        const byCardKey = tiposCursos.find((tc: any) => 
          (tc.card_key || '').toLowerCase() === String(cursoKey).toLowerCase()
        );

        if (byCardKey) {
          console.log('✅ Tipo resuelto por card_key:', byCardKey);
          setTipoCursoId(byCardKey.id_tipo_curso);
        } else {
          // 2) Fallback a similitud si no hay card_key cargada
          const tipoCursoEncontrado = getMatchingTipoCurso(cursoKey, tiposCursos);
          if (tipoCursoEncontrado) {
            console.log('✅ Tipo detectado por similitud:', tipoCursoEncontrado);
            setTipoCursoId(tipoCursoEncontrado.id_tipo_curso);
          } else {
            console.log('❌ No se pudo resolver el tipo para card:', cursoKey);
          }
        }
        console.log('============================');
      } catch {}
    };

    loadTiposCursos();
    return () => { cancelled = true; };
  }, [cursoKey]);

  // Cargar datos del tipo de curso específico y verificar disponibilidad
  useEffect(() => {
    if (!tipoCursoId) return;
    let cancelled = false;

    const loadTipoCurso = async () => {
      if (cancelled) return;
      try {
        // Encontrar el tipo de curso en los datos ya cargados
        const tipoCurso = tiposCursosDisponibles.find((tc: any) => 
          tc.id_tipo_curso === tipoCursoId
        );
        
        if (tipoCurso) {
          // Verificar todos los cursos de este tipo (activos, planificados, cancelados)
          const resCursos = await fetch(`${API_BASE}/cursos?tipo=${tipoCursoId}`);
          if (resCursos.ok) {
            const todosCursos = await resCursos.json();
            
            // Contar cursos por estado
            const cursosActivos = todosCursos.filter((c: any) => 
              c.estado === 'activo' && Number(c.cupos_disponibles || 0) > 0
            );
            const cursosPlanificados = todosCursos.filter((c: any) => 
              c.estado === 'planificado'
            );
            const cursosCancelados = todosCursos.filter((c: any) => 
              c.estado === 'cancelado'
            );
            
            // Hay disponibilidad si hay cursos activos con cupos O cursos planificados
            const hayDisponibles = cursosActivos.length > 0 || cursosPlanificados.length > 0;
            
            setTipoCursoBackend({
              ...tipoCurso,
              disponible: hayDisponibles,
              cursosActivos: cursosActivos.length,
              cursosPlanificados: cursosPlanificados.length,
              cursosCancelados: cursosCancelados.length,
              totalCursos: todosCursos.length
            });
          } else {
            // Si no se pueden cargar los cursos, asumir no disponible
            setTipoCursoBackend({
              ...tipoCurso,
              disponible: false,
              cursosActivos: 0,
              cursosPlanificados: 0,
              cursosCancelados: 0,
              totalCursos: 0
            });
          }
        }
      } catch {}
    };

    // Carga inicial
    loadTipoCurso();

    // Recargar cuando la pestaña recupere foco o visibilidad
    const onFocus = () => loadTipoCurso();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadTipoCurso();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [tipoCursoId, tiposCursosDisponibles]);

  // Bloqueo también si no se resolvió el tipo/curso (no existe)
  const notFoundOrNoCourse = !tipoCursoId || !tipoCursoBackend;
  const isBlocked = notFoundOrNoCourse || (!!tipoCursoBackend && (!tipoCursoBackend.disponible || tipoCursoBackend.estado !== 'activo'));
  
  // Debug: mostrar estado del tipo de curso
  console.log('=== DEBUG BLOQUEO ===');
  console.log('cursoKey:', cursoKey);
  console.log('cursoKey:', cursoKey);
  console.log('tipoCursoId:', tipoCursoId);
  console.log('tipoCursoBackend:', tipoCursoBackend);
  console.log('isBlocked:', isBlocked);
  if (tipoCursoBackend) {
    console.log(`Cursos - Activos: ${tipoCursoBackend.cursosActivos}, Planificados: ${tipoCursoBackend.cursosPlanificados}, Cancelados: ${tipoCursoBackend.cursosCancelados}`);
    console.log('Disponible:', tipoCursoBackend.disponible);
    console.log('Estado tipo curso:', tipoCursoBackend.estado);
  }
  console.log('=====================');

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
    if (isBlocked) return; // bloquear interacción
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
    if (isBlocked) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBlocked) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Bloqueo por estado/cupos desde backend
    if (isBlocked) {
      alert(notFoundOrNoCourse
        ? 'No existe cursos disponibles.'
        : 'La matrícula para este curso está cerrada o no hay cupos disponibles.'
      );
      return;
    }
    if (!formData.tipoDocumento) {
      alert('Selecciona el tipo de documento (Cédula o Pasaporte).');
      return;
    }
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
    // Documento: validar según tipo seleccionado
    const isEcuatoriano = formData.tipoDocumento === 'ecuatoriano';
    const documento = isEcuatoriano ? formData.cedula : (formData.pasaporte || '');
    if (isEcuatoriano) {
      if (!/^\d{10}$/.test(documento)) {
        alert('La cédula debe tener exactamente 10 dígitos.');
        return;
      }
    } else {
      // Pasaporte: alfanumérico 6-20, mayúsculas
      if (!/^[A-Z0-9]{6,20}$/.test(documento.toUpperCase())) {
        setErrors((prev) => ({ ...prev, pasaporte: 'Pasaporte inválido (use 6-20 caracteres alfanuméricos)' }));
        alert('Pasaporte inválido. Use 6-20 caracteres alfanuméricos.');
        return;
      }
    }
    // Teléfono Ecuador: 10 dígitos iniciando con 09
    if (!/^09\d{8}$/.test(formData.telefono)) {
      alert('El teléfono debe tener 10 dígitos y comenzar con 09 (formato Ecuador).');
      return;
    }
    if (selectedPayment === 'transferencia' || selectedPayment === 'efectivo') {
      if (!uploadedFile) {
        setSubmitAlert({
          type: 'error',
          text:
            selectedPayment === 'transferencia'
              ? 'Por favor, suba el comprobante de la transferencia realizada para validar su solicitud.'
              : 'Por favor, suba el comprobante o la factura entregada en nuestras oficinas para validar su solicitud.'
        });
        console.log('🚨 ALERTA ACTIVADA:', selectedPayment, uploadedFile);
        // Auto-ocultar después de 3 segundos con animación de salida
        setAlertAnimatingOut(false);
        setTimeout(() => {
          setAlertAnimatingOut(true);
          setTimeout(() => {
            setSubmitAlert(null);
            setAlertAnimatingOut(false);
          }, 350);
        }, 7000);
        return;
      }
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(uploadedFile.type)) {
        setSubmitAlert({ type: 'error', text: 'Formato de archivo no permitido. Usa PDF, JPG, PNG o WEBP.' });
        setAlertAnimatingOut(false);
        setTimeout(() => {
          setAlertAnimatingOut(true);
          setTimeout(() => { setSubmitAlert(null); setAlertAnimatingOut(false); }, 350);
        }, 7000);
        return;
      }
      if (uploadedFile.size > 5 * 1024 * 1024) {
        setSubmitAlert({ type: 'error', text: 'El archivo supera 5MB. Por favor, sube un archivo más pequeño.' });
        setAlertAnimatingOut(false);
        setTimeout(() => {
          setAlertAnimatingOut(true);
          setTimeout(() => { setSubmitAlert(null); setAlertAnimatingOut(false); }, 350);
        }, 7000);
        return;
      }
    }

    try {
      let response: Response;
      if (selectedPayment === 'transferencia' || selectedPayment === 'efectivo') {
        const body = new FormData();
        body.append('identificacion_solicitante', documento.toUpperCase());
        body.append('nombre_solicitante', formData.nombre);
        body.append('apellido_solicitante', formData.apellido);
        body.append('telefono_solicitante', formData.telefono);
        body.append('email_solicitante', formData.email);
        if (formData.fechaNacimiento) body.append('fecha_nacimiento_solicitante', formData.fechaNacimiento);
        if (formData.direccion) body.append('direccion_solicitante', formData.direccion);
        if (formData.genero) body.append('genero_solicitante', formData.genero);
        body.append('id_tipo_curso', String(tipoCursoId));
        body.append('monto_matricula', String(curso.precio));
        body.append('metodo_pago', selectedPayment);
        if (uploadedFile) body.append('comprobante', uploadedFile);

        response = await fetch(`${API_BASE}/solicitudes`, {
          method: 'POST',
          body
        });
      } else {
        const montoFinal = selectedPayment === 'payphone' ? curso.precio + 7 : curso.precio;
        const payload = {
          identificacion_solicitante: documento.toUpperCase(),
          nombre_solicitante: formData.nombre,
          apellido_solicitante: formData.apellido,
          telefono_solicitante: formData.telefono,
          email_solicitante: formData.email,
          fecha_nacimiento_solicitante: formData.fechaNacimiento || null,
          direccion_solicitante: formData.direccion || null,
          genero_solicitante: formData.genero || null,
          id_tipo_curso: tipoCursoId,
          monto_matricula: montoFinal,
          metodo_pago: selectedPayment
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
          @keyframes scaleFade {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes alertSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes alertFadeOut {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(-10px) scale(0.98);
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {notFoundOrNoCourse ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}>
                            No existe cursos disponibles
                          </span>
                        ) : (
                          !tipoCursoBackend!.disponible || tipoCursoBackend!.estado !== 'activo' ? (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#ef4444',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}>
                              Matrícula cerrada
                            </span>
                          ) : (
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              color: '#10b981',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}>
                              {tipoCursoBackend!.cursosActivos > 0 ? `Activos: ${tipoCursoBackend!.cursosActivos}` : 
                               tipoCursoBackend!.cursosPlanificados > 0 ? `Planificados: ${tipoCursoBackend!.cursosPlanificados}` : 
                               'Disponible'}
                            </span>
                          )
                        )}
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
              transitionDelay: '200ms',
              position: 'relative'
            }}>
              {isBlocked && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  zIndex: 5,
                  borderRadius: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  letterSpacing: 0.5
                }}>
                  Matrícula cerrada temporalmente
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <fieldset disabled={isBlocked} style={{ border: 'none', padding: 0, margin: 0 }}>
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
                    gap: '12px',
                    animation: 'fadeInUp 1s ease-in-out'
                  }}>
                    <User size={24} color="#fbbf24" />
                    Información Personal
                  </h3>

                  {/* Tipo de documento - control segmentado estilizado (compacto) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#fff', fontWeight: 700, letterSpacing: 0.3, fontSize: '0.95rem' }}>Tipo de documento</span>
                    </div>
                    <div role="tablist" aria-label="Tipo de documento" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px'
                    }}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={formData.tipoDocumento === 'ecuatoriano'}
                        onClick={() => {
                          setFormData({
                            nombre: '',
                            apellido: '',
                            email: '',
                            telefono: '',
                            cedula: '',
                            pasaporte: '',
                            tipoDocumento: 'ecuatoriano',
                            fechaNacimiento: '',
                            direccion: '',
                            genero: ''
                          });
                          setErrors({});
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: formData.tipoDocumento === 'ecuatoriano' ? '2px solid #fbbf24' : '2px solid rgba(251, 191, 36, 0.2)',
                          background: formData.tipoDocumento === 'ecuatoriano' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255,255,255,0.05)',
                          color: formData.tipoDocumento === 'ecuatoriano' ? '#fbbf24' : 'rgba(255,255,255,0.85)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: formData.tipoDocumento === 'ecuatoriano' ? '0 10px 24px rgba(251,191,36,0.12)' : '0 6px 18px rgba(0,0,0,0.3)',
                          transition: 'all .25s ease',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <User size={16} />
                          Ecuatoriano (Cédula)
                        </span>
                      </button>

                      <button
                        type="button"
                        role="tab"
                        aria-selected={formData.tipoDocumento === 'extranjero'}
                        onClick={() => {
                          setFormData({
                            nombre: '',
                            apellido: '',
                            email: '',
                            telefono: '',
                            cedula: '',
                            pasaporte: '',
                            tipoDocumento: 'extranjero',
                            fechaNacimiento: '',
                            direccion: '',
                            genero: ''
                          });
                          setErrors({});
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: formData.tipoDocumento === 'extranjero' ? '2px solid #fbbf24' : '2px solid rgba(251, 191, 36, 0.2)',
                          background: formData.tipoDocumento === 'extranjero' ? 'rgba(251, 191, 36, 0.12)' : 'rgba(255,255,255,0.05)',
                          color: formData.tipoDocumento === 'extranjero' ? '#fbbf24' : 'rgba(255,255,255,0.85)',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          boxShadow: formData.tipoDocumento === 'extranjero' ? '0 10px 24px rgba(251,191,36,0.12)' : '0 6px 18px rgba(0,0,0,0.3)',
                          transition: 'all .25s ease',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <Globe size={16} />
                          Extranjero (Pasaporte)
                        </span>
                      </button>
                    </div>
                  </div>

                  {formData.tipoDocumento === '' && (
                    <div style={{
                      background: 'rgba(251, 191, 36, 0.08)',
                      border: '1px solid rgba(251, 191, 36, 0.25)',
                      color: '#fbbf24',
                      borderRadius: 12,
                      padding: '14px 16px',
                      marginBottom: 16,
                      fontWeight: 600
                    }}>
                      Selecciona el tipo de documento para continuar.
                    </div>
                  )}

                  

                  {formData.tipoDocumento !== '' && (
                    <div key={formData.tipoDocumento} style={{ animation: 'fadeInUp 1s ease-in-out' }}>
                      {/* Documento primero */}
                      <div style={{ marginBottom: '20px', animation: 'scaleFade 1s ease-in-out' }}>
                        {formData.tipoDocumento === 'ecuatoriano' ? (
                          <>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#fff' }}>
                              Cédula *
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
                          </>
                        ) : (
                          <>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#fff' }}>
                              Pasaporte *
                            </label>
                            <input
                              type="text"
                              required
                              inputMode="text"
                              pattern="^[A-Za-z0-9]{6,20}$"
                              maxLength={20}
                              title="Pasaporte: 6 a 20 caracteres alfanuméricos"
                              value={formData.pasaporte || ''}
                              onChange={(e) => {
                                const val = (e.target as HTMLInputElement).value;
                                const filtered = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                                setFormData({ ...formData, pasaporte: filtered });
                                let msg: string | undefined = undefined;
                                if (filtered && !/^[A-Z0-9]{6,20}$/.test(filtered)) {
                                  msg = 'Pasaporte inválido (6-20 alfanumérico)';
                                }
                                setErrors((prev) => ({ ...prev, pasaporte: msg }));
                              }}
                              onInvalid={(e) => {
                                (e.target as HTMLInputElement).setCustomValidity('Pasaporte inválido: use 6-20 caracteres alfanuméricos');
                              }}
                              onInput={(e) => {
                                (e.target as HTMLInputElement).setCustomValidity('');
                              }}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: errors.pasaporte ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                transition: 'border-color 0.3s ease',
                                background: 'rgba(0, 0, 0, 0.4)',
                                color: '#fff'
                              }}
                              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                            />
                            {errors.pasaporte && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <AlertCircle size={16} color="#ef4444" />
                                <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{errors.pasaporte}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Luego Nombre y Apellido */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        marginBottom: '20px',
                        animation: 'scaleFade 1s ease-in-out'
                      }}>
                        <div style={{ animation: 'scaleFade 1s ease-in-out', animationDelay: '0ms' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#fff' }}>
                            Nombres completos *
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
                        <div style={{ animation: 'scaleFade 1s ease-in-out', animationDelay: '80ms' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#fff' }}>
                            Apellidos completos *
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

                      {/* Fecha de Nacimiento */}
                      <div style={{ marginBottom: '20px', animation: 'scaleFade 1s ease-in-out', animationDelay: '120ms' }}>
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
                            const m1 = val.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
                            if (m1) {
                              const [_, dd, mm, yyyy] = m1;
                              const norm = `${yyyy}-${mm}-${dd}`;
                              setFormData(prev => ({ ...prev, fechaNacimiento: norm }));
                              el.value = norm;
                              el.setCustomValidity('');
                              el.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                              return;
                            }
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                              el.setCustomValidity('Formato de fecha inválido. Usa el selector o escribe DD/MM/AAAA.');
                            } else {
                              el.setCustomValidity('');
                            }
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
                  )}

                  {formData.tipoDocumento !== '' && (
                  <>
                  <div style={{ marginBottom: '20px', animation: 'scaleFade 1.2s ease-in-out', animationDelay: '160ms' }}>
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

                  <div style={{ marginBottom: '20px', animation: 'scaleFade 1.2s ease-in-out', animationDelay: '200ms' }}>
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
                    gap: '20px',
                    animation: 'scaleFade 1.2s ease-in-out',
                    animationDelay: '240ms'
                  }}>
                    <div style={{ animation: 'scaleFade 1.2s ease-in-out', animationDelay: '240ms' }}>
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
                    <div style={{ animation: 'scaleFade 1.2s ease-in-out', animationDelay: '320ms' }}>
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
                  </>
                  )}

                  
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
                      title="Transferencia Bancaria"
                      icon={<QrCode size={24} />}
                      description="Transfiere directamente a nuestra cuenta bancaria"
                      isSelected={selectedPayment === 'transferencia'}
                      onClick={() => setSelectedPayment('transferencia')}
                    />

                    <PaymentCard
                      title="Efectivo"
                      icon={<CreditCard size={24} />}
                      description="Pago en efectivo en oficina. Sube el comprobante/factura entregado."
                      isSelected={selectedPayment === 'efectivo'}
                      onClick={() => setSelectedPayment('efectivo')}
                    />

                    <PaymentCard
                      title="PayPhone"
                      icon={<CreditCard size={24} />}
                      description="Pago rápido y seguro con PayPhone (+$7 por servicio)"
                      isSelected={selectedPayment === 'payphone'}
                      onClick={() => setSelectedPayment('payphone')}
                    />
                  </div>



                  {/* Contenido específico según método seleccionado */}
                  {selectedPayment === 'payphone' && (
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
                        Pagar con PayPhone
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '16px',
                        lineHeight: 1.6
                      }}>
                        Serás redirigido a PayPhone para completar tu pago de forma segura.
                      </p>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '16px'
                      }}>
                        <p style={{
                          color: '#ef4444',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          margin: 0
                        }}>
                          ⚠️ Aviso: Este método de pago aplica un recargo fijo de USD 7, correspondiente a comisiones del procesador de pagos. El monto final a cobrar incluirá dicho recargo.
                        </p>
                      </div>
                      <div style={{
                        background: '#1a365d',
                        color: '#fff',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        fontWeight: '700',
                        fontSize: '1.1rem'
                      }}>
                        Pagar con PayPhone
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

                  {selectedPayment === 'efectivo' && (
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
                        <Upload size={20} />
                        Pago en Efectivo
                      </h4>
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        marginBottom: '16px',
                        lineHeight: 1.6
                      }}>
                        Realiza el pago en efectivo en nuestras oficinas. Te entregaremos un comprobante o factura.
                        Por favor, súbelo a continuación para validar tu solicitud.
                      </p>

                      {/* Subida de comprobante (Efectivo) */}
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
                          Subir Comprobante/Factura *
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
                          onClick={() => document.getElementById('fileInputEfectivo')?.click()}
                        >
                          <input
                            id="fileInputEfectivo"
                            type="file"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            onChange={(e) => handleFileUpload((e.target as HTMLInputElement).files?.[0] || null)}
                            style={{ display: 'none' }}
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
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerta de validación al enviar */}
                {submitAlert && (
                  <div style={{
                    background:
                      submitAlert.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : submitAlert.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)',
                    border:
                      submitAlert.type === 'error' ? '1px solid rgba(239, 68, 68, 0.35)' : submitAlert.type === 'success' ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(59,130,246,0.35)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    marginBottom: 24,
                    animation: alertAnimatingOut
                      ? 'alertFadeOut 0.35s ease-in forwards'
                      : 'alertSlideIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AlertCircle size={20} color={submitAlert.type === 'error' ? '#ef4444' : submitAlert.type === 'success' ? '#10b981' : '#3b82f6'} />
                        <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1rem', fontWeight: '500' }}>{submitAlert.text}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitAlert(null)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          color: 'rgba(255,255,255,0.9)',
                          borderRadius: 8,
                          padding: '8px 12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isBlocked}
                  style={{
                    width: '100%',
                    background: isBlocked ? 'rgba(156,163,175,0.4)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                    color: '#000',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    cursor: isBlocked ? 'not-allowed' : 'pointer',
                    boxShadow: '0 12px 40px rgba(251, 191, 36, 0.25)'
                  }}
                >
                  Confirmar Inscripción
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
                </fieldset>
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