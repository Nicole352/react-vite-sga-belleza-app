import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useIdle = (timeoutMs: number = 300000) => { // Por defecto 5 minutos
    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Función para realizar el cierre de sesión
    const handleLogout = useCallback(() => {
        const userSession = sessionStorage.getItem('auth_user');

        // Solo cerrar sesión si hay una sesión activa
        if (userSession) {
            sessionStorage.removeItem('auth_user');
            sessionStorage.removeItem('auth_token'); // Asegurar que el token también se elimine

            // Cerrar todas las notificaciones existentes para asegurar que se vea el mensaje de error
            toast.dismiss();

            toast.error('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.', {
                duration: 6000,
                icon: '⏳'
            });

            navigate('/aula-virtual', { replace: true });
        }
    }, [navigate]);

    // Reiniciar temporizador al detectar actividad
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        lastActivityRef.current = Date.now();

        // Solo establecer el temporizador si el usuario ha iniciado sesión
        const isLoggedIn = !!sessionStorage.getItem('auth_user');

        if (isLoggedIn) {
            timerRef.current = setTimeout(handleLogout, timeoutMs);
        }
    }, [handleLogout, timeoutMs]);

    // Configurar escuchas de eventos (listeners)
    useEffect(() => {
        // Solo activar el escucha si no estamos ya en la página de login
        // Asumiendo que /aula-virtual es la página de login
        const isLoginPage = location.pathname === '/aula-virtual' || location.pathname === '/';

        if (isLoginPage) {
            return;
        }

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        // Limitar ligeramente el escucha de eventos para evitar impacto en el rendimiento
        const handleActivity = () => {
            // Limitación simple: no reiniciar si ha pasado menos de 1 segundo desde el último reinicio
            if (Date.now() - lastActivityRef.current > 1000) {
                resetTimer();
            }
        };

        // Inicio inicial
        resetTimer();

        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer, location.pathname]); // Volver a ejecutar si la ruta cambia

    return null;
};
