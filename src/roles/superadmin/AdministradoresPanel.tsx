import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit3, X, Key, Trash2, Lock, Unlock, Save,
  AlertCircle, Check, Search, Filter, RefreshCw, Download, Clock, CheckCircle,
  GraduationCap, DollarSign, Database, Settings, BarChart3, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

// Tipos
interface Admin {
  id: number;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  fechaCreacion?: string;
  ultimoAcceso?: string;
  estado: 'activo' | 'inactivo';
  permisos: string[];
  rol: string;
}

// Tooltip component
const Tooltip = ({ content, children }) => (
  <div className="relative inline-flex group">
    {children}
    <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-gray-900/95 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-50">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900/95" />
    </div>
  </div>
);

// Notificación local
const Notification: React.FC<{ message: string; type: 'success' | 'error' }>
  = ({ message, type }) => (
  <div
    style={{
      position: 'fixed', top: 20, right: 20, zIndex: 1000,
      background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
      color: type === 'success' ? '#10b981' : '#ef4444',
      padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 10px 24px rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)'
    }}
  >
    {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
    <span style={{ fontWeight: 600 }}>{message}</span>
  </div>
);

const AdministradoresPanel: React.FC = () => {
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [roles, setRoles] = useState<Array<{ id_rol: number; nombre_rol: string; descripcion?: string }>>([]);
  const API_BASE = 'http://localhost:3000/api';
  
  const [newAdmin, setNewAdmin] = useState({
    cedula: '', nombre: '', apellido: '', email: '', telefono: '', fecha_nacimiento: '',
    direccion: '', genero: '', foto_perfil: '', password: '', confirmPassword: '', permisos: [] as string[], rolId: ''
  });

  // Validaciones del primer archivo
  const [fileError, setFileError] = useState<string | null>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);
  const [cedulaValue, setCedulaValue] = useState<string>('');
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdConfirmError, setPwdConfirmError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState<boolean>(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState<boolean>(false);

  // Roles visibles (oculta superadmin)
  const visibleRoles = roles.filter(r => r.nombre_rol?.toLowerCase() !== 'superadmin');

  // Cargar admins del backend
  const loadAdmins = async () => {
    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/admins`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: Admin[] = data.map((d: any) => ({
          id: d.id || d.id_usuario || 0,
          nombre: d.nombre ? `${d.nombre}${d.apellido ? ' ' + d.apellido : ''}` : (d.nombre_completo || d.fullName || d.email || 'Sin nombre'),
          email: d.email || d.correo || '',
          telefono: d.telefono || '',
          fechaCreacion: d.fecha_registro || d.fechaCreacion || '',
          ultimoAcceso: d.fecha_ultima_conexion || d.ultimo_acceso || d.ultimoAcceso || '',
          estado: (d.estado === 'activo' || d.estado === 'inactivo') ? d.estado : 'activo',
          permisos: Array.isArray(d.permisos) ? d.permisos : [],
          rol: d.rol?.nombre || d.nombre_rol || d.rol || 'Administrador'
        }));
        setAdministradores(mapped);
      }
    } catch (e) {
      console.error('Error cargando administradores', e);
    }
  };

  // Cargar roles y admins al montar
  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/roles`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setRoles(data);
        }
      } catch (e) {
        console.error('Error cargando roles', e);
      }
    })();
    loadAdmins();
  }, []);
  // Administradores data
  const [administradores, setAdministradores] = useState<Admin[]>([]);

  // Permisos disponibles
  const permisosDisponibles = [
    { id: 'usuarios', nombre: 'Gestión de Usuarios', descripcion: 'Crear, editar y eliminar usuarios', icon: Users },
    { id: 'cursos', nombre: 'Gestión de Cursos', descripcion: 'Administrar cursos y programas', icon: GraduationCap },
    { id: 'reportes', nombre: 'Reportes y Estadísticas', descripcion: 'Acceso a reportes del sistema', icon: BarChart3 },
    { id: 'configuracion', nombre: 'Configuración del Sistema', descripcion: 'Cambiar configuraciones generales', icon: Settings },
    { id: 'pagos', nombre: 'Gestión de Pagos', descripcion: 'Administrar pagos y facturación', icon: DollarSign },
    { id: 'inventario', nombre: 'Control de Inventario', descripcion: 'Gestionar productos e inventario', icon: Database }
  ];

  // Validador estricto de cédula ecuatoriana (del primer archivo)
  const validateCedulaEC = (ced: string): { ok: boolean; reason?: string } => {
    if (!/^\d{10}$/.test(ced)) return { ok: false, reason: 'La cédula debe tener exactamente 10 dígitos' };
    if (/^(\d)\1{9}$/.test(ced)) return { ok: false, reason: 'La cédula es inválida (repetitiva)' };
    const prov = parseInt(ced.slice(0, 2), 10);
    if (prov < 1 || prov > 24) return { ok: false, reason: 'Código de provincia inválido (01-24)' };
    const digits = ced.split('').map(n => parseInt(n, 10));
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let val = digits[i];
      if ((i + 1) % 2 !== 0) {
        val = val * 2;
        if (val > 9) val -= 9;
      }
      sum += val;
    }
    const nextTen = Math.ceil(sum / 10) * 10;
    const verifier = (nextTen - sum) % 10;
    if (verifier !== digits[9]) return { ok: false, reason: 'Dígito verificador inválido' };
    return { ok: true };
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value?.trim() || '';

  // Funciones principales con validaciones del primer archivo
  const handleCreateAdmin = async () => {
    try {
      const cedula = cedulaValue || getVal('new-admin-cedula');
      const nombre = getVal('new-admin-nombre');
      const apellido = getVal('new-admin-apellido');
      const email = getVal('new-admin-email');
      const telefono = getVal('new-admin-telefono');
      const fecha_nacimiento = getVal('new-admin-fecha-nacimiento');
      const genero = getVal('new-admin-genero');
      const direccion = getVal('new-admin-direccion');
      const fotoInput = document.getElementById('new-admin-foto-file') as HTMLInputElement | null;
      const fotoFile = fotoInput?.files?.[0] || null;
      const password = getVal('new-admin-password');
      const confirmPassword = getVal('new-admin-confirm');

      if (!cedula || !nombre || !apellido || !email || !password) {
        showNotification('Cédula, Nombre, Apellido, Email y Contraseña son obligatorios', 'error');
        return;
      }

      // Validación estricta de cédula ecuatoriana
      const cedRes = validateCedulaEC(cedula);
      if (!cedRes.ok) {
        setCedulaError(cedRes.reason || 'Cédula inválida');
        showNotification(`Cédula inválida: ${cedRes.reason || ''}`.trim(), 'error');
        return;
      } else {
        setCedulaError(null);
      }

      if (password !== confirmPassword) {
        setPwdConfirmError('Las contraseñas no coinciden');
        return;
      } else {
        setPwdConfirmError(null);
      }

      if (password.length < 6) {
        setPwdError('La contraseña debe tener al menos 6 caracteres');
        return;
      } else {
        setPwdError(null);
      }

      // Validar tipo de archivo si se adjunta foto
      if (fotoFile) {
        const allowed = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowed.includes(fotoFile.type)) {
          setFileError('Formato no válido. Solo se permiten PNG, JPG o WEBP.');
          showNotification('La foto debe ser PNG, JPG o WEBP', 'error');
          return;
        } else {
          setFileError(null);
        }
      }

      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        showNotification('Sesión expirada. Vuelve a iniciar sesión.', 'error');
        return;
      }

      // Construir FormData para backend
      const fd = new FormData();
      fd.append('cedula', cedula);
      fd.append('nombre', nombre);
      fd.append('apellido', apellido);
      fd.append('email', email);
      if (telefono) fd.append('telefono', telefono);
      if (fecha_nacimiento) fd.append('fecha_nacimiento', fecha_nacimiento);
      if (direccion) fd.append('direccion', direccion);
      // No enviar genero para evitar problemas de ENUM en la BD
      if (fotoFile) fd.append('foto_perfil', fotoFile);
      fd.append('password', password);
      // Rol por nombre como en el backend
      const roleName = getVal('new-admin-role') || 'administrativo';
      fd.append('roleName', roleName);

      const res = await fetch(`${API_BASE}/admins`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) {
        const txt = await res.text();
        showNotification(`(${res.status}) ${txt || 'No se pudo crear el administrador'}`, 'error');
        return;
      }

      await loadAdmins();
      setShowCreateAdminModal(false);
      ['new-admin-cedula','new-admin-nombre','new-admin-apellido','new-admin-email','new-admin-telefono','new-admin-fecha-nacimiento','new-admin-genero','new-admin-direccion','new-admin-foto-file','new-admin-password','new-admin-confirm','new-admin-role']
        .forEach((id) => {
          const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
          if (el) (el as any).value = '';
        });
      setNewAdmin({ ...newAdmin, permisos: [] });
      setCedulaValue('');
      setFileError(null);
      setCedulaError(null);
      setPwdError(null);
      setPwdConfirmError(null);
      setShowPwd(false);
      setShowPwdConfirm(false);
      showNotification('Administrador creado exitosamente');
    } catch (e) {
      console.error(e);
      showNotification('Error inesperado creando administrador', 'error');
    }
  };

  const handleEditAdmin = async () => {
    const nombre = getVal('edit-admin-nombre');
    const email = getVal('edit-admin-email');
    const telefono = getVal('edit-admin-telefono');
    const rolId = getVal('edit-admin-rol');

    if (!nombre || !email) {
      showNotification('Nombre y email son obligatorios', 'error');
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admins/${selectedAdmin?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ nombre, email, telefono, rolId: Number(rolId) || undefined, permisos: selectedAdmin?.permisos || [] })
      });
      if (!res.ok) {
        const err = await res.text();
        showNotification(`Error actualizando: ${err || res.status}`, 'error');
        return;
      }
      await loadAdmins();
    } catch (e) {
      console.error(e);
      showNotification('Error inesperado al actualizar', 'error');
      return;
    }
    setShowEditAdminModal(false);
    setSelectedAdmin(null);
    showNotification('Administrador actualizado exitosamente');
  };

  const handleDeleteAdmin = async () => {
    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admins/${selectedAdmin?.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const err = await res.text();
        showNotification(`Error eliminando: ${err || res.status}`, 'error');
        return;
      }
      await loadAdmins();
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      showNotification('Administrador eliminado exitosamente');
    } catch (e) {
      console.error(e);
      showNotification('Error inesperado al eliminar', 'error');
    }
  };

  const handlePasswordReset = async () => {
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

    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admins/${selectedAdmin?.id}/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ password: passwordData.newPassword })
      });
      if (!res.ok) {
        const err = await res.text();
        showNotification(`Error actualizando contraseña: ${err || res.status}`, 'error');
        return;
      }
      setShowPasswordModal(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSelectedAdmin(null);
      showNotification('Contraseña actualizada exitosamente');
    } catch (e) {
      console.error(e);
      showNotification('Error inesperado al actualizar contraseña', 'error');
    }
  };

  const toggleAdminStatus = (admin) => {
    const newStatus = admin.estado === 'activo' ? 'inactivo' : 'activo';
    setAdministradores(administradores.map(a => 
      a.id === admin.id ? { ...a, estado: newStatus } : a
    ));
    showNotification(`Administrador ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const filteredAdministradores = administradores.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || admin.estado === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '32px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {notification && <Notification message={notification.message} type={notification.type} />}
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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
          }
          
          .action-btn:hover {
            transform: scale(1.1);
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
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
            }}>
              <Users size={40} color="#fff" />
            </div>
            <div>
              <h1 style={{ 
                fontSize: '2.2rem', fontWeight: '800', color: '#fff', margin: 0,
                background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                Gestión de Administradores
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', margin: 0, fontSize: '1.1rem' }}>
                Administra los usuarios con permisos del sistema institucional
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateAdminModal(true)}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', borderRadius: '16px', color: '#fff',
              padding: '16px 32px', fontSize: '1rem', fontWeight: '700',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 12px 28px rgba(239, 68, 68, 0.4)'
            }}
          >
            <UserPlus size={20} />
            Nuevo Administrador
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', padding: '24px', marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 50px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', color: '#fff', fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Filter size={20} color="rgba(255,255,255,0.7)" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 16px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                color: '#fff', fontSize: '0.9rem', cursor: 'pointer', minWidth: '120px'
              }}
            >
              <option value="all">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Administradores */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header de la tabla */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px 24px',
          display: 'grid', gridTemplateColumns: '1fr 200px 120px 150px 180px', gap: '20px', alignItems: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Administrador
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Email
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Estado
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Último Acceso
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', textAlign: 'center' }}>
            Acciones
          </div>
        </div>

        {/* Filas de administradores */}
        <div>
          {filteredAdministradores.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px' }}>
                No se encontraron administradores
              </div>
            </div>
          ) : (
            filteredAdministradores.map((admin, index) => (
              <div
                key={admin.id}
                className="admin-card"
                style={{
                  padding: '24px', borderBottom: index < filteredAdministradores.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  display: 'grid', gridTemplateColumns: '1fr 200px 120px 150px 180px', gap: '20px', alignItems: 'center',
                  background: admin.estado === 'activo' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), transparent)' : 'linear-gradient(135deg, rgba(107, 114, 128, 0.05), transparent)'
                }}
              >
                {/* Información del administrador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)', position: 'relative'
                  }}>
                    <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem' }}>
                      {admin.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                    <div style={{
                      position: 'absolute', bottom: '-2px', right: '-2px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: admin.estado === 'activo' ? '#10b981' : '#6b7280',
                      border: '2px solid rgba(0,0,0,0.9)'
                    }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>
                      {admin.nombre}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '2px' }}>
                      {admin.rol}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                      {admin.telefono}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {admin.email}
                </div>

                {/* Estado */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                    background: admin.estado === 'activo' ? 
                      'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))' : 
                      'linear-gradient(135deg, rgba(107, 114, 128, 0.2), rgba(107, 114, 128, 0.1))',
                    color: admin.estado === 'activo' ? '#10b981' : '#6b7280',
                    border: `1px solid ${admin.estado === 'activo' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`
                  }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: admin.estado === 'activo' ? '#10b981' : '#6b7280'
                    }} />
                    {admin.estado}
                  </span>
                </div>

                {/* Último acceso */}
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {admin.ultimoAcceso}
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Tooltip content="Editar">
                    <button
                      onClick={() => {
                        setSelectedAdmin({ ...admin, permisos: (admin.permisos || []) });
                        setShowEditAdminModal(true);
                      }}
                      className="action-btn"
                      style={{
                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
                        color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1))',
                        color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                        background: admin.estado === 'activo' ? 
                          'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))' :
                          'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                        color: admin.estado === 'activo' ? '#ef4444' : '#10b981',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))',
                        color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
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

      {/* Modal para crear administrador con validaciones del primer archivo */}
      {showCreateAdminModal && (
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
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '20px',
          paddingTop: '40px'
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
                onClick={() => {
                  setShowCreateAdminModal(false);
                  setCedulaValue('');
                  setCedulaError(null);
                  setFileError(null);
                }}
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

            {/* Formulario con validaciones */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {/* Cédula con validación estricta */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Cédula *
                </label>
                <input
                  id="new-admin-cedula"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: `1px solid ${cedulaError ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  placeholder="Ej: 0102030405"
                  value={cedulaValue}
                  autoFocus
                  onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    const onlyDigits = val.replace(/\D/g, '').slice(0, 10);
                    setCedulaValue(onlyDigits);
                    if (val !== onlyDigits) {
                      setCedulaError('Este dato es solo numérico');
                    } else if (onlyDigits.length === 10) {
                      const res = validateCedulaEC(onlyDigits);
                      setCedulaError(res.ok ? null : (res.reason || 'Cédula inválida'));
                    } else if (onlyDigits.length > 0 && onlyDigits.length < 10) {
                      setCedulaError('Debe tener 10 dígitos');
                    } else {
                      setCedulaError(null);
                    }
                  }}
                />
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    Debe contener 10 dígitos. Provincia 01-24 y dígito verificador válido.
                  </p>
                  {cedulaError && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {cedulaError}
                    </p>
                  )}
                </div>
              </div>

              {/* Rol (ocultando Superadmin) */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Rol *
                </label>
                <select
                  id="new-admin-role"
                  defaultValue={visibleRoles.find(r => r.nombre_rol?.toLowerCase() === 'administrativo') ? 'administrativo' : ''}
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
                  <option value="" style={{ color: '#000' }} disabled>Seleccionar rol</option>
                  {visibleRoles.map(r => (
                    <option key={r.id_rol} value={r.nombre_rol} style={{ color: '#000' }}>{r.nombre_rol}</option>
                  ))}
                </select>
              </div>

              {/* Nombres con validación */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Nombres *
                </label>
                <input
                  id="new-admin-nombre"
                  type="text"
                  required
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
                  placeholder="Ej: Juan Carlos"
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').toUpperCase();
                  }}
                />
              </div>

              {/* Apellidos con validación */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Apellidos *
                </label>
                <input
                  id="new-admin-apellido"
                  type="text"
                  required
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
                  placeholder="Ej: Pérez Gómez"
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').toUpperCase();
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Email *
                </label>
                <input
                  id="new-admin-email"
                  type="email"
                  required
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

              {/* Teléfono con validación */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Teléfono
                </label>
                <input
                  id="new-admin-telefono"
                  type="tel"
                  inputMode="numeric"
                  pattern="\\d*"
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
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/\D/g, '');
                  }}
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

              {/* Dirección con validación */}
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
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.toUpperCase();
                  }}
                />
              </div>

              {/* Foto con validación */}
              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Foto de Perfil
                </label>
                <input
                  id="new-admin-foto-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  style={{
                    width: '100%',
                    padding: '12px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${fileError ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s'
                  }}
                  onChange={(e) => {
                    const file = (e.target as HTMLInputElement).files?.[0] || null;
                    if (!file) { setFileError(null); return; }
                    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
                    if (!allowed.includes(file.type)) {
                      setFileError('Formato no válido. Solo se permiten PNG, JPG o WEBP.');
                    } else {
                      setFileError(null);
                    }
                  }}
                />
                <div style={{ marginTop: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    Formatos permitidos: PNG, JPG, WEBP
                  </p>
                  {fileError && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', color: '#ef4444' }}>
                      {fileError}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-admin-password"
                    type={showPwd ? 'text' : 'password'}
                    required
                    onInput={(e) => {
                      const v = (e.target as HTMLInputElement).value || '';
                      if (v.length < 6) {
                        setPwdError('Inserte una contraseña mínimo de 6 caracteres');
                      } else {
                        setPwdError(null);
                      }
                      // Si cambia la contraseña, revalidar confirmación
                      const confirmEl = document.getElementById('new-admin-confirm') as HTMLInputElement | null;
                      if (confirmEl) {
                        const c = confirmEl.value || '';
                        setPwdConfirmError(c && v !== c ? 'Las contraseñas no coinciden' : null);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 46px 14px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: `1px solid ${pwdError ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      transition: 'all 0.2s'
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
                    }}
                  >
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwdError && (
                  <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{pwdError}</div>
                )}
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Confirmar Contraseña *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-admin-confirm"
                    type={showPwdConfirm ? 'text' : 'password'}
                    required
                    onInput={(e) => {
                      const c = (e.target as HTMLInputElement).value || '';
                      const pEl = document.getElementById('new-admin-password') as HTMLInputElement | null;
                      const p = pEl?.value || '';
                      setPwdConfirmError(c && p !== c ? 'Las contraseñas no coinciden' : null);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 46px 14px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      border: `1px solid ${pwdConfirmError ? 'rgba(239, 68, 68, 0.6)' : 'rgba(255,255,255,0.2)'}`,
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '1rem',
                      transition: 'all 0.2s'
                    }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwdConfirm(v => !v)}
                    aria-label={showPwdConfirm ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer'
                    }}
                  >
                    {showPwdConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {pwdConfirmError && (
                  <div style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>{pwdConfirmError}</div>
                )}
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
                onClick={() => {
                  setShowCreateAdminModal(false);
                  setCedulaValue('');
                  setCedulaError(null);
                  setFileError(null);
                }}
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
      )}

      {/* Edit Admin Modal */}
      {showEditAdminModal && selectedAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '640px', maxWidth: '90%', background: 'linear-gradient(180deg, #0b0b0b, #1a1a1a)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Editar Administrador</h3>
              <button onClick={() => setShowEditAdminModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Nombre</label>
                <input id="edit-admin-nombre" defaultValue={selectedAdmin?.nombre} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Email</label>
                <input id="edit-admin-email" type="email" defaultValue={selectedAdmin?.email} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Teléfono</label>
                <input id="edit-admin-telefono" defaultValue={selectedAdmin?.telefono} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Rol</label>
                <select id="edit-admin-rol" defaultValue="" style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}>
                  <option value="">Sin cambio</option>
                  {roles.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / span 2' }}>
                <label style={{ color: '#e5e7eb', fontSize: 12, display: 'block', marginBottom: 6 }}>Permisos</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['usuarios','cursos','reportes','configuracion','pagos','inventario'].map((p: string) => (
                    <label key={p} style={{ color: '#e5e7eb', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="checkbox"
                        defaultChecked={selectedAdmin?.permisos?.includes(p)}
                        onChange={(e) => {
                          setSelectedAdmin((prev: Admin | null) => {
                            if (!prev) return prev;
                            return { ...prev, permisos: e.target.checked ? [...(prev.permisos||[]), p] : (prev.permisos||[]).filter((x: string) => x !== p) } as Admin;
                          });
                        }}
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowEditAdminModal(false)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#e5e7eb', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleEditAdmin} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '500px', maxWidth: '90%', background: 'linear-gradient(180deg, #0b0b0b, #1a1a1a)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Cambiar Contraseña</h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Nueva contraseña</label>
                <input type="password" value={passwordData.newPassword} onChange={(e)=>setPasswordData(p=>({...p, newPassword: e.target.value}))} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Confirmar contraseña</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e)=>setPasswordData(p=>({...p, confirmPassword: e.target.value}))} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowPasswordModal(false)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#e5e7eb', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handlePasswordReset} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Key size={16} /> Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: '480px', maxWidth: '90%', background: 'linear-gradient(180deg, #0b0b0b, #1a1a1a)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0 }}>Eliminar Administrador</h3>
              <button onClick={() => setShowDeleteModal(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ color: '#e5e7eb', marginBottom: 12 }}>
              ¿Está seguro que desea eliminar a <strong>{selectedAdmin?.nombre}</strong>? Esta acción no se puede deshacer.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#e5e7eb', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleDeleteAdmin} style={{ padding: '10px 16px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministradoresPanel;