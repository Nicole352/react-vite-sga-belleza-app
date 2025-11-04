import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface ModalModuloProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id_curso: string;
  moduloEditar?: any;
  darkMode?: boolean;
}

const ModalModulo: React.FC<ModalModuloProps> = ({
  isOpen,
  onClose,
  onSuccess,
  id_curso,
  moduloEditar,
  darkMode = true
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (moduloEditar) {
      setFormData({
        nombre: moduloEditar.nombre || '',
        descripcion: moduloEditar.descripcion || '',
        fecha_inicio: moduloEditar.fecha_inicio ? moduloEditar.fecha_inicio.split('T')[0] : '',
        fecha_fin: moduloEditar.fecha_fin ? moduloEditar.fecha_fin.split('T')[0] : '',
        estado: moduloEditar.estado || 'activo'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'activo'
      });
    }
  }, [moduloEditar, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre del módulo es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');

      const dataToSend = {
        ...formData,
        id_curso: parseInt(id_curso)
      };

      if (moduloEditar) {
        await axios.put(`${API_BASE}/api/modulos/${moduloEditar.id_modulo}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Módulo actualizado exitosamente');
      } else {
        await axios.post(`${API_BASE}/api/modulos`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Módulo creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving modulo:', error);
      toast.error(error.response?.data?.error || 'Error al guardar módulo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        style={{
          maxWidth: '55rem'
        }}
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
              {moduloEditar ? 'Editar Módulo' : 'Nuevo Módulo'}
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
          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre del Módulo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Parcial 1, Unidad Básica, Módulo Introductorio"
              required
              style={inputStyle}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción (opcional)</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe brevemente el contenido de este módulo..."
              style={{
                ...inputStyle,
                minHeight: '70px',
                resize: 'vertical' as const
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
            />
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Fecha Inicio (opcional)</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
              />
            </div>

            <div>
              <label style={labelStyle}>Fecha Fin (opcional)</label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.5em', justifyContent: 'flex-end', marginTop: '0.5em' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: '#fff',
                border: '0.0625rem solid #e2e8f0',
                borderRadius: '0.5em',
                padding: '0.5em 0.75em',
                color: '#64748b',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#475569';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading
                  ? 'rgba(59, 130, 246, 0.6)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: '0.5em',
                padding: '0.5em 0.75em',
                color: '#fff',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                boxShadow: loading ? 'none' : '0 0.1875rem 0.625rem rgba(59, 130, 246, 0.25)',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-0.0625rem)';
                  e.currentTarget.style.boxShadow = '0 0.3125rem 0.875rem rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0.1875rem 0.625rem rgba(59, 130, 246, 0.25)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '1rem',
                    height: '1rem',
                    border: '0.125rem solid rgba(255,255,255,0.3)',
                    borderTop: '0.125rem solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {moduloEditar ? 'Actualizar' : 'Crear Módulo'}
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

export default ModalModulo;
