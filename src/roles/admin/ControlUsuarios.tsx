import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, Power, KeyRound, AlertCircle, Shield, GraduationCap, UserCheck, X, UserCircle, Clock, Activity, BookOpen, Monitor, Globe, Calendar, CheckCircle, XCircle, DollarSign, FileText, ChevronLeft, ChevronRight, User, History, Zap, Lock, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import { RedColorPalette } from '../../utils/colorMapper';
import { useBreakpoints } from '../../hooks/useMediaQuery';
import LoadingModal from '../../components/LoadingModal';
import '../../styles/responsive.css';
import '../../utils/modalScrollHelper';

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
  foto_perfil?: string | null;
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
  user_agent: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  fecha_cierre?: string;
  activa: boolean;
}

interface Accion {
  id_auditoria?: number;
  tabla_afectada?: string;
  operacion?: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro?: number;
  descripcion?: string;
  detalles?: string | any;
  fecha_operacion?: string;
  // Nuevo formato detallado
  tipo_accion?: string;
  fecha_hora?: string;
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
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<{ tipo: 'activar' | 'desactivar' | 'resetear', usuario: Usuario } | null>(null);

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
      setShowLoadingModal(true);
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
      
      // DEBUG: Verificar fotos (simplificado para no mostrar base64 completo)
      const conFoto = data.usuarios?.filter((u: any) => u.foto_perfil).length || 0;
      console.log('📸 Usuarios con foto:', conFoto, 'de', data.usuarios?.length);

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
      // Cerrar modal después de un pequeño delay para que se vea
      setTimeout(() => setShowLoadingModal(false), 300);
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

      // Cargar historial detallado desde auditoria (administrativas y académicas)
      try {
        const historialRes = await fetch(`${API_BASE}/auditoria/usuario/${usuario.id_usuario}/historial-detallado?tipo=todas&limite=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (historialRes.ok) {
          const historialData = await historialRes.json();
          console.log('📋 Historial detallado recibido:', historialData);
          setAcciones(historialData.data?.acciones || []);
        } else {
          console.error('❌ Error al cargar historial:', historialRes.status);
          setAcciones([]);
        }
      } catch (err) {
        console.error('❌ Error en fetch de historial:', err);
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

  const cargarAccionesDetalladas = async (tipo: 'todas' | 'administrativas' | 'academicas') => {
    if (!usuarioSeleccionado) return;
    
    try {
      const token = sessionStorage.getItem('auth_token');
      const historialRes = await fetch(`${API_BASE}/auditoria/usuario/${usuarioSeleccionado.id_usuario}/historial-detallado?tipo=${tipo}&limite=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (historialRes.ok) {
        const historialData = await historialRes.json();
        console.log('📋 Historial detallado recibido:', historialData);
        
        // Parsear detalles si es string JSON
        const accionesParsed = (historialData.data?.acciones || []).map((accion: any) => {
          if (typeof accion.detalles === 'string') {
            try {
              accion.detalles = JSON.parse(accion.detalles);
            } catch (e) {
              console.warn('⚠️ No se pudo parsear detalles:', accion.detalles);
            }
          }
          return accion;
        });
        
        setAcciones(accionesParsed);
      } else {
        console.error('❌ Error al cargar historial:', historialRes.status);
        setAcciones([]);
      }
    } catch (err) {
      console.error('❌ Error en fetch de historial:', err);
      setAcciones([]);
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
      toast.success(`Usuario ${accionConfirmar.tipo === 'activar' ? 'activado' : 'desactivado'} correctamente`);
    } catch (err: any) {
      toast.error(err.message || 'Error al cambiar estado del usuario');
    }
  };

  const resetearPassword = (usuario: Usuario) => {
    setAccionConfirmar({ tipo: 'resetear', usuario });
    setShowConfirmModal(true);
  };

