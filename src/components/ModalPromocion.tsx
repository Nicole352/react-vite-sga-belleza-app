import React, { useState } from 'react';
import { X, Gift, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { RedColorPalette, mapToRedScheme } from '../utils/colorMapper';

interface Promocion {
  id_promocion: number;
  nombre_promocion: string;
  descripcion: string;
  meses_gratis?: number;
  clases_gratis?: number;
  nombre_curso_principal?: string;
  horario_principal?: string;
  nombre_curso_promocional?: string;
  horario_promocional?: string;
  duracion_meses: number;
  precio_base?: number;
  precio_por_clase?: number;
  modalidad_pago?: string;
}

interface ModalPromocionProps {
  isOpen: boolean;
  onClose: () => void;
  promociones: Promocion[];
  onAceptar: (id_promocion: number) => void;
  onRechazar: () => void;
  loading?: boolean;
}

const ModalPromocion: React.FC<ModalPromocionProps> = ({
  isOpen,
  onClose,
  promociones,
  onAceptar,
  onRechazar,
  loading = false
}) => {
  const [selectedPromocion, setSelectedPromocion] = useState<number | null>(null);

  if (!isOpen || promociones.length === 0) return null;

  const handleAceptar = () => {
    if (!selectedPromocion) {
      alert('Por favor selecciona una promoción primero');
      return;
    }
    onAceptar(selectedPromocion);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          maxWidth: '48rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        {/* Header con degradado */}
        <div 
          style={{
            padding: '2rem 1.5rem',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${mapToRedScheme(RedColorPalette.primary)} 0%, ${mapToRedScheme(RedColorPalette.primaryDark)} 100%)`
          }}
        >
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '0.75rem' }}>
                <Gift style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0 }}>¡Felicidades!</h2>
                <p style={{ margin: 0, opacity: 0.9 }}>Tienes promociones disponibles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.5rem' }}>
          {/* Mensaje de bienvenida */}
          <div style={{
            background: 'linear-gradient(to right, #fffbeb, #fef3c7)',
            borderLeft: '4px solid #f59e0b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#374151', margin: 0 }}>
              <span style={{ fontWeight: 600 }}>🎉 ¡Tenemos una oferta especial para ti!</span>
              <br />
              Selecciona una promoción haciendo clic en una tarjeta.
            </p>
          </div>

          {/* Mensaje importante sobre activación */}
          <div style={{
            background: 'linear-gradient(to right, #eff6ff, #dbeafe)',
            borderLeft: '4px solid #3b82f6',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#1f2937', margin: 0 }}>
              <span style={{ fontWeight: 600 }}>ℹ️ Importante:</span>
              <br />
              La promoción se <strong>activará después</strong> de que el administrador verifique tu pago del curso principal. 
              Una vez aprobado tu pago, la promoción entrará en vigencia automáticamente.
            </p>
          </div>

          {/* Lista de promociones */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: '#ef4444' }} />
              Promociones Disponibles (Haz clic para seleccionar)
            </h3>

            {promociones.map((promo) => (
              <div
                key={promo.id_promocion}
                onClick={() => setSelectedPromocion(promo.id_promocion)}
                style={{
                  border: selectedPromocion === promo.id_promocion ? '3px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  backgroundColor: selectedPromocion === promo.id_promocion ? '#fef2f2' : 'white',
                  boxShadow: selectedPromocion === promo.id_promocion ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                      {promo.nombre_promocion}
                    </h4>
                    
                    {/* Cursos con horarios */}
                    <div style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#2563eb' }}>💙 Pagas:</span>
                        <span>{promo.nombre_curso_principal || 'N/A'}</span>
                        {promo.horario_principal && (
                          <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {promo.horario_principal}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#059669' }}>💚 Gratis:</span>
                        <span>{promo.nombre_curso_promocional || 'N/A'}</span>
                        {promo.horario_promocional && (
                          <span style={{ padding: '0.125rem 0.5rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.25rem', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {promo.horario_promocional}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge de beneficio */}
                  <div style={{
                    background: 'linear-gradient(to right, #ef4444, #ec4899)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {promo.modalidad_pago === 'clases' ? promo.clases_gratis : promo.meses_gratis}
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      {promo.modalidad_pago === 'clases' 
                        ? `${promo.clases_gratis === 1 ? 'clase gratis' : 'clases gratis'}`
                        : `${promo.meses_gratis === 1 ? 'mes gratis' : 'meses gratis'}`
                      }
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {promo.descripcion && (
                  <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{promo.descripcion}</p>
                )}
                
                {selectedPromocion === promo.id_promocion && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem' }}>
                    <p style={{ color: '#991b1b', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                      ✓ Promoción seleccionada - Haz clic en "Aceptar Promoción" abajo
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Términos y condiciones */}
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            color: '#4b5563',
            marginTop: '1.5rem'
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem', margin: 0 }}>📋 Términos y Condiciones:</p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li><strong>La promoción se activa solo después de verificar tu pago</strong></li>
              <li>Los meses/clases gratis se aplican al inicio del curso promocional</li>
              <li>Después del período promocional, se cobrarán las mensualidades normales</li>
              <li>Esta promoción no es transferible ni acumulable con otras ofertas</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', flexDirection: 'column' }}>
            <button
              onClick={onRechazar}
              disabled={loading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                border: '2px solid #d1d5db',
                color: '#374151',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1
              }}
            >
              <XCircle style={{ width: '1.25rem', height: '1.25rem' }} />
              No gracias, continuar sin promoción
            </button>

            <button
              onClick={handleAceptar}
              disabled={loading || !selectedPromocion}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                color: 'white',
                borderRadius: '0.5rem',
                backgroundColor: selectedPromocion ? mapToRedScheme(RedColorPalette.primary) : '#9ca3af',
                fontWeight: 600,
                cursor: (loading || !selectedPromocion) ? 'not-allowed' : 'pointer',
                opacity: (loading || !selectedPromocion) ? 0.5 : 1,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    width: '1.25rem',
                    height: '1.25rem',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem' }} />
                  {selectedPromocion ? 'Aceptar Promoción' : 'Selecciona una promoción'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPromocion;
