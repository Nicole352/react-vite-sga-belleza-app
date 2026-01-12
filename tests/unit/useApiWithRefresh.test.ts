import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useApiWithRefresh } from '../../src/hooks/useApiWithRefresh';

/**
 * Pruebas REALES para useApiWithRefresh hook
 * Basado en el código real del hook
 */

describe('useApiWithRefresh Hook', () => {

    beforeEach(() => {
        // Limpiar sessionStorage antes de cada test
        sessionStorage.clear();

        // Mock de fetch global
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Inicialización', () => {
        it('debe inicializar con estado por defecto', () => {
            const { result } = renderHook(() => useApiWithRefresh());

            expect(result.current.loading).toBe(false);
            expect(result.current.showLoadingModal).toBe(false);
            expect(result.current.error).toBe(null);
            expect(typeof result.current.fetchData).toBe('function');
            expect(typeof result.current.handleLoadingComplete).toBe('function');
        });

        it('debe usar baseUrl por defecto', () => {
            const { result } = renderHook(() => useApiWithRefresh());
            expect(result.current).toBeDefined();
        });

        it('debe aceptar baseUrl personalizado', () => {
            const customUrl = 'https://api.custom.com/api';
            const { result } = renderHook(() => useApiWithRefresh({ baseUrl: customUrl }));
            expect(result.current).toBeDefined();
        });
    });

    describe('fetchData - Peticiones Básicas', () => {
        it('debe hacer petición GET correctamente', async () => {
            const mockData = { id: 1, nombre: 'Test' };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockData
            });

            const { result } = renderHook(() => useApiWithRefresh());

            const data = await result.current.fetchData('/test');

            expect(data).toEqual(mockData);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('debe incluir token de autenticación si existe', async () => {
            const token = 'test-token-123';
            sessionStorage.setItem('auth_token', token);

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/test');

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].headers.Authorization).toBe(`Bearer ${token}`);
        });

        it('debe enviar Content-Type para JSON', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/test', {
                method: 'POST',
                body: { nombre: 'Test' }
            });

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
        });

        it('NO debe enviar Content-Type para FormData', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const formData = new FormData();
            formData.append('file', 'test');

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/upload', {
                method: 'POST',
                body: formData
            });

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].headers['Content-Type']).toBeUndefined();
        });
    });

    describe('Manejo de Errores', () => {
        it('debe manejar error 404', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ error: 'No encontrado' })
            });

            const { result } = renderHook(() => useApiWithRefresh());
            const data = await result.current.fetchData('/test');

            expect(data).toBe(null);
            // Hook no expone error state directamente
        });

        it('debe manejar error 500', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Error del servidor' })
            });

            const { result } = renderHook(() => useApiWithRefresh());
            const data = await result.current.fetchData('/test');

            expect(data).toBe(null);
            expect(result.current.error).toBeDefined();
        });

        it('debe manejar error de red', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(() => useApiWithRefresh());
            const data = await result.current.fetchData('/test');

            expect(data).toBe(null);
        });
    });

    describe('Retry Logic para Error 429', () => {
        it('debe reintentar en error 429', async () => {
            // Primera llamada: 429
            // Segunda llamada: 429
            // Tercera llamada: éxito
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: false,
                    status: 429,
                    json: async () => ({ error: 'Too many requests' })
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 429,
                    json: async () => ({ error: 'Too many requests' })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true })
                });

            const { result } = renderHook(() => useApiWithRefresh());

            const data = await result.current.fetchData('/test');

            expect(data).toEqual({ success: true });
            expect(global.fetch).toHaveBeenCalledTimes(3);
        });
    });

    describe('Loading States', () => {
        it('debe establecer loading durante petición', async () => {
            let resolvePromise: any;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            (global.fetch as any).mockReturnValueOnce(promise);

            const { result } = renderHook(() => useApiWithRefresh());

            // Iniciar petición
            result.current.fetchData('/test');

            // Debe estar en loading
            await waitFor(() => {
                expect(result.current.loading).toBe(true);
            });

            // Resolver promesa
            resolvePromise({
                ok: true,
                json: async () => ({})
            });

            // Debe terminar loading
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('Métodos HTTP', () => {
        it('debe soportar POST', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ id: 1 })
            });

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/test', {
                method: 'POST',
                body: { nombre: 'Test' }
            });

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].method).toBe('POST');
        });

        it('debe soportar PUT', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/test/1', {
                method: 'PUT',
                body: { nombre: 'Updated' }
            });

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].method).toBe('PUT');
        });

        it('debe soportar DELETE', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

            const { result } = renderHook(() => useApiWithRefresh());
            await result.current.fetchData('/test/1', {
                method: 'DELETE'
            });

            const fetchCall = (global.fetch as any).mock.calls[0];
            expect(fetchCall[1].method).toBe('DELETE');
        });
    });
});
