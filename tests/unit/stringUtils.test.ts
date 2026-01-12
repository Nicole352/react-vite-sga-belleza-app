import { describe, it, expect } from 'vitest';

/**
 * Pruebas para utilidades de strings comunes
 */

describe('Utilidades de String - Limpieza', () => {
    const trim = (str: string): string => str.trim();

    const removeExtraSpaces = (str: string): string => {
        return str.replace(/\s+/g, ' ').trim();
    };

    const removeSpecialChars = (str: string): string => {
        return str.replace(/[^a-zA-Z0-9\s]/g, '');
    };

    it('debe eliminar espacios al inicio y final', () => {
        expect(trim('  hello  ')).toBe('hello');
        expect(trim('hello')).toBe('hello');
    });

    it('debe eliminar espacios extras', () => {
        expect(removeExtraSpaces('hello    world')).toBe('hello world');
        expect(removeExtraSpaces('  hello   world  ')).toBe('hello world');
    });

    it('debe eliminar caracteres especiales', () => {
        expect(removeSpecialChars('hello@world!')).toBe('helloworld');
        expect(removeSpecialChars('test123')).toBe('test123');
    });
});

describe('Utilidades de String - Transformación', () => {
    const toUpperCase = (str: string): string => str.toUpperCase();
    const toLowerCase = (str: string): string => str.toLowerCase();

    const toCamelCase = (str: string): string => {
        return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    };

    const toSnakeCase = (str: string): string => {
        return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
    };

    const toKebabCase = (str: string): string => {
        return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`).replace(/^-/, '');
    };

    it('debe convertir a mayúsculas', () => {
        expect(toUpperCase('hello')).toBe('HELLO');
    });

    it('debe convertir a minúsculas', () => {
        expect(toLowerCase('HELLO')).toBe('hello');
    });

    it('debe convertir a camelCase', () => {
        expect(toCamelCase('hello-world')).toBe('helloWorld');
        expect(toCamelCase('hello_world')).toBe('helloWorld');
    });

    it('debe convertir a snake_case', () => {
        expect(toSnakeCase('helloWorld')).toBe('hello_world');
        expect(toSnakeCase('HelloWorld')).toBe('hello_world');
    });

    it('debe convertir a kebab-case', () => {
        expect(toKebabCase('helloWorld')).toBe('hello-world');
        expect(toKebabCase('HelloWorld')).toBe('hello-world');
    });
});

describe('Utilidades de String - Validación', () => {
    const isEmpty = (str: string): boolean => str.length === 0;
    const isBlank = (str: string): boolean => str.trim().length === 0;

    const contains = (str: string, search: string): boolean => {
        return str.includes(search);
    };

    const startsWith = (str: string, prefix: string): boolean => {
        return str.startsWith(prefix);
    };

    const endsWith = (str: string, suffix: string): boolean => {
        return str.endsWith(suffix);
    };

    it('debe validar string vacío', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('hello')).toBe(false);
    });

    it('debe validar string en blanco', () => {
        expect(isBlank('   ')).toBe(true);
        expect(isBlank('hello')).toBe(false);
    });

    it('debe validar si contiene substring', () => {
        expect(contains('hello world', 'world')).toBe(true);
        expect(contains('hello', 'world')).toBe(false);
    });

    it('debe validar inicio', () => {
        expect(startsWith('hello world', 'hello')).toBe(true);
        expect(startsWith('hello', 'world')).toBe(false);
    });

    it('debe validar final', () => {
        expect(endsWith('hello world', 'world')).toBe(true);
        expect(endsWith('hello', 'world')).toBe(false);
    });
});

describe('Utilidades de String - Extracción', () => {
    const substring = (str: string, start: number, end?: number): string => {
        return str.substring(start, end);
    };

    const slice = (str: string, start: number, end?: number): string => {
        return str.slice(start, end);
    };

    const split = (str: string, separator: string): string[] => {
        return str.split(separator);
    };

    it('debe extraer substring', () => {
        expect(substring('hello world', 0, 5)).toBe('hello');
        expect(substring('hello', 1)).toBe('ello');
    });

    it('debe hacer slice', () => {
        expect(slice('hello world', 0, 5)).toBe('hello');
        expect(slice('hello', -2)).toBe('lo');
    });

    it('debe dividir string', () => {
        expect(split('a,b,c', ',')).toEqual(['a', 'b', 'c']);
        expect(split('hello', '')).toHaveLength(5);
    });
});

describe('Utilidades de String - Reemplazo', () => {
    const replace = (str: string, search: string, replacement: string): string => {
        return str.replace(search, replacement);
    };

    const replaceAll = (str: string, search: string, replacement: string): string => {
        return str.split(search).join(replacement);
    };

    it('debe reemplazar primera ocurrencia', () => {
        expect(replace('hello hello', 'hello', 'hi')).toBe('hi hello');
    });

    it('debe reemplazar todas las ocurrencias', () => {
        expect(replaceAll('hello hello', 'hello', 'hi')).toBe('hi hi');
    });
});

describe('Utilidades de String - Padding', () => {
    const padStart = (str: string, length: number, char = ' '): string => {
        return str.padStart(length, char);
    };

    const padEnd = (str: string, length: number, char = ' '): string => {
        return str.padEnd(length, char);
    };

    it('debe agregar padding al inicio', () => {
        expect(padStart('5', 3, '0')).toBe('005');
        expect(padStart('hello', 10)).toBe('     hello');
    });

    it('debe agregar padding al final', () => {
        expect(padEnd('5', 3, '0')).toBe('500');
        expect(padEnd('hello', 10)).toBe('hello     ');
    });
});

describe('Utilidades de String - Repetición', () => {
    const repeat = (str: string, count: number): string => {
        return str.repeat(count);
    };

    it('debe repetir string', () => {
        expect(repeat('a', 3)).toBe('aaa');
        expect(repeat('hello', 2)).toBe('hellohello');
        expect(repeat('x', 0)).toBe('');
    });
});

describe('Utilidades de String - Comparación', () => {
    const equals = (str1: string, str2: string): boolean => {
        return str1 === str2;
    };

    const equalsIgnoreCase = (str1: string, str2: string): boolean => {
        return str1.toLowerCase() === str2.toLowerCase();
    };

    it('debe comparar strings', () => {
        expect(equals('hello', 'hello')).toBe(true);
        expect(equals('hello', 'Hello')).toBe(false);
    });

    it('debe comparar ignorando mayúsculas', () => {
        expect(equalsIgnoreCase('hello', 'HELLO')).toBe(true);
        expect(equalsIgnoreCase('hello', 'world')).toBe(false);
    });
});
