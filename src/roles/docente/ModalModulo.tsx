import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Calendar, FileText } from 'lucide-react';
import axios from 'axios';
import { showToast } from '../../config/toastConfig';

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
      showToast.error('El nombre del módulo es obligatorio', darkMode);
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
        showToast.success('Módulo actualizado exitosamente', darkMode);
      } else {
        await axios.post(`${API_BASE}/api/modulos`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast.success('Módulo creado exitosamente', darkMode);
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving modulo:', error);
      showToast.error(error.response?.data?.error || 'Error al guardar módulo', darkMode);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%',
    padding: '0.625em 0.75em',
    background: 'var(--docente-input-bg, rgba(255,255,255,0.05))',
    border: '1px solid var(--docente-border, rgba(255,255,255,0.1))',
    borderRadius: '0.5em',
    color: 'var(--docente-text-primary, #fff)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const labelStyle = {
    color: 'var(--docente-text-primary, rgba(255,255,255,0.9))',
    display: 'block',
    marginBottom: '0.375em',
    fontWeight: '600' as const,
    fontSize: '0.875rem'
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
        
        {/* Modal */}
        <div 
          className="responsive-modal"
          style={{
            background: darkMode 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '12px',
            boxShadow: darkMode 
              ? '0 20px 60px -12px rgba(0, 0, 0, 0.5)' 
              : '0 20px 60px -12px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            padding: '1.5rem',
            maxWidth: '55rem',
            width: '90%',
            maxHeight: 'calc(100vh - 4rem)',
            overflowY: 'auto',
            zIndex: 99999,
            animation: 'scaleIn 0.3s ease-out'
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
          borderBottom: '1px solid var(--docente-border, rgba(59, 130, 246, 0.2))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} style={{ color: '#3b82f6' }} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '1.05rem', 
              fontWeight: '600', 
              letterSpacing: '-0.01em',
              color: 'var(--docente-text-primary, #fff)'
            }}>
              {moduloEditar ? 'Editar Módulo' : 'Nuevo Módulo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--docente-input-bg, rgba(255,255,255,0.05))',
              border: '1px solid var(--docente-border, rgba(255,255,255,0.1))',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--docente-text-primary, #fff)',
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
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--docente-border, rgba(255,255,255,0.1))'}
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
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--docente-border, rgba(255,255,255,0.1))'}
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
              style={{
                background: 'var(--docente-input-bg, rgba(255,255,255,0.05))',
                border: '1px solid var(--docente-border, rgba(255,255,255,0.1))',
                borderRadius: '0.5em',
                padding: '0.5em 0.75em',
                color: 'var(--docente-text-primary, #fff)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease'
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
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
      </div>
    </>,
    document.body
  );
};

export default ModalModulo;
