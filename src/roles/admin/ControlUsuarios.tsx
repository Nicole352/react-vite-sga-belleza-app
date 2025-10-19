import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Power, KeyRound, AlertCircle, Shield, GraduationCap, UserCheck, X, UserCircle, Clock, Activity, BookOpen, Monitor, Globe, Calendar, CheckCircle, XCircle, Edit, Trash2, Plus, DollarSign, FileText, CreditCard, Building2 } from 'lucide-react';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import '../../styles/responsive.css';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

interface Usuario {
  id_usuario: number;
  cedula: string;
  nombre: string;
  apellido: string;
  email: string | null;
  username: string | null;
  telefono: string | null;
  estado: 'activo' | 'inactivo' | 'pendiente';
  fecha_ultima_conexion: string | null;
  fecha_registro: string;
  nombre_rol: string;
  // Trazabilidad
  creado_por?: string;
  fecha_creacion?: string;
  modificado_por?: string;
  fecha_modificacion?: string;
  // Información académica (estudiantes)
  cursos_matriculados?: number;
  pagos_pendientes?: number;
  pagos_completados?: number;
  // Información académica (docentes)
  cursos_asignados?: number;
  estudiantes_activos?: number;
  // Actividad del sistema
  matriculas_aprobadas?: number;
  pagos_verificados?: number;
  total_acciones?: number;
}

interface Sesion {
  id_sesion: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  fecha_cierre?: string;
  activa: boolean;
}

interface Accion {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  descripcion?: string;
  detalles?: string;
  ip_address: string;
  fecha_operacion: string;
}

interface Pago {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_pago: string;
  metodo_pago: string;
  numero_comprobante: string;
  banco_comprobante?: string;
  recibido_por?: string;
  estado: string;
  observaciones?: string;
  curso_nombre: string;
  curso_codigo: string;
}

interface Deber {
  id_entrega: number;
  fecha_entrega: string;
  calificacion?: number;
  comentario_docente?: string;
  estado: string;
  archivo_nombre: string;
  archivo_size_kb: number;
  deber_titulo: string;
  deber_descripcion?: string;
  deber_fecha_limite: string;
  curso_nombre: string;
  curso_codigo: string;
  docente_nombre?: string;
}

interface Stats {
  totalUsuarios: number;
  usuariosActivos: number;
  usuariosInactivos: number;
  totalAdministradores: number;
  totalDocentes: number;
  totalEstudiantes: number;
}

