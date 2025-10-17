import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

interface ModalTareaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id_modulo: number;
  tareaEditar?: any;
  darkMode?: boolean;
}

const ModalTarea: React.FC<ModalTareaProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  id_modulo,
  tareaEditar,
  darkMode = true
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    instrucciones: '',
    nota_maxima: '20',
    nota_minima_aprobacion: '14',
    fecha_limite: '',
    permite_archivo: true,
    tamano_maximo_mb: '5',
    formatos_permitidos: 'pdf,jpg,jpeg,png,webp',
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tareaEditar) {
      setFormData({
        titulo: tareaEditar.titulo || '',
        descripcion: tareaEditar.descripcion || '',
        instrucciones: tareaEditar.instrucciones || '',
        nota_maxima: tareaEditar.nota_maxima?.toString() || '20',
        nota_minima_aprobacion: tareaEditar.nota_minima_aprobacion?.toString() || '14',
        fecha_limite: tareaEditar.fecha_limite ? tareaEditar.fecha_limite.split('T')[0] : '',
        permite_archivo: tareaEditar.permite_archivo !== false,
        tamano_maximo_mb: tareaEditar.tamano_maximo_mb?.toString() || '5',
        formatos_permitidos: tareaEditar.formatos_permitidos || 'pdf,jpg,jpeg,png,webp',
        estado: tareaEditar.estado || 'activo'
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        instrucciones: '',
        nota_maxima: '20',
        nota_minima_aprobacion: '14',
        fecha_limite: '',
        permite_archivo: true,
        tamano_maximo_mb: '5',
        formatos_permitidos: 'pdf,jpg,jpeg,png,webp',
        estado: 'activo'
      });
    }
  }, [tareaEditar, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo.trim()) {
      toast.error('El título de la tarea es obligatorio');
      return;
    }

    if (!formData.fecha_limite) {
      toast.error('La fecha límite es obligatoria');
      return;
    }

    // Validar que la fecha límite sea futura
    const fechaLimite = new Date(formData.fecha_limite);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaLimite < hoy && !tareaEditar) {
      toast.error('La fecha límite debe ser futura');
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const dataToSend = {
        ...formData,
        id_modulo,
        nota_maxima: parseFloat(formData.nota_maxima),
        nota_minima_aprobacion: parseFloat(formData.nota_minima_aprobacion),
        tamano_maximo_mb: parseInt(formData.tamano_maximo_mb)
      };

      if (tareaEditar) {
        await axios.put(`${API_BASE}/tareas/${tareaEditar.id_tarea}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tarea actualizada exitosamente');
      } else {
        await axios.post(`${API_BASE}/tareas`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tarea creada exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving tarea:', error);
      toast.error(error.response?.data?.error || 'Error al guardar tarea');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Estilos base adaptativos
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: darkMode ? '#fff' : '#1e293b',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    color: darkMode ? 'rgba(255,255,255,0.9)' : '#374151',
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600' as const,
    fontSize: '0.875rem'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: darkMode 
          ? 'rgba(26,26,46,0.98)'
          : '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: darkMode 
          ? '1px solid rgba(255,255,255,0.1)' 
          : '1px solid #e5e7eb',
        boxShadow: darkMode 
          ? '0 20px 60px rgba(0,0,0,0.4)' 
          : '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            color: darkMode ? '#fff' : '#1e293b', 
            fontSize: '1.25rem', 
            fontWeight: '700', 
            margin: 0 
          }}>
            {tareaEditar ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '6px',
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
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {/* Título */}
          <div>
            <label style={labelStyle}>
              Título de la Tarea *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Práctica de Maquillaje Social"
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>
              Descripción Breve (opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe brevemente la tarea..."
              style={{
                ...inputStyle,
                minHeight: '60px',
                resize: 'vertical' as const,
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            />
          </div>

          {/* Instrucciones */}
          <div>
            <label style={labelStyle}>
              Instrucciones Detalladas (opcional)
            </label>
            <textarea
              name="instrucciones"
              value={formData.instrucciones}
              onChange={handleChange}
              placeholder="Instrucciones paso a paso para completar la tarea..."
              style={{
                ...inputStyle,
                minHeight: '100px',
                resize: 'vertical' as const,
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            />
          </div>

          {/* Calificación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>
                Nota Máxima *
              </label>
              <input
                type="number"
                name="nota_maxima"
                value={formData.nota_maxima}
                onChange={handleChange}
                min="1"
                max="100"
                step="0.01"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nota Mínima Aprobación *
              </label>
              <input
                type="number"
                name="nota_minima_aprobacion"
                value={formData.nota_minima_aprobacion}
                onChange={handleChange}
                min="1"
                max="100"
                step="0.01"
                required
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                }}
              />
            </div>
          </div>

          {/* Fecha Límite */}
          <div>
            <label style={labelStyle}>
              Fecha Límite de Entrega *
            </label>
            <input
              type="date"
              name="fecha_limite"
              value={formData.fecha_limite}
              onChange={handleChange}
              required
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            />
          </div>

          {/* Configuración de Archivos */}
          <div style={{
            background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
            borderRadius: '12px',
            padding: '15px'
          }}>
            <h4 style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: '600', marginBottom: '15px' }}>
              📎 Configuración de Archivos
            </h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: darkMode ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="permite_archivo"
                  checked={formData.permite_archivo}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Permitir entrega de archivos</span>
              </label>
            </div>

            {formData.permite_archivo && (
              <>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ color: darkMode ? '#fff' : '#374151', display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
                    Tamaño Máximo (MB)
                  </label>
                  <input
                    type="number"
                    name="tamano_maximo_mb"
                    value={formData.tamano_maximo_mb}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ color: darkMode ? '#fff' : '#374151', display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>
                    Formatos Permitidos
                  </label>
                  <input
                    type="text"
                    name="formatos_permitidos"
                    value={formData.formatos_permitidos}
                    onChange={handleChange}
                    placeholder="pdf,jpg,jpeg,png,webp"
                    style={inputStyle}
                  />
                  <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,0.8)', fontSize: '0.75rem', marginTop: '5px' }}>
                    Separar por comas. Ej: pdf,jpg,png
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Estado */}
          <div>
            <label style={labelStyle}>
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              style={{
                ...inputStyle,
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            >
              <option value="activo" style={{ background: darkMode ? '#1a1a2e' : '#fff', color: darkMode ? '#fff' : '#1e293b' }}>Activo</option>
              <option value="inactivo" style={{ background: darkMode ? '#1a1a2e' : '#fff', color: darkMode ? '#fff' : '#1e293b' }}>Inactivo</option>
              <option value="finalizado" style={{ background: darkMode ? '#1a1a2e' : '#fff', color: darkMode ? '#fff' : '#1e293b' }}>Finalizado</option>
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 24px',
                color: darkMode ? '#fff' : '#64748b',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading 
                  ? 'rgba(239, 68, 68, 0.5)' 
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: '#fff',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {tareaEditar ? 'Actualizar' : 'Crear Tarea'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModalTarea;
