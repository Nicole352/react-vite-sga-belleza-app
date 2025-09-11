import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, Search, Plus, Edit, Eye, Trash2, X, Building, Phone, Mail, 
  Calendar, MapPin, Shield, User, BookOpen, DollarSign, 
  TrendingUp, Award, Activity, BarChart3, GraduationCap, UserCheck,
  FileText, Download, Filter, Settings, Upload, QrCode, CreditCard,
  Clock, AlertTriangle, CheckCircle, UserPlus, Target, PieChart, Save,
  LogOut
} from 'lucide-react';

// Tipos
interface Admin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  departamento: string;
  fechaIngreso: string;
  estado: string;
  permisos: string[];
}

interface Curso {
  id_curso: number;
  codigo_curso: string;
  nombre: string;
  descripcion: string;
  id_tipo_curso: number;
  tipo_curso_nombre: string;
  id_aula: number | null;
  aula_nombre: string | null;
  capacidad_maxima: number;
  fecha_inicio: string;
  fecha_fin: string;
  horario: string;
  estado: string;
  estudiantes_inscritos: number;
  docentes_asignados: number;
  profesores: string;
  progreso: number;
  precio_base: number;
}

const PanelAdministrativos = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [administrativos, setAdministrativos] = useState<Admin[]>([
    {
      id: 1, nombre: 'Lcda. Patricia', apellido: 'González',
      email: 'patricia.gonzalez@belleza.edu', telefono: '+58 414-123-4567',
      cargo: 'Coordinadora Académica', departamento: 'Académico',
      fechaIngreso: '2023-01-15', estado: 'activo',
      permisos: ['cursos', 'estudiantes', 'reportes']
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');

  const handleLogout = () => {
    logout();
  };

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

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setModalType('edit');
    setShowModal(true);
  };

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteAdmin = (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este administrativo?')) {
      setAdministrativos(administrativos.filter(admin => admin.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const adminData: Omit<Admin, 'id'> = {
      nombre: String(formData.get('nombre') || ''),
      apellido: String(formData.get('apellido') || ''),
      email: String(formData.get('email') || ''),
      telefono: String(formData.get('telefono') || ''),
      cargo: String(formData.get('cargo') || ''),
      departamento: String(formData.get('departamento') || ''),
      fechaIngreso: String(formData.get('fechaIngreso') || ''),
      estado: String(formData.get('estado') || 'activo'),
      permisos: (formData.getAll('permisos') as string[])
    };

    if (modalType === 'create') {
      const newAdmin: Admin = { 
        ...adminData, 
        id: administrativos.length ? Math.max(...administrativos.map(a => a.id)) + 1 : 1 
      };
      setAdministrativos([...administrativos, newAdmin]);
    } else if (modalType === 'edit' && selectedAdmin) {
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
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0 0 16px 0' }}>
            Sistema de gestión integral para administradores
          </p>
          {user && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '20px',
              marginBottom: '40px'
            }}>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                Bienvenido, <strong>{user.nombre} {user.apellido}</strong> ({user.rol})
              </span>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          )}
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

// Componente Personal - Simplificado para funcionar
const PersonalTab: React.FC<{
  administrativos: Admin[];
  administrativosFiltrados: Admin[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterEstado: string;
  setFilterEstado: React.Dispatch<React.SetStateAction<string>>;
  filterDepartamento: string;
  setFilterDepartamento: React.Dispatch<React.SetStateAction<string>>;
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  modalType: 'create' | 'edit' | 'view';
  selectedAdmin: Admin | null;
  handleCreateAdmin: () => void;
  handleEditAdmin: (admin: Admin) => void;
  handleViewAdmin: (admin: Admin) => void;
  handleDeleteAdmin: (id: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}> = ({ 
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
      
      {/* Controles */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
          <input
            type="text"
            placeholder="Buscar administrativos..."
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
        
        <button
          onClick={handleCreateAdmin}
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
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Nuevo Admin
        </button>
      </div>

      {/* Lista de Administrativos */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {administrativosFiltrados.map(admin => (
          <div key={admin.id} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ color: '#fff', margin: '0 0 8px 0' }}>
                {admin.nombre} {admin.apellido}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 4px 0' }}>
                {admin.cargo} - {admin.departamento}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                {admin.email}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleViewAdmin(admin)}
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
                onClick={() => handleEditAdmin(admin)}
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
                onClick={() => handleDeleteAdmin(admin.id)}
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
            borderRadius: '20px',
            padding: '32px',
            width: '500px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>
                {modalType === 'create' ? 'Nuevo Administrativo' : 
                 modalType === 'edit' ? 'Editar Administrativo' : 'Ver Administrativo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <input
                  name="nombre"
                  type="text"
                  placeholder="Nombre"
                  defaultValue={selectedAdmin?.nombre || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <input
                  name="apellido"
                  type="text"
                  placeholder="Apellido"
                  defaultValue={selectedAdmin?.apellido || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  defaultValue={selectedAdmin?.email || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <input
                  name="cargo"
                  type="text"
                  placeholder="Cargo"
                  defaultValue={selectedAdmin?.cargo || ''}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </div>

              {modalType !== 'view' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {modalType === 'create' ? 'Crear' : 'Guardar'}
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

// Componentes simplificados para las otras pestañas
const CursosTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Gestión de Cursos
      </h2>
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <BookOpen size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Módulo de Cursos</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Gestión completa de cursos, horarios y asignaciones
        </p>
      </div>
    </div>
  );
};

const PagosTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Control de Pagos
      </h2>
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <CreditCard size={48} color="#10b981" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Sistema de Pagos</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Gestión de pagos, deudas y reportes financieros
        </p>
      </div>
    </div>
  );
};

const MatriculasTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Gestión de Matrículas
      </h2>
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <GraduationCap size={48} color="#f59e0b" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Matrículas de Estudiantes</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Control de matrículas y credenciales de acceso
        </p>
      </div>
    </div>
  );
};

const ProfesoresTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Gestión de Profesores
      </h2>
      <div style={{
        background: 'rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <UserCheck size={48} color="#a855f7" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Personal Docente</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Administración de profesores y asignación de cursos
        </p>
      </div>
    </div>
  );
};

const CertificadosTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Gestión de Certificados
      </h2>
      <div style={{
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <Award size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Certificados Digitales</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Generación y validación de certificados
        </p>
      </div>
    </div>
  );
};

const ReportesTab = () => {
  return (
    <div style={{ padding: '32px', color: '#fff' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '24px' }}>
        Reportes Administrativos
      </h2>
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <FileText size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Sistema de Reportes</h3>
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>
          Reportes detallados y estadísticas del sistema
        </p>
      </div>
    </div>
  );
};

export default PanelAdministrativos;