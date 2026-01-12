import { describe, it, expect } from 'vitest';

/**
 * Pruebas para utilidades de objetos
 */

describe('Utilidades de Object - Clonación', () => {
    const shallowClone = <T>(obj: T): T => {
        return { ...obj };
    };

    const deepClone = <T>(obj: T): T => {
        return JSON.parse(JSON.stringify(obj));
    };

    it('debe clonar objeto superficialmente', () => {
        const obj = { a: 1, b: 2 };
        const clone = shallowClone(obj);
        expect(clone).toEqual(obj);
        expect(clone).not.toBe(obj);
    });

    it('debe clonar objeto profundamente', () => {
        const obj = { a: 1, nested: { b: 2 } };
        const clone = deepClone(obj);
        expect(clone).toEqual(obj);
        expect(clone.nested).not.toBe(obj.nested);
    });
});

describe('Utilidades de Object - Merge', () => {
    const merge = <T, U>(obj1: T, obj2: U): T & U => {
        return { ...obj1, ...obj2 };
    };

    const deepMerge = (obj1: any, obj2: any): any => {
        const result = { ...obj1 };
        for (const key in obj2) {
            if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
                result[key] = deepMerge(result[key] || {}, obj2[key]);
            } else {
                result[key] = obj2[key];
            }
        }
        return result;
    };

    it('debe hacer merge superficial', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { b: 3, c: 4 };
        expect(merge(obj1, obj2)).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('debe hacer merge profundo', () => {
        const obj1 = { a: 1, nested: { b: 2 } };
        const obj2 = { nested: { c: 3 } };
        const result = deepMerge(obj1, obj2);
        expect(result.nested).toEqual({ b: 2, c: 3 });
    });
});

describe('Utilidades de Object - Propiedades', () => {
    const keys = <T>(obj: T): (keyof T)[] => {
        return Object.keys(obj) as (keyof T)[];
    };

    const values = <T>(obj: T): T[keyof T][] => {
        return Object.values(obj);
    };

    const entries = <T>(obj: T): [keyof T, T[keyof T]][] => {
        return Object.entries(obj) as [keyof T, T[keyof T]][];
    };

    it('debe obtener keys', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expect(keys(obj)).toEqual(['a', 'b', 'c']);
    });

    it('debe obtener values', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expect(values(obj)).toEqual([1, 2, 3]);
    });

    it('debe obtener entries', () => {
        const obj = { a: 1, b: 2 };
        expect(entries(obj)).toEqual([['a', 1], ['b', 2]]);
    });
});

describe('Utilidades de Object - Validación', () => {
    const isEmpty = (obj: object): boolean => {
        return Object.keys(obj).length === 0;
    };

    const hasProperty = <T>(obj: T, key: keyof T): boolean => {
        return key in obj;
    };

    const isObject = (value: any): boolean => {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    };

    it('debe validar objeto vacío', () => {
        expect(isEmpty({})).toBe(true);
        expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('debe validar existencia de propiedad', () => {
        const obj = { a: 1, b: 2 };
        expect(hasProperty(obj, 'a')).toBe(true);
        expect(hasProperty(obj, 'c' as any)).toBe(false);
    });

    it('debe validar si es objeto', () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(false);
        expect(isObject(null)).toBe(false);
    });
});

describe('Utilidades de Object - Transformación', () => {
    const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
        const result = {} as Pick<T, K>;
        keys.forEach(key => {
            if (key in obj) result[key] = obj[key];
        });
        return result;
    };

    const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
        const result = { ...obj };
        keys.forEach(key => delete result[key]);
        return result;
    };

    it('debe seleccionar propiedades', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('debe omitir propiedades', () => {
        const obj = { a: 1, b: 2, c: 3 };
        expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
});

describe('Utilidades de Object - Comparación', () => {
    const isEqual = (obj1: any, obj2: any): boolean => {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    };

    it('debe comparar objetos', () => {
        expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
    });
});

describe('Utilidades de Object - Congelación', () => {
    const freeze = <T>(obj: T): Readonly<T> => {
        return Object.freeze(obj);
    };

    const isFrozen = (obj: object): boolean => {
        return Object.isFrozen(obj);
    };

    it('debe congelar objeto', () => {
        const obj = { a: 1 };
        const frozen = freeze(obj);
        expect(isFrozen(frozen)).toBe(true);
    });
});
