import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

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
    nota_maxima: '10',
    nota_minima_aprobacion: '7',
    ponderacion: '1',
    fecha_limite: '',
    permite_archivo: true,
    tamano_maximo_mb: '5',
    formatos_permitidos: 'pdf,jpg,jpeg,png,webp',
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);
  const [sumaPonderaciones, setSumaPonderaciones] = useState(0);
  const [tareasDelModulo, setTareasDelModulo] = useState<any[]>([]);

  // Cargar tareas del módulo para validar ponderaciones
  useEffect(() => {
    if (isOpen && id_modulo) {
      fetchTareasModulo();
    }
  }, [isOpen, id_modulo]);

  const fetchTareasModulo = async () => {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE}/api/tareas/modulo/${id_modulo}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tareas = response.data.tareas || [];
      setTareasDelModulo(tareas);
      
      // Calcular suma de ponderaciones (excluyendo la tarea actual si está editando)
      const suma = tareas
        .filter((t: any) => tareaEditar ? t.id_tarea !== tareaEditar.id_tarea : true)
        .reduce((acc: number, t: any) => acc + (parseFloat(t.ponderacion) || 0), 0);
      setSumaPonderaciones(suma);
    } catch (error) {
      console.error('Error cargando tareas:', error);
    }
  };

  useEffect(() => {
    if (tareaEditar) {
      // Al editar, si la fecha existe, mantener la fecha pero poner hora 23:59 por defecto
      let fechaLimite = '';
      if (tareaEditar.fecha_limite) {
        const fecha = new Date(tareaEditar.fecha_limite);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        // Siempre poner 23:59 como hora por defecto al editar
        fechaLimite = `${year}-${month}-${day}T23:59`;
      }
      
      setFormData({
        titulo: tareaEditar.titulo || '',
        descripcion: tareaEditar.descripcion || '',
        instrucciones: tareaEditar.instrucciones || '',
        nota_maxima: tareaEditar.nota_maxima?.toString() || '10',
        nota_minima_aprobacion: tareaEditar.nota_minima_aprobacion?.toString() || '7',
        ponderacion: tareaEditar.ponderacion?.toString() || '1',
        fecha_limite: fechaLimite,
        permite_archivo: tareaEditar.permite_archivo !== false,
        tamano_maximo_mb: tareaEditar.tamano_maximo_mb?.toString() || '5',
        formatos_permitidos: tareaEditar.formatos_permitidos || 'pdf,jpg,jpeg,png,webp',
        estado: tareaEditar.estado || 'activo'
      });
    } else {
      // Fecha por defecto: hoy a las 23:59 (Ecuador UTC-5)
      const hoy = new Date();
      // Convertir a hora local de Ecuador
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      const fechaDefault = `${year}-${month}-${day}T23:59`; // formato: YYYY-MM-DDTHH:mm
      
      setFormData({
        titulo: '',
        descripcion: '',
        instrucciones: '',
        nota_maxima: '10',
        nota_minima_aprobacion: '7',
        ponderacion: '1',
        fecha_limite: fechaDefault,
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

    // Validar suma de ponderaciones
    const ponderacionActual = parseFloat(formData.ponderacion);
    const sumaTotal = sumaPonderaciones + ponderacionActual;
    
    if (sumaTotal > 10) {
      toast.error(`La suma de ponderaciones (${sumaTotal.toFixed(2)}) excede el máximo de 10 puntos del módulo`);
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
        ponderacion: parseFloat(formData.ponderacion),
        tamano_maximo_mb: parseInt(formData.tamano_maximo_mb)
      };

      if (tareaEditar) {
        await axios.put(`${API_BASE}/api/tareas/${tareaEditar.id_tarea}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Tarea actualizada exitosamente');
      } else {
        await axios.post(`${API_BASE}/api/tareas`, dataToSend, {
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
    padding: '0.625em 0.75em',
    background: darkMode ? 'rgba(255,255,255,0.05)' : '#f9fafb',
    border: `0.0625rem solid ${darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
    borderRadius: '0.5em',
    color: darkMode ? '#fff' : '#1e293b',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    color: darkMode ? 'rgba(255,255,255,0.9)' : '#374151',
    display: 'block',
    marginBottom: '0.375em',
    fontWeight: '600' as const,
    fontSize: '0.875rem'
  };

  return (
    <div 
      className="modal-overlay"
      onClick={onClose}
    >
      <div 
        className="modal-content responsive-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: darkMode ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(59, 130, 246, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#3b82f6' }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.05rem', 
              fontWeight: '600', 
              letterSpacing: '-0.01em',
              color: darkMode ? '#fff' : '#1e293b'
            }}>
              {tareaEditar ? 'Editar Tarea' : 'Nueva Tarea'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: darkMode ? '#fff' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
          {/* Título - Ancho completo */}
          <div>
            <label style={labelStyle}>Título de la Tarea *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Práctica de Maquillaje Social"
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
            />
          </div>

          {/* Fila: Descripción e Instrucciones en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción Breve (opcional)</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe brevemente la tarea..."
                style={{
                  ...inputStyle,
                  minHeight: '70px',
                  resize: 'vertical' as const
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
              />
            </div>

            {/* Instrucciones */}
            <div>
              <label style={labelStyle}>Instrucciones Detalladas (opcional)</label>
              <textarea
                name="instrucciones"
                value={formData.instrucciones}
                onChange={handleChange}
                placeholder="Instrucciones paso a paso para completar la tarea..."
                style={{
                  ...inputStyle,
                  minHeight: '70px',
                  resize: 'vertical' as const
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
              />
            </div>
          </div>

          {/* Calificación y Ponderación */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
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
                max="10"
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
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,0.8)', fontSize: '0.7rem', marginTop: '4px' }}>
                Sobre 10 puntos
              </p>
            </div>

            <div>
              <label style={labelStyle}>
                Nota Mínima *
              </label>
              <input
                type="number"
                name="nota_minima_aprobacion"
                value={formData.nota_minima_aprobacion}
                onChange={handleChange}
                min="1"
                max="10"
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
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,0.8)', fontSize: '0.7rem', marginTop: '4px' }}>
                Para aprobar
              </p>
            </div>

            <div>
              <label style={labelStyle}>
                Ponderación *
              </label>
              <input
                type="number"
                name="ponderacion"
                value={formData.ponderacion}
                onChange={handleChange}
                min="0.01"
                max="10"
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
              <p style={{ color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(107,114,128,0.8)', fontSize: '0.7rem', marginTop: '4px' }}>
                Peso en puntos
              </p>
            </div>
          </div>

          {/* Advertencia de suma de ponderaciones */}
          {formData.ponderacion && parseFloat(formData.ponderacion) > 0 && (
            <div style={{
              padding: '0.75em',
              background: (sumaPonderaciones + parseFloat(formData.ponderacion)) > 10
                ? darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
                : darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${(sumaPonderaciones + parseFloat(formData.ponderacion)) > 10 ? '#ef4444' : '#3b82f6'}`,
              borderRadius: '0.5em',
              marginTop: '0.75em'
            }}>
              <div style={{ 
                color: (sumaPonderaciones + parseFloat(formData.ponderacion)) > 10 ? '#ef4444' : '#3b82f6',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginBottom: '0.25em',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {(sumaPonderaciones + parseFloat(formData.ponderacion)) > 10 ? '⚠️ ADVERTENCIA' : '✅ SUMA DE PONDERACIONES'}
              </div>
              <div style={{ 
                color: darkMode ? '#fff' : '#1e293b',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Tareas existentes: {sumaPonderaciones.toFixed(2)} pts + Esta tarea: {parseFloat(formData.ponderacion).toFixed(2)} pts = {' '}
                <span style={{ 
                  color: (sumaPonderaciones + parseFloat(formData.ponderacion)) > 10 ? '#ef4444' : '#10b981',
                  fontWeight: '700'
                }}>
                  {(sumaPonderaciones + parseFloat(formData.ponderacion)).toFixed(2)}/10 pts
                </span>
              </div>
              {(sumaPonderaciones + parseFloat(formData.ponderacion)) > 10 && (
                <div style={{ 
                  color: '#ef4444',
                  fontSize: '0.75rem',
                  marginTop: '0.25em'
                }}>
                  ¡La suma excede el máximo de 10 puntos! Reduce la ponderación.
                </div>
              )}
            </div>
          )}

          {/* Fila: Fecha y Configuración de Archivos en 2 columnas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Fecha y Hora Límite */}
            <div>
              <label style={labelStyle}>Fecha y Hora Límite de Entrega *</label>
              <input
                type="datetime-local"
                name="fecha_limite"
                value={formData.fecha_limite}
                onChange={handleChange}
                required
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
              />
            </div>

            {/* Configuración de Archivos */}
            <div style={{
              background: darkMode ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.05)',
              border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)'}`,
              borderRadius: '10px',
              padding: '10px'
            }}>
              <h4 style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: '700', marginBottom: '8px' }}>
                📎 Configuración de Archivos
              </h4>

              <div style={{ marginBottom: formData.permite_archivo ? '8px' : '0' }}>
                <label style={{ color: darkMode ? '#fff' : '#374151', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="permite_archivo"
                    checked={formData.permite_archivo}
                    onChange={handleChange}
                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.8rem' }}>Permitir entrega de archivos</span>
                </label>
              </div>

              {formData.permite_archivo && (
                <div>
                  <label style={{ color: darkMode ? '#fff' : '#374151', display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>
                    Tamaño Máximo (MB)
                  </label>
                  <input
                    type="number"
                    name="tamano_maximo_mb"
                    value={formData.tamano_maximo_mb}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    style={{...inputStyle, fontSize: '0.8rem', padding: '0.5em 0.65em'}}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                color: darkMode ? 'rgba(255,255,255,0.8)' : '#64748b',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.2)' : '#cbd5e1';
                  e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.08)' : '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb';
                e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.05)' : '#fff';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading 
                  ? 'rgba(239, 68, 68, 0.6)' 
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#fff',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 3px 10px rgba(239, 68, 68, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 5px 14px rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 3px 10px rgba(239, 68, 68, 0.25)';
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
                  <Save size={16} />
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
