import React, { useState } from 'react';
import { 
  Users, Search, Plus, Edit, Eye, Trash2, X, Building, Phone, Mail, 
  Calendar, MapPin, Shield, User, BookOpen, DollarSign, 
  TrendingUp, Award, Activity, BarChart3, GraduationCap, UserCheck,
  FileText, Download, Filter, Settings, Upload, QrCode, CreditCard,
  Clock, AlertTriangle, CheckCircle, UserPlus, Target, PieChart
} from 'lucide-react';

const PanelAdministrativos = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [administrativos, setAdministrativos] = useState([
    {
      id: 1, nombre: 'Lcda. Patricia', apellido: 'González',
      email: 'patricia.gonzalez@belleza.edu', telefono: '+58 414-123-4567',
      cargo: 'Coordinadora Académica', departamento: 'Académico',
      fechaIngreso: '2023-01-15', estado: 'activo',
      permisos: ['cursos', 'estudiantes', 'reportes']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');

  const administrativosFiltrados = administrativos.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.apellido.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || admin.estado === filterEstado;
    const matchesDepartamento = filterDepartamento === 'todos' || admin.departamento === filterDepartamento;
    return matchesSearch && matchesEstado && matchesDepartamento;
  });

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewAdmin = (admin) => {
    setSelectedAdmin(admin);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteAdmin = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este administrativo?')) {
      setAdministrativos(administrativos.filter(admin => admin.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const adminData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      cargo: formData.get('cargo'),
      departamento: formData.get('departamento'),
      fechaIngreso: formData.get('fechaIngreso'),
      estado: formData.get('estado'),
      permisos: formData.getAll('permisos')
    };

    if (modalType === 'create') {
      const newAdmin = { ...adminData, id: Math.max(...administrativos.map(a => a.id)) + 1 };
      setAdministrativos([...administrativos, newAdmin]);
    } else if (modalType === 'edit') {
      setAdministrativos(administrativos.map(admin => 
        admin.id === selectedAdmin.id ? { ...admin, ...adminData } : admin
      ));
    }
    setShowModal(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Montserrat, sans-serif',
      padding: '40px'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        backdropFilter: 'blur(20px)', borderRadius: '32px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '40px 40px 0 40px', textAlign: 'center' }}>
          <div style={{
            width: '120px', height: '120px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px auto', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
          }}>
            <UserCheck size={48} color="#fff" />
          </div>
          <h1 style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '3rem', fontWeight: '800', margin: '0 0 16px 0'
          }}>
            Panel Administrativos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0 0 40px 0' }}>
            Sistema de gestión integral para administradores
          </p>
        </div>

        {/* Navegación de pestañas */}
        <div style={{ padding: '0 40px 40px 40px' }}>
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '32px',
            flexWrap: 'wrap', justifyContent: 'center'
          }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'personal', label: 'Personal Admin', icon: Users },
              { id: 'cursos', label: 'Cursos', icon: BookOpen },
              { id: 'pagos', label: 'Pagos', icon: CreditCard },
              { id: 'matriculas', label: 'Matrículas', icon: GraduationCap },
              { id: 'profesores', label: 'Profesores', icon: UserCheck },
              { id: 'roles', label: 'Roles', icon: Shield },
              { id: 'certificados', label: 'Certificados', icon: Award },
              { id: 'reportes', label: 'Reportes', icon: FileText }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'rgba(255,255,255,0.05)',
                  border: activeTab === tab.id 
                    ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', color: '#fff', fontSize: '0.9rem',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                }}>
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenido de las pestañas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.2)', minHeight: '600px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'personal' && (
              <PersonalTab 
                administrativos={administrativos}
                administrativosFiltrados={administrativosFiltrados}
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterEstado={filterEstado} setFilterEstado={setFilterEstado}
                filterDepartamento={filterDepartamento} setFilterDepartamento={setFilterDepartamento}
                showModal={showModal} setShowModal={setShowModal}
                modalType={modalType} selectedAdmin={selectedAdmin}
                handleCreateAdmin={handleCreateAdmin} handleEditAdmin={handleEditAdmin}
                handleViewAdmin={handleViewAdmin} handleDeleteAdmin={handleDeleteAdmin}
                handleSubmit={handleSubmit}
              />
            )}
            {activeTab === 'cursos' && <CursosTab />}
            {activeTab === 'pagos' && <PagosTab />}
            {activeTab === 'matriculas' && <MatriculasTab />}
            {activeTab === 'profesores' && <ProfesoresTab />}
            {activeTab === 'roles' && <div style={{padding: '32px', color: '#fff'}}>Gestión de Roles - En desarrollo</div>}
            {activeTab === 'certificados' && <CertificadosTab />}
            {activeTab === 'reportes' && <ReportesTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard
const DashboardTab = () => {
  return (
    <div style={{ padding: '32px' }}>
      {/* Tarjetas principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Total Estudiantes */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Total Estudiantes</h3>
              <p style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>247</p>
            </div>
            <div style={{ background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <GraduationCap size={28} color="#3b82f6" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>+12%</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Cursos Activos */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Cursos Activos</h3>
              <p style={{ color: '#10b981', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>12</p>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <BookOpen size={28} color="#10b981" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>+2</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>nuevos este mes</span>
          </div>
        </div>

        {/* Ingresos Mensuales */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Ingresos Mensuales</h3>
              <p style={{ color: '#f59e0b', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>$45,280</p>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <DollarSign size={28} color="#f59e0b" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>+8.5%</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>vs mes anterior</span>
          </div>
        </div>

        {/* Certificados Emitidos */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(147, 51, 234, 0.05))',
          border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '20px', padding: '24px', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 8px 0' }}>Certificados Emitidos</h3>
              <p style={{ color: '#a855f7', fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>89</p>
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.2)', borderRadius: '12px', padding: '12px' }}>
              <Award size={28} color="#a855f7" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>+15</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>este mes</span>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Pagos Pendientes</h4>
          </div>
          <p style={{ color: '#ef4444', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>23</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>$12,450 en deuda</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <UserCheck size={20} color="#22c55e" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Profesores Activos</h4>
          </div>
          <p style={{ color: '#22c55e', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>8</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Todos asignados</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
          border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Target size={20} color="#8b5cf6" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Tasa Graduación</h4>
          </div>
          <p style={{ color: '#8b5cf6', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>87%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Último semestre</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(8, 145, 178, 0.05))',
          border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '16px', padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <PieChart size={20} color="#06b6d4" />
            <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: '600', margin: 0 }}>Ocupación Cursos</h4>
          </div>
          <p style={{ color: '#06b6d4', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>73%</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', margin: '4px 0 0 0' }}>Promedio general</p>
        </div>
      </div>

      {/* Gráfico de barras - Matrículas por mes */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '32px', marginBottom: '32px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={24} color="#ef4444" />
          Matrículas por Mes (Últimos 6 meses)
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'end', gap: '16px', height: '200px', padding: '0 16px' }}>
          {[
            { mes: 'Ago', valor: 32, altura: '60%' },
            { mes: 'Sep', valor: 28, altura: '52%' },
            { mes: 'Oct', valor: 45, altura: '85%' },
            { mes: 'Nov', valor: 38, altura: '70%' },
            { mes: 'Dic', valor: 52, altura: '100%' },
            { mes: 'Ene', valor: 41, altura: '78%' }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '100%', height: item.altura, background: `linear-gradient(180deg, #ef4444, #dc2626)`,
                borderRadius: '8px 8px 4px 4px', marginBottom: '12px', display: 'flex',
                alignItems: 'start', justifyContent: 'center', paddingTop: '8px',
                color: '#fff', fontSize: '0.8rem', fontWeight: '600'
              }}>
                {item.valor}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '600' }}>
                {item.mes}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '32px'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity size={24} color="#ef4444" />
          Actividad Reciente
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            { texto: 'Nueva matrícula: Ana García en Cosmetología Básica', tiempo: 'Hace 2 horas', icono: UserPlus, color: '#10b981' },
            { texto: 'Pago recibido: Carlos López - $350', tiempo: 'Hace 4 horas', icono: DollarSign, color: '#f59e0b' },
            { texto: 'Certificado emitido: María Rodríguez - Peluquería', tiempo: 'Hace 6 horas', icono: Award, color: '#a855f7' },
            { texto: 'Nuevo curso creado: Maquillaje Profesional', tiempo: 'Hace 1 día', icono: BookOpen, color: '#3b82f6' },
            { texto: 'Profesor asignado: Dr. Mendoza a Tratamientos Faciales', tiempo: 'Hace 2 días', icono: UserCheck, color: '#ef4444' }
          ].map((actividad, index) => {
            const IconComponent = actividad.icono;
            return (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px',
                background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{
                  background: `rgba(${actividad.color === '#10b981' ? '16, 185, 129' : 
                                    actividad.color === '#f59e0b' ? '245, 158, 11' :
                                    actividad.color === '#a855f7' ? '168, 85, 247' :
                                    actividad.color === '#3b82f6' ? '59, 130, 246' : '239, 68, 68'}, 0.2)`,
                  borderRadius: '10px', padding: '10px'
                }}>
                  <IconComponent size={20} color={actividad.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', margin: '0 0 4px 0' }}>
                    {actividad.texto}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', margin: 0 }}>
                    {actividad.tiempo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Componente Personal
const PersonalTab = ({ 
  administrativos, administrativosFiltrados, searchTerm, setSearchTerm,
  filterEstado, setFilterEstado, filterDepartamento, setFilterDepartamento,
  showModal, setShowModal, modalType, selectedAdmin,
  handleCreateAdmin, handleEditAdmin, handleViewAdmin, handleDeleteAdmin, handleSubmit
}) => {
  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 32px 0' }}>
        Gestión de Personal Administrativo
      </h2>
      <div style={{ color: '#fff' }}>Funcionalidad completa en desarrollo...</div>
    </div>
  );
};

// Componente Cursos
const CursosTab = () => {
  const [cursos, setCursos] = useState([
    {
      id: 1,
      nombre: 'Cosmetología Básica',
      descripcion: 'Curso introductorio de cosmetología y cuidado facial',
      duracion: '3 meses',
      precio: 250,
      cupos: 20,
      inscritos: 15,
      estado: 'activo',
      instructor: 'Prof. María González',
      fechaInicio: '2024-02-01',
      fechaFin: '2024-05-01',
      modalidad: 'presencial'
    },
    {
      id: 2,
      nombre: 'Peluquería Profesional',
      descripcion: 'Técnicas avanzadas de corte, peinado y coloración',
      duracion: '4 meses',
      precio: 320,
      cupos: 15,
      inscritos: 12,
      estado: 'activo',
      instructor: 'Prof. Carlos Ruiz',
      fechaInicio: '2024-01-15',
      fechaFin: '2024-05-15',
      modalidad: 'presencial'
    },
    {
      id: 3,
      nombre: 'Manicure y Pedicure',
      descripcion: 'Cuidado completo de uñas y técnicas de nail art',
      duracion: '2 meses',
      precio: 180,
      cupos: 25,
      inscritos: 20,
      estado: 'activo',
      instructor: 'Prof. Ana Martínez',
      fechaInicio: '2024-03-01',
      fechaFin: '2024-05-01',
      modalidad: 'presencial'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterModalidad, setFilterModalidad] = useState('todos');

  const cursosFiltrados = cursos.filter(curso => {
    const matchesSearch = curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || curso.estado === filterEstado;
    const matchesModalidad = filterModalidad === 'todos' || curso.modalidad === filterModalidad;
    return matchesSearch && matchesEstado && matchesModalidad;
  });

  const handleCreateCurso = () => {
    setSelectedCurso(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditCurso = (curso) => {
    setSelectedCurso(curso);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewCurso = (curso) => {
    setSelectedCurso(curso);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteCurso = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este curso?')) {
      setCursos(cursos.filter(curso => curso.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cursoData = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      duracion: formData.get('duracion'),
      precio: parseFloat(formData.get('precio')),
      cupos: parseInt(formData.get('cupos')),
      instructor: formData.get('instructor'),
      fechaInicio: formData.get('fechaInicio'),
      fechaFin: formData.get('fechaFin'),
      modalidad: formData.get('modalidad'),
      estado: formData.get('estado') || 'activo'
    };

    if (modalType === 'create') {
      const newCurso = {
        ...cursoData,
        id: Math.max(...cursos.map(c => c.id)) + 1,
        inscritos: 0
      };
      setCursos([...cursos, newCurso]);
    } else if (modalType === 'edit') {
      setCursos(cursos.map(curso => 
        curso.id === selectedCurso.id 
          ? { ...curso, ...cursoData }
          : curso
      ));
    }
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <BookOpen size={32} color="#ef4444" />
          Gestión de Cursos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra los cursos disponibles en la academia
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
            {/* Búsqueda */}
            <div style={{ position: 'relative', minWidth: '300px' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder="Buscar cursos o instructores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            {/* Filtros */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="finalizado">Finalizados</option>
            </select>

            <select
              value={filterModalidad}
              onChange={(e) => setFilterModalidad(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="todos">Todas las modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>

          {/* Botón Crear */}
          <button
            onClick={handleCreateCurso}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Lista de Cursos */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {cursosFiltrados.map(curso => (
          <div key={curso.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {curso.nombre}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 12px 0', fontSize: '0.9rem' }}>
                  {curso.descripcion}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Instructor:</strong> {curso.instructor}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Duración:</strong> {curso.duracion}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Precio:</strong> ${curso.precio}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <strong>Cupos:</strong> {curso.inscritos}/{curso.cupos}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: curso.estado === 'activo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: curso.estado === 'activo' ? '#10b981' : '#ef4444'
                }}>
                  {curso.estado.charAt(0).toUpperCase() + curso.estado.slice(1)}
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewCurso(curso)}
                    style={{
                      padding: '8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#3b82f6',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditCurso(curso)}
                    style={{
                      padding: '8px',
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '8px',
                      color: '#f59e0b',
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCurso(curso.id)}
                    style={{
                      padding: '8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de progreso de cupos */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Ocupación</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                  {Math.round((curso.inscritos / curso.cupos) * 100)}%
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(curso.inscritos / curso.cupos) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${
                    (curso.inscritos / curso.cupos) > 0.8 ? '#ef4444' : 
                    (curso.inscritos / curso.cupos) > 0.6 ? '#f59e0b' : '#10b981'
                  }, ${
                    (curso.inscritos / curso.cupos) > 0.8 ? '#dc2626' : 
                    (curso.inscritos / curso.cupos) > 0.6 ? '#d97706' : '#059669'
                  })`,
                  borderRadius: '3px'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Crear Nuevo Curso' : 
                 modalType === 'edit' ? 'Editar Curso' : 'Detalles del Curso'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Nombre del Curso
                    </label>
                    <input
                      name="nombre"
                      type="text"
                      defaultValue={selectedCurso?.nombre || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Duración
                    </label>
                    <input
                      name="duracion"
                      type="text"
                      defaultValue={selectedCurso?.duracion || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    defaultValue={selectedCurso?.descripcion || ''}
                    disabled={modalType === 'view'}
                    required
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Precio ($)
                    </label>
                    <input
                      name="precio"
                      type="number"
                      step="0.01"
                      defaultValue={selectedCurso?.precio || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Cupos
                    </label>
                    <input
                      name="cupos"
                      type="number"
                      defaultValue={selectedCurso?.cupos || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Modalidad
                    </label>
                    <select
                      name="modalidad"
                      defaultValue={selectedCurso?.modalidad || 'presencial'}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Instructor
                    </label>
                    <input
                      name="instructor"
                      type="text"
                      defaultValue={selectedCurso?.instructor || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Fecha Inicio
                    </label>
                    <input
                      name="fechaInicio"
                      type="date"
                      defaultValue={selectedCurso?.fechaInicio || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Fecha Fin
                    </label>
                    <input
                      name="fechaFin"
                      type="date"
                      defaultValue={selectedCurso?.fechaFin || ''}
                      disabled={modalType === 'view'}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>
                </div>

                {modalType !== 'view' && (
                  <div>
                    <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                      Estado
                    </label>
                    <select
                      name="estado"
                      defaultValue={selectedCurso?.estado || 'activo'}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="finalizado">Finalizado</option>
                    </select>
                  </div>
                )}
              </div>

              {modalType !== 'view' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: 'rgba(255,255,255,0.7)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={16} />
                    {modalType === 'create' ? 'Crear Curso' : 'Guardar Cambios'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Control de Pagos
const PagosTab = () => {
  const [pagos, setPagos] = useState([
    {
      id: 1,
      estudiante: 'Ana García Rodríguez',
      email: 'ana.garcia@email.com',
      telefono: '+58 414-123-4567',
      curso: 'Cosmetología Básica',
      montoCurso: 250,
      montoPagado: 150,
      montoDeuda: 100,
      fechaUltimoPago: '2024-01-15',
      metodoPago: 'Transferencia',
      estado: 'pendiente',
      cuotas: 3,
      cuotasPagadas: 2
    },
    {
      id: 2,
      estudiante: 'Carlos López Martínez',
      email: 'carlos.lopez@email.com',
      telefono: '+58 424-987-6543',
      curso: 'Peluquería Profesional',
      montoCurso: 320,
      montoPagado: 320,
      montoDeuda: 0,
      fechaUltimoPago: '2024-01-10',
      metodoPago: 'Efectivo',
      estado: 'pagado',
      cuotas: 2,
      cuotasPagadas: 2
    },
    {
      id: 3,
      estudiante: 'María Rodríguez Silva',
      email: 'maria.rodriguez@email.com',
      telefono: '+58 412-555-0123',
      curso: 'Manicure y Pedicure',
      montoCurso: 180,
      montoPagado: 60,
      montoDeuda: 120,
      fechaUltimoPago: '2024-01-05',
      metodoPago: 'Pago Móvil',
      estado: 'atrasado',
      cuotas: 3,
      cuotasPagadas: 1
    },
    {
      id: 4,
      estudiante: 'José Fernández Torres',
      email: 'jose.fernandez@email.com',
      telefono: '+58 426-777-8888',
      curso: 'Cosmetología Básica',
      montoCurso: 250,
      montoPagado: 0,
      montoDeuda: 250,
      fechaUltimoPago: null,
      metodoPago: null,
      estado: 'sin_pagar',
      cuotas: 5,
      cuotasPagadas: 0
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterCurso, setFilterCurso] = useState('todos');

  const pagosFiltrados = pagos.filter(pago => {
    const matchesSearch = pago.estudiante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pago.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pago.curso.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || pago.estado === filterEstado;
    const matchesCurso = filterCurso === 'todos' || pago.curso === filterCurso;
    return matchesSearch && matchesEstado && matchesCurso;
  });

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pagado': return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' };
      case 'pendiente': return { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' };
      case 'atrasado': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' };
      case 'sin_pagar': return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
      default: return { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' };
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pagado': return 'Pagado';
      case 'pendiente': return 'Pendiente';
      case 'atrasado': return 'Atrasado';
      case 'sin_pagar': return 'Sin Pagar';
      default: return estado;
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          fontWeight: '700', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CreditCard size={32} color="#ef4444" />
          Control de Pagos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Gestiona los pagos y deudas de los estudiantes
        </p>
      </div>

      {/* Estadísticas de Pagos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            ${pagos.reduce((sum, pago) => sum + pago.montoPagado, 0)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Total Recaudado</div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            ${pagos.reduce((sum, pago) => sum + pago.montoDeuda, 0)}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Total Pendiente</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#3b82f6', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {pagos.filter(p => p.estado === 'pagado').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Pagos Completos</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {pagos.filter(p => p.estado === 'atrasado').length}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Pagos Atrasados</div>
        </div>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          {/* Búsqueda */}
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              placeholder="Buscar estudiante, email o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Filtros */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="atrasado">Atrasado</option>
            <option value="sin_pagar">Sin Pagar</option>
          </select>

          <select
            value={filterCurso}
            onChange={(e) => setFilterCurso(e.target.value)}
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          >
            <option value="todos">Todos los cursos</option>
            <option value="Cosmetología Básica">Cosmetología Básica</option>
            <option value="Peluquería Profesional">Peluquería Profesional</option>
            <option value="Manicure y Pedicure">Manicure y Pedicure</option>
          </select>
        </div>
      </div>

      {/* Lista de Pagos */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {pagosFiltrados.map(pago => (
          <div key={pago.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                    {pago.estudiante}
                  </h3>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: getEstadoColor(pago.estado).bg,
                    color: getEstadoColor(pago.estado).color
                  }}>
                    {getEstadoTexto(pago.estado)}
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{pago.email}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Teléfono</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{pago.telefono}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{pago.curso}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Último Pago</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                      {pago.fechaUltimoPago ? new Date(pago.fechaUltimoPago).toLocaleDateString() : 'Sin pagos'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de Pagos */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              borderRadius: '12px', 
              padding: '20px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Monto Total</div>
                  <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>${pago.montoCurso}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Pagado</div>
                  <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>${pago.montoPagado}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Deuda</div>
                  <div style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: '700' }}>${pago.montoDeuda}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Cuotas</div>
                  <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                    {pago.cuotasPagadas}/{pago.cuotas}
                  </div>
                </div>
              </div>

              {/* Barra de progreso de pago */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Progreso de Pago</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                    {Math.round((pago.montoPagado / pago.montoCurso) * 100)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(pago.montoPagado / pago.montoCurso) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${
                      pago.estado === 'pagado' ? '#10b981' : 
                      pago.estado === 'atrasado' ? '#ef4444' : '#f59e0b'
                    }, ${
                      pago.estado === 'pagado' ? '#059669' : 
                      pago.estado === 'atrasado' ? '#dc2626' : '#d97706'
                    })`,
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {pago.metodoPago && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} color="rgba(255,255,255,0.6)" />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                    Método de pago: {pago.metodoPago}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Matrículas
const MatriculasTab = () => {
  const [matriculas, setMatriculas] = useState([
    {
      id: 1, nombre: 'Ana García', apellido: 'Rodríguez', cedula: '12345678',
      email: 'ana.garcia@email.com', emailGenerado: 'ana.garcia.2024@bellezaacademia.edu',
      contraseña: 'AG2024*567', telefono: '+58 414-123-4567', curso: 'Cosmetología Básica',
      fechaMatricula: '2024-01-15', estado: 'activo', progreso: 65
    },
    {
      id: 2, nombre: 'Carlos López', apellido: 'Martínez', cedula: '23456789',
      email: 'carlos.lopez@email.com', emailGenerado: 'carlos.lopez.2024@bellezaacademia.edu',
      contraseña: 'CL2024*890', telefono: '+58 424-987-6543', curso: 'Peluquería Profesional',
      fechaMatricula: '2024-01-10', estado: 'activo', progreso: 80
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  const matriculasFiltradas = matriculas.filter(matricula => {
    const matchesSearch = matricula.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matricula.cedula.includes(searchTerm);
    const matchesEstado = filterEstado === 'todos' || matricula.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <GraduationCap size={32} color="#ef4444" />
          Gestión de Matrículas
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra las matrículas y credenciales de acceso de los estudiantes
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text" placeholder="Buscar por nombre o cédula..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <select
            value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}
            style={{
              padding: '12px 16px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
              color: '#fff', fontSize: '0.9rem'
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="graduado">Graduado</option>
          </select>
        </div>
      </div>

      {/* Lista de Matrículas */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {matriculasFiltradas.map(matricula => (
          <div key={matricula.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {matricula.nombre} {matricula.apellido}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Cédula</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{matricula.cedula}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{matricula.email}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{matricula.curso}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Credenciales */}
            <div style={{ 
              background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', padding: '20px',
              border: '1px solid rgba(59, 130, 246, 0.1)', marginBottom: '16px'
            }}>
              <h4 style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: '600', margin: '0 0 12px 0' }}>
                Credenciales de Acceso
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email Institucional</div>
                  <div style={{ 
                    color: '#3b82f6', fontSize: '0.9rem', fontFamily: 'monospace',
                    background: 'rgba(59, 130, 246, 0.1)', padding: '8px 12px', borderRadius: '8px'
                  }}>
                    {matricula.emailGenerado}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Contraseña</div>
                  <div style={{ 
                    color: '#10b981', fontSize: '0.9rem', fontFamily: 'monospace',
                    background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px'
                  }}>
                    {matricula.contraseña}
                  </div>
                </div>
              </div>
            </div>

            {/* Progreso */}
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '20px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0 }}>Progreso Académico</h4>
                <span style={{ color: '#f59e0b', fontSize: '1.2rem', fontWeight: '700' }}>{matricula.progreso}%</span>
              </div>
              <div style={{
                width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px', overflow: 'hidden'
              }}>
                <div style={{
                  width: `${matricula.progreso}%`, height: '100%',
                  background: `linear-gradient(90deg, #f59e0b, #d97706)`, borderRadius: '4px'
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente Profesores
const ProfesoresTab = () => {
  const [profesores, setProfesores] = useState([
    {
      id: 1, nombre: 'Dr. Carlos', apellido: 'Mendoza', cedula: '15678901',
      email: 'carlos.mendoza@bellezaacademia.edu', telefono: '+58 412-345-6789',
      especialidad: 'Cosmetología Avanzada', experiencia: '8 años',
      cursosAsignados: ['Cosmetología Básica', 'Tratamientos Faciales'],
      estado: 'activo', fechaIngreso: '2020-03-15'
    },
    {
      id: 2, nombre: 'Lic. María', apellido: 'González', cedula: '26789012',
      email: 'maria.gonzalez@bellezaacademia.edu', telefono: '+58 424-567-8901',
      especialidad: 'Peluquería Profesional', experiencia: '12 años',
      cursosAsignados: ['Peluquería Profesional', 'Colorimetría'],
      estado: 'activo', fechaIngreso: '2018-08-20'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedProfesor, setSelectedProfesor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cursosDisponibles = [
    'Cosmetología Básica', 'Cosmetología Avanzada', 'Peluquería Profesional',
    'Manicure y Pedicure', 'Tratamientos Faciales', 'Colorimetría',
    'Barbería Moderna', 'Maquillaje Profesional'
  ];

  const profesoresFiltrados = profesores.filter(profesor => {
    const matchesSearch = profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesor.cedula.includes(searchTerm);
    return matchesSearch;
  });

  const handleCreateProfesor = () => {
    setSelectedProfesor(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEditProfesor = (profesor) => {
    setSelectedProfesor(profesor);
    setModalType('edit');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cursosSeleccionados = Array.from(formData.getAll('cursos'));
    
    const profesorData = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      cedula: formData.get('cedula'),
      email: formData.get('email'),
      telefono: formData.get('telefono'),
      especialidad: formData.get('especialidad'),
      experiencia: formData.get('experiencia'),
      cursosAsignados: cursosSeleccionados,
      estado: 'activo',
      fechaIngreso: formData.get('fechaIngreso') || new Date().toISOString().split('T')[0]
    };

    if (modalType === 'create') {
      const newProfesor = {
        ...profesorData,
        id: Math.max(...profesores.map(p => p.id)) + 1
      };
      setProfesores([...profesores, newProfesor]);
    } else if (modalType === 'edit') {
      setProfesores(profesores.map(profesor => 
        profesor.id === selectedProfesor.id 
          ? { ...profesor, ...profesorData }
          : profesor
      ));
    }
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <UserCheck size={32} color="#ef4444" />
          Gestión de Profesores
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra profesores y asignación de cursos
        </p>
      </div>

      {/* Controles */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text" placeholder="Buscar por nombre o cédula..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 12px 12px 44px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', color: '#fff', fontSize: '0.9rem'
              }}
            />
          </div>
          <button
            onClick={handleCreateProfesor}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
              borderRadius: '12px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Profesor
          </button>
        </div>
      </div>

      {/* Lista de Profesores */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {profesoresFiltrados.map(profesor => (
          <div key={profesor.id} style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                  {profesor.nombre} {profesor.apellido}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Especialidad</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.especialidad}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Experiencia</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.experiencia}</div>
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</div>
                    <div style={{ color: '#fff', fontSize: '0.9rem' }}>{profesor.email}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEditProfesor(profesor)}
                  style={{
                    padding: '8px', background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px',
                    color: '#f59e0b', cursor: 'pointer'
                  }}
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>

            {/* Cursos Asignados */}
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', padding: '20px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <h4 style={{ color: '#10b981', fontSize: '1rem', fontWeight: '600', margin: '0 0 12px 0' }}>
                Cursos Asignados ({profesor.cursosAsignados.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profesor.cursosAsignados.map((curso, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(16, 185, 129, 0.2)', color: '#10b981',
                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600'
                  }}>
                    {curso}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                {modalType === 'create' ? 'Nuevo Profesor' : 'Editar Profesor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Nombre</label>
                  <input
                    type="text" name="nombre" required
                    defaultValue={selectedProfesor?.nombre || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Apellido</label>
                  <input
                    type="text" name="apellido" required
                    defaultValue={selectedProfesor?.apellido || ''}
                    style={{
                      width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                      color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Especialidad</label>
                <input
                  type="text" name="especialidad" required
                  defaultValue={selectedProfesor?.especialidad || ''}
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>Cursos a Asignar</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                  {cursosDisponibles.map(curso => (
                    <label key={curso} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox" name="cursos" value={curso}
                        defaultChecked={selectedProfesor?.cursosAsignados?.includes(curso) || false}
                        style={{ accentColor: '#ef4444' }}
                      />
                      {curso}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button" onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: 'rgba(255,255,255,0.8)', cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600',
                    cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {modalType === 'create' ? 'Crear Profesor' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente Reportes
const ReportesTab = () => {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('mes');
  const [filtroRol, setFiltroRol] = useState('todos');

  const reportesDisponibles = [
    {
      id: 1, nombre: 'Reporte de Estudiantes', tipo: 'estudiantes',
      descripcion: 'Lista completa de estudiantes matriculados con detalles',
      icono: GraduationCap, color: '#3b82f6'
    },
    {
      id: 2, nombre: 'Reporte de Pagos', tipo: 'pagos',
      descripcion: 'Estado de pagos y deudas por estudiante',
      icono: DollarSign, color: '#10b981'
    },
    {
      id: 3, nombre: 'Reporte de Profesores', tipo: 'profesores',
      descripcion: 'Lista de profesores y cursos asignados',
      icono: UserCheck, color: '#f59e0b'
    },
    {
      id: 4, nombre: 'Reporte de Cursos', tipo: 'cursos',
      descripcion: 'Estadísticas de cursos y matrículas',
      icono: BookOpen, color: '#8b5cf6'
    }
  ];

  const generateReport = (tipo) => {
    alert(`Generando reporte de ${tipo}...`);
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <FileText size={32} color="#ef4444" />
          Reportes Administrativos
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Genera reportes filtrados por rol de administrador
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={20} color="rgba(255,255,255,0.7)" />
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Filtros:</span>
          </div>
          
          <select
            value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            style={{
              padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
              color: '#fff', fontSize: '0.9rem'
            }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="estudiantes">Estudiantes</option>
            <option value="pagos">Pagos</option>
            <option value="profesores">Profesores</option>
            <option value="cursos">Cursos</option>
          </select>

          <select
            value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}
            style={{
              padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
              color: '#fff', fontSize: '0.9rem'
            }}
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Trimestre</option>
            <option value="año">Este año</option>
          </select>

          <select
            value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}
            style={{
              padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
              color: '#fff', fontSize: '0.9rem'
            }}
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Solo Admin</option>
            <option value="coordinador">Coordinador</option>
            <option value="secretario">Secretario</option>
          </select>
        </div>
      </div>

      {/* Lista de Reportes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {reportesDisponibles
          .filter(reporte => filtroTipo === 'todos' || reporte.tipo === filtroTipo)
          .map(reporte => {
            const IconComponent = reporte.icono;
            return (
              <div key={reporte.id} style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    padding: '12px', borderRadius: '12px',
                    background: `rgba(${reporte.color === '#3b82f6' ? '59, 130, 246' : 
                                      reporte.color === '#10b981' ? '16, 185, 129' :
                                      reporte.color === '#f59e0b' ? '245, 158, 11' : '139, 92, 246'}, 0.2)`
                  }}>
                    <IconComponent size={24} color={reporte.color} />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                      {reporte.nombre}
                    </h3>
                  </div>
                </div>
                
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {reporte.descripcion}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => generateReport(reporte.tipo)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                      borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      flex: 1, justifyContent: 'center'
                    }}
                  >
                    <Download size={16} />
                    Generar PDF
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

// Componente Certificados
const CertificadosTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('certificados');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [firmaConfig, setFirmaConfig] = useState({
    firmaDigital: null,
    codigoQR: null,
    nombreDirector: 'Dr. Carlos Mendoza',
    cargoDirector: 'Director Académico',
    nombreInstitucion: 'Academia de Belleza Profesional'
  });

  const certificados = [
    {
      id: 1, estudiante: 'Ana García Rodríguez', curso: 'Cosmetología Básica',
      fechaEmision: '2024-01-20', estado: 'emitido', codigo: 'CERT-2024-001'
    },
    {
      id: 2, estudiante: 'Carlos López Martínez', curso: 'Peluquería Profesional',
      fechaEmision: '2024-01-18', estado: 'pendiente', codigo: 'CERT-2024-002'
    }
  ];

  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      setFirmaConfig(prev => ({
        ...prev,
        [type]: file.name
      }));
    }
  };

  const generateCertificate = (certificadoId) => {
    alert(`Generando certificado ${certificadoId}...`);
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ 
          color: '#fff', fontSize: '2rem', fontWeight: '700', margin: '0 0 8px 0',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Award size={32} color="#ef4444" />
          Gestión de Certificados
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
          Administra certificados y configuración de firmas digitales
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveSubTab('certificados')}
          style={{
            padding: '12px 24px',
            background: activeSubTab === 'certificados' 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : 'rgba(255,255,255,0.1)',
            border: activeSubTab === 'certificados' 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Certificados
        </button>
        <button
          onClick={() => setActiveSubTab('configuracion')}
          style={{
            padding: '12px 24px',
            background: activeSubTab === 'configuracion' 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : 'rgba(255,255,255,0.1)',
            border: activeSubTab === 'configuracion' 
              ? '1px solid rgba(239, 68, 68, 0.3)' 
              : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Configuración de Firmas
        </button>
      </div>

      {activeSubTab === 'certificados' && (
        <div>
          {/* Lista de Certificados */}
          <div style={{ display: 'grid', gap: '20px' }}>
            {certificados.map(cert => (
              <div key={cert.id} style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '20px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 12px 0' }}>
                      {cert.estudiante}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Curso</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{cert.curso}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Código</div>
                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{cert.codigo}</div>
                      </div>
                      <div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '4px' }}>Estado</div>
                        <div style={{
                          color: cert.estado === 'emitido' ? '#10b981' : '#f59e0b',
                          fontSize: '0.9rem',
                          fontWeight: '600'
                        }}>
                          {cert.estado === 'emitido' ? 'Emitido' : 'Pendiente'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => generateCertificate(cert.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                      borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                      cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <Download size={16} />
                    Generar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'configuracion' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px', padding: '32px'
        }}>
          <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 24px 0' }}>
            Configuración de Firmas y QR
          </h3>

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Firma Digital */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                Firma Digital del Director
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('firmaDigital', e)}
                  style={{ display: 'none' }}
                  id="firma-upload"
                />
                <label
                  htmlFor="firma-upload"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                    background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600'
                  }}
                >
                  <Upload size={16} />
                  Subir Firma
                </label>
                {firmaConfig.firmaDigital && (
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>
                    ✓ {firmaConfig.firmaDigital}
                  </span>
                )}
              </div>
            </div>

            {/* Código QR */}
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                Código QR de Verificación
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('codigoQR', e)}
                  style={{ display: 'none' }}
                  id="qr-upload"
                />
                <label
                  htmlFor="qr-upload"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                    background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px', color: '#10b981', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600'
                  }}
                >
                  <QrCode size={16} />
                  Subir QR
                </label>
                {firmaConfig.codigoQR && (
                  <span style={{ color: '#10b981', fontSize: '0.9rem' }}>
                    ✓ {firmaConfig.codigoQR}
                  </span>
                )}
              </div>
            </div>

            {/* Información del Director */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Nombre del Director
                </label>
                <input
                  type="text"
                  value={firmaConfig.nombreDirector}
                  onChange={(e) => setFirmaConfig(prev => ({ ...prev, nombreDirector: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem'
                  }}
                />
              </div>
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Cargo del Director
                </label>
                <input
                  type="text"
                  value={firmaConfig.cargoDirector}
                  onChange={(e) => setFirmaConfig(prev => ({ ...prev, cargoDirector: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                    color: '#fff', fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Nombre de la Institución
              </label>
              <input
                type="text"
                value={firmaConfig.nombreInstitucion}
                onChange={(e) => setFirmaConfig(prev => ({ ...prev, nombreInstitucion: e.target.value }))}
                style={{
                  width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                  color: '#fff', fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => alert('Configuración guardada exitosamente')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none',
                  borderRadius: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: '600',
                  cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Settings size={16} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdministrativos;
