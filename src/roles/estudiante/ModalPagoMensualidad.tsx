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
      backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(0.375rem)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1em',
      overflowY: 'auto'
    }}>
      <div style={{
        background: theme.modalBg,
        borderRadius: '0.75em',
        width: '100%',
        maxWidth: '34rem',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '1.25em',
        fontFamily: 'Montserrat, sans-serif',
        position: 'relative',
        border: `0.0625rem solid ${theme.border}`,
        boxShadow: darkMode
          ? '0 1.25rem 3rem rgba(0, 0, 0, 0.5)'
          : '0 1.25rem 3rem rgba(0, 0, 0, 0.2)',
        margin: 'auto'
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1em',
            right: '1em',
            background: theme.hoverBg,
            border: `0.0625rem solid ${theme.border}`,
            borderRadius: '0.5em',
            color: theme.textPrimary,
            padding: '0.5em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = theme.inputBg}
          onMouseLeave={(e) => e.currentTarget.style.background = theme.hoverBg}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.25em', paddingRight: '2.5em' }}>
          <h2 style={{
            color: theme.textPrimary,
            fontSize: '1.125rem',
            fontWeight: '800',
            margin: '0 0 0.375em 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <div style={{
              width: '2.25em',
              height: '2.25em',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '0.625em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <CreditCard size={18} color="#fff" />
            </div>
            Pagar Mensualidad
          </h2>
          <div style={{ color: theme.textMuted, fontSize: '0.8rem', marginLeft: '2.75em', fontWeight: '600' }}>
            {cuota.curso_nombre} • Cuota {cuota.numero_cuota}
          </div>
        </div>

        {/* Información de la cuota */}
        <div style={{
          background: darkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
          border: `0.0625rem solid ${darkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
          borderRadius: '0.625em',
          padding: '0.875em',
          marginBottom: '1em'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75em', marginBottom: '0.75em' }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.7rem', marginBottom: '0.25em', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monto de la Cuota
              </div>
              <div style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '800' }}>
                ${formatearMonto(cuota.monto)}
              </div>
            </div>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.7rem', marginBottom: '0.25em', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Vencimiento
              </div>
              <div style={{ color: theme.textPrimary, fontSize: '0.85rem', fontWeight: '700' }}>
                {formatearFecha(cuota.fecha_vencimiento)}
              </div>
            </div>
          </div>

          {/* Campo editable de monto a pagar */}
          <div>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '0.375em'
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
                padding: '0.625em 0.875em',
                background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)',
                border: `0.0625rem solid ${darkMode ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.3)'}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '1rem',
                fontWeight: '800',
                fontFamily: 'Montserrat, sans-serif',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.375em',
              color: darkMode ? 'rgba(16, 185, 129, 0.9)' : 'rgba(5, 150, 105, 0.9)',
              fontSize: '0.7rem',
              marginTop: '0.375em',
              lineHeight: '1.3'
            }}>
              <Info size={12} style={{ flexShrink: 0, marginTop: '0.0625em' }} />
              <span>Puedes pagar más del monto de la cuota para adelantar pagos</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Método de pago */}
          <div style={{ marginBottom: '1em' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '0.5em'
            }}>
              Método de Pago *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625em' }}>
              {[
                { value: 'transferencia', label: 'Transferencia', icon: Building },
                { value: 'efectivo', label: 'Efectivo', icon: CreditCard }
              ].map((metodo) => {
                const Icon = metodo.icon;
                const isSelected = metodoPago === metodo.value;
                return (
                  <button
                    key={metodo.value}
                    type="button"
                    onClick={() => setMetodoPago(metodo.value as any)}
                    style={{
                      padding: '0.75em',
                      background: isSelected
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : theme.inputBg,
                      color: isSelected ? '#fff' : theme.textPrimary,
                      border: `0.0625rem solid ${isSelected ? '#10b981' : theme.inputBorder}`,
                      borderRadius: '0.5em',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.375em',
                      fontFamily: 'Montserrat, sans-serif',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0.25rem 0.5rem rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                  >
                    <Icon size={20} />
                    {metodo.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campos específicos para transferencia */}
          {metodoPago === 'transferencia' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75em', marginBottom: '1em' }}>
                {/* Banco */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    color: theme.textPrimary,
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '0.375em'
                  }}>
                    Banco *
                  </label>
                  <select
                    value={bancoComprobante}
                    onChange={(e) => setBancoComprobante(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.625em 0.875em',
                      background: theme.inputBg,
                      border: `0.0625rem solid ${theme.inputBorder}`,
                      borderRadius: '0.5em',
                      color: theme.textPrimary,
                      fontSize: '0.8rem',
                      fontFamily: 'Montserrat, sans-serif',
                      outline: 'none',
                      cursor: 'pointer'
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
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '0.375em'
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
                      padding: '0.625em 0.875em',
                      background: theme.inputBg,
                      border: `0.0625rem solid ${theme.inputBorder}`,
                      borderRadius: '0.5em',
                      color: theme.textPrimary,
                      fontSize: '0.8rem',
                      fontFamily: 'Montserrat, sans-serif',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Fecha de transferencia */}
                <div>
                  <label style={{
                    display: 'block',
                    color: theme.textPrimary,
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '0.375em'
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
                      padding: '0.625em 0.875em',
                      background: theme.inputBg,
                      border: `0.0625rem solid ${theme.inputBorder}`,
                      borderRadius: '0.5em',
                      color: theme.textPrimary,
                      fontSize: '0.8rem',
                      fontFamily: 'Montserrat, sans-serif',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Campos específicos para efectivo */}
          {metodoPago === 'efectivo' && (
            <div style={{ marginBottom: '1em' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75em' }}>
                {/* Número de factura */}
                <div>
                  <label style={{
                    display: 'block',
                    color: theme.textPrimary,
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '0.375em'
                  }}>
                    Número de Factura *
                  </label>
                  <input
                    type="text"
                    value={numeroComprobante}
                    onChange={(e) => setNumeroComprobante(e.target.value)}
                    placeholder="Ej: 001-001-0001234"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625em 0.875em',
                      background: theme.inputBg,
                      border: `0.0625rem solid ${theme.inputBorder}`,
                      borderRadius: '0.5em',
                      color: theme.textPrimary,
                      fontSize: '0.8rem',
                      fontFamily: 'Montserrat, sans-serif',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Recibido por */}
                <div>
                  <label style={{
                    display: 'block',
                    color: theme.textPrimary,
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    marginBottom: '0.375em'
                  }}>
                    Recibido por *
                  </label>
                  <input
                    type="text"
                    value={recibidoPor}
                    onChange={(e) => setRecibidoPor(e.target.value)}
                    placeholder="Nombre completo"
                    required
                    style={{
                      width: '100%',
                      padding: '0.625em 0.875em',
                      background: theme.inputBg,
                      border: `0.0625rem solid ${theme.inputBorder}`,
                      borderRadius: '0.5em',
                      color: theme.textPrimary,
                      fontSize: '0.8rem',
                      fontFamily: 'Montserrat, sans-serif',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.375em',
                color: darkMode ? 'rgba(59, 130, 246, 0.9)' : 'rgba(37, 99, 235, 0.9)',
                fontSize: '0.7rem',
                marginTop: '0.5em',
                padding: '0.625em',
                background: darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderRadius: '0.5em',
                border: `0.0625rem solid ${darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
                lineHeight: '1.3'
              }}>
                <Info size={12} style={{ flexShrink: 0, marginTop: '0.0625em' }} />
                <span>Ingresa el número de factura y el nombre de la persona que te atendió en la academia</span>
              </div>
            </div>
          )}

          {/* Subir comprobante */}
          <div style={{ marginBottom: '1em' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '0.5em'
            }}>
              Comprobante de Pago *
            </label>
            <div style={{
              border: `0.0625rem dashed ${archivoComprobante ? '#10b981' : theme.border}`,
              borderRadius: '0.5em',
              padding: '1.25em',
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
                <Upload size={28} color={archivoComprobante ? '#10b981' : theme.textMuted} style={{ marginBottom: '0.5em' }} />
                <div style={{
                  color: archivoComprobante ? '#10b981' : theme.textPrimary,
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  marginBottom: '0.375em'
                }}>
                  {archivoComprobante ? archivoComprobante.name : 'Haz clic para subir'}
                </div>
                <div style={{ color: theme.textMuted, fontSize: '0.7rem' }}>
                  JPG, PNG o PDF • Máx. 5MB
                </div>
              </label>
            </div>
          </div>

          {/* Observaciones */}
          <div style={{ marginBottom: '1em' }}>
            <label style={{
              display: 'block',
              color: theme.textPrimary,
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '0.375em'
            }}>
              Observaciones (Opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Comentarios adicionales..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.625em 0.875em',
                background: theme.inputBg,
                border: `0.0625rem solid ${theme.inputBorder}`,
                borderRadius: '0.5em',
                color: theme.textPrimary,
                fontSize: '0.8rem',
                fontFamily: 'Montserrat, sans-serif',
                resize: 'vertical',
                outline: 'none',
                lineHeight: '1.4'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
              border: `0.0625rem solid ${darkMode ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: darkMode ? '#fecaca' : '#dc2626',
              padding: '0.75em',
              borderRadius: '0.5em',
              marginBottom: '1em',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em',
              fontWeight: '600',
              lineHeight: '1.3'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.625em', justifyContent: 'flex-end', marginTop: '1.25em' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75em 1.25em',
                background: theme.inputBg,
                color: theme.textPrimary,
                border: `0.0625rem solid ${theme.border}`,
                borderRadius: '0.5em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                fontWeight: '800',
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
                padding: '0.75em 1.5em',
                background: loading ? 'rgba(16, 185, 129, 0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5em',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                fontWeight: '800',
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375em',
                boxShadow: loading ? 'none' : '0 0.25rem 0.625rem rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '0.875em',
                    height: '0.875em',
                    border: '0.125rem solid rgba(255,255,255,0.3)',
                    borderTop: '0.125rem solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
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
