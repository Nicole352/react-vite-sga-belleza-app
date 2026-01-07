import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './context/ThemeContext';
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
import './styles/responsive.css';
import './utils/modalScrollHelper';

import { useIdle } from './hooks/useIdle';

const ToasterWithTheme = () => {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      gutter={12}
      containerStyle={{
        bottom: 40,
        right: 40,
        zIndex: 999999,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          color: theme === 'dark' ? '#fff' : '#1a1a1a',
          border: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          padding: '16px 20px',
          fontSize: '0.95rem',
          fontWeight: '600',
          boxShadow: theme === 'dark'
            ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          minWidth: '320px',
          maxWidth: '500px',
        },
        success: {
          duration: 4000,
          style: {
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
            border: `1px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: theme === 'dark' ? '#10b981' : '#059669',
            backdropFilter: 'blur(10px)',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#10b981' : '#059669',
            secondary: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
            border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: theme === 'dark' ? '#ef4444' : '#dc2626',
            backdropFilter: 'blur(10px)',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#ef4444' : '#dc2626',
            secondary: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
          },
        },
        loading: {
          style: {
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)'}`,
            color: theme === 'dark' ? '#3b82f6' : '#2563eb',
            backdropFilter: 'blur(10px)',
          },
          iconTheme: {
            primary: theme === 'dark' ? '#3b82f6' : '#2563eb',
            secondary: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          },
        },
      }}
    />
  );
};

// Componente auxiliar para usar el hook dentro del contexto del Router
const SessionMonitor = () => {
  useIdle(300000); // 5 minutos de tiempo de espera por inactividad
  return null;
};

const App: React.FC = () => {
  return (
    <>
      <ToasterWithTheme />
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
        <SessionMonitor />
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
                <ProtectedRoute allowRoles={['administrativo', 'superadmin']}>
                  <PanelAdministrativos />
                </ProtectedRoute>
              }
            />
            {/* Panel Estudiantes */}
            <Route
              path="/panel/estudiante/*" element={
                <ProtectedRoute allowRoles={['estudiante']}>
                  <PanelEstudiantes />
                </ProtectedRoute>
              }
            />
            {/* Panel Docentes */}
            <Route
              path="/panel/docente/*"
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
    </>
  );
};

export default App;