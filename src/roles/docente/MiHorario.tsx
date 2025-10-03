import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

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

      const response = await fetch(`${API_BASE}/docentes/mi-horario`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Horario del docente:', data);
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

  const getThemeColors = () => {
    if (darkMode) {
      return {
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b'
      };
    } else {
      return {
        cardBg: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(59, 130, 246, 0.2)',
        accent: '#3b82f6',
        success: '#059669',
        warning: '#d97706'
      };
    }
  };

  const theme = getThemeColors();

  const diasAbreviados = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Generar horas del día (6 AM - 10 PM)
  const horasDelDia = Array.from({ length: 17 }, (_, i) => i + 6); // 6 a 22

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
    const baseMinutos = 6 * 60; // 6 AM
    
    const top = ((inicioEnMinutos - baseMinutos) / 60) * 80; // 80px por hora
    const height = ((finEnMinutos - inicioEnMinutos) / 60) * 80;
    
    return { top, height };
  };

  const coloresClases = [
    '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#14b8a6'
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: theme.textSecondary }}>Cargando horario...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: theme.textPrimary, margin: '0 0 8px 0' }}>
          Mi Horario Semanal
        </h2>
        <p style={{ color: theme.textMuted, fontSize: '1rem', margin: 0 }}>
          Visualiza tu calendario de clases
        </p>
      </div>

      {/* Tabla de Horario Tipo Calendario */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 20px 40px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto'
      }}>
        <div style={{ minWidth: '900px' }}>
          {/* Header con días de la semana */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '80px repeat(7, 1fr)',
            gap: '2px',
            marginBottom: '2px'
          }}>
            <div style={{ padding: '16px 8px' }}></div>
            {horariosPorDia.map(({ dia, diaAbreviado }) => (
              <div
                key={dia}
                style={{
                  padding: '16px 8px',
                  background: `linear-gradient(135deg, ${theme.accent}15, ${theme.accent}08)`,
                  borderRadius: '12px 12px 0 0',
                  textAlign: 'center',
                  border: `1px solid ${theme.border}`,
                  borderBottom: 'none'
                }}
              >
                <div style={{ 
                  color: theme.accent, 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '4px'
                }}>
                  {diaAbreviado}
                </div>
                <div style={{ color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '700' }}>
                  {dia}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horarios */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '80px repeat(7, 1fr)',
            gap: '2px',
            position: 'relative'
          }}>
            {/* Columna de horas */}
            <div>
              {horasDelDia.map(hora => (
                <div
                  key={hora}
                  style={{
                    height: '80px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    color: theme.textMuted,
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  {hora.toString().padStart(2, '0')}:00
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
                  border: `1px solid ${theme.border}`,
                  borderRadius: diaIndex === 0 ? '0 0 0 12px' : diaIndex === 6 ? '0 0 12px 0' : '0'
                }}
              >
                {/* Líneas de hora */}
                {horasDelDia.map((hora, index) => (
                  <div
                    key={hora}
                    style={{
                      position: 'absolute',
                      top: `${index * 80}px`,
                      left: 0,
                      right: 0,
                      height: '80px',
                      borderBottom: `1px dashed ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
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
                        left: '4px',
                        right: '4px',
                        height: `${height - 8}px`,
                        background: `linear-gradient(135deg, ${color}dd, ${color}bb)`,
                        borderRadius: '8px',
                        padding: '8px',
                        overflow: 'hidden',
                        boxShadow: `0 4px 12px ${color}40`,
                        border: `1px solid ${color}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.zIndex = '10';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = '1';
                      }}
                    >
                      <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: '700', marginBottom: '4px' }}>
                        {clase.hora_inicio.substring(0, 5)} - {clase.hora_fin.substring(0, 5)}
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '700', lineHeight: 1.2, marginBottom: '4px' }}>
                        {clase.curso_nombre}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} />
                        {clase.aula_nombre}
                      </div>
                      <div style={{
                        marginTop: '4px',
                        padding: '2px 6px',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#fff',
                        display: 'inline-block'
                      }}>
                        {clase.codigo_curso}
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
