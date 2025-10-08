// ========================================
// MAPEADOR DE COLORES INCONSISTENTES A ROJO
// Convierte automáticamente colores no-rojos a variaciones de rojo
// ========================================

export const RedColorPalette = {
  // Rojos primarios (mantener)
  primary: '#ef4444',      // Rojo principal
  primaryDark: '#dc2626',  // Rojo intenso
  primaryLight: '#f87171', // Rojo claro
  primaryDeep: '#b91c1c',  // Rojo oscuro
  
  // Rojos para estados (reemplazos)
  success: '#dc2626',      // Verde → Rojo intenso
  successLight: '#ef4444', // Verde claro → Rojo principal
  warning: '#f87171',      // Amarillo → Rojo medio
  info: '#525252',         // Azul → Gris (neutral con acento rojo)
  purple: '#b91c1c',       // Morado → Rojo oscuro
  
  // Fondos glass
  glassRed: 'rgba(239, 68, 68, 0.12)',
  glassRedLight: 'rgba(239, 68, 68, 0.08)',
  glassRedBorder: 'rgba(239, 68, 68, 0.2)',
  
  // Neutros
  white: '#ffffff',
  gray: '#525252',
  grayLight: '#9ca3af',
  grayDark: '#374151',
};

// Mapeo automático de colores inconsistentes
export const ColorMapping = {
  // ===== VERDES → ROJOS =====
  '#10b981': RedColorPalette.success,        // Verde éxito → Rojo intenso
  '#22c55e': RedColorPalette.successLight,   // Verde claro → Rojo principal
  '#16a34a': RedColorPalette.success,        // Verde medio → Rojo intenso
  '#15803d': RedColorPalette.primaryDark,    // Verde oscuro → Rojo intenso
  '#dcfce7': RedColorPalette.glassRedLight,  // Verde muy claro → Glass rojo
  
  // ===== AMARILLOS → ROJOS MEDIOS =====
  '#f59e0b': RedColorPalette.warning,        // Amarillo → Rojo medio
  '#fbbf24': RedColorPalette.warning,        // Amarillo claro → Rojo medio
  '#d97706': RedColorPalette.primaryDark,    // Amarillo oscuro → Rojo intenso
  '#fef3c7': RedColorPalette.glassRedLight,  // Amarillo muy claro → Glass rojo
  
  // ===== AZULES → GRISES CON ACENTO ROJO =====
  '#3b82f6': RedColorPalette.info,           // Azul → Gris intenso
  '#2563eb': RedColorPalette.gray,           // Azul medio → Gris
  '#1d4ed8': RedColorPalette.grayDark,       // Azul oscuro → Gris oscuro
  '#dbeafe': RedColorPalette.glassRedLight,  // Azul muy claro → Glass rojo
  
  // ===== MORADOS → ROJOS OSCUROS =====
  '#a855f7': RedColorPalette.purple,         // Morado → Rojo oscuro
  '#9333ea': RedColorPalette.primaryDeep,    // Morado medio → Rojo profundo
  '#7c3aed': RedColorPalette.primaryDeep,    // Morado oscuro → Rojo profundo
  '#f3e8ff': RedColorPalette.glassRedLight,  // Morado muy claro → Glass rojo
  
  // ===== ROJOS (MANTENER) =====
  '#ef4444': RedColorPalette.primary,        // Rojo principal (sin cambio)
  '#dc2626': RedColorPalette.primaryDark,    // Rojo intenso (sin cambio)
  '#f87171': RedColorPalette.primaryLight,   // Rojo claro (sin cambio)
  '#b91c1c': RedColorPalette.primaryDeep,    // Rojo oscuro (sin cambio)
};

// Función para mapear automáticamente cualquier color
export const mapToRedScheme = (color: string): string => {
  // Si el color está en el mapeo, usar el equivalente rojo
  if (ColorMapping[color as keyof typeof ColorMapping]) {
    return ColorMapping[color as keyof typeof ColorMapping];
  }
  
  // Si es un color rgba, intentar convertir
  if (color.includes('rgba') || color.includes('rgb')) {
    return convertRgbaToRed(color);
  }
  
  // Si no está mapeado, devolver el color original
  return color;
};

// Convertir colores rgba/rgb a equivalentes rojos
export const convertRgbaToRed = (rgbaColor: string): string => {
  // Extraer valores rgba
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgbaColor;
  
  const [, r, g, b, a] = match;
  const alpha = a || '1';
  
  // Detectar tipo de color por valores RGB dominantes
  const red = parseInt(r);
  const green = parseInt(g);
  const blue = parseInt(b);
  
  // Si ya es rojizo, mantener
  if (red > green && red > blue) {
    return rgbaColor;
  }
  
  // Si es verdoso, convertir a rojo intenso
  if (green > red && green > blue) {
    return `rgba(220, 38, 38, ${alpha})`;
  }
  
  // Si es azulado, convertir a gris con acento rojo
  if (blue > red && blue > green) {
    return `rgba(82, 82, 82, ${alpha})`;
  }
  
  // Si es amarillento, convertir a rojo medio
  if (red > 200 && green > 150 && blue < 100) {
    return `rgba(248, 113, 113, ${alpha})`;
  }
  
  // Por defecto, usar rojo principal
  return `rgba(239, 68, 68, ${alpha})`;
};

// Función para aplicar mapeo a un objeto de estilos
export const applyRedScheme = (styles: Record<string, any>): Record<string, any> => {
  const mappedStyles: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'string' && (value.startsWith('#') || value.includes('rgb'))) {
      mappedStyles[key] = mapToRedScheme(value);
    } else {
      mappedStyles[key] = value;
    }
  }
  
  return mappedStyles;
};

// Utilidades para efectos glass específicos
export const GlassEffects = {
  // Fondos glass con tinte rojo
  cardBackground: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05))',
  modalBackground: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08))',
  sidebarBackground: 'linear-gradient(180deg, rgba(239, 68, 68, 0.06), rgba(220, 38, 38, 0.03))',
  
  // Bordes glass
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderLight: '1px solid rgba(239, 68, 68, 0.15)',
  borderStrong: '1px solid rgba(239, 68, 68, 0.3)',
  
  // Sombras iOS 26
  shadowSmall: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
  shadowMedium: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowLarge: '0 16px 48px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.12)',
  
  // Blur effects
  blur: 'blur(20px) saturate(180%)',
  blurStrong: 'blur(30px) saturate(200%)',
  blurLight: 'blur(15px) saturate(160%)',
};