  const ejecutarResetearPassword = async () => {
    if (!accionConfirmar || accionConfirmar.tipo !== 'resetear') return;

    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/usuarios/${accionConfirmar.usuario.id_usuario}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al resetear contraseña');

      const data = await response.json();
      setCredenciales(data.credenciales);
      setShowConfirmModal(false);
      setAccionConfirmar(null);
      setShowCredencialesModal(true);
      toast.success('Contraseña reseteada correctamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al resetear contraseña');
      setShowConfirmModal(false);
      setAccionConfirmar(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '0.75rem' : '1.125rem' }}>
        <h2 className="responsive-title" style={{
          color: 'rgba(255,255,255,0.95)',
          margin: '0 0 0.375rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.375rem' : '0.625rem'
        }}>
          <Users size={isMobile ? 20 : 26} color={RedColorPalette.primary} />
          Control de Usuarios
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          margin: 0,
          fontSize: isMobile ? '0.75rem' : '0.85rem'
        }}>
          Gestiona todos los usuarios del sistema
        </p>
      </div>

      {/* Estadísticas - Compactas y horizontales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)',
        gap: isMobile ? '0.5rem' : '0.625rem',
        marginBottom: isMobile ? '1rem' : '1.125rem'
      }}>
        {/* Total Usuarios */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Users size={16} color="#ef4444" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Total</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.totalUsuarios}
            </div>
          </div>
        </div>

        {/* Activos */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserCheck size={16} color="#10b981" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Activos</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.usuariosActivos}
            </div>
          </div>
        </div>

        {/* Inactivos */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Power size={16} color="#ef4444" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Inactivos</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.usuariosInactivos}
            </div>
          </div>
        </div>

        {/* Admins */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={16} color="#ef4444" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Admins</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.totalAdministradores}
            </div>
          </div>
        </div>

        {/* Docentes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <UserCheck size={16} color="#3b82f6" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Docentes</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.totalDocentes}
            </div>
          </div>
        </div>

        {/* Estudiantes */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.625rem',
          padding: isMobile ? '0.625rem' : '0.5rem 0.75rem',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            background: 'rgba(34, 197, 94, 0.12)',
            borderRadius: '0.375rem',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <GraduationCap size={16} color="#22c55e" strokeWidth={2.5} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: '500', marginBottom: '0.125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Estudiantes</div>
            <div style={{ color: 'rgba(255,255,255,0.98)', fontSize: '1.375rem', fontWeight: '700', lineHeight: '1', letterSpacing: '-0.02em' }}>
              {loading ? '...' : stats.totalEstudiantes}
            </div>
          </div>
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
              borderRadius: isMobile ? '12px' : '1rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
              marginBottom: isMobile ? '12px' : '1.5rem'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{
                  borderBottom: '1px solid rgba(248, 113, 113, 0.3)',
                  background: 'rgba(248, 113, 113, 0.15)'
                }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Usuario</th>
                    <th style={{ textAlign: 'left', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Nombre Completo</th>
                    <th style={{ textAlign: 'left', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Rol</th>
                    <th style={{ textAlign: 'left', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Última Conexión</th>
                    <th style={{ textAlign: 'center', padding: '10px 0.75rem', fontWeight: '600', color: '#fff', fontSize: '0.75rem', textTransform: 'uppercase' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                          {usuario.username || usuario.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: '600', color: '#fff', marginBottom: '0.1875rem', fontSize: '0.8rem' }}>
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{usuario.cedula}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                          {usuario.nombre_rol}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{usuario.email || '-'}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
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
                            title={usuario.estado === 'activo' ? 'Bloquear usuario' : 'Desbloquear usuario'}
                          >
                            {usuario.estado === 'activo' ? (
                              <Lock style={{ width: '1rem', height: '1rem' }} />
                            ) : (
                              <Unlock style={{ width: '1rem', height: '1rem' }} />
                            )}
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
              <div className="pagination-container" style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '0.75rem' : '0',
                padding: isMobile ? '16px' : '20px 1.5rem',
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
                    <ChevronLeft size={isMobile ? 14 : 16} />
                    {!isMobile && 'Anterior'}
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
                    {!isMobile && 'Siguiente'}
                    <ChevronRight size={isMobile ? 14 : 16} />
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
        onRecargarAcciones={cargarAccionesDetalladas}
        formatFecha={formatFecha}
        getRolColor={getRolColor}
        getEstadoColor={getEstadoColor}
      />

      <ModalConfirmacion
        show={showConfirmModal}
        accion={accionConfirmar}
        onConfirm={() => {
          if (accionConfirmar?.tipo === 'resetear') {
            ejecutarResetearPassword();
          } else {
            cambiarEstado();
          }
        }}
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

      {/* Modal de carga */}
      <LoadingModal
        isOpen={showLoadingModal}
        message="Actualizando datos..."
        darkMode={true}
        duration={500}
        onComplete={() => setShowLoadingModal(false)}
        colorTheme="red"
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
  onRecargarAcciones: (tipo: 'todas' | 'administrativas' | 'academicas') => Promise<void>;
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
  onRecargarAcciones,
  formatFecha,
  getRolColor,
  getEstadoColor
}: ModalDetalleProps) => {
  // Estado local para filtro de acciones
  const [filtroAcciones, setFiltroAcciones] = React.useState<'todas' | 'administrativas' | 'academicas'>('todas');

  // Recargar acciones cuando cambie el filtro
  React.useEffect(() => {
    if (show && usuario) {
      onRecargarAcciones(filtroAcciones);
    }
  }, [filtroAcciones]);

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
  
  // DEBUG: Verificar foto en modal (simplificado)
  const tieneF = !!usuario.foto_perfil;
  const esString = typeof usuario.foto_perfil === 'string';
  console.log('🖼️ Avatar:', usuario.nombre, '- Foto:', tieneF ? '✅' : '❌', '- Tipo:', esString ? 'string' : typeof usuario.foto_perfil);

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{
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
          padding: '1rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: usuario.foto_perfil ? 'transparent' : 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: usuario.foto_perfil ? '2px solid rgba(239, 68, 68, 0.3)' : 'none'
            }}>
              {usuario.foto_perfil ? (
                <img 
                  src={usuario.foto_perfil} 
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.15); color: #ef4444; font-weight: 700; font-size: 0.875rem;">${usuario.nombre.charAt(0)}${usuario.apellido.charAt(0)}</div>`;
                  }}
                />
              ) : (
                <div style={{ color: '#ef4444', fontWeight: '700', fontSize: '0.875rem' }}>
                  {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h2 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                margin: 0,
                marginBottom: '0.125rem',
                letterSpacing: '-0.01em'
              }}>
                {usuario.nombre} {usuario.apellido}
              </h2>
              <p style={{
                fontSize: '0.75rem',
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
              padding: '0.625rem 1rem',
              fontWeight: '600',
              fontSize: '0.8rem',
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
            <User style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Información General
          </button>
          <button
            onClick={() => onChangeTab('sesiones')}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              fontWeight: '600',
              fontSize: '0.8rem',
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
            <History style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Últimas Sesiones
          </button>
          <button
            onClick={() => onChangeTab('acciones')}
            style={{
              flex: 1,
              padding: '0.625rem 1rem',
              fontWeight: '600',
              fontSize: '0.8rem',
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
            <Zap style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
            Últimas Acciones
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, backgroundColor: 'transparent' }}>
          {tabActiva === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Información Básica */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                padding: '1rem',
                borderRadius: '0.625rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.95)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <UserCircle style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                  Información Básica
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>CÉDULA</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.cedula}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ROL</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                      {usuario.nombre_rol}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>EMAIL</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.email || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>TELÉFONO</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{usuario.telefono || '-'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ESTADO</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                      {usuario.estado}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem', fontWeight: '600' }}>ÚLTIMA CONEXIÓN</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
                  </div>
                </div>
              </div>

              {/* Trazabilidad del Sistema */}
              <div style={{
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                padding: '1rem',
                borderRadius: '0.625rem',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#fbbf24',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Shield style={{ width: '1rem', height: '1rem', color: '#f59e0b' }} />
                  Trazabilidad del Sistema
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CREADO POR</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                      {usuario.creado_por || 'Sistema'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>FECHA DE CREACIÓN</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                      {formatFecha(usuario.fecha_creacion || usuario.fecha_registro)}
                    </div>
                  </div>
                  {usuario.modificado_por && (
                    <>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>MODIFICADO POR</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
                          {usuario.modificado_por}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(251, 191, 36, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>ÚLTIMA MODIFICACIÓN</div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>
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
                  padding: '1rem',
                  borderRadius: '0.625rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BookOpen style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CURSOS MATRICULADOS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.cursos_matriculados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS COMPLETADOS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.pagos_completados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS PENDIENTES</div>
                      <div style={{ fontSize: '1.25rem', color: '#ef4444', fontWeight: '700' }}>
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
                  padding: '1rem',
                  borderRadius: '0.625rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BookOpen style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                    Información Académica
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>CURSOS ASIGNADOS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.cursos_asignados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>ESTUDIANTES ACTIVOS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
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
                  padding: '1rem',
                  borderRadius: '0.625rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: '#f87171',
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Activity style={{ width: '1rem', height: '1rem', color: '#ef4444' }} />
                    Actividad del Sistema
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>MATRÍCULAS APROBADAS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.matriculas_aprobadas || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>PAGOS VERIFICADOS</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
                        {usuario.pagos_verificados || 0}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(239, 68, 68, 0.7)', marginBottom: '0.25rem', fontWeight: '600' }}>TOTAL ACCIONES</div>
                      <div style={{ fontSize: '1.25rem', color: '#f87171', fontWeight: '700' }}>
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
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>No hay sesiones registradas para este usuario</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Las sesiones aparecerán cuando el usuario inicie sesión</p>
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
                      padding: '0.875rem',
                      borderRadius: '0.625rem',
                      border: `1px solid ${sesion.activa ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                      backgroundColor: sesion.activa ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '0.5rem',
                            backgroundColor: sesion.activa ? '#10b981' : 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {sesion.activa ? <CheckCircle size={16} color="#fff" /> : <XCircle size={16} color="#fff" />}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginBottom: '0.25rem' }}>
                              {sesion.activa ? 'Sesión Activa' : 'Sesión Finalizada'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                              {esMovil ? <Monitor size={14} /> : <Globe size={14} />}
                              <span>{esMovil ? 'Móvil' : 'Escritorio'} · {navegador}</span>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          backgroundColor: sesion.activa ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                          color: sesion.activa ? '#10b981' : 'rgba(255,255,255,0.7)'
                        }}>
                          ID: {sesion.id_sesion.substring(0, 8)}...
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.6)' }}>
                          <Calendar size={14} color="#ef4444" />
                          <div>
                            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>Inicio de Sesión</div>
                            <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>{formatFecha(sesion.fecha_inicio)}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'rgba(255,255,255,0.6)' }}>
                          <Clock size={14} color={sesion.activa ? '#10b981' : '#ef4444'} />
                          <div>
                            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)' }}>
                              {sesion.activa ? 'Expira' : 'Cerró Sesión'}
                            </div>
                            <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)', fontSize: '0.7rem' }}>
                              {sesion.activa ? formatFecha(sesion.fecha_expiracion) : formatFecha(sesion.fecha_cierre || sesion.fecha_expiracion)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>User Agent:</div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all', lineHeight: '1.3' }}>{sesion.user_agent}</div>
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
                  {/* Filtro de Acciones */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFiltroAcciones('todas')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: filtroAcciones === 'todas' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                        background: filtroAcciones === 'todas' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: filtroAcciones === 'todas' ? '#ef4444' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setFiltroAcciones('administrativas')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: filtroAcciones === 'administrativas' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.2)',
                        background: filtroAcciones === 'administrativas' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: filtroAcciones === 'administrativas' ? '#f59e0b' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🔧 Administrativas
                    </button>
                    <button
                      onClick={() => setFiltroAcciones('academicas')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: filtroAcciones === 'academicas' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.2)',
                        background: filtroAcciones === 'academicas' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                        color: filtroAcciones === 'academicas' ? '#3b82f6' : 'rgba(255,255,255,0.7)',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      📚 Académicas
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {acciones.length === 0 ? (
                      <div style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.875rem'
                      }}>
                        No hay acciones registradas
                      </div>
                    ) : (
                      acciones.map((accion, index) => {
                        // Determinar icono y color según tipo de acción
                        let iconoConfig = { icono: Activity, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Acción' };
                        
                        const tipoAccion = accion.tipo_accion?.toLowerCase() || '';
                        
                        if (tipoAccion.includes('contraseña') || tipoAccion.includes('password')) {
                          iconoConfig = { icono: Lock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: 'Contraseña' };
                        } else if (tipoAccion.includes('foto') || tipoAccion.includes('perfil')) {
                          iconoConfig = { icono: UserCircle, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', label: 'Foto Perfil' };
                        } else if (tipoAccion.includes('pago')) {
                          iconoConfig = { icono: DollarSign, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Pago' };
                        } else if (tipoAccion.includes('tarea') || tipoAccion.includes('entrega')) {
                          iconoConfig = { icono: FileText, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', label: 'Tarea' };
                        } else if (tipoAccion.includes('calificación') || tipoAccion.includes('nota')) {
                          iconoConfig = { icono: CheckCircle, color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', label: 'Calificación' };
                        } else if (tipoAccion.includes('módulo')) {
                          iconoConfig = { icono: BookOpen, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', label: 'Módulo' };
                        } else if (tipoAccion.includes('matrícula') || tipoAccion.includes('inscripción')) {
                          iconoConfig = { icono: GraduationCap, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.2)', label: 'Matrícula' };
                        }

                        return (
                          <div key={`accion-${index}`} style={{
                            padding: '1.25rem',
                            borderRadius: '0.875rem',
                            border: `2px solid ${iconoConfig.color}30`,
                            backgroundColor: `${iconoConfig.color}05`,
                            transition: 'all 0.3s ease',
                            boxShadow: `0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px ${iconoConfig.color}20`,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Barra lateral de color */}
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: '4px',
                              backgroundColor: iconoConfig.color,
                              boxShadow: `0 0 12px ${iconoConfig.color}80`
                            }}></div>
                            
                            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                <div style={{
                                  width: '2.75rem',
                                  height: '2.75rem',
                                  borderRadius: '0.75rem',
                                  backgroundColor: iconoConfig.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 4px 12px ${iconoConfig.color}60`,
                                  border: '2px solid rgba(255,255,255,0.1)'
                                }}>
                                  {React.createElement(iconoConfig.icono, { size: 22, color: '#fff', strokeWidth: 2.5 })}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: '700', 
                                    color: 'rgba(255,255,255,0.98)', 
                                    marginBottom: '0.35rem',
                                    letterSpacing: '0.3px'
                                  }}>
                                    {(() => {
                                      // Generar descripción más rica según el tipo
                                      const detalles = accion.detalles || {};
                                      
                                      if (accion.tipo_accion === 'pago' && detalles.curso) {
                                        return `💰 Pago Cuota #${detalles.cuota || ''} - ${detalles.curso}`;
                                      } else if (accion.tipo_accion === 'cambio_perfil' && detalles.cambio_realizado) {
                                        return `🔄 ${detalles.cambio_realizado}`;
                                      } else if (accion.tipo_accion === 'tarea_subida' && detalles.tarea) {
                                        return `📝 ${detalles.tarea}`;
                                      } else if (accion.tipo_accion === 'calificacion' && detalles.nota) {
                                        return `⭐ Calificación: ${detalles.nota}/10 - ${detalles.tarea || ''}`;
                                      } else if (accion.tipo_accion === 'matricula' && detalles.curso) {
                                        return `🎓 Matriculado en ${detalles.curso}`;
                                      }
                                      
                                      return accion.descripcion || accion.tipo_accion;
                                    })()}
                                  </div>
                                  {accion.tipo_accion && (
                                    <div style={{ 
                                      fontSize: '0.7rem', 
                                      color: 'rgba(255,255,255,0.5)', 
                                      fontWeight: '500',
                                      fontStyle: 'italic',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      <span>{accion.tipo_accion.replace(/_/g, ' ').toUpperCase()}</span>
                                      {accion.detalles?.tipo && (
                                        <>
                                          <span>•</span>
                                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>
                                            {accion.detalles.tipo}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <span style={{
                                padding: '6px 0.875rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                backgroundColor: iconoConfig.bg,
                                color: iconoConfig.color,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: `0 2px 8px ${iconoConfig.color}40`
                              }}>
                                {iconoConfig.label}
                              </span>
                            </div>

                            {/* Detalles adicionales */}
                            {accion.detalles && typeof accion.detalles === 'object' && Object.keys(accion.detalles).length > 0 && (
                              <div style={{ 
                                marginTop: '1rem', 
                                padding: '1rem',
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderRadius: '0.625rem',
                                fontSize: '0.75rem',
                                color: 'rgba(255,255,255,0.7)',
                                border: '1px solid rgba(255,255,255,0.1)'
                              }}>
                                <div style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '700',
                                  color: 'rgba(255,255,255,0.6)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '1px',
                                  marginBottom: '0.75rem',
                                  paddingBottom: '0.5rem',
                                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <Activity size={14} color="rgba(255,255,255,0.6)" />
                                  Información Detallada
                                </div>
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                  gap: '0.5rem' 
                                }}>
                                  {Object.entries(accion.detalles)
                                    .filter(([key]) => key !== 'password_changed' && key !== 'id' && key !== 'password') // Filtrar campos no útiles
                                    .map(([key, value]) => {
                                      // Formatear etiquetas
                                      const labels: Record<string, string> = {
                                        'curso': '📚 Curso',
                                        'codigo_curso': '🎫 Código',
                                        'cuota': '💳 Cuota',
                                        'monto': '💰 Monto',
                                        'metodo_pago': '💵 Método de Pago',
                                        'estado': '📊 Estado',
                                        'fecha_pago': '📅 Fecha de Pago',
                                        'fecha_verificacion': '✅ Verificado',
                                        'fecha_vencimiento': '⏰ Vencimiento',
                                        'numero_comprobante': '🧾 Comprobante',
                                        'banco_comprobante': '🏦 Banco',
                                        'cambio_realizado': '🔄 Cambio',
                                        'tipo': '📋 Categoría',
                                        'email_anterior': '📧 Email Anterior',
                                        'email_nuevo': '📧 Email Nuevo',
                                        'telefono_anterior': '📞 Teléfono Anterior',
                                        'telefono_nuevo': '📞 Teléfono Nuevo',
                                        'tarea': '📝 Tarea',
                                        'modulo': '📖 Módulo',
                                        'fecha_entrega': '📅 Entregado',
                                        'archivo': '📎 Archivo',
                                        'nota': '⭐ Nota',
                                        'comentario': '💬 Comentario',
                                        'fecha_calificacion': '📅 Calificado',
                                        'codigo_matricula': '🎫 Código',
                                        'monto_matricula': '💰 Matrícula',
                                        'fecha_matricula': '📅 Fecha',
                                        'estudiante': '👤 Estudiante',
                                        'fecha_limite': '⏰ Límite',
                                        'descripcion': '📄 Descripción',
                                        'fecha_inicio': '📅 Inicio'
                                      };
                                      const label = labels[key] || key;
                                      
                                      // Formatear valores
                                      let displayValue = value;
                                      let valorColor = 'rgba(255,255,255,0.95)';
                                      let iconoEmoji = '';
                                      
                                      if (value === null || value === undefined || value === '') {
                                        return null; // No mostrar valores vacíos
                                      }
                                      
                                      if (typeof value === 'number' && key.includes('monto')) {
                                        displayValue = `$${value.toFixed(2)}`;
                                        valorColor = '#10b981'; // Verde para dinero
                                        iconoEmoji = '💰';
                                      } else if (key.includes('fecha') && value) {
                                        displayValue = new Date(value as string).toLocaleDateString('es-EC', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: value.toString().includes('T') ? '2-digit' : undefined,
                                          minute: value.toString().includes('T') ? '2-digit' : undefined
                                        });
                                        iconoEmoji = '📅';
                                      } else if (key === 'nota') {
                                        const notaNum = Number(value);
                                        displayValue = `${value}/10`;
                                        valorColor = notaNum >= 7 ? '#10b981' : notaNum >= 5 ? '#f59e0b' : '#ef4444';
                                        iconoEmoji = notaNum >= 7 ? '⭐' : notaNum >= 5 ? '📊' : '❌';
                                      } else if (key === 'estado') {
                                        const estado = String(value).toLowerCase();
                                        if (estado === 'pagado' || estado === 'verificado' || estado === 'activa') {
                                          valorColor = '#10b981';
                                          iconoEmoji = '✅';
                                        } else if (estado === 'pendiente') {
                                          valorColor = '#f59e0b';
                                          iconoEmoji = '⏳';
                                        } else {
                                          valorColor = '#ef4444';
                                          iconoEmoji = '❌';
                                        }
                                      } else if (key.includes('metodo_pago')) {
                                        iconoEmoji = '💳';
                                      } else if (key.includes('cuota')) {
                                        iconoEmoji = '🔢';
                                        valorColor = '#3b82f6';
                                      }
                                      
                                      return (
                                        <div key={key} style={{ 
                                          padding: '0.65rem 0.75rem',
                                          backgroundColor: 'rgba(255,255,255,0.03)',
                                          borderRadius: '0.5rem',
                                          border: '1px solid rgba(255,255,255,0.08)',
                                          transition: 'all 0.2s ease',
                                          cursor: 'default'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                        }}
                                        >
                                          <div style={{ 
                                            fontSize: '0.65rem', 
                                            color: 'rgba(255,255,255,0.5)',
                                            marginBottom: '0.35rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem'
                                          }}>
                                            {iconoEmoji && <span>{iconoEmoji}</span>}
                                            {label.replace(/^[^\s]+\s/, '')} {/* Remover emoji del label si ya tenemos uno */}
                                          </div>
                                          <div style={{ 
                                            color: valorColor,
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            letterSpacing: '0.2px',
                                            wordBreak: 'break-word'
                                          }}>
                                            {typeof displayValue === 'object' 
                                              ? JSON.stringify(displayValue) 
                                              : String(displayValue)}
                                          </div>
                                        </div>
                                      );
                                    })
                                    .filter(Boolean) // Remover elementos null
                                  }
                                </div>
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                <Calendar size={16} color="#ef4444" />
                                <div>
                                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>Fecha</div>
                                  <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                                    {formatFecha(accion.fecha_hora || accion.fecha_operacion || '')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
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
  accion: { tipo: 'activar' | 'desactivar' | 'resetear', usuario: Usuario } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ModalConfirmacion = ({ show, accion, onConfirm, onCancel }: ModalConfirmacionProps) => {
  if (!show || !accion) return null;

  const getTitulo = () => {
    switch (accion.tipo) {
      case 'activar': return 'Activar Usuario';
      case 'desactivar': return 'Desactivar Usuario';
      case 'resetear': return 'Resetear Contraseña';
      default: return '';
    }
  };

  const getMensaje = () => {
    switch (accion.tipo) {
      case 'activar':
      case 'desactivar':
        return `¿Estás seguro de ${accion.tipo} a `;
      case 'resetear':
        return '¿Estás seguro de resetear la contraseña de ';
      default:
        return '';
    }
  };

  const getBotonTexto = () => {
    switch (accion.tipo) {
      case 'activar': return 'Activar';
      case 'desactivar': return 'Desactivar';
      case 'resetear': return 'Resetear';
      default: return 'Confirmar';
    }
  };

  return (
    <div
      onClick={onCancel}
      className="modal-overlay"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{
          maxWidth: '31.25rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          {getTitulo()}
        </h3>
        <p style={{ marginBottom: '1.25rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>
          {getMensaje()}<strong style={{ color: '#fff' }}>{accion.usuario.nombre} {accion.usuario.apellido}</strong>?
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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
          >
            {getBotonTexto()}
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

const ModalCredenciales = ({ show, credenciales, onClose }: ModalCredencialesProps) => {
  if (!show || !credenciales) return null;

  return (
    <div
      onClick={onClose}
      className="modal-overlay"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="modal-content"
        style={{
          maxWidth: '31.25rem',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          🔐 Contraseña Reseteada
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
            <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.username}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>Contraseña Temporal</div>
            <div style={{ fontWeight: '700', color: '#3b82f6', fontSize: '1rem' }}>{credenciales.password_temporal}</div>
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
          ⚠️ El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
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




