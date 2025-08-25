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
import DashboardLayout from './pages/DashboardLayout';

function App() {
  return (
    <Router>
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
          
          {/* Rutas del dashboard sin Header (tiene su propia navegación) */}
          <Route path="/dashboard/*" element={<DashboardLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;