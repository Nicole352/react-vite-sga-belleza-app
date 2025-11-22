import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaSave, FaCalendarAlt, FaChalkboardTeacher, FaUsers, FaFileExcel } from 'react-icons/fa';
import { ClipboardList } from 'lucide-react';
import * as XLSX from 'xlsx';
import LoadingModal from '../../components/LoadingModal';
import { showToast } from '../../config/toastConfig';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface TomarAsistenciaProps {
  darkMode: boolean;
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre_curso: string;
  horario: string;
  tipo_curso_nombre: string;
  total_estudiantes: number;
}

interface Estudiante {
  id_estudiante: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
}

interface RegistroAsistencia {
  id_estudiante: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
  documento_justificacion?: File | null;
  documento_nombre_original?: string;
  documento_preview?: string;
  tiene_documento?: boolean;
  documento_size_kb?: number;
}

const TomarAsistencia: React.FC<TomarAsistenciaProps> = ({ darkMode }) => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [asistencias, setAsistencias] = useState<Map<number, RegistroAsistencia>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [idDocente, setIdDocente] = useState<number | null>(null);
  const [asistenciaGuardada, setAsistenciaGuardada] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [showRangoFechasModal, setShowRangoFechasModal] = useState(false);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [documentoJustificacion, setDocumentoJustificacion] = useState<File | null>(null);
  const [documentoPreview, setDocumentoPreview] = useState<string | null>(null);
  const [documentoNombre, setDocumentoNombre] = useState<string>('');
  const [showVerDocumentoModal, setShowVerDocumentoModal] = useState(false);
  const [documentoVisualizacion, setDocumentoVisualizacion] = useState<{
    id_asistencia?: number;
    estudiante: string;
    motivo: string;
    nombreArchivo: string;
    tipoArchivo: string;
    tamanoKB: number;
  } | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [documentoPreviewUrl, setDocumentoPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const estudiantesPorPagina = 8;

  // Obtener ID del docente desde el token
  useEffect(() => {
    const fetchDocenteId = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Buscar el id_docente en la tabla docentes usando la cédula
          const docenteRes = await fetch(`${API_BASE}/api/docentes`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (docenteRes.ok) {
            const docentes = await docenteRes.json();
            const docente = docentes.find((d: any) => d.identificacion === data.identificacion);
            if (docente) {
              setIdDocente(docente.id_docente);
              loadCursos(docente.id_docente);
            }
          }
        }
      } catch (error) {
        console.error('Error obteniendo datos del docente:', error);
        showToast.error('Error al cargar datos del docente', darkMode);
      }
    };

    fetchDocenteId();
  }, []);

  const loadCursos = async (docenteId: number) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/asistencias/cursos-docente/${docenteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data.cursos || []);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
      showToast.error('Error al cargar cursos', darkMode);
    }
  };

  const loadEstudiantes = async (cursoId: number) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/asistencias/estudiantes/${cursoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEstudiantes(data.estudiantes || []);
        setAsistencias(new Map());
        setAsistenciaGuardada(false);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      showToast.error('Error al cargar estudiantes', darkMode);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsistencia = (idEstudiante: number, estado: 'presente' | 'ausente' | 'tardanza' | 'justificado') => {
    setAsistencias((prev) => {
      const nuevoEstado = {
        id_estudiante: idEstudiante,
        estado: estado,
        observaciones: prev.get(idEstudiante)?.observaciones || '',
        documento_justificacion: prev.get(idEstudiante)?.documento_justificacion || null,
        documento_nombre_original: prev.get(idEstudiante)?.documento_nombre_original || '',
        documento_preview: prev.get(idEstudiante)?.documento_preview || '',
        tiene_documento: prev.get(idEstudiante)?.tiene_documento || false,
        documento_size_kb: prev.get(idEstudiante)?.documento_size_kb || 0,
      };
      return new Map(prev).set(idEstudiante, nuevoEstado);
    });
  };

  const handleObservacionesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setObservaciones(e.target.value);
  };

  const handleGuardarObservaciones = () => {
    if (estudianteSeleccionado !== null) {
      setAsistencias((prev) => {
        const nuevoEstado = {
          id_estudiante: estudianteSeleccionado,
          estado: prev.get(estudianteSeleccionado)?.estado || 'ausente',
          observaciones: observaciones,
          documento_justificacion: prev.get(estudianteSeleccionado)?.documento_justificacion || null,
          documento_nombre_original: prev.get(estudianteSeleccionado)?.documento_nombre_original || '',
          documento_preview: prev.get(estudianteSeleccionado)?.documento_preview || '',
          tiene_documento: prev.get(estudianteSeleccionado)?.tiene_documento || false,
          documento_size_kb: prev.get(estudianteSeleccionado)?.documento_size_kb || 0,
        };
        return new Map(prev).set(estudianteSeleccionado, nuevoEstado);
      });
      setShowObservacionesModal(false);
    }
  };

  const handleEliminarDocumento = () => {
    if (estudianteSeleccionado !== null) {
      setAsistencias((prev) => {
        const nuevoEstado = {
          id_estudiante: estudianteSeleccionado,
          estado: prev.get(estudianteSeleccionado)?.estado || 'ausente',
          observaciones: prev.get(estudianteSeleccionado)?.observaciones || '',
          documento_justificacion: null,
          documento_nombre_original: '',
          documento_preview: '',
          tiene_documento: false,
          documento_size_kb: 0,
        };
        return new Map(prev).set(estudianteSeleccionado, nuevoEstado);
      });
    }
  };

  const generarExcel = () => {
    const worksheetData = Array.from(asistencias.values()).map((asistencia) => ({
      'ID Estudiante': asistencia.id_estudiante,
      'Estado': asistencia.estado,
      'Observaciones': asistencia.observaciones || '',
      'Tiene Documento': asistencia.tiene_documento ? 'Sí' : 'No',
      'Tamaño Documento (KB)': asistencia.documento_size_kb || 0,
      'Nombre Documento Original': asistencia.documento_nombre_original || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistencias');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asistencias.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleShowObservaciones = (idEstudiante: number) => {
    setEstudianteSeleccionado(idEstudiante);
    setObservaciones(asistencias.get(idEstudiante)?.observaciones || '');
    setShowObservacionesModal(true);
  };

  const handleShowRangoFechas = () => {
    setShowRangoFechasModal(true);
  };

  const handleRangoFechasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'fechaInicio') {
      setFechaInicio(e.target.value);
    } else if (e.target.name === 'fechaFin') {
      setFechaFin(e.target.value);
    }
  };

  const handleGuardarRangoFechas = () => {
    console.log('Fecha inicio:', fechaInicio);
    console.log('Fecha fin:', fechaFin);
    setShowRangoFechasModal(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(estudiantes.length / estudiantesPorPagina)) {
      setPaginaActual(newPage);
    }
  };

  const loadAsistenciaExistente = async (cursoId: number, fecha: string) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/asistencias/curso/${cursoId}/fecha/${fecha}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        const nuevasAsistencias = new Map<number, RegistroAsistencia>();

        data.asistencias.forEach((a: any) => {
          nuevasAsistencias.set(a.id_estudiante, {
            id_estudiante: a.id_estudiante,
            estado: a.estado,
            observaciones: a.observaciones || '',
            tiene_documento: a.tiene_documento === 1,
            documento_nombre_original: a.documento_nombre_original || '',
            documento_size_kb: a.documento_size_kb || 0,
            documento_justificacion: null,
            documento_preview: ''
          });
        });

        setAsistencias(nuevasAsistencias);

        // Si hay asistencias guardadas, marcar como guardado
        if (nuevasAsistencias.size > 0) {
          setAsistenciaGuardada(true);
        }
      }
    } catch (error) {
      console.error('Error cargando asistencia existente:', error);
    }
  };

  const handleCursoChange = async (cursoId: number) => {
    setCursoSeleccionado(cursoId);
    setAsistencias(new Map());
    setAsistenciaGuardada(false);
    setPaginaActual(1);
    await loadEstudiantes(cursoId);
    // Cargar asistencia existente para la fecha seleccionada
    if (fechaSeleccionada) {
      await loadAsistenciaExistente(cursoId, fechaSeleccionada);
    }
  };

  const handleFechaChange = (fecha: string) => {
    setFechaSeleccionada(fecha);
    setAsistenciaGuardada(false);
    setPaginaActual(1);
    if (cursoSeleccionado) {
      loadAsistenciaExistente(cursoSeleccionado, fecha);
    }
  };

  const marcarAsistencia = (
    idEstudiante: number,
    estado: 'presente' | 'ausente' | 'tardanza' | 'justificado'
  ) => {
    // Si es justificado, abrir modal con datos existentes si los hay
    if (estado === 'justificado') {
      setEstudianteSeleccionado(idEstudiante);
      const registroActual = asistencias.get(idEstudiante);
      setObservaciones(registroActual?.observaciones || '');

      // Si ya tiene documento guardado, mostrar info
      if (registroActual?.tiene_documento && registroActual?.documento_nombre_original) {
        setDocumentoNombre(registroActual.documento_nombre_original);
        // No podemos mostrar preview de documentos ya guardados en BD
        setDocumentoPreview(null);
      } else {
        setDocumentoNombre('');
        setDocumentoPreview(null);
      }

      setShowObservacionesModal(true);
      return;
    }

    const nuevasAsistencias = new Map(asistencias);
    nuevasAsistencias.set(idEstudiante, {
      id_estudiante: idEstudiante,
      estado,
      observaciones: asistencias.get(idEstudiante)?.observaciones
    });
    setAsistencias(nuevasAsistencias);
    setAsistenciaGuardada(false);
  };

  const guardarJustificacion = () => {
    if (estudianteSeleccionado !== null) {
      const nuevasAsistencias = new Map(asistencias);
      nuevasAsistencias.set(estudianteSeleccionado, {
        id_estudiante: estudianteSeleccionado,
        estado: 'justificado',
        observaciones: observaciones.trim(),
        documento_justificacion: documentoJustificacion || undefined,
        documento_nombre_original: documentoNombre || undefined,
        documento_preview: documentoPreview || undefined,
        tiene_documento: documentoJustificacion ? true : false,
        documento_size_kb: documentoJustificacion ? Math.round(documentoJustificacion.size / 1024) : 0
      });
      setAsistencias(nuevasAsistencias);
      setAsistenciaGuardada(false);
      setShowObservacionesModal(false);
      setEstudianteSeleccionado(null);
      setObservaciones('');
      setDocumentoJustificacion(null);
      setDocumentoPreview(null);
      setDocumentoNombre('');
    }
  };

  const handleLoadingComplete = async () => {
    // Recargar asistencia para ver los datos guardados
    if (cursoSeleccionado) {
      await loadAsistenciaExistente(cursoSeleccionado, fechaSeleccionada);
    }
    setShowLoadingModal(false);
  };

  const guardarAsistencia = async () => {
    if (!cursoSeleccionado || !idDocente) {
      showToast.error('Selecciona un curso primero', darkMode);
      return;
    }

    if (asistencias.size === 0) {
      showToast.error('Marca al menos un estudiante', darkMode);
      return;
    }

    // ✅ VALIDACIÓN: Verificar que todos los estudiantes tengan estado
    const estudiantesSinEstado = estudiantes.filter(est => !asistencias.has(est.id_estudiante));
    if (estudiantesSinEstado.length > 0) {
      const nombres = estudiantesSinEstado.map(e => `${e.nombre} ${e.apellido}`).join(', ');
      showToast.error(`Aún falta registrar la asistencia de: ${nombres}`, darkMode);
      return;
    }

    setSaving(true);
    try {
      const token = sessionStorage.getItem('auth_token');

      // Crear FormData para enviar archivos
      const formData = new FormData();

      // Agregar datos JSON como string
      const datosAsistencia = {
        id_curso: cursoSeleccionado,
        id_docente: idDocente,
        fecha: fechaSeleccionada,
        asistencias: Array.from(asistencias.values()).map(registro => ({
          id_estudiante: registro.id_estudiante,
          estado: registro.estado,
          observaciones: registro.observaciones || null,
          tiene_documento: registro.tiene_documento || false,
          documento_nombre_original: registro.documento_nombre_original || null,
          documento_size_kb: registro.documento_size_kb || null
        }))
      };

      formData.append('data', JSON.stringify(datosAsistencia));

      // Agregar archivos de justificación si existen
      asistencias.forEach((registro, idEstudiante) => {
        if (registro.documento_justificacion) {
          formData.append(`documento_${idEstudiante}`, registro.documento_justificacion);
        }
      });

      const response = await fetch(`${API_BASE}/api/asistencias`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        showToast.success('Asistencia guardada correctamente', darkMode);
        setAsistenciaGuardada(true);

        // Mostrar modal de carga y recargar datos
        setShowLoadingModal(true);
      } else {
        const errorData = await response.json();
        showToast.error(errorData.error || 'Error guardando asistencia', darkMode);
      }
    } catch (error) {
      console.error('Error guardando asistencia:', error);
      showToast.error('Error guardando asistencia', darkMode);
    } finally {
      setSaving(false);
    }
  };

  const descargarDocumento = async (idAsistencia: number, nombreArchivo: string, nombreEstudiante?: string) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/asistencias/documento/${idAsistencia}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        showToast.error('Error al descargar el documento', darkMode);
        return;
      }

      // Obtener URL de Cloudinary desde JSON
      const data = await response.json();
      if (!data.documento_justificacion_url) {
        showToast.error('No hay documento disponible', darkMode);
        return;
      }

      const a = document.createElement('a');

      // Crear nombre descriptivo del archivo
      let nombreDescarga = nombreArchivo || 'documento_adjunto';

      if (nombreEstudiante) {
        // Obtener extensión del archivo original
        const extension = nombreArchivo.split('.').pop() || 'pdf';

        // Separar apellidos y nombres
        // Formato esperado: "Apellido1 Apellido2, Nombre1 Nombre2"
        const partes = nombreEstudiante.split(',').map(p => p.trim());
        let apellidos = partes[0] || '';
        let nombres = partes[1] || '';

        // Limpiar y normalizar apellidos (MAYÚSCULAS)
        const apellidosLimpio = apellidos
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
          .replace(/\s+/g, '_') // Espacios a guiones bajos
          .replace(/[^A-Z0-9_]/g, ''); // Solo letras, números y guiones bajos

        // Limpiar y normalizar nombres (Capitalizado)
        const nombresLimpio = nombres
          .split(' ')
          .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase())
          .join('_')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
          .replace(/[^A-Za-z0-9_]/g, ''); // Solo letras, números y guiones bajos

        // Convertir fecha de YYYY-MM-DD a DD-MM-YYYY
        const [year, month, day] = fechaSeleccionada.split('-');
        const fechaFormateada = `${day}-${month}-${year}`;

        // Crear nombre: Justificacion_APELLIDOS_Nombres_DD-MM-YYYY.extension
        nombreDescarga = `Justificacion_${apellidosLimpio}_${nombresLimpio}_${fechaFormateada}.${extension}`;
      }

      // Usar URL de Cloudinary directamente
      a.href = data.documento_justificacion_url;
      a.download = nombreDescarga;
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast.success('Documento descargado correctamente', darkMode);
    } catch (error) {
      console.error('Error descargando documento:', error);
      showToast.error('Error al descargar el documento', darkMode);
    }
  };

  const cargarVistaPrevia = async (idAsistencia: number) => {
    setLoadingPreview(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/asistencias/documento/${idAsistencia}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        showToast.error('Error al cargar la vista previa', darkMode);
        return;
      }

      // Obtener URL de Cloudinary desde JSON
      const data = await response.json();
      if (data.documento_justificacion_url) {
        setDocumentoPreviewUrl(data.documento_justificacion_url);
      } else {
        showToast.error('No hay documento disponible', darkMode);
      }
    } catch (error) {
      console.error('Error cargando vista previa:', error);
      showToast.error('Error al cargar la vista previa', darkMode);
    } finally {
      setLoadingPreview(false);
    }
  };

  const cerrarModalDocumento = () => {
    setShowVerDocumentoModal(false);
    setDocumentoVisualizacion(null);
    setDocumentoPreviewUrl(null);
  };

  const abrirModalVerDocumento = async (idEstudiante: number) => {
    const estudiante = estudiantes.find(e => e.id_estudiante === idEstudiante);
    const registro = asistencias.get(idEstudiante);

    if (!estudiante || !registro || !registro.tiene_documento) {
      showToast.error('No hay documento para mostrar', darkMode);
      return;
    }

    // Buscar el id_asistencia en la base de datos
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/asistencias/curso/${cursoSeleccionado}/fecha/${fechaSeleccionada}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        const asistenciaDB = data.asistencias.find((a: any) => a.id_estudiante === idEstudiante);

        if (asistenciaDB && asistenciaDB.tiene_documento) {
          setDocumentoVisualizacion({
            id_asistencia: asistenciaDB.id_asistencia,
            estudiante: `${estudiante.nombre} ${estudiante.apellido}`,
            motivo: registro.observaciones || 'Sin motivo especificado',
            nombreArchivo: registro.documento_nombre_original || 'documento',
            tipoArchivo: asistenciaDB.documento_mime || 'application/octet-stream',
            tamanoKB: registro.documento_size_kb || 0
          });
          setShowVerDocumentoModal(true);
          // Cargar vista previa del documento
          cargarVistaPrevia(asistenciaDB.id_asistencia);
        } else {
          showToast.error('No se encontró el documento en la base de datos', darkMode);
        }
      }
    } catch (error) {
      console.error('Error obteniendo información del documento:', error);
      showToast.error('Error al cargar información del documento', darkMode);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setDocumentoJustificacion(file);
      setDocumentoNombre(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setDocumentoPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocumentoJustificacion(file);
      setDocumentoNombre(file.name);

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setDocumentoPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setDocumentoJustificacion(null);
    setDocumentoPreview(null);
    setDocumentoNombre('');
  };

  const contarEstados = () => {
    let presentes = 0;
    let ausentes = 0;
    let tardanzas = 0;
    let justificados = 0;

    asistencias.forEach((registro) => {
      switch (registro.estado) {
        case 'presente': presentes++; break;
        case 'ausente': ausentes++; break;
        case 'tardanza': tardanzas++; break;
        case 'justificado': justificados++; break;
      }
    });

    return { presentes, ausentes, tardanzas, justificados };
  };

  const descargarExcel = async () => {
    if (!cursoSeleccionado || estudiantes.length === 0) {
      showToast.error('Selecciona un curso con estudiantes primero', darkMode);
      return;
    }

    try {
      // Hoja 1: Detalle de Asistencia
      const datosDetalle = estudiantes.map((est, index) => {
        const registro = asistencias.get(est.id_estudiante);
        return {
          'N°': index + 1,
          'Cédula': est.cedula,
          'Apellidos': est.apellido,
          'Nombres': est.nombre,
          'Estado': registro ? registro.estado.toUpperCase() : 'SIN REGISTRAR',
          'Observaciones': registro?.observaciones || ''
        };
      });

      // Hoja 2: Resumen Estadístico
      const stats = contarEstados();
      const totalEstudiantes = estudiantes.length;
      const totalRegistrados = asistencias.size;
      const sinRegistrar = totalEstudiantes - totalRegistrados;
      const porcentajeAsistencia = totalEstudiantes > 0
        ? ((stats.presentes / totalEstudiantes) * 100).toFixed(2)
        : '0.00';

      const datosResumen = [
        { 'INFORMACIÓN': 'Curso', 'VALOR': cursoActual?.nombre_curso || '' },
        { 'INFORMACIÓN': 'Tipo de Curso', 'VALOR': cursoActual?.tipo_curso_nombre || '' },
        { 'INFORMACIÓN': 'Horario', 'VALOR': cursoActual?.horario || '' },
        { 'INFORMACIÓN': 'Fecha', 'VALOR': fechaSeleccionada },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'ESTADÍSTICAS', 'VALOR': '' },
        { 'INFORMACIÓN': 'Total Estudiantes', 'VALOR': totalEstudiantes.toString() },
        { 'INFORMACIÓN': 'Total Registrados', 'VALOR': totalRegistrados.toString() },
        { 'INFORMACIÓN': 'Sin Registrar', 'VALOR': sinRegistrar.toString() },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'Presentes', 'VALOR': stats.presentes.toString() },
        { 'INFORMACIÓN': 'Ausentes', 'VALOR': stats.ausentes.toString() },
        { 'INFORMACIÓN': 'Tardanzas', 'VALOR': stats.tardanzas.toString() },
        { 'INFORMACIÓN': 'Justificados', 'VALOR': stats.justificados.toString() },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'Porcentaje de Asistencia', 'VALOR': `${porcentajeAsistencia}%` }
      ];

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // Agregar hoja de detalle
      const wsDetalle = XLSX.utils.json_to_sheet(datosDetalle);

      // Ajustar anchos de columnas para la hoja de detalle
      wsDetalle['!cols'] = [
        { wch: 5 },  // N°
        { wch: 12 }, // Cédula
        { wch: 20 }, // Apellidos
        { wch: 20 }, // Nombres
        { wch: 15 }, // Estado
        { wch: 30 }  // Observaciones
      ];

      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle de Asistencia');

      // Agregar hoja de resumen
      const wsResumen = XLSX.utils.json_to_sheet(datosResumen);

      // Ajustar anchos de columnas para la hoja de resumen
      wsResumen['!cols'] = [
        { wch: 30 }, // INFORMACIÓN
        { wch: 25 }  // VALOR
      ];

      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Generar nombre del archivo
      const nombreCurso = cursoActual?.nombre_curso.replace(/\s+/g, '_') || 'Curso';
      const nombreArchivo = `Asistencia_${nombreCurso}_${fechaSeleccionada}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      showToast.success('¡Excel descargado correctamente!', darkMode);
    } catch (error) {
      console.error('Error generando Excel:', error);
      showToast.error('Error al generar el archivo Excel', darkMode);
    }
  };

  const descargarExcelRango = async () => {
    if (!cursoSeleccionado || !idDocente) {
      showToast.error('Selecciona un curso primero', darkMode);
      return;
    }

    if (!fechaInicio || !fechaFin) {
      // Cerrar modal primero
      setShowRangoFechasModal(false);
      // Mostrar notificación después de un pequeño delay
      setTimeout(() => {
        showToast.error('Selecciona el rango de fechas', darkMode);
      }, 100);
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      // Cerrar modal primero
      setShowRangoFechasModal(false);
      // Mostrar notificación después de un pequeño delay
      setTimeout(() => {
        showToast.error('La fecha de inicio debe ser anterior a la fecha fin', darkMode);
      }, 100);
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');

      // Obtener TODOS los registros de asistencia del rango
      const responseDetalle = await fetch(
        `${API_BASE}/api/asistencias/curso/${cursoSeleccionado}/rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!responseDetalle.ok) {
        throw new Error('Error al obtener registros');
      }

      const dataDetalle = await responseDetalle.json();
      const registros = dataDetalle.asistencias || [];

      if (registros.length === 0) {
        showToast.error('No hay registros de asistencia en este rango de fechas', darkMode);
        return;
      }

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();

      // HOJA 1: Resumen por Estudiante
      const resumenEstudiantes = estudiantes.map((est, index) => {
        const registrosEst = registros.filter((r: any) => r.id_estudiante === est.id_estudiante);
        const totalClases = registrosEst.length;
        const presentes = registrosEst.filter((r: any) => r.estado === 'presente').length;
        const ausentes = registrosEst.filter((r: any) => r.estado === 'ausente').length;
        const tardanzas = registrosEst.filter((r: any) => r.estado === 'tardanza').length;
        const justificados = registrosEst.filter((r: any) => r.estado === 'justificado').length;
        const porcentaje = totalClases > 0 ? ((presentes / totalClases) * 100).toFixed(2) : '0.00';

        return {
          'N°': index + 1,
          'Cédula': est.cedula,
          'Apellido': est.apellido,
          'Nombre': est.nombre,
          'Total Clases': totalClases,
          'Presentes': presentes,
          'Ausentes': ausentes,
          'Tardanzas': tardanzas,
          'Justificados': justificados,
          '% Asistencia': `${porcentaje}%`
        };
      });

      const wsResumen = XLSX.utils.json_to_sheet(resumenEstudiantes);
      wsResumen['!cols'] = [
        { wch: 5 },   // N°
        { wch: 12 },  // Cédula
        { wch: 18 },  // Apellido
        { wch: 18 },  // Nombre
        { wch: 12 },  // Total Clases
        { wch: 10 },  // Presentes
        { wch: 10 },  // Ausentes
        { wch: 10 },  // Tardanzas
        { wch: 12 },  // Justificados
        { wch: 12 }   // % Asistencia
      ];
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen por Estudiante');

      // HOJA 2: Detalle Día por Día
      const detalleCompleto = registros.map((r: any, index: number) => {
        const estudiante = estudiantes.find(e => e.id_estudiante === r.id_estudiante);
        return {
          'N°': index + 1,
          'Fecha': r.fecha,
          'Cédula': estudiante?.cedula || '',
          'Apellido': estudiante?.apellido || '',
          'Nombre': estudiante?.nombre || '',
          'Estado': r.estado.toUpperCase(),
          'Observaciones': r.observaciones || ''
        };
      });

      const wsDetalle = XLSX.utils.json_to_sheet(detalleCompleto);
      wsDetalle['!cols'] = [
        { wch: 5 },   // N°
        { wch: 12 },  // Fecha
        { wch: 12 },  // Cédula
        { wch: 18 },  // Apellido
        { wch: 18 },  // Nombre
        { wch: 12 },  // Estado
        { wch: 30 }   // Observaciones
      ];
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle Día por Día');

      // HOJA 3: Estadísticas Generales
      const totalClases = [...new Set(registros.map((r: any) => r.fecha))].length;
      const totalRegistros = registros.length;
      const totalPresentes = registros.filter((r: any) => r.estado === 'presente').length;
      const totalAusentes = registros.filter((r: any) => r.estado === 'ausente').length;
      const totalTardanzas = registros.filter((r: any) => r.estado === 'tardanza').length;
      const totalJustificados = registros.filter((r: any) => r.estado === 'justificado').length;
      const promedioAsistencia = totalRegistros > 0 ? ((totalPresentes / totalRegistros) * 100).toFixed(2) : '0.00';

      const estadisticas = [
        { 'INFORMACIÓN': 'Curso', 'VALOR': cursoActual?.nombre_curso || '' },
        { 'INFORMACIÓN': 'Tipo de Curso', 'VALOR': cursoActual?.tipo_curso_nombre || '' },
        { 'INFORMACIÓN': 'Horario', 'VALOR': cursoActual?.horario || '' },
        { 'INFORMACIÓN': 'Periodo', 'VALOR': `${fechaInicio} al ${fechaFin}` },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'ESTADÍSTICAS GENERALES', 'VALOR': '' },
        { 'INFORMACIÓN': 'Total Estudiantes', 'VALOR': estudiantes.length.toString() },
        { 'INFORMACIÓN': 'Total Clases Registradas', 'VALOR': totalClases.toString() },
        { 'INFORMACIÓN': 'Total Registros', 'VALOR': totalRegistros.toString() },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'Total Presentes', 'VALOR': totalPresentes.toString() },
        { 'INFORMACIÓN': 'Total Ausentes', 'VALOR': totalAusentes.toString() },
        { 'INFORMACIÓN': 'Total Tardanzas', 'VALOR': totalTardanzas.toString() },
        { 'INFORMACIÓN': 'Total Justificados', 'VALOR': totalJustificados.toString() },
        { 'INFORMACIÓN': '', 'VALOR': '' },
        { 'INFORMACIÓN': 'Promedio General de Asistencia', 'VALOR': `${promedioAsistencia}%` }
      ];

      const wsEstadisticas = XLSX.utils.json_to_sheet(estadisticas);
      wsEstadisticas['!cols'] = [
        { wch: 35 }, // INFORMACIÓN
        { wch: 25 }  // VALOR
      ];
      XLSX.utils.book_append_sheet(wb, wsEstadisticas, 'Estadísticas Generales');

      // Generar nombre del archivo
      const nombreCurso = cursoActual?.nombre_curso.replace(/\s+/g, '_') || 'Curso';
      const nombreArchivo = `Reporte_Asistencia_${nombreCurso}_${fechaInicio}_a_${fechaFin}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);

      showToast.success('¡Reporte descargado correctamente!', darkMode);
      setShowRangoFechasModal(false);
      setFechaInicio('');
      setFechaFin('');
    } catch (error) {
      console.error('Error generando reporte:', error);
      showToast.error('Error al generar el reporte', darkMode);
    }
  };

  const stats = contarEstados();
  const cursoActual = cursos.find(c => c.id_curso === cursoSeleccionado);

  // Paginación
  const indiceUltimoEstudiante = paginaActual * estudiantesPorPagina;
  const indicePrimerEstudiante = indiceUltimoEstudiante - estudiantesPorPagina;
  const estudiantesActuales = estudiantes.slice(indicePrimerEstudiante, indiceUltimoEstudiante);
  const totalPaginas = Math.ceil(estudiantes.length / estudiantesPorPagina);

  const cambiarPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina);
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--docente-text-primary)',
          margin: '0 0 0.375rem 0'
        }}>
          Tomar Asistencia
        </h2>
        <p style={{
          color: 'var(--docente-text-muted)',
          fontSize: '0.8125rem',
          margin: 0
        }}>
          Registra la asistencia de tus estudiantes
        </p>
      </div>

      {/* Selectores */}
      <div style={{
        background: 'var(--docente-bg-secondary)',
        backdropFilter: 'blur(1.25rem)',
        border: '1px solid var(--docente-border)',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: darkMode ? '0 0.25rem 1rem rgba(0, 0, 0, 0.3)' : '0 0.25rem 1rem rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {/* Selector de Curso */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--docente-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              marginBottom: '0.375rem'
            }}>
              <FaChalkboardTeacher size={14} color="var(--docente-accent)" />
              Selecciona el Curso
            </label>
            <select
              value={cursoSeleccionado || ''}
              onChange={(e) => handleCursoChange(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                background: 'var(--docente-input-bg)',
                border: '1px solid var(--docente-input-border)',
                color: 'var(--docente-text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <option value="">-- Selecciona un curso --</option>
              {cursos.map((curso) => (
                <option key={curso.id_curso} value={curso.id_curso}>
                  {curso.nombre_curso} - {curso.horario} ({curso.total_estudiantes} estudiantes)
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--docente-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              marginBottom: '0.375rem'
            }}>
              <FaCalendarAlt size={14} color="var(--docente-accent)" />
              Fecha de la Clase
            </label>
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => handleFechaChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.625rem',
                fontSize: '0.875rem',
                background: 'var(--docente-input-bg)',
                border: '1px solid var(--docente-input-border)',
                color: 'var(--docente-text-primary)',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Info del curso seleccionado */}
        {cursoActual && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--docente-text-primary)',
              fontSize: '0.875rem'
            }}>
              <FaUsers size={18} color="var(--docente-accent)" />
              <span style={{ fontWeight: '600' }}>{cursoActual.tipo_curso_nombre}</span>
              <span style={{ color: 'var(--docente-text-muted)' }}>•</span>
              <span>{cursoActual.total_estudiantes} estudiantes inscritos</span>
            </div>
          </div>
        )}
      </div>

      {/* Lista de Estudiantes */}
      {cursoSeleccionado && (
        <>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--docente-text-muted)'
            }}>
              Cargando estudiantes...
            </div>
          ) : estudiantes.length > 0 ? (
            <>
              {/* Estadísticas */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  <FaCheckCircle size={18} color="#3b82f6" style={{ marginBottom: '0.375rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--docente-accent)', lineHeight: '1' }}>
                    {stats.presentes}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--docente-text-muted)', marginTop: '0.25rem', fontWeight: '500' }}>
                    Presentes
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  <FaTimesCircle size={18} color="#60a5fa" style={{ marginBottom: '0.375rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#60a5fa', lineHeight: '1' }}>
                    {stats.ausentes}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--docente-text-muted)', marginTop: '0.25rem', fontWeight: '500' }}>
                    Ausentes
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  <FaClock size={18} color="#93c5fd" style={{ marginBottom: '0.375rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#93c5fd', lineHeight: '1' }}>
                    {stats.tardanzas}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--docente-text-muted)', marginTop: '0.25rem', fontWeight: '500' }}>
                    Tardanzas
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08))',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '0.625rem',
                  padding: '0.75rem 0.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}>
                  <FaFileAlt size={18} color="#2563eb" style={{ marginBottom: '0.375rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb', lineHeight: '1' }}>
                    {stats.justificados}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--docente-text-muted)', marginTop: '0.25rem', fontWeight: '500' }}>
                    Justificados
                  </div>
                </div>
              </div>

              {/* Botones de Descarga Excel */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={descargarExcel}
                  disabled={!cursoSeleccionado || estudiantes.length === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: (!cursoSeleccionado || estudiantes.length === 0)
                      ? 'rgba(128, 128, 128, 0.3)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: (!cursoSeleccionado || estudiantes.length === 0) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s',
                    boxShadow: (cursoSeleccionado && estudiantes.length > 0) ? '0 0.125rem 0.5rem rgba(59, 130, 246, 0.2)' : 'none',
                    opacity: (!cursoSeleccionado || estudiantes.length === 0) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (cursoSeleccionado && estudiantes.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(59, 130, 246, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cursoSeleccionado && estudiantes.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(59, 130, 246, 0.2)';
                    }
                  }}
                >
                  <FaFileExcel size={12} />
                  Excel Hoy
                </button>

                <button
                  onClick={() => setShowRangoFechasModal(true)}
                  disabled={!cursoSeleccionado || estudiantes.length === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: (!cursoSeleccionado || estudiantes.length === 0)
                      ? 'rgba(128, 128, 128, 0.3)'
                      : 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: (!cursoSeleccionado || estudiantes.length === 0) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s',
                    boxShadow: (cursoSeleccionado && estudiantes.length > 0) ? '0 0.125rem 0.5rem rgba(96, 165, 250, 0.2)' : 'none',
                    opacity: (!cursoSeleccionado || estudiantes.length === 0) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (cursoSeleccionado && estudiantes.length > 0) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(96, 165, 250, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cursoSeleccionado && estudiantes.length > 0) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 0.125rem 0.5rem rgba(96, 165, 250, 0.2)';
                    }
                  }}
                >
                  <FaCalendarAlt size={12} />
                  Reporte Rango
                </button>
              </div>

              {/* Tabla de estudiantes */}
              <div style={{
                overflowX: 'auto',
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderRadius: '0.75rem',
                boxShadow: darkMode
                  ? '0 2px 12px rgba(0, 0, 0, 0.3)'
                  : '0 2px 12px rgba(0, 0, 0, 0.08)'
              }}>
                {/* Header de la tabla */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                  borderBottom: `1px solid var(--docente-border)`,
                  fontWeight: '700',
                  fontSize: '0.7rem',
                  color: darkMode ? 'var(--docente-accent)' : '#1e40af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <div style={{ flex: '1 1 300px' }}>Estudiante</div>
                  <div style={{ flex: '1 1 200px', textAlign: 'center' }}>Asistencia</div>
                </div>

                {/* Filas de estudiantes */}
                <div style={{ padding: '0.5rem 1rem 1rem 1rem' }}>
                  {estudiantesActuales.map((estudiante, index) => {
                    const registro = asistencias.get(estudiante.id_estudiante);
                    return (
                      <div
                        key={estudiante.id_estudiante}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.75rem',
                          padding: '0.75rem 0.5rem',
                          background: index % 2 === 0
                            ? (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)')
                            : (darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'),
                          borderRadius: '0.375rem',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = index % 2 === 0
                            ? (darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)')
                            : (darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)');
                        }}
                      >
                        {/* Columna: Estudiante */}
                        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625em',
                            minWidth: 0
                          }}>
                            <div style={{
                              width: '1.75rem',
                              height: '1.75rem',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--docente-accent), #2563eb)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontWeight: '800',
                              fontSize: '0.625rem',
                              flexShrink: 0
                            }}>
                              {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                              }}>
                                <div style={{
                                  color: 'var(--docente-text-primary)',
                                  fontWeight: '600',
                                  fontSize: '0.875rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {estudiante.apellido}, {estudiante.nombre}
                                </div>
                                {registro?.estado === 'justificado' && registro?.tiene_documento && (
                                  <button
                                    onClick={() => abrirModalVerDocumento(estudiante.id_estudiante)}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      padding: '0.125rem 0.375rem',
                                      borderRadius: '0.25rem',
                                      background: 'rgba(34, 197, 94, 0.15)',
                                      border: '1px solid rgba(34, 197, 94, 0.3)',
                                      fontSize: '0.65rem',
                                      fontWeight: '600',
                                      color: '#22c55e',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                      flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)';
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                    title="Ver documento justificativo"
                                  >
                                    <FaFileAlt size={8} />
                                    DOC
                                  </button>
                                )}
                              </div>
                              <div style={{
                                color: 'var(--docente-text-muted)',
                                fontSize: '0.75rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                CI: {estudiante.cedula}
                                {registro?.observaciones && (
                                  <span style={{
                                    marginLeft: '0.5rem',
                                    color: 'var(--docente-accent)',
                                    fontStyle: 'italic'
                                  }}>
                                    • {registro.observaciones.substring(0, 30)}{registro.observaciones.length > 30 ? '...' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Columna: Asistencia */}
                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '0.25rem',
                            flexWrap: 'wrap'
                          }}>
                            <button
                              onClick={() => marcarAsistencia(estudiante.id_estudiante, 'presente')}
                              style={{
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                background: registro?.estado === 'presente'
                                  ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                  : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: registro?.estado === 'presente' ? '#fff' : 'var(--docente-text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s',
                                boxShadow: registro?.estado === 'presente' ? '0 0.125rem 0.5rem rgba(59, 130, 246, 0.3)' : 'none',
                                opacity: registro?.estado === 'presente' ? 1 : 0.7
                              }}
                              onMouseEnter={(e) => {
                                if (registro?.estado !== 'presente') {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (registro?.estado !== 'presente') {
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                                }
                              }}
                            >
                              <FaCheckCircle size={12} />
                              P
                            </button>

                            <button
                              onClick={() => marcarAsistencia(estudiante.id_estudiante, 'ausente')}
                              style={{
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                background: registro?.estado === 'ausente'
                                  ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                                  : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: registro?.estado === 'ausente' ? '#fff' : 'var(--docente-text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s',
                                boxShadow: registro?.estado === 'ausente' ? '0 0.125rem 0.5rem rgba(96, 165, 250, 0.3)' : 'none',
                                opacity: registro?.estado === 'ausente' ? 1 : 0.7
                              }}
                              onMouseEnter={(e) => {
                                if (registro?.estado !== 'ausente') {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.background = darkMode ? 'rgba(96, 165, 250, 0.15)' : 'rgba(96, 165, 250, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (registro?.estado !== 'ausente') {
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                                }
                              }}
                            >
                              <FaTimesCircle size={12} />
                              A
                            </button>

                            <button
                              onClick={() => marcarAsistencia(estudiante.id_estudiante, 'tardanza')}
                              style={{
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                background: registro?.estado === 'tardanza'
                                  ? 'linear-gradient(135deg, #93c5fd, #60a5fa)'
                                  : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: registro?.estado === 'tardanza' ? '#fff' : 'var(--docente-text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s',
                                boxShadow: registro?.estado === 'tardanza' ? '0 0.125rem 0.5rem rgba(147, 197, 253, 0.3)' : 'none',
                                opacity: registro?.estado === 'tardanza' ? 1 : 0.7
                              }}
                              onMouseEnter={(e) => {
                                if (registro?.estado !== 'tardanza') {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.background = darkMode ? 'rgba(147, 197, 253, 0.15)' : 'rgba(147, 197, 253, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (registro?.estado !== 'tardanza') {
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                                }
                              }}
                            >
                              <FaClock size={12} />
                              T
                            </button>

                            <button
                              onClick={() => marcarAsistencia(estudiante.id_estudiante, 'justificado')}
                              style={{
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.375rem',
                                border: 'none',
                                background: registro?.estado === 'justificado'
                                  ? 'linear-gradient(135deg, #2563eb, #1e40af)'
                                  : darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                                color: registro?.estado === 'justificado' ? '#fff' : 'var(--docente-text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s',
                                boxShadow: registro?.estado === 'justificado' ? '0 0.125rem 0.5rem rgba(37, 99, 235, 0.3)' : 'none',
                                opacity: registro?.estado === 'justificado' ? 1 : 0.7
                              }}
                              onMouseEnter={(e) => {
                                if (registro?.estado !== 'justificado') {
                                  e.currentTarget.style.opacity = '1';
                                  e.currentTarget.style.background = darkMode ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (registro?.estado !== 'justificado') {
                                  e.currentTarget.style.opacity = '0.7';
                                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                                }
                              }}
                            >
                              <FaFileAlt size={12} />
                              J
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--docente-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    {/* Texto de información */}
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--docente-text-secondary)',
                      fontWeight: '500'
                    }}>
                      Página {paginaActual} de {totalPaginas} · Total: {estudiantes.length} estudiantes
                    </span>

                    {/* Controles de paginación */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <button
                        onClick={() => cambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--docente-border)',
                          background: paginaActual === 1 ? 'transparent' : 'var(--docente-input-bg)',
                          color: paginaActual === 1 ? 'var(--docente-text-muted)' : 'var(--docente-text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
                          opacity: paginaActual === 1 ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                        onMouseEnter={(e) => {
                          if (paginaActual !== 1) {
                            e.currentTarget.style.background = 'var(--docente-accent)';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'var(--docente-accent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (paginaActual !== 1) {
                            e.currentTarget.style.background = 'var(--docente-input-bg)';
                            e.currentTarget.style.color = 'var(--docente-text-primary)';
                            e.currentTarget.style.borderColor = 'var(--docente-border)';
                          }
                        }}
                      >
                        ← Anterior
                      </button>

                      {/* Números de página */}
                      <div style={{
                        display: 'flex',
                        gap: '0.25rem'
                      }}>
                        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                          <button
                            key={numero}
                            onClick={() => cambiarPagina(numero)}
                            style={{
                              minWidth: '2.5rem',
                              height: '2.5rem',
                              borderRadius: '0.5rem',
                              border: numero === paginaActual ? 'none' : '1px solid var(--docente-border)',
                              background: numero === paginaActual
                                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                : 'transparent',
                              color: numero === paginaActual ? '#fff' : 'var(--docente-text-primary)',
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: numero === paginaActual ? '0 0.25rem 0.75rem rgba(59, 130, 246, 0.3)' : 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              if (numero !== paginaActual) {
                                e.currentTarget.style.background = 'var(--docente-input-bg)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (numero !== paginaActual) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            {numero}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => cambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--docente-border)',
                          background: paginaActual === totalPaginas ? 'transparent' : 'var(--docente-input-bg)',
                          color: paginaActual === totalPaginas ? 'var(--docente-text-muted)' : 'var(--docente-text-primary)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
                          opacity: paginaActual === totalPaginas ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem'
                        }}
                        onMouseEnter={(e) => {
                          if (paginaActual !== totalPaginas) {
                            e.currentTarget.style.background = 'var(--docente-accent)';
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'var(--docente-accent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (paginaActual !== totalPaginas) {
                            e.currentTarget.style.background = 'var(--docente-input-bg)';
                            e.currentTarget.style.color = 'var(--docente-text-primary)';
                            e.currentTarget.style.borderColor = 'var(--docente-border)';
                          }
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Guardar Asistencia */}
              <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--docente-border)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={guardarAsistencia}
                  disabled={saving || asistencias.size === 0}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    background: asistencias.size === 0
                      ? 'rgba(128, 128, 128, 0.3)'
                      : asistenciaGuardada
                        ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                        : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: asistencias.size === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s',
                    boxShadow: asistencias.size > 0
                      ? (asistenciaGuardada
                        ? '0 0.125rem 0.5rem rgba(96, 165, 250, 0.2)'
                        : '0 0.125rem 0.5rem rgba(59, 130, 246, 0.2)')
                      : 'none',
                    opacity: saving ? 0.7 : (asistencias.size === 0 ? 0.6 : 1)
                  }}
                  onMouseEnter={(e) => {
                    if (asistencias.size > 0 && !saving) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = asistenciaGuardada
                        ? '0 0.25rem 0.75rem rgba(96, 165, 250, 0.25)'
                        : '0 0.25rem 0.75rem rgba(59, 130, 246, 0.25)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (asistencias.size > 0 && !saving) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = asistenciaGuardada
                        ? '0 0.125rem 0.5rem rgba(96, 165, 250, 0.2)'
                        : '0 0.125rem 0.5rem rgba(59, 130, 246, 0.2)';
                    }
                  }}
                >
                  <FaSave size={12} />
                  {saving
                    ? 'Guardando...'
                    : asistenciaGuardada
                      ? `✓ Guardado (${asistencias.size})`
                      : `Guardar (${asistencias.size})`}
                </button>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--docente-text-muted)',
              background: 'var(--docente-bg-secondary)',
              borderRadius: '1rem',
              border: '1px solid var(--docente-border)'
            }}>
              No hay estudiantes inscritos en este curso
            </div>
          )}
        </>
      )}

      {!cursoSeleccionado && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--docente-text-muted)',
          background: 'var(--docente-bg-secondary)',
          borderRadius: '1rem',
          border: '2px dashed var(--docente-border)'
        }}>
          <ClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
            Selecciona un curso para comenzar
          </p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Elige el curso y la fecha para tomar asistencia
          </p>
        </div>
      )}

      {/* Modal de Observaciones para Justificación */}
      {showObservacionesModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1rem',
            border: `1px solid var(--docente-border)`,
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: darkMode ? '0 1rem 3rem rgba(0, 0, 0, 0.5)' : '0 1rem 3rem rgba(0, 0, 0, 0.2)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--docente-text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaFileAlt size={18} color="var(--docente-accent)" />
                Justificación de Asistencia
              </h3>
              <button
                onClick={() => {
                  setShowObservacionesModal(false);
                  setEstudianteSeleccionado(null);
                  setObservaciones('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--docente-text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: '1',
                  padding: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-primary)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-muted)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: 'var(--docente-text-muted)',
              marginBottom: '1rem'
            }}>
              Ingresa las observaciones o motivo de la justificación:
            </p>

            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ejemplo: Presentación de certificado médico..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--docente-input-border)',
                background: 'var(--docente-input-bg)',
                color: 'var(--docente-text-primary)',
                fontSize: '0.875rem',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />

            {/* File Upload Section */}
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              border: '1px dashed var(--docente-border)',
              borderRadius: '0.5rem',
              background: 'var(--docente-input-bg)'
            }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--docente-text-secondary)',
                marginBottom: '0.5rem'
              }}>
                Adjuntar Documento (Opcional)
              </label>

              {/* Mostrar documento nuevo (preview) */}
              {documentoPreview ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  {documentoPreview.startsWith('data:image') ? (
                    <img
                      src={documentoPreview}
                      alt="Preview"
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }}
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '0.25rem',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '0.75rem'
                    }}>
                      PDF
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: 'var(--docente-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {documentoNombre}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--docente-text-muted)',
                      marginTop: '0.125rem'
                    }}>
                      Nuevo archivo
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--docente-text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      padding: '0.125rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--docente-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--docente-text-muted)';
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : documentoNombre && estudianteSeleccionado && asistencias.get(estudianteSeleccionado)?.tiene_documento ? (
                /* Mostrar documento ya guardado en BD */
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '0.375rem',
                  border: '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '0.25rem',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '600',
                    fontSize: '0.75rem'
                  }}>
                    <FaFileAlt size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: 'var(--docente-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {documentoNombre}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--docente-text-muted)',
                      marginTop: '0.125rem'
                    }}>
                      ✓ Documento guardado ({asistencias.get(estudianteSeleccionado)?.documento_size_kb || 0} KB)
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowObservacionesModal(false);
                      if (estudianteSeleccionado) {
                        abrirModalVerDocumento(estudianteSeleccionado);
                      }
                    }}
                    style={{
                      padding: '0.375rem 0.625rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Ver
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'block',
                  padding: '0.75rem',
                  border: '1px dashed var(--docente-border)',
                  borderRadius: '0.375rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}>
                  <input
                    type="file"
                    onChange={handleDocumentoChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--docente-text-muted)'
                  }}>
                    <FaFileAlt size={20} />
                    <span style={{ fontSize: '0.8125rem' }}>
                      Haz clic para seleccionar un archivo o arrastra y suelta
                    </span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                      PDF, JPG, PNG, DOC (Máx. 5MB)
                    </span>
                  </div>
                </label>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginTop: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowObservacionesModal(false);
                  setEstudianteSeleccionado(null);
                  setObservaciones('');
                  setDocumentoJustificacion(null);
                  setDocumentoNombre('');
                  setDocumentoPreview(null);
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--docente-border)',
                  background: 'transparent',
                  color: 'var(--docente-text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--docente-input-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancelar
              </button>

              <button
                onClick={guardarJustificacion}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0.25rem 0.75rem rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 0.375rem 1rem rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(59, 130, 246, 0.25)';
                }}
              >
                <FaSave size={14} />
                Guardar Justificación
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Rango de Fechas */}
      {showRangoFechasModal && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1rem',
            border: `1px solid var(--docente-border)`,
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: darkMode ? '0 1rem 3rem rgba(0, 0, 0, 0.5)' : '0 1rem 3rem rgba(0, 0, 0, 0.2)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--docente-text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaCalendarAlt size={18} color="var(--docente-accent)" />
                Reporte por Rango de Fechas
              </h3>
              <button
                onClick={() => {
                  setShowRangoFechasModal(false);
                  setFechaInicio('');
                  setFechaFin('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--docente-text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: '1',
                  padding: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-primary)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-muted)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            <p style={{
              fontSize: '0.875rem',
              color: 'var(--docente-text-muted)',
              marginBottom: '1rem'
            }}>
              Selecciona el periodo para generar el reporte completo:
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--docente-text-secondary)',
                marginBottom: '0.375rem'
              }}>
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--docente-input-border)',
                  background: 'var(--docente-input-bg)',
                  color: 'var(--docente-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--docente-text-secondary)',
                marginBottom: '0.375rem'
              }}>
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--docente-input-border)',
                  background: 'var(--docente-input-bg)',
                  color: 'var(--docente-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowRangoFechasModal(false);
                  setFechaInicio('');
                  setFechaFin('');
                }}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--docente-border)',
                  background: 'transparent',
                  color: 'var(--docente-text-primary)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--docente-input-bg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancelar
              </button>

              <button
                onClick={descargarExcelRango}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  color: '#fff',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 0.25rem 0.75rem rgba(96, 165, 250, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 0.375rem 1rem rgba(96, 165, 250, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 0.25rem 0.75rem rgba(96, 165, 250, 0.25)';
                }}
              >
                <FaFileExcel size={14} />
                Descargar Reporte
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Visualización de Documento */}
      {showVerDocumentoModal && documentoVisualizacion && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(8px)',
          padding: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1rem',
            border: `1px solid var(--docente-border)`,
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: darkMode ? '0 1rem 3rem rgba(0, 0, 0, 0.5)' : '0 1rem 3rem rgba(0, 0, 0, 0.2)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: 'var(--docente-text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaFileAlt size={18} color="var(--docente-accent)" />
                Documento Justificativo
              </h3>
              <button
                onClick={cerrarModalDocumento}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--docente-text-muted)',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  lineHeight: '1',
                  padding: '0.25rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-primary)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--docente-text-muted)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ×
              </button>
            </div>

            {/* Información del Estudiante */}
            <div style={{
              padding: '0.875rem',
              background: 'var(--docente-input-bg)',
              border: '1px solid var(--docente-border)',
              borderRadius: '0.75rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.625rem',
                  background: darkMode
                    ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.875rem',
                  boxShadow: darkMode
                    ? '0 2px 8px rgba(37, 99, 235, 0.4)'
                    : '0 2px 8px rgba(59, 130, 246, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {documentoVisualizacion.estudiante.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: darkMode ? '#e0e7ff' : '#1e40af',
                    marginBottom: '0.1875rem'
                  }}>
                    {documentoVisualizacion.estudiante}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: darkMode ? '#93c5fd' : '#3b82f6',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <FaCalendarAlt size={10} />
                    {fechaSeleccionada.split('-').reverse().join('/')}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                background: 'var(--docente-input-bg)',
                borderRadius: '0.625rem',
                border: '1px solid var(--docente-border)'
              }}>
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  color: darkMode ? '#93c5fd' : '#2563eb',
                  marginBottom: '0.375rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '3px',
                    borderRadius: '50%',
                    background: darkMode ? '#60a5fa' : '#3b82f6'
                  }} />
                  Motivo de Justificación
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: darkMode ? '#e0e7ff' : '#1e293b',
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  {documentoVisualizacion.motivo}
                </div>
              </div>
            </div>

            {/* Previsualización del Documento */}
            <div style={{
              padding: '0.875rem',
              background: 'var(--docente-input-bg)',
              border: '1px solid var(--docente-border)',
              borderRadius: '0.75rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '0.75rem',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <FaFileAlt size={24} />
                  <div style={{
                    fontSize: '0.5625rem',
                    fontWeight: '700',
                    marginTop: '0.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {documentoVisualizacion.tipoArchivo.split('/')[1]?.toUpperCase() || 'DOC'}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: 'var(--docente-text-primary)',
                    marginBottom: '0.375rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {documentoVisualizacion.nombreArchivo}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.1875rem 0.5rem',
                      borderRadius: '0.3125rem',
                      background: darkMode
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'rgba(59, 130, 246, 0.15)',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: darkMode ? '#93c5fd' : '#2563eb'
                    }}>
                      <FaFileAlt size={9} />
                      {documentoVisualizacion.tamanoKB} KB
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.1875rem 0.5rem',
                      borderRadius: '0.3125rem',
                      background: darkMode
                        ? 'rgba(96, 165, 250, 0.2)'
                        : 'rgba(147, 197, 253, 0.2)',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      color: darkMode ? '#bfdbfe' : '#1e40af'
                    }}>
                      {documentoVisualizacion.tipoArchivo.split('/')[1]?.toUpperCase() || 'ARCHIVO'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vista Previa del Documento */}
            <div style={{
              padding: '0.875rem',
              background: 'var(--docente-input-bg)',
              border: '1px solid var(--docente-border)',
              borderRadius: '0.75rem',
              marginBottom: '0.875rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: 'var(--docente-text-secondary)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}>
                Vista Previa del Documento
              </div>

              {loadingPreview ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  color: 'var(--docente-text-muted)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid var(--docente-border)',
                      borderTop: '2px solid var(--docente-accent)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Cargando vista previa...
                  </div>
                </div>
              ) : documentoPreviewUrl ? (
                <div style={{
                  border: '1px solid var(--docente-border)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  maxHeight: '300px'
                }}>
                  {documentoVisualizacion?.tipoArchivo.startsWith('image/') ? (
                    <img
                      src={documentoPreviewUrl}
                      alt="Vista previa del documento"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        display: 'block'
                      }}
                    />
                  ) : documentoVisualizacion?.tipoArchivo === 'application/pdf' ? (
                    <iframe
                      src={documentoPreviewUrl}
                      style={{
                        width: '100%',
                        height: '300px',
                        border: 'none'
                      }}
                      title="Vista previa del PDF"
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem',
                      color: 'var(--docente-text-muted)',
                      textAlign: 'center'
                    }}>
                      <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                        Vista previa no disponible
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Este tipo de archivo no se puede previsualizar
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  color: 'var(--docente-text-muted)',
                  textAlign: 'center'
                }}>
                  <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    Error al cargar la vista previa
                  </div>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div style={{
              display: 'flex',
              gap: '0.625rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cerrarModalDocumento}
                style={{
                  padding: '0.625rem 1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--docente-border)',
                  background: 'var(--docente-input-bg)',
                  color: 'var(--docente-text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (documentoVisualizacion.id_asistencia) {
                    // Cerrar modal primero
                    cerrarModalDocumento();
                    // Descargar después de un pequeño delay para que se cierre el modal
                    setTimeout(() => {
                      descargarDocumento(
                        documentoVisualizacion.id_asistencia!,
                        documentoVisualizacion.nombreArchivo,
                        documentoVisualizacion.estudiante
                      );
                    }, 100);
                  }
                }}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  background: darkMode
                    ? 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: darkMode
                    ? '0 2px 8px rgba(37, 99, 235, 0.4)'
                    : '0 2px 8px rgba(59, 130, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem'
                }}
              >
                <FaFileAlt size={12} />
                Descargar Documento
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TomarAsistencia;
