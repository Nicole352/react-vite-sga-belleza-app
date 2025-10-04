import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, User, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [calificando, setCalificando] = useState<number | null>(null);
  const [notaInput, setNotaInput] = useState<{ [key: number]: string }>({});
  const [comentarioInput, setComentarioInput] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    console.log('ModalEntregas - isOpen:', isOpen, 'id_tarea:', id_tarea);
    if (isOpen && id_tarea) {
      fetchEntregas();
    }
  }, [isOpen, id_tarea]);

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
      const entregasFormateadas = (response.data.entregas || []).map((entrega: any) => ({
        ...entrega,
        calificacion: entrega.nota, // Backend usa 'nota', frontend usa 'calificacion'
        comentario: entrega.comentario_docente // Backend usa 'comentario_docente', frontend usa 'comentario'
      }));
      
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
    const nota = parseFloat(notaInput[id_entrega] || '0');
    const comentario = comentarioInput[id_entrega] || '';

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
      
      // Limpiar inputs
      setNotaInput(prev => ({ ...prev, [id_entrega]: '' }));
      setComentarioInput(prev => ({ ...prev, [id_entrega]: '' }));
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
    inputBorder: darkMode ? 'rgba(255,255,255,0.1)' : '#d1d5db'
  };

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
        backdropFilter: 'blur(4px)'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.modalBg,
          borderRadius: '16px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '85vh',
          overflow: 'hidden',
          boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.2)'
        }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ color: theme.textPrimary, fontSize: '1.25rem', fontWeight: '700', margin: '0 0 4px 0' }}>
              Entregas de Tarea
            </h2>
            <p style={{ color: theme.textSecondary, fontSize: '0.875rem', margin: 0 }}>
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
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          maxHeight: 'calc(85vh - 80px)',
          overflowY: 'auto',
          minHeight: '200px'
        }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px', 
              color: theme.textPrimary,
              fontSize: '1.1rem',
              fontWeight: '500'
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '4px solid rgba(59, 130, 246, 0.2)',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                margin: '0 auto 20px',
                animation: 'spin 1s linear infinite'
              }}></div>
              Cargando entregas...
            </div>
          ) : entregas.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 40px', 
              color: theme.textSecondary,
              fontSize: '1rem'
            }}>
              📋 No hay entregas para esta tarea
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {entregas.map((entrega) => (
                <div
                  key={entrega.id_entrega}
                  style={{
                    background: darkMode ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '20px'
                  }}
                >
                  {/* Info del estudiante */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <User size={18} color={darkMode ? '#3b82f6' : '#2563eb'} />
                        <h3 style={{ color: theme.textPrimary, fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                          {entrega.estudiante_nombre} {entrega.estudiante_apellido}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8125rem', color: theme.textSecondary }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} />
                          {new Date(entrega.fecha_entrega).toLocaleDateString('es-ES')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileText size={14} />
                          {entrega.archivo_nombre}
                        </span>
                      </div>
                    </div>

                    {/* Estado */}
                    {entrega.calificacion !== undefined && entrega.calificacion !== null ? (
                      <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#10b981',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        <CheckCircle size={16} />
                        {entrega.calificacion}/{nota_maxima}
                      </div>
                    ) : (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        <AlertCircle size={16} />
                        Pendiente
                      </div>
                    )}
                  </div>

                  {/* Botón descargar */}
                  <button
                    onClick={() => handleDescargar(entrega.id_entrega, entrega.archivo_nombre)}
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '0.8125rem',
                      marginBottom: '16px'
                    }}
                  >
                    <Download size={15} />
                    Descargar Archivo
                  </button>

                  {/* Formulario de calificación */}
                  {(entrega.calificacion === undefined || entrega.calificacion === null) && (
                    <div style={{
                      borderTop: `1px solid ${theme.border}`,
                      paddingTop: '16px',
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr auto',
                      gap: '12px',
                      alignItems: 'end'
                    }}>
                      <div>
                        <label style={{ color: theme.textSecondary, fontSize: '0.8125rem', display: 'block', marginBottom: '6px' }}>
                          Nota (0-{nota_maxima})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={nota_maxima}
                          step="0.5"
                          value={notaInput[entrega.id_entrega] || ''}
                          onChange={(e) => setNotaInput(prev => ({ ...prev, [entrega.id_entrega]: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: theme.inputBg,
                            border: `1px solid ${theme.inputBorder}`,
                            borderRadius: '8px',
                            color: theme.textPrimary,
                            fontSize: '0.875rem'
                          }}
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label style={{ color: theme.textSecondary, fontSize: '0.8125rem', display: 'block', marginBottom: '6px' }}>
                          Comentario (opcional)
                        </label>
                        <textarea
                          value={comentarioInput[entrega.id_entrega] || ''}
                          onChange={(e) => setComentarioInput(prev => ({ ...prev, [entrega.id_entrega]: e.target.value }))}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: theme.inputBg,
                            border: `1px solid ${theme.inputBorder}`,
                            borderRadius: '8px',
                            color: theme.textPrimary,
                            fontSize: '0.875rem',
                            resize: 'vertical',
                            minHeight: '40px',
                            fontFamily: 'inherit'
                          }}
                          placeholder="Escribe un comentario..."
                        />
                      </div>
                      <button
                        onClick={() => handleCalificar(entrega.id_entrega)}
                        disabled={calificando === entrega.id_entrega}
                        style={{
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          color: '#fff',
                          cursor: calificando === entrega.id_entrega ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          opacity: calificando === entrega.id_entrega ? 0.6 : 1,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {calificando === entrega.id_entrega ? 'Calificando...' : 'Calificar'}
                      </button>
                    </div>
                  )}

                  {/* Mostrar calificación existente */}
                  {entrega.calificacion !== undefined && entrega.calificacion !== null && (
                    <div style={{
                      borderTop: `1px solid ${theme.border}`,
                      paddingTop: '16px',
                      background: darkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <p style={{ color: theme.textPrimary, fontSize: '0.875rem', fontWeight: '600', margin: '0 0 4px 0' }}>
                        Calificación: {entrega.calificacion}/{nota_maxima}
                      </p>
                      {entrega.comentario && (
                        <p style={{ color: theme.textSecondary, fontSize: '0.8125rem', margin: '0 0 4px 0' }}>
                          {entrega.comentario}
                        </p>
                      )}
                      <p style={{ color: theme.textSecondary, fontSize: '0.75rem', margin: 0 }}>
                        Calificado el {new Date(entrega.fecha_calificacion!).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
      </div>
    </>
  );
  
  return createPortal(modalWithPointerEvents, modalRoot);
};

export default ModalEntregas;
