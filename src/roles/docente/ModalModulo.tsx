import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Hash, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

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
    numero_orden: '',
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
        numero_orden: moduloEditar.numero_orden?.toString() || '',
        fecha_inicio: moduloEditar.fecha_inicio ? moduloEditar.fecha_inicio.split('T')[0] : '',
        fecha_fin: moduloEditar.fecha_fin ? moduloEditar.fecha_fin.split('T')[0] : '',
        estado: moduloEditar.estado || 'activo'
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        numero_orden: '',
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

    if (!formData.numero_orden) {
      toast.error('El número de orden es obligatorio');
      return;
    }

    try {
      setLoading(true);
      const token = sessionStorage.getItem('auth_token');
      
      const dataToSend = {
        ...formData,
        id_curso: parseInt(id_curso),
        numero_orden: parseInt(formData.numero_orden)
      };

      if (moduloEditar) {
        await axios.put(`${API_BASE}/modulos/${moduloEditar.id_modulo}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Módulo actualizado exitosamente');
      } else {
        await axios.post(`${API_BASE}/modulos`, dataToSend, {
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

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(26,26,46,0.98) 0%, rgba(22,33,62,0.98) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
        boxShadow: darkMode ? '0 25px 70px rgba(0,0,0,0.5)' : '0 25px 70px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ color: darkMode ? '#fff' : '#1e293b', fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
            {moduloEditar ? 'Editar Módulo' : 'Crear Nuevo Módulo'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
              Nombre del Módulo *
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Parcial 1, Unidad Básica, Módulo Introductorio"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 45px',
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Número de Orden */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
              Número de Orden *
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6' }} />
              <input
                type="number"
                name="numero_orden"
                value={formData.numero_orden}
                onChange={handleChange}
                placeholder="1, 2, 3..."
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 45px',
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px', marginLeft: '2px' }}>
              Define el orden de visualización del módulo
            </p>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
              Descripción (opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe brevemente el contenido de este módulo..."
              style={{
                width: '100%',
                minHeight: '90px',
                padding: '14px',
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                color: '#1e293b',
                fontSize: '0.95rem',
                resize: 'vertical',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Fechas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
                Fecha Inicio (opcional)
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', pointerEvents: 'none' }} />
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 45px',
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#1e293b',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
                Fecha Fin (opcional)
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', pointerEvents: 'none' }} />
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '14px 14px 14px 45px',
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#1e293b',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ color: darkMode ? 'rgba(255,255,255,0.9)' : '#475569', display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '0.95rem' }}>
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px',
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                color: '#1e293b',
                fontSize: '0.95rem',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                background: '#fff',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 28px',
                color: '#64748b',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                fontSize: '0.95rem',
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
                borderRadius: '12px',
                padding: '14px 28px',
                color: '#fff',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
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
