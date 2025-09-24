import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Edit3, X, Key, Trash2, Lock, Unlock, Save,
  AlertCircle, Check, Search, Filter, RefreshCw, Download, Clock, CheckCircle,
  GraduationCap, DollarSign, Database, Settings, BarChart3, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

// Tipos
interface Admin {
  id: number;
  // nombre completo para mostrar en la lista
  nombre: string;
  // nombres y apellidos separados para edición
  firstName?: string;
  lastName?: string;
  // campos adicionales
  cedula?: string;
  apellido?: string; // mantener compatibilidad si se usa en otra parte
  email: string;
  telefono?: string;
  fechaCreacion?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  genero?: string;
  foto_perfil?: string;
  ultimoAcceso?: string;
  estado: 'activo' | 'inactivo';
  permisos: string[];
  rol: string;
  rolId?: number;
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

  // Roles visibles: SOLO 'administrativo'
  const visibleRoles = roles.filter(r => r.nombre_rol?.toLowerCase() === 'administrativo');

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
          // Mostrar nombre completo en la lista
          nombre: d.nombre ? `${d.nombre}${d.apellido ? ' ' + d.apellido : ''}` : (d.nombre_completo || d.fullName || d.email || 'Sin nombre'),
          // Guardar nombres y apellidos por separado para el modal de edición
          firstName: d.nombre || d.firstName || '',
          lastName: d.apellido || d.lastName || '',
          cedula: d.cedula || d.num_documento || '',
          email: d.email || d.correo || '',
          telefono: d.telefono || '',
          fechaCreacion: d.fecha_registro || d.fechaCreacion || '',
          fecha_nacimiento: d.fecha_nacimiento || d.fechaNacimiento || '',
          direccion: d.direccion || d.dirección || '',
          genero: d.genero || d.genero_sexo || '',
          foto_perfil: d.foto_perfil || d.foto || d.avatar || '',
          ultimoAcceso: d.fecha_ultima_conexion || d.ultimo_acceso || d.ultimoAcceso || '',
          estado: (d.estado === 'activo' || d.estado === 'inactivo') ? d.estado : 'activo',
          permisos: Array.isArray(d.permisos) ? d.permisos : [],
          rol: d.rol?.nombre || d.nombre_rol || d.rol || 'Administrador',
          rolId: d.rol?.id_rol || d.id_rol || d.rolId || undefined
        }));
        setAdministradores(mapped);
      }
    } catch (e) {
      console.error('Error cargando administradores', e);
    }
  };

  // Helper para mostrar fechas legibles en la tabla: dd/MM/yyyy HH:mm
  const formatDateTime = (d?: string): string => {
    if (!d) return '-';
    try {
      // Si ya viene en formato ISO o fecha válida
      const date = new Date(d);
      if (isNaN(date.getTime())) return d; // Dejar como viene si no parsea
      const pad = (n: number) => String(n).padStart(2, '0');
      const day = pad(date.getDate());
      const month = pad(date.getMonth() + 1);
      const year = date.getFullYear();
      const hours = pad(date.getHours());
      const mins = pad(date.getMinutes());
      return `${day}/${month}/${year} ${hours}:${mins}`;
    } catch {
      return d;
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
    if (verifier !== digits[9]) return { ok: false, reason: 'Cédula incorrecta: Por favor verifique y corrija el número ingresado' };
    return { ok: true };
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null)?.value?.trim() || '';

  // Helper para normalizar fechas al formato yyyy-MM-dd que esperan los inputs type="date"
  const formatDateForInput = (d?: string): string => {
    try {
      if (!d) return '';
      // Si ya viene en formato yyyy-MM-dd lo devolvemos tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      const date = new Date(d);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

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
      ['new-admin-cedula','new-admin-nombre','new-admin-apellido','new-admin-email','new-admin-telefono','new-admin-fecha-nacimiento','new-admin-genero','new-admin-direccion','new-admin-password','new-admin-confirm','new-admin-role']
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
    // Capturar valores del formulario
    const firstName = getVal('edit-admin-nombre').trim();
    const lastName = getVal('edit-admin-apellido').trim();
    const email = getVal('edit-admin-email').trim();
    const telefono = getVal('edit-admin-telefono');
    const rolId = getVal('edit-admin-rol');
    const fecha_nacimiento = getVal('edit-admin-fecha-nacimiento');
    const genero = getVal('edit-admin-genero');
    const direccion = getVal('edit-admin-direccion');

    if (!firstName || !email) {
      showNotification('Nombres y Email son obligatorios para actualizar', 'error');
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token') || localStorage.getItem('auth_token') || localStorage.getItem('token');

      // Revisar si hay archivo de foto
      const fotoInput = document.getElementById('edit-admin-foto-file') as HTMLInputElement | null;
      const fotoFile = fotoInput?.files?.[0] || null;

      let res: Response;
      // Derivar roleName desde el rolId seleccionado (cuando exista)
      const roleIdNum = Number(rolId) || undefined;
      const roleName = roleIdNum ? (visibleRoles.find(r => r.id_rol === roleIdNum)?.nombre_rol || '') : '';

      if (fotoFile) {
        // Usar FormData si se adjunta foto
        const fd = new FormData();
        fd.append('nombre', firstName);
        if (lastName) fd.append('apellido', lastName);
        fd.append('email', email);
        if (telefono) fd.append('telefono', telefono);
        if (fecha_nacimiento) fd.append('fecha_nacimiento', fecha_nacimiento);
        // No enviar genero para evitar problemas de ENUM en la BD
        if (direccion) fd.append('direccion', direccion);
        if (roleIdNum) fd.append('rolId', String(roleIdNum));
        if (roleName) fd.append('roleName', roleName);
        // Enviar permisos como array en FormData
        (selectedAdmin?.permisos || []).forEach((p: string) => fd.append('permisos[]', p));
        fd.append('foto_perfil', fotoFile);

        res = await fetch(`${API_BASE}/admins/${selectedAdmin?.id}`, {
          method: 'PUT',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: fd
        });
      } else {
        // JSON normal si no hay foto
        const payload: any = {
          nombre: firstName,
          apellido: lastName || undefined,
          email,
          telefono,
          fecha_nacimiento: fecha_nacimiento || undefined,
          // No enviar genero para evitar problemas de ENUM en la BD
          direccion: direccion || undefined,
          rolId: roleIdNum,
          roleName: roleName || undefined,
          permisos: selectedAdmin?.permisos || []
        };

        res = await fetch(`${API_BASE}/admins/${selectedAdmin?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error('Error al actualizar admin', res.status, errText);
        showNotification(`Error actualizando (${res.status}): ${errText || 'sin detalle'}`, 'error');
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
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.04)) !important;
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
          }
          
          .action-btn {
            transition: all 0.2s ease;
          }
          
          .action-btn:hover {
            transform: scale(1.1);
          }

          /* Error text in red - force override */
          .error-text-red {
            color: #ef4444 !important;
          }

          /* Tabla responsive */
          .admins-grid {
            display: grid;
            grid-template-columns: minmax(200px, 1.2fr) minmax(180px, 1fr) minmax(100px, 0.6fr) minmax(140px, 0.8fr) 140px;
            gap: 16px;
            align-items: center;
          }
          .admins-grid-header {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
            border-bottom: 1px solid rgba(239, 68, 68, 0.2);
            padding: 20px 24px;
          }

          @media (max-width: 1100px) {
            .admins-grid {
              grid-template-columns: minmax(220px, 1.3fr) minmax(200px, 1fr) minmax(110px, 0.6fr) minmax(160px, 0.8fr) 140px;
            }
          }
          @media (max-width: 900px) {
            .admins-grid {
              grid-template-columns: minmax(220px, 1.6fr) minmax(180px, 1fr) minmax(110px, 0.8fr) 140px;
            }
            .col-estado { display: none; }
          }
          @media (max-width: 720px) {
            .admins-grid {
              grid-template-columns: minmax(200px, 1.6fr) minmax(160px, 1fr) 120px;
            }
            .col-email { display: none; }
            .col-estado { display: none; }
          }
          @media (max-width: 520px) {
            .admins-grid {
              grid-template-columns: 1fr 1fr; /* Admin | Último acceso; Acciones caerá abajo */
            }
            .col-acciones { grid-column: 1 / span 2; justify-content: flex-end; }
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
                fontSize: '2.2rem', 
                fontWeight: '800', 
                color: 'var(--superadmin-text-primary, var(--admin-text-primary, #1e293b))', 
                margin: 0
              }}>
                Gestión de Administradores
              </h1>
              <p style={{ 
                color: 'var(--superadmin-text-secondary, var(--admin-text-secondary, rgba(30,41,59,0.8)))', 
                marginTop: '8px', 
                margin: 0, 
                fontSize: '1.1rem' 
              }}>
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
        <div className="admins-grid admins-grid-header" style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08))',
          borderBottom: '2px solid rgba(239, 68, 68, 0.3)',
          padding: '24px'
        }}>
          <div className="col-admin" style={{ 
            color: 'var(--superadmin-text-primary, var(--admin-text-primary, #fff))', 
            fontWeight: '800', 
            fontSize: '0.95rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Administrador
          </div>
          <div className="col-email" style={{ 
            color: 'var(--superadmin-text-primary, var(--admin-text-primary, #fff))', 
            fontWeight: '800', 
            fontSize: '0.95rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Email
          </div>
          <div className="col-estado" style={{ 
            color: 'var(--superadmin-text-primary, var(--admin-text-primary, #fff))', 
            fontWeight: '800', 
            fontSize: '0.95rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Estado
          </div>
          <div className="col-ultimo" style={{ 
            color: 'var(--superadmin-text-primary, var(--admin-text-primary, #fff))', 
            fontWeight: '800', 
            fontSize: '0.95rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Último Acceso
          </div>
          <div className="col-acciones" style={{ 
            color: 'var(--superadmin-text-primary, var(--admin-text-primary, #fff))', 
            fontWeight: '800', 
            fontSize: '0.95rem', 
            textTransform: 'uppercase', 
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
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
                className="admin-card admins-grid"
                style={{
                  padding: '20px 24px',
                  borderBottom: index < filteredAdministradores.length - 1 ? '2px solid rgba(255,255,255,0.12)' : 'none',
                  background: admin.estado === 'activo'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.02))'
                    : 'linear-gradient(135deg, rgba(107, 114, 128, 0.06), rgba(107, 114, 128, 0.02))',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Información del administrador */}
                <div className="col-admin" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '45px', 
                    height: '45px', 
                    minWidth: '45px',
                    minHeight: '45px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)', 
                    position: 'relative',
                    flexShrink: 0
                  }}>
                    <span style={{ 
                      color: '#fff', 
                      fontWeight: '700', 
                      fontSize: '1rem',
                      textAlign: 'center',
                      lineHeight: '1'
                    }}>
                      {admin.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                    <div style={{
                      position: 'absolute', 
                      bottom: '-2px', 
                      right: '-2px',
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%',
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
                <div className="col-email" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', wordBreak: 'break-word' }}>
                  {admin.email}
                </div>

                {/* Estado */}
                <div className="col-estado">
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
                <div className="col-ultimo" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  {formatDateTime(admin.ultimoAcceso)}
                </div>

                {/* Acciones */}
                <div className="col-acciones" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Tooltip content="Editar">
                    <button
                      onClick={() => {
                        // Intentar inferir rolId si no existe usando el nombre del rol
                        const matchedRole = visibleRoles.find(r => r.nombre_rol?.toLowerCase() === (admin.rol || '').toLowerCase());
                        // Derivar nombres si faltan usando el nombre completo
                        const full = (admin.nombre || '').trim();
                        const parts = full.split(/\s+/);
                        const derivedFirst = admin.firstName && admin.firstName.trim().length > 0
                          ? admin.firstName
                          : (parts.length > 1 ? parts.slice(0, parts.length - 1).join(' ') : parts[0] || '');
                        const derivedLast = admin.lastName && admin.lastName.trim().length > 0
                          ? admin.lastName
                          : (parts.length > 1 ? parts[parts.length - 1] : (admin.apellido || ''));
                        setSelectedAdmin({
                          ...admin,
                          firstName: derivedFirst,
                          lastName: derivedLast,
                          permisos: (admin.permisos || []),
                          rolId: admin.rolId || matchedRole?.id_rol
                        });
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
                  {cedulaError && (
                    <p className="error-text-red" style={{ margin: '6px 0 0 0', fontSize: '0.8rem', fontWeight: '600' }}>
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

              {/* Dirección con validación - ocupa toda la fila */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Dirección
                </label>
                <textarea
                  id="new-admin-direccion"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  placeholder="Calle Ejemplo 123, Ciudad&#10;Sector, Barrio&#10;Ciudad, Provincia"
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.value = t.value.toUpperCase();
                  }}
                />
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

      {/* Edit Admin Modal: estilos unificados con el de crear */}
      {showEditAdminModal && selectedAdmin && (
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
                  <Edit3 size={24} color="#fff" />
                </div>
                <div>
                  <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>
                    Editar Administrador
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0 }}>
                    Actualiza la información del administrador seleccionado
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEditAdminModal(false)}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Cédula (solo lectura para evitar cambios accidentales) */}
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Cédula</label>
                <input id="edit-admin-cedula" defaultValue={selectedAdmin?.cedula || ''} readOnly style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#9ca3af' }} />
              </div>
              {/* Rol */}
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Rol</label>
                <select id="edit-admin-rol" defaultValue={selectedAdmin?.rolId ? String(selectedAdmin.rolId) : ''} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}>
                  <option value="">Sin cambio</option>
                  {visibleRoles.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                  ))}
                </select>
              </div>

              {/* Nombres y Apellidos */}
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Nombres</label>
                <input
                  id="edit-admin-nombre"
                  defaultValue={selectedAdmin?.firstName || ''}
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').toUpperCase();
                  }}
                  style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Apellidos</label>
                <input
                  id="edit-admin-apellido"
                  defaultValue={selectedAdmin?.lastName || selectedAdmin?.apellido || ''}
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/[^a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s]/g, '').toUpperCase();
                  }}
                  style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                />
              </div>

              {/* Email y Teléfono */}
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Email</label>
                <input id="edit-admin-email" type="email" defaultValue={selectedAdmin?.email} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Teléfono</label>
                <input
                  id="edit-admin-telefono"
                  defaultValue={selectedAdmin?.telefono || ''}
                  onInput={(e) => {
                    const t = e.target as HTMLInputElement;
                    t.value = t.value.replace(/\D/g, '');
                  }}
                  style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                />
              </div>

              {/* Fecha de Nacimiento y Género */}
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Fecha de Nacimiento</label>
                <input id="edit-admin-fecha-nacimiento" type="date" defaultValue={formatDateForInput(selectedAdmin?.fecha_nacimiento)} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>
              <div>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Género</label>
                <select id="edit-admin-genero" defaultValue={selectedAdmin?.genero || ''} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}>
                  <option value="">Sin especificar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Dirección (ocupa dos columnas) */}
              <div style={{ gridColumn: '1 / span 2' }}>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Dirección</label>
                <input id="edit-admin-direccion" defaultValue={selectedAdmin?.direccion || ''} style={{ width: '100%', padding: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
              </div>

              {/* Foto de perfil (opcional) */}
              <div style={{ gridColumn: '1 / span 2' }}>
                <label style={{ color: '#e5e7eb', fontSize: 12 }}>Foto de Perfil (opcional)</label>
                <input id="edit-admin-foto-file" type="file" accept="image/png,image/jpeg,image/webp" style={{ width: '100%', padding: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }} />
                {selectedAdmin?.foto_perfil && (
                  <div style={{ marginTop: 8, color: '#9ca3af', fontSize: 12 }}>
                    Imagen actual:
                    {(selectedAdmin.foto_perfil.startsWith('http') || selectedAdmin.foto_perfil.startsWith('data:')) ? (
                      <div style={{ marginTop: 8 }}>
                        <img src={selectedAdmin.foto_perfil} alt="Foto actual" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    ) : (
                      <span> {selectedAdmin.foto_perfil}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Permisos - estilo tarjetas con íconos, sincronizados con selectedAdmin */}
              <div style={{ gridColumn: '1 / span 2', marginTop: 8 }}>
                <label style={{ color: '#e5e7eb', fontSize: 12, display: 'block', marginBottom: 10 }}>Permisos del Sistema</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
                  {permisosDisponibles.map(permiso => {
                    const IconComponent = permiso.icon;
                    const isActive = selectedAdmin?.permisos?.includes(permiso.id);
                    return (
                      <div
                        key={permiso.id}
                        style={{
                          background: isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          transform: isActive ? 'scale(1.02)' : 'scale(1)'
                        }}
                        onClick={() => {
                          setSelectedAdmin((prev: Admin | null) => {
                            if (!prev) return prev;
                            const has = (prev.permisos || []).includes(permiso.id);
                            return {
                              ...prev,
                              permisos: has
                                ? (prev.permisos || []).filter((p: string) => p !== permiso.id)
                                : [ ...(prev.permisos || []), permiso.id ]
                            } as Admin;
                          });
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{
                            width: '24px', height: '24px', border: '2px solid rgba(239, 68, 68, 0.5)', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isActive ? '#ef4444' : 'transparent', transition: 'all 0.2s'
                          }}>
                            {isActive && <Check size={14} color="#fff" />}
                          </div>
                          <IconComponent size={20} color="rgba(255,255,255,0.8)" />
                          <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{permiso.nombre}</span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', margin: 0, paddingLeft: '36px' }}>{permiso.descripcion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditAdminModal(false)}
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
                onClick={handleEditAdmin}
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
                Actualizar
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