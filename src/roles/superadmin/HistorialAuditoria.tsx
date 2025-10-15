import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, X, ChevronLeft, ChevronRight, Eye, Download, User, Database, Activity } from 'lucide-react';
import AdminThemeWrapper from '../../components/AdminThemeWrapper';
import * as XLSX from 'xlsx';

// Tipos
interface Auditoria {
  id_auditoria: number;
  tabla_afectada: string;
  operacion: 'INSERT' | 'UPDATE' | 'DELETE';
  id_registro: number;
  usuario_id: number;
  datos_anteriores: any;
  datos_nuevos: any;
  ip_address: string;
  user_agent: string;
  fecha_operacion: string;
  usuario_nombre: string;
  usuario_apellido: string;
  usuario_username: string;
}

interface Estadisticas {
  total: number;
  actividadReciente: number;
  porTabla: Array<{ tabla_afectada: string; cantidad: number }>;
  porUsuario: Array<{ usuario_id: number; nombre: string; apellido: string; cantidad: number }>;
  porOperacion: Array<{ operacion: string; cantidad: number }>;
}

const HistorialAuditoria: React.FC = () => {
  // Estados
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [tablasDisponibles, setTablasDisponibles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tabla: '',
    operacion: '',
    fecha_inicio: '',
    fecha_fin: '',
    id_registro: '',
    usuario_id: ''
  });

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const limite = 20;

  // Modal
  const [modalDetalle, setModalDetalle] = useState<Auditoria | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarEstadisticas();
    cargarTablasDisponibles();
  }, []);

  // Cargar auditorías cuando cambian filtros o página
  useEffect(() => {
    cargarAuditorias();
  }, [paginaActual, filtros]);

  /**
   * Cargar auditorías con filtros y paginación
   */
  const cargarAuditorias = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
        return;
      }

      // Construir query params
      const params = new URLSearchParams({
        pagina: paginaActual.toString(),
        limite: limite.toString(),
        ...(filtros.busqueda && { busqueda: filtros.busqueda }),
        ...(filtros.tabla && { tabla: filtros.tabla }),
        ...(filtros.operacion && { operacion: filtros.operacion }),
        ...(filtros.fecha_inicio && { fecha_inicio: filtros.fecha_inicio }),
        ...(filtros.fecha_fin && { fecha_fin: filtros.fecha_fin }),
        ...(filtros.id_registro && { id_registro: filtros.id_registro }),
        ...(filtros.usuario_id && { usuario_id: filtros.usuario_id })
      });

      const response = await fetch(`http://localhost:3000/api/auditoria?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar auditorías');
      }

      const data = await response.json();
      
      if (data.success) {
        setAuditorias(data.data.auditorias);
        setTotal(data.data.total);
        setTotalPaginas(data.data.totalPaginas);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar auditorías');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auditoria/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEstadisticas(data.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  /**
   * Cargar tablas disponibles
   */
  const cargarTablasDisponibles = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auditoria/tablas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTablasDisponibles(data.data);
        }
      }
    } catch (err) {
      console.error('Error al cargar tablas:', err);
    }
  };

  /**
   * Manejar cambio de filtros
   */
  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPaginaActual(1); // Resetear a primera página
  };

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tabla: '',
      operacion: '',
      fecha_inicio: '',
      fecha_fin: '',
      id_registro: '',
      usuario_id: ''
    });
    setPaginaActual(1);
  };

  /**
   * Ver detalle de auditoría
   */
  const verDetalle = (auditoria: Auditoria) => {
    setModalDetalle(auditoria);
    setShowModal(true);
  };

  /**
   * Exportar a Excel
   */
  const exportarExcel = () => {
    const datosExcel = auditorias.map(a => ({
      'ID': a.id_auditoria,
      'Fecha/Hora': formatearFecha(a.fecha_operacion),
      'Usuario': `${a.usuario_nombre} ${a.usuario_apellido}`,
      'Username': a.usuario_username,
      'Operación': a.operacion,
      'Tabla': a.tabla_afectada,
      'ID Registro': a.id_registro,
      'IP': a.ip_address
    }));

    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Auditoría');
    XLSX.writeFile(wb, `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  /**
   * Formatear fecha
   */
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-EC', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  /**
   * Obtener color según operación
   */
  const getColorOperacion = (operacion: string) => {
    switch (operacion) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  /**
   * Renderizar diff de cambios
   */
  const renderDiff = () => {
    if (!modalDetalle) return null;

    const anterior = modalDetalle.datos_anteriores ? JSON.parse(modalDetalle.datos_anteriores) : null;
    const nuevo = modalDetalle.datos_nuevos ? JSON.parse(modalDetalle.datos_nuevos) : null;

    if (!anterior && !nuevo) {
      return <p className="text-gray-500">No hay datos de cambios disponibles</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {/* Datos anteriores */}
        <div>
          <h4 className="font-semibold mb-2 text-red-600">Antes:</h4>
          <div className="bg-red-50 p-3 rounded border border-red-200 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {anterior ? JSON.stringify(anterior, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>

        {/* Datos nuevos */}
        <div>
          <h4 className="font-semibold mb-2 text-green-600">Después:</h4>
          <div className="bg-green-50 p-3 rounded border border-green-200 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {nuevo ? JSON.stringify(nuevo, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminThemeWrapper>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Historial de Auditoría</h1>
              <p className="text-gray-600">Registro completo de operaciones del sistema</p>
            </div>
          </div>

          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar Excel
          </button>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Registros</p>
                  <p className="text-3xl font-bold">{estadisticas.total}</p>
                </div>
                <Database className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Últimas 24h</p>
                  <p className="text-3xl font-bold">{estadisticas.actividadReciente}</p>
                </div>
                <Activity className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Tablas Auditadas</p>
                  <p className="text-3xl font-bold">{estadisticas.porTabla.length}</p>
                </div>
                <Database className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Usuarios Activos</p>
                  <p className="text-3xl font-bold">{estadisticas.porUsuario.length}</p>
                </div>
                <User className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                  placeholder="Usuario, tabla..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabla */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tabla
              </label>
              <select
                value={filtros.tabla}
                onChange={(e) => handleFiltroChange('tabla', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {tablasDisponibles.map(tabla => (
                  <option key={tabla} value={tabla}>{tabla}</option>
                ))}
              </select>
            </div>

            {/* Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operación
              </label>
              <select
                value={filtros.operacion}
                onChange={(e) => handleFiltroChange('operacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            {/* ID Registro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Registro
              </label>
              <input
                type="number"
                value={filtros.id_registro}
                onChange={(e) => handleFiltroChange('id_registro', e.target.value)}
                placeholder="ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Botón limpiar */}
            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de auditorías */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : auditorias.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron registros de auditoría</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Fecha/Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Usuario</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Operación</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Tabla</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">ID Registro</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase">IP</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {auditorias.map((auditoria) => (
                      <tr key={auditoria.id_auditoria} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{auditoria.id_auditoria}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatearFecha(auditoria.fecha_operacion)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {auditoria.usuario_nombre} {auditoria.usuario_apellido}
                            </p>
                            <p className="text-xs text-gray-500">@{auditoria.usuario_username}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getColorOperacion(auditoria.operacion)}`}>
                            {auditoria.operacion}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">
                          {auditoria.tabla_afectada}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          #{auditoria.id_registro}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                          {auditoria.ip_address}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => verDetalle(auditoria)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Mostrando {((paginaActual - 1) * limite) + 1} - {Math.min(paginaActual * limite, total)} de {total} registros
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                    disabled={paginaActual === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="px-4 py-2 text-sm font-medium text-gray-700">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal de detalle */}
        {showModal && modalDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Detalle de Auditoría #{modalDetalle.id_auditoria}</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Operación</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getColorOperacion(modalDetalle.operacion)}`}>
                      {modalDetalle.operacion}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Tabla</p>
                    <p className="font-semibold text-gray-900 font-mono">{modalDetalle.tabla_afectada}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">ID Registro</p>
                    <p className="font-semibold text-gray-900">#{modalDetalle.id_registro}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Fecha/Hora</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatearFecha(modalDetalle.fecha_operacion)}</p>
                  </div>
                </div>

                {/* Usuario e IP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-900">Usuario</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {modalDetalle.usuario_nombre} {modalDetalle.usuario_apellido}
                    </p>
                    <p className="text-sm text-gray-600">@{modalDetalle.usuario_username}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {modalDetalle.usuario_id}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-semibold text-purple-900">Conexión</p>
                    </div>
                    <p className="font-mono text-sm text-gray-900">{modalDetalle.ip_address}</p>
                    <p className="text-xs text-gray-600 mt-2 truncate" title={modalDetalle.user_agent}>
                      {modalDetalle.user_agent}
                    </p>
                  </div>
                </div>

                {/* Diff de cambios */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Cambios Realizados</h4>
                  {renderDiff()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminThemeWrapper>
  );
};

export default HistorialAuditoria;
