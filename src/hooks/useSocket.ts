import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export const useSocket = (events: { [event: string]: (data: any) => void }, userId?: number) => {
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef(events);

  // Actualizar la referencia de eventos sin causar re-renders
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Obtener userId de sessionStorage si no se proporciona
  const getUserId = () => {
    if (userId) return userId;
    
    try {
      const authData = sessionStorage.getItem('auth_data');
      if (authData) {
        const userData = JSON.parse(authData);
        return userData.id_usuario;
      }
    } catch (error) {
      console.error('Error obteniendo userId de sessionStorage:', error);
    }
    return null;
  };

  useEffect(() => {
    // Solo crear el socket una vez
    if (!socketRef.current) {
      socketRef.current = io(API_BASE, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('🔌 Conectado a WebSocket');

        // Obtener userId y registrar
        const currentUserId = getUserId();
        
        if (currentUserId) {
          socket.emit('register', currentUserId);
          console.log(`👤 Usuario ${currentUserId} registrado en WebSocket`);
        } else {
          console.warn('⚠️ No se pudo obtener userId para registrar en WebSocket');
        }
      });

      socket.on('registered', (data: any) => {
        console.log('✅ Confirmación de registro en WebSocket:', data);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Desconectado de WebSocket');
      });
    }

    // Limpiar listeners anteriores antes de registrar nuevos
    const socket = socketRef.current;
    if (socket) {
      // Remover todos los listeners de eventos personalizados (no los de sistema)
      Object.keys(eventsRef.current).forEach((eventName) => {
        socket.off(eventName);
      });

      // Registrar los nuevos eventos
      Object.keys(events).forEach((eventName) => {
        socket.on(eventName, (data: any) => {
          console.log(`📩 [WebSocket] Evento recibido: ${eventName}`, data);
          // Usar eventsRef.current para obtener siempre el handler más reciente
          if (eventsRef.current[eventName]) {
            eventsRef.current[eventName](data);
          }
        });
      });
    }

    // NO limpiar el socket para mantener la conexión persistente
    return () => {
      // Socket se mantiene conectado entre re-renders
    };
  }, [events]); // Ejecutar cuando cambien los events

  // Re-registrar usuario cuando el userId cambie (ej: después de cargar datos)
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && userId) {
      console.log(`👤 Re-registrando usuario ${userId} en WebSocket`);
      socketRef.current.emit('register', userId);
      console.log(`✅ Usuario ${userId} re-registrado exitosamente`);
    } else {
      if (!socketRef.current) {
        console.log('⚠️ Socket no existe');
      } else if (!socketRef.current.connected) {
        console.log('⚠️ Socket no está conectado');
      } else if (!userId) {
        console.log('⚠️ userId no disponible:', userId);
      }
    }
  }, [userId]);

  return socketRef.current;
};
