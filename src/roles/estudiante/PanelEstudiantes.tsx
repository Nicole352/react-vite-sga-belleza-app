import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  User,
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
  MessageCircle,
  Upload,
  Download,
  Camera,
  Settings,
  Lock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Target,
  Activity,
  BarChart3,
  PieChart,
  UserCheck,
  Plus,
  X,
  Search,
  Filter
} from 'lucide-react';

const PanelEstudiantes = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('cursos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Datos del estudiante actual (simulado)
  const estudianteInfo = {
    nombre: 'Ana María González',
    email: 'ana.gonzalez@sgabelleza.edu.ec',
    cedula: '1234567890',
    curso: 'Cosmetología Avanzada',
    semestre: '4to Semestre',
    promedio: 8.7,
    foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=150&h=150&fit=crop&crop=face',
    telefono: '+593 99 123 4567',
    direccion: 'Av. Principal 123, Quito'
  };

  // Cursos asignados al estudiante
  const cursosAsignados = [
    {
      id: 1,
      nombre: 'Cosmetología Avanzada',
      codigo: 'COS-301',
      profesor: 'Dra. María Vásquez',
      progreso: 75,
      calificacion: 8.5,
      proximaClase: '2024-01-20 14:00',
      tareasPendientes: 2,
      color: '#10b981'
    },
    {
      id: 2,
      nombre: 'Técnicas Faciales',
      codigo: 'TEC-201',
      profesor: 'Dr. Carlos Mendoza',
      progreso: 60,
      calificacion: 9.0,
      proximaClase: '2024-01-22 10:00',
      tareasPendientes: 1,
      color: '#3b82f6'
    },
    {
      id: 3,
      nombre: 'Maquillaje Profesional',
      codigo: 'MAQ-401',
      profesor: 'Lic. Sofia Herrera',
      progreso: 90,
      calificacion: 8.8,
      proximaClase: '2024-01-25 16:00',
      tareasPendientes: 0,
      color: '#8b5cf6'
    }
  ];

  // Compañeros de clase
  const companeros = [
    {
      id: 1,
      nombre: 'Carlos Mendoza',
      curso: 'Cosmetología Avanzada',
      estado: 'online',
      promedio: 8.2,
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre: 'María Rodríguez',
      curso: 'Cosmetología Avanzada',
      estado: 'offline',
      promedio: 7.8,
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre: 'Sofia Herrera',
      curso: 'Técnicas Faciales',
      estado: 'online',
      promedio: 9.1,
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face'
    }
  ];

  // Calificaciones por materia
  const calificaciones = [
    {
      materia: 'Cosmetología Avanzada',
      evaluaciones: [
        { nombre: 'Examen Parcial 1', nota: 8.5, fecha: '2024-01-10', tipo: 'Examen' },
        { nombre: 'Práctica Facial', nota: 9.0, fecha: '2024-01-15', tipo: 'Práctica' },
        { nombre: 'Proyecto Final', nota: 8.0, fecha: '2024-01-18', tipo: 'Proyecto' }
      ]
    },
    {
      materia: 'Técnicas Faciales',
      evaluaciones: [
        { nombre: 'Evaluación Teórica', nota: 9.2, fecha: '2024-01-12', tipo: 'Examen' },
        { nombre: 'Caso Clínico', nota: 8.8, fecha: '2024-01-16', tipo: 'Caso' }
      ]
    }
  ];

  // Funciones para manejar archivos
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      alert(`Archivo "${file.name}" seleccionado para subir`);
    }
  };

  const handleSubmitTask = (cursoId) => {
    if (selectedFile) {
      alert(`Tarea enviada para el curso ${cursoId} con el archivo: ${selectedFile.name}`);
      setSelectedFile(null);
    } else {
      alert('Por favor selecciona un archivo antes de enviar la tarea');
    }
  };

  // Componente de pestañas
  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      style={{
        padding: '12px 24px',
        background: isActive ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'transparent',
        color: isActive ? '#000' : 'rgba(255,255,255,0.7)',
        border: isActive ? 'none' : '1px solid rgba(251, 191, 36, 0.2)',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'Montserrat, sans-serif'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)';
          e.currentTarget.style.color = '#fbbf24';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
        }
      }}
    >
      <Icon size={18} />
      {label}
    </button>
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
                src={estudianteInfo.foto}
                alt={estudianteInfo.nombre}
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
                  ¡Bienvenida, {estudianteInfo.nombre}! 👋
                </h1>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  fontSize: '1.1rem', 
                  margin: '0 0 4px 0' 
                }}>
                  {estudianteInfo.curso} - {estudianteInfo.semestre}
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
                    {cursosAsignados.length} cursos activos
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={16} />
                    Promedio: {estudianteInfo.promedio}/10
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={16} />
                    Estudiante activo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251, 191, 36, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <TabButton
                id="cursos"
                label="Mis Cursos"
                icon={BookOpen}
                isActive={activeTab === 'cursos'}
                onClick={setActiveTab}
              />
              <TabButton
                id="participantes"
                label="Compañeros"
                icon={Users}
                isActive={activeTab === 'participantes'}
                onClick={setActiveTab}
              />
              <TabButton
                id="calificaciones"
                label="Calificaciones"
                icon={BarChart3}
                isActive={activeTab === 'calificaciones'}
                onClick={setActiveTab}
              />
              <TabButton
                id="perfil"
                label="Mi Perfil"
                icon={User}
                isActive={activeTab === 'perfil'}
                onClick={setActiveTab}
              />
            </div>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'cursos' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0 0 24px 0' }}>
                Mis Cursos Asignados
              </h2>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                {cursosAsignados.map((curso, index) => (
                  <div
                    key={curso.id}
                    style={{
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(251, 191, 36, 0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
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
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            Prof. {curso.profesor}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: '0 0 8px 0' }}>
                          {curso.nombre}
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0 }}>
                          Próxima clase: {new Date(curso.proximaClase).toLocaleString()}
                        </p>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Star size={16} color="#fbbf24" />
                          <span style={{ color: '#fbbf24', fontSize: '1rem', fontWeight: '600' }}>
                            {curso.calificacion}/10
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                          Progreso: {curso.progreso}%
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${curso.progreso}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${curso.color}, ${curso.color}dd)`,
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Tareas pendientes y acciones */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {curso.tareasPendientes > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <AlertCircle size={16} color="#ef4444" />
                            <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '600' }}>
                              {curso.tareasPendientes} tarea{curso.tareasPendientes > 1 ? 's' : ''} pendiente{curso.tareasPendientes > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {curso.tareasPendientes === 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle size={16} color="#10b981" />
                            <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                              Al día con las tareas
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => {
                            setModalType('upload');
                            setShowModal(true);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Upload size={16} />
                          Subir Tarea
                        </button>
                        
                        <button
                          style={{
                            background: 'transparent',
                            color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Eye size={16} />
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal para subir archivos */}
          {showModal && modalType === 'upload' && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '500px',
                width: '100%',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                    Subir Tarea
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'block', 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '0.9rem', 
                    fontWeight: '600', 
                    marginBottom: '12px' 
                  }}>
                    Seleccionar archivo (PDF, DOC, JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  />
                  {selectedFile && (
                    <p style={{ 
                      color: '#10b981', 
                      fontSize: '0.8rem', 
                      margin: '8px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle size={16} />
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleSubmitTask(1);
                      setShowModal(false);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Enviar Tarea
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Participantes */}
          {activeTab === 'participantes' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0 0 24px 0' }}>
                Compañeros de Clase
              </h2>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {companeros.map((companero) => (
                  <div
                    key={companero.id}
                    style={{
                      padding: '20px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(251, 191, 36, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img 
                      src={companero.foto}
                      alt={companero.nombre}
                      style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff', margin: 0 }}>
                          {companero.nombre}
                        </h3>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: companero.estado === 'online' ? '#10b981' : '#6b7280'
                        }} />
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: companero.estado === 'online' ? '#10b981' : '#6b7280',
                          fontWeight: '600'
                        }}>
                          {companero.estado === 'online' ? 'En línea' : 'Desconectado'}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0 0 8px 0' }}>
                        {companero.curso}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Star size={14} color="#fbbf24" />
                        <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: '600' }}>
                          Promedio: {companero.promedio}/10
                        </span>
                      </div>
                    </div>
                    <button
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageCircle size={14} />
                      Mensaje
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pestaña Calificaciones */}
          {activeTab === 'calificaciones' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0 0 24px 0' }}>
                Mis Calificaciones
              </h2>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                {calificaciones.map((materia, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '24px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(251, 191, 36, 0.1)'
                    }}
                  >
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: '0 0 16px 0' }}>
                      {materia.materia}
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {materia.evaluaciones.map((evaluacion, evalIndex) => (
                        <div
                          key={evalIndex}
                          style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#fff', margin: '0 0 4px 0' }}>
                              {evaluacion.nombre}
                            </h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                background: evaluacion.tipo === 'Examen' ? '#ef4444' :
                                           evaluacion.tipo === 'Práctica' ? '#10b981' :
                                           evaluacion.tipo === 'Proyecto' ? '#3b82f6' : '#f59e0b',
                                color: '#fff',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                {evaluacion.tipo}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                {new Date(evaluacion.fecha).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontSize: '1.5rem',
                              fontWeight: '700',
                              color: evaluacion.nota >= 8 ? '#10b981' :
                                     evaluacion.nota >= 7 ? '#f59e0b' : '#ef4444',
                              marginBottom: '4px'
                            }}>
                              {evaluacion.nota}/10
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: evaluacion.nota >= 8 ? '#10b981' :
                                     evaluacion.nota >= 7 ? '#f59e0b' : '#ef4444',
                              fontWeight: '600'
                            }}>
                              {evaluacion.nota >= 8 ? 'Excelente' :
                               evaluacion.nota >= 7 ? 'Bueno' : 'Necesita mejorar'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#fff', fontWeight: '600' }}>
                        Promedio de la materia:
                      </span>
                      <span style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: '700' }}>
                        {(materia.evaluaciones.reduce((acc, evaluacion) => acc + evaluacion.nota, 0) / materia.evaluaciones.length).toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pestaña Perfil */}
          {activeTab === 'perfil' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251, 191, 36, 0.2)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', margin: '0 0 24px 0' }}>
                Mi Perfil
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
                {/* Foto de perfil */}
                <div style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(251, 191, 36, 0.1)',
                  textAlign: 'center'
                }}>
                  <img 
                    src={estudianteInfo.foto}
                    alt={estudianteInfo.nombre}
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      marginBottom: '16px',
                      boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)'
                    }}
                  />
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <Camera size={16} />
                    Cambiar Foto
                  </button>
                </div>

                {/* Información personal */}
                <div style={{
                  padding: '24px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  border: '1px solid rgba(251, 191, 36, 0.1)'
                }}>
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={estudianteInfo.nombre}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        Email Institucional
                      </label>
                      <input
                        type="email"
                        value={estudianteInfo.email}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={estudianteInfo.telefono}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ 
                        display: 'block', 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '0.9rem', 
                        fontWeight: '600', 
                        marginBottom: '8px' 
                      }}>
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={estudianteInfo.direccion}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Settings size={16} />
                        Guardar Cambios
                      </button>
                      
                      <button
                        style={{
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Lock size={16} />
                        Cambiar Contraseña
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PanelEstudiantes;