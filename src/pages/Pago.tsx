import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  montoMatricula: number;
  horarioPreferido: '' | 'matutino' | 'vespertino';
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
  Globe,
  FileText,
  IdCard,
  Sunrise,
  Sunset,
  Users,
  X,
  Clock,
  Ban,
  BookOpen,
  Hash
} from 'lucide-react';
import Footer from '../components/Footer';
import { useTheme } from '../context/ThemeContext';

// Backend API base (sin proxy de Vite)
const API_BASE = 'http://localhost:3000/api';

// Datos reales de cursos con precios y modalidades actualizadas
const detallesCursos: DetallesCursos = {
  cosmetologia: {
    titulo: 'Cosmetología',
    precio: 90,
    duracion: '12 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758908042/cosme1_cjsu3k.jpg'
  },
  cosmiatria: {
    titulo: 'Cosmiatría',
    precio: 90,
    duracion: '7 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758901284/cosmeto_cy3e36.jpg'
  },
  integral: {
    titulo: 'Belleza Integral',
    precio: 90,
    duracion: '12 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758908293/cos2_se1xyb.jpg'
  },
  unas: {
    titulo: 'Técnica de Uñas',
    precio: 50,
    duracion: '16 clases - Matrícula $50 + $15.40/clase',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758902047/una_yzabr3.jpg'
  },
  lashista: {
    titulo: 'Lashista Profesional',
    precio: 50,
    duracion: '6 clases - Matrícula $50 + $26/clase',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758900822/lashi_vuiiiv.jpg'
  },
  maquillaje: {
    titulo: 'Maquillaje Profesional',
    precio: 90,
    duracion: '6 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758899626/eff_rxclz1.jpg'
  },
  facial: {
    titulo: 'Cosmetología',
    precio: 90,
    duracion: '12 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1755893924/cursos_xrnjuu.png'
  },
  'alta-peluqueria': {
    titulo: 'Alta Peluquería',
    precio: 90,
    duracion: '8 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758920782/pelu_hvfyfn.png'
  },
  'moldin-queen': {
    titulo: 'Moldin Queen',
    precio: 90,
    duracion: '6 meses - $90 mensuales',
    imagen: 'https://res.cloudinary.com/dfczvdz7b/image/upload/v1758915245/mold_o5qksq.png'
  }
};

