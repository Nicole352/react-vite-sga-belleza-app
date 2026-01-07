import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, TrendingUp, Award, Clock, FileCheck,
  BarChart3, Table2
} from 'lucide-react';
import axios from 'axios';
import { showToast } from '../../config/toastConfig';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import { useSocket } from '../../hooks/useSocket';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface Entrega {
  id_entrega: number;
  id_estudiante: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  fecha_entrega: string;
  calificacion: number | null;
  comentario: string | null;
  estado: string;
}

const AnalisisEntregas: React.FC = () => {
  const { id_tarea } = useParams();
  const navigate = useNavigate();
  useBreakpoints(); // Hook disponible si se necesita en el futuro
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('docente-dark-mode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [loading, setLoading] = useState(true);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [tareaInfo, setTareaInfo] = useState<any>(null);

  // Escuchar cambios en el tema
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('docente-dark-mode');
      setDarkMode(saved !== null ? JSON.parse(saved) : true);
    };

    window.addEventListener('storage', handleStorageChange);

    // También escuchar cambios directos en el mismo tab
    const interval = setInterval(() => {
      const saved = localStorage.getItem('docente-dark-mode');
      const currentMode = saved !== null ? JSON.parse(saved) : true;
      if (currentMode !== darkMode) {
        setDarkMode(currentMode);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [darkMode]);

  // 🔥 WebSocket: Escuchar nuevas entregas en tiempo real
  useSocket({
    'entrega_nueva': (data: any) => {
      // Verificar si la entrega es de la tarea actual
      if (data.id_tarea === parseInt(id_tarea || '0')) {
        showToast.success(`Nueva entrega de ${data.entrega?.estudiante_nombre || 'un estudiante'}`, darkMode);

        // Recargar las entregas para mostrar la nueva
        fetchData();
      }
    },
    'entrega_actualizada': (data: any) => {
      // Si es de esta tarea, recargar
      if (data.id_tarea === parseInt(id_tarea || '0')) {
        showToast.success(`${data.entrega?.estudiante_nombre || 'Un estudiante'} actualizó su entrega`, darkMode);

        fetchData();
      }
    }
  });

  useEffect(() => {
    if (id_tarea) {
      fetchData();
    }
  }, [id_tarea]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      // Obtener entregas
      const responseEntregas = await axios.get(`${API_BASE}/api/entregas/tarea/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Obtener info de la tarea (incluye módulo y curso)
      const responseTarea = await axios.get(`${API_BASE}/api/tareas/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEntregas(responseEntregas.data.entregas || []);
      setTareaInfo(responseTarea.data.tarea || {});
    } catch (error) {
      console.error('Error cargando datos:', error);
      showToast.error('Error al cargar los datos', darkMode);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    const total = entregas.length;
    const calificadas = entregas.filter(e => e.calificacion !== null && e.calificacion !== undefined).length;
    const pendientes = total - calificadas;
    const porcentajeCompletado = total > 0 ? Math.round((calificadas / total) * 100) : 0;

    // Promedio de calificaciones - SOLO de las entregas calificadas
    const calificacionesValidas = entregas.filter(e => {
      const calif = e.calificacion;
      return calif !== null && calif !== undefined && !isNaN(Number(calif));
    });

    let promedio = '0.00';
    if (calificacionesValidas.length > 0) {
      const suma = calificacionesValidas.reduce((sum, e) => {
        const valor = Number(e.calificacion);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
      const promedioNum = suma / calificacionesValidas.length;
      promedio = isNaN(promedioNum) || !isFinite(promedioNum) ? '0.00' : promedioNum.toFixed(2);
    }

    // Notas máxima y mínima
    const notaMaxima = calificacionesValidas.length > 0
      ? Math.max(...calificacionesValidas.map(e => e.calificacion || 0))
      : 0;
    const notaMinima = calificacionesValidas.length > 0
      ? Math.min(...calificacionesValidas.map(e => e.calificacion || 0))
      : 0;

    // Estado de entregas (basado en fecha límite)
    const fechaLimite = tareaInfo?.fecha_limite ? new Date(tareaInfo.fecha_limite) : null;
    const ahora = new Date();

    const entregadas = entregas.length;
    const atrasadas = fechaLimite ? entregas.filter(e => new Date(e.fecha_entrega) > fechaLimite).length : 0;
    const noEntregadas = 0; // Por ahora, solo contamos las que están en el sistema

    // Estado de la tarea (Activa o Cerrada)
    const estadoTarea = fechaLimite && ahora > fechaLimite ? 'Cerrada' : 'Activa';
    const colorEstado = estadoTarea === 'Activa' ? '#10b981' : '#ef4444';

    return {
      total,
      calificadas,
      pendientes,
      porcentajeCompletado,
      promedio,
      notaMaxima,
      notaMinima,
      entregadas,
      atrasadas,
      noEntregadas,
      estadoTarea,
      colorEstado
    };
  };

  const stats = calcularEstadisticas();

  // Usar las variables CSS del tema docente
  const theme = {
    textPrimary: "var(--docente-text-primary)",
    textSecondary: "var(--docente-text-secondary)",
    textMuted: "var(--docente-text-muted)",
    cardBg: "var(--docente-card-bg)",
    border: "var(--docente-border)",
    accent: "var(--docente-accent)",
    success: "#10b981",
    warning: "#f59e0b"
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(59, 130, 246, 0.2)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>Cargando análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100%',
      backgroundColor: 'transparent',
      color: theme.textPrimary,
      padding: '0',
      paddingBottom: '0',
      paddingTop: '0'
    }}>
      {/* Header Compacto */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'var(--docente-card-bg)',
              border: '1px solid var(--docente-border)',
              color: 'var(--docente-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--docente-accent)';
              e.currentTarget.style.borderColor = 'var(--docente-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--docente-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--docente-border)';
            }}
            title="Volver"
          >
            <ArrowLeft size={16} />
          </button>

          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'linear-gradient(135deg, var(--docente-accent), #2563eb)',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            color: '#fff'
          }}>
            <BarChart3 size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--docente-text-primary)', letterSpacing: '-0.02em' }}>
              Análisis de Entregas
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--docente-text-secondary)', margin: 0, fontWeight: '500' }}>
              {tareaInfo?.titulo || 'Cargando...'}
            </p>
          </div>
        </div>
      </div>

      {/* Herramientas de Gestión Compactas */}
      <div style={{
        background: 'var(--docente-card-bg)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        marginBottom: '0.75rem',
        border: '1px solid var(--docente-border)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ fontSize: '0.8rem', fontWeight: '700', margin: 0, color: 'var(--docente-text-primary)' }}>
            Herramientas
          </h3>
          <p style={{ fontSize: '0.65rem', color: 'var(--docente-text-secondary)', margin: 0 }}>
            Gestión de datos
          </p>
        </div>

        {/* Botón Exportar a Excel */}
        <button
          onClick={async () => {
            try {
              const ExcelJS = await import('exceljs');
              const { saveAs } = await import('file-saver');

              const workbook = new ExcelJS.Workbook();

              // Obtener información del docente
              const docenteStr = sessionStorage.getItem('auth_user');
              const docenteObj = docenteStr ? JSON.parse(docenteStr) : null;
              const rawNombre = docenteObj?.nombre || docenteObj?.nombres || '';
              const rawApellido = docenteObj?.apellido || docenteObj?.apellidos || '';
              const nombreDocente = (rawApellido || rawNombre) ? `${rawApellido}, ${rawNombre}`.trim() : 'Docente';

              // Pie de página estándar
              const standardFooter = {
                oddFooter: `&L&"-,Bold"&14Escuela de Belleza Jessica Vélez&"-,Regular"&12&RDescargado: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })} — Pág. &P de &N`
              };

              // Función auxiliar para ajustar ancho de columnas
              const ajustarAnchoColumnas = (worksheet: any) => {
                worksheet.columns.forEach((column: any, colIdx: number) => {
                  let maxLength = 0;
                  column.eachCell({ includeEmpty: true }, (cell: any, rowIdx: number) => {
                    // Ignorar filas 1 y 2 (títulos dinámicos que están merged)
                    if (rowIdx <= 2) return;

                    const cellValue = cell.value ? cell.value.toString() : "";
                    let currentLen = cellValue.length;

                    // Si es un header (Fila 4) y es muy largo, lo limitamos
                    if (rowIdx === 4 && currentLen > 15) currentLen = 15;

                    if (currentLen > maxLength) maxLength = currentLen;
                  });

                  // Ajustes específicos por contenido conocido
                  let finalWidth = maxLength + 3;

                  // Columna # (índice 0)
                  if (colIdx === 0) finalWidth = 6;
                  // Apellido y Nombre (índice 1 y 2)
                  else if (colIdx === 1 || colIdx === 2) {
                    if (finalWidth > 25) finalWidth = 25;
                    if (finalWidth < 15) finalWidth = 15;
                  }
                  // Otras columnas
                  else {
                    if (finalWidth > 20) finalWidth = 20;
                    if (finalWidth < 12) finalWidth = 12;
                  }

                  column.width = finalWidth;
                });
              };

              // Crear hoja de Excel
              const ws = workbook.addWorksheet('Entregas', {
                pageSetup: {
                  paperSize: 9, // A4
                  orientation: 'landscape',
                  fitToPage: true,
                  fitToWidth: 1,
                  fitToHeight: 0,
                  margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 }
                },
                headerFooter: standardFooter
              });

              // Insertar 3 filas al inicio para el encabezado informativo
              ws.spliceRows(1, 0, [], [], []);
              ws.getRow(1).height = 25;
              ws.getRow(2).height = 35;

              // Encabezados de datos
              const headers = ['#', 'Apellido', 'Nombre', 'Fecha Entrega', 'Calificación', 'Estado', 'Comentario'];
              const headerRow = ws.addRow(headers);

              // Estilos de encabezados
              headerRow.eachCell((cell) => {
                cell.style = {
                  font: { bold: true, color: { argb: 'FFFFFF' }, size: 11 },
                  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0284C7' } },
                  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                  border: {
                    top: { style: 'thin' },
                    bottom: { style: 'thin' },
                    left: { style: 'thin' },
                    right: { style: 'thin' }
                  }
                };
              });
              headerRow.height = 30;

              // Datos
              entregas.forEach((e, index) => {
                const rowData = [
                  index + 1,
                  e.estudiante_apellido,
                  e.estudiante_nombre,
                  new Date(e.fecha_entrega).toLocaleString('es-EC', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }),
                  e.calificacion !== null ? e.calificacion : '-',
                  e.calificacion !== null ? 'Calificada' : 'Pendiente',
                  e.comentario || 'Sin comentario'
                ];

                const row = ws.addRow(rowData);

                row.eachCell((cell, colNumber) => {
                  cell.border = {
                    top: { style: 'thin', color: { argb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
                    left: { style: 'thin', color: { argb: 'E5E7EB' } },
                    right: { style: 'thin', color: { argb: 'E5E7EB' } }
                  };
                  cell.alignment = {
                    vertical: 'middle',
                    horizontal: colNumber === 1 ? 'center' : (colNumber <= 3 ? 'left' : 'center')
                  };

                  // Formato numérico para columna # (índice)
                  if (colNumber === 1 && typeof cell.value === 'number') {
                    cell.numFmt = '0';
                  }
                  // Formato numérico para calificación
                  else if (colNumber === 5 && typeof cell.value === 'number') {
                    cell.numFmt = '0.00';
                  }
                });
              });
              // ============================================
              // SECCIÓN DE RESUMEN ESTADÍSTICO
              // ============================================

              // Agregar fila vacía de separación
              ws.addRow([]);
              ws.addRow([]);

              // Calcular estadísticas
              const totalEntregas = entregas.length;
              const calificadas = entregas.filter(e => e.calificacion !== null && e.calificacion !== undefined).length;
              const pendientes = totalEntregas - calificadas;
              const aprobadas = entregas.filter(e => (e.calificacion || 0) >= 7).length;
              const promedioGeneral = calificadas > 0
                ? (entregas.reduce((sum, e) => sum + (e.calificacion || 0), 0) / calificadas)
                : 0;

              // Título del resumen
              const tituloResumen = ws.addRow(['RESUMEN ESTADÍSTICO']);
              ws.mergeCells(tituloResumen.number, 1, tituloResumen.number, 7);
              tituloResumen.getCell(1).style = {
                font: { bold: true, color: { argb: 'FFFFFF' }, size: 12 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '0369A1' } },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                  top: { style: 'thin' },
                  bottom: { style: 'thin' },
                  left: { style: 'thin' },
                  right: { style: 'thin' }
                }
              };
              tituloResumen.height = 25;

              // Datos del resumen
              const datosResumen = [
                ['Total de Entregas', totalEntregas],
                ['Tareas Calificadas', calificadas],
                ['Tareas Pendientes de Calificar', pendientes],
                ['Tareas Aprobadas (≥7.0)', aprobadas],
                ['Promedio General', promedioGeneral > 0 ? promedioGeneral : '-']
              ];

              datosResumen.forEach((dato) => {
                const row = ws.addRow(['', dato[0], dato[1]]);

                // Estilo para la etiqueta (columna B)
                row.getCell(2).style = {
                  font: { bold: true, size: 10 },
                  alignment: { horizontal: 'left', vertical: 'middle' },
                  border: {
                    top: { style: 'thin', color: { argb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
                    left: { style: 'thin', color: { argb: 'E5E7EB' } },
                    right: { style: 'thin', color: { argb: 'E5E7EB' } }
                  }
                };

                // Estilo para el valor (columna C)
                row.getCell(3).style = {
                  font: { bold: true, size: 11, color: { argb: '0284C7' } },
                  alignment: { horizontal: 'center', vertical: 'middle' },
                  border: {
                    top: { style: 'thin', color: { argb: 'E5E7EB' } },
                    bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
                    left: { style: 'thin', color: { argb: 'E5E7EB' } },
                    right: { style: 'thin', color: { argb: 'E5E7EB' } }
                  }
                };

                // Formato numérico para el promedio
                if (dato[0] === 'Promedio General' && typeof row.getCell(3).value === 'number') {
                  row.getCell(3).numFmt = '0.00';
                }
              });

              // ============================================
              // CONFIGURACIÓN FINAL DE ENCABEZADOS SUPERIORES (Merge Dinámico)
              // ============================================
              const totalCols = headers.length;
              if (totalCols > 0) {
                // Fila 1: Título
                ws.mergeCells(1, 1, 1, totalCols);
                const cellTitle = ws.getCell(1, 1);
                cellTitle.value = `ANÁLISIS DE ENTREGAS - ${tareaInfo?.titulo || 'Tarea'}`;
                cellTitle.font = { bold: true, size: 12, color: { argb: 'FF1E40AF' }, name: 'Calibri' };
                cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };
                cellTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } };

                // Fila 2: Info Docente y Curso
                ws.mergeCells(2, 1, 2, totalCols);
                const cellInfo = ws.getCell(2, 1);
                cellInfo.value = `Docente: ${nombreDocente} | Curso: ${tareaInfo?.curso_nombre || ''} | Módulo: ${tareaInfo?.modulo_nombre || ''}`;
                cellInfo.font = { size: 10, name: 'Calibri' };
                cellInfo.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cellInfo.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
              }

              ajustarAnchoColumnas(ws);

              // Limpiar nombres para el archivo
              const limpiarNombre = (texto: string) => {
                return texto
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-zA-Z0-9]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_|_$/g, '');
              };

              const cursoNombre = limpiarNombre(tareaInfo?.curso_nombre || 'Curso');
              const moduloNombre = limpiarNombre(tareaInfo?.modulo_nombre || 'Modulo');
              const tareaNombre = limpiarNombre(tareaInfo?.titulo || 'Tarea');
              const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' });

              // Generar y descargar
              const buffer = await workbook.xlsx.writeBuffer();
              const nombreArchivo = `Entregas_${cursoNombre}_${moduloNombre}_${tareaNombre}_${fecha}.xlsx`;

              const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              });
              saveAs(blob, nombreArchivo);

              showToast.success('Archivo Excel descargado', darkMode);
            } catch (error) {
              console.error('Error generando Excel:', error);
              showToast.error('Error al generar el Excel', darkMode);
            }
          }}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '700',
            fontSize: '0.875rem',
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.25)';
          }}
        >
          <Table2 size={18} strokeWidth={2.5} />
          Descargar Excel
        </button>
      </div>

      {/* Tarjetas de Estadísticas Compactas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.5rem',
        marginBottom: '0.75rem'
      }}>
        {/* Total Estudiantes */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users size={14} color="#fff" />
            </div>
            <div>
              <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: 0, fontWeight: '600' }}>
                Estudiantes
              </p>
              <h2 style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {stats.total}
              </h2>
            </div>
          </div>
        </div>

        {/* Calificadas */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileCheck size={14} color="#fff" />
            </div>
            <div>
              <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: 0, fontWeight: '600' }}>
                Calificadas
              </p>
              <h2 style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {stats.calificadas}
              </h2>
            </div>
          </div>
        </div>

        {/* Pendientes */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={14} color="#fff" />
            </div>
            <div>
              <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: 0, fontWeight: '600' }}>
                Pendientes
              </p>
              <h2 style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {stats.pendientes}
              </h2>
            </div>
          </div>
        </div>

        {/* Promedio */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={14} color="#fff" />
            </div>
            <div>
              <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: 0, fontWeight: '600' }}>
                Promedio
              </p>
              <h2 style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {stats.promedio}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y Detalles Compactos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        {/* Progreso de Calificación */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ color: 'var(--docente-text-primary)', fontSize: '0.8rem', fontWeight: '700', margin: 0 }}>
              Progreso
            </h3>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.75rem' }}>Completado</span>
              <span style={{ color: 'var(--docente-accent)', fontSize: '0.85rem', fontWeight: '700' }}>
                {stats.porcentajeCompletado}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--docente-input-bg)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${stats.porcentajeCompletado}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '6px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{
              background: 'var(--docente-bg)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              border: '1px solid var(--docente-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <TrendingUp size={12} style={{ color: '#06b6d4' }} />
                <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem' }}>Máxima</span>
              </div>
              <p style={{ color: '#06b6d4', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {Number(stats.notaMaxima || 0).toFixed(2)}
              </p>
            </div>

            <div style={{
              background: 'var(--docente-bg)',
              borderRadius: '0.375rem',
              padding: '0.5rem',
              border: '1px solid var(--docente-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <Award size={12} style={{ color: '#60a5fa' }} />
                <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem' }}>Mínima</span>
              </div>
              <p style={{ color: '#60a5fa', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
                {Number(stats.notaMinima || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de Entregas */}
        <div style={{
          background: 'var(--docente-card-bg)',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--docente-border)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <h3 style={{ color: 'var(--docente-text-primary)', fontSize: '0.8rem', fontWeight: '700', margin: 0 }}>
              Estado
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Entregadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.75rem' }}>Entregadas</span>
                <span style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: '700' }}>
                  {stats.entregadas} ({stats.total > 0 ? Math.round((stats.entregadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.entregadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #06b6d4 0%, #0891b2 100%)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>

            {/* Atrasadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.75rem' }}>Atrasadas</span>
                <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: '700' }}>
                  {stats.atrasadas} ({stats.total > 0 ? Math.round((stats.atrasadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.atrasadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>

            {/* No Entregadas */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--docente-text-secondary)', fontSize: '0.75rem' }}>Sin Entregar</span>
                <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: '700' }}>
                  {stats.noEntregadas} ({stats.total > 0 ? Math.round((stats.noEntregadas / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${stats.total > 0 ? (stats.noEntregadas / stats.total) * 100 : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la Tarea */}
      {/* Información de la Tarea Compacta */}
      <div style={{
        background: 'var(--docente-card-bg)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        border: '1px solid var(--docente-border)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <h3 style={{ color: 'var(--docente-text-primary)', fontSize: '0.8rem', fontWeight: '700', margin: 0 }}>
            Detalles
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
          <div style={{
            background: 'var(--docente-bg)',
            borderRadius: '0.375rem',
            padding: '0.3rem 0.5rem',
            border: '1px solid var(--docente-border)'
          }}>
            <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: '0 0 0.1rem 0', fontWeight: '500' }}>
              Nota Máxima
            </p>
            <p style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
              {Number(tareaInfo?.nota_maxima || 10).toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'var(--docente-bg)',
            borderRadius: '0.375rem',
            padding: '0.3rem 0.5rem',
            border: '1px solid var(--docente-border)'
          }}>
            <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: '0 0 0.1rem 0', fontWeight: '500' }}>
              Ponderación
            </p>
            <p style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
              {Number(tareaInfo?.ponderacion || 1).toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'var(--docente-bg)',
            borderRadius: '0.375rem',
            padding: '0.3rem 0.5rem',
            border: '1px solid var(--docente-border)'
          }}>
            <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: '0 0 0.1rem 0', fontWeight: '500' }}>
              Min. Aprobación
            </p>
            <p style={{ color: 'var(--docente-text-primary)', fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>
              {Number(tareaInfo?.nota_minima_aprobacion || 7).toFixed(2)}
            </p>
          </div>

          <div style={{
            background: 'var(--docente-bg)',
            borderRadius: '0.375rem',
            padding: '0.3rem 0.5rem',
            border: '1px solid var(--docente-border)'
          }}>
            <p style={{ color: 'var(--docente-text-secondary)', fontSize: '0.65rem', margin: '0 0 0.1rem 0', fontWeight: '500' }}>
              Estado
            </p>
            <p style={{
              color: stats.colorEstado,
              fontSize: '0.9rem',
              fontWeight: '800',
              margin: 0
            }}>
              {stats.estadoTarea}
            </p>
          </div>
        </div>
      </div>

      {/* Animaciones y transiciones */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Transiciones suaves para cambios de tema */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default AnalisisEntregas;
