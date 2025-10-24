import React, { useState, useEffect } from 'react';
import { X, Download, Award, Search, Filter, BarChart3, User, BookOpen, FileSpreadsheet } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

interface ModalCalificacionesProps {
  isOpen: boolean;
  onClose: () => void;
  cursoId: number;
  cursoNombre: string;
  darkMode: boolean;
}

interface Tarea {
  id_tarea: number;
  titulo: string;
  nota_maxima: number;
}

interface Estudiante {
  id_estudiante: number;
  nombre: string;
  apellido: string;
  calificaciones: { [tareaId: number]: number | null };
  promedio: number;
}

const ModalCalificaciones: React.FC<ModalCalificacionesProps> = ({
  isOpen,
  onClose,
  cursoId,
  cursoNombre,
  darkMode
}) => {
  // Utilidad: convertir un SVG público a PNG dataURL para insertarlo en jsPDF
  const loadSvgAsPngDataUrl = async (url: string, width = 64, height = 64): Promise<string | null> => {
    try {
      const res = await fetch(url);
      const svgText = await res.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const img = new Image();
      const objectUrl = URL.createObjectURL(svgBlob);
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  };
  
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'aprobados' | 'reprobados'>('todos');

  useEffect(() => {
    if (isOpen) {
      fetchCalificaciones();
    }
  }, [isOpen, cursoId]);

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...estudiantes];
    
    // Aplicar búsqueda
    if (busqueda) {
      const term = busqueda.toLowerCase();
      result = result.filter(est => 
        est.nombre.toLowerCase().includes(term) || 
        est.apellido.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro
    if (filtro === 'aprobados') {
      result = result.filter(est => est.promedio >= 14); // Asumiendo 14 como nota mínima de aprobación
    } else if (filtro === 'reprobados') {
      result = result.filter(est => est.promedio < 14);
    }
    
    setFilteredEstudiantes(result);
  }, [estudiantes, busqueda, filtro]);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      // Obtener tareas del curso
      const tareasResponse = await fetch(`${API_BASE}/cursos/${cursoId}/tareas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let tareasArr: Tarea[] = [];
      if (tareasResponse.ok) {
        try {
          const tareasJson = await tareasResponse.json();
          tareasArr = Array.isArray(tareasJson) ? tareasJson : (tareasJson?.tareas || []);
        } catch (_) {
          tareasArr = [];
        }
      }

      // Obtener estudiantes del curso
      const estudiantesResponse = await fetch(`${API_BASE}/cursos/${cursoId}/estudiantes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let estudiantesArr: any[] = [];
      if (estudiantesResponse.ok) {
        try {
          const estudiantesJson = await estudiantesResponse.json();
          estudiantesArr = Array.isArray(estudiantesJson) ? estudiantesJson : (estudiantesJson?.estudiantes || []);
        } catch (_) {
          estudiantesArr = [];
        }
      }

      // Obtener calificaciones
      const calificacionesResponse = await fetch(`${API_BASE}/cursos/${cursoId}/calificaciones`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let calificacionesArr: any[] = [];
      if (calificacionesResponse.ok) {
        try {
          const calificacionesJson = await calificacionesResponse.json();
          calificacionesArr = Array.isArray(calificacionesJson) ? calificacionesJson : (calificacionesJson?.calificaciones || []);
        } catch (_) {
          calificacionesArr = [];
        }
      }

      // Procesar datos
      const estudiantesConCalificaciones = estudiantesArr.map((est: any) => {
        const califs: { [key: number]: number | null } = {};
        let suma = 0;
        let count = 0;

        tareasArr.forEach((tarea: Tarea) => {
          const calif = calificacionesArr.find(
            (c: any) => c.id_estudiante === est.id_estudiante && c.id_tarea === tarea.id_tarea
          );
          const raw = calif ? calif.nota_obtenida : null;
          const val = raw === null || raw === undefined ? null : Number(raw);
          califs[tarea.id_tarea] = Number.isFinite(val as number) ? (val as number) : null;
          if (Number.isFinite(val as number)) {
            suma += val as number;
            count++;
          }
        });

        return {
          id_estudiante: est.id_estudiante,
          nombre: est.nombre,
          apellido: est.apellido,
          calificaciones: califs,
          promedio: count > 0 ? suma / count : 0
        };
      });

      setTareas(tareasArr);
      setEstudiantes(estudiantesConCalificaciones);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    try {
      setDownloadingPDF(true);

      const { jsPDF }: any = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default as any;

      const orientation = tareas.length > 6 ? 'landscape' : 'portrait';
      const doc = new jsPDF({ orientation });

      // Encabezado
      doc.setFontSize(14);
      doc.text('Calificaciones del Curso', 14, 14);
      doc.setFontSize(11);
      doc.text(String(cursoNombre || ''), 14, 22);

      // Logo (opcional) desde /public/vite.svg
      try {
        const pageWidth = doc.internal.pageSize.getWidth();
        const logoDataUrl = await loadSvgAsPngDataUrl('/vite.svg', 24, 24);
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, 'PNG', pageWidth - 14 - 24, 10, 24, 24);
        }
      } catch { }

      // Construir head y body
      const head = [[
        'Estudiante',
        ...tareas.map(t => `${t.titulo} (/${t.nota_maxima})`),
        'Promedio'
      ]];
      const body = estudiantes.map(est => [
        `${est.nombre} ${est.apellido}`,
        ...tareas.map(t => {
          const v = est.calificaciones[t.id_tarea];
          return v !== null && Number.isFinite(v) ? (v as number).toFixed(1) : '-';
        }),
        est.promedio.toFixed(1)
      ]);

      autoTable(doc, {
        head,
        body,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      doc.save(`Calificaciones_${cursoNombre}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
    } finally {
      setDownloadingPDF(false);
    }
  };

  const descargarExcel = async () => {
    try {
      setDownloadingExcel(true);
      
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
      
      // Hoja 1: Detalle de calificaciones
      const datosDetalle = estudiantes.map((est) => {
        const fila: any = {
          'Apellido': est.apellido,
          'Nombre': est.nombre
        };
        
        tareas.forEach((tarea) => {
          const nota = est.calificaciones[tarea.id_tarea];
          fila[tarea.titulo] = nota !== null && Number.isFinite(nota) ? nota.toFixed(1) : '-';
        });
        
        fila['Promedio'] = est.promedio.toFixed(1);
        return fila;
      });
      
      // Hoja 2: Estadísticas del curso
      const aprobados = estudiantes.filter(est => est.promedio >= 14).length;
      const reprobados = estudiantes.length - aprobados;
      const promedioGeneral = estudiantes.length > 0 
        ? (estudiantes.reduce((sum, est) => sum + est.promedio, 0) / estudiantes.length).toFixed(2)
        : '0.00';
      
      const datosEstadisticas = [
        { 'Métrica': 'Total de Estudiantes', 'Valor': estudiantes.length },
        { 'Métrica': 'Estudiantes Aprobados', 'Valor': aprobados },
        { 'Métrica': 'Estudiantes Reprobados', 'Valor': reprobados },
        { 'Métrica': 'Promedio General del Curso', 'Valor': promedioGeneral },
        { 'Métrica': 'Tareas Evaluadas', 'Valor': tareas.length }
      ];
      
      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      
      // Agregar hoja de detalle
      const wsDetalle = XLSX.utils.json_to_sheet(datosDetalle);
      XLSX.utils.book_append_sheet(wb, wsDetalle, 'Calificaciones');
      
      // Agregar hoja de estadísticas
      const wsEstadisticas = XLSX.utils.json_to_sheet(datosEstadisticas);
      XLSX.utils.book_append_sheet(wb, wsEstadisticas, 'Estadísticas');
      
      // Generar nombre del archivo
      const nombreCurso = cursoNombre.replace(/\s+/g, '_') || 'Curso';
      const nombreArchivo = `Calificaciones_${nombreCurso}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);
      
    } catch (error) {
      console.error('Error generando Excel:', error);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (filteredEstudiantes.length === 0) return { total: 0, aprobados: 0, reprobados: 0, promedioGeneral: 0 };
    
    const aprobados = filteredEstudiantes.filter(est => est.promedio >= 14).length;
    const reprobados = filteredEstudiantes.length - aprobados;
    const promedioGeneral = filteredEstudiantes.reduce((sum, est) => sum + est.promedio, 0) / filteredEstudiantes.length;
    
    return {
      total: filteredEstudiantes.length,
      aprobados,
      reprobados,
      promedioGeneral: parseFloat(promedioGeneral.toFixed(2))
    };
  };

  const stats = calcularEstadisticas();

  if (!isOpen) return null;

  // Estilos consistentes con el admin
  const theme = {
    bg: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
    modalBg: darkMode ? '#1a1a2e' : '#ffffff',
    textPrimary: darkMode ? '#ffffff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
    textMuted: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(100,116,139,0.8)',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
    inputBg: darkMode ? 'rgba(255,255,255,0.05)' : '#f8fafc',
    inputBorder: darkMode ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
    cardBg: darkMode ? 'rgba(255,255,255,0.03)' : '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#60a5fa'  // Cambiado a celeste/azul claro
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        backdropFilter: 'blur(4px)',
        padding: '1rem'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.modalBg,
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: '75rem',
          maxHeight: 'calc(100vh - 2rem)',
          overflow: 'hidden',
          boxShadow: darkMode 
            ? '0 1.25rem 2.5rem rgba(0,0,0,0.5)' 
            : '0 1.25rem 2.5rem rgba(0,0,0,0.15)',
          border: `1px solid ${theme.border}`
        }}>
        {/* Header con estilo del admin */}
        <div style={{
          padding: '1rem',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
        }}>
          <div>
            <h3 style={{ 
              color: theme.textPrimary, 
              fontSize: '1.1rem', 
              fontWeight: '700', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <BarChart3 size={20} color={theme.info} />
              Calificaciones del Curso
            </h3>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.85rem', 
              margin: '0.25rem 0 0 0' 
            }}>
              {cursoNombre}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={descargarExcel}
              disabled={downloadingExcel || loading}
              style={{
                background: downloadingExcel 
                  ? 'rgba(34, 197, 94, 0.5)' 
                  : darkMode 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(34, 197, 94, 0.1)',
                border: `1px solid ${downloadingExcel ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.3)'}`,
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                color: downloadingExcel ? '#fff' : '#22c55e',
                cursor: downloadingExcel || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                if (!downloadingExcel && !loading) {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(34, 197, 94, 0.25)' 
                    : 'rgba(34, 197, 94, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = downloadingExcel 
                  ? 'rgba(34, 197, 94, 0.5)' 
                  : darkMode 
                    ? 'rgba(34, 197, 94, 0.15)' 
                    : 'rgba(34, 197, 94, 0.1)';
              }}
            >
              <FileSpreadsheet size={18} />
              {downloadingExcel ? 'Generando...' : 'Excel'}
            </button>
            
            <button
              onClick={descargarPDF}
              disabled={downloadingPDF || loading}
              style={{
                background: downloadingPDF 
                  ? 'rgba(59, 130, 246, 0.5)' 
                  : darkMode 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${downloadingPDF ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'}`,
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                color: downloadingPDF ? '#fff' : '#3b82f6',
                cursor: downloadingPDF || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
              onMouseEnter={(e) => {
                if (!downloadingPDF && !loading) {
                  e.currentTarget.style.background = darkMode 
                    ? 'rgba(59, 130, 246, 0.25)' 
                    : 'rgba(59, 130, 246, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = downloadingPDF 
                  ? 'rgba(59, 130, 246, 0.5)' 
                  : darkMode 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.1)';
              }}
            >
              <Download size={18} />
              {downloadingPDF ? 'Generando...' : 'PDF'}
            </button>
            
            <button
              onClick={onClose}
              style={{
                background: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                borderRadius: '0.5rem',
                padding: '0.5rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = darkMode 
                  ? 'rgba(239, 68, 68, 0.25)' 
                  : 'rgba(239, 68, 68, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = darkMode 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Estadísticas con estilo del admin */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: `1px solid ${theme.border}`,
          background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '0.5rem' 
          }}>
            <div style={{
              background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.05)', // Celeste
              border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <User size={16} color={theme.info} style={{ margin: '0 auto 0.125rem' }} />
              <div style={{ 
                color: theme.info, // Celeste para el número
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>
                {stats.total}
              </div>
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: '0.65rem' 
              }}>
                Estudiantes
              </div>
            </div>
            
            <div style={{
              background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.05)', // Celeste
              border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <Award size={16} color={theme.info} style={{ margin: '0 auto 0.125rem' }} />
              <div style={{ 
                color: theme.info, // Celeste para el número
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>
                {stats.aprobados}
              </div>
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: '0.65rem' 
              }}>
                Aprobados
              </div>
            </div>
            
            <div style={{
              background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.05)', // Celeste
              border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <BarChart3 size={16} color={theme.info} style={{ margin: '0 auto 0.125rem' }} />
              <div style={{ 
                color: theme.info, // Celeste para el número
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>
                {stats.reprobados}
              </div>
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: '0.65rem' 
              }}>
                Reprobados
              </div>
            </div>
            
            <div style={{
              background: darkMode ? 'rgba(96, 165, 250, 0.1)' : 'rgba(96, 165, 250, 0.05)', // Celeste
              border: `1px solid ${darkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(96, 165, 250, 0.15)'}`,
              borderRadius: '0.375rem',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <BookOpen size={16} color={theme.info} style={{ margin: '0 auto 0.125rem' }} />
              <div style={{ 
                color: theme.info, // Celeste para el número
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>
                {stats.promedioGeneral}
              </div>
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: '0.65rem' 
              }}>
                Promedio General
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtro y búsqueda con estilo del admin */}
        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: `1px solid ${theme.border}`,
          background: darkMode ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.textMuted
              }} />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.25rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: theme.textPrimary,
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.inputBorder;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setFiltro('todos')}
                style={{
                  padding: '0.5rem 1rem',
                  background: filtro === 'todos' 
                    ? darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'
                    : 'transparent',
                  border: `1px solid ${filtro === 'todos' ? '#3b82f6' : theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: filtro === 'todos' ? '#3b82f6' : theme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <User size={16} />
                Todos
              </button>
              
              <button
                onClick={() => setFiltro('aprobados')}
                style={{
                  padding: '0.5rem 1rem',
                  background: filtro === 'aprobados' 
                    ? darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)'
                    : 'transparent',
                  border: `1px solid ${filtro === 'aprobados' ? '#10b981' : theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: filtro === 'aprobados' ? '#10b981' : theme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Award size={16} />
                Aprobados
              </button>
              
              <button
                onClick={() => setFiltro('reprobados')}
                style={{
                  padding: '0.5rem 1rem',
                  background: filtro === 'reprobados' 
                    ? darkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)'
                    : 'transparent',
                  border: `1px solid ${filtro === 'reprobados' ? '#ef4444' : theme.inputBorder}`,
                  borderRadius: '0.5rem',
                  color: filtro === 'reprobados' ? '#ef4444' : theme.textSecondary,
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <BarChart3 size={16} />
                Reprobados
              </button>
            </div>
          </div>
        </div>

        {/* Content con estilo del admin */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
          maxHeight: 'calc(90vh - 200px)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }} />
              <p style={{ color: theme.textSecondary, fontSize: '0.875rem' }}>
                Cargando calificaciones...
              </p>
            </div>
          ) : (
            <div>
              {/* Tabla de calificaciones con estilo del admin */}
              {filteredEstudiantes.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  background: theme.cardBg,
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.border}`
                }}>
                  <Award size={32} color={theme.textMuted} style={{ margin: '0 auto 1rem' }} />
                  <p style={{ color: theme.textSecondary, margin: 0 }}>
                    No hay estudiantes que coincidan con los filtros
                  </p>
                </div>
              ) : (
                <div style={{
                  overflowX: 'auto',
                  background: theme.cardBg,
                  borderRadius: '0.5rem',
                  border: `1px solid ${theme.border}`
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead>
                      <tr style={{
                        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        borderBottom: `2px solid ${theme.border}`
                      }}>
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'left',
                          color: theme.textPrimary,
                          fontWeight: '600',
                          position: 'sticky',
                          left: 0,
                          background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          zIndex: 10
                        }}>
                          Estudiante
                        </th>
                        {tareas.map((tarea) => (
                          <th key={tarea.id_tarea} style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'center',
                            color: theme.textPrimary,
                            fontWeight: '600',
                            minWidth: '80px'
                          }}>
                            <div style={{ marginBottom: '0.25rem' }}>{tarea.titulo}</div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: theme.textMuted,
                              fontWeight: '500'
                            }}>
                              /{tarea.nota_maxima}
                            </div>
                          </th>
                        ))}
                        <th style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'center',
                          color: theme.textPrimary,
                          fontWeight: '600',
                          background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                          minWidth: '80px'
                        }}>
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEstudiantes.map((estudiante, idx) => (
                        <tr key={estudiante.id_estudiante} style={{
                          borderBottom: `1px solid ${theme.border}`,
                          background: idx % 2 === 0
                            ? (darkMode ? 'rgba(255,255,255,0.02)' : 'transparent')
                            : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)')
                        }}>
                          <td style={{
                            padding: '0.75rem 1rem',
                            color: theme.textPrimary,
                            fontWeight: '500',
                            position: 'sticky',
                            left: 0,
                            background: idx % 2 === 0
                              ? (darkMode ? 'rgba(255,255,255,0.02)' : 'transparent')
                              : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'),
                            zIndex: 9
                          }}>
                            {estudiante.apellido}, {estudiante.nombre}
                          </td>
                          {tareas.map((tarea) => {
                            const notaVal = estudiante.calificaciones[tarea.id_tarea];
                            const nota = (notaVal === null || notaVal === undefined)
                              ? null
                              : (typeof notaVal === 'number' ? notaVal : Number(notaVal));
                            const porcentaje = nota !== null && Number.isFinite(nota) ? (nota / tarea.nota_maxima) * 100 : 0;
                            const color = nota === null ? theme.textMuted
                              : porcentaje >= 70 ? theme.success
                                : porcentaje >= 50 ? theme.warning
                                  : theme.danger;

                            return (
                              <td key={tarea.id_tarea} style={{
                                padding: '0.75rem 1rem',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.375rem',
                                  background: `${color}20`,
                                  color: color,
                                  fontWeight: '600',
                                  fontSize: '0.875rem'
                                }}>
                                  {nota !== null && Number.isFinite(nota) ? nota.toFixed(1) : '-'}
                                </div>
                              </td>
                            );
                          })}
                          <td style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'center',
                            background: darkMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.02)'
                          }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: theme.warning,
                              fontWeight: '700',
                              fontSize: '0.875rem'
                            }}>
                              {estudiante.promedio.toFixed(1)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCalificaciones;