import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface MiHorarioProps {
  darkMode: boolean;
}

interface Horario {
  id_asignacion: number;
  curso_nombre: string;
  codigo_curso: string;
  aula_nombre: string;
  aula_ubicacion: string;
  hora_inicio: string;
  hora_fin: string;
  dias: string;
}

const MiHorario: React.FC<MiHorarioProps> = ({ darkMode }) => {
  const { isMobile } = useBreakpoints();
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [loading, setLoading] = useState(true);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchHorario();
  }, []);

  const fetchHorario = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE}/api/docentes/mi-horario`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHorarios(data);
      } else {
        console.error('Error al cargar horario');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Estilos usando variables CSS del tema docente
  const theme = {
    bg: darkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.5)",
    textPrimary: "var(--docente-text-primary)",
    textSecondary: "var(--docente-text-secondary)",
    textMuted: "var(--docente-text-muted)",
    border: "var(--docente-border)",
    cardBg: "var(--docente-card-bg)",
    accent: "var(--docente-accent)",
    success: "#10b981",
    warning: "#f59e0b",
  };

  const diasAbreviados = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Generar horas del día (7 AM - 7 PM)
  const horasDelDia = Array.from({ length: 13 }, (_, i) => i + 7); // 7 a 19

  // Organizar horarios por día
  const horariosPorDia = diasSemana.map((dia, index) => ({
    dia,
    diaAbreviado: diasAbreviados[index],
    clases: horarios.filter(h => h.dias.split(',').map(d => d.trim()).includes(dia))
  }));

  // Función para calcular la posición y altura de una clase en la grilla
  const getClasePosition = (horaInicio: string, horaFin: string) => {
    const [horaI, minI] = horaInicio.split(':').map(Number);
    const [horaF, minF] = horaFin.split(':').map(Number);

    const inicioEnMinutos = (horaI * 60) + minI;
    const finEnMinutos = (horaF * 60) + minF;
    const baseMinutos = 7 * 60; // 7 AM

    // Offset para que no se corte la hora 7
    const offsetTop = 15;

    const top = (((inicioEnMinutos - baseMinutos) / 60) * 36) + offsetTop;
    const height = ((finEnMinutos - inicioEnMinutos) / 60) * 36;

    return { top, height };
  };

  const coloresClases = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 2rem", flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: theme.textSecondary, fontSize: "0.75rem", fontWeight: '600', margin: 0 }}>
          Cargando horario...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: theme.textPrimary,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          Mi Horario Semanal
        </h2>
        <p
          style={{
            color: theme.textSecondary,
            fontSize: "0.75rem",
            margin: 0,
            marginTop: "0.1rem",
          }}
        >
          Visualiza tu calendario de clases
        </p>
      </div>

      {/* Tabla de Horario Tipo Calendario */}
      <div className="responsive-table-container" style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '0.5rem',
        padding: '0.5rem',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        overflowX: 'auto',
        flex: 1
      }}>
        <div style={{ minWidth: isMobile ? '600px' : '100%' }}>
          {/* Header con días de la semana */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3rem repeat(7, 1fr)',
            gap: '1px',
            marginBottom: '1px'
          }}>
            <div style={{ padding: '0.5rem' }}></div>
            {horariosPorDia.map(({ dia, diaAbreviado }) => (
              <div
                key={dia}
                style={{
                  padding: '0.4rem 0.25rem',
                  background: darkMode
                    ? `linear-gradient(to bottom, ${theme.cardBg}, rgba(255,255,255,0.02))`
                    : `linear-gradient(to bottom, #f8fafc, #f1f5f9)`,
                  borderRadius: '0.375rem 0.375rem 0 0',
                  textAlign: 'center',
                  borderBottom: 'none'
                }}
              >
                <div style={{
                  color: theme.accent,
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  marginBottom: '2px'
                }}>
                  {isMobile ? diaAbreviado : dia}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horarios */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '3rem repeat(7, 1fr)',
            gap: '1px',
            position: 'relative',
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}>
            {/* Columna de horas */}
            {/* Columna de horas */}
            <div style={{ background: theme.cardBg, paddingTop: '15px' }}>
              {horasDelDia.map(hora => (
                <div
                  key={hora}
                  style={{
                    height: '36px',
                    padding: '0 0.5rem 0 0',
                    display: 'flex',
                    alignItems: 'start', // Alinear al inicio (top) de la celda
                    justifyContent: 'flex-end',
                    color: theme.textMuted,
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    transform: 'translateY(-0.4em)' // Ajuste para alinear con la línea
                  }}
                >
                  {hora}:00
                </div>
              ))}
            </div>

            {/* Columnas de días */}
            {horariosPorDia.map(({ dia, clases }, diaIndex) => (
              <div
                key={dia}
                style={{
                  position: 'relative',
                  background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  border: `0.0625rem solid ${theme.border}`,
                  borderRadius: diaIndex === 0 ? '0 0 0 0.75em' : diaIndex === 6 ? '0 0 0.75em 0' : '0'
                }}
              >
                {/* Líneas de hora */}
                {horasDelDia.map((hora, index) => (
                  <div
                    key={hora}
                    style={{
                      position: 'absolute',
                      top: `${(index * 36) + 15}px`,
                      left: 0,
                      right: 0,
                      height: '36px',
                      borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`
                    }}
                  />
                ))}

                {/* Bloques de clases */}
                {clases.map((clase, index) => {
                  const { top, height } = getClasePosition(clase.hora_inicio, clase.hora_fin);
                  const color = coloresClases[index % coloresClases.length];

                  return (
                    <div
                      key={clase.id_asignacion}
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        left: '2px', // gap horizontal muy pequeño
                        right: '2px',
                        height: `${height - 2}px`, // gap vertical pequeño
                        background: `linear-gradient(135deg, ${color}cc, ${color}99)`,
                        borderRadius: '0.375rem',
                        padding: '0.35rem',
                        overflow: 'hidden',
                        boxShadow: `0 2px 4px ${color}30`,
                        border: `1px solid ${color}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        zIndex: 1
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.zIndex = '10';
                        e.currentTarget.style.boxShadow = `0 4px 8px ${color}50`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.zIndex = '1';
                        e.currentTarget.style.boxShadow = `0 2px 4px ${color}30`;
                      }}
                    >
                      <div style={{ color: '#fff', fontSize: '0.6rem', fontWeight: '700', marginBottom: '0.1rem', opacity: 0.9 }}>
                        {clase.hora_inicio.substring(0, 5)} - {clase.hora_fin.substring(0, 5)}
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '700', lineHeight: 1.1, marginBottom: '0.2rem', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                        {clase.curso_nombre}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}>
                        <MapPin size={10} />
                        {clase.aula_nombre}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiHorario;
