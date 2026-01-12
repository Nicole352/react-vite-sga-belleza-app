import { describe, it, expect } from 'vitest';

/**
 * Pruebas para validadores comunes
 * Basado en patrones típicos de validación
 */

describe('Validadores de Email', () => {
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    it('debe validar emails correctos', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co')).toBe(true);
        expect(isValidEmail('admin@subdomain.example.com')).toBe(true);
    });

    it('debe rechazar emails inválidos', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('user @example.com')).toBe(false);
    });
});

describe('Validadores de Texto', () => {
    const isNotEmpty = (text: string): boolean => {
        return text.trim().length > 0;
    };

    const hasMinLength = (text: string, min: number): boolean => {
        return text.length >= min;
    };

    const hasMaxLength = (text: string, max: number): boolean => {
        return text.length <= max;
    };

    it('debe validar texto no vacío', () => {
        expect(isNotEmpty('texto')).toBe(true);
        expect(isNotEmpty('  ')).toBe(false);
        expect(isNotEmpty('')).toBe(false);
    });

    it('debe validar longitud mínima', () => {
        expect(hasMinLength('test', 4)).toBe(true);
        expect(hasMinLength('test', 5)).toBe(false);
        expect(hasMinLength('', 1)).toBe(false);
    });

    it('debe validar longitud máxima', () => {
        expect(hasMaxLength('test', 4)).toBe(true);
        expect(hasMaxLength('test', 3)).toBe(false);
        expect(hasMaxLength('', 10)).toBe(true);
    });
});

describe('Validadores Numéricos', () => {
    const isPositive = (num: number): boolean => {
        return num > 0;
    };

    const isInRange = (num: number, min: number, max: number): boolean => {
        return num >= min && num <= max;
    };

    const isInteger = (num: number): boolean => {
        return Number.isInteger(num);
    };

    it('debe validar números positivos', () => {
        expect(isPositive(1)).toBe(true);
        expect(isPositive(0)).toBe(false);
        expect(isPositive(-1)).toBe(false);
    });

    it('debe validar rango de números', () => {
        expect(isInRange(5, 1, 10)).toBe(true);
        expect(isInRange(0, 1, 10)).toBe(false);
        expect(isInRange(11, 1, 10)).toBe(false);
    });

    it('debe validar números enteros', () => {
        expect(isInteger(5)).toBe(true);
        expect(isInteger(5.5)).toBe(false);
        expect(isInteger(0)).toBe(true);
    });
});

describe('Validadores de Fecha', () => {
    const isValidDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    };

    const isFutureDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        return date > new Date();
    };

    const isPastDate = (dateString: string): boolean => {
        const date = new Date(dateString);
        return date < new Date();
    };

    it('debe validar fechas válidas', () => {
        expect(isValidDate('2024-01-01')).toBe(true);
        expect(isValidDate('invalid')).toBe(false);
    });

    it('debe validar fechas futuras', () => {
        expect(isFutureDate('2099-12-31')).toBe(true);
        expect(isFutureDate('2000-01-01')).toBe(false);
    });

    it('debe validar fechas pasadas', () => {
        expect(isPastDate('2000-01-01')).toBe(true);
        expect(isPastDate('2099-12-31')).toBe(false);
    });
});

describe('Validadores de URL', () => {
    const isValidURL = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const isHTTPS = (url: string): boolean => {
        try {
            return new URL(url).protocol === 'https:';
        } catch {
            return false;
        }
    };

    it('debe validar URLs válidas', () => {
        expect(isValidURL('https://example.com')).toBe(true);
        expect(isValidURL('http://test.com')).toBe(true);
        expect(isValidURL('invalid')).toBe(false);
    });

    it('debe validar HTTPS', () => {
        expect(isHTTPS('https://example.com')).toBe(true);
        expect(isHTTPS('http://example.com')).toBe(false);
    });
});

describe('Validadores de Contraseña', () => {
    const hasUpperCase = (password: string): boolean => {
        return /[A-Z]/.test(password);
    };

    const hasLowerCase = (password: string): boolean => {
        return /[a-z]/.test(password);
    };

    const hasNumber = (password: string): boolean => {
        return /\d/.test(password);
    };

    const hasSpecialChar = (password: string): boolean => {
        return /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };

    it('debe validar mayúsculas', () => {
        expect(hasUpperCase('Password')).toBe(true);
        expect(hasUpperCase('password')).toBe(false);
    });

    it('debe validar minúsculas', () => {
        expect(hasLowerCase('Password')).toBe(true);
        expect(hasLowerCase('PASSWORD')).toBe(false);
    });

    it('debe validar números', () => {
        expect(hasNumber('Pass123')).toBe(true);
        expect(hasNumber('Password')).toBe(false);
    });

    it('debe validar caracteres especiales', () => {
        expect(hasSpecialChar('Pass@123')).toBe(true);
        expect(hasSpecialChar('Pass123')).toBe(false);
    });
});

describe('Validadores de Teléfono', () => {
    const isValidPhone = (phone: string): boolean => {
        const phoneRegex = /^\+?[\d\s-()]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
    };

    it('debe validar teléfonos válidos', () => {
        expect(isValidPhone('+1234567890')).toBe(true);
        expect(isValidPhone('123-456-7890')).toBe(true);
        expect(isValidPhone('(123) 456-7890')).toBe(true);
    });

    it('debe rechazar teléfonos inválidos', () => {
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('abc')).toBe(false);
    });
});

describe('Validadores de Código Postal', () => {
    const isValidZipCode = (zip: string): boolean => {
        return /^\d{5}(-\d{4})?$/.test(zip);
    };

    it('debe validar códigos postales válidos', () => {
        expect(isValidZipCode('12345')).toBe(true);
        expect(isValidZipCode('12345-6789')).toBe(true);
    });

    it('debe rechazar códigos postales inválidos', () => {
        expect(isValidZipCode('1234')).toBe(false);
        expect(isValidZipCode('abcde')).toBe(false);
    });
});