const Pago: React.FC = () => {
  const { theme } = useTheme();
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
      lashista: ['pestañas', 'pestanas', 'lashes', 'extensiones', 'lash'],
      'alta-peluqueria': ['alta peluquería', 'peluquería', 'peluqueria', 'cortes', 'tintes', 'colorimetría', 'balayage', 'hair'],
      'moldin-queen': ['moldin', 'modelado', 'estilizado', 'queen', 'molding']
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
  const [documentoIdentificacion, setDocumentoIdentificacion] = useState<File | null>(null);
  const [documentoEstatusLegal, setDocumentoEstatusLegal] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [submitAlert, setSubmitAlert] = useState<null | { type: 'error' | 'info' | 'success'; text: string }>(null);
  const [alertAnimatingOut, setAlertAnimatingOut] = useState(false);
  const [tipoCursoBackend, setTipoCursoBackend] = useState<any | null>(null);
  const [tiposCursosDisponibles, setTiposCursosDisponibles] = useState<any[]>([]);
  const [cuposDisponibles, setCuposDisponibles] = useState<any[]>([]);
  const [isRefreshingCupos, setIsRefreshingCupos] = useState(false);
  const cuposCache = useRef<{ data: any[], timestamp: number } | null>(null);
  const CACHE_DURATION = 60000; // 60 segundos de caché (más profesional)
  const lastFetchRef = useRef<number>(0);
  const [lastCuposCount, setLastCuposCount] = useState<number>(0);
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
    genero: '',
    montoMatricula: curso?.precio || 0,
    horarioPreferido: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [codigoSolicitud, setCodigoSolicitud] = useState<string | null>(null);
  const [showMontoAlert, setShowMontoAlert] = useState(false);

  // Estados para datos del comprobante
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [bancoComprobante, setBancoComprobante] = useState('');
  const [fechaTransferencia, setFechaTransferencia] = useState('');

  // Estados para pago en efectivo
  const [numeroComprobanteEfectivo, setNumeroComprobanteEfectivo] = useState('');
  const [recibidoPor, setRecibidoPor] = useState('');

  // Estados para estudiante existente
  const [estudianteExistente, setEstudianteExistente] = useState<any>(null);
  const [verificandoEstudiante, setVerificandoEstudiante] = useState(false);

  // Estados para solicitudes pendientes
  const [solicitudPendiente, setSolicitudPendiente] = useState<any>(null);
  const [tieneSolicitudPendiente, setTieneSolicitudPendiente] = useState(false);

  // Validador estricto de cédula ecuatoriana
  const validateCedulaEC = (ced: string): { ok: boolean; reason?: string } => {
    if (!/^\d{10}$/.test(ced)) return { ok: false, reason: 'Cédula incorrecta: Por favor verifique y corrija el número ingresado' };
    // Rechazar repetitivas (0000000000, 1111111111, ...)
    if (/^(\d)\1{9}$/.test(ced)) return { ok: false, reason: 'Cédula incorrecta: Por favor verifique y corrija el número ingresado' };
    const prov = parseInt(ced.slice(0, 2), 10);
    if (prov < 1 || prov > 24) return { ok: false, reason: 'Cédula incorrecta: Por favor verifique y corrija el número ingresado' };
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
    if (verifier !== digits[9]) return { ok: false, reason: 'Cédula incorrecta: Por favor verifique y corrija el número ingresado' };
    return { ok: true };
  };


  // Función para verificar solicitudes pendientes
  const verificarSolicitudPendiente = async (identificacion: string) => {
    if (!identificacion || identificacion.trim().length < 6) return;

    try {
      const response = await fetch(
        `${API_BASE}/solicitudes?estado=pendiente&limit=100`
      );

      if (response.ok) {
        const solicitudes = await response.json();

        // Buscar si tiene solicitud pendiente con esta identificación
        const solicitudPendienteEncontrada = solicitudes.find(
          (sol: any) => sol.identificacion_solicitante?.toUpperCase() === identificacion.trim().toUpperCase()
        );

        if (solicitudPendienteEncontrada) {
          setSolicitudPendiente(solicitudPendienteEncontrada);
          setTieneSolicitudPendiente(true);
          return true;
        } else {
          setSolicitudPendiente(null);
          setTieneSolicitudPendiente(false);
          return false;
        }
      }
    } catch (error) {
      console.error('Error verificando solicitudes pendientes:', error);
    }
    return false;
  };

  // Función para verificar si estudiante ya existe en el sistema
  const verificarEstudianteExistente = async (identificacion: string) => {
    if (!identificacion || identificacion.trim().length < 6) return;

    setVerificandoEstudiante(true);

    try {
      // PRIMERO: Verificar si tiene solicitud pendiente
      const tienePendiente = await verificarSolicitudPendiente(identificacion);

      if (tienePendiente) {
        setVerificandoEstudiante(false);
        return; // Detener aquí si tiene solicitud pendiente
      }

      // SEGUNDO: Verificar si es estudiante existente
      const response = await fetch(
        `${API_BASE}/estudiantes/verificar?identificacion=${encodeURIComponent(identificacion.trim().toUpperCase())}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.existe) {
          // Estudiante YA existe en el sistema
          setEstudianteExistente(data.estudiante);

          // Pre-llenar campos con datos existentes
          setFormData(prev => ({
            ...prev,
            nombre: data.estudiante.nombre || '',
            apellido: data.estudiante.apellido || '',
            email: data.estudiante.email || '',
            telefono: data.estudiante.telefono || '',
            fechaNacimiento: data.estudiante.fecha_nacimiento || '',
            direccion: data.estudiante.direccion || '',
            genero: data.estudiante.genero || ''
          }));

          // Toast eliminado - ya se muestra la alerta verde fija en el formulario

          // Mostrar cursos matriculados si existen
          if (data.cursos_matriculados && data.cursos_matriculados.length > 0) {
            console.log('📚 Cursos actuales del estudiante:', data.cursos_matriculados);

            // VALIDAR CURSO DUPLICADO: Verificar si ya está inscrito en este curso
            const yaInscritoEnEsteCurso = data.cursos_matriculados.some(
              (curso: any) => curso.id_tipo_curso === tipoCursoId
            );

            if (yaInscritoEnEsteCurso) {
              const cursoActual = data.cursos_matriculados.find(
                (curso: any) => curso.id_tipo_curso === tipoCursoId
              );

              toast.error(
                `⚠️ Ya estás inscrito en este curso\n\nActualmente cursas: ${cursoActual?.tipo_curso_nombre || 'este curso'}.\nNo puedes inscribirte dos veces en el mismo curso.`,
                {
                  duration: 7000,
                  icon: '🚫',
                  style: {
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    color: '#ef4444',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '600px',
                    fontSize: '0.95rem',
                    padding: '20px 24px',
                    whiteSpace: 'pre-line'
                  }
                }
              );

              // Bloquear formulario marcando como si tuviera solicitud pendiente
              setTieneSolicitudPendiente(true);
              setSolicitudPendiente({
                tipo_curso_nombre: cursoActual?.tipo_curso_nombre || 'Este curso',
                codigo_solicitud: 'YA-INSCRITO',
                fecha_solicitud: cursoActual?.fecha_matricula || new Date(),
                estado: 'Ya inscrito'
              });

              return; // Detener aquí
            }
          }
        } else {
          // Estudiante NO existe - formulario normal
          setEstudianteExistente(null);
        }
      }
    } catch (error) {
      console.error('Error verificando estudiante:', error);
    } finally {
      setVerificandoEstudiante(false);
    }
  };


  useEffect(() => {
    setIsVisible(true);

    // Asegurar que existe la meta tag viewport
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }
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
      } catch { }
    };

    loadTiposCursos();
    return () => { cancelled = true; };
  }, [cursoKey]);

  // Función para cargar cupos (reutilizable)
  const loadCuposDisponibles = async (forceRefresh = false, showToast = true, isPolling = false) => {
    // VERIFICAR CACHÉ PRIMERO (si no es forzado)
    const now = Date.now();
    if (!forceRefresh && cuposCache.current && (now - cuposCache.current.timestamp) < CACHE_DURATION) {
      console.log('✅ Usando cupos desde caché');
      setCuposDisponibles(cuposCache.current.data);
      return cuposCache.current.data;
    }

    // Rate limiting: evitar llamadas muy seguidas
    if (now - lastFetchRef.current < 2000) {
      console.log('⏱️ Rate limit: esperando...');
      return cuposCache.current?.data || [];
    }
    lastFetchRef.current = now;

    // MOSTRAR TOAST DE CARGA (solo si showToast es true)
    const loadingToast = showToast ? toast.loading('Cargando cupos disponibles...', {
      duration: 5000,
      style: {
        background: '#1f2937',
        color: '#fff',
        borderRadius: '12px',
        padding: '16px',
        fontFamily: 'Montserrat, sans-serif'
      }
    }) : null;

    try {
      console.log('🔄 Cargando cupos desde:', `${API_BASE}/cursos/disponibles`);
      const res = await fetch(`${API_BASE}/cursos/disponibles`);

      if (!res.ok) {
        console.error('❌ Error en respuesta de cupos:', res.status);
        if (loadingToast) toast.error('Error al cargar cupos disponibles', { id: loadingToast });
        return cuposCache.current?.data || [];
      }

      const cupos = await res.json();

      // DETECTAR CAMBIOS (nuevos cursos agregados)
      const previousCount = lastCuposCount;
      const newCount = cupos.length;

      if (isPolling && previousCount > 0 && newCount > previousCount) {
        // ¡Nuevos cursos detectados!
        const diff = newCount - previousCount;
        toast.success(`🎉 ${diff} nuevo${diff > 1 ? 's' : ''} curso${diff > 1 ? 's' : ''} disponible${diff > 1 ? 's' : ''}!`, {
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 600
          }
        });
      }

      setLastCuposCount(newCount);

      // GUARDAR EN CACHÉ
      cuposCache.current = {
        data: cupos,
        timestamp: Date.now()
      };

      setCuposDisponibles(cupos);
      console.log('📊 Cupos disponibles cargados:', cupos);
      console.log('📊 Total de registros:', cupos.length);

      // TOAST DE ÉXITO (solo si showToast es true)
      if (loadingToast) {
        toast.success(`✅ ${cupos.length} cursos cargados`, {
          id: loadingToast,
          duration: 2000
        });
      }

      return cupos;
    } catch (err) {
      console.error('❌ Error cargando cupos:', err);
      if (loadingToast) toast.error('Error de conexión con el servidor', { id: loadingToast });
      return cuposCache.current?.data || [];
    }
  };

  // Cargar cupos SOLO al montar (sin polling)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (cancelled) return;
      await loadCuposDisponibles(false, true, false); // Una sola carga inicial
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // Recargar cupos cuando el usuario interactúa con el formulario
  const reloadCuposOnInteraction = async () => {
    const now = Date.now();
    // Solo recargar si han pasado más de 10 segundos desde la última carga
    if (now - lastFetchRef.current > 10000) {
      await loadCuposDisponibles(true, false, true);
    }
  };

  // Función para refrescar manualmente
  const handleRefreshCupos = async () => {
    setIsRefreshingCupos(true);
    await loadCuposDisponibles(true, true, false); // Forzar con toast
    setIsRefreshingCupos(false);
  };

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
      } catch { }
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

  // Verificar estudiante cuando se ingresa cédula/pasaporte completo
  useEffect(() => {
    const identificacion = formData.tipoDocumento === 'ecuatoriano'
      ? formData.cedula
      : formData.pasaporte;

    if (identificacion && identificacion.trim().length >= 6) {
      // Debounce: esperar 800ms después de que el usuario deje de escribir
      const timer = setTimeout(() => {
        verificarEstudianteExistente(identificacion);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      // Limpiar si borra la identificación
      setEstudianteExistente(null);
    }
  }, [formData.cedula, formData.pasaporte, formData.tipoDocumento]);

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
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #ffffff 100%)'
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
    if (!file) {
      setUploadedFile(null);
      setNumeroComprobante('');
      return;
    }
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

  const handleDocumentoIdentificacionUpload = (file: File | null) => {
    if (isBlocked) return;
    if (!file) { setDocumentoIdentificacion(null); return; }
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
    setDocumentoIdentificacion(file);
  };

  const handleDocumentoEstatusLegalUpload = (file: File | null) => {
    if (isBlocked) return;
    if (!file) { setDocumentoEstatusLegal(null); return; }
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
    setDocumentoEstatusLegal(file);
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

  // Función para limpiar el número de comprobante al quitar archivo
  const limpiarDatosComprobante = () => {
    setNumeroComprobante('');
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
    if (!formData.horarioPreferido) {
      alert('Selecciona el horario preferido (Matutino o Vespertino).');
      return;
    }

    // VALIDAR SI HAY CUPOS DISPONIBLES PARA EL HORARIO SELECCIONADO
    const cuposParaHorario = cuposDisponibles.find(
      (c: any) => c.id_tipo_curso === tipoCursoId && c.horario === formData.horarioPreferido
    );

    if (!cuposParaHorario || cuposParaHorario.cupos_totales === 0) {
      alert(`No hay cupos disponibles para el horario ${formData.horarioPreferido}. Por favor, selecciona otro horario o espera a que se abra un nuevo curso.`);
      return;
    }
    if (!estudianteExistente && !documentoIdentificacion) {
      alert(`Por favor, sube la copia de ${formData.tipoDocumento === 'ecuatoriano' ? 'cédula' : 'pasaporte'}.`);
      return;
    }
    if (!estudianteExistente && formData.tipoDocumento === 'extranjero' && !documentoEstatusLegal) {
      alert('Por favor, sube el documento de estatus legal (visa de estudiante o permiso de residencia).');
      return;
    }
    // Validaciones mínimas - SOLO si NO es estudiante existente
    if (!estudianteExistente) {
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
      // Validar campos del comprobante para transferencia
      if (selectedPayment === 'transferencia') {
        if (!numeroComprobante.trim()) {
          setSubmitAlert({
            type: 'error',
            text: 'Por favor, ingresa el número de comprobante.'
          });
          return;
        }
        if (!bancoComprobante) {
          setSubmitAlert({
            type: 'error',
            text: 'Por favor, selecciona el banco.'
          });
          return;
        }
        if (!fechaTransferencia) {
          setSubmitAlert({
            type: 'error',
            text: 'Por favor, ingresa la fecha de transferencia.'
          });
          return;
        }
      }

      // Validar campos del comprobante para efectivo
      if (selectedPayment === 'efectivo') {
        if (!numeroComprobanteEfectivo.trim()) {
          setSubmitAlert({
            type: 'error',
            text: 'Por favor, ingresa el número de comprobante/factura.'
          });
          return;
        }
        if (!recibidoPor.trim()) {
          setSubmitAlert({
            type: 'error',
            text: 'Por favor, ingresa el nombre de quien recibió el pago.'
          });
          return;
        }
      }

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
      let debugInfo: any = {};

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
        body.append('horario_preferido', formData.horarioPreferido);
        body.append('id_tipo_curso', String(tipoCursoId));
        body.append('monto_matricula', String(formData.montoMatricula));
        body.append('metodo_pago', selectedPayment);
        // Nuevos campos del comprobante (transferencia)
        if (selectedPayment === 'transferencia') {
          if (numeroComprobante) body.append('numero_comprobante', numeroComprobante);
          if (bancoComprobante) body.append('banco_comprobante', bancoComprobante);
          if (fechaTransferencia) body.append('fecha_transferencia', fechaTransferencia);
        }
        // Nuevos campos del comprobante (efectivo)
        if (selectedPayment === 'efectivo') {
          if (numeroComprobanteEfectivo) body.append('numero_comprobante', numeroComprobanteEfectivo);
          if (recibidoPor) body.append('recibido_por', recibidoPor);
        }
        if (uploadedFile) body.append('comprobante', uploadedFile);
        if (documentoIdentificacion) body.append('documento_identificacion', documentoIdentificacion);
        if (documentoEstatusLegal) body.append('documento_estatus_legal', documentoEstatusLegal);

        // Si es estudiante existente, enviar su ID
        if (estudianteExistente) {
          body.append('id_estudiante_existente', String(estudianteExistente.id_usuario));
        }

        // Para debug - convertir FormData a objeto
        debugInfo = {
          identificacion_solicitante: documento.toUpperCase(),
          nombre_solicitante: formData.nombre,
          apellido_solicitante: formData.apellido,
          telefono_solicitante: formData.telefono,
          email_solicitante: formData.email,
          fecha_nacimiento_solicitante: formData.fechaNacimiento,
          direccion_solicitante: formData.direccion,
          genero_solicitante: formData.genero,
          horario_preferido: formData.horarioPreferido,
          id_tipo_curso: tipoCursoId,
          monto_matricula: formData.montoMatricula,
          metodo_pago: selectedPayment,
          comprobante: uploadedFile ? 'Archivo adjunto' : 'Sin archivo',
          documento_identificacion: documentoIdentificacion ? 'Archivo adjunto' : 'Sin archivo',
          documento_estatus_legal: documentoEstatusLegal ? 'Archivo adjunto' : 'Sin archivo'
        };

        response = await fetch(`${API_BASE}/solicitudes`, {
          method: 'POST',
          body
        });
      } else {
        const montoFinal = selectedPayment === 'payphone' ? formData.montoMatricula + 7 : formData.montoMatricula;
        debugInfo = {
          identificacion_solicitante: documento.toUpperCase(),
          nombre_solicitante: formData.nombre,
          apellido_solicitante: formData.apellido,
          telefono_solicitante: formData.telefono,
          email_solicitante: formData.email,
          fecha_nacimiento_solicitante: formData.fechaNacimiento || null,
          direccion_solicitante: formData.direccion || null,
          genero_solicitante: formData.genero || null,
          horario_preferido: formData.horarioPreferido,
          id_tipo_curso: tipoCursoId,
          monto_matricula: montoFinal,
          metodo_pago: selectedPayment
        };

        // Si es estudiante existente, enviar su ID
        if (estudianteExistente) {
          debugInfo.id_estudiante_existente = estudianteExistente.id_usuario;
        }
        response = await fetch(`${API_BASE}/solicitudes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(debugInfo)
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error('=== ERROR 400 DEBUG ===');
        console.error('Status:', response.status);
        console.error('Error del servidor:', errText);
        console.error('Datos enviados:', debugInfo);
        console.error('tipoCursoId:', tipoCursoId);
        console.error('selectedPayment:', selectedPayment);
        console.error('=======================');

        // Manejo especial para error de comprobante duplicado
        let errorObj;
        try {
          errorObj = JSON.parse(errText);
        } catch {
          errorObj = { error: errText };
        }

        if (errorObj.error && errorObj.error.includes('número de comprobante ya fue utilizado')) {
          // Alerta profesional para comprobante duplicado
          setSubmitAlert({
            type: 'error',
            text: `🚨 COMPROBANTE DUPLICADO DETECTADO

⚠️ El número de comprobante "${numeroComprobante}" ya fue registrado anteriormente en nuestro sistema.

📋 POR FAVOR, VERIFICA:
• Que no hayas enviado esta solicitud antes
• Que el comprobante sea de una transferencia nueva
• Que el número esté correcto

🔒 POLÍTICA DE SEGURIDAD:
Cada comprobante debe ser único para garantizar la transparencia y evitar pagos duplicados. Esta medida protege tanto a estudiantes como a la institución.

💡 SOLUCIÓN:
Realiza una nueva transferencia o verifica si ya tienes una solicitud previa registrada.`
          });
          return;
        }

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
      className="payment-method-card"
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
            color: isSelected ? '#fbbf24' : (theme === 'dark' ? '#fff' : '#1f2937'),
            fontSize: '1.3rem',
            fontWeight: '700',
            margin: 0
          }}>
            {title}
          </h3>
        </div>
      </div>
      <p style={{
        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 110
      }}>
        <div style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(0,0,0,0.92), rgba(26,26,26,0.92))'
            : 'rgba(255, 255, 255, 0.97)',
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
            color: theme === 'dark' ? '#fff' : '#1f2937',
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
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
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
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
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

          /* SUPER RESPONSIVE STYLES - ULTRA AGRESIVO */
          
          /* Tablet y móvil grande */
          @media (max-width: 1024px) {
            .payment-grid {
              grid-template-columns: 1fr !important;
              gap: 24px !important;
            }
          }

          /* Móvil y tablet pequeño */
          @media (max-width: 768px) {
            /* CONTENEDOR PRINCIPAL */
            .payment-container {
              padding: 0 12px !important;
              max-width: 100% !important;
            }
            
            /* GRID PRINCIPAL - FORZAR 1 COLUMNA */
            .payment-grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 16px !important;
              width: 100% !important;
            }
            
            /* TÍTULO PRINCIPAL */
            .payment-title {
              font-size: 1.8rem !important;
              text-align: center !important;
              margin-bottom: 16px !important;
              padding: 0 8px !important;
            }
            
            /* CARD DEL CURSO - COMPLETAMENTE RESPONSIVA */
            .curso-card {
              width: 100% !important;
              max-width: 100% !important;
              padding: 16px 12px !important;
              margin-bottom: 16px !important;
              box-sizing: border-box !important;
            }
            
            .curso-card > div:first-child {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              text-align: center !important;
              gap: 12px !important;
            }
            
            .curso-image {
              width: 70px !important;
              height: 70px !important;
              margin: 0 auto 8px auto !important;
            }
            
            .curso-price {
              font-size: 1.4rem !important;
              margin-top: 8px !important;
              text-align: center !important;
            }
            
            /* SECCIONES DEL FORMULARIO */
            .form-section {
              width: 100% !important;
              max-width: 100% !important;
              padding: 16px 12px !important;
              margin-bottom: 16px !important;
              box-sizing: border-box !important;
            }
            
            .modalidad-info {
              width: 100% !important;
              max-width: 100% !important;
              padding: 12px 8px !important;
              margin-bottom: 12px !important;
              box-sizing: border-box !important;
            }
            
            /* FORMULARIO - ULTRA RESPONSIVO */
            .form-row {
              display: flex !important;
              flex-direction: column !important;
              gap: 12px !important;
              width: 100% !important;
            }
            
            .document-tabs {
              display: flex !important;
              flex-direction: column !important;
              gap: 8px !important;
              width: 100% !important;
            }
            
            .document-tab {
              width: 100% !important;
              padding: 12px 16px !important;
              font-size: 0.9rem !important;
              text-align: center !important;
              box-sizing: border-box !important;
            }
            
            /* INPUTS - ULTRA RESPONSIVOS */
            .form-input, 
            input, 
            select, 
            textarea,
            input[type="text"], 
            input[type="email"], 
            input[type="tel"], 
            input[type="date"],
            input[type="number"] {
              width: 100% !important;
              max-width: 100% !important;
              font-size: 16px !important;
              padding: 12px 14px !important;
              box-sizing: border-box !important;
              margin: 0 !important;
            }
            
            .form-label {
              font-size: 0.9rem !important;
              margin-bottom: 6px !important;
              display: block !important;
            }
            
            /* MÉTODOS DE PAGO */
            .payment-methods {
              display: flex !important;
              flex-direction: column !important;
              gap: 10px !important;
              width: 100% !important;
            }
            
            .payment-method-card {
              width: 100% !important;
              padding: 14px 10px !important;
              box-sizing: border-box !important;
            }
            
            /* UPLOAD AREA */
            .upload-area {
              width: 100% !important;
              padding: 16px 8px !important;
              min-height: 80px !important;
              box-sizing: border-box !important;
            }
            
            /* BOTÓN SUBMIT */
            .submit-button {
              width: 100% !important;
              max-width: 100% !important;
              padding: 14px 16px !important;
              font-size: 1rem !important;
              box-sizing: border-box !important;
            }
            
            /* TÍTULOS Y TEXTO */
            .section-title {
              font-size: 1.1rem !important;
              text-align: center !important;
            }
            
            .modalidad-title {
              font-size: 0.9rem !important;
            }
            
            .modalidad-list {
              font-size: 0.8rem !important;
              padding-left: 16px !important;
            }
            
            /* FORZAR ANCHO COMPLETO A TODOS LOS ELEMENTOS */
            div, section, form, fieldset {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
          }

          /* MÓVIL PEQUEÑO - ULTRA OPTIMIZADO */
          @media (max-width: 480px) {
            .payment-container {
              padding: 0 8px !important;
            }
            
            .payment-title {
              font-size: 1.6rem !important;
              padding: 0 4px !important;
            }
            
            .curso-card {
              padding: 12px 8px !important;
            }
            
            .form-section {
              padding: 12px 8px !important;
              margin-bottom: 12px !important;
            }
            
            .modalidad-info {
              padding: 8px 6px !important;
            }
            
            .payment-method-card {
              padding: 10px 6px !important;
            }
            
            .form-input, 
            input, 
            select, 
            textarea {
              padding: 10px 12px !important;
              font-size: 16px !important;
            }
            
            .upload-area {
              padding: 12px 6px !important;
              min-height: 60px !important;
            }
            
            .submit-button {
              padding: 12px 14px !important;
              font-size: 0.95rem !important;
            }
            
            .section-title {
              font-size: 1rem !important;
            }
            
            .modalidad-title {
              font-size: 0.85rem !important;
            }
            
            .modalidad-list {
              font-size: 0.75rem !important;
            }
          }
          
          /* REGLAS ESPECÍFICAS PARA PÁGINA DE PAGOS */
          @media (max-width: 768px) {
            /* Solo aplicar box-sizing a elementos dentro del contenedor de pagos */
            .payment-container * {
              box-sizing: border-box !important;
            }
            
            /* Forzar que todos los contenedores principales sean responsivos */
            .payment-container,
            .payment-container > *,
            .payment-grid,
            .payment-grid > * {
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            /* Reglas específicas para elementos problemáticos SOLO en payment-container */
            .payment-container div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
            
            .payment-container div[style*="display: flex"][style*="alignItems: center"] {
              flex-direction: column !important;
              align-items: center !important;
            }
            
            /* Asegurar que los textos no se salgan SOLO en payment-container */
            .payment-container h1, 
            .payment-container h2, 
            .payment-container h3, 
            .payment-container h4, 
            .payment-container h5, 
            .payment-container h6, 
            .payment-container p, 
            .payment-container span, 
            .payment-container div {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
              max-width: 100% !important;
            }
            
            /* Forzar que los botones sean responsivos SOLO en payment-container */
            .payment-container button {
              max-width: 100% !important;
              box-sizing: border-box !important;
            }
            
            /* Asegurar que las imágenes sean responsivas SOLO en payment-container */
            .payment-container img {
              max-width: 100% !important;
              height: auto !important;
            }
          }
        `}
      </style>

      <div style={{
        minHeight: '100vh',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 50%, #ffffff 100%)',
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

        <div className="payment-container" style={{
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
              background: theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
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

          <div className="payment-grid" style={{
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
              <h1 className="payment-title" style={{
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
              <div className="curso-card" style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))'
                  : 'rgba(255, 255, 255, 0.97)',
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
                    className="curso-image"
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
                      color: theme === 'dark' ? '#fff' : '#1f2937',
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
                        <span style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)' }}>{curso.duracion}</span>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {/* Mostrar cupos por horario */}
                              {(() => {
                                console.log('🔍 Filtrando cupos para tipoCursoId:', tipoCursoId);
                                console.log('🔍 Cupos disponibles:', cuposDisponibles);
                                console.log('🔍 Detalle de cada cupo:', cuposDisponibles.map((c: any) => ({
                                  id_tipo_curso: c.id_tipo_curso,
                                  tipo: typeof c.id_tipo_curso,
                                  nombre: c.tipo_curso_nombre,
                                  horario: c.horario,
                                  cupos: c.cupos_totales
                                })));
                                const cuposFiltrados = cuposDisponibles.filter((c: any) => c.id_tipo_curso === tipoCursoId);
                                console.log('🔍 Cupos filtrados:', cuposFiltrados);
                                console.log('🔍 Comparación:', cuposDisponibles.map((c: any) => `${c.id_tipo_curso} === ${tipoCursoId} ? ${c.id_tipo_curso === tipoCursoId}`));

                                if (cuposFiltrados.length > 0) {
                                  return cuposFiltrados.map((c: any) => {
                                    const tieneCupos = c.cupos_totales > 0;
                                    const porcentajeOcupado = ((c.capacidad_total - c.cupos_totales) / c.capacidad_total) * 100;
                                    const Icon = c.horario === 'matutino' ? Sunrise : Sunset;

                                    return (
                                      <div
                                        key={c.horario}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          padding: '8px 14px',
                                          borderRadius: '12px',
                                          background: tieneCupos
                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))'
                                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                                          border: tieneCupos
                                            ? '1.5px solid rgba(16, 185, 129, 0.4)'
                                            : '1.5px solid rgba(239, 68, 68, 0.4)',
                                          boxShadow: tieneCupos
                                            ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                                            : '0 4px 12px rgba(239, 68, 68, 0.15)',
                                          transition: 'all 0.3s ease',
                                          cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                          e.currentTarget.style.boxShadow = tieneCupos
                                            ? '0 6px 20px rgba(16, 185, 129, 0.25)'
                                            : '0 6px 20px rgba(239, 68, 68, 0.25)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = tieneCupos
                                            ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                                            : '0 4px 12px rgba(239, 68, 68, 0.15)';
                                        }}
                                      >
                                        <Icon
                                          size={16}
                                          color={tieneCupos ? '#10b981' : '#ef4444'}
                                          style={{ flexShrink: 0 }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                          <span style={{
                                            color: tieneCupos ? '#10b981' : '#ef4444',
                                            fontWeight: 700,
                                            fontSize: '0.75rem',
                                            textTransform: 'capitalize',
                                            lineHeight: 1
                                          }}>
                                            {c.horario}
                                          </span>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Users size={12} color={tieneCupos ? '#059669' : '#dc2626'} />
                                            <span style={{
                                              color: tieneCupos ? '#059669' : '#dc2626',
                                              fontWeight: 600,
                                              fontSize: '0.7rem',
                                              lineHeight: 1
                                            }}>
                                              {c.cupos_totales}/{c.capacidad_total} cupos
                                            </span>
                                          </div>
                                        </div>
                                        {/* Barra de progreso */}
                                        <div style={{
                                          width: '40px',
                                          height: '4px',
                                          background: 'rgba(0,0,0,0.1)',
                                          borderRadius: '2px',
                                          overflow: 'hidden',
                                          marginLeft: '4px'
                                        }}>
                                          <div style={{
                                            width: `${porcentajeOcupado}%`,
                                            height: '100%',
                                            background: tieneCupos
                                              ? 'linear-gradient(90deg, #10b981, #059669)'
                                              : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                            transition: 'width 0.3s ease'
                                          }} />
                                        </div>
                                      </div>
                                    );
                                  });
                                }

                                // Fallback si no hay cupos cargados
                                return (
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
                                );
                              })()}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="curso-price" style={{
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

              {/* Información de modalidades de pago */}
              <div className="modalidad-info" style={{
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <Calendar size={24} color="#fbbf24" />
                  <span style={{
                    color: '#fbbf24',
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    Modalidad de Pago
                  </span>
                </div>

                {/* Información específica por curso */}
                {cursoKey === 'unas' && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 className="modalidad-title" style={{ color: theme === 'dark' ? '#fff' : '#1f2937', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                      Técnica de Uñas - Modalidad por Clases
                    </h4>
                    <ul className="modalidad-list" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, paddingLeft: '20px' }}>
                      <li><strong>Primer pago:</strong> $50 USD para iniciar</li>
                      <li><strong>Total de clases:</strong> 16 clases</li>
                      <li><strong>Clases restantes:</strong> $15.40 USD cada una (15 clases)</li>
                      <li><strong>Frecuencia:</strong> 2 clases por semana</li>
                      <li><strong>Duración:</strong> 8 semanas aproximadamente</li>
                    </ul>
                  </div>
                )}

                {cursoKey === 'lashista' && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 className="modalidad-title" style={{ color: theme === 'dark' ? '#fff' : '#1f2937', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                      Lashista Profesional - Modalidad por Clases
                    </h4>
                    <ul className="modalidad-list" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, paddingLeft: '20px' }}>
                      <li><strong>Primer pago:</strong> $50 USD para iniciar</li>
                      <li><strong>Total de clases:</strong> 6 clases</li>
                      <li><strong>Clases restantes:</strong> $26 USD cada una (5 clases)</li>
                      <li><strong>Frecuencia:</strong> 1 clase por semana</li>
                      <li><strong>Duración:</strong> 6 semanas</li>
                    </ul>
                  </div>
                )}

                {['cosmetologia', 'cosmiatria', 'integral', 'maquillaje', 'facial'].includes(cursoKey) && (
                  <div style={{ marginBottom: '16px' }}>
                    <h4 className="modalidad-title" style={{ color: theme === 'dark' ? '#fff' : '#1f2937', fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                      {curso.titulo} - Modalidad Mensual
                    </h4>
                    <ul className="modalidad-list" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0, paddingLeft: '20px' }}>
                      <li><strong>Modalidad:</strong> Pago mensual únicamente</li>
                      <li><strong>Valor mensual:</strong> $90 USD cada mes</li>
                      <li><strong>Duración:</strong> {cursoKey === 'cosmiatria' ? '7 meses' : cursoKey === 'maquillaje' ? '6 meses' : '12 meses'}</li>
                      <li><strong>Incluye:</strong> Materiales, productos y certificación</li>
                      {cursoKey === 'cosmiatria' && <li><strong>Requisito:</strong> Ser Cosmetóloga Graduada</li>}
                    </ul>
                  </div>
                )}

                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginTop: '16px'
                }}>
                  <p style={{
                    color: '#10b981',
                    fontSize: '0.85rem',
                    margin: 0,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    ✨ Con tu primer pago ya inicias tus clases ✨
                  </p>
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
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
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
                  color: theme === 'dark' ? '#fff' : '#1f2937',
                  fontWeight: 800,
                  letterSpacing: 0.5
                }}>
                  Matrícula cerrada temporalmente
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <fieldset disabled={isBlocked} style={{ border: 'none', padding: 0, margin: 0 }}>
                  {/* Información personal */}
                  <div className="form-section" style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))'
                      : 'rgba(255, 255, 255, 0.97)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '32px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                  }}>
                    <h3 className="section-title" style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: theme === 'dark' ? '#fff' : '#1f2937',
                      marginBottom: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      animation: 'fadeInUp 1s ease-in-out'
                    }}>
                      <User size={24} color="#fbbf24" />
                      Información Personal
                    </h3>

                    {/* SPINNER DE CARGA - Verificando */}
                    {verificandoEstudiante && (
                      <div className="flex flex-col items-center justify-center py-8 px-4 mb-6 rounded-2xl" style={{
                        background: 'transparent',
                        border: 'none'
                      }}>
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
                        </div>
                        <p className="mt-4 text-lg font-semibold" style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }}>
                          Verificando información...
                        </p>
                        <p className="mt-2 text-sm" style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)' }}>
                          Por favor espera un momento
                        </p>
                      </div>
                    )}

                    {/* ALERTA DE BLOQUEO - Solicitud Pendiente o Ya Inscrito */}
                    {!verificandoEstudiante && tieneSolicitudPendiente && solicitudPendiente && (
                      <div style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                        border: '2px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '32px',
                        backdropFilter: 'blur(10px)',
                        animation: 'slideInUp 0.5s ease-out'
                      }}>
                        {/* Botón X para cerrar */}
                        <button
                          onClick={() => {
                            setTieneSolicitudPendiente(false);
                            setSolicitudPendiente(null);
                            setEstudianteExistente(null);
                            window.location.reload();
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 10
                          }}
                          className="transition-all duration-300 hover:scale-125 hover:rotate-90"
                          title="Cerrar"
                        >
                          <span style={{ 
                            color: '#ef4444', 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            display: 'block'
                          }}>×</span>
                        </button>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px',
                          paddingRight: '32px'
                        }}>
                          {solicitudPendiente.codigo_solicitud === 'YA-INSCRITO' ? (
                            <Ban size={32} color="#ef4444" />
                          ) : (
                            <Clock size={32} color="#ef4444" />
                          )}
                          <h3 style={{
                            color: '#ef4444',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            margin: 0
                          }}>
                            {solicitudPendiente.codigo_solicitud === 'YA-INSCRITO' ? 'Ya Inscrito en este Curso' : 'Solicitud en Revisión'}
                          </h3>
                        </div>

                        <p style={{
                          color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                          fontSize: '1.05rem',
                          lineHeight: '1.6',
                          margin: '0 0 16px 0'
                        }}>
                          {solicitudPendiente.codigo_solicitud === 'YA-INSCRITO'
                            ? 'Ya estás cursando este programa. Para inscribirte en otro curso, selecciónalo desde la página de cursos.'
                            : 'Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando sea aprobada.'}
                        </p>

                        <div className="rounded-xl p-4 mb-4" style={{
                          background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
                          border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'}`
                        }}>
                          <p className="my-2" style={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}>
                            <strong className="text-red-400">📚 Curso:</strong> {solicitudPendiente.tipo_curso_nombre || 'N/A'}
                          </p>
                          {solicitudPendiente.codigo_solicitud !== 'YA-INSCRITO' && (
                            <>
                              <p className="my-2" style={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}>
                                <strong className="text-red-400">🔖 Código:</strong> {solicitudPendiente.codigo_solicitud}
                              </p>
                              <p className="my-2" style={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}>
                                <strong className="text-red-400">📅 Fecha:</strong> {new Date(solicitudPendiente.fecha_solicitud).toLocaleDateString('es-EC')}
                              </p>
                              <p className="my-2" style={{ color: theme === 'dark' ? '#fff' : '#1e293b' }}>
                                <strong className="text-red-400">⏳ Estado:</strong> En revisión
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ALERTA INFORMATIVA - Estudiante Existente (solo si NO está inscrito en este curso) */}
                    {estudianteExistente && !tieneSolicitudPendiente && (
                      <div style={{
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                        border: '2px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '32px',
                        backdropFilter: 'blur(10px)',
                        animation: 'slideInUp 0.5s ease-out'
                      }}>
                        {/* Botón X para cerrar */}
                        <button
                          onClick={() => {
                            setEstudianteExistente(null);
                            window.location.reload();
                          }}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            zIndex: 10
                          }}
                          className="transition-all duration-300 hover:scale-125 hover:rotate-90"
                          title="Cerrar"
                        >
                          <span style={{ 
                            color: '#10b981', 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            display: 'block'
                          }}>×</span>
                        </button>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px',
                          paddingRight: '32px'
                        }}>
                          <CheckCircle size={32} color="#10b981" />
                          <h3 style={{
                            color: '#10b981',
                            fontSize: '1.4rem',
                            fontWeight: '700',
                            margin: 0
                          }}>
                            ¡Bienvenido de nuevo, {estudianteExistente.nombre}!
                          </h3>
                        </div>

                        <p style={{
                          color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#1e293b',
                          fontSize: '1.05rem',
                          lineHeight: '1.6',
                          margin: '0 0 16px 0'
                        }}>
                          Ya estás registrado en nuestro sistema con identificación <strong>{estudianteExistente.identificacion}</strong>.
                          Para inscribirte a este nuevo curso, solo necesitas:
                        </p>

                        <ul style={{
                          color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : '#475569',
                          fontSize: '1rem',
                          lineHeight: '1.8',
                          marginTop: '12px',
                          marginBottom: '12px',
                          paddingLeft: '24px'
                        }}>
                          <li>✅ Seleccionar tu horario preferido</li>
                          <li>✅ Elegir método de pago</li>
                          <li>✅ Subir comprobante de pago</li>
                        </ul>

                        <div style={{
                          marginTop: '16px',
                          padding: '12px 16px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}>
                          <p style={{
                            color: '#3b82f6',
                            fontSize: '0.9rem',
                            margin: 0,
                            fontWeight: '600'
                          }}>
                            💡 Tip: Usarás las mismas credenciales de acceso que ya tienes
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CAMPOS PERSONALES - Solo mostrar si NO es estudiante existente Y NO tiene solicitud pendiente */}
                    {!estudianteExistente && !tieneSolicitudPendiente && (
                      <>
                        {/* Tipo de documento - control segmentado estilizado (compacto) */}
                        <div style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, letterSpacing: 0.3, fontSize: '0.95rem', color: theme === 'dark' ? '#fff' : '#1f2937' }}>Tipo de documento</span>
                          </div>
                          <div role="tablist" aria-label="Tipo de documento" className="document-tabs" style={{
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
                                  genero: '',
                                  montoMatricula: curso?.precio || 0,
                                  horarioPreferido: ''
                                });
                                setErrors({});
                                setDocumentoIdentificacion(null);
                                setDocumentoEstatusLegal(null);
                              }}
                              className="document-tab"
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
                                  genero: '',
                                  montoMatricula: curso?.precio || 0,
                                  horarioPreferido: ''
                                });
                                setErrors({});
                                setDocumentoIdentificacion(null);
                                setDocumentoEstatusLegal(null);
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



                        {!estudianteExistente && formData.tipoDocumento !== '' && (
                          <div key={formData.tipoDocumento} style={{ animation: 'fadeInUp 1s ease-in-out' }}>
                            {/* Documento primero */}
                            <div style={{ marginBottom: '20px', animation: 'scaleFade 1s ease-in-out' }}>
                              {formData.tipoDocumento === 'ecuatoriano' ? (
                                <>
                                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme === 'dark' ? '#fff' : '#1f2937' }}>
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
                                    className="form-input"
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
                                      background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                      color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                  <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme === 'dark' ? '#fff' : '#1f2937' }}>
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
                                    className="form-input"
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
                                    style={{
                                      width: '100%',
                                      padding: '12px 16px',
                                      border: errors.pasaporte ? '2px solid #ef4444' : '2px solid rgba(251, 191, 36, 0.2)',
                                      borderRadius: '12px',
                                      fontSize: '1rem',
                                      transition: 'border-color 0.3s ease',
                                      background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                      color: theme === 'dark' ? '#fff' : '#1f2937'
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
                            <div className="form-row" style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '20px',
                              marginBottom: '20px',
                              animation: 'scaleFade 1s ease-in-out'
                            }}>
                              <div style={{ animation: 'scaleFade 1s ease-in-out', animationDelay: '0ms' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme === 'dark' ? '#fff' : '#1f2937' }}>
                                  Nombres completos *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={formData.nombre}
                                  className="form-input"
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
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: theme === 'dark' ? '#fff' : '#1f2937' }}>
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
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                  background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                  background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  minHeight: '90px'
                                }}
                                onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#fbbf24'}
                                onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                              />
                            </div>

                            <div className="form-row" style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '20px',
                              marginBottom: '20px',
                              animation: 'scaleFade 1.2s ease-in-out',
                              animationDelay: '200ms'
                            }}>
                              <div style={{ animation: 'scaleFade 1.2s ease-in-out', animationDelay: '200ms' }}>
                                <label style={{
                                  display: 'block',
                                  marginBottom: '8px',
                                  fontWeight: '600',
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
                                }}>
                                  Género *
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
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937'
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
                            </div>

                            <div className="form-row" style={{
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
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
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
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937'
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

                              {/* Campo Monto a Pagar */}
                              <div style={{ animation: 'scaleFade 1.2s ease-in-out', animationDelay: '360ms' }}>
                                <label style={{
                                  display: 'block',
                                  marginBottom: '8px',
                                  fontWeight: '600',
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
                                }}>
                                  Monto a pagar (USD) *
                                </label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  step="0.01"
                                  value={formData.montoMatricula}
                                  onChange={(e) => {
                                    const newMonto = parseFloat(e.target.value) || 0;
                                    setFormData({ ...formData, montoMatricula: newMonto });

                                    // Mostrar alerta si el monto es diferente al precio original del curso
                                    const precioOriginal = curso?.precio || 0;
                                    setShowMontoAlert(newMonto !== precioOriginal);
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid rgba(251, 191, 36, 0.2)',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.3s ease',
                                    background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                                    color: theme === 'dark' ? '#fff' : '#1f2937',
                                    fontWeight: '600'
                                  }}
                                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#fbbf24'}
                                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                                />

                                {/* Alerta motivacional cuando se edita el monto */}
                                {showMontoAlert && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 12,
                                    marginTop: 12,
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '12px',
                                    animation: 'slideInUp 0.3s ease-out'
                                  }}>
                                    <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div>
                                      <div style={{
                                        color: '#ef4444',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        marginBottom: '6px'
                                      }}>
                                        💡 ¡Recordatorio importante!
                                      </div>
                                      <div style={{
                                        color: '#fca5a5',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.5'
                                      }}>
                                        Con solo <strong>${curso?.precio}</strong> puedes inscribirte al curso de <strong>{curso?.titulo}</strong>.
                                        ¡No pierdas esta oportunidad de transformar tu futuro profesional!
                                        <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                                          ✨ Tu carrera en belleza te está esperando.
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Sección de Documentos - Solo para nuevos estudiantes */}
                        {!estudianteExistente && formData.tipoDocumento !== '' && (
                          <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '16px',
                            padding: '24px',
                            marginTop: '24px',
                            animation: 'scaleFade 1.2s ease-in-out',
                            animationDelay: '400ms'
                          }}>
                            <h4 style={{
                              fontSize: '1.2rem',
                              fontWeight: '700',
                              color: theme === 'dark' ? '#fff' : '#1f2937',
                              marginBottom: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <FileText size={24} color="#3b82f6" />
                              Documentos Requeridos
                            </h4>

                            {/* Documento de Identificación */}
                            <div style={{ marginBottom: '24px' }}>
                              <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                                fontWeight: '600',
                                color: theme === 'dark' ? '#fff' : '#1f2937'
                              }}>
                                <IdCard size={18} color="#3b82f6" />
                                {formData.tipoDocumento === 'ecuatoriano' ? 'Copia de Cédula *' : 'Copia de Pasaporte *'}
                              </label>

                              <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (isBlocked) return;
                                  setDragActive(false);
                                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    handleDocumentoIdentificacionUpload(e.dataTransfer.files[0]);
                                  }
                                }}
                                style={{
                                  border: `2px dashed ${dragActive || documentoIdentificacion ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
                                  borderRadius: '12px',
                                  padding: '20px',
                                  textAlign: 'center',
                                  background: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('documentoIdentificacionInput')?.click()}
                              >
                                <input
                                  id="documentoIdentificacionInput"
                                  type="file"
                                  accept=".pdf,image/jpeg,image/png,image/webp"
                                  onChange={(e) => handleDocumentoIdentificacionUpload(e.target.files?.[0] || null)}
                                  style={{ display: 'none' }}
                                />

                                {documentoIdentificacion ? (
                                  <div>
                                    <div style={{
                                      width: '50px',
                                      height: '50px',
                                      background: 'linear-gradient(135deg, #10b981, #059669)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      margin: '0 auto 12px'
                                    }}>
                                      <CheckCircle size={24} color="#fff" />
                                    </div>
                                    <p style={{
                                      color: '#10b981',
                                      fontWeight: '600',
                                      fontSize: '1rem',
                                      marginBottom: '6px'
                                    }}>
                                      ¡Documento subido!
                                    </p>
                                    <p style={{
                                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                                      fontSize: '0.85rem',
                                      marginBottom: '12px'
                                    }}>
                                      {documentoIdentificacion?.name} ({((documentoIdentificacion?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDocumentoIdentificacion(null);
                                      }}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '6px',
                                        padding: '6px 12px',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '500'
                                      }}
                                    >
                                      Cambiar
                                    </button>
                                  </div>
                                ) : (
                                  <div>
                                    <div style={{
                                      width: '50px',
                                      height: '50px',
                                      background: 'rgba(59, 130, 246, 0.2)',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      margin: '0 auto 12px'
                                    }}>
                                      <IdCard size={24} color="#3b82f6" />
                                    </div>
                                    <p style={{
                                      color: theme === 'dark' ? '#fff' : '#1f2937',
                                      fontWeight: '600',
                                      fontSize: '1rem',
                                      marginBottom: '6px'
                                    }}>
                                      Subir {formData.tipoDocumento === 'ecuatoriano' ? 'cédula' : 'pasaporte'}
                                    </p>
                                    <p style={{
                                      color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                                      fontSize: '0.85rem',
                                      marginBottom: '12px'
                                    }}>
                                      Arrastra y suelta o haz clic para seleccionar
                                    </p>
                                    <p style={{
                                      color: '#999',
                                      fontSize: '0.75rem'
                                    }}>
                                      PDF, JPG, PNG, WEBP (Máx. 5MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Documento de Estatus Legal - Solo para extranjeros */}
                            {formData.tipoDocumento === 'extranjero' && (
                              <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: '12px',
                                  fontWeight: '600',
                                  color: theme === 'dark' ? '#fff' : '#1f2937'
                                }}>
                                  <FileText size={18} color="#3b82f6" />
                                  Documento de Estatus Legal *
                                </label>

                                <div style={{
                                  background: 'rgba(251, 191, 36, 0.1)',
                                  border: '1px solid rgba(251, 191, 36, 0.3)',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  marginBottom: '12px'
                                }}>
                                  <p style={{
                                    color: '#fbbf24',
                                    fontSize: '0.85rem',
                                    margin: 0,
                                    fontWeight: '600'
                                  }}>
                                    📋 Documentos aceptados:
                                  </p>
                                  <ul style={{
                                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                                    fontSize: '0.8rem',
                                    margin: '8px 0 0 0',
                                    paddingLeft: '16px'
                                  }}>
                                    <li>Visa de estudiante vigente</li>
                                    <li>Permiso de residencia válido</li>
                                  </ul>
                                </div>

                                <div
                                  onDragEnter={handleDrag}
                                  onDragLeave={handleDrag}
                                  onDragOver={handleDrag}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isBlocked) return;
                                    setDragActive(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleDocumentoEstatusLegalUpload(e.dataTransfer.files[0]);
                                    }
                                  }}
                                  style={{
                                    border: `2px dashed ${dragActive || documentoEstatusLegal ? '#3b82f6' : 'rgba(59, 130, 246, 0.3)'}`,
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    background: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0, 0, 0, 0.4)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => document.getElementById('documentoEstatusLegalInput')?.click()}
                                >
                                  <input
                                    id="documentoEstatusLegalInput"
                                    type="file"
                                    accept=".pdf,image/jpeg,image/png,image/webp"
                                    onChange={(e) => handleDocumentoEstatusLegalUpload(e.target.files?.[0] || null)}
                                    style={{ display: 'none' }}
                                  />

                                  {documentoEstatusLegal ? (
                                    <div>
                                      <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px'
                                      }}>
                                        <CheckCircle size={24} color="#fff" />
                                      </div>
                                      <p style={{
                                        color: '#10b981',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        marginBottom: '6px'
                                      }}>
                                        ¡Documento subido!
                                      </p>
                                      <p style={{
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                                        fontSize: '0.85rem',
                                        marginBottom: '12px'
                                      }}>
                                        {documentoEstatusLegal?.name} ({((documentoEstatusLegal?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                                      </p>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDocumentoEstatusLegal(null);
                                        }}
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.1)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          borderRadius: '6px',
                                          padding: '6px 12px',
                                          color: '#dc2626',
                                          cursor: 'pointer',
                                          fontSize: '0.8rem',
                                          fontWeight: '500'
                                        }}
                                      >
                                        Cambiar
                                      </button>
                                    </div>
                                  ) : (
                                    <div>
                                      <div style={{
                                        width: '50px',
                                        height: '50px',
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 12px'
                                      }}>
                                        <FileText size={24} color="#3b82f6" />
                                      </div>
                                      <p style={{
                                        color: theme === 'dark' ? '#fff' : '#1f2937',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        marginBottom: '6px'
                                      }}>
                                        Subir documento de estatus legal
                                      </p>
                                      <p style={{
                                        color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                                        fontSize: '0.85rem',
                                        marginBottom: '12px'
                                      }}>
                                        Arrastra y suelta o haz clic para seleccionar
                                      </p>
                                      <p style={{
                                        color: '#999',
                                        fontSize: '0.75rem'
                                      }}>
                                        PDF, JPG, PNG, WEBP (Máx. 5MB)
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {/* Horario Preferido - Solo mostrar si NO tiene solicitud pendiente */}
                    {!tieneSolicitudPendiente && (
                      <div style={{ marginBottom: '24px', animation: 'scaleFade 1.2s ease-in-out' }}>
                        <label style={{
                          display: 'block',
                          marginBottom: '8px',
                          fontWeight: '600',
                          color: theme === 'dark' ? '#fff' : '#1f2937'
                        }}>
                          Horario Preferido *
                        </label>
                      <select
                        required
                        value={formData.horarioPreferido}
                        onChange={(e) => setFormData({ ...formData, horarioPreferido: (e.target as HTMLSelectElement).value as FormData['horarioPreferido'] })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '2px solid rgba(251, 191, 36, 0.2)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          transition: 'border-color 0.3s ease',
                          background: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : '#ffffff',
                          color: theme === 'dark' ? '#fff' : '#1f2937'
                        }}
                        onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#fbbf24'}
                        onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = 'rgba(251, 191, 36, 0.2)'}
                      >
                        <option value="" disabled>Seleccionar horario</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                      </select>

                      {/* Mostrar disponibilidad de cupos por horario */}
                      {formData.horarioPreferido && (
                        <div style={{ marginTop: '12px' }}>
                          {(() => {
                            const cuposHorario = cuposDisponibles.find(
                              (c: any) => c.id_tipo_curso === tipoCursoId && c.horario === formData.horarioPreferido
                            );

                            if (!cuposHorario || cuposHorario.cupos_totales === 0) {
                              return (
                                <div style={{
                                  padding: '12px 16px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '12px',
                                  color: '#ef4444',
                                  fontSize: '0.9rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                  No hay cupos disponibles para este horario. Por favor, selecciona otro horario o espera a que se abra un nuevo curso.
                                </div>
                              );
                            }

                            return (
                              <div style={{
                                padding: '12px 16px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                color: '#10b981',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                <span style={{ fontSize: '1.2rem' }}>✅</span>
                                Cupos disponibles: {cuposHorario.cupos_totales}/{cuposHorario.capacidad_total}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      </div>
                    )}

                  </div>

                  {/* Métodos de pago - Solo mostrar si NO tiene solicitud pendiente */}
                  {!tieneSolicitudPendiente && (
                  <div style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(26,26,26,0.9))'
                      : 'rgba(255, 255, 255, 0.97)',
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '32px',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                  }}>
                    {/* MÉTODOS DE PAGO - Solo mostrar si NO tiene solicitud pendiente */}
                    {!tieneSolicitudPendiente && (
                      <>
                        <h3 className="section-title" style={{
                          fontSize: '1.4rem',
                          fontWeight: '700',
                          color: theme === 'dark' ? '#fff' : '#1f2937',
                          marginBottom: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <CreditCard size={24} color="#fbbf24" />
                          Método de Pago
                        </h3>

                    <div className="payment-methods" style={{
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
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
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
                          color: theme === 'dark' ? '#fff' : '#1f2937',
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
                            background: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.95)',
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
                              background: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.95)',
                              padding: '16px',
                              borderRadius: '12px',
                              marginBottom: '12px'
                            }}>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>Banco:</strong>
                                <span style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', marginLeft: '8px' }}>Banco Nacional</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>Cuenta:</strong>
                                <span style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', marginLeft: '8px' }}>123-456789-0</span>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>Titular:</strong>
                                <span style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)', marginLeft: '8px' }}>Academia SGA Belleza</span>
                              </div>
                              <div>
                                <strong style={{ color: theme === 'dark' ? '#fff' : '#1f2937' }}>Monto:</strong>
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
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
                              fontSize: '0.9rem',
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              Escanea el QR o usa los datos bancarios para realizar la transferencia
                            </p>
                          </div>
                        </div>

                        {/* Información del comprobante */}
                        <div style={{ marginBottom: '24px' }}>
                          <h5 style={{
                            color: '#b45309',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FileText size={18} />
                            Datos del Comprobante *
                          </h5>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            {/* Banco */}
                            <div>
                              <label style={{
                                display: 'block',
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                                fontSize: '0.9rem',
                                marginBottom: '8px',
                                fontWeight: '500'
                              }}>
                                Banco *
                              </label>
                              <select
                                value={bancoComprobante}
                                onChange={(e) => setBancoComprobante(e.target.value)}
                                required
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontSize: '1rem'
                                }}
                              >
                                <option value="">Selecciona el banco</option>
                                <option value="pichincha">Banco Pichincha</option>
                                <option value="guayaquil">Banco de Guayaquil</option>
                                <option value="pacifico">Banco del Pacífico</option>
                                <option value="produbanco">Produbanco</option>
                                <option value="bolivariano">Banco Bolivariano</option>
                                <option value="internacional">Banco Internacional</option>
                                <option value="machala">Banco de Machala</option>
                                <option value="austro">Banco del Austro</option>
                                <option value="cooperativa">Cooperativa</option>
                                <option value="otro">Otro</option>
                              </select>
                            </div>

                            {/* Fecha de transferencia */}
                            <div>
                              <label style={{
                                display: 'block',
                                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                                fontSize: '0.9rem',
                                marginBottom: '8px',
                                fontWeight: '500'
                              }}>
                                Fecha de transferencia *
                              </label>
                              <input
                                type="date"
                                value={fechaTransferencia}
                                onChange={(e) => setFechaTransferencia(e.target.value)}
                                required
                                max={new Date().toISOString().split('T')[0]}
                                style={{
                                  width: '100%',
                                  padding: '12px 16px',
                                  borderRadius: '12px',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontSize: '1rem'
                                }}
                              />
                            </div>
                          </div>

                          {/* Número de comprobante */}
                          <div>
                            <label style={{
                              display: 'block',
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
                              fontSize: '0.9rem',
                              marginBottom: '8px',
                              fontWeight: '500'
                            }}>
                              Número de comprobante *
                              <span style={{
                                color: '#ef4444',
                                fontSize: '0.8rem',
                                marginLeft: '8px'
                              }}>
                                (Debe ser único - no se puede repetir)
                              </span>
                            </label>
                            <input
                              type="text"
                              value={numeroComprobante}
                              onChange={(e) => setNumeroComprobante(e.target.value.toUpperCase())}
                              placeholder="Ej: 123456789, ABC-123-XYZ"
                              required
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
                                color: theme === 'dark' ? '#fff' : '#1f2937',
                                fontSize: '1rem',
                                fontFamily: 'monospace'
                              }}
                            />
                            <p style={{
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontSize: '0.8rem',
                              margin: '8px 0 0 0',
                              lineHeight: 1.4
                            }}>
                              Ingresa el número de referencia/transacción que aparece en tu comprobante bancario.
                              <strong style={{ color: '#fbbf24' }}> Este número debe ser único y no se puede repetir.</strong>
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
                            className="upload-area"
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
                                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontWeight: '600',
                                  fontSize: '1.1rem',
                                  marginBottom: '8px'
                                }}>
                                  Arrastra y suelta tu comprobante aquí
                                </p>
                                <p style={{
                                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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
                              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)',
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
                                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontWeight: '600',
                                  fontSize: '1.1rem',
                                  marginBottom: '8px'
                                }}>
                                  Arrastra y suelta tu comprobante aquí
                                </p>
                                <p style={{
                                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(31, 41, 55, 0.7)',
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

                        {/* Campos adicionales para efectivo */}
                        <div style={{
                          marginTop: '32px',
                          padding: '24px',
                          background: 'rgba(180, 83, 9, 0.1)',
                          borderRadius: '16px',
                          border: '1px solid rgba(180, 83, 9, 0.3)'
                        }}>
                          <h5 style={{
                            color: '#b45309',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FileText size={20} />
                            Información del Comprobante
                          </h5>

                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                          }}>
                            {/* Número de comprobante/factura */}
                            <div>
                              <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#b45309',
                                fontWeight: 600,
                                fontSize: '0.95rem'
                              }}>
                                Número de Comprobante/Factura *
                              </label>
                              <input
                                type="text"
                                value={numeroComprobanteEfectivo}
                                onChange={(e) => setNumeroComprobanteEfectivo(e.target.value.toUpperCase())}
                                placeholder="Ej: 001-001-000123456"
                                required
                                style={{
                                  width: '100%',
                                  padding: '14px 16px',
                                  borderRadius: '12px',
                                  border: '1.5px solid rgba(251, 191, 36, 0.3)',
                                  background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontSize: '1rem',
                                  fontFamily: 'Montserrat, sans-serif',
                                  transition: 'all 0.3s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'}
                              />
                            </div>

                            {/* Recibido por */}
                            <div>
                              <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#b45309',
                                fontWeight: 600,
                                fontSize: '0.95rem'
                              }}>
                                Recibido por *
                              </label>
                              <input
                                type="text"
                                value={recibidoPor}
                                onChange={(e) => setRecibidoPor(e.target.value.toUpperCase())}
                                placeholder="Nombre de quien recibió el pago"
                                required
                                style={{
                                  width: '100%',
                                  padding: '14px 16px',
                                  borderRadius: '12px',
                                  border: '1.5px solid rgba(251, 191, 36, 0.3)',
                                  background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
                                  color: theme === 'dark' ? '#fff' : '#1f2937',
                                  fontSize: '1rem',
                                  fontFamily: 'Montserrat, sans-serif',
                                  transition: 'all 0.3s ease',
                                  outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Alerta de validación al enviar */}
                  {submitAlert && (
                    <div style={{
                      background: theme === 'dark'
                        ? (submitAlert.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : submitAlert.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)')
                        : (submitAlert.type === 'error' ? 'rgba(254, 202, 202, 0.9)' : submitAlert.type === 'success' ? 'rgba(167,243,208,0.9)' : 'rgba(191,219,254,0.9)'),
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: 12,
                      padding: '20px 24px',
                      marginBottom: 24,
                      animation: alertAnimatingOut
                        ? 'alertFadeOut 0.35s ease-in forwards'
                        : 'alertSlideIn 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)',
                      maxWidth: '100%',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                          <AlertCircle
                            size={24}
                            color={submitAlert.type === 'error' ? '#ef4444' : submitAlert.type === 'success' ? '#10b981' : '#3b82f6'}
                            style={{ marginTop: '2px', flexShrink: 0 }}
                          />
                          <div style={{
                            color: theme === 'dark' ? 'rgba(255,255,255,0.95)' : 'rgba(31, 41, 55, 0.95)',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            lineHeight: 1.6,
                            whiteSpace: 'pre-line',
                            flex: 1
                          }}>
                            {submitAlert.text}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSubmitAlert(null)}
                          style={{
                            background: theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(31, 41, 55, 0.15)',
                            border: theme === 'dark' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(31, 41, 55, 0.3)',
                            color: theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(31, 41, 55, 0.9)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            alignSelf: 'flex-start',
                            flexShrink: 0,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.background = theme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(31, 41, 55, 0.25)'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.background = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(31, 41, 55, 0.15)'}
                        >
                          Entendido
                        </button>
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
          )}

                  {/* Botón de envío - Deshabilitado si tiene solicitud pendiente */}
                  <button
                    type="submit"
                    disabled={isBlocked || tieneSolicitudPendiente}
                    className="submit-button"
                    style={{
                      width: '100%',
                      background: (isBlocked || tieneSolicitudPendiente) ? 'rgba(156,163,175,0.4)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: (isBlocked || tieneSolicitudPendiente) ? 'rgba(255,255,255,0.5)' : '#000',
                      padding: '16px 24px',
                      borderRadius: '16px',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      cursor: (isBlocked || tieneSolicitudPendiente) ? 'not-allowed' : 'pointer',
                      boxShadow: (isBlocked || tieneSolicitudPendiente) ? 'none' : '0 12px 40px rgba(251, 191, 36, 0.25)',
                      opacity: (isBlocked || tieneSolicitudPendiente) ? 0.6 : 1,
                      transition: 'all 0.3s ease'
                    }}
                    title={tieneSolicitudPendiente ? 'No puedes inscribirte mientras tengas una solicitud pendiente' : ''}
                  >
                    {tieneSolicitudPendiente ? '🔒 Inscripción Bloqueada' : 'Confirmar Inscripción'}
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
