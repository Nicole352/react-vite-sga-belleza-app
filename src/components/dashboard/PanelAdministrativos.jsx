import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  X,
  Users
} from 'lucide-react';

const PanelAdministrativos = () => {
  // Estado para el personal administrativo
  const [administrativos, setAdministrativos] = useState([
    {
      id: 1,
      nombre: 'Lcda. Patricia',
      apellido: 'Jiménez',
      email: 'patricia.jimenez@instituto.edu',
      telefono: '+593 99 345 6789',
      cedula: '1234567891',
      cargo: 'Directora Académica',
      departamento: 'Académico',
      estado: 'Activo',
      fechaContratacion: '2019-01-15',
      salario: 1500,
      direccion: 'Av. Principal 123, Quito',
      nivelAcceso: 'Alto',
      permisos: ['Gestionar Cursos', 'Aprobar Inscripciones', 'Generar Reportes'],
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre: 'Ing. Roberto',
      apellido: 'Sánchez',
      email: 'roberto.sanchez@instituto.edu',
      telefono: '+593 98 456 7890',
      cedula: '0987654322',
      cargo: 'Coordinador de Sistemas',
      departamento: 'Tecnología',
      estado: 'Activo',
      fechaContratacion: '2020-06-10',
      salario: 1300,
      direccion: 'Calle 45 No. 67-89, Quito',
      nivelAcceso: 'Medio',
      permisos: ['Gestionar Sistema', 'Soporte Técnico', 'Respaldos'],
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre: 'Lic. Carmen',
      apellido: 'Vargas',
      email: 'carmen.vargas@instituto.edu',
      telefono: '+593 97 567 8901',
      cedula: '1122334456',
      cargo: 'Secretaria General',
      departamento: 'Administrativo',
      estado: 'Activo',
      fechaContratacion: '2021-03-20',
      salario: 800,
      direccion: 'Barrio Norte, Mz. 5 Casa 12',
      nivelAcceso: 'Básico',
      permisos: ['Gestionar Documentos', 'Atención al Cliente'],
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      nombre: 'CPA. María',
      apellido: 'González',
      email: 'maria.gonzalez@instituto.edu',
      telefono: '+593 96 678 9012',
      cedula: '1357924680',
      cargo: 'Contadora',
      departamento: 'Financiero',
      estado: 'Licencia',
      fechaContratacion: '2018-11-05',
      salario: 1400,
      direccion: 'Sector Sur, Av. 6 de Diciembre',
      nivelAcceso: 'Alto',
      permisos: ['Gestionar Finanzas', 'Generar Facturas', 'Reportes Financieros'],
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterDepartamento, setFilterDepartamento] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    cargo: '',
    departamento: '',
    estado: 'Activo',
    fechaContratacion: '',
    salario: '',
    direccion: '',
    nivelAcceso: 'Básico',
    permisos: []
  });

  // Filtrar administrativos
  const administrativosFiltrados = administrativos.filter(admin => {
    const matchesSearch = admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'Todos' || admin.estado === filterEstado;
    const matchesDepartamento = filterDepartamento === 'Todos' || admin.departamento === filterDepartamento;
    
    return matchesSearch && matchesEstado && matchesDepartamento;
  });

  // Opciones de permisos disponibles
  const permisosDisponibles = [
    'Gestionar Cursos',
    'Aprobar Inscripciones',
    'Generar Reportes',
    'Gestionar Sistema',
    'Soporte Técnico',
    'Respaldos',
    'Gestionar Documentos',
    'Atención al Cliente',
    'Gestionar Finanzas',
    'Generar Facturas',
    'Reportes Financieros',
    'Gestionar Usuarios',
    'Configurar Sistema'
  ];

  // Funciones CRUD
  const handleCreateAdmin = () => {
    setModalType('create');
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cedula: '',
      cargo: '',
      departamento: '',
      estado: 'Activo',
      fechaContratacion: '',
      salario: '',
      direccion: '',
      nivelAcceso: 'Básico',
      permisos: []
    });
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setModalType('edit');
    setSelectedAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      apellido: admin.apellido,
      email: admin.email,
      telefono: admin.telefono,
      cedula: admin.cedula,
      cargo: admin.cargo,
      departamento: admin.departamento,
      estado: admin.estado,
      fechaContratacion: admin.fechaContratacion,
      salario: admin.salario,
      direccion: admin.direccion,
      nivelAcceso: admin.nivelAcceso,
      permisos: admin.permisos
    });
    setShowModal(true);
  };

  const handleViewAdmin = (admin) => {
    setModalType('view');
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleDeleteAdmin = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este administrativo?')) {
      setAdministrativos(administrativos.filter(admin => admin.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'create') {
      const newAdmin = {
        ...formData,
        id: Date.now(),
        salario: parseFloat(formData.salario),
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };
      setAdministrativos([...administrativos, newAdmin]);
    } else if (modalType === 'edit') {
      setAdministrativos(administrativos.map(admin => 
        admin.id === selectedAdmin.id ? { 
          ...admin, 
          ...formData, 
          salario: parseFloat(formData.salario)
        } : admin
      ));
    }
    
    setShowModal(false);
  };

  const handlePermisoToggle = (permiso) => {
    const newPermisos = formData.permisos.includes(permiso)
      ? formData.permisos.filter(p => p !== permiso)
      : [...formData.permisos, permiso];
    
    setFormData({ ...formData, permisos: newPermisos });
  };

  const Modal = ({ children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-purple-600" />
              Gestión de Personal Administrativo
            </h2>
            <p className="text-gray-600 mt-1">
              {administrativosFiltrados.length} administrativo{administrativosFiltrados.length !== 1 ? 's' : ''} encontrado{administrativosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreateAdmin}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Nuevo Administrativo
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, email o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Licencia">Licencia</option>
              <option value="Vacaciones">Vacaciones</option>
            </select>
            
            <select
              value={filterDepartamento}
              onChange={(e) => setFilterDepartamento(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Todos">Todos los departamentos</option>
              <option value="Académico">Académico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Financiero">Financiero</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Recursos Humanos">Recursos Humanos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de administrativos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Administrativo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Departamento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {administrativosFiltrados.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={admin.foto} 
                        alt={`${admin.nombre} ${admin.apellido}`} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {admin.nombre} {admin.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cédula: {admin.cedula}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {admin.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {admin.telefono}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{admin.cargo}</div>
                  <div className="text-sm text-gray-500">
                    Acceso: {admin.nivelAcceso}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {admin.departamento}
                  </div>
                  <div className="text-sm text-gray-500">
                    Desde: {new Date(admin.fechaContratacion).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    admin.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                    admin.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                    admin.estado === 'Licencia' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {admin.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${admin.salario}
                  </div>
                  <div className="text-sm text-gray-500">mensual</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewAdmin(admin)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {administrativosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay personal administrativo</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron administrativos con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal>
          {modalType === 'view' && selectedAdmin ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Administrativo</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img 
                    className="h-20 w-20 rounded-full object-cover" 
                    src={selectedAdmin.foto} 
                    alt={`${selectedAdmin.nombre} ${selectedAdmin.apellido}`} 
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedAdmin.nombre} {selectedAdmin.apellido}
                    </h4>
                    <p className="text-gray-500">Cédula: {selectedAdmin.cedula}</p>
                    <p className="text-purple-600 font-medium">{selectedAdmin.cargo}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAdmin.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAdmin.telefono}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAdmin.direccion}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salario</label>
                      <p className="mt-1 text-sm text-gray-900">${selectedAdmin.salario} mensual</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Departamento</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAdmin.departamento}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedAdmin.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                        selectedAdmin.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                        selectedAdmin.estado === 'Licencia' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedAdmin.estado}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nivel de Acceso</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAdmin.nivelAcceso}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedAdmin.fechaContratacion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permisos Asignados</label>
                  <div className="space-y-1">
                    {selectedAdmin.permisos.map((permiso, idx) => (
                      <span key={idx} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {permiso}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? 'Nuevo Administrativo' : 'Editar Administrativo'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingrese el nombre"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ingrese el apellido"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="correo@instituto.edu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+593 99 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cedula}
                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: Secretaria General"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <select
                    required
                    value={formData.departamento}
                    onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar departamento</option>
                    <option value="Académico">Académico</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Financiero">Financiero</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Contratación *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaContratacion}
                    onChange={(e) => setFormData({...formData, fechaContratacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario Mensual (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.salario}
                    onChange={(e) => setFormData({...formData, salario: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="800.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de Acceso
                  </label>
                  <select
                    value={formData.nivelAcceso}
                    onChange={(e) => setFormData({...formData, nivelAcceso: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Licencia">Licencia</option>
                    <option value="Vacaciones">Vacaciones</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permisos del Sistema
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                    {permisosDisponibles.map((permiso, idx) => (
                      <label key={idx} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.permisos.includes(permiso)}
                          onChange={() => handlePermisoToggle(permiso)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{permiso}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
                >
                  {modalType === 'create' ? 'Crear Administrativo' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PanelAdministrativos;