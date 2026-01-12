import { describe, it, expect } from 'vitest';

/**
 * Pruebas para utilidades matemáticas
 */

describe('Utilidades Math - Operaciones Básicas', () => {
    const add = (a: number, b: number): number => a + b;
    const subtract = (a: number, b: number): number => a - b;
    const multiply = (a: number, b: number): number => a * b;
    const divide = (a: number, b: number): number => b !== 0 ? a / b : 0;

    it('debe sumar números', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
    });

    it('debe restar números', () => {
        expect(subtract(5, 3)).toBe(2);
        expect(subtract(0, 5)).toBe(-5);
    });

    it('debe multiplicar números', () => {
        expect(multiply(2, 3)).toBe(6);
        expect(multiply(-2, 3)).toBe(-6);
        expect(multiply(0, 5)).toBe(0);
    });

    it('debe dividir números', () => {
        expect(divide(6, 2)).toBe(3);
        expect(divide(5, 2)).toBe(2.5);
        expect(divide(5, 0)).toBe(0);
    });
});

describe('Utilidades Math - Redondeo', () => {
    const round = (num: number): number => Math.round(num);
    const floor = (num: number): number => Math.floor(num);
    const ceil = (num: number): number => Math.ceil(num);
    const toFixed = (num: number, decimals: number): string => num.toFixed(decimals);

    it('debe redondear números', () => {
        expect(round(3.4)).toBe(3);
        expect(round(3.5)).toBe(4);
        expect(round(3.6)).toBe(4);
    });

    it('debe redondear hacia abajo', () => {
        expect(floor(3.9)).toBe(3);
        expect(floor(3.1)).toBe(3);
    });

    it('debe redondear hacia arriba', () => {
        expect(ceil(3.1)).toBe(4);
        expect(ceil(3.9)).toBe(4);
    });

    it('debe formatear decimales', () => {
        expect(toFixed(3.14159, 2)).toBe('3.14');
        expect(toFixed(3.14159, 4)).toBe('3.1416');
    });
});

describe('Utilidades Math - Comparación', () => {
    const max = (...nums: number[]): number => Math.max(...nums);
    const min = (...nums: number[]): number => Math.min(...nums);
    const clamp = (num: number, min: number, max: number): number => {
        return Math.min(Math.max(num, min), max);
    };

    it('debe encontrar máximo', () => {
        expect(max(1, 5, 3)).toBe(5);
        expect(max(-1, -5, -3)).toBe(-1);
    });

    it('debe encontrar mínimo', () => {
        expect(min(1, 5, 3)).toBe(1);
        expect(min(-1, -5, -3)).toBe(-5);
    });

    it('debe limitar valor en rango', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-5, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
    });
});

describe('Utilidades Math - Aleatorios', () => {
    const randomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const randomFloat = (min: number, max: number): number => {
        return Math.random() * (max - min) + min;
    };

    it('debe generar entero aleatorio en rango', () => {
        const num = randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
        expect(Number.isInteger(num)).toBe(true);
    });

    it('debe generar float aleatorio en rango', () => {
        const num = randomFloat(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThan(10);
    });
});

describe('Utilidades Math - Porcentajes', () => {
    const percentage = (value: number, total: number): number => {
        return total !== 0 ? (value / total) * 100 : 0;
    };

    const percentageOf = (percent: number, total: number): number => {
        return (percent / 100) * total;
    };

    it('debe calcular porcentaje', () => {
        expect(percentage(25, 100)).toBe(25);
        expect(percentage(1, 4)).toBe(25);
        expect(percentage(5, 0)).toBe(0);
    });

    it('debe calcular valor de porcentaje', () => {
        expect(percentageOf(50, 100)).toBe(50);
        expect(percentageOf(25, 200)).toBe(50);
    });
});

describe('Utilidades Math - Potencias y Raíces', () => {
    const power = (base: number, exponent: number): number => {
        return Math.pow(base, exponent);
    };

    const sqrt = (num: number): number => Math.sqrt(num);
    const cbrt = (num: number): number => Math.cbrt(num);

    it('debe calcular potencias', () => {
        expect(power(2, 3)).toBe(8);
        expect(power(5, 2)).toBe(25);
        expect(power(10, 0)).toBe(1);
    });

    it('debe calcular raíz cuadrada', () => {
        expect(sqrt(9)).toBe(3);
        expect(sqrt(16)).toBe(4);
    });

    it('debe calcular raíz cúbica', () => {
        expect(cbrt(8)).toBe(2);
        expect(cbrt(27)).toBe(3);
    });
});

describe('Utilidades Math - Absolutos y Signos', () => {
    const abs = (num: number): number => Math.abs(num);
    const sign = (num: number): number => Math.sign(num);

    it('debe calcular valor absoluto', () => {
        expect(abs(-5)).toBe(5);
        expect(abs(5)).toBe(5);
        expect(abs(0)).toBe(0);
    });

    it('debe obtener signo', () => {
        expect(sign(5)).toBe(1);
        expect(sign(-5)).toBe(-1);
        expect(sign(0)).toBe(0);
    });
});
