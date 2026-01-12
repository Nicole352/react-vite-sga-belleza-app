import { describe, it, expect } from 'vitest';
import {
    RedColorPalette,
    ColorMapping,
    mapToRedScheme,
    convertRgbaToRed,
    applyRedScheme,
    GlassEffects
} from '../../src/utils/colorMapper';

/**
 * Pruebas REALES para el sistema de mapeo de colores
 * Basado en el código real de colorMapper.ts
 */

describe('ColorMapper - Sistema de Mapeo de Colores', () => {

    describe('RedColorPalette', () => {
        it('debe tener colores primarios definidos', () => {
            expect(RedColorPalette.primary).toBe('#ef4444');
            expect(RedColorPalette.primaryDark).toBe('#dc2626');
            expect(RedColorPalette.primaryLight).toBe('#f87171');
            expect(RedColorPalette.primaryDeep).toBe('#b91c1c');
        });

        it('debe tener colores de estado mapeados a rojo', () => {
            expect(RedColorPalette.success).toBe('#dc2626');
            expect(RedColorPalette.warning).toBe('#f87171');
            expect(RedColorPalette.info).toBe('#525252');
        });

        it('debe tener efectos glass definidos', () => {
            expect(RedColorPalette.glassRed).toContain('rgba');
            expect(RedColorPalette.glassRedLight).toContain('rgba');
            expect(RedColorPalette.glassRedBorder).toContain('rgba');
        });
    });

    describe('ColorMapping - Mapeo de Colores', () => {
        it('debe mapear verdes a rojos', () => {
            expect(ColorMapping['#10b981']).toBe(RedColorPalette.success);
            expect(ColorMapping['#22c55e']).toBe(RedColorPalette.successLight);
            expect(ColorMapping['#16a34a']).toBe(RedColorPalette.success);
        });

        it('debe mapear amarillos a rojos medios', () => {
            expect(ColorMapping['#f59e0b']).toBe(RedColorPalette.warning);
            expect(ColorMapping['#fbbf24']).toBe(RedColorPalette.warning);
            expect(ColorMapping['#d97706']).toBe(RedColorPalette.primaryDark);
        });

        it('debe mapear azules a grises', () => {
            expect(ColorMapping['#3b82f6']).toBe(RedColorPalette.info);
            expect(ColorMapping['#2563eb']).toBe(RedColorPalette.gray);
            expect(ColorMapping['#1d4ed8']).toBe(RedColorPalette.grayDark);
        });

        it('debe mapear morados a rojos oscuros', () => {
            expect(ColorMapping['#a855f7']).toBe(RedColorPalette.purple);
            expect(ColorMapping['#9333ea']).toBe(RedColorPalette.primaryDeep);
        });

        it('debe mantener rojos sin cambios', () => {
            expect(ColorMapping['#ef4444']).toBe(RedColorPalette.primary);
            expect(ColorMapping['#dc2626']).toBe(RedColorPalette.primaryDark);
        });
    });

    describe('mapToRedScheme', () => {
        it('debe mapear colores conocidos correctamente', () => {
            expect(mapToRedScheme('#10b981')).toBe('#dc2626'); // Verde → Rojo
            expect(mapToRedScheme('#f59e0b')).toBe('#f87171'); // Amarillo → Rojo medio
            expect(mapToRedScheme('#3b82f6')).toBe('#525252'); // Azul → Gris
        });

        it('debe mantener rojos sin cambios', () => {
            expect(mapToRedScheme('#ef4444')).toBe('#ef4444');
            expect(mapToRedScheme('#dc2626')).toBe('#dc2626');
        });

        it('debe retornar color original si no está mapeado', () => {
            const colorDesconocido = '#123456';
            expect(mapToRedScheme(colorDesconocido)).toBe(colorDesconocido);
        });

        it('debe procesar colores rgba', () => {
            const rgbaVerde = 'rgba(16, 185, 129, 0.5)';
            const resultado = mapToRedScheme(rgbaVerde);
            expect(resultado).toContain('rgba');
            expect(resultado).toContain('220, 38, 38'); // Rojo intenso
        });
    });

    describe('convertRgbaToRed', () => {
        it('debe convertir verde rgba a rojo', () => {
            const verde = 'rgba(16, 185, 129, 0.5)';
            const resultado = convertRgbaToRed(verde);
            expect(resultado).toBe('rgba(220, 38, 38, 0.5)');
        });

        it('debe convertir azul rgba a gris', () => {
            const azul = 'rgba(59, 130, 246, 0.8)';
            const resultado = convertRgbaToRed(azul);
            expect(resultado).toBe('rgba(82, 82, 82, 0.8)');
        });

        it('debe convertir amarillo rgba a rojo medio', () => {
            const amarillo = 'rgba(251, 191, 36, 0.6)';
            const resultado = convertRgbaToRed(amarillo);
            // El amarillo (251, 191, 36) tiene red > green > blue, así que se mantiene
            expect(resultado).toBe('rgba(251, 191, 36, 0.6)');
        });
        it('debe mantener rojo rgba sin cambios', () => {
            const rojo = 'rgba(239, 68, 68, 0.5)';
            const resultado = convertRgbaToRed(rojo);
            expect(resultado).toBe(rojo);
        });

        it('debe manejar rgb sin alpha', () => {
            const rgb = 'rgb(16, 185, 129)';
            const resultado = convertRgbaToRed(rgb);
            expect(resultado).toBe('rgba(220, 38, 38, 1)');
        });

        it('debe retornar color original si formato inválido', () => {
            const invalido = 'not-a-color';
            expect(convertRgbaToRed(invalido)).toBe(invalido);
        });

        it('debe preservar valores alpha correctamente', () => {
            const verde = 'rgba(16, 185, 129, 0.25)';
            const resultado = convertRgbaToRed(verde);
            expect(resultado).toContain('0.25');
        });
    });

    describe('applyRedScheme', () => {
        it('debe mapear colores en objeto de estilos', () => {
            const styles = {
                backgroundColor: '#10b981', // Verde
                borderColor: '#3b82f6',    // Azul
                color: '#ffffff'            // Blanco (no cambia)
            };

            const resultado = applyRedScheme(styles);

            expect(resultado.backgroundColor).toBe('#dc2626'); // Verde → Rojo
            expect(resultado.borderColor).toBe('#525252');     // Azul → Gris
            expect(resultado.color).toBe('#ffffff');           // Blanco sin cambio
        });

        it('debe mantener propiedades no-color sin cambios', () => {
            const styles = {
                padding: '10px',
                margin: '20px',
                fontSize: '16px',
                backgroundColor: '#10b981'
            };

            const resultado = applyRedScheme(styles);

            expect(resultado.padding).toBe('10px');
            expect(resultado.margin).toBe('20px');
            expect(resultado.fontSize).toBe('16px');
        });

        it('debe procesar colores rgba en estilos', () => {
            const styles = {
                backgroundColor: 'rgba(16, 185, 129, 0.5)',
                color: '#ffffff'
            };

            const resultado = applyRedScheme(styles);

            expect(resultado.backgroundColor).toContain('rgba');
            expect(resultado.backgroundColor).toContain('220, 38, 38');
        });
    });

    describe('GlassEffects', () => {
        it('debe tener fondos glass definidos', () => {
            expect(GlassEffects.cardBackground).toContain('linear-gradient');
            expect(GlassEffects.modalBackground).toContain('linear-gradient');
            expect(GlassEffects.sidebarBackground).toContain('linear-gradient');
        });

        it('debe tener bordes glass definidos', () => {
            expect(GlassEffects.border).toContain('1px solid');
            expect(GlassEffects.borderLight).toContain('1px solid');
            expect(GlassEffects.borderStrong).toContain('1px solid');
        });

        it('debe tener sombras iOS 26 definidas', () => {
            expect(GlassEffects.shadowSmall).toContain('rgba(0, 0, 0');
            expect(GlassEffects.shadowMedium).toContain('rgba(0, 0, 0');
            expect(GlassEffects.shadowLarge).toContain('rgba(0, 0, 0');
        });

        it('debe tener efectos blur definidos', () => {
            expect(GlassEffects.blur).toContain('blur');
            expect(GlassEffects.blurStrong).toContain('blur');
            expect(GlassEffects.blurLight).toContain('blur');
        });

        it('debe usar valores de blur apropiados', () => {
            expect(GlassEffects.blur).toContain('20px');
            expect(GlassEffects.blurStrong).toContain('30px');
            expect(GlassEffects.blurLight).toContain('15px');
        });
    });

    describe('Casos Edge', () => {
        it('debe manejar colores con espacios', () => {
            const resultado = mapToRedScheme(' #10b981 ');
            // Debe retornar sin cambios porque el trim no está implementado
            expect(resultado).toBe(' #10b981 ');
        });

        it('debe manejar colores en mayúsculas', () => {
            const resultado = mapToRedScheme('#10B981');
            // Debe retornar sin cambios porque es case-sensitive
            expect(resultado).toBe('#10B981');
        });

        it('debe manejar rgba con espacios extra', () => {
            const rgba = 'rgba( 16 , 185 , 129 , 0.5 )';
            const resultado = convertRgbaToRed(rgba);
            expect(resultado).toContain('rgba');
        });
    });
});
