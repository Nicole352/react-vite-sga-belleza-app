import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  X, Eye, Download, Users, Clock, FileCheck, Award, Search, FileText, CheckCircle, BarChart3, AlertCircle, User, Calendar
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface ModalEntregasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id_tarea: number;
  nombre_tarea: string;
  nota_maxima: number;
  ponderacion: number;
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
  ponderacion,
  darkMode
}) => {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [loading, setLoading] = useState(false);
  const [notaInput, setNotaInput] = useState<string>('');
  const [comentarioInput, setComentarioInput] = useState<string>('');
  const [entregaSeleccionada, setEntregaSeleccionada] = useState<Entrega | null>(null);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [archivoPreview, setArchivoPreview] = useState<{
    entrega: Entrega;
    url: string;
    tipo: string;
  } | null>(null);
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'calificadas'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [filteredEntregas, setFilteredEntregas] = useState<Entrega[]>([]);
  const [calificando, setCalificando] = useState<number | null>(null);

  const fetchEntregas = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      console.log('Fetching entregas para tarea:', id_tarea);
      const response = await axios.get(`${API_BASE}/api/entregas/tarea/${id_tarea}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;
      console.log('Respuesta de entregas:', data);
      console.log('Primera entrega completa:', data.entregas[0]);
      console.log('archivo_nombre de primera entrega:', data.entregas[0]?.archivo_nombre);
      console.log('archivo_nombre_original de primera entrega:', data.entregas[0]?.archivo_nombre_original);

      const entregasConEstado = data.entregas.map((entrega: any) => ({
        ...entrega,
        estado: entrega.calificacion !== undefined && entrega.calificacion !== null ? 'calificado' : 'pendiente'
      }));

      setEntregas(entregasConEstado);
      console.log('Entregas establecidas:', entregasConEstado);
    } catch (error) {
      console.error('Error fetching entregas:', error);
      toast.error('Error al cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  useSocket({
    'entrega_nueva': (data: any) => {
      console.log('📥 Nueva entrega recibida:', data);
      if (data.id_tarea === id_tarea) {
        toast.success('Nueva entrega recibida');
        fetchEntregas();
      }
    },
    'tarea_calificada': (data: any) => {
      console.log('✅ Tarea calificada:', data);
      if (data.id_tarea === id_tarea) {
        fetchEntregas();
      }
    }
  });

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
      
      await axios.post(`${API_BASE}/api/entregas/${id_entrega}/calificar`, {
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
      const response = await axios.get(`${API_BASE}/api/entregas/${id_entrega}/archivo`, {
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

  const handleVerArchivo = async (entrega: Entrega) => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/api/entregas/${entrega.id_entrega}/archivo`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      setArchivoPreview({
        entrega,
        url,
        tipo: contentType
      });
    } catch (error) {
      console.error('Error cargando archivo:', error);
      toast.error('Error al cargar el archivo');
    }
  };

  const handleDescargarDesdePreview = async () => {
    if (!archivoPreview) return;

    try {
      const { entrega } = archivoPreview;
      
      // Limpiar nombres: quitar espacios, acentos y caracteres especiales
      const limpiarNombre = (texto: string) => {
        return texto
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
          .replace(/[^a-zA-Z0-9]/g, '_')    // Reemplazar caracteres especiales por _
          .replace(/_+/g, '_')               // Reemplazar múltiples _ por uno solo
          .replace(/^_|_$/g, '');            // Quitar _ al inicio y final
      };
      
      const apellidoLimpio = limpiarNombre(entrega.estudiante_apellido);
      const nombreLimpio = limpiarNombre(entrega.estudiante_nombre);
      const tareaLimpia = limpiarNombre(nombre_tarea);
      
      // Obtener extensión del archivo original
      // Si archivo_nombre es undefined, usar el mime type para determinar la extensión
      let extension = 'jpg';
      if (entrega.archivo_nombre && entrega.archivo_nombre !== 'undefined' && entrega.archivo_nombre !== 'undefined (1).jpg') {
        extension = entrega.archivo_nombre.split('.').pop() || 'jpg';
      } else {
        // Determinar extensión desde el mime type
        const mimeToExt: { [key: string]: string } = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
          'application/pdf': 'pdf',
          'application/msword': 'doc',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
        };
        extension = mimeToExt[archivoPreview.tipo] || 'jpg';
      }
      
      const nombrePersonalizado = `${apellidoLimpio}_${nombreLimpio}_${tareaLimpia}.${extension}`;

      console.log('Nombre personalizado generado:', nombrePersonalizado);
      console.log('Apellido limpio:', apellidoLimpio);
      console.log('Nombre limpio:', nombreLimpio);
      console.log('Tarea limpia:', tareaLimpia);
      console.log('Extension:', extension);

      // Crear un link directo al archivo con el token en el header
      const token = sessionStorage.getItem('auth_token');
      
      // Fetch manual para tener más control
      const response = await fetch(`${API_BASE}/api/entregas/${entrega.id_entrega}/archivo`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al descargar archivo');
      }

      const blob = await response.blob();
      
      // Crear URL y forzar descarga con el nombre correcto
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = nombrePersonalizado;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 150);

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
    textMuted: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(30,41,59,0.5)',
    border: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    inputBg: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    inputBorder: darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db',
    rowHover: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
  };

  const stats = calcularEstadisticas();

  const modalContent = (
    <div 
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 999999
      }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '75rem'
        }}>
        {/* Header */}
        <div style={{
          padding: '1.25em',
          borderBottom: `0.0625rem solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
            <FileText size={28} style={{ color: '#3b82f6' }} />
            <div>
              <h2 style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '800', margin: '0 0 0.3em 0' }}>
                Entregas de Tarea
              </h2>
              <p style={{ color: theme.textSecondary, fontSize: '1rem', margin: 0 }}>
                {nombre_tarea}
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
            {/* Botón Ver Análisis Completo */}
            <button
              onClick={() => {
                console.log('Navegando a análisis completo, id_tarea:', id_tarea);
                onClose(); // Cerrar el modal primero
                navigate(`/panel/docente/analisis-entregas/${id_tarea}`);
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '0.5em',
                padding: '0.625em 1em',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                fontWeight: '600',
                fontSize: '0.875rem',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
              }}
            >
              <BarChart3 size={18} />
              Ver Análisis Completo
            </button>

            {/* Botón Cerrar */}
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
            <div style={{ overflowX: 'auto', maxHeight: '60vh', overflowY: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '0.875rem'
              }}>
                <thead style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
                }}>
                  <tr style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderBottom: `2px solid ${theme.border}`
                  }}>
                    <th style={{
                      padding: '1em',
                      textAlign: 'left',
                      color: theme.textPrimary,
                      fontWeight: '700'
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
                        <button
                          onClick={() => handleVerArchivo(entrega)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5em',
                            color: theme.textSecondary,
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#3b82f6';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.textSecondary;
                          }}
                        >
                          <Eye size={16} />
                          {entrega.archivo_nombre}
                        </button>
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
                          {/* Botón Calificar - PRIMERO */}
                          <button
                            onClick={() => abrirModalCalificar(entrega)}
                            style={{
                              padding: '0.5em',
                              background: entrega.calificacion !== undefined && entrega.calificacion !== null
                                ? darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'
                                : darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                              border: `1px solid ${entrega.calificacion !== undefined && entrega.calificacion !== null ? '#3b82f6' : '#10b981'}`,
                              borderRadius: '0.5em',
                              color: entrega.calificacion !== undefined && entrega.calificacion !== null ? '#3b82f6' : '#10b981',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            title={entrega.calificacion !== undefined && entrega.calificacion !== null ? "Editar calificación" : "Calificar tarea"}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {entrega.calificacion !== undefined && entrega.calificacion !== null ? (
                              <CheckCircle size={18} />
                            ) : (
                              <Award size={18} />
                            )}
                          </button>
                          
                          {/* Botón Descargar - SEGUNDO */}
                          <button
                            onClick={() => handleDescargar(entrega.id_entrega, entrega.archivo_nombre)}
                            style={{
                              padding: '0.5em',
                              background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                              border: `1px solid ${theme.inputBorder}`,
                              borderRadius: '0.5em',
                              color: theme.textPrimary,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            title="Descargar archivo"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Download size={18} />
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
              onChange={(e) => {
                const value = e.target.value;
                // Permitir campo vacío o valores válidos
                if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= nota_maxima)) {
                  setNotaInput(value);
                } else if (parseFloat(value) > nota_maxima) {
                  // Si excede, establecer el máximo
                  setNotaInput(nota_maxima.toString());
                  toast.error(`La nota máxima es ${nota_maxima}`);
                }
              }}
              onBlur={(e) => {
                // Al perder el foco, validar y ajustar si es necesario
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  if (value > nota_maxima) {
                    setNotaInput(nota_maxima.toString());
                  } else if (value < 0) {
                    setNotaInput('0');
                  }
                }
              }}
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
            
            {/* Mostrar cálculo del aporte ponderado */}
            {notaInput && parseFloat(notaInput) >= 0 && (
              <div style={{
                marginTop: '0.75em',
                padding: '0.75em',
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
                border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                borderRadius: '0.5em'
              }}>
                <div style={{ 
                  color: '#3b82f6', 
                  fontSize: '0.75rem', 
                  fontWeight: '600',
                  marginBottom: '0.25em',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📊 Aporte Ponderado
                </div>
                <div style={{ 
                  color: theme.textPrimary, 
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {parseFloat(notaInput)}/{nota_maxima} × {ponderacion}pts = {' '}
                  <span style={{ color: '#3b82f6' }}>
                    {((parseFloat(notaInput) / nota_maxima) * ponderacion).toFixed(2)} puntos
                  </span>
                </div>
                <div style={{ 
                  color: theme.textSecondary, 
                  fontSize: '0.75rem',
                  marginTop: '0.25em'
                }}>
                  Este es el aporte de esta tarea al promedio del módulo
                </div>
              </div>
            )}
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
        
        {/* Modal de Previsualización de Archivo */}
        {archivoPreview && createPortal(
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '2em',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              background: darkMode ? 'rgba(26,26,46,0.98)' : '#ffffff',
              borderRadius: '1em',
              padding: '2em',
              maxWidth: '60em',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5em' }}>
                <h3 style={{ color: theme.textPrimary, fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>
                  {archivoPreview.entrega.estudiante_apellido} {archivoPreview.entrega.estudiante_nombre} - {nombre_tarea}
                </h3>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(archivoPreview.url);
                    setArchivoPreview(null);
                  }}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '0.5em',
                    padding: '0.5em',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Información del archivo */}
              <div style={{
                background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '0.75em',
                padding: '1em',
                marginBottom: '1.5em'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75em' }}>
                  <FileText size={24} color="#3b82f6" />
                  <div>
                    <p style={{ color: theme.textPrimary, fontSize: '1rem', fontWeight: '700', margin: 0 }}>
                      {archivoPreview.entrega.archivo_nombre}
                    </p>
                    <p style={{ color: theme.textMuted, fontSize: '0.875rem', margin: 0 }}>
                      Entregado: {new Date(archivoPreview.entrega.fecha_entrega).toLocaleDateString('es-ES')} {new Date(archivoPreview.entrega.fecha_entrega).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vista previa */}
              <div style={{
                background: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                borderRadius: '0.75em',
                padding: '1em',
                marginBottom: '1.5em',
                minHeight: '25em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {archivoPreview.tipo.startsWith('image/') ? (
                  // Vista previa de imagen
                  <img
                    src={archivoPreview.url}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '35em',
                      borderRadius: '0.5em',
                      objectFit: 'contain'
                    }}
                  />
                ) : archivoPreview.tipo === 'application/pdf' ? (
                  // Vista previa de PDF
                  <iframe
                    src={archivoPreview.url}
                    style={{
                      width: '100%',
                      height: '35em',
                      border: 'none',
                      borderRadius: '0.5em'
                    }}
                    title="PDF Preview"
                  />
                ) : (
                  // Icono para otros tipos de archivo
                  <div style={{ textAlign: 'center' }}>
                    <FileText size={80} color={theme.textMuted} />
                    <p style={{ color: theme.textMuted, marginTop: '1em' }}>
                      No se puede previsualizar este tipo de archivo
                    </p>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '0.75em', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    window.URL.revokeObjectURL(archivoPreview.url);
                    setArchivoPreview(null);
                  }}
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                    borderRadius: '0.5em',
                    padding: '0.75em 1.5em',
                    color: darkMode ? '#fff' : '#64748b',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={handleDescargarDesdePreview}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    border: 'none',
                    borderRadius: '0.5em',
                    padding: '0.75em 1.5em',
                    color: '#fff',
                    fontWeight: '800',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  <Download size={18} />
                  Descargar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
  
  return (
    <>
      {createPortal(modalWithPointerEvents, modalRoot)}
    </>
  );
};

export default ModalEntregas;