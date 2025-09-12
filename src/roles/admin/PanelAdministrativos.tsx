import { useState } from 'react';
import { 
  Users, BookOpen, MapPin, BarChart3, GraduationCap, UserCheck, FileText
} from 'lucide-react';

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: 'Montserrat, sans-serif',
      padding: '40px'
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,46,0.9) 100%)',
        backdropFilter: 'blur(20px)', borderRadius: '32px',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.3)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '40px 40px 0 40px', textAlign: 'center' }}>
          <div style={{
            width: '120px', height: '120px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px auto', boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)'
          }}>
            <UserCheck size={48} color="#fff" />
          </div>
          <h1 style={{
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontSize: '3rem', fontWeight: '800', margin: '0 0 16px 0'
          }}>
            Panel Administrativos
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', margin: '0 0 40px 0' }}>
            Sistema de gestión integral para administradores
          </p>
        </div>

        {/* Navegación de pestañas */}
        <div style={{ padding: '0 40px 40px 40px' }}>
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '32px',
            flexWrap: 'wrap', justifyContent: 'center'
          }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'tipos', label: 'Tipos de Curso', icon: BookOpen },
              { id: 'cursos', label: 'Gestión Cursos', icon: BookOpen },
              { id: 'matricula', label: 'Gestión Matrícula', icon: GraduationCap },
              { id: 'estudiantes', label: 'Gestión Estudiantes', icon: Users },
              { id: 'docentes', label: 'Gestión Docentes', icon: UserCheck },
              { id: 'aulas', label: 'Asignación Aula', icon: MapPin },
              { id: 'reportes', label: 'Reportes', icon: FileText }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'rgba(255,255,255,0.05)',
                  border: activeTab === tab.id 
                    ? '2px solid #ef4444' : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', color: '#fff', fontSize: '0.9rem',
                  fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease'
                }}>
                  <IconComponent size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenido de las pestañas */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(26,26,26,0.9) 100%)',
            backdropFilter: 'blur(20px)', borderRadius: '24px',
            border: '1px solid rgba(239, 68, 68, 0.2)', minHeight: '600px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
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
    </div>
  );
};

export default PanelAdministrativos;
