import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
        {/* Toaster global - Notificaciones profesionales */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            bottom: 40,
            right: 40,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '0.95rem',
              fontWeight: '600',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              minWidth: '320px',
              maxWidth: '500px',
            },
            success: {
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#10b981',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: 'rgba(16, 185, 129, 0.1)',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ef4444',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: 'rgba(239, 68, 68, 0.1)',
              },
            },
            loading: {
              style: {
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#3b82f6',
                backdropFilter: 'blur(10px)',
              },
              iconTheme: {
                primary: '#3b82f6',
                secondary: 'rgba(59, 130, 246, 0.1)',
              },
            },
          }}
        />
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