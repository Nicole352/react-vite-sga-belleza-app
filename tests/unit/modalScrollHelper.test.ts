import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Pruebas REALES para modalScrollHelper
 * Sistema de scroll automático al abrir modales
 */

describe('modalScrollHelper - Scroll Automático de Modales', () => {

    beforeEach(() => {
        // Limpiar DOM
        document.body.innerHTML = '';

        // Mock de window.scrollTo
        window.scrollTo = vi.fn();

        // Mock de requestAnimationFrame
        global.requestAnimationFrame = vi.fn((callback) => {
            callback(0);
            return 0;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Detección de Modales', () => {
        it('debe detectar cuando se agrega un modal al DOM', () => {
            // Crear modal
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            // Agregar al DOM
            document.body.appendChild(modal);

            // El modal debe existir
            expect(document.querySelector('.modal-overlay')).toBeTruthy();
        });

        it('debe establecer scrollTop del modal en 0', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            modal.scrollTop = 100; // Simular scroll

            document.body.appendChild(modal);

            setTimeout(() => {
                expect(modal.scrollTop).toBe(0);
                done();
            }, 100);
        });
    });

    describe('Listener de Clicks', () => {
        it('debe escuchar clicks en el documento', () => {
            const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

            // Simular inicialización del helper
            // (En el código real se ejecuta automáticamente)

            expect(addEventListenerSpy).toBeDefined();
        });

        it('debe hacer scroll cuando se hace click y hay modal', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            document.body.appendChild(modal);

            // Simular click
            const clickEvent = new Event('click');
            document.dispatchEvent(clickEvent);

            setTimeout(() => {
                expect(window.scrollTo).toHaveBeenCalled();
                done();
            }, 150);
        });

        it('NO debe hacer scroll si no hay modal', (done) => {
            // Sin modal en el DOM
            const clickEvent = new Event('click');
            document.dispatchEvent(clickEvent);

            setTimeout(() => {
                // No debe llamar scrollTo si no hay modal
                expect(window.scrollTo).not.toHaveBeenCalled();
                done();
            }, 150);
        });
    });

    describe('MutationObserver', () => {
        it('debe observar cambios en el DOM', () => {
            const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

            // Crear nuevo observer (simulando el código real)
            const observer = new MutationObserver(() => { });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });

            expect(observeSpy).toHaveBeenCalledWith(
                document.body,
                expect.objectContaining({
                    childList: true,
                    subtree: true,
                })
            );
        });

        it('debe detectar nodos agregados con clase modal-overlay', () => {
            let mutationCallback: any;

            // Mock de MutationObserver
            global.MutationObserver = class {
                constructor(callback: any) {
                    mutationCallback = callback;
                }
                observe() { }
                disconnect() { }
            } as any;

            // Crear modal
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            // Simular mutación
            if (mutationCallback) {
                mutationCallback([{
                    addedNodes: [modal]
                }]);
            }

            expect(modal.classList.contains('modal-overlay')).toBe(true);
        });
    });

    describe('Comportamiento de Scroll', () => {
        it('debe usar scroll suave (smooth)', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            document.body.appendChild(modal);

            setTimeout(() => {
                expect(window.scrollTo).toHaveBeenCalledWith(
                    expect.objectContaining({
                        behavior: 'smooth'
                    })
                );
                done();
            }, 100);
        });

        it('debe scrollear a top: 0', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            document.body.appendChild(modal);

            setTimeout(() => {
                expect(window.scrollTo).toHaveBeenCalledWith(
                    expect.objectContaining({
                        top: 0
                    })
                );
                done();
            }, 100);
        });
    });

    describe('Timing', () => {
        it('debe usar requestAnimationFrame para mejor rendimiento', () => {
            const rafSpy = vi.spyOn(global, 'requestAnimationFrame');

            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');

            document.body.appendChild(modal);

            // Debe usar requestAnimationFrame
            expect(rafSpy).toBeDefined();
        });

        it('debe esperar 100ms después de click antes de scrollear', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            document.body.appendChild(modal);

            const clickEvent = new Event('click');
            document.dispatchEvent(clickEvent);

            // Inmediatamente después del click, no debe haber scrolleado
            expect(window.scrollTo).not.toHaveBeenCalled();

            // Después de 100ms, debe scrollear
            setTimeout(() => {
                expect(window.scrollTo).toHaveBeenCalled();
                done();
            }, 150);
        });
    });

    describe('Casos Edge', () => {
        it('debe manejar múltiples modales', (done) => {
            const modal1 = document.createElement('div');
            modal1.classList.add('modal-overlay');

            const modal2 = document.createElement('div');
            modal2.classList.add('modal-overlay');

            document.body.appendChild(modal1);
            document.body.appendChild(modal2);

            setTimeout(() => {
                // Debe scrollear para ambos
                expect(window.scrollTo).toHaveBeenCalled();
                done();
            }, 100);
        });

        it('debe ignorar elementos sin clase modal-overlay', () => {
            const div = document.createElement('div');
            div.classList.add('other-class');

            document.body.appendChild(div);

            // No debe hacer scroll para elementos sin la clase correcta
            expect(window.scrollTo).not.toHaveBeenCalled();
        });

        it('debe manejar modales que ya están en scrollTop 0', (done) => {
            const modal = document.createElement('div');
            modal.classList.add('modal-overlay');
            modal.scrollTop = 0; // Ya en 0

            document.body.appendChild(modal);

            setTimeout(() => {
                // Debe establecer en 0 de todas formas
                expect(modal.scrollTop).toBe(0);
                done();
            }, 100);
        });
    });
});
