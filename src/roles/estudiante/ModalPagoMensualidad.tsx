import React, { useState } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Info, CreditCard, Building } from 'lucide-react';

const API_BASE = 'http://localhost:3000';

interface Cuota {
  id_pago: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  curso_nombre: string;
  tipo_curso_nombre: string;
}

interface ModalPagoMensualidadProps {
  cuota: Cuota;
  onClose: () => void;
  onSuccess: () => void;
  darkMode?: boolean;
}

const ModalPagoMensualidad: React.FC<ModalPagoMensualidadProps> = ({ cuota, onClose, onSuccess, darkMode = false }) => {
  const [metodoPago, setMetodoPago] = useState<'transferencia' | 'efectivo'>('transferencia');
  const [montoPagar, setMontoPagar] = useState<string>(cuota.monto.toString());
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [bancoComprobante, setBancoComprobante] = useState('');
  const [fechaTransferencia, setFechaTransferencia] = useState('');
  const [recibidoPor, setRecibidoPor] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bancos = [
    'Banco Pichincha',
    'Banco del Guayaquil',
    'Banco del Pacífico',
    'Produbanco',
    'Banco Internacional',
    'Banco Bolivariano',
    'Banco de Machala',
    'Banco ProCredit',
    'Banco Solidario',
    'Banco Capital',
    'Banco Comercial de Manabí',
    'Banco Coopnacional',
    'Banco D-MIRO',
    'Banco Finca',
    'Banco General Rumiñahui',
    'Banco Loja',
    'Banco Procredit',
    'Banco VisionFund Ecuador'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPG, PNG, WEBP o PDF');
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 5MB');
        return;
      }
      
      setArchivoComprobante(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      const montoNumerico = parseFloat(montoPagar);
      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('El monto a pagar debe ser mayor a 0');
      }

      if (montoNumerico < cuota.monto) {
        throw new Error(`El monto mínimo a pagar es ${formatearMonto(cuota.monto)}`);
      }

      if (metodoPago === 'transferencia') {
        if (!numeroComprobante || !bancoComprobante || !fechaTransferencia) {
          throw new Error('Para transferencias se requiere: número de comprobante, banco y fecha');
        }
      }

      if (metodoPago === 'efectivo') {
        if (!numeroComprobante || !recibidoPor) {
          throw new Error('Para pagos en efectivo se requiere el número de factura y el nombre de quien recibió el pago');
        }
      }

      if (!archivoComprobante) {
        throw new Error('Debe subir el comprobante de pago');
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('metodo_pago', metodoPago);
      formData.append('monto_pagado', montoNumerico.toFixed(2));
      formData.append('numero_comprobante', numeroComprobante);
      
      // Solo agregar banco y fecha si es transferencia
      if (metodoPago === 'transferencia') {
        formData.append('banco_comprobante', bancoComprobante);
        formData.append('fecha_transferencia', fechaTransferencia);
      } else {
        // Para efectivo, enviar valores por defecto y quien recibió
        formData.append('banco_comprobante', 'N/A');
        formData.append('fecha_transferencia', new Date().toISOString().split('T')[0]);
        formData.append('recibido_por', recibidoPor);
      }
      
      formData.append('observaciones', observaciones);
      formData.append('comprobante', archivoComprobante);

      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/pagos-mensuales/pagar/${cuota.id_pago}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      // Éxito
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error procesando pago:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatearMonto = (monto: number | string) => {
    const montoNumerico = typeof monto === 'string' ? parseFloat(monto) : monto;
    return `$${(montoNumerico || 0).toFixed(2)}`;
  };

  const formatearFecha = (fechaString: string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Colores según el tema
  const theme = {
    modalBg: darkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    cardBg: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    textPrimary: darkMode ? '#fff' : '#1e293b',
    textSecondary: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(30,41,59,0.8)',
    textMuted: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(30,41,59,0.6)',
    border: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    inputBg: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    inputBorder: darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    hoverBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        background: theme.modalBg,
        borderRadius: '24px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '40px',
        fontFamily: 'Montserrat, sans-serif',
        position: 'relative',
        border: `1px solid ${theme.border}`,
        boxShadow: darkMode 
          ? '0 25px 50px rgba(0, 0, 0, 0.5)' 
          : '0 25px 50px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: theme.hoverBg,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            color: theme.textPrimary,
            padding: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = theme.inputBg}
          onMouseLeave={(e) => e.currentTarget.style.background = theme.hoverBg}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            color: theme.textPrimary, 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CreditCard size={24} color="#fff" />
            </div>
            Pagar Mensualidad
          </h2>
          <div style={{ color: theme.textMuted, fontSize: '1rem', marginLeft: '60px' }}>
            {cuota.curso_nombre} • Cuota {cuota.numero_cuota}
          </div>
        </div>

        {/* Información de la cuota */}
        <div style={{
          background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          border: `1px solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '20px' }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
                Monto de la Cuota
              </div>
              <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>
                {formatearMonto(cuota.monto)}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>
                Fecha de Vencimiento
              </div>
              <div style={{ color: theme.textPrimary, fontSize: '1.1rem', fontWeight: '600' }}>
                {formatearFecha(cuota.fecha_vencimiento)}
              </div>
            </div>
          </div>

          {/* Campo editable de monto a pagar */}
          <div>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Monto a Pagar *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montoPagar}
              onChange={(e) => setMontoPagar(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                border: `2px solid ${darkMode ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: '12px',
                color: theme.textPrimary,
                fontSize: '1.2rem',
                fontWeight: '600',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '8px',
              color: darkMode ? 'rgba(16, 185, 129, 0.9)' : 'rgba(5, 150, 105, 0.9)',
              fontSize: '0.85rem'
            }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <span>Puedes pagar más del monto de la cuota para adelantar pagos</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Método de pago */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Método de Pago *
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { value: 'transferencia', label: 'Transferencia Bancaria', icon: Building },
                { value: 'efectivo', label: 'Efectivo', icon: CreditCard }
              ].map((metodo) => {
                const Icon = metodo.icon;
                return (
                  <button
                    key={metodo.value}
                    type="button"
                    onClick={() => setMetodoPago(metodo.value as any)}
                    style={{
                      padding: '14px 20px',
                      background: metodoPago === metodo.value 
                        ? 'linear-gradient(135deg, #10b981, #059669)' 
                        : theme.inputBg,
                      color: metodoPago === metodo.value ? '#fff' : theme.textPrimary,
                      border: `1px solid ${metodoPago === metodo.value ? '#10b981' : theme.inputBorder}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontFamily: 'Montserrat, sans-serif',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={16} />
                    {metodo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campos específicos para transferencia */}
          {metodoPago === 'transferencia' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
              {/* Banco */}
              <div>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  Banco *
                </label>
                <select
                  value={bancoComprobante}
                  onChange={(e) => setBancoComprobante(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <option value="">Seleccionar banco...</option>
                  {bancos.map((banco) => (
                    <option key={banco} value={banco} style={{ background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#fff' : '#374151' }}>
                      {banco}
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de comprobante */}
              <div>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  Número de Comprobante *
                </label>
                <input
                  type="text"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  placeholder="Ej: 1234567890"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>

              {/* Fecha de transferencia */}
              <div>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  Fecha de Transferencia *
                </label>
                <input
                  type="date"
                  value={fechaTransferencia}
                  onChange={(e) => setFechaTransferencia(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>
            </div>
          )}

          {/* Campos específicos para efectivo */}
          {metodoPago === 'efectivo' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px' }}>
              {/* Número de factura */}
              <div>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  Número de Factura/Comprobante *
                </label>
                <input
                  type="text"
                  value={numeroComprobante}
                  onChange={(e) => setNumeroComprobante(e.target.value)}
                  placeholder="Ej: FAC-001234"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>

              {/* Recibido por */}
              <div>
                <label style={{
                  display: 'block',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: '10px'
                }}>
                  Recibido por *
                </label>
                <input
                  type="text"
                  value={recibidoPor}
                  onChange={(e) => setRecibidoPor(e.target.value)}
                  placeholder="Nombre de quien recibió el pago"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: theme.inputBg,
                    border: `1px solid ${theme.inputBorder}`,
                    borderRadius: '12px',
                    color: theme.textPrimary,
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                />
              </div>

              {/* Tip informativo */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: darkMode ? 'rgba(16, 185, 129, 0.9)' : 'rgba(5, 150, 105, 0.9)',
                  fontSize: '0.85rem'
                }}>
                  <Info size={16} style={{ flexShrink: 0 }} />
                  <span>Ingresa el número de factura y el nombre de la persona que te atendió en la academia</span>
                </div>
              </div>
            </div>
          )}

          {/* Subir comprobante */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Comprobante de Pago *
            </label>
            <div style={{
              border: `2px dashed ${archivoComprobante ? '#10b981' : theme.border}`,
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: archivoComprobante 
                ? (darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)') 
                : theme.inputBg,
              transition: 'all 0.3s ease'
            }}>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="comprobante-upload"
                required
              />
              <label htmlFor="comprobante-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <Upload size={40} color={archivoComprobante ? '#10b981' : theme.textMuted} style={{ marginBottom: '12px' }} />
                <div style={{ 
                  color: archivoComprobante ? '#10b981' : theme.textPrimary, 
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  {archivoComprobante ? archivoComprobante.name : 'Subir comprobante (JPG, PNG, PDF)'}
                </div>
                <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                  Máximo 5MB
                </div>
              </label>
            </div>
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Observaciones (Opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Comentarios adicionales..."
              rows={3}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: theme.inputBg,
                border: `1px solid ${theme.inputBorder}`,
                borderRadius: '12px',
                color: theme.textPrimary,
                fontSize: '1rem',
                fontFamily: 'Montserrat, sans-serif',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: darkMode ? '#fecaca' : '#dc2626',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontWeight: '500'
            }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '14px 32px',
                background: theme.inputBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = theme.hoverBg)}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = theme.inputBg)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 32px',
                background: loading ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
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
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Procesar Pago
                </>
              )}
            </button>
          </div>
        </form>

        {/* Animación del spinner */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ModalPagoMensualidad;
