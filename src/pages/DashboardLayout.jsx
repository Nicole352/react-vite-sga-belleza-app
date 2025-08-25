import React, { useState } from 'react';
import { Users, GraduationCap, BookOpen, Menu, X, Home, UserCheck, Shield, Settings } from 'lucide-react';

// Importar los componentes de cada panel
import PanelEstudiantes from '../components/dashboard/PanelEstudiantes';
import PanelDocentes from '../components/dashboard/PanelDocentes';
import PanelAdministrativos from '../components/dashboard/PanelAdministrativos';
import PanelSuperAdmin from '../components/dashboard/PanelSuperAdmin';

const DashboardLayout = () => {
  const [activeSection, setActiveSection] = useState('estudiantes');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Simulación de rol de usuario - esto vendría de tu sistema de autenticación
  const [userRole] = useState('super_admin'); // 'estudiante', 'docente', 'administrativo', 'super_admin'

  // Configuración de menús según rol
  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['estudiante', 'docente', 'administrativo', 'super_admin'] },
      { id: 'estudiantes', label: 'Estudiantes', icon: Users, roles: ['docente', 'administrativo', 'super_admin'] },
      { id: 'docentes', label: 'Docentes', icon: GraduationCap, roles: ['administrativo', 'super_admin'] },
      { id: 'administrativos', label: 'Administrativos', icon: UserCheck, roles: ['super_admin'] },
      { id: 'super-admin', label: 'Super Admin', icon: Shield, roles: ['super_admin'] },
      { id: 'configuracion', label: 'Configuración', icon: Settings, roles: ['administrativo', 'super_admin'] },
    ];

    return baseItems.filter(item => item.roles.includes(userRole));
  };

  const menuItems = getMenuItems();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido al Panel Educativo!
                </h1>
                <p className="text-gray-600 text-lg">
                  Rol actual: <span className="font-semibold capitalize">{userRole.replace('_', ' ')}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                {menuItems.slice(1).map((item, index) => {
                  const IconComponent = item.icon;
                  const colors = [
                    'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
                    'from-green-50 to-green-100 border-green-200 text-green-600',
                    'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
                    'from-red-50 to-red-100 border-red-200 text-red-600',
                    'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600'
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`bg-gradient-to-br ${colorClass} p-6 rounded-lg border hover:shadow-md transition-all duration-200`}
                    >
                      <IconComponent className="h-10 w-10 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">{item.label}</h3>
                      <p className="text-sm opacity-75">Gestionar {item.label.toLowerCase()}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      case 'estudiantes':
        return <PanelEstudiantes />;
      case 'docentes':
        return <PanelDocentes />;
      case 'administrativos':
        return <PanelAdministrativos />;
      case 'super-admin':
        return <PanelSuperAdmin />;
      case 'configuracion':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración del Sistema</h2>
            <p className="text-gray-600 mb-6">Administra las configuraciones generales del sistema.</p>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Panel de configuración - En desarrollo</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 relative z-30">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden transition-colors duration-200"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">
              Panel Educativo
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Usuario: <span className="font-medium text-gray-700 capitalize">{userRole.replace('_', ' ')}</span>
            </div>
            <button className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200">
              <span className="text-white text-sm font-medium">A</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Sidebar content */}
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Logo/Brand */}
              <div className="flex items-center px-4 mb-8">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Instituto</p>
                  <p className="text-xs text-gray-500">Panel de Control</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`${
                        activeSection === item.id
                          ? 'bg-blue-100 border-r-2 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 w-full text-left`}
                    >
                      <IconComponent
                        className={`${
                          activeSection === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Footer del sidebar */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex-shrink-0 w-full">
                <p className="text-xs text-gray-500 text-center">
                  Panel Educativo v1.0
                </p>
                <div className="mt-2 flex justify-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userRole === 'super_admin' ? 'bg-red-100 text-red-800' :
                    userRole === 'administrativo' ? 'bg-purple-100 text-purple-800' :
                    userRole === 'docente' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col lg:pl-0">
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;