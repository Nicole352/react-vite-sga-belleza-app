import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Award,
  Search,
  BarChart3,
  User,
  BookOpen,
  Table2,
  ArrowLeft,
} from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import { showToast } from "../../config/toastConfig";

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface ModalCalificacionesProps {
  darkMode: boolean;
}

interface Tarea {
  id_tarea: number;
  titulo: string;
  nota_maxima: number;
  id_modulo?: number;
  modulo_nombre?: string;
  categoria_nombre?: string;
  categoria_ponderacion?: number;
  ponderacion?: number;
}

interface Estudiante {
  id_estudiante: number;
  nombre: string;
  apellido: string;
  identificacion?: string;
  calificaciones: { [tareaId: number]: number | null };
  promedio: number;
  promedio_global?: number;
  promedios_modulos?: { [moduloNombre: string]: number };
  modulos_detalle?: ModuloDetalle[];
}

interface ModuloDetalle {
  nombre_modulo: string;
  promedio_modulo_sobre_10: number;
  aporte_al_promedio_global: number;
}

const CalificacionesCurso: React.FC<ModalCalificacionesProps> = ({ darkMode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cursoId = parseInt(id || "0");
  const [cursoNombre, setCursoNombre] = useState<string>("");
  const [cursoActual, setCursoActual] = useState<any>(null);


  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState<Estudiante[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "aprobados" | "reprobados">(
    "todos",
  );
  const [modulos, setModulos] = useState<string[]>([]);
  const [pesoPorModulo, setPesoPorModulo] = useState<number>(0);
  const [moduloActivo, setModuloActivo] = useState<string>("todos");
  const [tareasFiltradas, setTareasFiltradas] = useState<Tarea[]>([]);

  useEffect(() => {
    if (cursoId) {
      fetchCalificaciones();
    }
  }, [cursoId]);

  // Filtrar tareas cuando cambia el módulo activo
  useEffect(() => {
    if (moduloActivo === "todos") {
      setTareasFiltradas(tareas);
    } else {
      // Filtrar tareas del módulo seleccionado
      const tareasDelModulo = tareas.filter((tarea) => {
        return tarea.modulo_nombre === moduloActivo;
      });

      // Ordenar por ID de tarea (orden de creación) en lugar de alfabético
      tareasDelModulo.sort((a, b) => {
        return a.id_tarea - b.id_tarea;
      });

      setTareasFiltradas(tareasDelModulo);
    }
  }, [moduloActivo, tareas]);

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...estudiantes];

    // Aplicar búsqueda
    if (busqueda) {
      const term = busqueda.toLowerCase();
      result = result.filter(
        (est) =>
          est.nombre.toLowerCase().includes(term) ||
          est.apellido.toLowerCase().includes(term),
      );
    }

    // Aplicar filtro
    if (filtro === "aprobados") {
      result = result.filter((est) => (parseFloat(String(est.promedio_global)) || 0) >= 7); // Nota mínima de aprobación: 7.0/10
    } else if (filtro === "reprobados") {
      result = result.filter((est) => (parseFloat(String(est.promedio_global)) || 0) < 7);
    }

    // Ordenar estudiantes por apellido
    result.sort((a, b) => {
      const apellidoA = (a.apellido || '').trim().toUpperCase();
      const apellidoB = (b.apellido || '').trim().toUpperCase();
      return apellidoA.localeCompare(apellidoB, 'es');
    });

    setFilteredEstudiantes(result);
  }, [estudiantes, busqueda, filtro]);

  // Escuchar eventos de WebSocket para actualizaciones en tiempo real
  useSocket({
    calificacion_actualizada: (data: any) => {
      // Verificar si la calificación pertenece a este curso
      if (data.id_curso === cursoId) {
        showToast.success('Calificación actualizada', darkMode);

        // Recargar todas las calificaciones
        fetchCalificaciones();
      }
    },
    entrega_calificada: (data: any) => {
      // Verificar si la entrega pertenece a este curso
      if (data.id_curso === cursoId) {
        const nombreEstudiante = data.estudiante_nombre && data.estudiante_apellido
          ? `${data.estudiante_nombre} ${data.estudiante_apellido}`
          : 'Estudiante';

        showToast.success(`${nombreEstudiante} - Calificación registrada`, darkMode);

        // Recargar calificaciones
        fetchCalificaciones();
      }
    },
  });

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("auth_token");

      // Obtener información del curso
      const cursoResponse = await fetch(
        `${API_BASE}/api/cursos/${cursoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (cursoResponse.ok) {
        const cursoData = await cursoResponse.json();
        setCursoActual(cursoData);
        setCursoNombre(cursoData.nombre || `Curso ID: ${cursoId}`);
      }

      // Obtener tareas del curso
      const tareasResponse = await fetch(
        `${API_BASE}/api/cursos/${cursoId}/tareas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let tareasArr: Tarea[] = [];
      if (tareasResponse.ok) {
        try {
          const tareasJson = await tareasResponse.json();
          tareasArr = Array.isArray(tareasJson)
            ? tareasJson
            : tareasJson?.tareas || [];
        } catch (_) {
          tareasArr = [];
        }
      }

      // Obtener estudiantes del curso
      const estudiantesResponse = await fetch(
        `${API_BASE}/api/cursos/${cursoId}/estudiantes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let estudiantesArr: any[] = [];
      if (estudiantesResponse.ok) {
        try {
          const estudiantesJson = await estudiantesResponse.json();
          estudiantesArr = Array.isArray(estudiantesJson)
            ? estudiantesJson
            : estudiantesJson?.estudiantes || [];
        } catch (_) {
          estudiantesArr = [];
        }
      }

      // Obtener calificaciones
      const calificacionesResponse = await fetch(
        `${API_BASE}/api/cursos/${cursoId}/calificaciones`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let calificacionesArr: any[] = [];
      if (calificacionesResponse.ok) {
        try {
          const calificacionesJson = await calificacionesResponse.json();
          calificacionesArr = Array.isArray(calificacionesJson)
            ? calificacionesJson
            : calificacionesJson?.calificaciones || [];
        } catch (_) {
          calificacionesArr = [];
        }
      }

      // Obtener calificaciones completas con promedios por módulo y global
      const calificacionesCompletasResponse = await fetch(
        `${API_BASE}/api/calificaciones/curso/${cursoId}/completo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      let datosCompletos: any = {
        estudiantes: [],
        modulos: [],
        peso_por_modulo: 0,
      };
      if (calificacionesCompletasResponse.ok) {
        try {
          datosCompletos = await calificacionesCompletasResponse.json();
          if (datosCompletos.success) {
            setModulos(datosCompletos.modulos || []);
            setPesoPorModulo(datosCompletos.peso_por_modulo || 0);
          }
        } catch (err) {
          console.error("Error parseando calificaciones completas:", err);
        }
      } else {
        console.error(
          "-Error en respuesta del servidor:",
          calificacionesCompletasResponse.status,
        );
      }

      // Crear un mapa de estudiantes con sus promedios
      const mapaPromedios = new Map();
      if (datosCompletos.success && datosCompletos.estudiantes) {
        datosCompletos.estudiantes.forEach((est: any) => {
          mapaPromedios.set(est.id_estudiante, {
            promedio_global: parseFloat(est.promedio_global) || 0,
            promedios_modulos: est.promedios_modulos,
            modulos_detalle: est.modulos_detalle || [],
          });
        });
      }

      // Procesar estudiantes con calificaciones
      const estudiantesConCalificaciones = estudiantesArr.map((est: any) => {
        const califs: { [tareaId: number]: number | null } = {};
        let suma = 0;
        let count = 0;

        tareasArr.forEach((tarea: Tarea) => {
          const calif = calificacionesArr.find(
            (c: any) =>
              c.id_estudiante === est.id_estudiante &&
              c.id_tarea === tarea.id_tarea,
          );
          const raw = calif ? calif.nota_obtenida : null;
          const val = raw === null || raw === undefined ? 0 : Number(raw); // ← CAMBIADO: null se convierte en 0
          califs[tarea.id_tarea] = Number.isFinite(val as number)
            ? (val as number)
            : 0; // Guardar 0 

          // Siempre sumar y contar, incluso si es 0
          suma += val as number;
          count++;
        });

        // Obtener promedios del mapa
        const promediosEst = mapaPromedios.get(est.id_estudiante) || {
          promedio_global: 0,
          promedios_modulos: {},
        };

        return {
          id_estudiante: est.id_estudiante,
          nombre: est.nombre,
          apellido: est.apellido,
          identificacion: est.cedula || "N/A",
          calificaciones: califs,
          promedio: count > 0 ? suma / count : 0,
          promedio_global: parseFloat(String(promediosEst.promedio_global)) || 0,
          promedios_modulos: promediosEst.promedios_modulos,
          modulos_detalle: promediosEst.modulos_detalle || [],
        };
      });


      // Sort students alphabetically by apellido
      const sortedEstudiantes = estudiantesConCalificaciones.sort((a, b) => {
        const apellidoA = (a.apellido || '').trim().toUpperCase();
        const apellidoB = (b.apellido || '').trim().toUpperCase();
        return apellidoA.localeCompare(apellidoB, 'es');
      });

      setTareas(tareasArr);
      setEstudiantes(sortedEstudiantes);
      setTareasFiltradas(tareasArr); // Inicialmente mostrar todas
    } catch (error) {
      console.error("Error al cargar calificaciones:", error);
    } finally {
      setLoading(false);
    }
  }; const descargarExcel = async () => {
    try {
      setDownloadingExcel(true);

      const ExcelJS = await import('exceljs');
      const { saveAs } = await import('file-saver');

      const workbook = new ExcelJS.Workbook();

      const docenteStr = sessionStorage.getItem('auth_user');
      const docenteObj = docenteStr ? JSON.parse(docenteStr) : null;
      // Ajuste para manejar tanto 'nombre'/'apellido' como 'nombres'/'apellidos'
      const rawNombre = docenteObj?.nombre || docenteObj?.nombres || '';
      const rawApellido = docenteObj?.apellido || docenteObj?.apellidos || '';
      const nombreDocente = (rawApellido || rawNombre) ? `${rawApellido}, ${rawNombre}`.trim() : 'Docente';

      const standardFooter = {
        oddFooter: `&L&"-,Bold"&14Escuela de Belleza Jessica Vélez&"-,Regular"&12&RDescargado: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })} — Pág. &P de &N`
      };

      // Función auxiliar para ajustar ancho de columnas automáticamente (con límites)
      const ajustarAnchoColumnas = (worksheet: any, customOptions: { maxNameWidth?: number, maxModuleWidth?: number } = {}) => {
        worksheet.columns.forEach((column: any, colIdx: number) => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell: any, rowIdx: number) => {
            // Ignorar filas 1 y 2 (títulos dinámicos que están merged)
            if (rowIdx <= 2) return;

            const cellValue = cell.value ? cell.value.toString() : "";
            let currentLen = cellValue.length;

            // Si es un header (Fila 4-6 en Detalle, Fila 4 en Modulos) y es muy largo, lo limitamos
            // para forzar el wrapText que ya está activado.
            if (rowIdx >= 4 && rowIdx <= 6) {
              if (currentLen > 15) currentLen = 15;
            }

            if (currentLen > maxLength) maxLength = currentLen;
          });

          // Ajustes específicos por contenido conocido
          let finalWidth = maxLength + 3;

          // Si es Estadísticas, usamos lógica diferente para la primera columna
          if (worksheet.name === 'Estadísticas') {
            if (colIdx === 0) finalWidth = 40; // Columna Métrica
            else finalWidth = 15; // Columna Valor (Suficiente ya que se combinará)
          } else {
            // Columna # (índice 0)
            if (colIdx === 0) finalWidth = 6;
            // Apellido y Nombre (índice 1 y 2)
            else if (colIdx === 1 || colIdx === 2) {
              const limit = customOptions.maxNameWidth || 30;
              if (finalWidth > limit) finalWidth = limit;
              if (finalWidth < 18) finalWidth = 18;
            }
            // Columnas de datos/módulos
            else {
              const limit = customOptions.maxModuleWidth || 15;
              if (finalWidth > limit) finalWidth = limit;
              if (finalWidth < 12) finalWidth = 12;
            }
          }

          column.width = finalWidth;
        });
      };

      // ============================================
      // Hoja 1: Calificaciones por Tarea
      // ============================================
      const wsDetalle = workbook.addWorksheet('Calificaciones por Tarea', {
        pageSetup: {
          paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
          margins: { left: 0.25, right: 0.25, top: 0.3, bottom: 0.75, header: 0.1, footer: 0.3 }
        },
        headerFooter: standardFooter
      });

      // Insertar 3 filas al inicio para el encabezado informativo
      wsDetalle.spliceRows(1, 0, [], [], []);

      // Fila 1 y 2 se configurarán al final cuando sepamos el total de columnas
      const totalHeaderRow1 = wsDetalle.getRow(1);
      const totalHeaderRow2 = wsDetalle.getRow(2);

      totalHeaderRow1.height = 25;
      totalHeaderRow2.height = 35;

      // 1. Preparar datos
      const tareasPorModulo: { [modulo: string]: typeof tareas } = {};
      tareas.forEach((tarea) => {
        const moduloNombre = tarea.modulo_nombre || "Sin Módulo";
        if (!tareasPorModulo[moduloNombre]) tareasPorModulo[moduloNombre] = [];
        tareasPorModulo[moduloNombre].push(tarea);
      });

      // Ordenar tareas dentro de cada módulo por categoría
      Object.keys(tareasPorModulo).forEach(modulo => {
        tareasPorModulo[modulo].sort((a, b) => {
          const catA = a.categoria_nombre || 'Sin Categoría';
          const catB = b.categoria_nombre || 'Sin Categoría';
          if (catA === catB) return 0;
          if (catA === 'Sin Categoría') return 1;
          if (catB === 'Sin Categoría') return -1;
          return catA.localeCompare(catB);
        });
      });

      // Fila 1, 2 y 3: Encabezados modulares
      const row1 = wsDetalle.addRow(['#', 'APELLIDO', 'NOMBRE']); // Módulos
      const row2 = wsDetalle.addRow(['', '', '']); // Categorías (MERGED)
      const row3 = wsDetalle.addRow(['', '', '']); // Tareas

      // Combinar #, Apellido y Nombre (Fila 4, 5 y 6)
      wsDetalle.mergeCells(4, 1, 6, 1); // #
      wsDetalle.mergeCells(4, 2, 6, 2); // Apellido
      wsDetalle.mergeCells(4, 3, 6, 3); // Nombre

      let colIndex = 4;

      // Columnas de Tareas (Agrupadas por Módulo)
      // Usar el orden de 'modulos' (que viene del backend ordenado por ID)
      const ordenModulos = [...modulos];
      if (tareasPorModulo["Sin Módulo"]) {
        ordenModulos.push("Sin Módulo");
      }

      // Asegurar que no duplicamos y procesar solo los que tienen tareas
      const modulosConTareas = ordenModulos.filter(m => tareasPorModulo[m]);

      // Si hay módulos en 'tareasPorModulo' que no están en la lista oficial, agregarlos al final
      Object.keys(tareasPorModulo).forEach(m => {
        if (!modulosConTareas.includes(m)) {
          modulosConTareas.push(m);
        }
      });

      modulosConTareas.forEach((moduloNombre) => {
        const tareasDelModulo = tareasPorModulo[moduloNombre];

        // Escribir nombre del módulo en Fila 1
        const cellModulo = row1.getCell(colIndex);
        cellModulo.value = moduloNombre.toUpperCase();

        // Merge horizontal para el módulo en Fila 4
        if (tareasDelModulo.length > 0) {
          wsDetalle.mergeCells(4, colIndex, 4, colIndex + tareasDelModulo.length - 1);
        }

        // Agrupar por categoría para generar encabezados de Fila 2
        let currentCategory = "";
        let categoryStartCol = colIndex;
        let categoryCount = 0;
        let categoryPond = 0;

        tareasDelModulo.forEach((tarea, idx) => {
          const tareaCat = tarea.categoria_nombre || "Sin Categoría";
          const tareaPond = tarea.categoria_ponderacion || 0;

          // Si cambia la categoría o es el último elemento
          if (idx === 0) {
            currentCategory = tareaCat;
            categoryPond = tareaPond;
            categoryStartCol = colIndex + idx;
          }

          if (tareaCat !== currentCategory) {
            // Cerrar grupo anterior
            const cellCat = row2.getCell(categoryStartCol);
            cellCat.value = `CATEGORÍA: ${currentCategory.toUpperCase()} (${categoryPond} PTS)`;
            if (categoryCount > 1) {
              wsDetalle.mergeCells(5, categoryStartCol, 5, categoryStartCol + categoryCount - 1);
            }

            // Iniciar nuevo grupo
            currentCategory = tareaCat;
            categoryPond = tareaPond;
            categoryStartCol = colIndex + idx;
            categoryCount = 0;
          }

          categoryCount++;

          // Si es el último, cerrar el grupo actual
          if (idx === tareasDelModulo.length - 1) {
            const cellCat = row2.getCell(categoryStartCol);
            cellCat.value = `CATEGORÍA: ${currentCategory.toUpperCase()} (${categoryPond} PTS)`;
            if (categoryCount > 1) {
              wsDetalle.mergeCells(5, categoryStartCol, 5, categoryStartCol + categoryCount - 1);
            }
          }
        });

        // Calcular conteo de tareas por categoría para ponderación equitativa
        const conteoPorCategoria: Record<string, number> = {};
        tareasDelModulo.forEach(t => {
          const cat = t.categoria_nombre || "Sin Categoría";
          conteoPorCategoria[cat] = (conteoPorCategoria[cat] || 0) + 1;
        });

        // Escribir nombres de tareas en Fila 3
        tareasDelModulo.forEach((tarea) => {
          // Fila 3: Título Tarea
          const catNombre = tarea.categoria_nombre || "Sin Categoría";
          const catPond = tarea.categoria_ponderacion || 0;
          const numTareasEnCat = conteoPorCategoria[catNombre] || 1;

          // Calcular valor ponderado de ESTA tarea individual
          const valorTareaPonderado = numTareasEnCat > 0 ? (catPond / numTareasEnCat) : 0;

          const cellTarea = row3.getCell(colIndex);
          cellTarea.value = `${tarea.titulo.toUpperCase()} (${valorTareaPonderado.toFixed(2)})`;

          // Estilo de ponderación (opcional, podemos aplicar estilo al texto si se quiere)
          const cellPonderacion = row3.getCell(colIndex);
          cellPonderacion.font = { italic: false, size: 9, color: { argb: 'FF000000' } }; // Normalizar estilo
          cellPonderacion.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };


          colIndex++;
        });
      });

      // Estilos para headers (sin color de fondo)
      [row1, row2, row3].forEach(row => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          cell.font = { bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });
      });

      // Columnas de Promedios por Módulo
      modulos.forEach((modulo) => {
        // Escribir en Fila 1 y combinar con Fila 2
        const cellProm = row1.getCell(colIndex);
        cellProm.value = `PROMEDIO ${modulo.toUpperCase()}`;
        wsDetalle.mergeCells(4, colIndex, 6, colIndex);
        colIndex++;
      });

      // Columna Promedio Global
      const cellGlobal = row1.getCell(colIndex);
      cellGlobal.value = "PROMEDIO GLOBAL (/10PTS)";
      wsDetalle.mergeCells(4, colIndex, 6, colIndex);

      // 2. Estilos de Encabezados
      const estiloBaseHeader = {
        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true } as any,
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } as any
      };

      // Aplicar estilos a todo el rango de encabezados (Filas 4, 5 y 6) - Sin colores
      for (let r = 4; r <= 6; r++) {
        const row = wsDetalle.getRow(r);
        row.eachCell((cell, _) => {
          cell.style = {
            ...estiloBaseHeader,
            font: { bold: true, color: { argb: 'FF000000' }, size: 10, name: 'Calibri' }
          };
        });
      }

      wsDetalle.getRow(4).height = 35;
      wsDetalle.getRow(5).height = 45;
      wsDetalle.getRow(6).height = 45; // Fila de tareas individuales

      // 3. Datos de Estudiantes
      estudiantes.forEach((est, index) => {
        const rowData: any[] = [index + 1, est.apellido.toUpperCase(), est.nombre.toUpperCase()]; // Agregar índice numérico

        // Calificaciones
        modulosConTareas.forEach((moduloNombre) => {
          const tareasDelModulo = tareasPorModulo[moduloNombre];
          tareasDelModulo.forEach((tarea) => {
            const nota = est.calificaciones[tarea.id_tarea];
            rowData.push(nota !== null && Number.isFinite(nota) ? nota : "-");
          });
        });

        // Promedios Módulos
        modulos.forEach((modulo) => {
          const moduloDetalle = est.modulos_detalle?.find((m) => m.nombre_modulo === modulo);
          const promedioModulo = moduloDetalle ? parseFloat(String(moduloDetalle.promedio_modulo_sobre_10)) : 0;
          rowData.push(promedioModulo > 0 ? promedioModulo : "-");
        });

        // Promedio Global
        const promedioGlobal = est.promedio_global
          ? typeof est.promedio_global === "number"
            ? est.promedio_global
            : parseFloat(String(est.promedio_global))
          : 0;
        rowData.push(promedioGlobal);

        const row = wsDetalle.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
          cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'center' : (colNumber <= 3 ? 'left' : 'center'), wrapText: true };
          cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };

          // Formato numérico para columna # (índice)
          if (colNumber === 1 && typeof cell.value === 'number') {
            cell.numFmt = '0'; // Número entero sin decimales
          }
          // Formato numérico para calificaciones y promedios
          else if (colNumber > 3 && typeof cell.value === 'number') {
            cell.numFmt = '0.00'; // Dos decimales
          }
        });
      });

      ajustarAnchoColumnas(wsDetalle, { maxNameWidth: 30, maxModuleWidth: 15 });

      // --- CONFIGURACIÓN FINAL DE ENCABEZADOS SUPERIORES (Merge Dinámico) ---
      const totalColsDetalle = colIndex - 1;
      if (totalColsDetalle > 0) {
        // Fila 1: Título
        const safeMergeCols = Math.max(6, totalColsDetalle); // Asegurar mínimo 6 columnas para que no se corte
        wsDetalle.mergeCells(1, 1, 1, safeMergeCols);
        const cellTitle = wsDetalle.getCell(1, 1);
        cellTitle.value = `REPORTE DE CALIFICACIONES POR TAREA - ${(cursoNombre || '').toUpperCase()}`;
        cellTitle.font = { bold: true, size: 12, color: { argb: 'FF000000' }, name: 'Calibri' };
        cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };

        // Fila 2: Info Docente
        wsDetalle.mergeCells(2, 1, 2, safeMergeCols);
        const cellInfo = wsDetalle.getCell(2, 1);
        const horarioTexto = `${cursoActual?.horario.toUpperCase() || ''} ${cursoActual?.hora_inicio ? `(${cursoActual.hora_inicio.slice(0, 5)} - ${cursoActual.hora_fin?.slice(0, 5)})` : ''}`;
        cellInfo.value = `DOCENTE: ${nombreDocente.toUpperCase()} | HORARIO: ${horarioTexto}`;
        cellInfo.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
        cellInfo.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }


      // ============================================
      // Hoja 2: Promedios por Módulo
      // ============================================
      const wsModulos = workbook.addWorksheet('Promedios por Módulo', {
        pageSetup: {
          paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
          margins: { left: 0.25, right: 0.25, top: 0.3, bottom: 0.75, header: 0.1, footer: 0.3 }
        },
        headerFooter: standardFooter
      });

      // Insertar 3 filas al inicio para el encabezado informativo
      wsModulos.spliceRows(1, 0, [], [], []);
      wsModulos.getRow(1).height = 25;
      wsModulos.getRow(2).height = 35;

      const headersModulos = ['#', 'APELLIDO', 'NOMBRE', ...modulos.map(m => `${m.toUpperCase()} (/10.00PTS)`), 'PROMEDIO GLOBAL (/10PTS)'];
      const totalColsModulos = headersModulos.length;

      // Fila 1: Título Merge Dinámico
      const safeMergeColsMod = Math.max(6, totalColsModulos);
      wsModulos.mergeCells(1, 1, 1, safeMergeColsMod);
      const cellTitleMod = wsModulos.getCell(1, 1);
      cellTitleMod.value = `REPORTE DE PROMEDIOS POR MÓDULO - ${(cursoNombre || '').toUpperCase()}`;
      cellTitleMod.font = { bold: true, size: 12, color: { argb: 'FF000000' }, name: 'Calibri' };
      cellTitleMod.alignment = { horizontal: 'center', vertical: 'middle' };

      // Fila 2: Info Docente Merge Dinámico
      wsModulos.mergeCells(2, 1, 2, safeMergeColsMod);
      const cellInfoMod = wsModulos.getCell(2, 1);
      const horarioTextoMod = `${cursoActual?.horario.toUpperCase() || ''} ${cursoActual?.hora_inicio ? `(${cursoActual.hora_inicio.slice(0, 5)} - ${cursoActual.hora_fin?.slice(0, 5)})` : ''}`;
      cellInfoMod.value = `DOCENTE: ${nombreDocente.toUpperCase()} | HORARIO: ${horarioTextoMod}`;
      cellInfoMod.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
      cellInfoMod.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const rowHeaderMod = wsModulos.addRow(headersModulos);

      rowHeaderMod.eachCell((cell) => {
        cell.style = {
          font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
          alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
      });
      rowHeaderMod.height = 30; // Altura extra para encabezados largos

      estudiantes.forEach((est, index) => {
        const rowData = [index + 1, est.apellido.toUpperCase(), est.nombre.toUpperCase()]; // Agregar índice numérico
        modulos.forEach(modulo => {
          const moduloDetalle = est.modulos_detalle?.find((m) => m.nombre_modulo === modulo);
          const promedioModulo = moduloDetalle ? parseFloat(String(moduloDetalle.promedio_modulo_sobre_10)) : 0;
          rowData.push(promedioModulo > 0 ? promedioModulo : "-");
        });
        const promedioGlobal = est.promedio_global ? (typeof est.promedio_global === "number" ? est.promedio_global : parseFloat(String(est.promedio_global))) : 0;
        rowData.push(promedioGlobal);

        const row = wsModulos.addRow(rowData);
        row.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
          if (colNumber === 1) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
          else if (colNumber <= 3) cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          else cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

          cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };

          // Formato numérico para columna # (índice)
          if (colNumber === 1 && typeof cell.value === 'number') {
            cell.numFmt = '0'; // Número entero sin decimales
          }
          // Formato numérico para promedios
          else if (colNumber > 3 && typeof cell.value === 'number') {
            cell.numFmt = '0.00'; // Dos decimales
          }
        });
      });

      ajustarAnchoColumnas(wsModulos, { maxNameWidth: 30, maxModuleWidth: 15 });


      // ============================================
      // Hoja 3: Estadísticas
      // ============================================
      const wsEstadisticas = workbook.addWorksheet('Estadísticas', {
        pageSetup: {
          paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0,
          margins: { left: 0.25, right: 0.25, top: 0.3, bottom: 0.75, header: 0.1, footer: 0.3 }
        },
        headerFooter: standardFooter
      });

      // Insertar 3 filas al inicio para el encabezado informativo
      wsEstadisticas.spliceRows(1, 0, [], [], []);



      // Fila 1: Título Merge (Usamos un rango más amplio para evitar recortes)
      wsEstadisticas.mergeCells(1, 1, 1, 6);
      const cellTitleEst = wsEstadisticas.getCell(1, 1);
      cellTitleEst.value = `ESTADÍSTICAS DE CALIFICACIONES - ${(cursoNombre || '').toUpperCase()}`;
      cellTitleEst.font = { bold: true, size: 12, color: { argb: 'FF000000' }, name: 'Calibri' };
      cellTitleEst.alignment = { horizontal: 'center', vertical: 'middle' };
      wsEstadisticas.getRow(1).height = 25;

      // Fila 2: Info Docente Merge
      wsEstadisticas.mergeCells(2, 1, 2, 6);
      const cellInfoEst = wsEstadisticas.getCell(2, 1);
      const horarioTextoEst = `${cursoActual?.horario.toUpperCase() || ''} ${cursoActual?.hora_inicio ? `(${cursoActual.hora_inicio.slice(0, 5)} - ${cursoActual.hora_fin?.slice(0, 5)})` : ''}`;
      cellInfoEst.value = `DOCENTE: ${nombreDocente.toUpperCase()} | HORARIO: ${horarioTextoEst}`;
      cellInfoEst.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
      cellInfoEst.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      wsEstadisticas.getRow(2).height = 35;

      const aprobadosGlobal = estudiantes.filter((est) => (parseFloat(String(est.promedio_global)) || 0) >= 7).length;
      const reprobadosGlobal = estudiantes.length - aprobadosGlobal;
      const promedioGeneral = estudiantes.length > 0 ? (estudiantes.reduce((sum, est) => sum + est.promedio, 0) / estudiantes.length) : 0;
      const promedioGlobalCurso = estudiantes.length > 0 ? (estudiantes.reduce((sum, est) => sum + (parseFloat(String(est.promedio_global)) || 0), 0) / estudiantes.length) : 0;
      const porcentajeAprobacion = estudiantes.length > 0 ? (aprobadosGlobal / estudiantes.length) : 0;

      const datosEstadisticas = [
        ["MÉTRICA", "VALOR"],
        ["TOTAL DE ESTUDIANTES", estudiantes.length],
        ["ESTUDIANTES APROBADOS (≥7/10)", aprobadosGlobal],
        ["ESTUDIANTES REPROBADOS (<7/10)", reprobadosGlobal],
        ["PORCENTAJE DE APROBACIÓN", porcentajeAprobacion],
        ["", ""],
        ["PROMEDIO GLOBAL DEL CURSO (/10PTS)", promedioGlobalCurso],
        ["PROMEDIO GENERAL (TAREAS)", promedioGeneral],
        ["", ""],
        ["TOTAL DE TAREAS EVALUADAS", tareas.length],
        ["TOTAL DE MÓDULOS EN EL CURSO", modulos.length],
        ["PESO POR MÓDULO", (typeof pesoPorModulo === "number" ? pesoPorModulo : 0)],
        ["", ""],
        ["NOTA MÍNIMA DE APROBACIÓN", "7.0 / 10 PUNTOS"],
        ["SISTEMA DE CALIFICACIÓN", "TODOS LOS MÓDULOS TIENEN IGUAL PESO"],
      ];

      datosEstadisticas.forEach((data, index) => {
        const row = wsEstadisticas.addRow(data);
        const rowIndex = row.number;

        // Combinar columna Valor (B) con C, D, E y F para que no se corte el texto
        wsEstadisticas.mergeCells(rowIndex, 2, rowIndex, 6);

        if (index === 0) {
          row.eachCell(cell => {
            cell.style = {
              font: { bold: true, color: { argb: 'FF000000' }, size: 10, name: 'Calibri' },
              alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
              border: { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } }
            };
          });
        } else {
          row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };
            cell.alignment = { vertical: 'middle', horizontal: colNumber === 1 ? 'left' : 'center', wrapText: true };
            if (colNumber === 1) cell.font = { bold: true, size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
            else cell.font = { size: 10, name: 'Calibri', color: { argb: 'FF000000' } };
            if (data[0] === "PORCENTAJE DE APROBACIÓN" && colNumber === 2) cell.numFmt = '0.0%';
            else if (typeof cell.value === 'number') cell.numFmt = '0.00';
          });
        }
      });

      ajustarAnchoColumnas(wsEstadisticas, { maxNameWidth: 35, maxModuleWidth: 20 });

      const buffer = await workbook.xlsx.writeBuffer();
      const nombreCurso = cursoNombre.replace(/\s+/g, "_") || "Curso";
      const nombreArchivo = `Calificaciones_${nombreCurso}_${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Guayaquil' })}.xlsx`;

      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, nombreArchivo);

    } catch (error) {
      console.error("Error generando Excel:", error);
      showToast.error('Error al generar el Excel', darkMode);
    } finally {
      setDownloadingExcel(false);
    }
  };

  // Calcular estadísticas
  const calcularEstadisticas = () => {
    if (filteredEstudiantes.length === 0)
      return { total: 0, aprobados: 0, reprobados: 0, promedioGeneral: 0 };

    const aprobados = filteredEstudiantes.filter(
      (est) => (parseFloat(String(est.promedio_global)) || 0) >= 7,
    ).length;
    const reprobados = filteredEstudiantes.length - aprobados;
    const promedioGeneral =
      filteredEstudiantes.reduce((sum, est) => sum + (parseFloat(String(est.promedio_global)) || 0), 0) /
      filteredEstudiantes.length;

    return {
      total: filteredEstudiantes.length,
      aprobados,
      reprobados,
      promedioGeneral: parseFloat(promedioGeneral.toFixed(2)),
    };
  };

  const stats = calcularEstadisticas();

  // Estilos usando variables CSS del tema docente
  const theme = {
    bg: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.5)",
    modalBg: darkMode ? "var(--docente-card-bg)" : "#ffffff",
    textPrimary: "var(--docente-text-primary)",
    textSecondary: "var(--docente-text-secondary)",
    textMuted: "var(--docente-text-muted)",
    border: "var(--docente-border)",
    inputBg: "var(--docente-input-bg)",
    inputBorder: "var(--docente-border)",
    cardBg: "var(--docente-card-bg)",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    accent: "var(--docente-accent)",
    info: "var(--docente-accent)",
  };

  return (
    <>
      {/* Custom scrollbar styling for module buttons */}
      <style>
        {`
          .module-buttons-scroll::-webkit-scrollbar {
            height: 6px;
          }
          .module-buttons-scroll::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }
          .module-buttons-scroll::-webkit-scrollbar-thumb {
            background: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
            border-radius: 10px;
          }
          .module-buttons-scroll::-webkit-scrollbar-thumb:hover {
            background: ${darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
          }
        `}
      </style>

      <div
        style={{
          minHeight: '100%',
          backgroundColor: 'transparent',
          color: theme.textPrimary,
          padding: '0',
          paddingBottom: '0',
          paddingTop: '0'
        }}
      >
        {/* Botón Volver */}
        <div style={{ marginBottom: '0.5rem' }}>
          <button
            onClick={() => navigate('/panel/docente/calificaciones')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'transparent',
              border: 'none',
              color: theme.accent,
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s',
              opacity: 0.8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <ArrowLeft size={14} />
            Volver a la lista
          </button>
        </div>

        {/* Header */}
        <div style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 0.15rem 0', color: theme.textPrimary, letterSpacing: '-0.02em' }}>
              {cursoNombre || 'Calificaciones del Curso'}
            </h2>
            <p style={{ fontSize: '0.75rem', color: theme.textSecondary, margin: 0, fontWeight: '500' }}>
              Gestiona las evaluaciones y descarga reportes de rendimiento académico
            </p>
          </div>

          <button
            onClick={descargarExcel}
            disabled={downloadingExcel || loading}
            style={{
              background: downloadingExcel
                ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: 'none',
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              color: "#fff",
              cursor: downloadingExcel || loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s ease",
              fontSize: "0.875rem",
              fontWeight: "700",
              boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
              opacity: downloadingExcel || loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!downloadingExcel && !loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!downloadingExcel && !loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.25)';
              }
            }}
          >
            <Table2 size={18} strokeWidth={2.5} />
            {downloadingExcel ? "Generando..." : "Descargar Excel"}
          </button>
        </div>

        {/* Estadísticas Compactas */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.5rem",
          }}>
            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "0.5rem",
              padding: "0.45rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '0.35rem',
                borderRadius: '0.4rem',
                background: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                color: theme.accent
              }}>
                <User size={13} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.total}
                </span>
                <span style={{ fontSize: "0.65rem", color: theme.textSecondary, fontWeight: "600" }}>
                  Estudiantes
                </span>
              </div>
            </div>

            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "0.5rem",
              padding: "0.45rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '0.35rem',
                borderRadius: '0.4rem',
                background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                color: '#10b981'
              }}>
                <Award size={13} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.aprobados}
                </span>
                <span style={{ fontSize: "0.65rem", color: theme.textSecondary, fontWeight: "600" }}>
                  Aprobados
                </span>
              </div>
            </div>

            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "0.5rem",
              padding: "0.45rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '0.35rem',
                borderRadius: '0.4rem',
                background: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444'
              }}>
                <BarChart3 size={13} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.reprobados}
                </span>
                <span style={{ fontSize: "0.65rem", color: theme.textSecondary, fontWeight: "600" }}>
                  Reprobados
                </span>
              </div>
            </div>

            <div style={{
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: "0.5rem",
              padding: "0.45rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{
                padding: '0.35rem',
                borderRadius: '0.4rem',
                background: darkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.08)',
                color: '#f59e0b'
              }}>
                <BookOpen size={13} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary, lineHeight: 1 }}>
                  {stats.promedioGeneral}
                </span>
                <span style={{ fontSize: "0.65rem", color: theme.textSecondary, fontWeight: "600" }}>
                  Promedio Gral.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Título de la sección */}
        <div style={{ padding: "0", marginBottom: "1rem" }}>
          <h2 style={{
            fontSize: "1.125rem",
            fontWeight: "700",
            color: theme.textPrimary,
            margin: 0
          }}>
            Calificaciones de Estudiantes en {cursoNombre || 'Cosmetología'}
          </h2>
        </div>

        {/* Controles de filtro y búsqueda */}
        <div
          style={{
            padding: "0",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "stretch" }}>
            {/* Search input - full width on mobile */}
            <div style={{ position: "relative", width: "100%", minWidth: "9rem", maxWidth: "12rem", display: "flex", alignItems: "center" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "0",
                  bottom: "0",
                  margin: "auto",
                  display: "flex",
                  alignItems: "center",
                  color: theme.textSecondary,
                  zIndex: 1,
                  pointerEvents: "none",
                  height: "fit-content",
                }}
              />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: "2.5rem",
                  paddingRight: "0.875rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  background: theme.inputBg,
                  border: `1px solid ${theme.inputBorder}`,
                  borderRadius: "1.5rem",
                  color: theme.textPrimary,
                  fontSize: "0.875rem",
                  outline: "none",
                  lineHeight: "1.4",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--docente-accent)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(34, 197, 94, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.inputBorder;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Pestañas de Módulos - Estilo chips/pills muy compacto */}
            <div
              style={{
                display: "flex",
                gap: "0.35rem",
                overflowX: "auto",
                alignItems: "center",
                flex: "1 1 auto",
                minWidth: "0",
                paddingBottom: "0.15rem",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
              className="module-buttons-scroll"
            >
              <button
                onClick={() => setModuloActivo("todos")}
                style={{
                  padding: "0.3rem 0.65rem",
                  background:
                    moduloActivo === "todos"
                      ? `linear-gradient(135deg, ${theme.accent}, #1d4ed8)`
                      : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  border: "none",
                  borderRadius: "0.375rem",
                  color:
                    moduloActivo === "todos" ? "#fff" : theme.textSecondary,
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.1s ease-out",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={(e) => {
                  if (moduloActivo !== "todos") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (moduloActivo !== "todos") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                  }
                }}
              >
                <BookOpen size={11} />
                TODOS
              </button>

              {modulos.map((modulo, idx) => (
                <button
                  key={`tab-${idx}`}
                  onClick={() => setModuloActivo(modulo)}
                  style={{
                    padding: "0.3rem 0.65rem",
                    background:
                      moduloActivo === modulo
                        ? `linear-gradient(135deg, ${theme.accent}, #1d4ed8)`
                        : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    border: "none",
                    borderRadius: "0.375rem",
                    color:
                      moduloActivo === modulo ? "#fff" : theme.textSecondary,
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    transition: "all 0.1s ease-out",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    if (moduloActivo !== modulo) {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (moduloActivo !== modulo) {
                      e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                    }
                  }}
                >
                  {modulo}
                </button>
              ))}
            </div>

            {/* Filtros de estudiantes muy compactos */}
            <div
              style={{
                display: "flex",
                gap: "0.35rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setFiltro("todos")}
                style={{
                  padding: "0.3rem 0.65rem",
                  background:
                    filtro === "todos"
                      ? `linear-gradient(135deg, ${theme.accent}, #1d4ed8)`
                      : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  border: "none",
                  borderRadius: "0.375rem",
                  color: filtro === "todos" ? "#fff" : theme.textSecondary,
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (filtro !== "todos") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filtro !== "todos") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                  }
                }}
              >
                <User size={12} />
                Todos
              </button>

              <button
                onClick={() => setFiltro("aprobados")}
                style={{
                  padding: "0.3rem 0.65rem",
                  background:
                    filtro === "aprobados"
                      ? `linear-gradient(135deg, ${theme.accent}, #1d4ed8)`
                      : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  border: "none",
                  borderRadius: "0.375rem",
                  color: filtro === "aprobados" ? "#fff" : theme.textSecondary,
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (filtro !== "aprobados") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filtro !== "aprobados") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                  }
                }}
              >
                <Award size={12} />
                Aprobados
              </button>

              <button
                onClick={() => setFiltro("reprobados")}
                style={{
                  padding: "0.3rem 0.65rem",
                  background:
                    filtro === "reprobados"
                      ? `linear-gradient(135deg, ${theme.accent}, #1d4ed8)`
                      : (darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  border: "none",
                  borderRadius: "0.375rem",
                  color: filtro === "reprobados" ? "#fff" : theme.textSecondary,
                  cursor: "pointer",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (filtro !== "reprobados") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filtro !== "reprobados") {
                    e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
                  }
                }}
              >
                <BarChart3 size={12} />
                Reprobados
              </button>
            </div>
          </div>
        </div>



        {/* Content con estilo del admin */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "0",
            maxHeight: "calc(90vh - 200px)",
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
              <div
                style={{
                  width: "1.75rem",
                  height: "1.75rem",
                  border: `2.5px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                  borderTop: `2.5px solid ${theme.accent}`,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 0.75rem",
                }}
              />
              <p style={{ color: theme.textSecondary, fontSize: "0.75rem", fontWeight: '600', margin: 0 }}>
                Cargando datos...
              </p>
            </div>
          ) : (
            <div>
              {/* Tabla de calificaciones con estilo del admin */}
              {filteredEstudiantes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 1.5rem",
                    background: theme.cardBg,
                    borderRadius: "0.5rem",
                    border: `1px solid ${theme.border}`,
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Search size={20} color={theme.textMuted} />
                  </div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: theme.textPrimary, marginBottom: '0.25rem' }}>
                    Sin resultados
                  </h3>
                  <p style={{ color: theme.textSecondary, fontSize: '0.75rem', margin: 0 }}>
                    No hay estudiantes que coincidan con los filtros aplicados.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                    background: theme.cardBg,
                    borderRadius: "0.5rem",
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                    }}
                  >
                    <thead>
                      {moduloActivo !== "todos" ? (
                        <>
                          <tr
                            style={{
                              background: darkMode
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderBottom: `2px solid ${theme.border}`,
                            }}
                          >
                            <th
                              rowSpan={2}
                              style={{
                                padding: "0.5rem 0.75rem",
                                textAlign: "left",
                                color: theme.textPrimary,
                                fontWeight: "600",
                                background: darkMode
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.02)",
                                position: "sticky",
                                left: 0,
                                zIndex: 10,
                                borderBottom: `2px solid ${theme.border}`
                              }}
                            >
                              ESTUDIANTE
                            </th>
                            {(() => {
                              const groups = tareasFiltradas.reduce((acc: any, t) => {
                                const key = t.categoria_nombre || 'Sin Categoría';
                                const pond = t.categoria_ponderacion || 0;
                                const id = `${key}|${pond}`;
                                if (!acc[id]) acc[id] = { name: key, pond, count: 0 };
                                acc[id].count++;
                                return acc;
                              }, {});
                              return Object.values(groups).map((g: any, i) => (
                                <th
                                  key={i}
                                  colSpan={g.count}
                                  style={{
                                    padding: "0.35rem",
                                    textAlign: "center",
                                    color: theme.info,
                                    borderBottom: `1px solid ${theme.border}`,
                                    background: darkMode
                                      ? "rgba(255,255,255,0.02)"
                                      : "rgba(0,0,0,0.01)",
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <Award size={14} />
                                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{g.name}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '400', color: theme.textMuted }}>({g.pond} pts)</span>
                                  </div>
                                </th>
                              ));
                            })()}
                            <th
                              rowSpan={2}
                              style={{
                                padding: "0.35rem 0.6rem",
                                textAlign: "center",
                                color: theme.textPrimary,
                                fontWeight: "700",
                                background: darkMode
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(245, 158, 11, 0.08)",
                                minWidth: "6.25rem",
                                borderBottom: `1px solid ${theme.border}`,
                                fontSize: '0.75rem'
                              }}
                            >
                              <div style={{ marginBottom: "0.25rem" }}>
                                PROMEDIO {moduloActivo.toUpperCase()}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  color: theme.textMuted,
                                  fontWeight: "500",
                                }}
                              >
                                /10.00 pts
                              </div>
                            </th>
                          </tr>
                          <tr
                            style={{
                              background: darkMode
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.02)",
                              borderBottom: `2px solid ${theme.border}`,
                            }}
                          >
                            {tareasFiltradas.map((tarea) => (
                              <th
                                key={tarea.id_tarea}
                                style={{
                                  padding: "0.35rem 0.6rem",
                                  textAlign: "center",
                                  color: theme.textPrimary,
                                  fontWeight: "700",
                                  minWidth: "5rem",
                                  fontSize: '0.75rem'
                                }}
                              >
                                <div style={{ marginBottom: "0.15rem" }}>
                                  {tarea.titulo.toUpperCase()}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.65rem",
                                    color: theme.textSecondary,
                                    fontWeight: "500",
                                  }}
                                >
                                  /{tarea.nota_maxima}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </>
                      ) : (
                        <tr
                          style={{
                            background: darkMode
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(0,0,0,0.01)",
                            borderBottom: `1px solid ${theme.border}`,
                          }}
                        >
                          <th
                            style={{
                              padding: "0.4rem 0.6rem",
                              textAlign: "left",
                              color: theme.textPrimary,
                              fontWeight: "700",
                              background: darkMode ? '#1e293b' : '#f8fafc',
                              position: "sticky",
                              left: 0,
                              zIndex: 10,
                              fontSize: '0.75rem',
                              borderBottom: `1px solid ${theme.border}`
                            }}
                          >
                            ESTUDIANTE
                          </th>
                          {modulos.map((modulo, idx) => (
                            <th
                              key={`modulo-${idx}`}
                              style={{
                                padding: "0.4rem 0.6rem",
                                textAlign: "center",
                                color: theme.textPrimary,
                                fontWeight: "700",
                                background: darkMode
                                  ? "rgba(245, 158, 11, 0.15)"
                                  : "rgba(245, 158, 11, 0.08)",
                                minWidth: "6.25rem",
                                fontSize: '0.75rem',
                                borderBottom: `1px solid ${theme.border}`
                              }}
                            >
                              <div style={{ marginBottom: "0.15rem" }}>
                                {modulo.toUpperCase()}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.65rem",
                                  color: theme.textSecondary,
                                  fontWeight: "500",
                                }}
                              >
                                /10.00 pts
                              </div>
                            </th>
                          ))}
                          <th
                            style={{
                              padding: "0.4rem 0.6rem",
                              textAlign: "center",
                              color: theme.textPrimary,
                              fontWeight: "700",
                              background: darkMode
                                ? "rgba(59, 130, 246, 0.15)"
                                : "rgba(59, 130, 246, 0.08)",
                              minWidth: "6.25rem",
                              fontSize: '0.75rem',
                              borderBottom: `1px solid ${theme.border}`
                            }}
                          >
                            <div style={{ marginBottom: "0.15rem" }}>
                              PROMEDIO GLOBAL
                            </div>
                            <div
                              style={{
                                fontSize: "0.65rem",
                                color: theme.textSecondary,
                                fontWeight: "500",
                              }}
                            >
                              /10 pts
                            </div>
                          </th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {filteredEstudiantes.map((estudiante, idx) => (
                        <tr
                          key={estudiante.id_estudiante}
                          style={{
                            borderBottom: `1px solid ${theme.border}`,
                            background:
                              idx % 2 === 0
                                ? darkMode
                                  ? "rgba(255,255,255,0.02)"
                                  : "transparent"
                                : darkMode
                                  ? "rgba(255,255,255,0.03)"
                                  : "rgba(0,0,0,0.01)",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.35rem 0.6rem",
                              color: theme.textPrimary,
                              fontWeight: "600",
                              fontSize: '0.8125rem',
                              position: "sticky",
                              left: 0,
                              background: darkMode ? '#1e293b' : '#f8fafc',
                              zIndex: 9,
                              borderRight: `1px solid ${theme.border}`
                            }}
                          >
                            {estudiante.apellido}, {estudiante.nombre}
                          </td>
                          {moduloActivo !== "todos" && tareasFiltradas.map((tarea) => {
                            const notaVal = estudiante.calificaciones[tarea.id_tarea];
                            const nota = notaVal === null || notaVal === undefined ? null : Number(notaVal);
                            const porcentaje = nota !== null ? (nota / tarea.nota_maxima) * 100 : 0;

                            const getNotaColors = () => {
                              if (nota === null) return { bg: 'transparent', text: theme.textMuted };
                              if (porcentaje >= 70) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' };
                              if (porcentaje >= 50) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' };
                              return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' };
                            };

                            const colors = getNotaColors();

                            return (
                              <td
                                key={tarea.id_tarea}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    display: "inline-block",
                                    padding: "0.15rem 0.45rem",
                                    borderRadius: "0.3rem",
                                    background: colors.bg,
                                    color: colors.text,
                                    fontWeight: "800",
                                    fontSize: "0.8rem",
                                    minWidth: '1.75rem'
                                  }}
                                >
                                  {nota !== null ? nota.toFixed(1) : "-"}
                                </div>
                              </td>
                            );
                          })}
                          {/* Celda de Promedio del Módulo Activo (si no es "todos") */}
                          {moduloActivo !== "todos" &&
                            (() => {
                              const moduloDetalle =
                                estudiante.modulos_detalle?.find(
                                  (m) => m.nombre_modulo === moduloActivo,
                                );
                              const promedioModulo = moduloDetalle
                                ? parseFloat(
                                  String(
                                    moduloDetalle.promedio_modulo_sobre_10,
                                  ),
                                )
                                : 0;
                              const aprobado = promedioModulo >= 7;

                              return (
                                <td
                                  style={{
                                    padding: "0.25rem 0.4rem",
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "inline-block",
                                      padding: "0.15rem 0.45rem",
                                      borderRadius: "0.3rem",
                                      background: aprobado
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : "rgba(239, 68, 68, 0.15)",
                                      color: aprobado
                                        ? '#10b981'
                                        : '#ef4444',
                                      fontWeight: "800",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {promedioModulo > 0
                                      ? promedioModulo.toFixed(2)
                                      : "-"}
                                  </div>
                                </td>
                              );
                            })()}
                          {/* Celdas de Promedio por Módulo (solo en vista "todos") */}
                          {moduloActivo === "todos" &&
                            modulos.map((modulo, idx) => {
                              const moduloDetalle =
                                estudiante.modulos_detalle?.find(
                                  (m) => m.nombre_modulo === modulo,
                                );
                              const promedioModulo = moduloDetalle
                                ? parseFloat(
                                  String(
                                    moduloDetalle.promedio_modulo_sobre_10,
                                  ),
                                )
                                : 0;
                              const aprobado = promedioModulo >= 7;

                              return (
                                <td
                                  key={`modulo-${idx}-${estudiante.id_estudiante}`}
                                  style={{
                                    padding: "0.25rem 0.4rem",
                                    textAlign: "center",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "inline-block",
                                      padding: "0.15rem 0.45rem",
                                      borderRadius: "0.3rem",
                                      background: aprobado
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : "rgba(239, 68, 68, 0.15)",
                                      color: aprobado
                                        ? '#10b981'
                                        : '#ef4444',
                                      fontWeight: "800",
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {promedioModulo > 0
                                      ? promedioModulo.toFixed(2)
                                      : "-"}
                                  </div>
                                </td>
                              );
                            })}
                          {/* Celda Promedio Global (solo en vista "todos") */}
                          {moduloActivo === "todos" && (
                            <td
                              style={{
                                padding: "0.25rem 0.4rem",
                                textAlign: "center",
                                background: darkMode
                                  ? "rgba(59, 130, 246, 0.08)"
                                  : "rgba(59, 130, 246, 0.03)",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  padding: "0.15rem 0.45rem",
                                  borderRadius: "0.3rem",
                                  background: (parseFloat(String(estudiante.promedio_global)) || 0) >= 7
                                    ? "rgba(37, 99, 235, 0.15)"
                                    : "rgba(239, 68, 68, 0.15)",
                                  color: (parseFloat(String(estudiante.promedio_global)) || 0) >= 7
                                    ? (darkMode ? '#60a5fa' : '#2563eb')
                                    : '#ef4444',
                                  fontWeight: "800",
                                  fontSize: "0.8rem",
                                }}
                              >
                                {(parseFloat(String(estudiante.promedio_global)) || 0).toFixed(2)}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    </>
  );
};

export default CalificacionesCurso;
