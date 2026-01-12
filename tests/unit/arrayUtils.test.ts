import { describe, it, expect } from 'vitest';

/**
 * Pruebas para utilidades de arrays
 */

describe('Utilidades de Array - Búsqueda', () => {
    const findById = <T extends { id: number }>(arr: T[], id: number): T | undefined => {
        return arr.find(item => item.id === id);
    };

    const findByProperty = <T>(arr: T[], key: keyof T, value: any): T | undefined => {
        return arr.find(item => item[key] === value);
    };

    it('debe encontrar elemento por ID', () => {
        const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        expect(findById(items, 1)).toEqual({ id: 1, name: 'A' });
        expect(findById(items, 3)).toBeUndefined();
    });

    it('debe encontrar elemento por propiedad', () => {
        const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        expect(findByProperty(items, 'name', 'A')).toEqual({ id: 1, name: 'A' });
    });
});

describe('Utilidades de Array - Filtrado', () => {
    const filterByProperty = <T>(arr: T[], key: keyof T, value: any): T[] => {
        return arr.filter(item => item[key] === value);
    };

    const filterUnique = <T>(arr: T[]): T[] => {
        return [...new Set(arr)];
    };

    it('debe filtrar por propiedad', () => {
        const items = [
            { type: 'A', value: 1 },
            { type: 'B', value: 2 },
            { type: 'A', value: 3 }
        ];
        expect(filterByProperty(items, 'type', 'A')).toHaveLength(2);
    });

    it('debe filtrar valores únicos', () => {
        expect(filterUnique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
    });
});

describe('Utilidades de Array - Transformación', () => {
    const mapToProperty = <T, K extends keyof T>(arr: T[], key: K): T[K][] => {
        return arr.map(item => item[key]);
    };

    const groupBy = <T>(arr: T[], key: keyof T): Record<string, T[]> => {
        return arr.reduce((acc, item) => {
            const groupKey = String(item[key]);
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(item);
            return acc;
        }, {} as Record<string, T[]>);
    };

    it('debe mapear a propiedad', () => {
        const items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
        expect(mapToProperty(items, 'name')).toEqual(['A', 'B']);
    });

    it('debe agrupar por propiedad', () => {
        const items = [
            { type: 'A', value: 1 },
            { type: 'B', value: 2 },
            { type: 'A', value: 3 }
        ];
        const grouped = groupBy(items, 'type');
        expect(grouped['A']).toHaveLength(2);
        expect(grouped['B']).toHaveLength(1);
    });
});

describe('Utilidades de Array - Ordenamiento', () => {
    const sortByProperty = <T>(arr: T[], key: keyof T, ascending = true): T[] => {
        return [...arr].sort((a, b) => {
            if (a[key] < b[key]) return ascending ? -1 : 1;
            if (a[key] > b[key]) return ascending ? 1 : -1;
            return 0;
        });
    };

    it('debe ordenar ascendente', () => {
        const items = [{ value: 3 }, { value: 1 }, { value: 2 }];
        const sorted = sortByProperty(items, 'value');
        expect(sorted[0].value).toBe(1);
        expect(sorted[2].value).toBe(3);
    });

    it('debe ordenar descendente', () => {
        const items = [{ value: 1 }, { value: 3 }, { value: 2 }];
        const sorted = sortByProperty(items, 'value', false);
        expect(sorted[0].value).toBe(3);
        expect(sorted[2].value).toBe(1);
    });
});

describe('Utilidades de Array - Agregación', () => {
    const sum = (arr: number[]): number => {
        return arr.reduce((acc, val) => acc + val, 0);
    };

    const average = (arr: number[]): number => {
        return arr.length > 0 ? sum(arr) / arr.length : 0;
    };

    const max = (arr: number[]): number => {
        return Math.max(...arr);
    };

    const min = (arr: number[]): number => {
        return Math.min(...arr);
    };

    it('debe sumar valores', () => {
        expect(sum([1, 2, 3, 4])).toBe(10);
        expect(sum([])).toBe(0);
    });

    it('debe calcular promedio', () => {
        expect(average([1, 2, 3, 4])).toBe(2.5);
        expect(average([])).toBe(0);
    });

    it('debe encontrar máximo', () => {
        expect(max([1, 5, 3, 2])).toBe(5);
    });

    it('debe encontrar mínimo', () => {
        expect(min([5, 1, 3, 2])).toBe(1);
    });
});

describe('Utilidades de Array - Partición', () => {
    const chunk = <T>(arr: T[], size: number): T[][] => {
        const chunks: T[][] = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    };

    const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
        const pass: T[] = [];
        const fail: T[] = [];
        arr.forEach(item => (predicate(item) ? pass : fail).push(item));
        return [pass, fail];
    };

    it('debe dividir en chunks', () => {
        const chunks = chunk([1, 2, 3, 4, 5], 2);
        expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('debe particionar por predicado', () => {
        const [evens, odds] = partition([1, 2, 3, 4], n => n % 2 === 0);
        expect(evens).toEqual([2, 4]);
        expect(odds).toEqual([1, 3]);
    });
});

describe('Utilidades de Array - Manipulación', () => {
    const removeAt = <T>(arr: T[], index: number): T[] => {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    };

    const insertAt = <T>(arr: T[], index: number, item: T): T[] => {
        return [...arr.slice(0, index), item, ...arr.slice(index)];
    };

    const move = <T>(arr: T[], from: number, to: number): T[] => {
        const item = arr[from];
        const without = removeAt(arr, from);
        return insertAt(without, to, item);
    };

    it('debe remover en índice', () => {
        expect(removeAt([1, 2, 3], 1)).toEqual([1, 3]);
    });

    it('debe insertar en índice', () => {
        expect(insertAt([1, 3], 1, 2)).toEqual([1, 2, 3]);
    });

    it('debe mover elemento', () => {
        expect(move([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    });
});
