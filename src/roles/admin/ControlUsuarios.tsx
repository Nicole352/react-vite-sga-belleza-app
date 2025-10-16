import { useState, useEffect } from 'react';
import { Users, Search, Eye, Power, KeyRound, AlertCircle, Shield, GraduationCap, UserCheck } from 'lucide-react';
import { ModalDetalle, ModalConfirmacion, ModalCredenciales } from './ControlUsuariosModales';
import GlassEffect from '../../components/GlassEffect';
import { mapToRedScheme, RedColorPalette } from '../../utils/colorMapper';

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
}

interface Sesion {
  id_sesion: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  fecha_expiracion: string;
  activa: boolean;
}

interface Accion {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  ip_address: string;
  fecha_operacion: string;
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
  const [loadingModal, setLoadingModal] = useState(false);

  // Modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accionConfirmar, setAccionConfirmar] = useState<{tipo: 'activar' | 'desactivar', usuario: Usuario} | null>(null);

  // Modal de credenciales
  const [showCredencialesModal, setShowCredencialesModal] = useState(false);
  const [credenciales, setCredenciales] = useState<{username: string, password_temporal: string} | null>(null);

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

  const getOperacionColor = (operacion: string) => {
    switch (operacion) {
      case 'INSERT':
        return 'bg-green-500/20 text-green-400';
      case 'UPDATE':
        return 'bg-blue-500/20 text-blue-400';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
          console.log('👤 Usuario completo recibido:', usuarioData);
          setUsuarioSeleccionado(usuarioData.usuario);
        } else {
          console.error('❌ Error al cargar usuario:', usuarioRes.status);
          setUsuarioSeleccionado(usuario); // Fallback al usuario de la lista
        }
      } catch (err) {
        console.error('❌ Error en fetch de usuario:', err);
        setUsuarioSeleccionado(usuario); // Fallback al usuario de la lista
      }
      
