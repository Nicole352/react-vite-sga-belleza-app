import React, { useState, useEffect, useMemo } from 'react';
import {
  Download, BarChart3, Users, BookOpen, DollarSign,
  Eye, FileSpreadsheet, Loader2, AlertCircle, TrendingUp, CheckCircle2,
  History, Clock, User, Calendar, Search, ArrowUpDown, ArrowUp, ArrowDown,
  Percent, Award, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import GlassEffect from '../../components/GlassEffect';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = 'http://localhost:3000/api';

// Tipos
type Curso = {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  horario: string;
  fecha_inicio: string;
  fecha_fin: string;
  tipo_curso: string;
};

type Periodo = {
  inicio: string;
  fin: string;
  key: string;
};

type DatosReporte = any[];
type Estadisticas = any;

const Reportes = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();
  
  // Estilos para scrollbar horizontal
  const scrollbarStyles = `
    .metricas-scroll {
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: rgba(239, 68, 68, 0.5) rgba(255, 255, 255, 0.05);
    }
    
    .metricas-scroll::-webkit-scrollbar {
      height: 0.375rem;
    }
    .metricas-scroll::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 0.625rem;
    }
    .metricas-scroll::-webkit-scrollbar-thumb {
      background: rgba(239, 68, 68, 0.5);
      border-radius: 0.625rem;
    }
    .metricas-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(239, 68, 68, 0.7);
    }
    
    /* Forzar que las tarjetas no se envuelvan */
    .metricas-scroll > div {
      flex-shrink: 0 !important;
      min-width: 9.375rem !important;
    }
  `;
  
  // Estados principales
  const [tipoReporte, setTipoReporte] = useState('estudiantes');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('todos');
  const [periodosDisponibles, setPeriodosDisponibles] = useState<Periodo[]>([]);
  const [fechaInicio, setFechaInicio] = useState('2025-01-01');
  const [fechaFin, setFechaFin] = useState('2025-12-31');

  // Filtros específicos por tipo de reporte
  const [filtroEstadoEstudiante, setFiltroEstadoEstudiante] = useState('todos');
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroTipoPago, setFiltroTipoPago] = useState('todos');
  const [filtroEstadoPago, setFiltroEstadoPago] = useState('todos');
  
  // Nuevos filtros para cursos
  const [filtroEstadoCursoReporte, setFiltroEstadoCursoReporte] = useState('todos');
  const [filtroOcupacionCurso, setFiltroOcupacionCurso] = useState('todos');
  const [filtroHorarioCurso, setFiltroHorarioCurso] = useState('todos');
  
  // Nuevos filtros para financiero
  const [filtroRangoMonto, setFiltroRangoMonto] = useState('todos');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos');
  const [filtroMesEspecifico, setFiltroMesEspecifico] = useState('todos');
  const [filtroCursoFinanciero, setFiltroCursoFinanciero] = useState('');
  const [filtroEstadoCursoFinanciero, setFiltroEstadoCursoFinanciero] = useState('todos');
  const [filtroHorarioFinanciero, setFiltroHorarioFinanciero] = useState('todos');

  // Estados de datos
  const [datosReporte, setDatosReporte] = useState<DatosReporte | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  // Estados para Historial
  const [vistaActual, setVistaActual] = useState<'generar' | 'historial'>('generar');
  const [historialReportes, setHistorialReportes] = useState<any[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [filtroTipoHistorial, setFiltroTipoHistorial] = useState('todos');

  // Nuevos estados para mejoras
  const [filtroHorario, setFiltroHorario] = useState<'todos' | 'matutino' | 'vespertino'>('todos');
  const [filtroTipoCurso, setFiltroTipoCurso] = useState('todos');
  const [filtroEstadoCurso, setFiltroEstadoCurso] = useState<'todos' | 'activo' | 'finalizado' | 'cancelado'>('todos');
  const [busquedaRapida, setBusquedaRapida] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<'nombre' | 'fecha' | 'monto' | 'capacidad'>('fecha');
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [compararPeriodos, setCompararPeriodos] = useState(false);
  const [datosReportePrevio, setDatosReportePrevio] = useState<DatosReporte | null>(null);

  const reportesDisponibles = [
    {
      id: 'estudiantes',
      titulo: 'Reporte de Estudiantes',
      descripcion: 'Estadísticas de inscripciones y rendimiento académico',
      icono: Users,
      color: '#ef4444'
    },
    {
      id: 'cursos',
      titulo: 'Reporte de Cursos',
      descripcion: 'Análisis de popularidad y ocupación de cursos',
      icono: BookOpen,
      color: '#ef4444'
    },
    {
      id: 'financiero',
      titulo: 'Reporte Financiero',
      descripcion: 'Ingresos, pagos y estado financiero',
      icono: DollarSign,
      color: '#ef4444'
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    console.log('🔑 Token disponible:', !!token);
    if (token) {
      cargarCursosParaFiltro();
      cargarPeriodosDisponibles();
    } else {
      console.error('-No hay token disponible');
    }
  }, []);

  // Actualizar fechas cuando cambia el período seleccionado
  useEffect(() => {
    if (periodoSeleccionado === 'todos') {
      setFechaInicio('2020-01-01');
      setFechaFin('2030-12-31');
    } else if (periodoSeleccionado !== '') {
      const [inicio, fin] = periodoSeleccionado.split('|');
      setFechaInicio(inicio);
      setFechaFin(fin);
    }
  }, [periodoSeleccionado]);

  // Cargar períodos disponibles desde cursos
  const cargarPeriodosDisponibles = async () => {
    try {
      console.log('📅 Iniciando carga de períodos...');
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        console.error('-No hay token disponible para cargar períodos');
        return;
      }

      console.log('🌐 Llamando a:', `${API_BASE}/reportes/cursos-filtro`);
      const response = await fetch(`${API_BASE}/reportes/cursos-filtro`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('📡 Status de respuesta:', response.status);

      if (response.status === 401) {
        console.error('-Token inválido o expirado al cargar períodos');
        return;
      }

      const data = await response.json();
      console.log('✅ Cursos recibidos para períodos:', data);
      console.log('📊 Cantidad de cursos:', data.data?.length || 0);

      if (data.success && data.data.length > 0) {
        // Extraer períodos únicos de los cursos
        const periodosUnicos = new Set<string>();
        data.data.forEach((curso: Curso) => {
          if (curso.fecha_inicio && curso.fecha_fin) {
            const inicio = curso.fecha_inicio.split('T')[0];
            const fin = curso.fecha_fin.split('T')[0];
            periodosUnicos.add(`${inicio}|${fin}`);
          }
        });

        console.log('Períodos únicos encontrados:', Array.from(periodosUnicos));

        // Convertir a array y ordenar por fecha más reciente
        const periodosArray: Periodo[] = Array.from(periodosUnicos)
          .map((periodo) => {
            const [inicio, fin] = periodo.split('|');
            return { inicio, fin, key: periodo };
          })
          .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());

        setPeriodosDisponibles(periodosArray);

        // Establecer período por defecto (el más reciente o año actual)
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const periodoActual = periodosArray.find(p =>
          p.inicio.startsWith(añoActual.toString())
        );

        if (periodoActual) {
          setPeriodoSeleccionado(periodoActual.key);
        } else if (periodosArray.length > 0) {
          setPeriodoSeleccionado(periodosArray[0].key);
        } else {
          // Si no hay períodos, usar año actual
          const inicioAno = `${añoActual}-01-01`;
          const finAno = `${añoActual}-12-31`;
          setFechaInicio(inicioAno);
          setFechaFin(finAno);
        }
      } else {
        // Si no hay cursos, usar año actual
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        setFechaInicio(`${añoActual}-01-01`);
        setFechaFin(`${añoActual}-12-31`);
      }
    } catch (error) {
      console.error('Error cargando períodos:', error);
      // Fallback al año actual
      const hoy = new Date();
      const añoActual = hoy.getFullYear();
      setFechaInicio(`${añoActual}-01-01`);
      setFechaFin(`${añoActual}-12-31`);
    }
  };

  const cargarCursosParaFiltro = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        console.log('No hay token disponible');
        return;
      }

      const response = await fetch(`${API_BASE}/reportes/cursos-filtro`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error('Token inválido o expirado');
        return;
      }

      const data = await response.json();
      console.log('Cursos recibidos para filtro:', data);

      if (data.success) {
        console.log('Cursos disponibles:', data.data);
        setCursosDisponibles(data.data);
        setCursosFiltrados(data.data); // Inicialmente mostrar todos
      } else {
        console.error('Error en respuesta de cursos:', data);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
    }
  };

  // Cargar historial de reportes
  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        toast.error('Sesión expirada');
        return;
      }

      const response = await fetch(`${API_BASE}/reportes/historial?limite=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorialReportes(data.data || []);
      } else {
        toast.error('Error al cargar historial');
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      toast.error('Error al cargar historial');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Cargar historial cuando se cambia a esa vista
  useEffect(() => {
    if (vistaActual === 'historial') {
      cargarHistorial();
    }
  }, [vistaActual]);

  // Filtrar cursos según el período seleccionado
  useEffect(() => {
    console.log('🔍 Filtrando cursos...');
    console.log('Período seleccionado:', periodoSeleccionado);
    console.log('Cursos disponibles:', cursosDisponibles.length);

    if (periodoSeleccionado === 'todos') {
      console.log('✅ Mostrando todos los cursos');
      setCursosFiltrados(cursosDisponibles);
    } else {
      const periodo = periodosDisponibles.find(p => p.key === periodoSeleccionado);
      console.log('Período encontrado:', periodo);

      if (periodo) {
        const cursosFiltradosPorPeriodo = cursosDisponibles.filter(curso => {
          // Normalizar fechas para comparar solo YYYY-MM-DD
          const cursoInicio = curso.fecha_inicio?.split('T')[0] || curso.fecha_inicio;
          const cursoFin = curso.fecha_fin?.split('T')[0] || curso.fecha_fin;
          const periodoInicio = periodo.inicio?.split('T')[0] || periodo.inicio;
          const periodoFin = periodo.fin?.split('T')[0] || periodo.fin;

          const coincide = cursoInicio === periodoInicio && cursoFin === periodoFin;
          console.log(`Curso ${curso.nombre}: inicio=${cursoInicio} vs ${periodoInicio}, fin=${cursoFin} vs ${periodoFin} → ${coincide ? '✅' : '❌'}`);
          return coincide;
        });
        console.log('📊 Cursos filtrados:', cursosFiltradosPorPeriodo.length);
        setCursosFiltrados(cursosFiltradosPorPeriodo);
      }
    }
    // Resetear el curso seleccionado cuando cambia el período
    setFiltroCurso('');
  }, [periodoSeleccionado, cursosDisponibles, periodosDisponibles]);

  // Generar reporte (vista previa)
  const generarReporte = async () => {
    setLoading(true);
    setError('');

    try {
      // Validar que las fechas estén disponibles
      if (!fechaInicio || !fechaFin) {
        setError('Por favor espera a que se carguen los períodos disponibles');
        setLoading(false);
        return;
      }

      console.log('Generando reporte con:', { fechaInicio, fechaFin, tipoReporte });

      let url = '';
      let params = new URLSearchParams({
        fechaInicio,
        fechaFin
      });

      // Construir URL y parámetros según tipo de reporte
      switch (tipoReporte) {
        case 'estudiantes':
          url = `${API_BASE}/reportes/estudiantes`;
          if (filtroEstadoEstudiante !== 'todos') params.append('estado', filtroEstadoEstudiante);
          if (filtroCurso) params.append('idCurso', filtroCurso);
          break;
        case 'cursos':
          url = `${API_BASE}/reportes/cursos`;
          if (filtroEstadoCursoReporte !== 'todos') params.append('estado', filtroEstadoCursoReporte);
          if (filtroOcupacionCurso !== 'todos') params.append('ocupacion', filtroOcupacionCurso);
          if (filtroHorarioCurso !== 'todos') params.append('horario', filtroHorarioCurso);
          break;
        case 'financiero':
          url = `${API_BASE}/reportes/financiero`;
          if (filtroCursoFinanciero) params.append('idCurso', filtroCursoFinanciero);
          if (filtroEstadoCursoFinanciero !== 'todos') params.append('estadoCurso', filtroEstadoCursoFinanciero);
          if (filtroEstadoPago !== 'todos') params.append('estadoPago', filtroEstadoPago);
          if (filtroMetodoPago !== 'todos') params.append('metodoPago', filtroMetodoPago);
          if (filtroHorarioFinanciero !== 'todos') params.append('horario', filtroHorarioFinanciero);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      console.log('URL completa:', `${url}?${params}`);

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('auth_token') || ''}`
        }
      });

      console.log('Status de respuesta:', response.status);

      const data = await response.json();
      console.log('Datos recibidos:', data);

      if (response.status === 401) {
        setError('Sesión expirada. Por favor, vuelve a iniciar sesión.');
        setTimeout(() => {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('auth_user');
          window.location.href = '/aula-virtual';
        }, 2000);
        return;
      }

      if (data.success) {
        console.log('Datos del reporte:', data.data.datos);
        console.log('Estadísticas:', data.data.estadisticas);
        setDatosReporte(data.data.datos);
        setEstadisticas(data.data.estadisticas);
      } else {
        throw new Error(data.message || 'Error al generar el reporte');
      }
    } catch (error: any) {
      console.error('Error generando reporte:', error);
      setError(error.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Descargar archivo
  const descargarArchivo = async (formato: string) => {
    setDescargando(true);
    try {
      let url = '';
      let params = new URLSearchParams({ fechaInicio, fechaFin });

      switch (tipoReporte) {
        case 'estudiantes':
          // Usar ruta v2 para Excel (con historial), ruta normal para PDF
          url = formato === 'excel'
            ? `${API_BASE}/reportes/estudiantes/excel-v2`
            : `${API_BASE}/reportes/estudiantes/${formato}`;
          if (filtroEstadoEstudiante !== 'todos') params.append('estado', filtroEstadoEstudiante);
          if (filtroCurso) params.append('idCurso', filtroCurso);
          break;
        case 'cursos':
          // Usar ruta v2 para Excel (con historial), ruta normal para PDF
          url = formato === 'excel'
            ? `${API_BASE}/reportes/cursos/excel-v2`
            : `${API_BASE}/reportes/cursos/${formato}`;
          if (filtroEstadoCursoReporte !== 'todos') params.append('estado', filtroEstadoCursoReporte);
          if (filtroOcupacionCurso !== 'todos') params.append('ocupacion', filtroOcupacionCurso);
          if (filtroHorarioCurso !== 'todos') params.append('horario', filtroHorarioCurso);
          break;
        case 'financiero':
          // Usar ruta v2 para Excel (con historial), ruta normal para PDF
          url = formato === 'excel'
            ? `${API_BASE}/reportes/financiero/excel-v2`
            : `${API_BASE}/reportes/financiero/${formato}`;
          if (filtroCursoFinanciero) params.append('idCurso', filtroCursoFinanciero);
          if (filtroEstadoCursoFinanciero !== 'todos') params.append('estadoCurso', filtroEstadoCursoFinanciero);
          if (filtroEstadoPago !== 'todos') params.append('estadoPago', filtroEstadoPago);
          if (filtroMetodoPago !== 'todos') params.append('metodoPago', filtroMetodoPago);
          if (filtroHorarioFinanciero !== 'todos') params.append('horario', filtroHorarioFinanciero);
          break;
        default:
          alert(`${formato.toUpperCase()} no disponible para este tipo de reporte`);
          return;
      }

      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        alert('Sesión expirada. Por favor, vuelve a iniciar sesión.');
        return;
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `Reporte_${tipoReporte}_${fechaInicio}_${fechaFin}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);

      // Mostrar mensaje de éxito con trazabilidad
      if (formato === 'excel') {
        toast.success('Reporte descargado y guardado en historial', {
          icon: <CheckCircle2 size={20} />
        });
      } else {
        toast.success('Reporte descargado exitosamente', {
          icon: <CheckCircle2 size={20} />
        });
      }
    } catch (error) {
      console.error(`Error descargando ${formato}:`, error);
      toast.error(`Error al descargar el ${formato.toUpperCase()}`);
    } finally {
      setDescargando(false);
    }
  };

  // Procesar y filtrar datos con useMemo para optimizar
  const datosProcesados = useMemo(() => {
    if (!datosReporte) return [];
    
    let datos = [...datosReporte];
    
    // Aplicar búsqueda rápida
    if (busquedaRapida.trim()) {
      const busqueda = busquedaRapida.toLowerCase();
      datos = datos.filter((item: any) => {
        const nombre = `${item.nombre || item.nombre_estudiante || item.nombre_curso || ''} ${item.apellido || item.apellido_estudiante || ''}`.toLowerCase();
        const curso = (item.nombre_curso || '').toLowerCase();
        return nombre.includes(busqueda) || curso.includes(busqueda);
      });
    }
    
    // Filtros para CURSOS
    if (tipoReporte === 'cursos') {
      // Filtro por estado del curso
      if (filtroEstadoCursoReporte !== 'todos') {
        datos = datos.filter((item: any) => item.estado?.toLowerCase() === filtroEstadoCursoReporte);
      }
      
      // Filtro por ocupación
      if (filtroOcupacionCurso !== 'todos') {
        datos = datos.filter((item: any) => {
          const ocupacion = parseFloat(item.porcentaje_ocupacion || 0);
          if (filtroOcupacionCurso === 'lleno') return ocupacion >= 80;
          if (filtroOcupacionCurso === 'medio') return ocupacion >= 40 && ocupacion < 80;
          if (filtroOcupacionCurso === 'bajo') return ocupacion < 40;
          return true;
        });
      }
      
      // Filtro por horario
      if (filtroHorarioCurso !== 'todos') {
        datos = datos.filter((item: any) => item.horario?.toLowerCase() === filtroHorarioCurso);
      }
    }
    
    // Filtros para FINANCIERO
    if (tipoReporte === 'financiero') {
      // Filtro por método de pago
      if (filtroMetodoPago !== 'todos') {
        datos = datos.filter((item: any) => item.metodo_pago?.toLowerCase() === filtroMetodoPago);
      }
      
      // Filtro por horario
      if (filtroHorarioFinanciero !== 'todos') {
        datos = datos.filter((item: any) => item.horario?.toLowerCase() === filtroHorarioFinanciero);
      }
    }
    
    // Aplicar filtro de horario para estudiantes
    if (tipoReporte === 'estudiantes' && filtroHorario !== 'todos') {
      datos = datos.filter((item: any) => item.horario?.toLowerCase() === filtroHorario);
    }
    
    // Aplicar ordenamiento
    datos.sort((a: any, b: any) => {
      let comparacion = 0;
      
      if (ordenamiento === 'nombre') {
        const nombreA = `${a.nombre || a.nombre_estudiante || a.nombre_curso || ''} ${a.apellido || a.apellido_estudiante || ''}`;
        const nombreB = `${b.nombre || b.nombre_estudiante || b.nombre_curso || ''} ${b.apellido || b.apellido_estudiante || ''}`;
        comparacion = nombreA.localeCompare(nombreB);
      } else if (ordenamiento === 'fecha') {
        const fechaA = new Date(a.fecha_inscripcion || a.fecha_pago || a.fecha_vencimiento || a.fecha_inicio || 0).getTime();
        const fechaB = new Date(b.fecha_inscripcion || b.fecha_pago || b.fecha_vencimiento || b.fecha_inicio || 0).getTime();
        comparacion = fechaB - fechaA; // Más reciente primero por defecto
      } else if (ordenamiento === 'monto' && tipoReporte === 'financiero') {
        comparacion = parseFloat(b.monto || 0) - parseFloat(a.monto || 0); // Mayor primero por defecto
      } else if (ordenamiento === 'capacidad' && tipoReporte === 'cursos') {
        comparacion = parseInt(b.capacidad_maxima || 0) - parseInt(a.capacidad_maxima || 0); // Mayor primero por defecto
      }
      
      return ordenAscendente ? -comparacion : comparacion;
    });
    
    return datos;
  }, [datosReporte, busquedaRapida, filtroHorario, ordenamiento, ordenAscendente, tipoReporte, 
      filtroEstadoCursoReporte, filtroOcupacionCurso, filtroHorarioCurso, filtroMetodoPago, filtroHorarioFinanciero]);

  // Calcular estadísticas mejoradas
  const estadisticasCalculadas = useMemo(() => {
    if (!datosProcesados || datosProcesados.length === 0) return null;
    
    if (tipoReporte === 'estudiantes') {
      const total = datosProcesados.length;
      const aprobados = datosProcesados.filter((e: any) => e.estado_academico === 'aprobado').length;
      const tasaAprobacion = total > 0 ? ((aprobados / total) * 100).toFixed(1) : '0';
      
      return {
        total,
        aprobados,
        tasaAprobacion,
        enCurso: datosProcesados.filter((e: any) => !e.estado_academico || e.estado_academico === 'en_curso').length,
        reprobados: datosProcesados.filter((e: any) => e.estado_academico === 'reprobado').length
      };
    } else if (tipoReporte === 'financiero') {
      const total = datosProcesados.length;
      const ingresoTotal = datosProcesados.reduce((sum: number, p: any) => sum + parseFloat(p.monto || 0), 0);
      const promedio = total > 0 ? ingresoTotal / total : 0;
      const verificados = datosProcesados.filter((p: any) => p.estado === 'verificado').length;
      
      return {
        total,
        ingresoTotal,
        promedio,
        verificados,
        pendientes: datosProcesados.filter((p: any) => p.estado === 'pendiente' || p.estado === 'pagado').length
      };
    } else if (tipoReporte === 'cursos') {
      const total = datosProcesados.length;
      const capacidadTotal = datosProcesados.reduce((sum: number, c: any) => sum + parseInt(c.capacidad_maxima || 0), 0);
      const capacidadPromedio = total > 0 ? Math.round(capacidadTotal / total) : 0;
      const activos = datosProcesados.filter((c: any) => c.estado === 'activo').length;
      const finalizados = datosProcesados.filter((c: any) => c.estado === 'finalizado').length;
      
      return {
        total,
        capacidadPromedio,
        activos,
        finalizados,
        cancelados: datosProcesados.filter((c: any) => c.estado === 'cancelado').length
      };
    }
    
    return null;
  }, [datosProcesados, tipoReporte]);

  // Renderizar filtros específicos
  const renderFiltrosEspecificos = () => {
    if (tipoReporte === 'estudiantes') {
      return (
        <>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Curso:</label>
            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem', minWidth: isMobile ? 'auto' : '18.75rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="">Todos los cursos</option>
              {cursosFiltrados.map((curso: Curso) => {
                // Formatear fechas al estilo: (13 Oct 2025 - 13 Dic 2025)
                const formatearFecha = (fecha: string): string => {
                  if (!fecha) return '';
                  // Extraer año, mes, día directamente del string YYYY-MM-DD
                  const [año, mes, dia] = fecha.split('T')[0].split('-');
                  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  const mesNombre = meses[parseInt(mes) - 1];
                  return `${parseInt(dia)} ${mesNombre} ${año}`;
                };

                const fechaInicio = formatearFecha(curso.fecha_inicio);
                const fechaFin = formatearFecha(curso.fecha_fin);
                const periodo = fechaInicio && fechaFin ? ` (${fechaInicio} - ${fechaFin})` : '';

                // Agregar horario al nombre si existe
                const horario = curso.horario ? ` - ${curso.horario.charAt(0).toUpperCase() + curso.horario.slice(1)}` : '';

                return (
                  <option key={curso.id_curso} value={curso.id_curso}>
                    {curso.nombre}{horario}{periodo}
                  </option>
                );
              })}
            </select>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado:</label>
            <select
              value={filtroEstadoEstudiante}
              onChange={(e) => setFiltroEstadoEstudiante(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="graduado">Graduados</option>
            </select>
          </div>
        </>
      );
    }

    if (tipoReporte === 'cursos') {
      return (
        <>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado:</label>
            <select
              value={filtroEstadoCursoReporte}
              onChange={(e) => setFiltroEstadoCursoReporte(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="finalizado">Finalizados</option>
              <option value="cancelado">Cancelados</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Ocupación:</label>
            <select
              value={filtroOcupacionCurso}
              onChange={(e) => setFiltroOcupacionCurso(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todas las ocupaciones</option>
              <option value="lleno">Llenos (80-100%)</option>
              <option value="medio">Media ocupación (40-79%)</option>
              <option value="bajo">Baja ocupación (0-39%)</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Horario:</label>
            <select
              value={filtroHorarioCurso}
              onChange={(e) => setFiltroHorarioCurso(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos los horarios</option>
              <option value="matutino">Matutino</option>
              <option value="vespertino">Vespertino</option>
            </select>
          </div>
        </>
      );
    }

    if (tipoReporte === 'financiero') {
      return (
        <>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Curso:</label>
            <select
              value={filtroCursoFinanciero}
              onChange={(e) => setFiltroCursoFinanciero(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem', minWidth: isMobile ? 'auto' : '18.75rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="">Todos los cursos</option>
              {cursosFiltrados.map((curso: Curso) => {
                const formatearFecha = (fecha: string): string => {
                  if (!fecha) return '';
                  const [año, mes, dia] = fecha.split('T')[0].split('-');
                  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  const mesNombre = meses[parseInt(mes) - 1];
                  return `${parseInt(dia)} ${mesNombre} ${año}`;
                };

                const fechaInicio = formatearFecha(curso.fecha_inicio);
                const fechaFin = formatearFecha(curso.fecha_fin);
                const periodo = fechaInicio && fechaFin ? ` (${fechaInicio} - ${fechaFin})` : '';
                const horario = curso.horario ? ` - ${curso.horario.charAt(0).toUpperCase() + curso.horario.slice(1)}` : '';

                return (
                  <option key={curso.id_curso} value={curso.id_curso}>
                    {curso.nombre}{horario}{periodo}
                  </option>
                );
              })}
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado Curso:</label>
            <select
              value={filtroEstadoCursoFinanciero}
              onChange={(e) => setFiltroEstadoCursoFinanciero(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="finalizado">Finalizados</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado Pago:</label>
            <select
              value={filtroEstadoPago}
              onChange={(e) => setFiltroEstadoPago(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                width: isMobile ? '100%' : 'auto',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="verificado">Verificados</option>
              <option value="pagado">Pagados</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Método:</label>
            <select
              value={filtroMetodoPago}
              onChange={(e) => setFiltroMetodoPago(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos los métodos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center', 
            gap: '0.5rem',
            flex: isMobile ? '1' : 'initial'
          }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Horario:</label>
            <select
              value={filtroHorarioFinanciero}
              onChange={(e) => setFiltroHorarioFinanciero(e.target.value)}
              style={{
                padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                color: '#fff', fontSize: '0.9rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <option value="todos">Todos los horarios</option>
              <option value="matutino">Matutino</option>
              <option value="vespertino">Vespertino</option>
            </select>
          </div>
        </>
      );
    }

    return null;
  };

  // Renderizar tarjetas de resumen
  const renderTarjetasResumen = () => {
    if (!estadisticasCalculadas) return null;
    
    if (tipoReporte === 'estudiantes') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Users size={28} color="#ef4444" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{estadisticasCalculadas.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total Estudiantes</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle2 size={28} color="#10b981" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{estadisticasCalculadas.tasaAprobacion}%</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Tasa Aprobación</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Target size={28} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{estadisticasCalculadas.enCurso}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>En Curso</div>
            </div>
          </div>
        </div>
      );
    } else if (tipoReporte === 'financiero') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <DollarSign size={28} color="#10b981" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>${estadisticasCalculadas.ingresoTotal.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Ingresos Totales</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <BarChart3 size={28} color="#ef4444" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{estadisticasCalculadas.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total Pagos</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Award size={28} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>${estadisticasCalculadas.promedio.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Promedio</div>
            </div>
          </div>
        </div>
      );
    } else if (tipoReporte === 'cursos') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <BookOpen size={28} color="#ef4444" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff' }}>{estadisticasCalculadas.total}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Total Cursos</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle2 size={28} color="#10b981" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{estadisticasCalculadas.activos}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Cursos Activos</div>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '0.625rem',
            padding: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Users size={28} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6' }}>{estadisticasCalculadas.capacidadPromedio}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>Capacidad Promedio</div>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderEstadisticas = () => {
    if (!datosReporte || !estadisticas) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 1.25rem', color: 'rgba(255,255,255,0.5)' }}>
          <BarChart3 size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', margin: 0 }}>
            Selecciona un tipo de reporte y haz clic en "Ver Reporte" para visualizar las estadísticas
          </p>
        </div>
      );
    }

    if (tipoReporte === 'estudiantes') {
      // Mostrar mensaje si no hay datos
      if (datosReporte && datosReporte.length === 0) {
        return (
          <div style={{ textAlign: 'center', padding: '60px 1.25rem' }}>
            <AlertCircle size={64} color="#f59e0b" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>No hay estudiantes en este período</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              Intenta seleccionar otro período o curso, o verifica que haya estudiantes matriculados.
            </p>
          </div>
        );
      }

      return (
<<<<<<< Updated upstream
        <div style={{ display: 'grid', gap: isMobile ? '16px' : '1.5rem', width: '100%' }}>
          {/* Métricas principales */}
          <div className="metricas-scroll" style={{ 
            display: isMobile ? 'flex' : 'grid',
            flexWrap: isMobile ? 'nowrap' : undefined,
            gridTemplateColumns: isMobile ? 'none' : 'repeat(4, 1fr)',
            gap: isMobile ? '10px' : '0.75rem',
            width: isMobile ? 'calc(100% + 2rem)' : '100%',
            overflowX: isMobile ? 'scroll' : 'visible',
            overflowY: 'hidden',
            paddingBottom: isMobile ? '8px' : '0',
            WebkitOverflowScrolling: 'touch',
            marginLeft: isMobile ? '-16px' : '0',
            marginRight: isMobile ? '-16px' : '0',
            paddingLeft: isMobile ? '16px' : '0',
            paddingRight: isMobile ? '16px' : '0'
          }}>
            {[
              { titulo: 'Total Estudiantes', valor: estadisticas.total_estudiantes || 0, color: '#3b82f6', icono: Users },
              { titulo: 'Activos', valor: estadisticas.activos || 0, color: '#10b981', icono: CheckCircle2 },
              { titulo: 'Aprobados', valor: estadisticas.aprobados || 0, color: '#8b5cf6', icono: TrendingUp },
              { titulo: 'Retirados', valor: estadisticas.retirados || 0, color: '#ef4444', icono: AlertCircle }
            ].map((metrica, idx) => (
              <div
                key={idx}
                style={{
                  background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                  border: `2px solid ${metrica.color}40`,
                  borderRadius: '0.625rem', 
                  padding: isMobile ? '14px 0.625rem' : '20px 1rem',
                  textAlign: 'center',
                  boxShadow: `0 0.25rem 1.25rem ${metrica.color}20`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '90px' : '7.5rem',
                  width: isMobile ? '140px' : 'auto',
                  minWidth: isMobile ? '140px' : 'auto',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
              >
                <metrica.icono size={isMobile ? 24 : 32} color={metrica.color} style={{ marginBottom: '0.375rem', filter: 'drop-shadow(0 0.125rem 0.5rem rgba(0,0,0,0.3))', flexShrink: 0 }} />
                <div style={{
                  color: '#fff',
                  fontSize: isMobile ? '1.4rem' : '1.8rem', 
                  fontWeight: '800', 
                  marginBottom: '0.25rem',
                  textShadow: '0 0.125rem 0.625rem rgba(0,0,0,0.5)',
                  lineHeight: '1'
                }}>
                  {metrica.valor}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: isMobile ? '0.7rem' : '0.8rem', 
                  fontWeight: '600', 
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}>
                  {metrica.titulo}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de estudiantes */}
          {datosReporte.length > 0 && (
            <div>
=======
        <div style={{ 
          display: 'grid', 
          gap: isMobile ? '16px' : '1.5rem', 
          width: '100%', 
          maxWidth: '100%'
        }}>
          {/* Tarjetas de resumen */}
          {renderTarjetasResumen()}
          
          {/* Controles de búsqueda y ordenamiento */}
          {datosReporte.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '0.75rem',
              marginBottom: '1rem',
              alignItems: isMobile ? 'stretch' : 'center'
            }}>
              {/* Búsqueda rápida */}
              <div style={{ position: 'relative', flex: 1, minWidth: isMobile ? 'auto' : '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o curso..."
                  value={busquedaRapida}
                  onChange={(e) => setBusquedaRapida(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 0.75rem 8px 2.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
              
              {/* Ordenamiento */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    if (ordenamiento === 'nombre') {
                      setOrdenAscendente(!ordenAscendente);
                    } else {
                      setOrdenamiento('nombre');
                      setOrdenAscendente(true);
                    }
                  }}
                  style={{
                    padding: '8px 0.75rem',
                    background: ordenamiento === 'nombre' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                    border: ordenamiento === 'nombre' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontWeight: ordenamiento === 'nombre' ? '600' : '400'
                  }}
                >
                  {ordenamiento === 'nombre' ? (ordenAscendente ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                  Nombre
                </button>
                
                <button
                  onClick={() => {
                    if (ordenamiento === 'fecha') {
                      setOrdenAscendente(!ordenAscendente);
                    } else {
                      setOrdenamiento('fecha');
                      setOrdenAscendente(false);
                    }
                  }}
                  style={{
                    padding: '8px 0.75rem',
                    background: ordenamiento === 'fecha' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                    border: ordenamiento === 'fecha' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontWeight: ordenamiento === 'fecha' ? '600' : '400'
                  }}
                >
                  {ordenamiento === 'fecha' ? (ordenAscendente ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                  Fecha
                </button>
                
                {tipoReporte === 'financiero' && (
                  <button
                    onClick={() => {
                      if (ordenamiento === 'monto') {
                        setOrdenAscendente(!ordenAscendente);
                      } else {
                        setOrdenamiento('monto');
                        setOrdenAscendente(false);
                      }
                    }}
                    style={{
                      padding: '8px 0.75rem',
                      background: ordenamiento === 'monto' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)',
                      border: ordenamiento === 'monto' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontWeight: ordenamiento === 'monto' ? '600' : '400'
                    }}
                  >
                    {ordenamiento === 'monto' ? (ordenAscendente ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} />}
                    Monto
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Lista de estudiantes */}
          {datosProcesados.length > 0 && (
            <div style={{
              maxHeight: isMobile ? 'auto' : '60vh',
              overflowY: isMobile ? 'visible' : 'auto',
              paddingRight: isMobile ? '0' : '0.5rem'
            }}>
>>>>>>> Stashed changes
              <h4 style={{
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: '700',
                marginBottom: '0.75rem',
                textShadow: '0 0.125rem 0.25rem rgba(0,0,0,0.5)'
              }}>
                Estudiantes Matriculados ({datosProcesados.length})
              </h4>
              
              {/* Indicador de scroll en móvil */}
              {isSmallScreen && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '8px 0.75rem',
                  marginBottom: '0.75rem',
                  color: '#ef4444',
<<<<<<< Updated upstream
                  fontSize: '0.75rem',
=======
                  fontSize: '0.7rem',
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem'
                }}>
<<<<<<< Updated upstream
<<<<<<< Updated upstream
                  <span>👉</span>
                  <span>Desliza horizontalmente para ver toda la tabla</span>
                  <span>👈</span>
                </div>
              )}
              
              <div 
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: isMobile ? 12 : 16,
                  boxShadow: '0 0.25rem 1.25rem rgba(59, 130, 246, 0.1)',
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  maxWidth: '100%'
                }}
              >
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  minWidth: isMobile ? '700px' : '100%',
                  tableLayout: 'auto'
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.1)'
                    }}>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Nombre</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Curso</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Estado</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Fecha Inscripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReporte.slice(0, 10).map((estudiante, idx) => (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        transition: 'background 0.2s ease'
                      }}>
                        <td style={{
                          padding: '16px 0.75rem',
                          color: '#fff',
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          {estudiante.nombre} {estudiante.apellido}
                        </td>
                        <td style={{
                          padding: '16px 0.75rem',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '0.9rem'
                        }}>
                          {estudiante.nombre_curso}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                          <span style={{
                            padding: '4px 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: estudiante.estado_academico === 'aprobado' ? 'rgba(16, 185, 129, 0.2)' :
                              estudiante.estado_academico === 'reprobado' ? 'rgba(239, 68, 68, 0.2)' :
                                'rgba(59, 130, 246, 0.2)',
                            color: estudiante.estado_academico === 'aprobado' ? '#10b981' :
                              estudiante.estado_academico === 'reprobado' ? '#ef4444' :
                                '#3b82f6'
                          }}>
                            {estudiante.estado_academico?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px 0.75rem',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '0.9rem'
                        }}>
                          {new Date(estudiante.fecha_inscripcion).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datosReporte.length > 10 && (
                  <div style={{ padding: isMobile ? '12px' : '1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>
                      Mostrando 10 de {datosReporte.length} estudiantes. Descarga el reporte completo en PDF o Excel.
                    </p>
=======
                  <TrendingUp size={14} />
                  Desliza horizontalmente
                </div>
              )}
              
=======
                  <TrendingUp size={14} />
                  Desliza horizontalmente
                </div>
              )}
              
>>>>>>> Stashed changes
              {/* Cards en grid compacto */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '0.5rem'
                }}
              >
                {datosProcesados.map((estudiante, idx) => (
                  <div key={idx} style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)';
                  }}
                  >
                    {/* Nombre */}
                    <div style={{
                      color: '#fff',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      lineHeight: '1.2',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {estudiante.nombre} {estudiante.apellido}
                    </div>
                    
                    {/* Curso */}
                    <div style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      overflow: 'hidden'
                    }}>
                      <BookOpen size={11} color="rgba(255,255,255,0.6)" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {estudiante.nombre_curso}
                      </span>
                    </div>
                    
                    {/* Estado y Fecha en la misma línea */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.625rem',
                        fontWeight: '700',
                        background: estudiante.estado_academico === 'aprobado' ? 'rgba(16, 185, 129, 0.15)' :
                          estudiante.estado_academico === 'reprobado' ? 'rgba(239, 68, 68, 0.15)' :
                            'rgba(239, 68, 68, 0.1)',
                        border: estudiante.estado_academico === 'aprobado' ? '1px solid rgba(16, 185, 129, 0.3)' :
                          estudiante.estado_academico === 'reprobado' ? '1px solid rgba(239, 68, 68, 0.3)' :
                            '1px solid rgba(239, 68, 68, 0.2)',
                        color: estudiante.estado_academico === 'aprobado' ? '#10b981' :
                          estudiante.estado_academico === 'reprobado' ? '#ef4444' :
                            '#ef4444',
                        whiteSpace: 'nowrap'
                      }}>
                        {estudiante.estado_academico?.toUpperCase() || 'ACTIVO'}
                      </div>
                      
                      <div style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap'
                      }}>
                        <Calendar size={10} color="rgba(255,255,255,0.5)" />
                        {new Date(estudiante.fecha_inscripcion).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: '2-digit' 
                        })}
                      </div>
                    </div>
>>>>>>> Stashed changes
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tipoReporte === 'financiero') {
      return (
        <div style={{ display: 'grid', gap: isMobile ? '12px' : '1rem', width: '100%' }}>
          {/* Métricas principales */}
          <div className="metricas-scroll" style={{ 
            display: isMobile ? 'flex' : 'grid',
            flexWrap: isMobile ? 'nowrap' : undefined,
            gridTemplateColumns: isMobile ? 'none' : 'repeat(4, 1fr)',
            gap: isMobile ? '10px' : '0.75rem',
            width: isMobile ? 'calc(100% + 2rem)' : '100%',
            overflowX: isMobile ? 'scroll' : 'visible',
            overflowY: 'hidden',
            paddingBottom: isMobile ? '8px' : '0',
            WebkitOverflowScrolling: 'touch',
            marginLeft: isMobile ? '-16px' : '0',
            marginRight: isMobile ? '-16px' : '0',
            paddingLeft: isMobile ? '16px' : '0',
            paddingRight: isMobile ? '16px' : '0'
          }}>
            {[
              { titulo: 'Ingresos Totales', valor: `$${parseFloat(estadisticas.ingresos_totales || 0).toLocaleString()}`, color: '#10b981', icono: DollarSign },
              { titulo: 'Pagos Verificados', valor: estadisticas.pagos_verificados || 0, color: '#3b82f6', icono: CheckCircle2 },
              { titulo: 'Pagos Pendientes', valor: estadisticas.pagos_pendientes || 0, color: '#f59e0b', icono: AlertCircle },
              { titulo: 'Total Pagos', valor: estadisticas.total_pagos || 0, color: '#8b5cf6', icono: TrendingUp }
            ].map((metrica, idx) => (
              <div
                key={idx}
                style={{
                  background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                  border: `2px solid ${metrica.color}40`,
                  borderRadius: '0.625rem', 
                  padding: isMobile ? '14px 0.625rem' : '20px 1rem',
                  textAlign: 'center',
                  boxShadow: `0 0.25rem 1.25rem ${metrica.color}20`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: isMobile ? '90px' : '7.5rem',
                  width: isMobile ? '140px' : 'auto',
                  minWidth: isMobile ? '140px' : 'auto',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
              >
                <metrica.icono size={isMobile ? 24 : 32} color={metrica.color} style={{ marginBottom: '0.375rem', filter: 'drop-shadow(0 0.125rem 0.5rem rgba(0,0,0,0.3))', flexShrink: 0 }} />
                <div style={{
                  color: '#fff',
                  fontSize: isMobile ? '1.2rem' : '1.5rem', 
                  fontWeight: '800', 
                  marginBottom: '0.25rem',
                  textShadow: '0 0.125rem 0.625rem rgba(0,0,0,0.5)',
                  lineHeight: '1'
                }}>
                  {metrica.valor}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: isMobile ? '0.7rem' : '0.8rem', 
                  fontWeight: '600', 
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                  lineHeight: '1.2',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isMobile ? 'normal' : 'nowrap'
                }}>
                  {metrica.titulo}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de pagos */}
          {datosReporte.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: isMobile ? '10px' : '0.75rem',
              padding: isMobile ? '12px' : '1rem',
              boxShadow: '0 0.25rem 1.25rem rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Detalle de Pagos ({datosReporte.length})
              </h4>
              
              {/* Indicador de scroll en móvil */}
              {isSmallScreen && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  padding: '8px 0.75rem',
                  marginBottom: '0.75rem',
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem'
                }}>
                  <TrendingUp size={14} />
                  <span>Desliza horizontalmente para ver toda la tabla</span>
                </div>
              )}
              
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              <div 
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: isMobile ? 10 : 12,
                  boxShadow: '0 0.25rem 1.25rem rgba(16, 185, 129, 0.1)',
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  maxWidth: '100%'
                }}
              >
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  minWidth: isMobile ? '800px' : '100%',
                  tableLayout: 'auto'
                }}>
                  <thead>
                    <tr style={{
                      borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
                      background: 'rgba(16, 185, 129, 0.1)'
                    }}>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#10b981',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Estudiante</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#10b981',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Curso</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#10b981',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Monto</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#10b981',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Fecha</th>
                      <th style={{
                        padding: '10px 0.5rem',
                        textAlign: 'left',
                        color: '#10b981',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReporte.slice(0, 10).map((pago, idx) => (
                      <tr key={idx} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        transition: 'background 0.2s ease'
                      }}>
                        <td style={{
                          padding: '10px 0.5rem',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: '500'
=======
=======
>>>>>>> Stashed changes
              {/* Cards en grid compacto */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '0.5rem'
                }}
              >
                {datosProcesados.map((pago, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '0.5rem',
                        padding: '0.625rem 0.75rem',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.05) 100%)';
                      }}
                    >
                      {/* Nombre */}
                      <div style={{
                        fontSize: '0.8125rem',
                        fontWeight: '600',
                        color: '#fff',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {pago.nombre_estudiante} {pago.apellido_estudiante}
                      </div>
                      
                      {/* Curso */}
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        overflow: 'hidden'
                      }}>
                        <BookOpen size={11} color="rgba(255,255,255,0.6)" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pago.nombre_curso}
                        </span>
                      </div>
                      
                      {/* Monto y Fecha en la misma línea */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem'
                      }}>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap'
                        }}>
                          <DollarSign size={14} color="#10b981" />
                          ${parseFloat(pago.monto).toFixed(2)}
                        </div>
                        
                        <div style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255,255,255,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          whiteSpace: 'nowrap'
                        }}>
                          <Calendar size={10} color="rgba(255,255,255,0.5)" />
                          {pago.fecha_pago
                            ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
                            : pago.fecha_vencimiento
                              ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
                              : 'N/A'
                          }
                        </div>
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: pago.estado_pago === 'verificado' ? 'rgba(16, 185, 129, 0.2)' :
                            pago.estado_pago === 'pagado' ? 'rgba(59, 130, 246, 0.2)' :
                              'rgba(239, 68, 68, 0.2)',
                          color: pago.estado_pago === 'verificado' ? '#10b981' :
                            pago.estado_pago === 'pagado' ? '#3b82f6' :
                              '#ef4444'
>>>>>>> Stashed changes
                        }}>
                          {pago.nombre_estudiante} {pago.apellido_estudiante}
                        </td>
                        <td style={{
                          padding: '10px 0.5rem',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '0.75rem'
                        }}>
                          {pago.nombre_curso}
                        </td>
                        <td style={{
                          padding: '10px 0.5rem',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          ${parseFloat(pago.monto).toFixed(2)}
                        </td>
                        <td style={{
                          padding: '10px 0.5rem',
                          color: 'rgba(255,255,255,0.85)',
                          fontSize: '0.75rem'
                        }}>
                          {pago.fecha_pago
                            ? new Date(pago.fecha_pago).toLocaleDateString('es-ES')
                            : pago.fecha_vencimiento
                              ? new Date(pago.fecha_vencimiento).toLocaleDateString('es-ES')
                              : 'N/A'
                          }
                        </td>
                        <td style={{ padding: '10px 0.5rem', fontSize: '0.75rem' }}>
                          <span style={{
                            padding: '4px 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            background: pago.estado_pago === 'verificado' ? 'rgba(16, 185, 129, 0.2)' :
                              pago.estado_pago === 'pagado' ? 'rgba(59, 130, 246, 0.2)' :
                                'rgba(239, 68, 68, 0.2)',
                            color: pago.estado_pago === 'verificado' ? '#10b981' :
                              pago.estado_pago === 'pagado' ? '#3b82f6' :
                                '#ef4444'
                          }}>
                            {pago.estado_pago?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {datosReporte.length > 10 && (
                  <div style={{ padding: isMobile ? '12px' : '1rem' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>
                      Mostrando 10 de {datosReporte.length} pagos. Descarga el reporte completo en PDF o Excel.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (tipoReporte === 'cursos') {
      return (
        <div style={{ display: 'grid', gap: isMobile ? '12px' : '1rem', width: '100%' }}>
          {/* Métricas principales */}
          <div className="metricas-scroll" style={{ 
            display: isMobile ? 'flex' : 'grid',
            flexWrap: isMobile ? 'nowrap' : undefined,
            gridTemplateColumns: isMobile ? 'none' : 'repeat(3, 1fr)',
            gap: isMobile ? '10px' : '0.75rem',
            width: isMobile ? 'calc(100% + 2rem)' : '100%',
            overflowX: isMobile ? 'scroll' : 'visible',
            overflowY: 'hidden',
            paddingBottom: isMobile ? '8px' : '0',
            WebkitOverflowScrolling: 'touch',
            marginLeft: isMobile ? '-16px' : '0',
            marginRight: isMobile ? '-16px' : '0',
            paddingLeft: isMobile ? '16px' : '0',
            paddingRight: isMobile ? '16px' : '0'
          }}>
            {[
              { titulo: 'Total Cursos', valor: estadisticas.total_cursos || 0, color: '#10b981', icono: BookOpen },
              { titulo: 'Cursos Activos', valor: estadisticas.cursos_activos || 0, color: '#3b82f6', icono: CheckCircle2 },
              { titulo: 'Total Estudiantes', valor: estadisticas.total_estudiantes_inscritos || 0, color: '#f59e0b', icono: Users }
            ].map((metrica, idx) => (
              <GlassEffect
                key={idx}
                variant="card"
                tint="neutral"
                intensity="light"
                                style={{
                  background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                  border: `2px solid ${metrica.color}40`,
                  borderRadius: '0.625rem', padding: isMobile ? '10px 0.5rem' : '0.75rem',
                  textAlign: 'center',
                  boxShadow: `0 0.25rem 1.25rem ${metrica.color}20`,
                  width: isMobile ? '140px' : 'auto',
                  minWidth: isMobile ? '140px' : 'auto',
                  flexShrink: 0
                }}
              >
                <metrica.icono size={28} color={metrica.color} style={{ marginBottom: '0.375rem', filter: 'drop-shadow(0 0.125rem 0.5rem rgba(0,0,0,0.3))' }} />
                <div style={{
                  color: '#fff',
                  fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.25rem',
                  textShadow: '0 0.125rem 0.625rem rgba(0,0,0,0.5)',
                  lineHeight: '1'
                }}>
                  {metrica.valor}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {metrica.titulo}
                </div>
              </GlassEffect>
            ))}
          </div>

          {/* Lista de cursos */}
          {datosReporte.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              borderRadius: isMobile ? '10px' : '0.75rem',
              padding: isMobile ? '12px' : '1rem',
              boxShadow: '0 0.25rem 1.25rem rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Cursos Disponibles ({datosReporte.length})
              </h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {datosReporte.slice(0, 5).map((curso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '0.625rem',
                    padding: '0.75rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      justifyContent: 'space-between', 
                      alignItems: isMobile ? 'flex-start' : 'center', 
                      marginBottom: '0.375rem',
                      gap: isMobile ? '4px' : '0'
                    }}>
                      <div style={{ color: '#fff', fontSize: isMobile ? '0.8rem' : '0.85rem', fontWeight: '600' }}>
                        {curso.nombre_curso}
                      </div>
                      <div style={{ color: '#10b981', fontSize: isMobile ? '0.8rem' : '0.85rem', fontWeight: '700' }}>
                        {curso.porcentaje_ocupacion}% ocupación
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', height: '0.5rem' }}>
                        <div style={{
                          background: '#10b981',
                          height: '100%',
                          borderRadius: '0.5rem',
                          width: `${curso.porcentaje_ocupacion}%`
                        }} />
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {curso.total_estudiantes}/{curso.capacidad_maxima}
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '4px' : '1rem', 
                      fontSize: isMobile ? '0.75rem' : '0.85rem', 
                      color: 'rgba(255,255,255,0.6)' 
                    }}>
                      <span>Horario: {curso.horario}</span>
                      <span>Docente: {curso.docente_nombres} {curso.docente_apellidos}</span>
                    </div>
                  </div>
                ))}
              </div>
              {datosReporte.length > 5 && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                  Mostrando 5 de {datosReporte.length} cursos. Descarga el reporte completo en PDF o Excel.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '60px 1.25rem', color: 'rgba(255,255,255,0.5)' }}>
        <AlertCircle size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p style={{ fontSize: '1.1rem', margin: 0 }}>
          Visualización de estadísticas en desarrollo para este tipo de reporte
        </p>
      </div>
    );
  };

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div>
        <div style={{ marginBottom: isMobile ? '12px' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)', 
          margin: '0 0 0.375rem 0',
          display: 'flex', 
          alignItems: 'center', 
          gap: isMobile ? '6px' : '0.625rem'
        }}>
          <BarChart3 size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Reportes y Estadísticas
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          margin: 0, 
          fontSize: isMobile ? '0.75rem' : '0.85rem'
        }}>
          Análisis detallado del rendimiento académico y financiero
        </p>
      </div>

      {/* Pestañas: Generar / Historial */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        borderBottom: '2px solid rgba(239, 68, 68, 0.2)'
      }}>
        <button
          onClick={() => setVistaActual('generar')}
          style={{
            padding: '8px 0.875rem',
            background: vistaActual === 'generar' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: vistaActual === 'generar' ? '2px solid #ef4444' : '2px solid transparent',
            color: vistaActual === 'generar' ? '#ef4444' : 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3125rem'
          }}
        >
          <BarChart3 size={14} />
          Generar Reporte
        </button>
        <button
          onClick={() => setVistaActual('historial')}
          style={{
            padding: '8px 0.875rem',
            background: vistaActual === 'historial' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: vistaActual === 'historial' ? '2px solid #ef4444' : '2px solid transparent',
            color: vistaActual === 'historial' ? '#ef4444' : 'rgba(255,255,255,0.6)',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3125rem'
          }}
        >
          <History size={14} />
          Historial
        </button>
      </div>

      {/* Vista: Generar Reporte */}
      {vistaActual === 'generar' && (
        <>
          {/* Selector de Tipo de Reporte */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.625rem', 
            marginBottom: '1rem' 
          }}>
            {reportesDisponibles.map(reporte => {
              const isSelected = tipoReporte === reporte.id;
              const IconComponent = reporte.icono;
              
              return (
                <div
                  key={reporte.id}
                  onClick={() => {
                    setTipoReporte(reporte.id);
                    setDatosReporte(null);
                    setEstadisticas(null);
                    // Resetear filtros específicos
                    setFiltroEstadoCursoReporte('todos');
                    setFiltroOcupacionCurso('todos');
                    setFiltroHorarioCurso('todos');
                    setFiltroMetodoPago('todos');
                    setFiltroEstadoEstudiante('todos');
                    setFiltroCurso('');
                    setFiltroEstadoPago('todos');
                    setFiltroCursoFinanciero('');
                    setFiltroEstadoCursoFinanciero('todos');
                    setFiltroHorarioFinanciero('todos');
                    setBusquedaRapida('');
                  }}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                    border: isSelected 
                      ? '2px solid #ef4444' 
                      : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.625rem',
                    padding: isMobile ? '0.75rem' : '0.875rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected 
                      ? '0 0.25rem 1rem rgba(239, 68, 68, 0.4)' 
                      : '0 0.125rem 0.5rem rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <IconComponent size={20} color={isSelected ? '#fff' : '#ef4444'} />
                    <div style={{
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      lineHeight: '1.2'
                    }}>
                      {reporte.titulo}
                    </div>
                  </div>
                  <div style={{
                    color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                    fontSize: '0.75rem',
                    lineHeight: '1.3'
                  }}>
                    {reporte.descripcion}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Filtro */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: isMobile ? '12px' : '1rem', 
            padding: isMobile ? '12px' : '1rem', 
            marginBottom: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              flexWrap: 'wrap', 
              gap: '0.75rem', 
              alignItems: isMobile ? 'stretch' : 'center', 
              justifyContent: 'space-between' 
            }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: '0.75rem', 
                alignItems: isMobile ? 'stretch' : 'center', 
                flex: 1, 
                flexWrap: 'wrap' 
              }}>
                {/* Selector de Período */}
                <div style={{ minWidth: isMobile ? 'auto' : 200, flex: isMobile ? '1' : 'initial' }}>
                  <select
                    value={periodoSeleccionado}
                    onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                    style={{
                      padding: '10px 0.75rem', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.625rem',
                      color: '#fff', fontSize: '0.8rem', minWidth: '15.625rem'
                    }}
                  >
                    <option value="todos" style={{ background: '#1a1a1a' }}>Todos los períodos</option>
                    {periodosDisponibles.map((periodo, idx) => {
                      const formatearFecha = (fecha: string): string => {
                        if (!fecha) return '';
                        const [año, mes, dia] = fecha.split('T')[0].split('-');
                        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                        const mesNombre = meses[parseInt(mes) - 1];
                        return `${parseInt(dia)} ${mesNombre} ${año}`;
                      };

                      const fechaInicio = formatearFecha(periodo.inicio);
                      const fechaFin = formatearFecha(periodo.fin);

                      return (
                        <option key={idx} value={periodo.key} style={{ background: '#1a1a1a' }}>
                          {fechaInicio} - {fechaFin}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Filtros específicos */}
                {renderFiltrosEspecificos()}
                
                {/* Nuevo: Filtro por Horario (solo para estudiantes) */}
                {tipoReporte === 'estudiantes' && (
                  <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '0.5rem', flex: isMobile ? '1' : 'initial' }}>
                    <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Horario:</label>
                    <select
                      value={filtroHorario}
                      onChange={(e) => setFiltroHorario(e.target.value as any)}
                      style={{
                        padding: '8px 0.75rem', background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                        color: '#fff', fontSize: '0.9rem', width: isMobile ? '100%' : 'auto'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Botón Ver Reporte */}
              <button
                onClick={generarReporte}
                disabled={loading || descargando}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: isMobile ? '10px 1rem' : '12px 1.5rem',
                  background: loading ? 'rgba(239, 68, 68, 0.3)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '0.625rem',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 0.25rem 0.75rem rgba(239, 68, 68, 0.3)',
                  width: isSmallScreen ? '100%' : 'auto'
                }}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={16} />}
                {loading ? 'Generando...' : 'Ver Reporte'}
              </button>
            </div>
          </div>

          {/* Botones de Exportación */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.75rem', 
            marginBottom: '1rem', 
            justifyContent: isMobile ? 'stretch' : 'flex-end' 
          }}>
            <button
              onClick={() => descargarArchivo('pdf')}
              disabled={!datosReporte || descargando || loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '10px 1.25rem',
                background: (!datosReporte || descargando || loading) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '0.5rem', color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600',
                cursor: (!datosReporte || descargando || loading) ? 'not-allowed' : 'pointer',
                opacity: (!datosReporte || descargando || loading) ? 0.5 : 1,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {descargando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              Exportar PDF
            </button>
            <button
              onClick={() => descargarArchivo('excel')}
              disabled={!datosReporte || descargando || loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '10px 1.25rem',
                background: (!datosReporte || descargando || loading) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0.5rem', color: '#10b981', fontSize: '0.8rem', fontWeight: '600',
                cursor: (!datosReporte || descargando || loading) ? 'not-allowed' : 'pointer',
                opacity: (!datosReporte || descargando || loading) ? 0.5 : 1,
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {descargando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileSpreadsheet size={16} />}
              Exportar Excel
            </button>
          </div>

          {/* Contenido del Reporte */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(1.25rem)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: isMobile ? '12px' : '1.25rem', 
            padding: isMobile ? '16px' : '2rem',
            overflowX: 'hidden',
            overflowY: 'auto'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ 
                color: '#fff', 
                fontSize: isMobile ? '0.95rem' : '1.1rem', 
                fontWeight: '700', 
                margin: '0 0 0.375rem 0' 
              }}>
                {reportesDisponibles.find(r => r.id === tipoReporte)?.titulo}
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                margin: 0, 
                fontSize: isMobile ? '0.7rem' : '0.75rem',
                wordBreak: 'break-word'
              }}>
                Período: {fechaInicio} - {fechaFin}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: isMobile ? '10px' : '0.75rem',
              padding: isMobile ? '12px' : '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#ef4444'
              }}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {renderEstadisticas()}
          </div>
        </>
      )}

      {/* Vista: Historial */}
      {vistaActual === 'historial' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(1.25rem)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem'
        }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: '#fff', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={22} color="#ef4444" />
                Historial de Reportes
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.75rem' }}>
                Últimos 50 reportes generados
              </p>
            </div>
            <select
              value={filtroTipoHistorial}
              onChange={(e) => setFiltroTipoHistorial(e.target.value)}
              style={{
                padding: '8px 0.75rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="todos" style={{ background: '#1a1a1a' }}>Todos los tipos</option>
              <option value="1" style={{ background: '#1a1a1a' }}>Estudiantes</option>
              <option value="2" style={{ background: '#1a1a1a' }}>Financiero</option>
              <option value="3" style={{ background: '#1a1a1a' }}>Cursos</option>
            </select>
          </div>

          {loadingHistorial ? (
            <div style={{ textAlign: 'center', padding: '40px 1.25rem' }}>
              <Loader2 size={36} color="#ef4444" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Cargando historial...</p>
            </div>
          ) : historialReportes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 1.25rem' }}>
              <History size={48} color="rgba(255,255,255,0.3)" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>No hay reportes generados aún</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {historialReportes
                .filter(r => filtroTipoHistorial === 'todos' || r.id_tipo_reporte === parseInt(filtroTipoHistorial))
                .map((reporte, idx) => {
                  const tipoIcono = reporte.id_tipo_reporte === 1 ? Users : reporte.id_tipo_reporte === 2 ? DollarSign : BookOpen;
                  const tipoColor = reporte.id_tipo_reporte === 1 ? '#3b82f6' : reporte.id_tipo_reporte === 2 ? '#f59e0b' : '#10b981';

                  return (
                    <div key={idx} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '0.625rem',
                      padding: isMobile ? '10px' : '0.75rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = tipoColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '10px' : '0.875rem', 
                        alignItems: isMobile ? 'stretch' : 'start' 
                      }}>
                        <div style={{
                          background: `${tipoColor}20`,
                          border: `2px solid ${tipoColor}`,
                          borderRadius: '0.625rem',
                          padding: isMobile ? '8px' : '0.625rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: isMobile ? 'center' : 'flex-start'
                        }}>
                          {React.createElement(tipoIcono, { size: isMobile ? 18 : 20, color: tipoColor })}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            alignItems: isMobile ? 'flex-start' : 'start', 
                            marginBottom: '0.5rem',
                            gap: isMobile ? '6px' : '0'
                          }}>
                            <div>
                              <h4 style={{ 
                                color: '#fff', 
                                fontSize: isMobile ? '0.85rem' : '0.9rem', 
                                fontWeight: '600', 
                                margin: '0 0 0.1875rem 0',
                                wordBreak: 'break-word'
                              }}>
                                {reporte.nombre_reporte}
                              </h4>
                              <p style={{ 
                                color: 'rgba(255,255,255,0.6)', 
                                fontSize: isMobile ? '0.7rem' : '0.75rem', 
                                margin: 0,
                                wordBreak: 'break-all'
                              }}>
                                {reporte.archivo_generado}
                              </p>
                            </div>
                            <span style={{
                              padding: '3px 0.625rem',
                              background: `${tipoColor}20`,
                              border: `1px solid ${tipoColor}`,
                              borderRadius: '0.3125rem',
                              color: tipoColor,
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {reporte.formato_generado}
                            </span>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            gap: isMobile ? '4px' : '1rem', 
                            fontSize: isMobile ? '0.7rem' : '0.75rem', 
                            color: 'rgba(255,255,255,0.7)' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem' }}>
                              <User size={isMobile ? 10 : 12} />
                              <span>{reporte.generado_por}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3125rem' }}>
                              <Clock size={isMobile ? 10 : 12} />
                              <span>{new Date(reporte.fecha_generacion).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </>
  );
};

export default Reportes;





