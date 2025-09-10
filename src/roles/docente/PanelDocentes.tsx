import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Mail,
  Phone,
  Calendar,
  Book,
  Award,
  X,
  User,
  MapPin
} from 'lucide-react';

const PanelDocentes = () => {
  // Estado para los docentes
  const [docentes, setDocentes] = useState([
    {
      id: 1,
      nombre: 'Dr. María Elena',
      apellido: 'Vásquez',
      email: 'maria.vasquez@instituto.edu',
      telefono: '+593 99 234 5678',
      cedula: '1234567890',
      especialidad: 'Cosmetología Avanzada',
      experiencia: 10,
      estado: 'Activo',
      fechaContratacion: '2020-03-15',
      salario: 1200,
      cursosAsignados: ['Cosmetología', 'Técnicas Faciales'],
      certificaciones: ['Certificado en Cosmetología', 'Especialización en Dermatología'],
      foto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre: 'Mg. Carlos Eduardo',
      apellido: 'Morales',
      email: 'carlos.morales@instituto.edu',
      telefono: '+593 98 345 6789',
      cedula: '0987654321',
      especialidad: 'Cosmiatría y Estética',
      experiencia: 8,
      estado: 'Activo',
      fechaContratacion: '2021-01-20',
      salario: 1100,
      cursosAsignados: ['Cosmiatría', 'Radiofrecuencia'],
      certificaciones: ['Maestría en Estética', 'Certificado en Equipos Médicos'],
      foto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre: 'Lcda. Ana Patricia',
      apellido: 'Rodríguez',
      email: 'ana.rodriguez@instituto.edu',
      telefono: '+593 97 456 7890',
      cedula: '1122334455',
      especialidad: 'Maquillaje Artístico',
      experiencia: 6,
      estado: 'Vacaciones',
      fechaContratacion: '2022-08-10',
      salario: 950,
      cursosAsignados: ['Maquillaje Profesional', 'Colorimetría'],
      certificaciones: ['Licenciatura en Artes', 'Especialización en Maquillaje'],
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterEspecialidad, setFilterEspecialidad] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    especialidad: '',
    experiencia: '',
    estado: 'Activo',
    fechaContratacion: '',
    salario: '',
    cursosAsignados: [],
    certificaciones: []
  });

  // Filtrar docentes
  const docentesFiltrados = docentes.filter(docente => {
    const matchesSearch = docente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         docente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         docente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         docente.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'Todos' || docente.estado === filterEstado;
    const matchesEspecialidad = filterEspecialidad === 'Todos' || docente.especialidad.includes(filterEspecialidad);
    
    return matchesSearch && matchesEstado && matchesEspecialidad;
  });

  // Funciones CRUD
  const handleCreateTeacher = () => {
    setModalType('create');
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cedula: '',
      especialidad: '',
      experiencia: '',
      estado: 'Activo',
      fechaContratacion: '',
      salario: '',
      cursosAsignados: [],
      certificaciones: []
    });
    setShowModal(true);
  };

  const handleEditTeacher = (teacher) => {
    setModalType('edit');
    setSelectedTeacher(teacher);
    setFormData({
      nombre: teacher.nombre,
      apellido: teacher.apellido,
      email: teacher.email,
      telefono: teacher.telefono,
      cedula: teacher.cedula,
      especialidad: teacher.especialidad,
      experiencia: teacher.experiencia,
      estado: teacher.estado,
      fechaContratacion: teacher.fechaContratacion,
      salario: teacher.salario,
      cursosAsignados: teacher.cursosAsignados,
      certificaciones: teacher.certificaciones
    });
    setShowModal(true);
  };

  const handleViewTeacher = (teacher) => {
    setModalType('view');
    setSelectedTeacher(teacher);
    setShowModal(true);
  };

  const handleDeleteTeacher = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este docente?')) {
      setDocentes(docentes.filter(doc => doc.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'create') {
      const newTeacher = {
        ...formData,
        id: Date.now(),
        experiencia: parseInt(formData.experiencia),
        salario: parseFloat(formData.salario),
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };
      setDocentes([...docentes, newTeacher]);
    } else if (modalType === 'edit') {
      setDocentes(docentes.map(doc => 
        doc.id === selectedTeacher.id ? { 
          ...doc, 
          ...formData, 
          experiencia: parseInt(formData.experiencia),
          salario: parseFloat(formData.salario)
        } : doc
      ));
    }
    
    setShowModal(false);
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
              <GraduationCap className="h-6 w-6 text-green-600" />
              Gestión de Docentes
            </h2>
            <p className="text-gray-600 mt-1">
              {docentesFiltrados.length} docente{docentesFiltrados.length !== 1 ? 's' : ''} encontrado{docentesFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={handleCreateTeacher}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            Nuevo Docente
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, email o especialidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Vacaciones">Vacaciones</option>
              <option value="Licencia">Licencia</option>
            </select>
            
            <select
              value={filterEspecialidad}
              onChange={(e) => setFilterEspecialidad(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="Todos">Todas las especialidades</option>
              <option value="Cosmetología">Cosmetología</option>
              <option value="Cosmiatría">Cosmiatría</option>
              <option value="Maquillaje">Maquillaje</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de docentes */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Docente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Experiencia
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
            {docentesFiltrados.map((docente) => (
              <tr key={docente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={docente.foto} 
                        alt={`${docente.nombre} ${docente.apellido}`} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {docente.nombre} {docente.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cédula: {docente.cedula}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {docente.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {docente.telefono}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{docente.especialidad}</div>
                  <div className="text-sm text-gray-500">
                    {docente.cursosAsignados.length} curso{docente.cursosAsignados.length !== 1 ? 's' : ''} asignado{docente.cursosAsignados.length !== 1 ? 's' : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{docente.experiencia} años</div>
                  <div className="text-sm text-gray-500">
                    Desde: {new Date(docente.fechaContratacion).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    docente.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                    docente.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                    docente.estado === 'Vacaciones' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {docente.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ${docente.salario}
                  </div>
                  <div className="text-sm text-gray-500">mensual</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewTeacher(docente)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditTeacher(docente)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(docente.id)}
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

      {docentesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay docentes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron docentes con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal>
          {modalType === 'view' && selectedTeacher ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Docente</h3>
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
                    src={selectedTeacher.foto} 
                    alt={`${selectedTeacher.nombre} ${selectedTeacher.apellido}`} 
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedTeacher.nombre} {selectedTeacher.apellido}
                    </h4>
                    <p className="text-gray-500">Cédula: {selectedTeacher.cedula}</p>
                    <p className="text-green-600 font-medium">{selectedTeacher.especialidad}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTeacher.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTeacher.telefono}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experiencia</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTeacher.experiencia} años</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Salario</label>
                      <p className="mt-1 text-sm text-gray-900">${selectedTeacher.salario} mensual</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedTeacher.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                        selectedTeacher.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                        selectedTeacher.estado === 'Vacaciones' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedTeacher.estado}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Contratación</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedTeacher.fechaContratacion).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cursos Asignados</label>
                      <div className="mt-1 space-y-1">
                        {selectedTeacher.cursosAsignados.map((curso, idx) => (
                          <span key={idx} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1">
                            {curso}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificaciones</label>
                      <div className="mt-1 space-y-1">
                        {selectedTeacher.certificaciones.map((cert, idx) => (
                          <span key={idx} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? 'Nuevo Docente' : 'Editar Docente'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Cosmetología Avanzada"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experiencia (años) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experiencia}
                    onChange={(e) => setFormData({...formData, experiencia: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="1000.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Vacaciones">Vacaciones</option>
                    <option value="Licencia">Licencia</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cursos Asignados (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.cursosAsignados) ? formData.cursosAsignados.join(', ') : ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cursosAsignados: e.target.value.split(',').map(curso => curso.trim()).filter(curso => curso)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Cosmetología, Técnicas Faciales"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificaciones (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(formData.certificaciones) ? formData.certificaciones.join(', ') : ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      certificaciones: e.target.value.split(',').map(cert => cert.trim()).filter(cert => cert)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Certificado en Cosmetología, Especialización en Dermatología"
                  />
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
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  {modalType === 'create' ? 'Crear Docente' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PanelDocentes;