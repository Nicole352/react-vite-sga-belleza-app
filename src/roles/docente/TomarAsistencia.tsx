import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaFileAlt, FaSave, FaCalendarAlt, FaChalkboardTeacher, FaUsers, FaFileExcel } from 'react-icons/fa';
import { HiOutlineClipboardList } from 'react-icons/hi';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const API_BASE = 'http://localhost:3000/api';

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
  
  const estudiantesPorPagina = 8;

  // Obtener ID del docente desde el token
  useEffect(() => {
    const fetchDocenteId = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;

        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Buscar el id_docente en la tabla docentes usando la cédula
          const docenteRes = await fetch(`${API_BASE}/docentes`, {
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
        toast.error('Error al cargar datos del docente');
      }
    };

    fetchDocenteId();
  }, []);

  const loadCursos = async (docenteId: number) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/asistencias/cursos-docente/${docenteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCursos(data.cursos || []);
      }
    } catch (error) {
      console.error('Error cargando cursos:', error);
      toast.error('Error al cargar cursos');
    }
  };

  const loadEstudiantes = async (cursoId: number) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/asistencias/estudiantes/${cursoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // Ordenar estudiantes por apellido alfabéticamente
        const estudiantesOrdenados = (data.estudiantes || []).sort((a: Estudiante, b: Estudiante) => {
          return a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' });
        });
        setEstudiantes(estudiantesOrdenados);
        
        // Cargar asistencia existente para esta fecha
        await loadAsistenciaExistente(cursoId, fechaSeleccionada);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const loadAsistenciaExistente = async (cursoId: number, fecha: string) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/asistencias/curso/${cursoId}/fecha/${fecha}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        const nuevasAsistencias = new Map<number, RegistroAsistencia>();
        
        data.asistencias.forEach((a: any) => {
          nuevasAsistencias.set(a.id_estudiante, {
            id_estudiante: a.id_estudiante,
            estado: a.estado,
            observaciones: a.observaciones
          });
        });
        
        setAsistencias(nuevasAsistencias);
      }
    } catch (error) {
      console.error('Error cargando asistencia existente:', error);
    }
  };

  const handleCursoChange = (cursoId: number) => {
    setCursoSeleccionado(cursoId);
    setAsistencias(new Map());
    setAsistenciaGuardada(false);
    setPaginaActual(1);
    loadEstudiantes(cursoId);
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
    // Si es justificado, abrir modal
    if (estado === 'justificado') {
      setEstudianteSeleccionado(idEstudiante);
      const registroActual = asistencias.get(idEstudiante);
      setObservaciones(registroActual?.observaciones || '');
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
        observaciones: observaciones.trim()
      });
      setAsistencias(nuevasAsistencias);
      setAsistenciaGuardada(false);
      setShowObservacionesModal(false);
      setEstudianteSeleccionado(null);
      setObservaciones('');
    }
  };

  const guardarAsistencia = async () => {
    if (!cursoSeleccionado || !idDocente) {
      toast.error('Selecciona un curso primero');
      return;
    }

    if (asistencias.size === 0) {
      toast.error('Marca al menos un estudiante');
      return;
    }

    setSaving(true);
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/asistencias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_curso: cursoSeleccionado,
          id_docente: idDocente,
          fecha: fechaSeleccionada,
          asistencias: Array.from(asistencias.values())
        })
      });

      if (response.ok) {
        toast.success('Asistencia guardada correctamente');
        setAsistenciaGuardada(true);
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando asistencia:', error);
      toast.error('Error al guardar asistencia');
    } finally {
      setSaving(false);
    }
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

  const descargarExcel = () => {
    if (!cursoSeleccionado || estudiantes.length === 0) {
      toast.error('Selecciona un curso con estudiantes primero');
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
      
      toast.success('¡Excel descargado correctamente!');
    } catch (error) {
      console.error('Error generando Excel:', error);
      toast.error('Error al generar el archivo Excel');
    }
  };

  const descargarExcelRango = async () => {
    if (!cursoSeleccionado || !idDocente) {
      toast.error('Selecciona un curso primero');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      toast.error('Selecciona el rango de fechas');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      
      // Obtener TODOS los registros de asistencia del rango
      const responseDetalle = await fetch(
        `${API_BASE}/asistencias/curso/${cursoSeleccionado}/rango?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!responseDetalle.ok) {
        throw new Error('Error al obtener registros');
      }

      const dataDetalle = await responseDetalle.json();
      const registros = dataDetalle.asistencias || [];

      if (registros.length === 0) {
        toast.error('No hay registros de asistencia en este rango de fechas');
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
      
      toast.success('¡Reporte descargado correctamente!');
      setShowRangoFechasModal(false);
      setFechaInicio('');
      setFechaFin('');
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
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
      <div style={{
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.75rem',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0.25rem 0.75rem rgba(59, 130, 246, 0.3)'
        }}>
          <HiOutlineClipboardList size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--docente-text-primary)',
            margin: 0,
            letterSpacing: '0.02em'
          }}>
            Tomar Asistencia
          </h2>
          <p style={{
            color: 'var(--docente-text-muted)',
            fontSize: '0.75rem',
            margin: '0.125rem 0 0 0'
          }}>
            Registra la asistencia de tus estudiantes
          </p>
        </div>
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
                marginBottom: '1rem'
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
                background: 'var(--docente-bg-secondary)',
                backdropFilter: 'blur(1.25rem)',
                border: '1px solid var(--docente-border)',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: darkMode ? '0 0.5rem 2rem rgba(0, 0, 0, 0.3)' : '0 0.5rem 2rem rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{
                        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderBottom: '1px solid var(--docente-border)'
                      }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'var(--docente-text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Estudiante
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          color: 'var(--docente-text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          Asistencia
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesActuales.map((estudiante, index) => {
                        const registro = asistencias.get(estudiante.id_estudiante);
                        return (
                          <tr
                            key={estudiante.id_estudiante}
                            style={{
                              borderBottom: index < estudiantesActuales.length - 1 ? '1px solid var(--docente-border)' : 'none',
                              transition: 'all 0.2s'
                            }}
                          >
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                              }}>
                                <div style={{
                                  width: '2rem',
                                  height: '2rem',
                                  borderRadius: '0.5rem',
                                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: '700',
                                  fontSize: '0.75rem'
                                }}>
                                  {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                                </div>
                                <div>
                                  <div style={{
                                    color: 'var(--docente-text-primary)',
                                    fontWeight: '600',
                                    fontSize: '0.875rem'
                                  }}>
                                    {estudiante.apellido}, {estudiante.nombre}
                                  </div>
                                  <div style={{
                                    color: 'var(--docente-text-muted)',
                                    fontSize: '0.75rem'
                                  }}>
                                    CI: {estudiante.cedula}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
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
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
          <HiOutlineClipboardList size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
            Selecciona un curso para comenzar
          </p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            Elige el curso y la fecha para tomar asistencia
          </p>
        </div>
      )}

      {/* Modal de Observaciones para Justificación */}
      {showObservacionesModal && (
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
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1rem',
            border: `1px solid var(--docente-border)`,
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: darkMode ? '0 1rem 3rem rgba(0, 0, 0, 0.5)' : '0 1rem 3rem rgba(0, 0, 0, 0.2)'
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
        </div>
      )}

      {/* Modal de Rango de Fechas */}
      {showRangoFechasModal && (
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
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: darkMode ? 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            borderRadius: '1rem',
            border: `1px solid var(--docente-border)`,
            padding: '1.5rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: darkMode ? '0 1rem 3rem rgba(0, 0, 0, 0.5)' : '0 1rem 3rem rgba(0, 0, 0, 0.2)'
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
        </div>
      )}
    </div>
  );
};

export default TomarAsistencia;