      // Cargar sesiones desde la tabla sesiones_usuario
      try {
        const sesionesRes = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}/sesiones?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sesionesRes.ok) {
          const sesionesData = await sesionesRes.json();
          console.log('📊 Sesiones recibidas:', sesionesData);
          setSesiones(sesionesData.sesiones || []);
        } else {
          console.error('❌ Error al cargar sesiones:', sesionesRes.status);
          setSesiones([]);
        }
      } catch (err) {
        console.error('❌ Error en fetch de sesiones:', err);
        setSesiones([]);
      }

      // Cargar acciones desde la tabla auditoria_sistema
      try {
        const accionesRes = await fetch(`${API_BASE}/usuarios/${usuario.id_usuario}/acciones?limit=20`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (accionesRes.ok) {
          const accionesData = await accionesRes.json();
          console.log('📊 Acciones recibidas:', accionesData);
          setAcciones(accionesData.acciones || []);
        } else {
          console.error('❌ Error al cargar acciones:', accionesRes.status);
          setAcciones([]);
        }
      } catch (err) {
        console.error('❌ Error en fetch de acciones:', err);
        setAcciones([]);
      }
    } catch (err) {
      console.error('Error al cargar datos del modal:', err);
      setSesiones([]);
      setAcciones([]);
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
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: '#1e293b',
            margin: 0,
            marginBottom: '8px'
          }}>
            <Users style={{ width: '32px', height: '32px', color: '#ef4444' }} />
            Control de Usuarios
          </h1>
          <p style={{ 
            fontSize: '0.9rem', 
            color: '#64748b',
            margin: 0
          }}>
            Gestiona todos los usuarios del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Total Usuarios */}
          <GlassEffect variant="card" tint="red" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Total Usuarios</h3>
                <p style={{ color: RedColorPalette.primary, fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.totalUsuarios}
                </p>
              </div>
              <GlassEffect variant="button" tint="red" intensity="light" style={{ padding: '10px' }}>
                <Users size={24} color={RedColorPalette.primary} />
              </GlassEffect>
            </div>
          </GlassEffect>

          {/* Activos */}
          <GlassEffect variant="card" tint="success" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Activos</h3>
                <p style={{ color: mapToRedScheme('#10b981'), fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.usuariosActivos}
                </p>
              </div>
              <GlassEffect variant="button" tint="success" intensity="light" style={{ padding: '10px' }}>
                <Users size={24} color={mapToRedScheme('#10b981')} />
              </GlassEffect>
            </div>
          </GlassEffect>

          {/* Inactivos */}
          <GlassEffect variant="card" tint="error" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Inactivos</h3>
                <p style={{ color: RedColorPalette.primaryLight, fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.usuariosInactivos}
                </p>
              </div>
              <GlassEffect variant="button" tint="error" intensity="light" style={{ padding: '10px' }}>
                <Users size={24} color={RedColorPalette.primaryLight} />
              </GlassEffect>
            </div>
          </GlassEffect>

          {/* Admins */}
          <GlassEffect variant="card" tint="red" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Admins</h3>
                <p style={{ color: RedColorPalette.primary, fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.totalAdministradores}
                </p>
              </div>
              <GlassEffect variant="button" tint="red" intensity="light" style={{ padding: '10px' }}>
                <Shield size={24} color={RedColorPalette.primary} />
              </GlassEffect>
            </div>
          </GlassEffect>

          {/* Docentes */}
          <GlassEffect variant="card" tint="neutral" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Docentes</h3>
                <p style={{ color: mapToRedScheme('#3b82f6'), fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.totalDocentes}
                </p>
              </div>
              <GlassEffect variant="button" tint="neutral" intensity="light" style={{ padding: '10px' }}>
                <UserCheck size={24} color={mapToRedScheme('#3b82f6')} />
              </GlassEffect>
            </div>
          </GlassEffect>

          {/* Estudiantes */}
          <GlassEffect variant="card" tint="success" intensity="medium" hover animated>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: '500', margin: '0 0 8px 0' }}>Estudiantes</h3>
                <p style={{ color: mapToRedScheme('#22c55e'), fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                  {loading ? '...' : stats.totalEstudiantes}
                </p>
              </div>
              <GlassEffect variant="button" tint="success" intensity="light" style={{ padding: '10px' }}>
                <GraduationCap size={24} color={mapToRedScheme('#22c55e')} />
              </GlassEffect>
            </div>
          </GlassEffect>
        </div>

        {/* Filtros */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                color: '#94a3b8'
              }} />
              <input
                type="text"
                placeholder="Buscar por nombre, username o email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  fontSize: '0.9rem',
                  color: '#1e293b'
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
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                color: '#1e293b',
                cursor: 'pointer'
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
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                fontSize: '0.9rem',
                color: '#1e293b',
                cursor: 'pointer'
              }}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
        </div>

        {/* Tabla de usuarios */}
        {loading ? (
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
            <div style={{ 
              overflowX: 'auto', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ 
                  borderBottom: '2px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Usuario</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Nombre Completo</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Rol</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Estado</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Última Conexión</th>
                    <th style={{ textAlign: 'center', padding: '16px', fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id_usuario} style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#1e293b' }}>
                          {usuario.username || usuario.email}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                          {usuario.nombre} {usuario.apellido}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{usuario.cedula}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRolColor(usuario.nombre_rol)}`}>
                          {usuario.nombre_rol}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>{usuario.email || '-'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoColor(usuario.estado)}`}>
                          {usuario.estado}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#475569' }}>{formatFecha(usuario.fecha_ultima_conexion)}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            onClick={() => verDetalle(usuario)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
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
                            <Eye style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => confirmarCambioEstado(usuario)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
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
                            <Power style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => resetearPassword(usuario)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
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
                            <KeyRound style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: page === 1 ? '#f1f5f9' : 'white',
                    color: page === 1 ? '#94a3b8' : '#1e293b',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== 1) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== 1) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  Anterior
                </button>
                <span style={{ 
                  padding: '10px 20px',
                  color: '#475569',
                  fontWeight: '500',
                  fontSize: '0.9rem'
                }}>
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: page === totalPages ? '#f1f5f9' : 'white',
                    color: page === totalPages ? '#94a3b8' : '#1e293b',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (page !== totalPages) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (page !== totalPages) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Modales */}
        <ModalDetalle
          show={showModal}
          usuario={usuarioSeleccionado}
          tabActiva={tabActiva}
          sesiones={sesiones}
          acciones={acciones}
          loadingModal={loadingModal}
          onClose={() => setShowModal(false)}
          onChangeTab={setTabActiva}
          formatFecha={formatFecha}
          getRolColor={getRolColor}
          getEstadoColor={getEstadoColor}
          getOperacionColor={getOperacionColor}
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
      </div>
  );
};

export default ControlUsuarios;
