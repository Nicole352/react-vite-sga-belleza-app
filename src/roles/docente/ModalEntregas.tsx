import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Download, User, Calendar, FileText, CheckCircle, AlertCircle, 
  Search, Filter, Eye, Award, Clock, FileCheck, Users 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface ModalEntregasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id_tarea: number;
  nombre_tarea: string;
  nota_maxima: number;
  darkMode: boolean;
}

interface Entrega {
  id_entrega: number;
  id_estudiante: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_identificacion?: string;
  archivo_nombre: string;
  fecha_entrega: string;
  estado: string;
  calificacion?: number;
  comentario?: string;
  fecha_calificacion?: string;
}

const ModalEntregas: React.FC<ModalEntregasProps> = ({
  isOpen,
  onClose,
  onSuccess,
  id_tarea,
  nombre_tarea,
  nota_maxima,
  darkMode
}) => {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [filteredEntregas, setFilteredEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [calificando, setCalificando] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'calificadas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState<Entrega | null>(null);
  const [notaInput, setNotaInput] = useState('');
  const [comentarioInput, setComentarioInput] = useState('');

  useEffect(() => {
    console.log('ModalEntregas - isOpen:', isOpen, 'id_tarea:', id_tarea);
    if (isOpen && id_tarea) {
      fetchEntregas();
    }
  }, [isOpen, id_tarea]);

  useEffect(() => {
    // Aplicar filtros y búsqueda
    let result = [...entregas];
    
    // Aplicar filtro
    if (filtro === 'pendientes') {
      result = result.filter(e => e.calificacion === undefined || e.calificacion === null);
    } else if (filtro === 'calificadas') {
      result = result.filter(e => e.calificacion !== undefined && e.calificacion !== null);
    }
    
    // Aplicar búsqueda
    if (busqueda) {
      const term = busqueda.toLowerCase();
      result = result.filter(e => 
        e.estudiante_nombre.toLowerCase().includes(term) ||
        e.estudiante_apellido.toLowerCase().includes(term)
      );
    }
    
    setFilteredEntregas(result);
  }, [entregas, filtro, busqueda]);

  const fetchEntregas = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      console.log('Fetching entregas para tarea:', id_tarea);
      const response = await axios.get(`${API_BASE}/entregas/tarea/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Respuesta de entregas:', response.data);
      
      // Mapear los datos del backend al formato del frontend
      let entregasFormateadas = (response.data.entregas || []).map((entrega: any) => ({
        ...entrega,
        estudiante_identificacion: entrega.estudiante?.identificacion || entrega.estudiante_identificacion,
        calificacion: entrega.nota, // Backend usa 'nota', frontend usa 'calificacion'
        comentario: entrega.comentario_docente // Backend usa 'comentario_docente', frontend usa 'comentario'
      }));
      
      // Ordenar alfabéticamente por apellido y luego por nombre
      entregasFormateadas = entregasFormateadas.sort((a: Entrega, b: Entrega) => {
        const apellidoA = a.estudiante_apellido || '';
        const apellidoB = b.estudiante_apellido || '';
        const nombreA = a.estudiante_nombre || '';
        const nombreB = b.estudiante_nombre || '';
        
        // Primero comparar por apellido
        const apellidoComparison = apellidoA.localeCompare(apellidoB, 'es', { sensitivity: 'base' });
        if (apellidoComparison !== 0) {
          return apellidoComparison;
        }
        
        // Si los apellidos son iguales, comparar por nombre
        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
      });
      
      setEntregas(entregasFormateadas);
      console.log('Entregas establecidas:', entregasFormateadas);
    } catch (error) {
      console.error('Error fetching entregas:', error);
      toast.error('Error al cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  const handleCalificar = async (id_entrega: number) => {
    const nota = parseFloat(notaInput || '0');
    const comentario = comentarioInput || '';

    if (isNaN(nota) || nota < 0 || nota > nota_maxima) {
      toast.error(`La nota debe estar entre 0 y ${nota_maxima}`);
      return;
    }

    try {
      setCalificando(id_entrega);
      const token = sessionStorage.getItem('auth_token');
      
      await axios.post(`${API_BASE}/entregas/${id_entrega}/calificar`, {
        nota,
        comentario_docente: comentario
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Tarea calificada exitosamente');
      fetchEntregas();
      onSuccess();
      
      // Cerrar modal de calificación
      setShowCalificarModal(false);
      setEntregaSeleccionada(null);
      setNotaInput('');
      setComentarioInput('');
    } catch (error: any) {
      console.error('Error calificando:', error);
      toast.error(error.response?.data?.error || 'Error al calificar');
    } finally {
      setCalificando(null);
    }
  };

  const handleDescargar = async (id_entrega: number, archivo_nombre: string) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/entregas/${id_entrega}/archivo`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Obtener el tipo MIME del header de respuesta
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log('Content-Type recibido:', contentType);
      console.log('Nombre de archivo:', archivo_nombre);

      // Crear blob con el tipo correcto
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', archivo_nombre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Archivo descargado exitosamente');
    } catch (error) {
      console.error('Error descargando archivo:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const abrirModalCalificar = (entrega: Entrega) => {
    setEntregaSeleccionada(entrega);
    setNotaInput(entrega.calificacion?.toString() || '');
    setComentarioInput(entrega.comentario || '');
    setShowCalificarModal(true);
  };

  const calcularEstadisticas = () => {
    const total = entregas.length;
    const calificadas = entregas.filter(e => e.calificacion !== undefined && e.calificacion !== null).length;
    const pendientes = total - calificadas;
    const porcentaje = total > 0 ? Math.round((calificadas / total) * 100) : 0;
    
    return { total, calificadas, pendientes, porcentaje };
  };

  if (!isOpen) {
    console.log('Modal cerrado, no se renderiza');
    return null;
  }

  console.log('Renderizando modal con entregas:', entregas.length);

  const theme = {
    bg: 'rgba(0,0,0,0.75)',
    modalBg: darkMode ? '#1a1a2e' : '#ffffff',
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.7)',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    inputBg: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    inputBorder: darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db',
    rowHover: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
  };

  const stats = calcularEstadisticas();

  const modalContent = (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        backdropFilter: 'blur(0.375rem)'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.modalBg,
          borderRadius: '0.75em',
          width: '95%',
          maxWidth: '75rem',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 1rem 3rem rgba(0,0,0,0.45)' : '0 1rem 3rem rgba(0,0,0,0.18)'
        }}>
        {/* Header */}
        <div style={{
          padding: '1.25em',
          borderBottom: `0.0625rem solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.5em 0' }}>
              📚 Entregas de Tarea
            </h2>
            <p style={{ color: theme.textSecondary, fontSize: '1rem', margin: 0 }}>
              {nombre_tarea}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              padding: '0.5em',
              borderRadius: '0.5em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Estadísticas */}
        <div style={{
          padding: '1em 1.25em',
          borderBottom: `0.0625rem solid ${theme.border}`,
          background: darkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)'
        }}>
          <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              padding: '0.5em 1em',
              background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
              borderRadius: '0.5em',
              border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`
            }}>
              <Users size={18} color={darkMode ? '#3b82f6' : '#2563eb'} />
              <div>
                <div style={{ color: theme.textPrimary, fontSize: '0.9rem', fontWeight: '600' }}>
                  {stats.total}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                  Total
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              padding: '0.5em 1em',
              background: darkMode ? 'rgba(251, 191, 36, 0.1)' : 'rgba(251, 191, 36, 0.05)',
              borderRadius: '0.5em',
              border: `1px solid ${darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.2)'}`
            }}>
              <Clock size={18} color="#fbbf24" />
              <div>
                <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: '600' }}>
                  {stats.pendientes}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                  Pendientes
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              padding: '0.5em 1em',
              background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)',
              borderRadius: '0.5em',
              border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
            }}>
              <FileCheck size={18} color="#10b981" />
              <div>
                <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                  {stats.calificadas}
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                  Calificadas
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              padding: '0.5em 1em',
              background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
              borderRadius: '0.5em',
              border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}>
              <Award size={18} color="#10b981" />
              <div>
                <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                  {stats.porcentaje}%
                </div>
                <div style={{ color: theme.textSecondary, fontSize: '0.75rem' }}>
                  Completado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de filtro y búsqueda */}
        <div style={{
          padding: '1em 1.25em',
          borderBottom: `0.0625rem solid ${theme.border}`,
          display: 'flex',
          gap: '1em',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '0.75em',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.textSecondary
            }} />
            <input
              type="text"
              placeholder="Buscar estudiante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625em 0.625em 0.625em 2.5em',
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '0.5em' }}>
            <button
              onClick={() => setFiltro('todas')}
              style={{
                padding: '0.625em 1em',
                background: filtro === 'todas' 
                  ? darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
                  : 'transparent',
                border: `1px solid ${filtro === 'todas' ? '#3b82f6' : theme.inputBorder}`,
                borderRadius: '0.5em',
                color: filtro === 'todas' ? '#3b82f6' : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <FileText size={16} />
              Todas
            </button>
            
            <button
              onClick={() => setFiltro('pendientes')}
              style={{
                padding: '0.625em 1em',
                background: filtro === 'pendientes' 
                  ? darkMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.1)'
                  : 'transparent',
                border: `1px solid ${filtro === 'pendientes' ? '#fbbf24' : theme.inputBorder}`,
                borderRadius: '0.5em',
                color: filtro === 'pendientes' ? '#fbbf24' : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <AlertCircle size={16} />
              Pendientes
            </button>
            
            <button
              onClick={() => setFiltro('calificadas')}
              style={{
                padding: '0.625em 1em',
                background: filtro === 'calificadas' 
                  ? darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                  : 'transparent',
                border: `1px solid ${filtro === 'calificadas' ? '#10b981' : theme.inputBorder}`,
                borderRadius: '0.5em',
                color: filtro === 'calificadas' ? '#10b981' : theme.textSecondary,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em'
              }}
            >
              <CheckCircle size={16} />
              Calificadas
            </button>
          </div>
        </div>

        {/* Tabla de entregas */}
        <div style={{
          padding: '0',
          maxHeight: 'calc(90vh - 20rem)',
          overflowY: 'auto'
        }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3em', 
              color: theme.textPrimary,
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                margin: '0 auto 1em',
                animation: 'spin 1s linear infinite'
              }}></div>
              Cargando entregas...
            </div>
          ) : filteredEntregas.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3em 1em', 
              color: theme.textSecondary,
              fontSize: '1rem'
            }}>
              📋 No hay entregas que coincidan con los filtros
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead>
                  <tr style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderBottom: `2px solid ${theme.border}`
                  }}>
                    <th style={{
                      padding: '1em',
                      textAlign: 'left',
                      color: theme.textPrimary,
                      fontWeight: '700',
                      position: 'sticky',
                      left: 0,
                      background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                    }}>
                      Estudiante
                    </th>
                    <th style={{
                      padding: '1em',
                      textAlign: 'left',
                      color: theme.textPrimary,
                      fontWeight: '700'
                    }}>
                      Fecha Entrega
                    </th>
                    <th style={{
                      padding: '1em',
                      textAlign: 'left',
                      color: theme.textPrimary,
                      fontWeight: '700'
                    }}>
                      Archivo
                    </th>
                    <th style={{
                      padding: '1em',
                      textAlign: 'center',
                      color: theme.textPrimary,
                      fontWeight: '700'
                    }}>
                      Estado
                    </th>
                    <th style={{
                      padding: '1em',
                      textAlign: 'center',
                      color: theme.textPrimary,
                      fontWeight: '700'
                    }}>
                      Calificación
                    </th>
                    <th style={{
                      padding: '1em',
                      textAlign: 'center',
                      color: theme.textPrimary,
                      fontWeight: '700'
                    }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntregas.map((entrega) => (
                    <tr 
                      key={entrega.id_entrega}
                      style={{
                        borderBottom: `1px solid ${theme.border}`,
                        background: darkMode ? 'transparent' : '#fff',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.rowHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = darkMode ? 'transparent' : '#fff';
                      }}
                    >
                      <td style={{
                        padding: '1em',
                        color: theme.textPrimary,
                        fontWeight: '600'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '50%',
                            background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6',
                            fontWeight: '700'
                          }}>
                            <User size={16} />
                          </div>
                          <div>
                            <div>
                              {entrega.estudiante_apellido}, {entrega.estudiante_nombre}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: theme.textSecondary,
                              fontWeight: '400'
                            }}>
                              CI: {entrega.estudiante_identificacion || entrega.id_estudiante}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '1em',
                        color: theme.textSecondary
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                          <Calendar size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                          {new Date(entrega.fecha_entrega).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td style={{
                        padding: '1em',
                        color: theme.textSecondary
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                          <FileText size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
                          {entrega.archivo_nombre}
                        </div>
                      </td>
                      <td style={{
                        padding: '1em',
                        textAlign: 'center'
                      }}>
                        {entrega.calificacion !== undefined && entrega.calificacion !== null ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5em',
                            padding: '0.375em 0.75em',
                            borderRadius: '9999px',
                            background: darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }}>
                            <CheckCircle size={14} />
                            Calificada
                          </div>
                        ) : (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5em',
                            padding: '0.375em 0.75em',
                            borderRadius: '9999px',
                            background: darkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            fontWeight: '600',
                            fontSize: '0.75rem'
                          }}>
                            <AlertCircle size={14} />
                            Pendiente
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '1em',
                        textAlign: 'center'
                      }}>
                        {entrega.calificacion !== undefined && entrega.calificacion !== null ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25em',
                            padding: '0.375em 0.75em',
                            borderRadius: '0.5em',
                            background: darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981',
                            fontWeight: '700'
                          }}>
                            <Award size={14} />
                            {entrega.calificacion}/{nota_maxima}
                          </div>
                        ) : (
                          <div style={{
                            color: theme.textSecondary,
                            fontStyle: 'italic'
                          }}>
                            Sin calificar
                          </div>
                        )}
                      </td>
                      <td style={{
                        padding: '1em',
                        textAlign: 'center'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5em' }}>
                          <button
                            onClick={() => handleDescargar(entrega.id_entrega, entrega.archivo_nombre)}
                            style={{
                              padding: '0.5em',
                              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                              border: `1px solid ${theme.inputBorder}`,
                              borderRadius: '0.375em',
                              color: theme.textPrimary,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Descargar archivo"
                          >
                            <Download size={16} />
                          </button>
                          
                          <button
                            onClick={() => abrirModalCalificar(entrega)}
                            style={{
                              padding: '0.5em',
                              background: entrega.calificacion !== undefined && entrega.calificacion !== null
                                ? darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                                : darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                              border: `1px solid ${entrega.calificacion !== undefined && entrega.calificacion !== null ? '#3b82f6' : '#10b981'}`,
                              borderRadius: '0.375em',
                              color: entrega.calificacion !== undefined && entrega.calificacion !== null ? '#3b82f6' : '#10b981',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={entrega.calificacion !== undefined && entrega.calificacion !== null ? "Editar calificación" : "Calificar"}
                          >
                            <Award size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modal de calificación
  const modalCalificar = showCalificarModal && entregaSeleccionada && (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000000,
        backdropFilter: 'blur(0.25rem)'
      }}
      onClick={() => setShowCalificarModal(false)}
    >
      <div 
        style={{
          background: theme.modalBg,
          borderRadius: '0.75em',
          width: '90%',
          maxWidth: '30rem',
          padding: '1.5em',
          boxShadow: darkMode ? '0 1rem 3rem rgba(0,0,0,0.45)' : '0 1rem 3rem rgba(0,0,0,0.18)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5em' 
        }}>
          <h3 style={{ 
            color: theme.textPrimary, 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            margin: 0 
          }}>
            {entregaSeleccionada.calificacion !== undefined && entregaSeleccionada.calificacion !== null 
              ? 'Editar Calificación' 
              : 'Calificar Tarea'}
          </h3>
          <button
            onClick={() => setShowCalificarModal(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textSecondary,
              cursor: 'pointer',
              padding: '0.25em',
              borderRadius: '0.25em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ marginBottom: '1.5em' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75em', 
            marginBottom: '1em' 
          }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              background: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6'
            }}>
              <User size={20} />
            </div>
            <div>
              <div style={{ 
                color: theme.textPrimary, 
                fontWeight: '600' 
              }}>
                {entregaSeleccionada.estudiante_nombre} {entregaSeleccionada.estudiante_apellido}
              </div>
              <div style={{ 
                color: theme.textSecondary, 
                fontSize: '0.875rem' 
              }}>
                CI: {entregaSeleccionada.estudiante_identificacion || entregaSeleccionada.id_estudiante} • 
                Entregado: {new Date(entregaSeleccionada.fecha_entrega).toLocaleDateString('es-ES')}
              </div>
            </div>
          </div>
          
          <div style={{ 
            background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: '0.5em',
            padding: '1em',
            marginBottom: '1em'
          }}>
            <div style={{ 
              color: theme.textSecondary, 
              fontSize: '0.875rem', 
              marginBottom: '0.5em' 
            }}>
              Archivo entregado:
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5em',
              color: theme.textPrimary,
              fontWeight: '500'
            }}>
              <FileText size={16} color={darkMode ? '#94a3b8' : '#64748b'} />
              {entregaSeleccionada.archivo_nombre}
            </div>
          </div>
          
          <div style={{ marginBottom: '1em' }}>
            <label style={{ 
              display: 'block', 
              color: theme.textPrimary, 
              fontWeight: '600', 
              marginBottom: '0.5em' 
            }}>
              Nota (0 - {nota_maxima})
            </label>
            <input
              type="number"
              min="0"
              max={nota_maxima}
              step="0.1"
              value={notaInput}
              onChange={(e) => setNotaInput(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75em',
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '0.875rem'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              color: theme.textPrimary, 
              fontWeight: '600', 
              marginBottom: '0.5em' 
            }}>
              Comentario (opcional)
            </label>
            <textarea
              value={comentarioInput}
              onChange={(e) => setComentarioInput(e.target.value)}
              placeholder="Escribe un comentario sobre la entrega..."
              style={{
                width: '100%',
                minHeight: '6rem',
                padding: '0.75em',
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '0.875rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75em', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setShowCalificarModal(false)}
            style={{
              padding: '0.625em 1.25em',
              background: 'transparent',
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '0.5em',
              color: theme.textPrimary,
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => handleCalificar(entregaSeleccionada.id_entrega)}
            disabled={!!calificando}
            style={{
              padding: '0.625em 1.25em',
              background: calificando 
                ? darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: '0.5em',
              color: '#fff',
              cursor: calificando ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            {calificando ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Calificando...
              </>
            ) : (
              <>
                <Award size={16} />
                {entregaSeleccionada.calificacion !== undefined && entregaSeleccionada.calificacion !== null 
                  ? 'Actualizar' 
                  : 'Calificar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  console.log('Creando portal en document.body');
  console.log('document.body existe:', !!document.body);
  
  // Crear un div específico para el modal si no existe
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    modalRoot.style.position = 'fixed';
    modalRoot.style.top = '0';
    modalRoot.style.left = '0';
    modalRoot.style.width = '100%';
    modalRoot.style.height = '100%';
    modalRoot.style.zIndex = '999999';
    modalRoot.style.pointerEvents = 'none';
    document.body.appendChild(modalRoot);
  }
  
  // Habilitar pointer events solo para el contenido del modal
  const modalWithPointerEvents = (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ pointerEvents: 'auto' }}>
        {modalContent}
        {modalCalificar}
      </div>
    </>
  );
  
  return createPortal(modalWithPointerEvents, modalRoot);
};

export default ModalEntregas;