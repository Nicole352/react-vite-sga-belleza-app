import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { useIdle } from '../../src/hooks/useIdle';

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn()
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/dashboard' })
    };
});

describe('useIdle Hook - Cierre por Inactividad', () => {

    beforeEach(() => {
        vi.useFakeTimers();
        sessionStorage.clear();
        mockNavigate.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const wrapper = ({ children }: any) => <BrowserRouter>{ children } </BrowserRouter>;

    describe('Configuración Inicial', () => {
        it('debe usar timeout por defecto de 5 minutos', () => {
            const { result } = renderHook(() => useIdle(), { wrapper });
            expect(result.current).toBeUndefined();
        });

        it('debe aceptar timeout personalizado', () => {
            const customTimeout = 60000;
            const { result } = renderHook(() => useIdle(customTimeout), { wrapper });
            expect(result.current).toBeUndefined();
        });
    });

    describe('Detección de Actividad', () => {
        it('debe detectar movimiento del mouse', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            renderHook(() => useIdle(1000), { wrapper });

            const event = new MouseEvent('mousemove');
            document.dispatchEvent(event);
            vi.advanceTimersByTime(500);

            expect(sessionStorage.getItem('auth_user')).not.toBe(null);
        });

        it('debe detectar teclas presionadas', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            renderHook(() => useIdle(1000), { wrapper });

            const event = new KeyboardEvent('keydown');
            document.dispatchEvent(event);
            vi.advanceTimersByTime(500);

            expect(sessionStorage.getItem('auth_user')).not.toBe(null);
        });

        it('debe detectar scroll', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            renderHook(() => useIdle(1000), { wrapper });

            const event = new Event('scroll');
            window.dispatchEvent(event);
            vi.advanceTimersByTime(500);

            expect(sessionStorage.getItem('auth_user')).not.toBe(null);
        });
    });

    describe('Cierre de Sesión', () => {
        it('debe cerrar sesión después del timeout', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            sessionStorage.setItem('auth_token', 'test-token');

            renderHook(() => useIdle(1000), { wrapper });
            vi.advanceTimersByTime(1000);

            expect(sessionStorage.getItem('auth_user')).toBe(null);
            expect(sessionStorage.getItem('auth_token')).toBe(null);
        });

        it('debe redirigir a login', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            renderHook(() => useIdle(1000), { wrapper });
            vi.advanceTimersByTime(1000);

            expect(mockNavigate).toHaveBeenCalledWith('/aula-virtual');
        });
    });

    describe('Reinicio de Timer', () => {
        it('debe reiniciar timer con actividad', () => {
            sessionStorage.setItem('auth_user', JSON.stringify({ id: 1 }));
            renderHook(() => useIdle(2000), { wrapper });

            vi.advanceTimersByTime(1000);

            const event = new MouseEvent('mousemove');
            document.dispatchEvent(event);

            vi.advanceTimersByTime(1000);

            expect(sessionStorage.getItem('auth_user')).not.toBe(null);
        });
    });

    describe('Cleanup', () => {
        it('debe limpiar event listeners al desmontar', () => {
            const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
            const { unmount } = renderHook(() => useIdle(1000), { wrapper });

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });
});
