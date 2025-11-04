import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAutoRefreshOptions {
  onRefresh: () => Promise<void>;
  delay?: number; // Delay después de operación exitosa (ms)
  showLoading?: boolean; // Mostrar modal de carga
  interval?: number; // Intervalo de auto-refresh automático (ms), 0 = deshabilitado
  dependencies?: any[]; // Dependencias para reiniciar el intervalo
}

interface UseAutoRefreshReturn {
  isRefreshing: boolean;
  showLoadingModal: boolean;
  triggerRefresh: () => Promise<void>;
  handleOperationSuccess: (message?: string) => void;
  handleLoadingComplete: () => Promise<void>;
}

/**
 * Hook personalizado para manejar auto-refresh de datos
 * Elimina la necesidad de Ctrl+R y mantiene datos actualizados
 * 
 * Características:
 * - Auto-refresh con intervalo configurable
 * - Pausa automática cuando la pestaña no está visible (ahorro de recursos)
 * - Refresco inmediato al volver a la pestaña
 * - Limpieza automática de intervalos
 * 
 * @param onRefresh - Función async que refresca los datos
 * @param delay - Delay después de operación exitosa (default: 2000ms)
 * @param showLoading - Mostrar modal de carga (default: true)
 * @param interval - Intervalo de auto-refresh automático en ms (default: 0 = deshabilitado)
 * @param dependencies - Array de dependencias para reiniciar el intervalo
 * 
 * @example
 * useAutoRefresh({
 *   onRefresh: async () => await fetchData(),
 *   interval: 30000, // 30 segundos
 *   dependencies: [filter, page]
 * });
 */
export const useAutoRefresh = ({
  onRefresh,
  delay = 2000,
  showLoading = true,
  interval = 0,
  dependencies = []
}: UseAutoRefreshOptions): UseAutoRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Función para refrescar datos manualmente
  const triggerRefresh = useCallback(async () => {
    if (isRefreshing) return; // Evitar múltiples refreshes simultáneos
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  // Función para manejar operación exitosa
  const handleOperationSuccess = useCallback((message?: string) => {
    if (showLoading) {
      setShowLoadingModal(true);
    } else {
      // Si no se muestra loading, refrescar directamente con delay
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        triggerRefresh();
      }, delay);
    }
  }, [showLoading, delay, triggerRefresh]);

  // Función que se ejecuta cuando el modal de carga termina
  const handleLoadingComplete = useCallback(async () => {
    await triggerRefresh();
    setShowLoadingModal(false);
  }, [triggerRefresh]);

  // Auto-refresh con intervalo + pausa cuando la pestaña no está visible
  useEffect(() => {
    if (interval > 0) {
      // Función para iniciar el intervalo
      const startInterval = () => {
        // Limpiar intervalo anterior si existe
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        // Crear nuevo intervalo
        intervalRef.current = setInterval(async () => {
          // Solo refrescar si la pestaña está visible
          if (!document.hidden && !isRefreshing) {
            setIsRefreshing(true);
            try {
              await onRefresh();
            } catch (error) {
              console.error('Error en auto-refresh:', error);
            } finally {
              // Mantener el modal visible por 2 segundos
              setTimeout(() => {
                setIsRefreshing(false);
              }, 2000);
            }
          }
        }, interval);
      };

      // Función para detener el intervalo
      const stopInterval = () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      // Manejar cambios de visibilidad de la pestaña
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          // Pestaña oculta: pausar auto-refresh
          console.log('⏸️ Auto-refresh pausado (pestaña oculta)');
          stopInterval();
        } else {
          // Pestaña visible: reanudar auto-refresh
          console.log('▶️ Auto-refresh reanudado (pestaña visible)');
          // Refrescar inmediatamente al volver con modal
          if (!isRefreshing) {
            setIsRefreshing(true);
            try {
              await onRefresh();
            } catch (error) {
              console.error('Error en refresh al volver:', error);
            } finally {
              setTimeout(() => {
                setIsRefreshing(false);
              }, 2000);
            }
          }
          // Reiniciar intervalo
          startInterval();
        }
      };

      // Iniciar intervalo
      startInterval();

      // Escuchar cambios de visibilidad
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup al desmontar o cuando cambien las dependencias
      return () => {
        stopInterval();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [interval, onRefresh, ...dependencies]);

  return {
    isRefreshing,
    showLoadingModal,
    triggerRefresh,
    handleOperationSuccess,
    handleLoadingComplete
  };
};
