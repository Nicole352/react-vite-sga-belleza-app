import { useState } from 'react';
import { 
  Users, BookOpen, MapPin, BarChart3, GraduationCap, UserCheck, FileText
} from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';

// Importar componentes modulares
import Dashboard from './Dashboard';
import GestionCursos from './GestionCursos';
import GestionMatricula from './GestionMatricula';
import GestionEstudiantes from './GestionEstudiantes';
import GestionDocentes from './GestionDocentes';
import AsignacionAula from './AsignacionAula';
import Reportes from './Reportes';
import GestionTiposCurso from './GestionTiposCurso';

const PanelAdministrativos = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'tipos', name: 'Tipos de Curso', icon: BookOpen },
    { id: 'cursos', name: 'Gestión Cursos', icon: BookOpen },
    { id: 'matricula', name: 'Gestión Matrícula', icon: GraduationCap },
    { id: 'estudiantes', name: 'Gestión Estudiantes', icon: Users },
    { id: 'docentes', name: 'Gestión Docentes', icon: UserCheck },
    { id: 'aulas', name: 'Asignación Aula', icon: MapPin },
    { id: 'reportes', name: 'Reportes', icon: FileText }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Montserrat, sans-serif',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(26,26,46,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '0 20px 20px 0',
        padding: '24px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header del Sidebar */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
          }}>
            <UserCheck size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ 
              color: '#fff', 
              fontSize: '1.2rem', 
              fontWeight: '700', 
              margin: 0,
              lineHeight: 1.2
            }}>
              Panel
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '0.9rem', 
              margin: 0 
            }}>
              Administrativos
            </p>
          </div>
        </div>
        
        {/* Navegación del Sidebar */}
        <nav style={{ marginBottom: '32px' }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeTab === tab.id ? 
                    'linear-gradient(135deg, #ef4444, #dc2626)' : 
                    'transparent',
                  color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  boxShadow: activeTab === tab.id ? '0 8px 20px rgba(239, 68, 68, 0.3)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <IconComponent size={20} />
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <div style={{ 
          position: 'absolute', 
          bottom: '24px', 
          left: '24px', 
          right: '24px' 
        }}>
          <LogoutButton />
        </div>
      </div>

      {/* Contenido Principal */}
      <div style={{
        marginLeft: '280px',
        flex: 1,
        padding: '24px',
        minHeight: '100vh'
      }}>
        {/* Header del contenido */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          padding: '24px 32px',
          marginBottom: '24px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)'
            }}>
              {(() => {
                const activeTabData = tabs.find(t => t.id === activeTab);
                const IconComponent = activeTabData?.icon || BarChart3;
                return <IconComponent size={28} color="#fff" />;
              })()}
            </div>
            <div>
              <h1 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '800', 
                color: '#fff',
                margin: 0,
                background: 'linear-gradient(135deg, #fff, #f3f4f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {tabs.find(t => t.id === activeTab)?.name || 'Dashboard'}
              </h1>
              <p style={{ 
                color: 'rgba(255,255,255,0.8)', 
                margin: 0, 
                fontSize: '1rem',
                marginTop: '4px'
              }}>
                {activeTab === 'dashboard' && 'Resumen general del sistema administrativo'}
                {activeTab === 'tipos' && 'Gestión de tipos y categorías de cursos'}
                {activeTab === 'cursos' && 'Administración de cursos y programas'}
                {activeTab === 'matricula' && 'Control de matrículas y inscripciones'}
                {activeTab === 'estudiantes' && 'Gestión de estudiantes registrados'}
                {activeTab === 'docentes' && 'Administración de profesores y docentes'}
                {activeTab === 'aulas' && 'Asignación y control de aulas'}
                {activeTab === 'reportes' && 'Reportes y estadísticas del sistema'}
              </p>
            </div>
          </div>
        </div>

        {/* Contenido de la sección activa */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          minHeight: '600px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
        }}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'tipos' && <GestionTiposCurso />}
          {activeTab === 'estudiantes' && <GestionEstudiantes />}
          {activeTab === 'cursos' && <GestionCursos />}
          {activeTab === 'matricula' && <GestionMatricula />}
          {activeTab === 'docentes' && <GestionDocentes />}
          {activeTab === 'aulas' && <AsignacionAula />}
          {activeTab === 'reportes' && <Reportes />}
        </div>
      </div>
    </div>
  );
};

export default PanelAdministrativos;
