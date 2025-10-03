import React, { useState } from 'react';
import { 
  Search, Download, Filter, BarChart3, PieChart, TrendingUp, 
  Users, BookOpen, DollarSign, Calendar, FileText, Eye, FileCheck, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('estudiantes');
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');
  const [filtroEstado, setFiltroEstado] = useState('todos');

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
    },
    {
      id: 'asistencia',
      titulo: 'Reporte de Asistencia',
      descripcion: 'Control de asistencia por curso y estudiante',
      icono: Calendar,
      color: '#8b5cf6'
    }
  ];

  const datosEstudiantes = {
    totalInscritos: 245,
    nuevosEstesMes: 18,
    activos: 220,
    graduados: 89,
    porCurso: [
      { curso: 'Cosmetología Básica', estudiantes: 45, porcentaje: 18.4 },
      { curso: 'Peluquería Profesional', estudiantes: 38, porcentaje: 15.5 },
      { curso: 'Maquillaje Profesional', estudiantes: 32, porcentaje: 13.1 },
      { curso: 'Manicure y Pedicure', estudiantes: 28, porcentaje: 11.4 },
      { curso: 'Barbería Moderna', estudiantes: 25, porcentaje: 10.2 }
    ]
  };

  const datosCursos = {
    totalCursos: 12,
    cursosActivos: 8,
    promedioOcupacion: 78.5,
    cursosMasPopulares: [
      { curso: 'Cosmetología Básica', ocupacion: 90, capacidad: 50 },
      { curso: 'Peluquería Profesional', ocupacion: 85, capacidad: 45 },
      { curso: 'Maquillaje Profesional', ocupacion: 80, capacidad: 40 }
    ]
  };

  const datosFinancieros = {
    ingresosMes: 125000,
    ingresosTotales: 890000,
    pagosRecibidos: 78,
    pagosPendientes: 12,
    ingresosPorMes: [
      { mes: 'Ene', ingresos: 85000 },
      { mes: 'Feb', ingresos: 92000 },
      { mes: 'Mar', ingresos: 88000 },
      { mes: 'Abr', ingresos: 95000 },
      { mes: 'May', ingresos: 125000 }
    ]
  };

  const datosAsistencia = {
    promedioGeneral: 87.5,
    estudiantesRegulares: 198,
    estudiantesIrregulares: 22,
    asistenciaPorCurso: [
      { curso: 'Cosmetología Básica', asistencia: 92 },
      { curso: 'Peluquería Profesional', asistencia: 88 },
      { curso: 'Maquillaje Profesional', asistencia: 85 },
      { curso: 'Manicure y Pedicure', asistencia: 90 }
    ]
  };

  const generarReporte = () => {
    // Simulación de generación de reporte
    const reporteTitulo = reportesDisponibles.find(r => r.id === tipoReporte)?.titulo;
    toast.success(`Generando reporte de ${reporteTitulo} desde ${fechaInicio} hasta ${fechaFin}`, {
      icon: <FileCheck size={20} />,
      duration: 3000,
    });
  };

  const exportarReporte = (formato) => {
    toast.success(`Exportando reporte en formato ${formato.toUpperCase()}`, {
      icon: <Download size={20} />,
      duration: 3000,
    });
  };

  const renderEstadisticas = () => {
    switch (tipoReporte) {
      case 'estudiantes':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Métricas principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { titulo: 'Total Inscritos', valor: datosEstudiantes.totalInscritos, color: '#3b82f6', icono: Users },
                { titulo: 'Nuevos Este Mes', valor: datosEstudiantes.nuevosEstesMes, color: '#10b981', icono: TrendingUp },
                { titulo: 'Estudiantes Activos', valor: datosEstudiantes.activos, color: '#f59e0b', icono: Users },
                { titulo: 'Graduados', valor: datosEstudiantes.graduados, color: '#8b5cf6', icono: Users }
              ].map((metrica, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  border: `1px solid ${metrica.color}30`,
                  borderRadius: '16px', padding: '20px', textAlign: 'center'
                }}>
                  <metrica.icono size={32} color={metrica.color} style={{ marginBottom: '12px' }} />
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {metrica.valor}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {metrica.titulo}
                  </div>
                </div>
              ))}
            </div>

            {/* Distribución por curso */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '16px', padding: '24px'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Distribución por Curso
              </h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {datosEstudiantes.porCurso.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', minWidth: '180px' }}>{item.curso}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px', position: 'relative' }}>
                      <div style={{
                        background: '#3b82f6', height: '100%', borderRadius: '8px',
                        width: `${item.porcentaje}%`, transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600', minWidth: '60px' }}>
                      {item.estudiantes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cursos':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { titulo: 'Total Cursos', valor: datosCursos.totalCursos, color: '#10b981', icono: BookOpen },
                { titulo: 'Cursos Activos', valor: datosCursos.cursosActivos, color: '#3b82f6', icono: BookOpen },
                { titulo: 'Ocupación Promedio', valor: `${datosCursos.promedioOcupacion}%`, color: '#f59e0b', icono: BarChart3 }
              ].map((metrica, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  border: `1px solid ${metrica.color}30`, borderRadius: '16px', padding: '20px', textAlign: 'center'
                }}>
                  <metrica.icono size={32} color={metrica.color} style={{ marginBottom: '12px' }} />
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {metrica.valor}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {metrica.titulo}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '24px'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Cursos Más Populares
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {datosCursos.cursosMasPopulares.map((curso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '12px', padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{curso.curso}</div>
                      <div style={{ color: '#10b981', fontSize: '1rem', fontWeight: '700' }}>
                        {Math.round((curso.ocupacion / curso.capacidad) * 100)}%
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '8px' }}>
                        <div style={{
                          background: '#10b981', height: '100%', borderRadius: '8px',
                          width: `${(curso.ocupacion / curso.capacidad) * 100}%`
                        }} />
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                        {curso.ocupacion}/{curso.capacidad}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'financiero':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { titulo: 'Ingresos Este Mes', valor: `$${datosFinancieros.ingresosMes.toLocaleString()}`, color: '#10b981', icono: DollarSign },
                { titulo: 'Ingresos Totales', valor: `$${datosFinancieros.ingresosTotales.toLocaleString()}`, color: '#3b82f6', icono: TrendingUp },
                { titulo: 'Pagos Recibidos', valor: datosFinancieros.pagosRecibidos, color: '#f59e0b', icono: FileText },
                { titulo: 'Pagos Pendientes', valor: datosFinancieros.pagosPendientes, color: '#ef4444', icono: FileText }
              ].map((metrica, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  border: `1px solid ${metrica.color}30`, borderRadius: '16px', padding: '20px', textAlign: 'center'
                }}>
                  <metrica.icono size={32} color={metrica.color} style={{ marginBottom: '12px' }} />
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {metrica.valor}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {metrica.titulo}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '16px', padding: '24px'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Ingresos por Mes
              </h4>
              <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '200px' }}>
                {datosFinancieros.ingresosPorMes.map((mes, idx) => (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: '#f59e0b', borderRadius: '4px 4px 0 0',
                      width: '100%', height: `${(mes.ingresos / 125000) * 160}px`,
                      minHeight: '20px', transition: 'height 0.3s ease'
                    }} />
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>{mes.mes}</div>
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600' }}>
                      ${(mes.ingresos / 1000).toFixed(0)}k
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'asistencia':
        return (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { titulo: 'Promedio General', valor: `${datosAsistencia.promedioGeneral}%`, color: '#8b5cf6', icono: BarChart3 },
                { titulo: 'Asistencia Regular', valor: datosAsistencia.estudiantesRegulares, color: '#10b981', icono: Users },
                { titulo: 'Asistencia Irregular', valor: datosAsistencia.estudiantesIrregulares, color: '#ef4444', icono: Users }
              ].map((metrica, idx) => (
                <div key={idx} style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  border: `1px solid ${metrica.color}30`, borderRadius: '16px', padding: '20px', textAlign: 'center'
                }}>
                  <metrica.icono size={32} color={metrica.color} style={{ marginBottom: '12px' }} />
                  <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', marginBottom: '4px' }}>
                    {metrica.valor}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {metrica.titulo}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '24px'
            }}>
              <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', marginBottom: '20px' }}>
                Asistencia por Curso
              </h4>
              <div style={{ display: 'grid', gap: '16px' }}>
                {datosAsistencia.asistenciaPorCurso.map((curso, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', minWidth: '200px' }}>{curso.curso}</div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: '8px', height: '12px', position: 'relative' }}>
                      <div style={{
                        background: curso.asistencia >= 90 ? '#10b981' : curso.asistencia >= 80 ? '#f59e0b' : '#ef4444',
                        height: '100%', borderRadius: '8px', width: `${curso.asistencia}%`
                      }} />
                    </div>
                    <div style={{ 
                      color: curso.asistencia >= 90 ? '#10b981' : curso.asistencia >= 80 ? '#f59e0b' : '#ef4444',
                      fontSize: '0.9rem', fontWeight: '700', minWidth: '50px'
                    }}>
                      {curso.asistencia}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
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
              onClick={() => setTipoReporte(reporte.id)}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Desde:</label>
            <input
              type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Hasta:</label>
            <input
              type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
              style={{
                padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={generarReporte}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Eye size={16} />
              Ver Reporte
            </button>
            <button
              onClick={() => exportarReporte('pdf')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Exportar PDF
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

        {renderEstadisticas()}
      </div>
    </div>
  );
};

export default Reportes;
