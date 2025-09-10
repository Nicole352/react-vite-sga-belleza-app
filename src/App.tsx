import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaInicio from './pages/Inicio';
import PaginaCursos from './pages/Cursos';
import PaginaAvales from './pages/Avales';
import PaginaSobreNosotros from './pages/SobreNosotros';
import PaginaAulaVirtual from './pages/AulaVirtual';
import PaginaContactenos from './pages/Contactenos';
import DetalleCurso from './pages/DetalleCurso';
import Header from './components/Header';
import Pago from './pages/Pago';
import PanelSuperAdmin from './roles/superadmin/PanelSuperAdmin';
import PanelAdministrativos from './roles/admin/PanelAdministrativos';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRedirect from './components/auth/RoleRedirect';

const App: React.FC = () => {
  return (
    <Router future={{ 
      v7_startTransition: true,
      v7_relativeSplatPath: true 
    }}>
      <div className="App">
        <Routes>
          {/* Rutas públicas con Header */}
          <Route path="/" element={<><Header /><PaginaInicio /></>} />
          <Route path="/cursos" element={<><Header /><PaginaCursos /></>} />
          <Route path="/avales" element={<><Header /><PaginaAvales /></>} />
          <Route path="/sobre-nosotros" element={<><Header /><PaginaSobreNosotros /></>} />
          <Route path="/aula-virtual" element={<><Header /><PaginaAulaVirtual /></>} />
          <Route path="/contactenos" element={<><Header /><PaginaContactenos /></>} />
          <Route path="/detalle-curso" element={<><Header /><DetalleCurso /></>} />
          <Route path="/pago" element={<><Header /><Pago /></>} />
          {/* Panel SuperAdmin standalone (sin DashboardLayout) */}
          <Route
            path="/panel/superadmin"
            element={
              <ProtectedRoute allowRoles={['superadmin']}>
                <PanelSuperAdmin />
              </ProtectedRoute>
            }
          />

          {/* Panel Administrativos */}
          <Route
            path="/panel/administrativo"
            element={
              <ProtectedRoute allowRoles={['administrativo','superadmin']}>
                <PanelAdministrativos />
              </ProtectedRoute>
            }
          />
          
          {/* Rutas del dashboard sin Header (tiene su propia navegación) */}
          {/* Al acceder a /dashboard redirigimos según el rol; no mostramos nada por defecto */}
          <Route path="/dashboard/*" element={<RoleRedirect />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;