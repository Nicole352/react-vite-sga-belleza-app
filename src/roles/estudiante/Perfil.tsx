import React, { useState, useEffect } from 'react';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  FileText,
  Award,
  BookOpen,
  Star,
  TrendingUp,
  Activity,
  Clock,
  GraduationCap
} from 'lucide-react';

const API_BASE = 'http://localhost:3000/api';

interface PerfilProps {
  darkMode: boolean;
}

const Perfil: React.FC<PerfilProps> = ({ darkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('informacion');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para información del estudiante (simulado)
  const [studentInfo, setStudentInfo] = useState({
    nombre: 'Ana María',
    apellido: 'González Rodríguez',
    email: 'ana.gonzalez@sgabelleza.edu.ec',
    telefono: '+593 99 123 4567',
    cedula: '1234567890',
    direccion: 'Av. Principal 123, Quito, Ecuador',
    fechaNacimiento: '1995-03-15',
    genero: 'femenino',
    fechaIngreso: '2023-09-01',
    carrera: 'Cosmetología y Belleza Integral',
    semestre: '4to Semestre',
    promedio: 8.7,
    estado: 'Activo',
    foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=200&h=200&fit=crop&crop=face'
  });

  const [editedInfo, setEditedInfo] = useState({ ...studentInfo });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Cargar perfil real del estudiante desde API
  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` } as any;

        // Intentos de endpoints comunes
        const endpoints = [
          `${API_BASE}/estudiantes/me`,
          `${API_BASE}/usuarios/me`,
          `${API_BASE}/auth/me`,
          `${API_BASE}/perfil`
        ];

        let data: any | null = null;
        for (const url of endpoints) {
          try {
            const res = await fetch(url, { headers });
            if (res.ok) { data = await res.json(); break; }
          } catch {}
        }
        if (!data) return;

        // Mapeo tolerante de campos
        const nombre = (data.nombres ?? data.nombre ?? '').toString().trim() || studentInfo.nombre;
        const apellido = (data.apellidos ?? data.apellido ?? '').toString().trim() || studentInfo.apellido;
        const email = (data.email ?? data.correo ?? '').toString().trim() || studentInfo.email;
        const telefono = (data.telefono ?? data.celular ?? data.telefono_contacto ?? '').toString().trim() || studentInfo.telefono;
        const cedula = (data.cedula ?? data.identificacion ?? data.dni ?? '').toString().trim() || studentInfo.cedula;
        const direccion = (data.direccion ?? data.domicilio ?? '').toString().trim() || studentInfo.direccion;
        const fechaNacimiento = (data.fecha_nacimiento ?? data.nacimiento ?? '').toString().slice(0,10) || studentInfo.fechaNacimiento;
        const genero = (data.genero ?? data.sexo ?? '').toString().trim() || studentInfo.genero;
        const fechaIngreso = (data.fecha_ingreso ?? data.created_at ?? '').toString().slice(0,10) || studentInfo.fechaIngreso;
        const carrera = (data.carrera ?? data.programa ?? data.curso ?? '').toString().trim() || studentInfo.carrera;
        const semestre = (data.semestre ?? data.periodo ?? '').toString().trim() || studentInfo.semestre;
        const promedio = Number(data.promedio ?? data.promedio_general ?? studentInfo.promedio);
        const estado = (data.estado ?? data.activo ? 'Activo' : 'Inactivo') || studentInfo.estado;
        const foto = (data.foto_url ?? data.avatar ?? data.foto ?? '').toString().trim() || studentInfo.foto;

        setStudentInfo(prev => ({
          ...prev,
          nombre, apellido, email, telefono, cedula, direccion,
          fechaNacimiento, genero, fechaIngreso, carrera, semestre,
          promedio: isNaN(promedio) ? prev.promedio : promedio,
          estado, foto
        }));
      } catch {}
    };
    loadPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para obtener colores según el tema
  const getThemeColors = () => {
    if (darkMode) {
      return {
        cardBg: 'rgba(255, 255, 255, 0.05)',
        textPrimary: '#fff',
        textSecondary: 'rgba(255,255,255,0.8)',
        textMuted: 'rgba(255,255,255,0.7)',
        border: 'rgba(251, 191, 36, 0.1)',
        accent: '#fbbf24',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6'
      };
    } else {
      return {
        cardBg: 'rgba(255, 255, 255, 0.8)',
        textPrimary: '#1e293b',
        textSecondary: 'rgba(30,41,59,0.8)',
        textMuted: 'rgba(30,41,59,0.7)',
        border: 'rgba(251, 191, 36, 0.2)',
        accent: '#f59e0b',
        success: '#059669',
        warning: '#d97706',
        danger: '#dc2626',
        info: '#2563eb'
      };
    }
  };

  const theme = getThemeColors();

  const tabs = [
    { id: 'informacion', name: 'Información Personal', icon: User },
    { id: 'academico', name: 'Historial Académico', icon: BookOpen },
    { id: 'certificados', name: 'Certificados', icon: Award },
    { id: 'seguridad', name: 'Seguridad', icon: Lock }
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditedInfo({ ...studentInfo });
  };

  const handleSave = () => {
    setStudentInfo({ ...editedInfo });
    setIsEditing(false);
    // Aquí iría la llamada al API para guardar los cambios
  };

  const handleCancel = () => {
    setEditedInfo({ ...studentInfo });
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = () => {
    // Aquí iría la lógica para cambiar la contraseña
    console.log('Cambiar contraseña', passwordData);
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Datos académicos simulados
  const academicHistory = [
    {
      periodo: '2023-2024 Semestre 1',
      materias: [
        { nombre: 'Anatomía y Fisiología', creditos: 4, calificacion: 9.2 },
        { nombre: 'Química Cosmética', creditos: 3, calificacion: 8.8 },
        { nombre: 'Técnicas Básicas de Belleza', creditos: 5, calificacion: 9.0 },
        { nombre: 'Atención al Cliente', creditos: 2, calificacion: 8.5 }
      ]
    },
    {
      periodo: '2024-2024 Semestre 2',
      materias: [
        { nombre: 'Cosmetología Avanzada', creditos: 5, calificacion: 8.7 },
        { nombre: 'Técnicas Faciales', creditos: 4, calificacion: 9.1 },
        { nombre: 'Maquillaje Profesional', creditos: 4, calificacion: 8.9 },
        { nombre: 'Dermatología Estética', creditos: 3, calificacion: 8.3 }
      ]
    }
  ];

  const certificates = [
    {
      id: 1,
      nombre: 'Certificado de Técnicas Básicas de Belleza',
      fecha: '2024-01-15',
      estado: 'Completado',
      tipo: 'Académico'
    },
    {
      id: 2,
      nombre: 'Certificación en Maquillaje Profesional',
      fecha: '2024-03-20',
      estado: 'En progreso',
      tipo: 'Especialización'
    },
    {
      id: 3,
      nombre: 'Diploma de Cosmetología Integral',
      fecha: 'Pendiente',
      estado: 'Pendiente',
      tipo: 'Título'
    }
  ];

  return (
    <div style={{
      transform: isVisible ? 'translateY(0)' : 'translateY(-30px)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Header */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Foto de perfil */}
          <div style={{ position: 'relative' }}>
            <img 
              src={studentInfo.foto}
              alt={`${studentInfo.nombre} ${studentInfo.apellido}`}
              style={{ 
                width: '72px', 
                height: '72px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                boxShadow: `0 6px 16px ${theme.accent}30`
              }}
            />
            <button style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: theme.accent,
              border: 'none',
              color: darkMode ? '#000' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 3px 8px ${theme.accent}40`
            }}>
              <Camera size={12} />
            </button>
          </div>

          {/* Información básica */}
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '1.1rem', 
              fontWeight: '800', 
              color: theme.textPrimary, 
              margin: '0 0 4px 0' 
            }}>
              {studentInfo.nombre} {studentInfo.apellido}
            </h1>
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.85rem', 
              margin: '0 0 6px 0' 
            }}>
              {studentInfo.carrera} - {studentInfo.semestre}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '0.8rem',
              color: theme.textMuted,
              flexWrap: 'wrap'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={12} />
                {studentInfo.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={12} />
                {studentInfo.estado}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={12} />
                Promedio: {studentInfo.promedio}/10
              </span>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{
              background: darkMode ? `${theme.success}20` : `${theme.success}10`,
              border: `1px solid ${theme.success}30`,
              borderRadius: '8px',
              padding: '8px',
              textAlign: 'center',
              minWidth: '100px'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.success }}>
                {studentInfo.promedio}
              </div>
              <div style={{ fontSize: '0.72rem', color: theme.textMuted }}>
                Promedio
              </div>
            </div>
            <div style={{
              background: darkMode ? `${theme.info}20` : `${theme.info}10`,
              border: `1px solid ${theme.info}30`,
              borderRadius: '8px',
              padding: '8px',
              textAlign: 'center',
              minWidth: '100px'
            }}>
              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: theme.info }}>
                2
              </div>
              <div style={{ fontSize: '0.72rem', color: theme.textMuted }}>
                Semestres
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pestañas */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        padding: '10px',
        marginBottom: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 10px',
                  background: isActive ? theme.accent : 'transparent',
                  color: isActive ? (darkMode ? '#000' : '#fff') : theme.textSecondary,
                  border: isActive ? 'none' : `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.accent + '20';
                    e.currentTarget.style.color = theme.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.textSecondary;
                  }
                }}
              >
                <Icon size={14} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de las pestañas */}
      <div style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: '10px',
        padding: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: darkMode ? '0 12px 24px rgba(0, 0, 0, 0.25)' : '0 12px 24px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Información Personal */}
        {activeTab === 'informacion' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: theme.textPrimary, margin: 0 }}>
                Información Personal
              </h2>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  style={{
                    background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
                    color: darkMode ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit3 size={18} />
                  Editar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleSave}
                    style={{
                      background: `linear-gradient(135deg, ${theme.success}, #059669)`,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Save size={18} />
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: 'transparent',
                      color: theme.textMuted,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {/* Campos de información */}
              {[
                { key: 'nombre', label: 'Nombre', icon: User, type: 'text' },
                { key: 'apellido', label: 'Apellido', icon: User, type: 'text' },
                { key: 'email', label: 'Email', icon: Mail, type: 'email', disabled: true },
                { key: 'telefono', label: 'Teléfono', icon: Phone, type: 'tel' },
                { key: 'cedula', label: 'Cédula', icon: FileText, type: 'text', disabled: true },
                { key: 'direccion', label: 'Dirección', icon: MapPin, type: 'text' },
                { key: 'fechaNacimiento', label: 'Fecha de Nacimiento', icon: Calendar, type: 'date' }
              ].map((field) => {
                const Icon = field.icon;
                const value = isEditing ? editedInfo[field.key as keyof typeof editedInfo] : studentInfo[field.key as keyof typeof studentInfo];
                
                return (
                  <div key={field.key}>
                    <label style={{
                      display: 'block',
                      color: theme.textSecondary,
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      <Icon size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={value as string}
                      onChange={(e) => isEditing && handleInputChange(field.key, e.target.value)}
                      disabled={field.disabled || !isEditing}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: (field.disabled || !isEditing) 
                          ? (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)')
                          : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)'),
                        border: `1px solid ${theme.border}`,
                        borderRadius: '8px',
                        color: field.disabled ? theme.textMuted : theme.textPrimary,
                        fontSize: '1rem',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historial Académico */}
        {activeTab === 'academico' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 32px 0' }}>
              Historial Académico
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {academicHistory.map((periodo, index) => (
                <div key={index} style={{
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: theme.textPrimary,
                    margin: '0 0 16px 0'
                  }}>
                    {periodo.periodo}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {periodo.materias.map((materia, materiaIndex) => (
                      <div key={materiaIndex} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto auto auto',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '12px',
                        background: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ color: theme.textPrimary, fontWeight: '600' }}>
                          {materia.nombre}
                        </span>
                        <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                          {materia.creditos} créditos
                        </span>
                        <span style={{
                          color: materia.calificacion >= 9 ? theme.success :
                                 materia.calificacion >= 8 ? theme.warning : theme.danger,
                          fontSize: '1rem',
                          fontWeight: '700'
                        }}>
                          {materia.calificacion}/10
                        </span>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: materia.calificacion >= 9 ? theme.success :
                                     materia.calificacion >= 8 ? theme.warning : theme.danger
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificados */}
        {activeTab === 'certificados' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 32px 0' }}>
              Certificados y Títulos
            </h2>
            
            <div style={{ display: 'grid', gap: '20px' }}>
              {certificates.map((cert) => (
                <div key={cert.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '24px',
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: `${theme.accent}20`,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Award size={24} color={theme.accent} />
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: theme.textPrimary,
                        margin: '0 0 4px 0'
                      }}>
                        {cert.nombre}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                          {cert.tipo}
                        </span>
                        <span style={{ color: theme.textMuted, fontSize: '0.9rem' }}>
                          {cert.fecha}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: cert.estado === 'Completado' ? `${theme.success}20` :
                                 cert.estado === 'En progreso' ? `${theme.warning}20` : `${theme.textMuted}20`,
                      color: cert.estado === 'Completado' ? theme.success :
                             cert.estado === 'En progreso' ? theme.warning : theme.textMuted
                    }}>
                      {cert.estado}
                    </div>
                    
                    {cert.estado === 'Completado' && (
                      <button style={{
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
                        color: darkMode ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Download size={16} />
                        Descargar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seguridad */}
        {activeTab === 'seguridad' && (
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: theme.textPrimary, margin: '0 0 32px 0' }}>
              Configuración de Seguridad
            </h2>
            
            <div style={{ display: 'grid', gap: '24px', maxWidth: '600px' }}>
              <div style={{
                padding: '24px',
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${theme.border}`,
                borderRadius: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: theme.textPrimary,
                      margin: '0 0 4px 0'
                    }}>
                      Cambiar Contraseña
                    </h3>
                    <p style={{
                      color: theme.textMuted,
                      fontSize: '0.9rem',
                      margin: 0
                    }}>
                      Actualiza tu contraseña para mantener tu cuenta segura
                    </p>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.warning})`,
                      color: darkMode ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Lock size={18} />
                    Cambiar
                  </button>
                </div>

                {showChangePassword && (
                  <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        color: theme.textSecondary,
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Contraseña Actual
                      </label>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 50px 12px 12px',
                          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          color: theme.textPrimary,
                          fontSize: '1rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(10%)',
                          background: 'none',
                          border: 'none',
                          color: theme.textMuted,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        color: theme.textSecondary,
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Nueva Contraseña
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 50px 12px 12px',
                          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          color: theme.textPrimary,
                          fontSize: '1rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(10%)',
                          background: 'none',
                          border: 'none',
                          color: theme.textMuted,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <label style={{
                        display: 'block',
                        color: theme.textSecondary,
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '8px'
                      }}>
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 50px 12px 12px',
                          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          color: theme.textPrimary,
                          fontSize: '1rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(10%)',
                          background: 'none',
                          border: 'none',
                          color: theme.textMuted,
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button
                        onClick={handleChangePassword}
                        disabled={!passwordData.currentPassword || !passwordData.newPassword || 
                                 passwordData.newPassword !== passwordData.confirmPassword}
                        style={{
                          background: `linear-gradient(135deg, ${theme.success}, #059669)`,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          opacity: (!passwordData.currentPassword || !passwordData.newPassword || 
                                   passwordData.newPassword !== passwordData.confirmPassword) ? 0.5 : 1
                        }}
                      >
                        <CheckCircle size={18} />
                        Actualizar Contraseña
                      </button>
                      <button
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        style={{
                          background: 'transparent',
                          color: theme.textMuted,
                          border: `1px solid ${theme.border}`,
                          borderRadius: '8px',
                          padding: '12px 24px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Información adicional de seguridad */}
              <div style={{
                padding: '20px',
                background: darkMode ? `${theme.info}15` : `${theme.info}10`,
                border: `1px solid ${theme.info}30`,
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <AlertCircle size={20} color={theme.info} />
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: theme.textPrimary,
                    margin: 0
                  }}>
                    Consejos de Seguridad
                  </h4>
                </div>
                <ul style={{
                  color: theme.textSecondary,
                  fontSize: '0.9rem',
                  margin: 0,
                  paddingLeft: '20px'
                }}>
                  <li>Usa una contraseña de al menos 8 caracteres</li>
                  <li>Incluye mayúsculas, minúsculas, números y símbolos</li>
                  <li>No compartas tu contraseña con nadie</li>
                  <li>Cambia tu contraseña regularmente</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
