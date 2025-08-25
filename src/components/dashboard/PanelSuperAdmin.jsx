import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  GraduationCap, 
  UserCheck, 
  Database, 
  Settings, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Download,
  RefreshCw,
  Eye,
  Trash2
} from 'lucide-react';

const PanelSuperAdmin = () => {
  // Estados para las métricas del sistema
  const [stats] = useState({
    totalUsuarios: 156,
    totalEstudiantes: 89,
    totalDocentes: 12,
    totalAdministrativos: 8,
    cursosActivos: 4,
    ingresosMensual: 45680,
    sistemaUptime: '99.8%',
    alertasActivas: 3
  });

  // Estado para logs del sistema
  const [systemLogs] = useState([
    {
      id: 1,
      tipo: 'LOGIN',
      usuario: 'patricia.jimenez@instituto.edu',
      accion: 'Inicio de sesión exitoso',
      timestamp: '2024-08-23 09:15:23',
      ip: '192.168.1.100',
      nivel: 'INFO'
    },
    {
      id: 2,
      tipo: 'CREATE',
      usuario: 'admin@instituto.edu',
      accion: 'Nuevo estudiante creado: Ana María González',
      timestamp: '2024-08-23 08:45:12',
      ip: '192.168.1.50',
      nivel: 'INFO'
    },
    {
      id: 3,
      tipo: 'ERROR',
      usuario: 'sistema@instituto.edu',
      accion: 'Error en respaldo automático de base de datos',
      timestamp: '2024-08-23 02:00:15',
      ip: 'localhost',
      nivel: 'ERROR'
    },
    {
      id: 4,
      tipo: 'UPDATE',
      usuario: 'roberto.sanchez@instituto.edu',
      accion: 'Actualización de configuración del sistema',
      timestamp: '2024-08-22 16:30:45',
      ip: '192.168.1.75',
      nivel: 'WARN'
    },
    {
      id: 5,
      tipo: 'DELETE',
      usuario: 'patricia.jimenez@instituto.edu',
      accion: 'Eliminación de registro de estudiante inactivo',
      timestamp: '2024-08-22 14:20:10',
      ip: '192.168.1.100',
      nivel: 'WARN'
    }
  ]);

  // Estado para actividad reciente
  const [recentActivity] = useState([
    { accion: 'Nuevo estudiante inscrito', tiempo: 'Hace 15 minutos', icono: Users, color: 'text-green-600' },
    { accion: 'Respaldo completado', tiempo: 'Hace 2 horas', icono: Database, color: 'text-blue-600' },
    { accion: 'Pago procesado', tiempo: 'Hace 3 horas', icono: DollarSign, color: 'text-green-600' },
    { accion: 'Error en servidor corregido', tiempo: 'Hace 5 horas', icono: AlertTriangle, color: 'text-red-600' },
    { accion: 'Nuevo docente registrado', tiempo: 'Ayer', icono: GraduationCap, color: 'text-purple-600' }
  ]);

  const [selectedTab, setSelectedTab] = useState('dashboard');

  const StatCard = ({ title, value, icon: Icon, color, change, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
              <TrendingUp className={`h-3 w-3 ${change < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(change)}% vs mes anterior
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value={stats.totalUsuarios}
          icon={Users}
          color="bg-blue-100 text-blue-600"
          change={8.2}
        />
        <StatCard
          title="Estudiantes Activos"
          value={stats.totalEstudiantes}
          icon={GraduationCap}
          color="bg-green-100 text-green-600"
          change={12.5}
        />
        <StatCard
          title="Ingresos Mensuales"
          value={`$${stats.ingresosMensual.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-100 text-yellow-600"
          change={5.3}
        />
        <StatCard
          title="Sistema Uptime"
          value={stats.sistemaUptime}
          icon={Activity}
          color="bg-green-100 text-green-600"
          description="Disponibilidad del sistema"
        />
      </div>

      {/* Gráficos y actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad reciente */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <RefreshCw className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((item, idx) => {
              const IconComponent = item.icono;
              return (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <IconComponent className={`h-4 w-4 ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{item.accion}</p>
                    <p className="text-xs text-gray-500">{item.tiempo}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Base de Datos</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Servidor Web</span>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-900">Respaldo Automático</span>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pendiente</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-900">Alertas Activas</span>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">{stats.alertasActivas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de usuarios */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Usuarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{stats.totalEstudiantes}</div>
            <div className="text-sm text-blue-700">Estudiantes</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{stats.totalDocentes}</div>
            <div className="text-sm text-green-700">Docentes</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <UserCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{stats.totalAdministrativos}</div>
            <div className="text-sm text-purple-700">Administrativos</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemLogs = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Logs del Sistema</h3>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1">
              <Download className="h-3 w-3" />
              Exportar
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {systemLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.tipo === 'LOGIN' ? 'bg-blue-100 text-blue-800' :
                    log.tipo === 'CREATE' ? 'bg-green-100 text-green-800' :
                    log.tipo === 'UPDATE' ? 'bg-yellow-100 text-yellow-800' :
                    log.tipo === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.tipo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.usuario}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.accion}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.ip}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    log.nivel === 'INFO' ? 'bg-blue-100 text-blue-800' :
                    log.nivel === 'WARN' ? 'bg-yellow-100 text-yellow-800' :
                    log.nivel === 'ERROR' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {log.nivel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSystemConfig = () => (
    <div className="space-y-6">
      {/* Configuración general */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Instituto
            </label>
            <input
              type="text"
              value="Instituto de Belleza y Estética"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value="info@instituto.edu"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono Principal
            </label>
            <input
              type="tel"
              value="+593 2 123 4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value="Av. Principal 123, Quito, Ecuador"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Configuración de base de datos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Base de Datos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Tamaño</span>
            </div>
            <div className="text-lg font-bold text-gray-900">2.3 GB</div>
            <div className="text-xs text-gray-500">De 10 GB disponibles</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Tablas</span>
            </div>
            <div className="text-lg font-bold text-gray-900">24</div>
            <div className="text-xs text-gray-500">Activas</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Último Respaldo</span>
            </div>
            <div className="text-sm font-bold text-gray-900">Hace 6 horas</div>
            <div className="text-xs text-gray-500">22/08/2024 18:00</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">Conexiones</span>
            </div>
            <div className="text-lg font-bold text-gray-900">12</div>
            <div className="text-xs text-gray-500">Activas</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2">
            <Database className="h-4 w-4" />
            Crear Respaldo
          </button>
          <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Datos
          </button>
        </div>
      </div>

      {/* Configuración de seguridad */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Seguridad</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Autenticación de dos factores</div>
              <div className="text-sm text-gray-500">Requiere verificación adicional para acceder</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Sesiones múltiples</div>
              <div className="text-sm text-gray-500">Permitir múltiples inicios de sesión simultáneos</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Logs de auditoría</div>
              <div className="text-sm text-gray-500">Registrar todas las acciones del sistema</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'logs', name: 'Logs del Sistema', icon: FileText },
    { id: 'config', name: 'Configuración', icon: Settings },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-900">Panel Super Administrador</h2>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  selectedTab === tab.id
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedTab === 'dashboard' && renderDashboard()}
        {selectedTab === 'logs' && renderSystemLogs()}
        {selectedTab === 'config' && renderSystemConfig()}
      </div>
    </div>
  );
};

export default PanelSuperAdmin;