import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Mail,
  Phone,
  X
} from 'lucide-react';

const PanelEstudiantes = () => {
  // Estado para los estudiantes
  const [estudiantes, setEstudiantes] = useState([
    {
      id: 1,
      nombre: 'Ana María',
      apellido: 'González',
      email: 'ana.gonzalez@email.com',
      telefono: '+593 99 123 4567',
      cedula: '1234567890',
      fechaNacimiento: '1995-03-15',
      curso: 'Cosmetología',
      estado: 'Activo',
      fechaInscripcion: '2024-01-15',
      promedio: 8.5,
      direccion: 'Av. Principal 123, Quito',
      emergenciaContacto: 'María González - +593 99 111 2222',
      observaciones: 'Estudiante destacada con gran interés en técnicas avanzadas',
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b55c?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      nombre: 'Carlos',
      apellido: 'Mendoza',
      email: 'carlos.mendoza@email.com',
      telefono: '+593 98 765 4321',
      cedula: '0987654321',
      fechaNacimiento: '1992-07-22',
      curso: 'Cosmiatría',
      estado: 'Activo',
      fechaInscripcion: '2024-02-01',
      promedio: 9.2,
      direccion: 'Calle 45 No. 67-89, Quito',
      emergenciaContacto: 'Rosa Mendoza - +593 98 333 4444',
      observaciones: 'Excelente manejo de equipos tecnológicos',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      nombre: 'María José',
      apellido: 'Rodríguez',
      email: 'maria.rodriguez@email.com',
      telefono: '+593 97 555 0123',
      cedula: '1122334455',
      fechaNacimiento: '1998-11-08',
      curso: 'Maquillaje Profesional',
      estado: 'Inactivo',
      fechaInscripcion: '2023-12-10',
      promedio: 7.8,
      direccion: 'Barrio Norte, Mz. 5 Casa 12',
      emergenciaContacto: 'Pedro Rodríguez - +593 97 555 6666',
      observaciones: 'Requiere seguimiento académico',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      nombre: 'Sofía',
      apellido: 'Herrera',
      email: 'sofia.herrera@email.com',
      telefono: '+593 96 444 5555',
      cedula: '1357924680',
      fechaNacimiento: '1996-05-30',
      curso: 'Cosmetología',
      estado: 'Activo',
      fechaInscripcion: '2024-03-10',
      promedio: 8.9,
      direccion: 'Sector Sur, Av. 6 de Diciembre',
      emergenciaContacto: 'Ana Herrera - +593 96 777 8888',
      observaciones: 'Muestra gran creatividad en sus trabajos prácticos',
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    }
  ]);

  // Estados para UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('Todos');
  const [filterCurso, setFilterCurso] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    fechaNacimiento: '',
    curso: '',
    estado: 'Activo',
    direccion: '',
    emergenciaContacto: '',
    observaciones: ''
  });

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    const matchesSearch = estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estudiante.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estudiante.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estudiante.cedula.includes(searchTerm);
    const matchesEstado = filterEstado === 'Todos' || estudiante.estado === filterEstado;
    const matchesCurso = filterCurso === 'Todos' || estudiante.curso === filterCurso;
    
    return matchesSearch && matchesEstado && matchesCurso;
  });

  // Funciones CRUD
  const handleCreateStudent = () => {
    setModalType('create');
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      cedula: '',
      fechaNacimiento: '',
      curso: '',
      estado: 'Activo',
      direccion: '',
      emergenciaContacto: '',
      observaciones: ''
    });
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setModalType('edit');
    setSelectedStudent(student);
    setFormData({
      nombre: student.nombre,
      apellido: student.apellido,
      email: student.email,
      telefono: student.telefono,
      cedula: student.cedula,
      fechaNacimiento: student.fechaNacimiento,
      curso: student.curso,
      estado: student.estado,
      direccion: student.direccion,
      emergenciaContacto: student.emergenciaContacto,
      observaciones: student.observaciones
    });
    setShowModal(true);
  };

  const handleViewStudent = (student) => {
    setModalType('view');
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este estudiante?')) {
      setEstudiantes(estudiantes.filter(est => est.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalType === 'create') {
      const newStudent = {
        ...formData,
        id: Date.now(),
        fechaInscripcion: new Date().toISOString().split('T')[0],
        promedio: 0,
        foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      };
      setEstudiantes([...estudiantes, newStudent]);
    } else if (modalType === 'edit') {
      setEstudiantes(estudiantes.map(est => 
        est.id === selectedStudent.id ? { ...est, ...formData } : est
      ));
    }
    
    setShowModal(false);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Cédula', 'Curso', 'Estado', 'Promedio'];
    const csvContent = [
      headers.join(','),
      ...estudiantesFiltrados.map(est => [
        est.id,
        est.nombre,
        est.apellido,
        est.email,
        est.telefono,
        est.cedula,
        est.curso,
        est.estado,
        est.promedio
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <Users className="h-6 w-6 text-blue-600" />
              Gestión de Estudiantes
            </h2>
            <p className="text-gray-600 mt-1">
              {estudiantesFiltrados.length} estudiante{estudiantesFiltrados.length !== 1 ? 's' : ''} encontrado{estudiantesFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              Exportar
            </button>
            <button
              onClick={handleCreateStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              Nuevo Estudiante
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Suspendido">Suspendido</option>
            </select>
            
            <select
              value={filterCurso}
              onChange={(e) => setFilterCurso(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Todos">Todos los cursos</option>
              <option value="Cosmetología">Cosmetología</option>
              <option value="Cosmiatría">Cosmiatría</option>
              <option value="Maquillaje Profesional">Maquillaje Profesional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{estudiantes.filter(e => e.estado === 'Activo').length}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{estudiantes.filter(e => e.estado === 'Inactivo').length}</div>
            <div className="text-sm text-gray-600">Inactivos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{estudiantes.filter(e => e.estado === 'Suspendido').length}</div>
            <div className="text-sm text-gray-600">Suspendidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {estudiantes.length > 0 ? (estudiantes.reduce((acc, est) => acc + est.promedio, 0) / estudiantes.length).toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Promedio General</div>
          </div>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Curso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Promedio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {estudiantesFiltrados.map((estudiante) => (
              <tr key={estudiante.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={estudiante.foto} 
                        alt={`${estudiante.nombre} ${estudiante.apellido}`} 
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {estudiante.nombre} {estudiante.apellido}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cédula: {estudiante.cedula}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {estudiante.email}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {estudiante.telefono}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{estudiante.curso}</div>
                  <div className="text-sm text-gray-500">
                    Inscrito: {new Date(estudiante.fechaInscripcion).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    estudiante.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                    estudiante.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {estudiante.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {estudiante.promedio}/10
                    </span>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          estudiante.promedio >= 8 ? 'bg-green-600' :
                          estudiante.promedio >= 7 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${estudiante.promedio * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewStudent(estudiante)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditStudent(estudiante)}
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(estudiante.id)}
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

      {estudiantesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay estudiantes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No se encontraron estudiantes con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal>
          {modalType === 'view' && selectedStudent ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Detalles del Estudiante</h3>
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
                    src={selectedStudent.foto} 
                    alt={`${selectedStudent.nombre} ${selectedStudent.apellido}`} 
                  />
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedStudent.nombre} {selectedStudent.apellido}
                    </h4>
                    <p className="text-gray-500">Cédula: {selectedStudent.cedula}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.telefono}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.direccion}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contacto de Emergencia</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.emergenciaContacto}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Curso</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.curso}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedStudent.estado === 'Activo' ? 'bg-green-100 text-green-800' :
                        selectedStudent.estado === 'Inactivo' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedStudent.estado}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Promedio</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedStudent.promedio}/10</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha de Inscripción</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedStudent.fechaInscripcion).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                  <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedStudent.observaciones || 'Sin observaciones'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'create' ? 'Nuevo Estudiante' : 'Editar Estudiante'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Curso *
                  </label>
                  <select
                    required
                    value={formData.curso}
                    onChange={(e) => setFormData({...formData, curso: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar curso</option>
                    <option value="Cosmetología">Cosmetología</option>
                    <option value="Cosmiatría">Cosmiatría</option>
                    <option value="Maquillaje Profesional">Maquillaje Profesional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Suspendido">Suspendido</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    value={formData.emergenciaContacto}
                    onChange={(e) => setFormData({...formData, emergenciaContacto: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre y teléfono del contacto de emergencia"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Observaciones adicionales sobre el estudiante"
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  {modalType === 'create' ? 'Crear Estudiante' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};

export default PanelEstudiantes;