const ControlUsuarios = () => {
  const { isMobile, isSmallScreen } = useBreakpoints();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosInactivos: 0,
    totalAdministradores: 0,
    totalDocentes: 0,
    totalEstudiantes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtros
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('todos');
  const [estadoFilter, setEstadoFilter] = useState('todos');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal de detalle
  const [showModal, setShowModal] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [tabActiva, setTabActiva] = useState<'info' | 'sesiones' | 'acciones'>('info');
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [acciones, setAcciones] = useState<Accion[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [deberes, setDeberes] = useState<any[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<{ tipo: 'activar' | 'desactivar', usuario: Usuario } | null>(null);

  // Modal de credenciales
  const [showCredencialesModal, setShowCredencialesModal] = useState(false);
  const [credenciales, setCredenciales] = useState<{ username: string, password_temporal: string } | null>(null);

  useEffect(() => {
    cargarUsuarios();
    cargarStats();
  }, [search, rolFilter, estadoFilter, page]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/usuarios?search=${search}&rol=${rolFilter}&estado=${estadoFilter}&page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Obtener ID del usuario logueado
      let idUsuarioLogueado = null;
      try {
        const meResponse = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (meResponse.ok) {
          const meData = await meResponse.json();
          idUsuarioLogueado = meData.id_usuario;
        }
      } catch (err) {
        console.error('Error obteniendo usuario logueado:', err);
      }

      // SEGURIDAD: Filtrar SuperAdmin y el admin logueado - no deben aparecer en Control de Usuarios
      const usuariosFiltrados = (data.usuarios || []).filter(
        (usuario: Usuario) =>
          usuario.nombre_rol?.toLowerCase() !== 'superadmin' &&
          usuario.id_usuario !== idUsuarioLogueado
      );

      setUsuarios(usuariosFiltrados);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const cargarStats = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/usuarios/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al cargar estadísticas');

      const data = await response.json();
      setStats(data.stats);
    } catch (err: any) {
      console.error('Error al cargar stats:', err);
    }
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return 'Nunca';
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case 'administrativo':
      case 'superadmin':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'docente':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'estudiante':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactivo':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };


  const verDetalle = async (usuario: Usuario) => {
    setShowModal(true);
    setTabActiva('info');

    setLoadingModal(true);
    try {
      const token = sessionStorage.getItem('auth_token');

      // Cargar datos completos del usuario (incluye info académica para docentes)
      try {
        const usuarioRes = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usuarioRes.ok) {
          const usuarioData = await usuarioRes.json();
          console.log('?? Usuario completo recibido:', usuarioData);
          setUsuarioSeleccionado(usuarioData.usuario);
        } else {
          console.error('? Error al cargar usuario:', usuarioRes.status);
          setUsuarioSeleccionado(usuario); // Fallback al usuario de la lista
        }
      } catch (err) {
        console.error('? Error en fetch de usuario:', err);
        setUsuarioSeleccionado(usuario); // Fallback al usuario de la lista
      }

      // Cargar sesiones desde la tabla sesiones_usuario
      try {
        const sesionesRes = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}/sesiones?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sesionesRes.ok) {
          const sesionesData = await sesionesRes.json();
          console.log('?? Sesiones recibidas:', sesionesData);
          setSesiones(sesionesData.sesiones || []);
        } else {
          console.error('? Error al cargar sesiones:', sesionesRes.status);
          setSesiones([]);
        }
      } catch (err) {
        console.error('? Error en fetch de sesiones:', err);
        setSesiones([]);
      }

      // Cargar acciones desde la tabla auditoria_sistema
      try {
        const accionesRes = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}/acciones?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (accionesRes.ok) {
          const accionesData = await accionesRes.json();
          console.log('?? Acciones recibidas:', accionesData);
          setAcciones(accionesData.acciones || []);
        } else {
          console.error('? Error al cargar acciones:', accionesRes.status);
          setAcciones([]);
        }
      } catch (err) {
        console.error('? Error en fetch de acciones:', err);
        setAcciones([]);
      }

      // Cargar pagos si es estudiante
      if (usuario.nombre_rol?.toLowerCase() === 'estudiante') {
        try {
          const pagosRes = await fetch(`${API_BASE}/usuarios-actividad/${usuario.id_usuario}/pagos?limite=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (pagosRes.ok) {
            const pagosData = await pagosRes.json();
            console.log('?? Pagos recibidos:', pagosData);
            setPagos(pagosData.pagos || []);
          } else {
            console.error('? Error al cargar pagos:', pagosRes.status);
            setPagos([]);
          }
        } catch (err) {
          console.error('? Error en fetch de pagos:', err);
          setPagos([]);
        }

        // Cargar deberes si es estudiante
        try {
          const deberesRes = await fetch(`${API_BASE}/usuarios-actividad/${usuario.id_usuario}/deberes?limite=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (deberesRes.ok) {
            const deberesData = await deberesRes.json();
            console.log('?? Deberes recibidos:', deberesData);
            setDeberes(deberesData.deberes || []);
          } else {
            console.error('? Error al cargar deberes:', deberesRes.status);
            setDeberes([]);
          }
        } catch (err) {
          console.error('? Error en fetch de deberes:', err);
          setDeberes([]);
        }
      } else {
        setPagos([]);
        setDeberes([]);
      }
    } catch (err) {
      console.error('Error al cargar datos del modal:', err);
      setSesiones([]);
      setAcciones([]);
      setPagos([]);
      setDeberes([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const confirmarCambioEstado = (usuario: Usuario) => {
    const nuevoEstado = usuario.estado === 'activo' ? 'desactivar' : 'activar';
    setAccionConfirmar({ tipo: nuevoEstado, usuario });
    setShowConfirmModal(true);
  };

  const cambiarEstado = async () => {
    if (!accionConfirmar) return;

    try {
      const token = sessionStorage.getItem('auth_token');
      const nuevoEstado = accionConfirmar.tipo === 'activar' ? 'activo' : 'inactivo';

      const response = await fetch(`${API_BASE}/usuarios/${accionConfirmar.usuario.id_usuario}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar estado');
      }

      await cargarUsuarios();
      await cargarStats();
      setShowConfirmModal(false);
      setAccionConfirmar(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetearPassword = async (usuario: Usuario) => {
    if (!confirm(`¿Estás seguro de resetear la contraseña de ${usuario.nombre} ${usuario.apellido}?`)) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al resetear contraseña');

      const data = await response.json();
      setCredenciales(data.credenciales);
      setShowCredencialesModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="responsive-padding">
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '0.75rem' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.375rem' : '0.625rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}>
          <Users size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Control de Usuarios
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
        }}>
          Gestiona todos los usuarios del sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? '0.75rem' : '0.875rem',
        marginBottom: isMobile ? '1rem' : '1.125rem'
      }}>
        {/* Total Usuarios */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.0625rem solid rgba(255,255,255,0.08)',
          borderRadius: '0.75em',
          padding: '0.75em',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.5em' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '0.375em',
              padding: '0.35em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={14} color="#ef4444" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35em', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Total Usuarios</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalUsuarios}
          </p>
        </div>

        {/* Activos */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserCheck size={14} color="#10b981" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35rem', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Activos</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.usuariosActivos}
          </p>
        </div>

        {/* Inactivos */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Power size={14} color="#ef4444" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35rem', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Inactivos</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.usuariosInactivos}
          </p>
        </div>

        {/* Admins */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Shield size={14} color="#ef4444" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35rem', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Admins</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalAdministradores}
          </p>
        </div>

        {/* Docentes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserCheck size={14} color="#3b82f6" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35rem', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Docentes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalDocentes}
          </p>
        </div>

        {/* Estudiantes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              borderRadius: '0.375rem',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <GraduationCap size={14} color="#22c55e" strokeWidth={2} />
            </div>
            <h3 style={{ color: 'rgba(50,50,60,1)', fontSize: '0.35rem', fontWeight: '400', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif', lineHeight: '1.2' }}>Estudiantes</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.98)', fontSize: 'clamp(1.5rem, 3vw, 1.75rem)', fontWeight: '700', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', lineHeight: '1', letterSpacing: '-0.02em' }}>
            {loading ? '...' : stats.totalEstudiantes}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ marginBottom: isMobile ? '1.25rem' : '2rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '0.75rem' : '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: isMobile ? 'none' : '1',
            minWidth: isMobile ? 'auto' : '18.75rem',
            position: 'relative'
          }}>
            <Search style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '1.25rem',
              height: '1.25rem',
              color: 'rgba(255,255,255,0.5)'
            }} />
            <input
              type="text"
              placeholder={isMobile ? "Buscar..." : "Buscar por nombre, username o email..."}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                padding: '0.625em 0.75em 0.625em 2.5em',
                borderRadius: '0.5em',
                border: '0.0625rem solid #e2e8f0',
                backgroundColor: 'rgba(255,255,255,0.1)',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.95)'
              }}
            />
          </div>

          <select
            value={rolFilter}
            onChange={(e) => {
              setRolFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.625em 1em',
              borderRadius: '0.5em',
              border: '0.0625rem solid #e2e8f0',
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <option value="todos">Todos los roles</option>
            <option value="administrativo">Administrativo</option>
            <option value="docente">Docente</option>
            <option value="estudiante">Estudiante</option>
          </select>

          <select
            value={estadoFilter}
            onChange={(e) => {
              setEstadoFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: '0.625em 1em',
              borderRadius: '0.5em',
              border: '0.0625rem solid #e2e8f0',
              backgroundColor: 'rgba(255,255,255,0.1)',
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.95)',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
      </div >

      {/* Tabla de usuarios */}
      {
        loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
            <p className="mt-4 opacity-70">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="text-center py-12 opacity-70">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <>
            {/* Indicador de scroll en móvil */}
            {isSmallScreen && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '0.5rem',
                padding: '8px 0.75rem',
                marginBottom: '0.75rem',
                color: '#ef4444',
                fontSize: '0.75rem',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem'
              }}>
                <span>??</span>
                <span>Desliza horizontalmente para ver toda la tabla</span>
                <span>??</span>
              </div>
            )}

            <div className="responsive-table-container" style={{
              overflowX: 'auto',
              borderRadius: '0.75em',
              border: '0.0625rem solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              boxShadow: '0 0.0625rem 0.1875em rgba(0,0,0,0.3)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{
                  borderBottom: '0.125rem solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)'
                }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Usuario</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Nombre Completo</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Rol</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Última Conexión</th>
                    <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600', color: '#a3a3a3', fontSize: '0.85rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario} style={{
                      borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)',
                      transition: 'background-color 0.2s'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#e5e5e5' }}>
                          {usuario.username || usuario.email}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '500', color: '#ffffff', marginBottom: '0.25rem' }}>
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>{usuario.cedula}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                          {usuario.nombre_rol}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#e5e5e5' }}>{usuario.email || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.85rem', color: '#e5e5e5' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => verDetalle(usuario)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #3b82f6',
                              backgroundColor: 'transparent',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#3b82f6';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#3b82f6';
                            }}
                            title="Ver detalle"
                          >
                            <Eye style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            onClick={() => confirmarCambioEstado(usuario)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              border: `1px solid ${usuario.estado === 'activo' ? '#ef4444' : '#10b981'}`,
                              backgroundColor: 'transparent',
                              color: usuario.estado === 'activo' ? '#ef4444' : '#10b981',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              const color = usuario.estado === 'activo' ? '#ef4444' : '#10b981';
                              e.currentTarget.style.backgroundColor = color;
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              const color = usuario.estado === 'activo' ? '#ef4444' : '#10b981';
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = color;
                            }}
                            title={usuario.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            <Power style={{ width: '1rem', height: '1rem' }} />
                          </button>
                          <button
                            onClick={() => resetearPassword(usuario)}
                            style={{
                              padding: '0.5rem',
                              borderRadius: '0.5rem',
                              border: '1px solid #f59e0b',
                              backgroundColor: 'transparent',
                              color: '#f59e0b',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f59e0b';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#f59e0b';
                            }}
                            title="Resetear contraseña"
                          >
                            <KeyRound style={{ width: '1rem', height: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '0.75rem' : '0',
                padding: isMobile ? '16px' : '20px 1.5rem',
                marginTop: isMobile ? '16px' : '1.5rem',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '1rem',
              }}>
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  Página {page} de {totalPages} • Total: {usuarios.length} usuarios
                </div>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: isMobile ? '4px' : '0.375rem',
                      padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                      background: page === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '0.625rem',
                      color: page === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: 600,
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      flex: isMobile ? '1' : 'initial'
                    }}
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      style={{
                        padding: isMobile ? '8px 0.625rem' : '8px 0.875rem',
                        background: page === pageNum ? `linear-gradient(135deg, ${RedColorPalette.primary}, ${RedColorPalette.primaryDark})` : 'rgba(255,255,255,0.08)',
                        border: page === pageNum ? `1px solid ${RedColorPalette.primary}` : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '0.625rem',
                        color: '#fff',
                        fontSize: isMobile ? '0.8rem' : '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: isMobile ? '36px' : '2.5rem',
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: isMobile ? '4px' : '0.375rem',
                      padding: isMobile ? '8px 0.75rem' : '8px 1rem',
                      background: page === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '0.625rem',
                      color: page === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontWeight: 600,
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      flex: isMobile ? '1' : 'initial'
                    }}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )
      }

      {/* Modales */}
      <ModalDetalle
        show={showModal}
        usuario={usuarioSeleccionado}
        tabActiva={tabActiva}
        sesiones={sesiones}
        acciones={acciones}
        pagos={pagos}
        deberes={deberes}
        loadingModal={loadingModal}
        onClose={() => setShowModal(false)}
        onChangeTab={setTabActiva}
        formatFecha={formatFecha}
        getRolColor={getRolColor}
        getEstadoColor={getEstadoColor}
      />

      <ModalConfirmacion
        show={showConfirmModal}
        accion={accionConfirmar}
        onConfirm={cambiarEstado}
        onCancel={() => {
          setShowConfirmModal(false);
          setAccionConfirmar(null);
        }}
      />

      <ModalCredenciales
        show={showCredencialesModal}
        credenciales={credenciales}
        onClose={() => {
          setShowCredencialesModal(false);
          setCredenciales(null);
        }}
      />
    </div >
  );
};

// ============================================
// COMPONENTES DE MODALES
// ============================================

interface ModalDetalleProps {
  show: boolean;
  usuario: Usuario | null;
  tabActiva: 'info' | 'sesiones' | 'acciones';
  sesiones: Sesion[];
  acciones: Accion[];
  pagos: Pago[];
  deberes: Deber[];
  loadingModal: boolean;
  onClose: () => void;
  onChangeTab: (tab: 'info' | 'sesiones' | 'acciones') => void;
  formatFecha: (fecha: string | null) => string;
  getRolColor: (rol: string) => string;
  getEstadoColor: (estado: string) => string;
}

const ModalDetalle = ({
  show,
  usuario,
  tabActiva,
  sesiones,
  acciones,
  pagos,
  deberes,
  loadingModal,
  onClose,
  onChangeTab,
  formatFecha,
  getRolColor,
  getEstadoColor
}: ModalDetalleProps) => {
  // Verificación temprana
  if (!show || !usuario) return null;

  // Verificar si el usuario es estudiante
  const esEstudiante = usuario.nombre_rol?.toLowerCase() === 'estudiante';

  // Debug: Log para verificar datos
  console.log('?? Modal - Datos recibidos:', {
    esEstudiante,
    pagosLength: pagos?.length || 0,
    deberesLength: deberes?.length || 0,
    tabActiva
  });

  return (
    <div
      onClick={onClose}
      data-modal-overlay="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1.25rem',
      } as React.CSSProperties}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75rem',
          width: '100%',
          maxWidth: '900px',
          color: '#fff',
          margin: '0 auto',
          boxShadow: '0 25px 3.125rem -0.75rem rgba(0, 0, 0, 0.6)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 1.75rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserCircle style={{ width: '1.75rem', height: '1.75rem', color: '#ef4444' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                marginBottom: '0.25rem',
                letterSpacing: '-0.02em'
              }}>
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                margin: 0
              }}>
                {usuario.username || usuario.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.5rem',
              padding: '0.375rem',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <X style={{ width: '1.125rem', height: '1.125rem' }} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <button
            onClick={() => onChangeTab('info')}
            style={{
              flex: 1,
              padding: '16px 1.5rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'info' ? '#ef4444' : 'rgba(255,255,255,0.6)',
              borderBottom: tabActiva === 'info' ? '2px solid #ef4444' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'info') e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'info') e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <UserCircle style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Información General
          </button>
          <button
            onClick={() => onChangeTab('sesiones')}
            style={{
              flex: 1,
              padding: '16px 1.5rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'sesiones' ? '#ef4444' : 'rgba(255,255,255,0.6)',
              borderBottom: tabActiva === 'sesiones' ? '2px solid #ef4444' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'sesiones') e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'sesiones') e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Últimas Sesiones
          </button>
          <button
            onClick={() => onChangeTab('acciones')}
            style={{
              flex: 1,
              padding: '16px 1.5rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: 'transparent',
              color: tabActiva === 'acciones' ? '#ef4444' : 'rgba(255,255,255,0.6)',
              borderBottom: tabActiva === 'acciones' ? '2px solid #ef4444' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-1px'
            }}
            onMouseEnter={(e) => {
              if (tabActiva !== 'acciones') e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
            }}
            onMouseLeave={(e) => {
              if (tabActiva !== 'acciones') e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <Activity style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Últimas Acciones
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1, backgroundColor: 'transparent' }}>
          {tabActiva === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Información Básica */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <UserCircle style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
                  Información Básica
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>CÉDULA</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.cedula}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ROL</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                      {usuario.nombre_rol}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>EMAIL</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.email || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>TELÉFONO</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.telefono || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ESTADO</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ÚLTIMA CONEXIÓN</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
                  </div>
                </div>
              </div>

              {/* Trazabilidad del Sistema */}
              <div style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                padding: '1.25rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#fbbf24',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Shield style={{ width: '1.25rem', height: '1.25rem', color: '#f59e0b' }} />
                  Trazabilidad del Sistema
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CREADO POR</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                      {usuario.creado_por || 'Sistema'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>FECHA DE CREACIÓN</div>
                    <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                      {formatFecha(usuario.fecha_creacion || usuario.fecha_registro)}
                    </div>
                  </div>
                  {usuario.modificado_por && (
                    <>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>MODIFICADO POR</div>
                        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                          {usuario.modificado_por}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>ÚLTIMA MODIFICACIÓN</div>
                        <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                          {formatFecha(usuario.fecha_modificacion || null)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Información Académica - ESTUDIANTES */}
              {usuario.nombre_rol?.toLowerCase() === 'estudiante' && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CURSOS MATRICULADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.cursos_matriculados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS COMPLETADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.pagos_completados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS PENDIENTES</div>
                      <div style={{ fontSize: '1.5rem', color: '#ef4444', fontWeight: '700' }}>
                        {usuario.pagos_pendientes || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información Académica - DOCENTES */}
              {usuario.nombre_rol?.toLowerCase() === 'docente' && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CURSOS ASIGNADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.cursos_asignados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>ESTUDIANTES ACTIVOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.estudiantes_activos || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actividad del Sistema - ADMIN */}
              {usuario.nombre_rol?.toLowerCase() === 'administrativo' && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Activity style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
                    Actividad del Sistema
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>MATRÍCULAS APROBADAS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.matriculas_aprobadas || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS VERIFICADOS</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.pagos_verificados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>TOTAL ACCIONES</div>
                      <div style={{ fontSize: '1.5rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.total_acciones || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tabActiva === 'sesiones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {loadingModal ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '2rem',
                    height: '2rem',
                    border: '4px solid #fee2e2',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : sesiones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Clock style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'rgba(255,255,255,0.3)' }} />
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>No hay sesiones registradas para este usuario</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Las sesiones aparecer�n cuando el usuario inicie sesi�n</p>
                </div>
              ) : (
                sesiones.map((sesion) => {
                  // Detectar dispositivo y navegador del user agent
                  const userAgent = sesion.user_agent || '';
                  const esMovil = /Mobile|Android|iPhone|iPad/i.test(userAgent);
                  const navegador = userAgent.includes('Chrome') ? 'Chrome' :
                    userAgent.includes('Firefox') ? 'Firefox' :
                      userAgent.includes('Safari') ? 'Safari' :
                        userAgent.includes('Edge') ? 'Edge' : 'Otro';

                  return (
                    <div key={sesion.id_sesion} style={{
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      border: sesion.activa ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: sesion.activa ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderRadius: '0.625rem',
                            backgroundColor: sesion.activa ? '#10b981' : 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {sesion.activa ? <CheckCircle size={20} color="#fff" /> : <XCircle size={20} color="#fff" />}
                          </div>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>
                              {sesion.activa ? 'Sesi�n Activa' : 'Sesi�n Finalizada'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              {esMovil ? <Monitor size={14} /> : <Globe size={14} />}
                              <span>{esMovil ? 'M�vil' : 'Escritorio'} � {navegador}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: sesion.activa ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: sesion.activa ? '#10b981' : 'rgba(255,255,255,0.7)'
                        }}>
                          ID: {sesion.id_sesion.substring(0, 8)}...
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                          <Calendar size={16} color="#ef4444" />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Inicio de Sesi�n</div>
                            <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{formatFecha(sesion.fecha_inicio)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                          <Clock size={16} color={sesion.activa ? '#10b981' : '#ef4444'} />
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                              {sesion.activa ? 'Expira' : 'Cerr� Sesi�n'}
                            </div>
                            <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                              {sesion.activa ? formatFecha(sesion.fecha_expiracion) : formatFecha(sesion.fecha_cierre || sesion.fecha_expiracion)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.375rem' }}>User Agent:</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all' }}>{sesion.user_agent}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tabActiva === 'acciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loadingModal ? (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '2rem',
                    height: '2rem',
                    border: '4px solid #fee2e2',
                    borderTop: '4px solid #ef4444',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              ) : (
                <>
                  {/* Secci�n de Pagos - Solo para estudiantes */}
                  {esEstudiante && pagos && pagos.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <DollarSign size={20} color='#10b981' />
                        Pagos Realizados ({pagos.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {pagos.map((pago) => (
                          <div key={pago.id_pago} style={{
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  borderRadius: '0.625rem',
                                  backgroundColor: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <DollarSign size={20} color="#fff" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>
                                    Pago Cuota #{pago.numero_cuota} - ${parseFloat(String(pago.monto)).toFixed(2)}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                                    {pago.curso_nombre} ({pago.curso_codigo})
                                  </div>
                                </div>
                              </div>
                              <span style={{
                                padding: '4px 0.75rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backgroundColor: pago.estado === 'verificado' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                color: pago.estado === 'verificado' ? '#10b981' : '#fbbf24'
                              }}>
                                {pago.estado === 'verificado' ? 'Verificado' : 'Pagado'}
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                <Calendar size={16} color="#10b981" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Fecha de Pago</div>
                                  <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{formatFecha(pago.fecha_pago)}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                {pago.metodo_pago === 'transferencia' ? <Building2 size={16} color="#3b82f6" /> : <CreditCard size={16} color="#f59e0b" />}
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>M�todo de Pago</div>
                                  <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)', textTransform: 'capitalize' }}>{pago.metodo_pago}</div>
                                </div>
                              </div>
                              {pago.numero_comprobante && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <FileText size={16} color="rgba(255,255,255,0.6)" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>N� Comprobante</div>
                                    <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{pago.numero_comprobante}</div>
                                  </div>
                                </div>
                              )}
                              {pago.recibido_por && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <UserCircle size={16} color="#f59e0b" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Recibido por</div>
                                    <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{pago.recibido_por}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secci�n de Deberes - Solo para estudiantes */}
                  {esEstudiante && deberes && deberes.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={20} color="#3b82f6" />
                        Deberes Entregados ({deberes.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {deberes.map((deber) => (
                          <div key={deber.id_entrega} style={{
                            padding: '1.25rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            transition: 'all 0.3s ease'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{
                                  width: '2.5rem',
                                  height: '2.5rem',
                                  borderRadius: '0.625rem',
                                  backgroundColor: '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <BookOpen size={20} color="#fff" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>
                                    {deber.deber_titulo}
                                  </div>
                                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                                    {deber.curso_nombre} ({deber.curso_codigo})
                                  </div>
                                </div>
                              </div>
                              {deber.calificacion !== null && deber.calificacion !== undefined && (
                                <span style={{
                                  padding: '4px 0.75rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: deber.calificacion >= 7 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: deber.calificacion >= 7 ? '#10b981' : '#ef4444'
                                }}>
                                  {deber.calificacion}/10
                                </span>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                <Calendar size={16} color="#3b82f6" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Fecha de Entrega</div>
                                  <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{formatFecha(deber.fecha_entrega)}</div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                <FileText size={16} color="rgba(255,255,255,0.6)" />
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Archivo</div>
                                  <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{deber.archivo_nombre}</div>
                                </div>
                              </div>
                              {deber.docente_nombre && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', gridColumn: '1 / -1' }}>
                                  <UserCircle size={16} color="rgba(255,255,255,0.6)" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Docente</div>
                                    <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{deber.docente_nombre}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            {deber.comentario_docente && (
                              <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.375rem' }}>Comentario del Docente:</div>
                                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{deber.comentario_docente}</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secci�n de Acciones de Auditor�a */}
                  {acciones.length === 0 && (!esEstudiante || (pagos.length === 0 && deberes.length === 0)) ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <Activity style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: 'rgba(255,255,255,0.3)' }} />
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>No hay acciones registradas para este usuario</p>
                      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Las acciones aparecer�n cuando el usuario realice cambios en el sistema</p>
                    </div>
                  ) : acciones.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} color="#ef4444" />
                        Acciones del Sistema ({acciones.length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {acciones.map((accion) => {
                          // Determinar icono y color seg�n operaci�n
                          const operacionConfig = {
                            'INSERT': { icono: Plus, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Creaci�n' },
                            'UPDATE': { icono: Edit, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: 'Actualizaci�n' },
                            'DELETE': { icono: Trash2, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', label: 'Eliminaci�n' }
                          }[accion.operacion] || { icono: Activity, color: 'rgba(255,255,255,0.7)', bg: 'rgba(100, 116, 139, 0.2)', label: accion.operacion };

                          return (
                            <div key={accion.id_auditoria} style={{
                              padding: '1.25rem',
                              borderRadius: '0.75rem',
                              border: `1px solid ${operacionConfig.color}40`,
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              transition: 'all 0.3s ease'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{
                                    width: '2.5rem',
                                    height: '2.5rem',
                                    borderRadius: '0.625rem',
                                    backgroundColor: operacionConfig.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}>
                                    {React.createElement(operacionConfig.icono, { size: 20, color: '#fff' })}
                                  </div>
                                  <div>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>
                                      {accion.descripcion || operacionConfig.label}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: '600' }}>
                                      {accion.detalles || `Tabla: ${accion.tabla_afectada}`}
                                    </div>
                                  </div>
                                </div>
                                <span style={{
                                  padding: '4px 0.75rem',
                                  borderRadius: '0.375rem',
                                  fontSize: '0.75rem',
                                  fontWeight: '600',
                                  backgroundColor: operacionConfig.bg,
                                  color: operacionConfig.color
                                }}>
                                  {operacionConfig.label}
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                  <Calendar size={16} color="#ef4444" />
                                  <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Fecha de Operaci�n</div>
                                    <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>{formatFecha(accion.fecha_operacion)}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ModalConfirmacionProps {
  show: boolean;
  accion: { tipo: 'activar' | 'desactivar', usuario: Usuario } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ModalConfirmacionProps {
  show: boolean;
  accion: { tipo: 'activar' | 'desactivar', usuario: Usuario } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModalConfirmacion = ({ show, accion, onConfirm, onCancel }: ModalConfirmacionProps) => {
  if (!show || !accion) return null;

  return (
    <div
      data-modal-overlay="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
      } as React.CSSProperties}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '31.25rem',
        padding: '18px 1.75rem 1.375rem 1.75rem',
        color: '#fff',
        margin: '0 auto',
        boxShadow: '0 25px 3.125rem -0.75rem rgba(0, 0, 0, 0.6)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          {accion.tipo === 'activar' ? 'Activar Usuario' : 'Desactivar Usuario'}
        </h3>
        <p style={{ marginBottom: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          �Est�s seguro de {accion.tipo} a <strong style={{ color: '#fff' }}>{accion.usuario.nombre} {accion.usuario.apellido}</strong>?
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '10px 1rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '10px 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: accion.tipo === 'activar' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            {accion.tipo === 'activar' ? 'Activar' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ModalCredencialesProps {
  show: boolean;
  credenciales: { username: string, password_temporal: string } | null;
  onClose: () => void;
}

interface ModalCredencialesProps {
  show: boolean;
  credenciales: { username: string, password_temporal: string } | null;
  onClose: () => void;
}

const ModalCredenciales = ({ show, credenciales, onClose }: ModalCredencialesProps) => {
  if (!show || !credenciales) return null;

  return (
    <div
      data-modal-overlay="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
      } as React.CSSProperties}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,26,0.95) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '31.25rem',
        padding: '18px 1.75rem 1.375rem 1.75rem',
        color: '#fff',
        margin: '0 auto',
        boxShadow: '0 25px 3.125rem -0.75rem rgba(0, 0, 0, 0.6)',
      }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          🔐 Contrase�a Reseteada
        </h3>
        <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          Las nuevas credenciales son:
        </p>
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem',
          borderRadius: '0.5rem',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Usuario</div>
            <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.username}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Contrase�a Temporal</div>
            <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.password_temporal}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
          ⚠️ El usuario deber� cambiar esta contrase�a en su primer inicio de sesi�n.
        </p>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};


export default ControlUsuarios;




