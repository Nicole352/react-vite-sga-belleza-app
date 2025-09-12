import { useEffect, useRef } from 'react';

interface RealTimeSyncOptions {
  onCursoUpdate?: (cursoId: number, updates: any) => void;
  onCursoCreate?: (curso: any) => void;
  onCursoDelete?: (cursoId: number) => void;
}

export const useRealTimeSync = (options: RealTimeSyncOptions) => {
  const intervalRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    // Polling cada 2 segundos para detectar cambios
    intervalRef.current = setInterval(async () => {
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/cursos/updates?since=${lastUpdateRef.current}`);
        
        if (response.ok) {
          const updates = await response.json();
          
          updates.forEach((update: any) => {
            switch (update.type) {
              case 'update':
                options.onCursoUpdate?.(update.id_curso, update.data);
                break;
              case 'create':
                options.onCursoCreate?.(update.data);
                break;
              case 'delete':
                options.onCursoDelete?.(update.id_curso);
                break;
            }
          });
          
          lastUpdateRef.current = Date.now();
        }
      } catch (error) {
        // Silenciar errores de red para evitar spam
      }
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options]);

  return {
    forceSync: () => {
      lastUpdateRef.current = 0; // Forzar próxima sincronización
    }
  };
};
