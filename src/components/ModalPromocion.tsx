import React, { useState } from 'react';
import { X, Gift, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const palette = {
    overlay: isDark ? 'rgba(2, 6, 23, 0.82)' : 'rgba(15, 23, 42, 0.55)',
    surface: isDark ? '#0f172a' : '#ffffff',
    surfaceMuted: isDark ? 'rgba(148, 163, 184, 0.16)' : '#f9fafb',
    border: isDark ? 'rgba(148, 163, 184, 0.25)' : '#e5e7eb',
    textPrimary: isDark ? '#f8fafc' : '#1f2937',
    textSecondary: isDark ? '#cbd5f5' : '#4b5563',
    highlight: isDark ? 'rgba(248, 113, 113, 0.18)' : '#fef2f2',
    cardShadow: isDark ? '0 35px 55px -25px rgba(0, 0, 0, 0.9)' : '0 35px 55px -25px rgba(15, 23, 42, 0.35)',
    glow: isDark ? '0 0 45px rgba(248, 113, 113, 0.25)' : '0 0 35px rgba(248, 113, 113, 0.2)',
    highlightPanelBg: isDark
      ? 'linear-gradient(135deg, rgba(17, 17, 20, 0.92), rgba(13, 13, 16, 0.86))'
      : 'linear-gradient(120deg, #fff7ed, #fffbeb)',
    highlightPanelBorder: isDark ? 'rgba(250, 204, 21, 0.32)' : '#fde68a',
    infoPanelBg: isDark
      ? 'linear-gradient(145deg, rgba(8, 8, 10, 0.95), rgba(15, 15, 18, 0.85))'
      : 'linear-gradient(120deg, #eff6ff, #dbeafe)',
    infoPanelBorder: isDark ? 'rgba(148, 163, 184, 0.35)' : '#bfdbfe',
    infoPanelText: isDark ? '#f3f4f6' : '#1f2937',
    chipPayBg: isDark ? 'rgba(17, 24, 39, 0.9)' : '#dbeafe',
    chipPayText: isDark ? '#e0f2fe' : '#1e40af',
    chipFreeBg: isDark ? 'rgba(6, 95, 70, 0.35)' : '#d1fae5',
    chipFreeText: isDark ? '#bbf7d0' : '#065f46'
  };

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
        backgroundColor: palette.overlay,
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        style={{
          backgroundColor: palette.surface,
          color: palette.textPrimary,
          borderRadius: '0.85rem',
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          border: `1px solid ${palette.border}`,
          boxShadow: `${palette.cardShadow}, ${palette.glow}`
        }}
      >
        {/* Header con degradado */}
        <div 
          style={{
            padding: '1.5rem 1.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${mapToRedScheme(RedColorPalette.primary)} 0%, ${mapToRedScheme(RedColorPalette.primaryDark)} 100%)`
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              background: 'rgba(0, 0, 0, 0.15)',
              borderRadius: '999px',
              color: '#fff',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
            aria-label="Cerrar"
          >
            <X />
          </button>
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: 'rgba(255, 255, 255, 0.18)', borderRadius: '1rem' }}>
                <Gift style={{ width: '2.75rem', height: '2.75rem' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', margin: 0 }}>¡Felicidades!</h2>
                <p style={{ margin: 0, opacity: 0.92, fontSize: '0.95rem' }}>Encontramos promociones pensadas para ti</p>
              </div>
            </div>
            <p style={{ margin: 0, opacity: 0.85, fontSize: '0.9rem' }}>
              Elige la propuesta que mejor se adapte a tu plan y disfruta beneficios exclusivos en tus cursos.
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div style={{ padding: '1.5rem', background: isDark ? 'radial-gradient(circle at top, rgba(248, 113, 113, 0.08), transparent 45%)' : 'linear-gradient(180deg, #fff 0%, #fff7f7 120%)' }}>
          {/* Mensaje de bienvenida */}
          <div style={{
            background: palette.highlightPanelBg,
            border: `1px solid ${palette.highlightPanelBorder}`,
            padding: '1rem',
            borderRadius: '0.8rem',
            marginBottom: '1rem',
            boxShadow: '0 15px 28px -30px rgba(250, 204, 21, 0.55)'
          }}>
            <p style={{ color: palette.textPrimary, margin: 0, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>🎉 ¡Tenemos una oferta especial para ti!</span>
              <br />
              Explora cada tarjeta y elige la promoción que complemente mejor tu inscripción.
            </p>
          </div>

          {/* Mensaje importante sobre activación */}
          <div style={{
            background: palette.infoPanelBg,
            border: `1px solid ${palette.infoPanelBorder}`,
            padding: '1rem',
            borderRadius: '0.8rem',
            marginBottom: '1.1rem'
          }}>
            <p style={{ color: palette.infoPanelText, margin: 0, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 600 }}>ℹ️ Importante:</span>
              <br />
              Activaremos la promoción apenas nuestro equipo valide tu pago del curso principal. Al recibir la confirmación quedará habilitada automáticamente.
            </p>
          </div>

          {/* Lista de promociones */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: palette.textPrimary, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: mapToRedScheme(RedColorPalette.primary) }} />
              Promociones disponibles (haz clic para seleccionar)
            </h3>

            {promociones.map((promo) => (
              <div
                key={promo.id_promocion}
                onClick={() => setSelectedPromocion(promo.id_promocion)}
                style={{
                  border: selectedPromocion === promo.id_promocion
                    ? `2px solid ${mapToRedScheme(RedColorPalette.primary)}`
                    : `1px solid ${palette.border}`,
                  borderRadius: '0.9rem',
                  padding: '1.15rem',
                  cursor: 'pointer',
                  marginBottom: '0.85rem',
                  backgroundColor: selectedPromocion === promo.id_promocion ? palette.highlight : palette.surface,
                  boxShadow: selectedPromocion === promo.id_promocion
                    ? '0 25px 45px -30px rgba(239, 68, 68, 0.55)'
                    : '0 10px 25px -25px rgba(15, 23, 42, 0.35)',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: palette.textPrimary, marginBottom: '0.4rem' }}>
                      {promo.nombre_promocion}
                    </h4>
                    
                    {/* Cursos con horarios */}
                    <div style={{ fontSize: '0.9rem', color: palette.textSecondary, marginTop: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#2563eb' }}>💙 Pagas:</span>
                        <span style={{ fontWeight: 500 }}>{promo.nombre_curso_principal || 'N/A'}</span>
                        {promo.horario_principal && (
                          <span style={{ padding: '0.15rem 0.6rem', backgroundColor: palette.chipPayBg, color: palette.chipPayText, borderRadius: '999px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {promo.horario_principal}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: isDark ? '#d1fae5' : '#065f46' }}>💚 Gratis:</span>
                        <span style={{ fontWeight: 500 }}>{promo.nombre_curso_promocional || 'N/A'}</span>
                        {promo.horario_promocional && (
                          <span style={{ padding: '0.15rem 0.6rem', backgroundColor: palette.chipFreeBg, color: palette.chipFreeText, borderRadius: '999px', fontSize: '0.75rem', textTransform: 'capitalize' }}>
                            {promo.horario_promocional}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge de beneficio */}
                  <div style={{
                    background: 'linear-gradient(120deg, rgba(239, 68, 68, 0.95), rgba(236, 72, 153, 0.9))',
                    color: '#fff',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '1.35rem',
                    textAlign: 'center',
                    boxShadow: '0 12px 26px -22px rgba(236, 72, 153, 0.8)',
                    minWidth: '6rem'
                  }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                      {promo.modalidad_pago === 'clases' ? promo.clases_gratis : promo.meses_gratis}
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 500 }}>
                      {promo.modalidad_pago === 'clases' 
                        ? `${promo.clases_gratis === 1 ? 'clase gratis' : 'clases gratis'}`
                        : `${promo.meses_gratis === 1 ? 'mes gratis' : 'meses gratis'}`
                      }
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                {promo.descripcion && (
                  <p style={{ color: palette.textSecondary, marginBottom: '1rem', lineHeight: 1.6 }}>{promo.descripcion}</p>
                )}
                
                {selectedPromocion === promo.id_promocion && (
                  <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: `1px dashed ${palette.border}`, backgroundColor: palette.highlight, padding: '0.7rem', borderRadius: '0.6rem' }}>
                    <p style={{ color: mapToRedScheme(RedColorPalette.primaryDark), fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                      ✓ Promoción seleccionada — confirma más abajo para activarla
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Términos y condiciones */}
          <div style={{
            backgroundColor: palette.surfaceMuted,
            borderRadius: '0.75rem',
            padding: '1rem',
            fontSize: '0.85rem',
            color: palette.textSecondary,
            marginTop: '1.1rem',
            border: `1px solid ${palette.border}`
          }}>
            <p style={{ fontWeight: 600, marginBottom: '0.35rem', margin: 0, color: palette.textPrimary }}>📋 Términos y Condiciones:</p>
            <ul style={{ marginLeft: '1.1rem', marginTop: '0.35rem', paddingLeft: '0.45rem', lineHeight: 1.45 }}>
              <li><strong>La promoción se activa solo después de verificar tu pago</strong></li>
              <li>Los meses/clases gratis se aplican al inicio del curso promocional</li>
              <li>Después del período promocional, se cobrarán las mensualidades normales</li>
              <li>Esta promoción no es transferible ni acumulable con otras ofertas</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', flexDirection: 'column' }}>
            <button
              onClick={onRechazar}
              disabled={loading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.25rem',
                border: `1px solid ${palette.border}`,
                color: palette.textPrimary,
                borderRadius: '0.7rem',
                backgroundColor: palette.surface,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 10px 30px -25px rgba(15, 23, 42, 0.4)'
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
                padding: '0.7rem 1.25rem',
                color: 'white',
                borderRadius: '0.7rem',
                background: selectedPromocion
                  ? `linear-gradient(120deg, ${mapToRedScheme(RedColorPalette.primary)} 0%, ${mapToRedScheme(RedColorPalette.primaryDark)} 100%)`
                  : '#9ca3af',
                fontWeight: 600,
                cursor: (loading || !selectedPromocion) ? 'not-allowed' : 'pointer',
                opacity: (loading || !selectedPromocion) ? 0.5 : 1,
                boxShadow: selectedPromocion ? '0 20px 40px -25px rgba(239, 68, 68, 0.8)' : '0 10px 25px -20px rgba(55, 65, 81, 0.5)',
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
