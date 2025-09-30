import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaginaInicio from './pages/Inicio';
import PaginaCursos from './pages/Cursos';
import PaginaAvales from './pages/Avales';
import PaginaSobreNosotros from './pages/SobreNosotros';
import PaginaAulaVirtual from './pages/AulaVirtual';
import PaginaContactenos from './pages/Contactenos';
import DetalleCurso from './pages/DetalleCurso';
import PublicLayout from './components/PublicLayout';
import Pago from './pages/Pago';
import PanelSuperAdmin from './roles/superadmin/PanelSuperAdmin';
import PanelAdministrativos from './roles/admin/PanelAdministrativos';
import PanelEstudiantes from './roles/estudiante/PanelEstudiantes';
import PanelDocentes from './roles/docente/PanelDocentes';
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
          {/* Rutas públicas con PublicLayout */}
          <Route path="/" element={<PublicLayout><PaginaInicio /></PublicLayout>} />
          <Route path="/cursos" element={<PublicLayout><PaginaCursos /></PublicLayout>} />
          <Route path="/avales" element={<PublicLayout><PaginaAvales /></PublicLayout>} />
          <Route path="/sobre-nosotros" element={<PublicLayout><PaginaSobreNosotros /></PublicLayout>} />
          <Route path="/aula-virtual" element={<PublicLayout><PaginaAulaVirtual /></PublicLayout>} />
          <Route path="/contactenos" element={<PublicLayout><PaginaContactenos /></PublicLayout>} />
          <Route path="/detalle-curso" element={<PublicLayout><DetalleCurso /></PublicLayout>} />
          <Route path="/pago" element={<PublicLayout><Pago /></PublicLayout>} />
          
          {/* Panel SuperAdmin standalone (sin DashboardLayout) */}
          <Route
            path="/panel/superadmin"
            element={
              <ProtectedRoute allowRoles={['superadmin']}>
                <PanelSuperAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel/superadmin/:tab"
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
          {/* Panel Estudiantes */}
          <Route
            path="/panel/estudiante"
            element={
              <ProtectedRoute allowRoles={['estudiante']}>
                <PanelEstudiantes />
              </ProtectedRoute>
            }
          />
          {/* Panel Docentes */}
          <Route
            path="/panel/docente"
            element={
              <ProtectedRoute allowRoles={['docente']}>
                <PanelDocentes />
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