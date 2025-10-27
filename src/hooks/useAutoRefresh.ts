import { useState, useCallback, useRef } from 'react';

interface UseAutoRefreshOptions {
  onRefresh: () => Promise<void>;
  delay?: number; // Delay después de operación exitosa (ms)
  showLoading?: boolean; // Mostrar modal de carga
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
 */
export const useAutoRefresh = ({
  onRefresh,
  delay = 2000,
  showLoading = true
}: UseAutoRefreshOptions): UseAutoRefreshReturn => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  return {
    isRefreshing,
    showLoadingModal,
    triggerRefresh,
    handleOperationSuccess,
    handleLoadingComplete
  };
};
