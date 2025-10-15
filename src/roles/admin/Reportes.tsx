import React, { useState, useEffect } from 'react';
import { 
  Download, BarChart3, Users, BookOpen, DollarSign, 
  Eye, FileSpreadsheet, Loader2, AlertCircle, TrendingUp, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  
  // Estados de datos
  const [datosReporte, setDatosReporte] = useState<DatosReporte | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  const reportesDisponibles = [
    {
      id: 'estudiantes',
      titulo: 'Reporte de Estudiantes',
      descripcion: 'Estadísticas de inscripciones y rendimiento académico',
      icono: Users,
      color: '#3b82f6'
    },
    {
      id: 'cursos',
      titulo: 'Reporte de Cursos',
      descripcion: 'Análisis de popularidad y ocupación de cursos',
      icono: BookOpen,
      color: '#10b981'
    },
    {
      id: 'financiero',
      titulo: 'Reporte Financiero',
      descripcion: 'Ingresos, pagos y estado financiero',
      icono: DollarSign,
      color: '#f59e0b'
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
      console.error('❌ No hay token disponible');
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
        console.error('❌ No hay token disponible para cargar períodos');
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
        console.error('❌ Token inválido o expirado al cargar períodos');
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
        case 'financiero':
          url = `${API_BASE}/reportes/financiero`;
          if (filtroTipoPago !== 'todos') params.append('tipoPago', filtroTipoPago);
          if (filtroEstadoPago !== 'todos') params.append('estadoPago', filtroEstadoPago);
          break;
        case 'cursos':
          url = `${API_BASE}/reportes/cursos`;
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
    } catch (error) {
      console.error('Error generando reporte:', error);
      setError(error.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Descargar archivo
  const descargarArchivo = async (formato) => {
    setDescargando(true);
    try {
      let url = '';
      let params = new URLSearchParams({ fechaInicio, fechaFin });

      switch (tipoReporte) {
        case 'estudiantes':
          url = `${API_BASE}/reportes/estudiantes/${formato}`;
          if (filtroEstadoEstudiante !== 'todos') params.append('estado', filtroEstadoEstudiante);
          if (filtroCurso) params.append('idCurso', filtroCurso);
          break;
        case 'financiero':
          url = `${API_BASE}/reportes/financiero/${formato}`;
          if (filtroTipoPago !== 'todos') params.append('tipoPago', filtroTipoPago);
          if (filtroEstadoPago !== 'todos') params.append('estadoPago', filtroEstadoPago);
          break;
        case 'cursos':
          url = `${API_BASE}/reportes/cursos/${formato}`;
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
    } catch (error) {
      console.error(`Error descargando ${formato}:`, error);
      alert(`Error al descargar el ${formato.toUpperCase()}`);
    } finally {
      setDescargando(false);
    }
  };

  // Renderizar filtros específicos
  const renderFiltrosEspecificos = () => {
    if (tipoReporte === 'estudiantes') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Curso:</label>
            <select
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem', minWidth: '300px'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado:</label>
            <select
              value={filtroEstadoEstudiante}
              onChange={(e) => setFiltroEstadoEstudiante(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem'
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

    if (tipoReporte === 'financiero') {
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Tipo Pago:</label>
            <select
              value={filtroTipoPago}
              onChange={(e) => setFiltroTipoPago(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Estado:</label>
            <select
              value={filtroEstadoPago}
              onChange={(e) => setFiltroEstadoPago(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos</option>
              <option value="verificado">Completados</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
        </>
      );
    }

    return null;
  };

  const renderEstadisticas = () => {
    if (!datosReporte || !estadisticas) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
          <BarChart3 size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
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
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <AlertCircle size={64} color="#f59e0b" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '8px' }}>No hay estudiantes en este período</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
              Intenta seleccionar otro período o curso, o verifica que haya estudiantes matriculados.
            </p>
          </div>
        );
      }

      return (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Métricas principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { titulo: 'Total Estudiantes', valor: estadisticas.total_estudiantes || 0, color: '#3b82f6', icono: Users },
              { titulo: 'Activos', valor: estadisticas.activos || 0, color: '#10b981', icono: CheckCircle2 },
              { titulo: 'Aprobados', valor: estadisticas.aprobados || 0, color: '#8b5cf6', icono: TrendingUp },
              { titulo: 'Retirados', valor: estadisticas.retirados || 0, color: '#ef4444', icono: AlertCircle }
            ].map((metrica, idx) => (
              <div key={idx} style={{
                background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                border: `2px solid ${metrica.color}40`,
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'default',
                boxShadow: `0 4px 20px ${metrica.color}20`
              }}>
                <metrica.icono size={40} color={metrica.color} style={{ marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
                <div style={{ 
                  color: '#fff', 
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {metrica.valor}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {metrica.titulo}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de estudiantes */}
          {datosReporte.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.3)', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)'
            }}>
              <h4 style={{ 
                color: '#fff', 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                marginBottom: '20px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                Estudiantes Matriculados ({datosReporte.length})
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ 
                      borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
                      background: 'rgba(59, 130, 246, 0.1)'
                    }}>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left', 
                        color: '#60a5fa', 
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Nombre</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left', 
                        color: '#60a5fa', 
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Curso</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left', 
                        color: '#60a5fa', 
                        fontSize: '0.95rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>Estado</th>
                      <th style={{ 
                        padding: '16px 12px', 
                        textAlign: 'left', 
                        color: '#60a5fa', 
                        fontSize: '0.95rem',
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
                          padding: '16px 12px', 
                          color: '#fff', 
                          fontSize: '0.95rem',
                          fontWeight: '500'
                        }}>
                          {estudiante.nombre} {estudiante.apellido}
                        </td>
                        <td style={{ 
                          padding: '16px 12px', 
                          color: 'rgba(255,255,255,0.85)', 
                          fontSize: '0.9rem'
                        }}>
                          {estudiante.nombre_curso}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
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
                          padding: '16px 12px', 
                          color: 'rgba(255,255,255,0.85)', 
                          fontSize: '0.9rem'
                        }}>
                          {new Date(estudiante.fecha_inscripcion).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {datosReporte.length > 10 && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '16px', textAlign: 'center' }}>
                  Mostrando 10 de {datosReporte.length} estudiantes. Descarga el reporte completo en PDF o Excel.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (tipoReporte === 'financiero') {
      return (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Métricas principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { titulo: 'Ingresos Totales', valor: `$${parseFloat(estadisticas.ingresos_totales || 0).toLocaleString()}`, color: '#10b981', icono: DollarSign },
              { titulo: 'Pagos Verificados', valor: estadisticas.pagos_verificados || 0, color: '#3b82f6', icono: CheckCircle2 },
              { titulo: 'Pagos Pendientes', valor: estadisticas.pagos_pendientes || 0, color: '#f59e0b', icono: AlertCircle },
              { titulo: 'Total Pagos', valor: estadisticas.total_pagos || 0, color: '#8b5cf6', icono: TrendingUp }
            ].map((metrica, idx) => (
              <div key={idx} style={{
                background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                border: `2px solid ${metrica.color}40`,
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'default',
                boxShadow: `0 4px 20px ${metrica.color}20`
              }}>
                <metrica.icono size={40} color={metrica.color} style={{ marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
                <div style={{ 
                  color: '#fff', 
                  fontSize: '2.5rem', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {metrica.valor}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
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
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Detalle de Pagos ({datosReporte.length})
              </h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', fontSize: '0.9rem' }}>Estudiante</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', fontSize: '0.9rem' }}>Curso</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', fontSize: '0.9rem' }}>Monto</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', fontSize: '0.9rem' }}>Fecha</th>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#10b981', fontSize: '0.9rem' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosReporte.slice(0, 10).map((pago, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem' }}>
                          {pago.nombre_estudiante} {pago.apellido_estudiante}
                        </td>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                          {pago.nombre_curso}
                        </td>
                        <td style={{ padding: '12px', color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                          ${parseFloat(pago.monto).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                          {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
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
              </div>
              {datosReporte.length > 10 && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '16px', textAlign: 'center' }}>
                  Mostrando 10 de {datosReporte.length} pagos. Descarga el reporte completo en PDF o Excel.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    if (tipoReporte === 'cursos') {
      return (
        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Métricas principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { titulo: 'Total Cursos', valor: estadisticas.total_cursos || 0, color: '#10b981', icono: BookOpen },
              { titulo: 'Cursos Activos', valor: estadisticas.cursos_activos || 0, color: '#3b82f6', icono: CheckCircle2 },
              { titulo: 'Total Estudiantes', valor: estadisticas.total_estudiantes_inscritos || 0, color: '#f59e0b', icono: Users }
            ].map((metrica, idx) => (
              <div key={idx} style={{
                background: `linear-gradient(135deg, ${metrica.color}15 0%, ${metrica.color}05 100%)`,
                border: `2px solid ${metrica.color}40`,
                borderRadius: '16px', 
                padding: '24px', 
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'default',
                boxShadow: `0 4px 20px ${metrica.color}20`
              }}>
                <metrica.icono size={40} color={metrica.color} style={{ marginBottom: '16px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
                <div style={{ 
                  color: '#fff', 
                  fontSize: '3rem', 
                  fontWeight: '800', 
                  marginBottom: '8px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {metrica.valor}
                </div>
                <div style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '1rem',
                  fontWeight: '600',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}>
                  {metrica.titulo}
                </div>
              </div>
            ))}
          </div>

          {/* Lista de cursos */}
          {datosReporte.length > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '2px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '16px', 
              padding: '24px',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Cursos Disponibles ({datosReporte.length})
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {datosReporte.slice(0, 5).map((curso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>
                        {curso.nombre_curso}
                      </div>
                      <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700' }}>
                        {curso.porcentaje_ocupacion}% ocupación
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px' }}>
                        <div style={{
                          background: '#10b981',
                          height: '100%',
                          borderRadius: '8px',
                          width: `${curso.porcentaje_ocupacion}%`
                        }} />
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {curso.total_estudiantes}/{curso.capacidad_maxima}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                      <span>Horario: {curso.horario}</span>
                      <span>Docente: {curso.docente_nombres} {curso.docente_apellidos}</span>
                    </div>
                  </div>
                ))}
              </div>
              {datosReporte.length > 5 && (
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '16px', textAlign: 'center' }}>
                  Mostrando 5 de {datosReporte.length} cursos. Descarga el reporte completo en PDF o Excel.
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
        <AlertCircle size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <p style={{ fontSize: '1.1rem', margin: 0 }}>
          Visualización de estadísticas en desarrollo para este tipo de reporte
        </p>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <BarChart3 size={32} color="#ef4444" />
          Reportes y Estadísticas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Análisis detallado del rendimiento académico y financiero
        </p>
      </div>

      {/* Selector de Reportes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {reportesDisponibles.map(reporte => (
            <button
              key={reporte.id}
              onClick={() => {
                setTipoReporte(reporte.id);
                setDatosReporte(null);
                setEstadisticas(null);
              }}
              style={{
                background: tipoReporte === reporte.id 
                  ? `linear-gradient(135deg, ${reporte.color}, ${reporte.color}dd)` 
                  : 'rgba(255,255,255,0.05)',
                border: `1px solid ${tipoReporte === reporte.id ? reporte.color : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px', padding: '16px', cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <reporte.icono size={24} color={tipoReporte === reporte.id ? '#fff' : reporte.color} />
                <div style={{ 
                  color: tipoReporte === reporte.id ? '#fff' : 'rgba(255,255,255,0.9)', 
                  fontSize: '1rem', fontWeight: '600' 
                }}>
                  {reporte.titulo}
                </div>
              </div>
              <div style={{ 
                color: tipoReporte === reporte.id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)', 
                fontSize: '0.8rem' 
              }}>
                {reporte.descripcion}
              </div>
            </button>
          ))}
        </div>

        {/* Controles de Filtro */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Selector de Período Único */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Período:</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem', minWidth: '250px'
              }}
            >
              <option value="todos" style={{ background: '#1a1a1a' }}>Todos los períodos</option>
              {periodosDisponibles.map((periodo, idx) => {
                // Formatear fechas: 13 Oct 2025 - 13 Dic 2025
                const formatearFecha = (fecha: string): string => {
                  if (!fecha) return '';
                  // Extraer año, mes, día directamente del string YYYY-MM-DD
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
          
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={generarReporte}
              disabled={loading || descargando}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: loading ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={16} />}
              {loading ? 'Generando...' : 'Ver Reporte'}
            </button>
            <button
              onClick={() => descargarArchivo('pdf')}
              disabled={!datosReporte || descargando || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: (!datosReporte || descargando || loading) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600',
                cursor: (!datosReporte || descargando || loading) ? 'not-allowed' : 'pointer',
                opacity: (!datosReporte || descargando || loading) ? 0.5 : 1
              }}
            >
              {descargando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={16} />}
              Exportar PDF
            </button>
            <button
              onClick={() => descargarArchivo('excel')}
              disabled={!datosReporte || descargando || loading}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: (!datosReporte || descargando || loading) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px', color: '#10b981', fontSize: '0.9rem', fontWeight: '600',
                cursor: (!datosReporte || descargando || loading) ? 'not-allowed' : 'pointer',
                opacity: (!datosReporte || descargando || loading) ? 0.5 : 1
              }}
            >
              {descargando ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FileSpreadsheet size={16} />}
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del Reporte */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '32px'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px 0' }}>
            {reportesDisponibles.find(r => r.id === tipoReporte)?.titulo}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.9rem' }}>
            Período: {fechaInicio} - {fechaFin}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#ef4444'
          }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {renderEstadisticas()}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Reportes;