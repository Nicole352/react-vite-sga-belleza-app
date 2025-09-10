import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  UserCheck, 
  Database, 
  Settings, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Key,
  Server,
  Wifi,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit3,
  X,
  RefreshCw,
  Download,
  GraduationCap,
  DollarSign,
  Trash2,
  Lock,
  Unlock,
  Save,
  AlertCircle,
  Check,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

// Pequeño componente Tooltip sin dependencias externas
const Tooltip = ({ content, children }) => (
  <div className="relative inline-flex group">
    {children}
    <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-900/95 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900/95" />
    </div>
  </div>
);

const PanelSuperAdmin = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('administradores');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const API_BASE = 'http://localhost:3000/api';
  const [filterStatus, setFilterStatus] = useState('all');
  const [roles, setRoles] = useState<Array<{ id_rol: number; nombre_rol: string; descripcion?: string }>>([]);
  
  const [newAdmin, setNewAdmin] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    genero: '',
    foto_perfil: '',
    password: '',
    confirmPassword: '',
    permisos: []
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Administradores existentes
  const [administradores, setAdministradores] = useState([
    {
      id: 1,
      nombre: 'Patricia Jiménez',
      email: 'patricia.jimenez@instituto.edu',
      telefono: '+593 99 123 4567',
      fechaCreacion: '2024-01-15',
      ultimoAcceso: 'Hace 2 horas',
      estado: 'activo',
      permisos: ['usuarios', 'cursos', 'reportes', 'configuracion'],
      rol: 'Administrador Principal'
    },
    {
      id: 2,
      nombre: 'Roberto Sánchez',
      email: 'roberto.sanchez@instituto.edu',
      telefono: '+593 98 765 4321',
      fechaCreacion: '2024-02-20',
      ultimoAcceso: 'Hace 1 día',
      estado: 'activo',
      permisos: ['usuarios', 'cursos', 'reportes'],
      rol: 'Administrador'
    },
    {
      id: 3,
      nombre: 'María González',
      email: 'maria.gonzalez@instituto.edu',
      telefono: '+593 97 555 1234',
      fechaCreacion: '2024-03-10',
      ultimoAcceso: 'Hace 3 días',
      estado: 'inactivo',
      permisos: ['usuarios', 'cursos'],
      rol: 'Administrador Junior'
    },
    {
      id: 4,
      nombre: 'Carlos Mendoza',
      email: 'carlos.mendoza@instituto.edu',
      telefono: '+593 96 888 9999',
      fechaCreacion: '2024-04-05',
      ultimoAcceso: 'Hace 5 horas',
      estado: 'activo',
      permisos: ['reportes', 'configuracion'],
      rol: 'Administrador'
    }
  ]);

  // Permisos disponibles
  const permisosDisponibles = [
    { id: 'usuarios', nombre: 'Gestión de Usuarios', descripcion: 'Crear, editar y eliminar usuarios', icon: Users },
    { id: 'cursos', nombre: 'Gestión de Cursos', descripcion: 'Administrar cursos y programas', icon: GraduationCap },
    { id: 'reportes', nombre: 'Reportes y Estadísticas', descripcion: 'Acceso a reportes del sistema', icon: BarChart3 },
    { id: 'configuracion', nombre: 'Configuración del Sistema', descripcion: 'Cambiar configuraciones generales', icon: Settings },
    { id: 'pagos', nombre: 'Gestión de Pagos', descripcion: 'Administrar pagos y facturación', icon: DollarSign },
    { id: 'inventario', nombre: 'Control de Inventario', descripcion: 'Gestionar productos e inventario', icon: Database }
  ];

  // Función para mostrar notificaciones
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper para leer valores de inputs por id
  const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value?.trim() || '';

  // Función para crear nuevo administrador (backend)
  const handleCreateAdmin = async () => {
    try {
      const cedula = getVal('new-admin-cedula');
      const nombre = getVal('new-admin-nombre');
      const apellido = getVal('new-admin-apellido');
      const email = getVal('new-admin-email');
      const telefono = getVal('new-admin-telefono');
      const fecha_nacimiento = getVal('new-admin-fecha-nacimiento');
      const genero = getVal('new-admin-genero');
      const direccion = getVal('new-admin-direccion');
      const foto_perfil = getVal('new-admin-foto');
      const password = getVal('new-admin-password');
      const confirmPassword = getVal('new-admin-confirm');

      if (!cedula || !nombre || !apellido || !email || !password) {
        showNotification('Cédula, Nombre, Apellido, Email y Contraseña son obligatorios', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
      }

      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        showNotification('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        return;
      }

      const res = await fetch(`${API_BASE}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cedula,
          nombre,
          apellido,
          email,
          telefono: telefono || null,
          fecha_nacimiento: fecha_nacimiento || null,
          direccion: direccion || null,
          genero: genero || null,
          foto_perfil: foto_perfil || null,
          password,
          roleName: getVal('new-admin-role') || 'administrativo'
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        const msg = txt || 'No se pudo crear el administrador';
        showNotification(msg, 'error');
        return;
      }

      // Refrescar lista
      await loadAdmins();
      setShowCreateAdminModal(false);
      // Limpiar inputs del formulario
      ['new-admin-cedula','new-admin-nombre','new-admin-apellido','new-admin-email','new-admin-telefono','new-admin-fecha-nacimiento','new-admin-genero','new-admin-direccion','new-admin-foto','new-admin-password','new-admin-confirm']
        .forEach((id) => {
          const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
          if (el) (el as any).value = '';
        });
      setNewAdmin({ ...newAdmin, permisos: [] });
      showNotification('Administrador creado exitosamente');
    } catch (e) {
      console.error(e);
      showNotification('Error inesperado creando administrador', 'error');
    }
  };

  // Función para editar administrador
  const handleEditAdmin = () => {
    // Leer valores del DOM (inputs no controlados)
    const nombre = (document.getElementById('edit-admin-nombre') as HTMLInputElement)?.value?.trim() || '';
    const apellido = (document.getElementById('edit-admin-apellido') as HTMLInputElement)?.value?.trim() || '';
    const email = (document.getElementById('edit-admin-email') as HTMLInputElement)?.value?.trim() || '';
    const telefono = (document.getElementById('edit-admin-telefono') as HTMLInputElement)?.value?.trim() || '';
    const roleName = (document.getElementById('edit-admin-role') as HTMLSelectElement)?.value?.trim() || '';

    if (!nombre || !email) {
      showNotification('Nombre y email son obligatorios', 'error');
      return;
    }

    // Evitar duplicado de email en otra fila
    const existingAdmin = administradores.find(admin => admin.email === email && admin.id !== selectedAdmin.id);
    if (existingAdmin) {
      showNotification('El email ya está registrado', 'error');
      return;
    }

    const permisos = (selectedAdmin.permisos || []);
    const rolDerivado = roleName || selectedAdmin.rol || selectedAdmin.nombre_rol || (permisos.length > 3 ? 'Administrador Principal' : 'Administrador');

    setAdministradores(administradores.map(admin => 
      admin.id === selectedAdmin.id ? {
        ...admin,
        nombre,
        apellido,
        email,
        telefono,
        rol: rolDerivado,
        nombre_rol: rolDerivado,
        permisos
      } : admin
    ));
    setShowEditAdminModal(false);
    setSelectedAdmin(null);
    showNotification('Administrador actualizado exitosamente');
  };

  // Función para eliminar administrador
  const handleDeleteAdmin = () => {
    setAdministradores(administradores.filter(admin => admin.id !== selectedAdmin.id));
    setShowDeleteModal(false);
    setSelectedAdmin(null);
    showNotification('Administrador eliminado exitosamente');
  };

  // Función para cambiar contraseña
  const handlePasswordReset = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showNotification('Todos los campos son obligatorios', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setShowPasswordModal(false);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setSelectedAdmin(null);
    showNotification('Contraseña actualizada exitosamente');
  };

  // Función para alternar estado del administrador
  const toggleAdminStatus = (admin) => {
    const newStatus = admin.estado === 'activo' ? 'inactivo' : 'activo';
    setAdministradores(administradores.map(a => 
      a.id === admin.id ? { ...a, estado: newStatus } : a
    ));
    showNotification(`Administrador ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  // Filtrar administradores
  const filteredAdministradores = administradores.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || admin.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Modal para editar administrador
  const EditAdminModal = () => {
    if (!showEditAdminModal || !selectedAdmin) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}>
                <Edit3 size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  Editar Administrador
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                  Modifica la información del administrador
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditAdminModal(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulario de edición */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Cédula
              </label>
              <input
                type="text"
                id="edit-admin-cedula"
                defaultValue={selectedAdmin.cedula}
                readOnly
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="—"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                id="edit-admin-nombre"
                defaultValue={selectedAdmin.nombre}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Apellido
              </label>
              <input
                type="text"
                id="edit-admin-apellido"
                defaultValue={selectedAdmin.apellido}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Ej: Pérez"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Email *
              </label>
              <input
                type="email"
                id="edit-admin-email"
                defaultValue={selectedAdmin.email}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="admin@instituto.edu"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Teléfono
              </label>
              <input
                type="tel"
                id="edit-admin-telefono"
                defaultValue={selectedAdmin.telefono}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="+593 99 123 4567"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Rol del sistema
              </label>
              <select
                id="edit-admin-role"
                defaultValue={selectedAdmin.rol || selectedAdmin.nombre_rol || ''}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <option value="" style={{ color: '#000' }}>Seleccionar rol</option>
                {roles.map(r => (
                  <option key={r.id_rol} value={r.nombre_rol} style={{ color: '#000' }}>{r.nombre_rol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Permisos */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px', display: 'block' }}>
              Permisos del Sistema
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {permisosDisponibles.map(permiso => {
                const IconComponent = permiso.icon;
                return (
                  <div 
                    key={permiso.id}
                    style={{
                      background: (selectedAdmin.permisos || []).includes(permiso.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${(selectedAdmin.permisos || []).includes(permiso.id) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: (selectedAdmin.permisos || []).includes(permiso.id) ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onClick={() => {
                      const current = selectedAdmin.permisos || [];
                      const nuevos = current.includes(permiso.id)
                        ? current.filter(p => p !== permiso.id)
                        : [...current, permiso.id];
                      setSelectedAdmin({ ...selectedAdmin, permisos: nuevos });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: selectedAdmin.permisos.includes(permiso.id) ? '#ef4444' : 'transparent',
                        transition: 'all 0.2s'
                      }}>
                        {selectedAdmin.permisos.includes(permiso.id) && <Check size={14} color="#fff" />}
                      </div>
                      <IconComponent size={20} color="rgba(255,255,255,0.8)" />
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                        {permiso.nombre}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: 0, paddingLeft: '36px' }}>
                      {permiso.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCreateAdminModal(false)}
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateAdmin}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Save size={16} />
              Crear Administrador
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente de notificación
  const NotificationComponent = () => {
    if (!notification) return null;

    return (
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'success' ? 
            'linear-gradient(135deg, #10b981, #059669)' : 
            'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '400px'
        }}
      >
        {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
        {notification.message}
      </div>
    );
  };

  // Modal para crear administrador
  const CreateAdminModal = () => {
    if (!showCreateAdminModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          overflowY: 'auto',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}>
                <UserPlus size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  Crear Nuevo Administrador
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                  Completa la información del nuevo administrador
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateAdminModal(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulario */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Cédula *
              </label>
              <input
                id="new-admin-cedula"
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Ej: 0102030405"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Nombre *
              </label>
              <input
                id="new-admin-nombre"
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Ej: Juan"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Apellido *
              </label>
              <input
                id="new-admin-apellido"
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Ej: Pérez"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Fecha de Nacimiento
              </label>
              <input
                id="new-admin-fecha-nacimiento"
                type="date"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Género
              </label>
              <select
                id="new-admin-genero"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <option value="" style={{ color: '#000' }}>Seleccionar</option>
                <option value="masculino" style={{ color: '#000' }}>Masculino</option>
                <option value="femenino" style={{ color: '#000' }}>Femenino</option>
                <option value="otro" style={{ color: '#000' }}>Otro</option>
              </select>
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Dirección
              </label>
              <input
                id="new-admin-direccion"
                type="text"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="Calle Ejemplo 123, Ciudad"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Foto de Perfil (URL)
              </label>
              <input
                id="new-admin-foto"
                type="url"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="https://..."
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Email *
              </label>
              <input
                id="new-admin-email"
                type="email"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="admin@instituto.edu"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Teléfono
              </label>
              <input
                id="new-admin-telefono"
                type="tel"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="+593 99 123 4567"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Contraseña *
              </label>
              <input
                id="new-admin-password"
                type="password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                Confirmar Contraseña *
              </label>
              <input
                id="new-admin-confirm"
                type="password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Permisos */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '16px', display: 'block' }}>
              Permisos del Sistema
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {permisosDisponibles.map(permiso => {
                const IconComponent = permiso.icon;
                return (
                  <div 
                    key={permiso.id}
                    style={{
                      background: newAdmin.permisos.includes(permiso.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${newAdmin.permisos.includes(permiso.id) ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: newAdmin.permisos.includes(permiso.id) ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onClick={() => {
                      const nuevos = newAdmin.permisos.includes(permiso.id)
                        ? newAdmin.permisos.filter(p => p !== permiso.id)
                        : [...newAdmin.permisos, permiso.id];
                      setNewAdmin({...newAdmin, permisos: nuevos});
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid rgba(239, 68, 68, 0.5)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: newAdmin.permisos.includes(permiso.id) ? '#ef4444' : 'transparent',
                        transition: 'all 0.2s'
                      }}>
                        {newAdmin.permisos.includes(permiso.id) && <Check size={14} color="#fff" />}
                      </div>
                      <IconComponent size={20} color="rgba(255,255,255,0.8)" />
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>
                        {permiso.nombre}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: 0, paddingLeft: '36px' }}>
                      {permiso.descripcion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowCreateAdminModal(false)}
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateAdmin}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              <Save size={16} />
              Crear Administrador
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para cambiar contraseña
  const PasswordModal = () => {
    if (!showPasswordModal || !selectedAdmin) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '500px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}>
                <Key size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  Cambiar Contraseña
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                  Actualizar contraseña del administrador
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={16} color="#ef4444" />
              <span style={{ color: '#fff', fontWeight: '600' }}>Administrador:</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>
              {selectedAdmin.nombre} ({selectedAdmin.email})
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Nueva Contraseña *
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
              Confirmar Nueva Contraseña *
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="Repetir nueva contraseña"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowPasswordModal(false)}
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handlePasswordReset}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Key size={16} />
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para confirmar eliminación
  const DeleteModal = () => {
    if (!showDeleteModal || !selectedAdmin) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '500px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}>
                <Trash2 size={24} color="#fff" />
              </div>
              <div>
                <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                  Eliminar Administrador
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ marginBottom: '32px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <AlertTriangle size={24} color="#ef4444" />
              <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '1.1rem' }}>¡Acción Irreversible!</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: '1.5', marginBottom: '12px' }}>
              Estás a punto de eliminar permanentemente al administrador:
            </p>
            <div style={{ marginTop: '12px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
              <p style={{ color: '#fff', fontWeight: '600', margin: 0, marginBottom: '4px' }}>{selectedAdmin.nombre}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0, marginBottom: '4px' }}>{selectedAdmin.email}</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: 0 }}>{selectedAdmin.rol}</p>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '16px 0 0 0', fontSize: '0.9rem' }}>
              Todos los datos y permisos asociados se perderán permanentemente.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: '14px 28px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteAdmin}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Trash2 size={16} />
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar Gestión de Administradores con estilos mejorados
  const renderAdministradores = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '0',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* CSS Animations */}
      <style>
        {`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .admin-card {
            animation: fadeIn 0.5s ease-out;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .admin-card:hover {
            transform: translateY(-2px);
          }
          
          .action-btn {
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
          }
          
          .action-btn:hover {
            transform: scale(1.1);
          }
          
          .search-input:focus {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
        `}
      </style>

      {/* Header Principal */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Shimmer effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
              position: 'relative'
            }}>
              <Users size={40} color="#fff" />
              <div style={{
                position: 'absolute',
                inset: '-2px',
                borderRadius: '50%',
                padding: '2px',
                background: 'linear-gradient(45deg, #ef4444, transparent, #ef4444)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                animation: 'pulse 2s ease-in-out infinite'
              }} />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: '800', 
                color: '#fff',
                margin: 0,
                background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Gestión de Administradores
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                Administra los usuarios con permisos del sistema institucional
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {administradores.filter(a => a.estado === 'activo').length} Activos
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280' }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    {administradores.filter(a => a.estado === 'inactivo').length} Inactivos
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateAdminModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none',
              borderRadius: '16px',
              color: '#fff',
              padding: '16px 32px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 12px 28px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <UserPlus size={20} />
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Búsqueda */}
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '14px 16px 14px 50px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          {/* Filtro de Estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={20} color="rgba(255,255,255,0.7)" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                minWidth: '120px'
              }}
            >
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          {/* Stats rápidas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>
                {filteredAdministradores.length}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                Encontrados
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Administradores */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header de la tabla */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '20px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 200px 120px 150px 180px',
          gap: '20px',
          alignItems: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Administrador
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Email
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Estado
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Último Acceso
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
            Acciones
          </div>
        </div>

        {/* Filas de administradores */}
        <div>
          {filteredAdministradores.length === 0 ? (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              color: 'rgba(255,255,255,0.6)'
            }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                No se encontraron administradores
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer administrador'}
              </div>
            </div>
          ) : (
            filteredAdministradores.map((admin, index) => (
              <div
                key={admin.id}
                className="admin-card"
                style={{
                  padding: '24px',
                  borderBottom: index < filteredAdministradores.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '1fr 200px 120px 150px 180px',
                  gap: '20px',
                  alignItems: 'center',
                  background: admin.estado === 'activo' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' : 'linear-gradient(135deg, rgba(107, 114, 128, 0.05), transparent)',
                  position: 'relative',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Información del administrador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
                    position: 'relative'
                  }}>
                    <span style={{
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '1.1rem'
                    }}>
                      {(admin && (admin.nombre || admin.email) ? (admin.nombre || admin.email).toString().split(' ') : ['?'])
                        .map(n => (n && n[0]) || '')
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                    {/* Indicador de estado */}
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: admin.estado === 'activo' ? '#10b981' : '#6b7280',
                      border: '2px solid rgba(0,0,0,0.9)',
                      boxShadow: admin.estado === 'activo' ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                    }} />
                  </div>
                  <div>
                    <div style={{
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      marginBottom: '4px'
                    }}>
                      {admin.nombre || admin.email}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.85rem',
                      marginBottom: '2px'
                    }}>
                      {admin.rol || admin.nombre_rol || '—'}
                    </div>
                    <div style={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem'
                    }}>
                      {admin.telefono}
                    </div>
                    {/* Permisos badges */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {(admin.permisos || []).slice(0, 2).map(permiso => (
                        <span
                          key={permiso}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          {permiso}
                        </span>
                      ))}
                      {(admin.permisos || []).length > 2 && (
                        <span style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.7)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          +{admin.permisos.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem',
                  wordBreak: 'break-all'
                }}>
                  {admin.email}
                </div>

                {/* Estado */}
                <div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: admin.estado === 'activo' ? 
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))' : 
                      'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1))',
                    color: admin.estado === 'activo' ? '#10b981' : '#6b7280',
                    border: `1px solid ${admin.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                    boxShadow: admin.estado === 'activo' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(107, 114, 128, 0.1)'
                  }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: admin.estado === 'activo' ? '#10b981' : '#6b7280'
                    }} />
                    {admin.estado}
                  </span>
                </div>

                {/* Último acceso */}
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Clock size={14} />
                  {admin.ultimoAcceso}
                </div>

                {/* Acciones */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <Tooltip content="Editar">
                    <button
                      onClick={() => {
                        setSelectedAdmin({ ...admin, permisos: (admin.permisos || []) });
                        setShowEditAdminModal(true);
                      }}
                      className="action-btn"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <Edit3 size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip content="Cambiar contraseña">
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowPasswordModal(true);
                      }}
                      className="action-btn"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
                        color: '#f59e0b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                      }}
                    >
                      <Key size={16} />
                    </button>
                  </Tooltip>

                  <Tooltip content={admin.estado === 'activo' ? 'Desactivar' : 'Activar'}>
                    <button
                      onClick={() => toggleAdminStatus(admin)}
                      className="action-btn"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: admin.estado === 'activo' ? 
                          'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))' :
                          'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                        color: admin.estado === 'activo' ? '#ef4444' : '#10b981',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: admin.estado === 'activo' ? 
                          '0 4px 12px rgba(239, 68, 68, 0.2)' :
                          '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      {admin.estado === 'activo' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </Tooltip>

                  <Tooltip content="Eliminar administrador">
                    <button
                      onClick={() => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                      }}
                      className="action-btn"
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer con estadísticas */}
      {filteredAdministradores.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          padding: '24px',
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="rgba(255,255,255,0.7)" />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                Total: {administradores.length} administradores
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} color="#10b981" />
              <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                {administradores.filter(a => a.estado === 'activo').length} Activos
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="#6b7280" />
              <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: '600' }}>
                {administradores.filter(a => a.estado === 'inactivo').length} Inactivos
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                padding: '8px 16px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
            <button
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                padding: '8px 16px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Download size={14} />
              Exportar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'administradores', name: 'Administradores', icon: Users },
    { id: 'logs', name: 'Logs del Sistema', icon: FileText },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  // Cargar administradores desde backend
  const loadAdmins = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/admins`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      // Esperamos campos: id_usuario, nombre, apellido, email, telefono, estado, fecha_registro
      setAdministradores(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error cargando administradores', e);
    }
  };

  useEffect(() => {
    loadAdmins();
    // Cargar roles solo para superadmin
    (async () => {
      try {
        const token = sessionStorage.getItem('auth_token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/roles`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setRoles(data);
      } catch (e) {
        console.error('Error cargando roles', e);
      }
    })();
  }, []);

  return (
    <>
      <NotificationComponent />
      <CreateAdminModal />
      <EditAdminModal />
      <PasswordModal />
      <DeleteModal />
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
        padding: '24px',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Navegación de pestañas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '20px 20px 0 0',
            padding: '24px 32px',
            marginBottom: '0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Shield size={28} color="#ef4444" />
              <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
                Panel Super Administrador
              </h1>
            </div>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: 'none',
                      background: selectedTab === tab.id ? 
                        'linear-gradient(135deg, #ef4444, #dc2626)' : 
                        'rgba(255,255,255,0.05)',
                      color: selectedTab === tab.id ? '#fff' : 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: selectedTab === tab.id ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                  >
                    <IconComponent size={18} />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contenido de la pestaña */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderTop: 'none',
            borderRadius: '0 0 20px 20px',
            minHeight: '600px'
          }}>
            {selectedTab === 'administradores' && renderAdministradores()}
            {selectedTab === 'dashboard' && (
              <div style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
                minHeight: '100vh',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {/* Header del Dashboard */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                      }}>
                        <BarChart3 size={40} color="#fff" />
                      </div>
                      <div>
                        <h1 style={{ 
                          fontSize: '2.2rem', 
                          fontWeight: '800', 
                          color: '#fff',
                          margin: 0,
                          background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          Dashboard Principal
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                          Resumen general del sistema y estadísticas institucionales
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#10b981', fontSize: '1.8rem', fontWeight: '700' }}>
                          {new Date().toLocaleDateString('es-ES', { day: '2-digit' })}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                          {new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de Estadísticas Principales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  {/* Total Usuarios */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                      }}>
                        <Users size={28} color="#fff" />
                      </div>
                      <TrendingUp size={24} color="#10b981" />
                    </div>
                    <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
                      1,247
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '12px' }}>
                      Total Usuarios
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.2)', 
                        color: '#10b981', 
                        padding: '4px 8px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600' 
                      }}>
                        +12.5%
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>vs mes anterior</span>
                    </div>
                  </div>

                  {/* Estudiantes Activos */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                      }}>
                        <GraduationCap size={28} color="#fff" />
                      </div>
                      <TrendingUp size={24} color="#10b981" />
                    </div>
                    <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
                      892
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '12px' }}>
                      Estudiantes Activos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.2)', 
                        color: '#10b981', 
                        padding: '4px 8px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600' 
                      }}>
                        +8.3%
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>este semestre</span>
                    </div>
                  </div>

                  {/* Cursos Disponibles */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(245, 158, 11, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                      }}>
                        <FileText size={28} color="#fff" />
                      </div>
                      <Activity size={24} color="#f59e0b" />
                    </div>
                    <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
                      24
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '12px' }}>
                      Cursos Disponibles
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: 'rgba(245, 158, 11, 0.2)', 
                        color: '#f59e0b', 
                        padding: '4px 8px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600' 
                      }}>
                        +3 nuevos
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>este mes</span>
                    </div>
                  </div>

                  {/* Ingresos */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 24px rgba(239, 68, 68, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
                      }}>
                        <DollarSign size={28} color="#fff" />
                      </div>
                      <TrendingUp size={24} color="#10b981" />
                    </div>
                    <div style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
                      $45.2K
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: '12px' }}>
                      Ingresos Mensuales
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.2)', 
                        color: '#10b981', 
                        padding: '4px 8px', 
                        borderRadius: '8px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600' 
                      }}>
                        +15.7%
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>vs mes anterior</span>
                    </div>
                  </div>
                </div>

                {/* Gráficos y Análisis */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', marginBottom: '32px' }}>
                  {/* Gráfico de Inscripciones */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <div>
                        <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0, marginBottom: '8px' }}>
                          Inscripciones por Mes
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem' }}>
                          Tendencia de nuevos estudiantes
                        </p>
                      </div>
                      <BarChart3 size={24} color="rgba(255,255,255,0.5)" />
                    </div>
                    
                    {/* Gráfico simulado con barras */}
                    <div style={{ display: 'flex', alignItems: 'end', gap: '12px', height: '200px', marginBottom: '20px' }}>
                      {[65, 85, 45, 92, 78, 88, 95, 72, 89, 94, 87, 96].map((height, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                          <div style={{
                            width: '100%',
                            height: `${height * 2}px`,
                            background: `linear-gradient(135deg, #ef4444, #dc2626)`,
                            borderRadius: '4px 4px 0 0',
                            marginBottom: '8px',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            animation: `fadeIn 0.8s ease-out ${index * 0.1}s both`
                          }} />
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>
                            {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Inscripciones</span>
                        </div>
                      </div>
                      <div style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '700' }}>
                        +23% este año
                      </div>
                    </div>
                  </div>

                  {/* Panel de Estado del Sistema */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                  }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', margin: 0, marginBottom: '20px' }}>
                      Estado del Sistema
                    </h3>
                    
                    {/* Indicadores de estado */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Server size={20} color="#10b981" />
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Servidor</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Online</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Database size={20} color="#10b981" />
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Base de Datos</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                          <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>Activa</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Wifi size={20} color="#f59e0b" />
                          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Conexión</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600' }}>Lenta</span>
                        </div>
                      </div>
                    </div>

                    {/* Uso de recursos */}
                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', margin: 0, marginBottom: '16px' }}>
                        Uso de Recursos
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>CPU</span>
                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>67%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '67%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '3px' }} />
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Memoria</span>
                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>43%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '43%', height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '3px' }} />
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Almacenamiento</span>
                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>78%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: '78%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '3px' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actividad Reciente */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '32px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                      Actividad Reciente
                    </h3>
                    <button style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Eye size={14} />
                      Ver todo
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { icon: UserPlus, color: '#10b981', action: 'Nuevo estudiante registrado', user: 'María González', time: 'Hace 5 min' },
                      { icon: Edit3, color: '#3b82f6', action: 'Perfil actualizado', user: 'Carlos Ruiz', time: 'Hace 12 min' },
                      { icon: FileText, color: '#f59e0b', action: 'Nuevo curso creado', user: 'Prof. Ana López', time: 'Hace 1 hora' },
                      { icon: CheckCircle, color: '#10b981', action: 'Pago procesado', user: 'Sistema', time: 'Hace 2 horas' },
                      { icon: AlertTriangle, color: '#ef4444', action: 'Error en backup', user: 'Sistema', time: 'Hace 3 horas' }
                    ].map((activity, index) => {
                      const IconComponent = activity.icon;
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '16px',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          transition: 'all 0.2s ease'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${activity.color}, ${activity.color}dd)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${activity.color}33`
                          }}>
                            <IconComponent size={20} color="#fff" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                              {activity.action}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                              {activity.user}
                            </div>
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                            {activity.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            {selectedTab === 'logs' && (
              <div style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
                minHeight: '100vh',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {/* Header de Logs */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                      }}>
                        <FileText size={40} color="#fff" />
                      </div>
                      <div>
                        <h1 style={{ 
                          fontSize: '2.2rem', 
                          fontWeight: '800', 
                          color: '#fff',
                          margin: 0,
                          background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          Logs del Sistema
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                          Registro completo de actividades y eventos del sistema
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <RefreshCw size={14} />
                        Actualizar
                      </button>
                      <button style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10b981',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <Download size={14} />
                        Exportar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filtros de Logs */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '32px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    {/* Búsqueda */}
                    <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}>
                        <Search size={20} />
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar en logs..."
                        style={{
                          width: '100%',
                          padding: '14px 16px 14px 50px',
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>

                    {/* Filtro por Tipo */}
                    <select style={{
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      minWidth: '150px'
                    }}>
                      <option value="all">Todos los tipos</option>
                      <option value="info">Información</option>
                      <option value="warning">Advertencias</option>
                      <option value="error">Errores</option>
                      <option value="success">Éxito</option>
                    </select>

                    {/* Filtro por Fecha */}
                    <input
                      type="date"
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                {/* Lista de Logs */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                  {/* Header de la tabla */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 200px 150px 120px',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tipo
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Mensaje
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Usuario/Sistema
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      IP Address
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Fecha/Hora
                    </div>
                  </div>

                  {/* Filas de logs */}
                  <div>
                    {[
                      { type: 'success', icon: CheckCircle, color: '#10b981', message: 'Usuario autenticado correctamente', user: 'admin@instituto.edu', ip: '192.168.1.100', time: '22:35:12', date: '26/08/2025' },
                      { type: 'info', icon: Users, color: '#3b82f6', message: 'Nuevo estudiante registrado en el sistema', user: 'Sistema', ip: '192.168.1.1', time: '22:30:45', date: '26/08/2025' },
                      { type: 'warning', icon: AlertTriangle, color: '#f59e0b', message: 'Intento de acceso con credenciales incorrectas', user: 'usuario@test.com', ip: '192.168.1.150', time: '22:28:33', date: '26/08/2025' },
                      { type: 'error', icon: AlertCircle, color: '#ef4444', message: 'Error en la conexión a la base de datos', user: 'Sistema', ip: 'localhost', time: '22:25:18', date: '26/08/2025' },
                      { type: 'success', icon: Save, color: '#10b981', message: 'Backup automático completado exitosamente', user: 'Sistema', ip: 'localhost', time: '22:00:00', date: '26/08/2025' },
                      { type: 'info', icon: Edit3, color: '#3b82f6', message: 'Perfil de usuario actualizado', user: 'maria.gonzalez@instituto.edu', ip: '192.168.1.120', time: '21:45:22', date: '26/08/2025' },
                      { type: 'warning', icon: Server, color: '#f59e0b', message: 'Alto uso de CPU detectado (85%)', user: 'Sistema', ip: 'localhost', time: '21:30:15', date: '26/08/2025' },
                      { type: 'success', icon: DollarSign, color: '#10b981', message: 'Pago procesado correctamente', user: 'carlos.ruiz@instituto.edu', ip: '192.168.1.135', time: '21:15:08', date: '26/08/2025' },
                      { type: 'error', icon: Wifi, color: '#ef4444', message: 'Pérdida de conexión temporal', user: 'Sistema', ip: 'localhost', time: '21:00:45', date: '26/08/2025' },
                      { type: 'info', icon: FileText, color: '#3b82f6', message: 'Nuevo curso creado: "Matemáticas Avanzadas"', user: 'prof.lopez@instituto.edu', ip: '192.168.1.110', time: '20:45:30', date: '26/08/2025' }
                    ].map((log, index) => {
                      const IconComponent = log.icon;
                      return (
                        <div
                          key={index}
                          style={{
                            padding: '20px 24px',
                            borderBottom: index < 9 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 200px 150px 120px',
                            gap: '20px',
                            alignItems: 'center',
                            background: log.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 
                                       log.type === 'warning' ? 'rgba(245, 158, 11, 0.05)' :
                                       log.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                            transition: 'all 0.2s ease',
                            animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                          }}
                        >
                          {/* Tipo */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              background: `linear-gradient(135deg, ${log.color}, ${log.color}dd)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${log.color}33`
                            }}>
                              <IconComponent size={18} color="#fff" />
                            </div>
                          </div>

                          {/* Mensaje */}
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                              {log.message}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {log.type}
                            </div>
                          </div>

                          {/* Usuario */}
                          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                            {log.user}
                          </div>

                          {/* IP */}
                          <div style={{ 
                            color: 'rgba(255,255,255,0.7)', 
                            fontSize: '0.8rem',
                            fontFamily: 'monospace',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            {log.ip}
                          </div>

                          {/* Fecha/Hora */}
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>
                              {log.time}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                              {log.date}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Paginación */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  marginTop: '24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                    Mostrando 1-10 de 1,247 registros
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {[1, 2, 3, '...', 125].map((page, index) => (
                      <button
                        key={index}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: 'none',
                          background: page === 1 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.1)',
                          color: page === 1 ? '#fff' : 'rgba(255,255,255,0.7)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: page !== '...' ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {selectedTab === 'config' && (
              <div style={{
                padding: '32px',
                background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
                minHeight: '100vh',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {/* Header de Configuración */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '32px',
                  marginBottom: '32px',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                    }}>
                      <Settings size={40} color="#fff" />
                    </div>
                    <div>
                      <h1 style={{ 
                        fontSize: '2.2rem', 
                        fontWeight: '800', 
                        color: '#fff',
                        margin: 0,
                        background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Configuración del Sistema
                      </h1>
                      <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                        Configuraciones generales y perfil del Super Administrador
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid de Configuraciones */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  
                  {/* Perfil del Super Administrador */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)'
                      }}>
                        <UserCheck size={24} color="#fff" />
                      </div>
                      <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                        Perfil del Administrador
                      </h2>
                    </div>

                    {/* Foto de Perfil */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                      <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '700' }}>SA</span>
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          right: '8px',
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                          <Edit3 size={16} color="#fff" />
                        </div>
                      </div>
                      <button style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        margin: '0 auto'
                      }}>
                        <Plus size={14} />
                        Cambiar Foto
                      </button>
                    </div>

                    {/* Información del Perfil */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          defaultValue="Super Administrador"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="superadmin@instituto.edu"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          defaultValue="+593 99 123 4567"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>

                      <button style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.2s',
                        marginTop: '16px'
                      }}>
                        <Save size={16} />
                        Guardar Cambios
                      </button>
                    </div>
                  </div>

                  {/* Seguridad y Contraseña */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '20px',
                    padding: '32px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
                      }}>
                        <Key size={24} color="#fff" />
                      </div>
                      <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                        Seguridad
                      </h2>
                    </div>

                    {/* Cambiar Contraseña */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Contraseña Actual
                        </label>
                        <input
                          type="password"
                          placeholder="Ingresa tu contraseña actual"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          placeholder="Mínimo 8 caracteres"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                          Confirmar Nueva Contraseña
                        </label>
                        <input
                          type="password"
                          placeholder="Repite la nueva contraseña"
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '1rem',
                            transition: 'all 0.2s'
                          }}
                        />
                      </div>

                      <button style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.2s'
                      }}>
                        <Lock size={16} />
                        Cambiar Contraseña
                      </button>
                    </div>

                    {/* Configuración de Seguridad */}
                    <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
                        Configuración de Seguridad
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                              Autenticación de dos factores
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                              Añade una capa extra de seguridad
                            </div>
                          </div>
                          <div style={{
                            width: '48px',
                            height: '24px',
                            background: '#10b981',
                            borderRadius: '12px',
                            position: 'relative',
                            cursor: 'pointer'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              background: '#fff',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              transition: 'all 0.2s'
                            }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>
                              Notificaciones de inicio de sesión
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                              Recibe alertas de nuevos accesos
                            </div>
                          </div>
                          <div style={{
                            width: '48px',
                            height: '24px',
                            background: '#10b981',
                            borderRadius: '12px',
                            position: 'relative',
                            cursor: 'pointer'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              background: '#fff',
                              borderRadius: '50%',
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              transition: 'all 0.2s'
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuraciones del Sistema */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '20px',
                  padding: '32px',
                  marginTop: '32px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                    }}>
                      <Server size={24} color="#fff" />
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '700', margin: 0 }}>
                      Configuraciones del Sistema
                    </h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {/* Configuración de Backup */}
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Database size={20} color="#10b981" />
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                          Backup Automático
                        </h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Configura la frecuencia de respaldos automáticos
                      </p>
                      <select style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        marginBottom: '16px'
                      }}>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem' }}>
                        <CheckCircle size={16} />
                        Último backup: Hoy 22:00
                      </div>
                    </div>

                    {/* Configuración de Notificaciones */}
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Mail size={20} color="#3b82f6" />
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                          Notificaciones
                        </h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Gestiona las notificaciones del sistema
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                          Errores críticos
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                          <input type="checkbox" defaultChecked style={{ accentColor: '#3b82f6' }} />
                          Nuevos registros
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                          <input type="checkbox" style={{ accentColor: '#3b82f6' }} />
                          Actualizaciones del sistema
                        </label>
                      </div>
                    </div>

                    {/* Configuración de Mantenimiento */}
                    <div style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <Activity size={20} color="#f59e0b" />
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                          Mantenimiento
                        </h3>
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Herramientas de mantenimiento del sistema
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button style={{
                          padding: '8px 16px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          borderRadius: '6px',
                          color: '#f59e0b',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}>
                          Limpiar caché
                        </button>
                        <button style={{
                          padding: '8px 16px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '6px',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}>
                          Optimizar BD
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PanelSuperAdmin;
            