import { describe, it, expect } from 'vitest';

/**
 * Pruebas para formateadores comunes
 */

describe('Formateadores de Moneda', () => {
    const formatCurrency = (amount: number, currency = 'USD'): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount);
    };

    it('debe formatear moneda correctamente', () => {
        expect(formatCurrency(1000)).toBe('$1,000.00');
        expect(formatCurrency(1234.56)).toBe('$1,234.56');
        expect(formatCurrency(0)).toBe('$0.00');
    });

    it('debe manejar diferentes monedas', () => {
        expect(formatCurrency(1000, 'EUR')).toContain('1,000.00');
        expect(formatCurrency(1000, 'GBP')).toContain('1,000.00');
    });
});

describe('Formateadores de Fecha', () => {
    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('es-ES');
    };

    const formatDateTime = (date: Date): string => {
        return date.toLocaleString('es-ES');
    };

    it('debe formatear fechas', () => {
        const date = new Date('2024-01-15');
        expect(formatDate(date)).toContain('2024');
    });

    it('debe formatear fecha y hora', () => {
        const date = new Date('2024-01-15T10:30:00');
        const formatted = formatDateTime(date);
        expect(formatted).toContain('2024');
    });
});

describe('Formateadores de Número', () => {
    const formatNumber = (num: number): string => {
        return num.toLocaleString('en-US');
    };

    const formatPercentage = (num: number): string => {
        return `${(num * 100).toFixed(2)}%`;
    };

    const formatDecimal = (num: number, decimals = 2): string => {
        return num.toFixed(decimals);
    };

    it('debe formatear números con separadores', () => {
        expect(formatNumber(1000)).toBe('1,000');
        expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('debe formatear porcentajes', () => {
        expect(formatPercentage(0.5)).toBe('50.00%');
        expect(formatPercentage(0.123)).toBe('12.30%');
    });

    it('debe formatear decimales', () => {
        expect(formatDecimal(3.14159, 2)).toBe('3.14');
        expect(formatDecimal(3.14159, 4)).toBe('3.1416');
    });
});

describe('Formateadores de Texto', () => {
    const capitalize = (text: string): string => {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const toTitleCase = (text: string): string => {
        return text.split(' ').map(word => capitalize(word)).join(' ');
    };

    const truncate = (text: string, maxLength: number): string => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    it('debe capitalizar texto', () => {
        expect(capitalize('hello')).toBe('Hello');
        expect(capitalize('HELLO')).toBe('Hello');
    });

    it('debe convertir a title case', () => {
        expect(toTitleCase('hello world')).toBe('Hello World');
        expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
    });

    it('debe truncar texto', () => {
        expect(truncate('Hello World', 5)).toBe('Hello...');
        expect(truncate('Hi', 10)).toBe('Hi');
    });
});

describe('Formateadores de Tamaño de Archivo', () => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    it('debe formatear tamaños de archivo', () => {
        expect(formatFileSize(0)).toBe('0 Bytes');
        expect(formatFileSize(1024)).toBe('1 KB');
        expect(formatFileSize(1048576)).toBe('1 MB');
    });
});

describe('Formateadores de Teléfono', () => {
    const formatPhone = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    it('debe formatear números de teléfono', () => {
        expect(formatPhone('1234567890')).toBe('(123) 456-7890');
        expect(formatPhone('123')).toBe('123');
    });
});

describe('Formateadores de Tiempo', () => {
    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        return `${secs}s`;
    };

    it('debe formatear duración', () => {
        expect(formatDuration(30)).toBe('30s');
        expect(formatDuration(90)).toBe('1m 30s');
        expect(formatDuration(3661)).toBe('1h 1m 1s');
    });
});

describe('Formateadores de Nombre', () => {
    const formatFullName = (firstName: string, lastName: string): string => {
        return `${firstName} ${lastName}`;
    };

    const formatInitials = (firstName: string, lastName: string): string => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    it('debe formatear nombre completo', () => {
        expect(formatFullName('John', 'Doe')).toBe('John Doe');
    });

    it('debe formatear iniciales', () => {
        expect(formatInitials('John', 'Doe')).toBe('JD');
        expect(formatInitials('jane', 'smith')).toBe('JS');
    });
});
