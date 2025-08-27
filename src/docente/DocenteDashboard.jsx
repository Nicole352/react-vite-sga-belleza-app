import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  FileText,
  Eye,
  Edit3,
  Bell,
  MessageCircle
} from 'lucide-react';

const DocenteDashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Datos simulados del docente
  const docenteInfo = {
    nombre: 'Dra. María Elena Vásquez',
    especialidad: 'Cosmetología Avanzada',
    email: 'maria.vasquez@sgabelleza.edu.ec',
    cursosActivos: 3,
    totalEstudiantes: 45,
    calificacion: 4.9,
    foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
  };

  // Cursos asignados
  const cursosAsignados = [
    {
      id: 1,
      nombre: 'Cosmetología Avanzada',
      codigo: 'COS-301',
      estudiantes: 18,
      aprobados: 14,
      reprobados: 2,
      enProgreso: 2,
      promedioGeneral: 8.5,
      ultimaActividad: 'Hace 2 horas',
      color: '#10b981'
    },
    {
      id: 2,
      nombre: 'Técnicas Faciales Básicas',
      codigo: 'TEC-201',
      estudiantes: 15,
      aprobados: 12,
      reprobados: 1,
      enProgreso: 2,
      promedioGeneral: 7.8,
      ultimaActividad: 'Hace 4 horas',
      color: '#3b82f6'
    },
    {
      id: 3,
      nombre: 'Dermaplaning Profesional',
      codigo: 'DER-401',
      estudiantes: 12,
      aprobados: 8,
      reprobados: 1,
      enProgreso: 3,
      promedioGeneral: 8.9,
      ultimaActividad: 'Hace 1 día',
      color: '#8b5cf6'
    }
  ];

  // Actividades pendientes por revisar
  const actividadesPendientes = [
    {
      id: 1,
      curso: 'Cosmetología Avanzada',
      actividad: 'Examen Práctico Final',
      pendientes: 5,
      fechaLimite: '2024-01-20',
      tipo: 'Examen',
      prioridad: 'alta'
    },
    {
      id: 2,
      curso: 'Técnicas Faciales Básicas',
      actividad: 'Proyecto Caso Clínico',
      pendientes: 3,
      fechaLimite: '2024-01-18',
      tipo: 'Proyecto',
      prioridad: 'media'
    },
    {
      id: 3,
      curso: 'Dermaplaning Profesional',
      actividad: 'Evaluación Práctica',
      pendientes: 2,
      fechaLimite: '2024-01-25',
      tipo: 'Práctica',
      prioridad: 'baja'
    }
  ];

  // Estudiantes con actividad reciente
  const estudiantesRecientes = [
    {
      id: 1,
      nombre: 'Ana García',
      curso: 'Cosmetología Avanzada',
      ultimoAcceso: 'Hace 30 min',
      estado: 'online',
      calificacion: 9.2,
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre: 'Carlos Mendoza',
      curso: 'Técnicas Faciales',
      ultimoAcceso: 'Hace 1 hora',
      estado: 'offline',
      calificacion: 8.7,
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre: 'María Rodríguez',
      curso: 'Dermaplaning',
      ultimoAcceso: 'Hace 2 horas',
      estado: 'offline',
      calificacion: 7.8,
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, delay = 0 }) => (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.9)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${delay}ms`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(251, 191, 36, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5)';
      }}
    >
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        animation: `shimmer 3s ease-in-out infinite`,
        animationDelay: `${delay + 1000}ms`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: `0 8px 25px ${color}40`
        }}>
          <Icon size={24} />
        </div>
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: trend > 0 ? '#10b981' : '#ef4444',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <TrendingUp size={16} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const CourseCard = ({ curso, index }) => (
    <div
      style={{
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(251, 191, 36, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        opacity: isVisible ? 1 : 0,
        transitionDelay: `${600 + (index * 100)}ms`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{
          background: `${curso.color}20`,
          color: curso.color,
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '0.8rem',
          fontWeight: '600'
        }}>
          {curso.codigo}
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
          {curso.estudiantes} estudiantes
        </div>
      </div>
      
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
        {curso.nombre}
      </h3>
      
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CheckCircle size={14} color="#10b981" />
          {curso.aprobados} aprobados
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={14} color="#ef4444" />
          {curso.reprobados} reprobados
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={14} color="#f59e0b" />
          {curso.enProgreso} en progreso
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
          Última actividad: {curso.ultimaActividad}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={14} color="#fbbf24" />
          <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: '600' }}>
            {curso.promedioGeneral}/10
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.1;
            }
            50% {
              transform: translateY(-20px) rotate(180deg);
              opacity: 0.3;
            }
          }
          
          .floating-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
          }
          
          .particle {
            position: absolute;
            background: #fbbf24;
            border-radius: 50%;
            opacity: 0.1;
            animation: float 6s ease-in-out infinite;
          }
          
          .gradient-text {
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}
      </style>

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
          position: 'relative',
          overflow: 'hidden',
          padding: '32px 24px',
          fontFamily: 'Montserrat, sans-serif'
        }}
      >
        {/* Partículas flotantes */}
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${Math.random() * 3 + 4}s`
              }}
            />
          ))}
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          
          {/* Header de Bienvenida */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.08))',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img 
                src={docenteInfo.foto}
                alt={docenteInfo.nombre}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)'
                }}
              />
              <div>
                <h1 style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: '800', 
                  color: '#fff', 
                  margin: '0 0 8px 0' 
                }}>
                  ¡Bienvenida, Dra. Vásquez! 👋
                </h1>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1.1rem', 
                  margin: '0 0 4px 0' 
                }}>
                  {docenteInfo.especialidad}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={16} />
                    {docenteInfo.cursosActivos} cursos activos
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={16} />
                    {docenteInfo.totalEstudiantes} estudiantes
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} />
                    {docenteInfo.calificacion}/5.0
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '24px', 
            marginBottom: '40px' 
          }}>
            <StatCard 
              title="Cursos Activos" 
              value={docenteInfo.cursosActivos} 
              icon={BookOpen} 
              color="#3b82f6" 
              trend={15}
              subtitle="Este semestre"
              delay={200}
            />
            <StatCard 
              title="Total Estudiantes" 
              value={docenteInfo.totalEstudiantes} 
              icon={Users} 
              color="#10b981" 
              trend={8}
              subtitle="En todos los cursos"
              delay={300}
            />
            <StatCard 
              title="Calificación Docente" 
              value={`${docenteInfo.calificacion}/5.0`} 
              icon={Star} 
              color="#fbbf24" 
              trend={5}
              subtitle="Evaluación estudiantes"
              delay={400}
            />
            <StatCard 
              title="Por Revisar" 
              value="10" 
              icon={AlertCircle} 
              color="#ef4444" 
              subtitle="Actividades pendientes"
              delay={500}
            />
          </div>

          {/* Grid principal: Cursos y Actividades */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            
            {/* Cursos Activos */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: '600ms'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '24px' 
              }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  Mis Cursos Activos
                </h2>
                <button style={{
                  background: 'transparent',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Ver todos
                  <ChevronRight size={16} />
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cursosAsignados.map((curso, index) => (
                  <CourseCard key={curso.id} curso={curso} index={index} />
                ))}
              </div>
            </div>

            {/* Panel lateral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Actividades Pendientes */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '700ms'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '20px' 
                }}>
                  <div style={{
                    background: '#ef4444',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertCircle size={18} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                    Por Revisar
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {actividadesPendientes.map((actividad, index) => (
                    <div 
                      key={actividad.id} 
                      style={{
                        padding: '16px',
                        background: actividad.prioridad === 'alta' ? 'rgba(239, 68, 68, 0.1)' :
                                   actividad.prioridad === 'media' ? 'rgba(245, 158, 11, 0.1)' :
                                   'rgba(59, 130, 246, 0.1)',
                        border: `1px solid ${actividad.prioridad === 'alta' ? 'rgba(239, 68, 68, 0.3)' :
                                                actividad.prioridad === 'media' ? 'rgba(245, 158, 11, 0.3)' :
                                                'rgba(59, 130, 246, 0.3)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: `translateX(${isVisible ? '0' : '30px'})`,
                        opacity: isVisible ? 1 : 0,
                        transitionDelay: `${800 + (index * 100)}ms`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        marginBottom: '8px' 
                      }}>
                        <span style={{
                          background: actividad.prioridad === 'alta' ? '#ef4444' :
                                     actividad.prioridad === 'media' ? '#f59e0b' : '#3b82f6',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {actividad.pendientes} pendientes
                        </span>
                        <span style={{ 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          fontSize: '0.8rem' 
                        }}>
                          {actividad.tipo}
                        </span>
                      </div>
                      
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        color: '#fff', 
                        margin: '0 0 4px 0' 
                      }}>
                        {actividad.actividad}
                      </h4>
                      
                      <p style={{ 
                        fontSize: '0.85rem', 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        margin: '0 0 8px 0' 
                      }}>
                        {actividad.curso}
                      </p>
                      
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: actividad.prioridad === 'alta' ? '#ef4444' :
                               actividad.prioridad === 'media' ? '#f59e0b' : '#3b82f6',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Calendar size={12} />
                        Vence: {actividad.fechaLimite}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estudiantes Recientes */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
                transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: '900ms'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '20px' 
                }}>
                  <div style={{
                    background: '#10b981',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={18} color="#fff" />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                    Actividad Reciente
                  </h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {estudiantesRecientes.map((estudiante, index) => (
                    <div 
                      key={estudiante.id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        transform: `translateX(${isVisible ? '0' : '30px'})`,
                        opacity: isVisible ? 1 : 0,
                        transitionDelay: `${1000 + (index * 100)}ms`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                    >
                      <img 
                        src={estudiante.foto}
                        alt={estudiante.nombre}
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          objectFit: 'cover' 
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}>
                          <h4 style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: '600', 
                            color: '#fff', 
                            margin: 0 
                          }}>
                            {estudiante.nombre}
                          </h4>
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: estudiante.estado === 'online' ? '#10b981' : '#6b7280'
                          }} />
                        </div>
                        <p style={{ 
                          fontSize: '0.8rem', 
                          color: 'rgba(255, 255, 255, 0.7)', 
                          margin: '0 0 4px 0' 
                        }}>
                          {estudiante.curso}
                        </p>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          fontSize: '0.75rem'
                        }}>
                          <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {estudiante.ultimoAcceso}
                          </span>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: '#fbbf24'
                          }}>
                            <Star size={12} />
                            {estudiante.calificacion}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '20px',
            padding: '32px',
            marginTop: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDelay: '1200ms'
          }}>
            <h2 style={{ 
              fontSize: '1.6rem', 
              fontWeight: '700', 
              color: '#fff', 
              margin: '0 0 24px 0',
              textAlign: 'center'
            }}>
              Acciones Rápidas
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px' 
            }}>
              {[
                { icon: FileText, label: 'Crear Evaluación', color: '#3b82f6' },
                { icon: Eye, label: 'Ver Calificaciones', color: '#10b981' },
                { icon: Edit3, label: 'Editar Curso', color: '#f59e0b' },
                { icon: Bell, label: 'Enviar Notificación', color: '#8b5cf6' },
                { icon: MessageCircle, label: 'Mensajes', color: '#ef4444' },
                { icon: Award, label: 'Generar Certificados', color: '#fbbf24' }
              ].map((action, index) => (
                <button
                  key={index}
                  style={{
                    background: `linear-gradient(135deg, ${action.color}20, ${action.color}10)`,
                    border: `1px solid ${action.color}40`,
                    borderRadius: '12px',
                    padding: '16px',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transform: `translateY(${isVisible ? '0' : '20px'})`,
                    opacity: isVisible ? 1 : 0,
                    transitionDelay: `${1300 + (index * 100)}ms`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${action.color}30, ${action.color}20)`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 25px ${action.color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${action.color}20, ${action.color}10)`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <action.icon size={24} color={action.color} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocenteDashboard;