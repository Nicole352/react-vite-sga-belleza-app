import React, { useState, useEffect } from 'react';
import { X, Download, Award } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCalificaciones();
    }
  }, [isOpen, cursoId]);

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
      setDownloading(true);

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
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(0.5rem)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.25em'
    }}>
      <div style={{
        background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '1.25em',
        maxWidth: '95vw',
        maxHeight: '90vh',
        width: '100%',
        overflow: 'hidden',
        boxShadow: darkMode
          ? '0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.8)'
          : '0 1.5625rem 3.125rem -0.75rem rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', margin: '0 0 4px 0' }}>
              📊 Calificaciones del Curso
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', margin: 0 }}>
              {cursoNombre}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={descargarPDF}
              disabled={downloading || loading}
              style={{
                background: downloading ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '10px 20px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: downloading || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!downloading && !loading) {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = downloading ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)';
              }}
            >
              <Download size={18} />
              {downloading ? 'Generando...' : 'Descargar PDF'}
            </button>
            <button
              onClick={onClose}
              disabled={downloading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: '10px',
                color: '#fff',
                cursor: downloading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }} />
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
                Cargando calificaciones...
              </p>
            </div>
          ) : (
            <div>

              {/* Tabla de calificaciones */}
              {estudiantes.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: '16px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`
                }}>
                  <Award size={48} color={darkMode ? 'rgba(255,255,255,0.3)' : '#cbd5e1'} style={{ margin: '0 auto 16px' }} />
                  <p style={{ color: darkMode ? 'rgba(255,255,255,0.7)' : '#64748b', margin: 0 }}>
                    No hay estudiantes matriculados en este curso
                  </p>
                </div>
              ) : (
                <div style={{
                  overflowX: 'auto',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                  borderRadius: '16px',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.85rem'
                  }}>
                    <thead>
                      <tr style={{
                        background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                        borderBottom: `2px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`
                      }}>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          color: darkMode ? '#fff' : '#1e293b',
                          fontWeight: '700',
                          position: 'sticky',
                          left: 0,
                          background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                          zIndex: 10
                        }}>
                          Estudiante
                        </th>
                        {tareas.map((tarea) => (
                          <th key={tarea.id_tarea} style={{
                            padding: '16px',
                            textAlign: 'center',
                            color: darkMode ? '#fff' : '#1e293b',
                            fontWeight: '700',
                            minWidth: '100px'
                          }}>
                            <div style={{ marginBottom: '4px' }}>{tarea.titulo}</div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: darkMode ? 'rgba(255,255,255,0.6)' : '#64748b',
                              fontWeight: '500'
                            }}>
                              Max: {tarea.nota_maxima}
                            </div>
                          </th>
                        ))}
                        <th style={{
                          padding: '16px',
                          textAlign: 'center',
                          color: darkMode ? '#fff' : '#1e293b',
                          fontWeight: '700',
                          background: darkMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)',
                          minWidth: '100px'
                        }}>
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map((estudiante, idx) => (
                        <tr key={estudiante.id_estudiante} style={{
                          borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                          background: idx % 2 === 0
                            ? (darkMode ? 'rgba(255,255,255,0.02)' : 'transparent')
                            : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')
                        }}>
                          <td style={{
                            padding: '16px',
                            color: darkMode ? '#fff' : '#1e293b',
                            fontWeight: '600',
                            position: 'sticky',
                            left: 0,
                            background: idx % 2 === 0
                              ? (darkMode ? 'rgba(255,255,255,0.02)' : 'transparent')
                              : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                            zIndex: 9
                          }}>
                            {estudiante.nombre} {estudiante.apellido}
                          </td>
                          {tareas.map((tarea) => {
                            const notaVal = estudiante.calificaciones[tarea.id_tarea];
                            const nota = (notaVal === null || notaVal === undefined)
                              ? null
                              : (typeof notaVal === 'number' ? notaVal : Number(notaVal));
                            const porcentaje = nota !== null && Number.isFinite(nota) ? (nota / tarea.nota_maxima) * 100 : 0;
                            const color = nota === null ? '#94a3b8'
                              : porcentaje >= 70 ? '#10b981'
                                : porcentaje >= 50 ? '#f59e0b'
                                  : '#ef4444';

                            return (
                              <td key={tarea.id_tarea} style={{
                                padding: '16px',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  display: 'inline-block',
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: `${color}20`,
                                  color: color,
                                  fontWeight: '700',
                                  fontSize: '0.9rem'
                                }}>
                                  {nota !== null && Number.isFinite(nota) ? nota.toFixed(1) : '-'}
                                </div>
                              </td>
                            );
                          })}
                          <td style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: darkMode ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.02)'
                          }}>
                            <div style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'rgba(245, 158, 11, 0.2)',
                              color: '#f59e0b',
                              fontWeight: '800',
                              fontSize: '0.95rem'
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
