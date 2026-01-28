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
          est.apellido.toLowerCase().includes(term) ||
          (est.identificacion && est.identificacion.toLowerCase().includes(term)),
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
  };


  const descargarExcel = async () => {
    try {
      setDownloadingExcel(true);
      const token = sessionStorage.getItem("auth_token");
      if (!token) {
        showToast.error("No se encontró el token de autenticación", darkMode);
        return;
      }

      const response = await fetch(`${API_BASE}/api/calificaciones/curso/${cursoId}/excel`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar el reporte');
      }

      const blob = await response.blob();

      // Obtener el nombre del archivo del header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Calificaciones_${(cursoNombre || 'Curso').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast.success('Reporte descargado correctamente', darkMode);

    } catch (error) {
      console.error("Error descargando Excel:", error);
      showToast.error('Error al descargar el reporte Excel', darkMode);
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
    bg: darkMode ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
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
              e.currentTarget.style.background = darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(59, 130, 246, 0.05)';
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
                background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.08)',
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
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.02)",
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
                            {(() => {
                              // Agrupar tareas por categoría para calcular pesos individuales
                              const tasksByCategory = tareasFiltradas.reduce((acc: any, t) => {
                                const key = t.categoria_nombre || 'Sin Categoría';
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(t);
                                return acc;
                              }, {});

                              return tareasFiltradas.map((tarea) => {
                                // Calcular peso individual de esta tarea
                                const categoryTasks = tasksByCategory[tarea.categoria_nombre || 'Sin Categoría'] || [];
                                const categoryWeight = tarea.categoria_ponderacion || 0;
                                const individualWeight = categoryTasks.length > 0 ? categoryWeight / categoryTasks.length : 0;

                                return (
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
                                        color: theme.textMuted,
                                        fontWeight: "500",
                                        marginTop: "0.1rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.2rem"
                                      }}
                                    >
                                      <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M12 3v18" />
                                        <path d="M3 12h18" />
                                        <path d="M8 8l-4 4 4 4" />
                                        <path d="M16 8l4 4-4 4" />
                                      </svg>
                                      {individualWeight.toFixed(2)}
                                    </div>
                                  </th>
                                );
                              });
                            })()}
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
                              background: darkMode ? '#262626' : '#f8fafc',
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
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.02)",
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
                                ? "rgba(255, 255, 255, 0.05)"
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
                              background: darkMode ? '#262626' : '#f8fafc',
                              zIndex: 9,
                              borderRight: `1px solid ${theme.border}`
                            }}
                          >
                            <div>
                              {estudiante.apellido}, {estudiante.nombre}
                            </div>
                            {estudiante.identificacion && (
                              <div style={{
                                fontSize: '0.65rem',
                                color: theme.textMuted,
                                fontWeight: '500',
                                marginTop: '0.1rem'
                              }}>
                                ID: {estudiante.identificacion}
                              </div>
                            )}
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
                                  ? "rgba(255, 255, 255, 0.03)"
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
