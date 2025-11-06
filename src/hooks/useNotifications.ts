import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export interface Notificacion {
  id: string;
  tipo: 'modulo' | 'tarea' | 'pago' | 'calificacion' | 'matricula' | 'general';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  link?: string;
  data?: any;
}

type RolUsuario = 'admin' | 'docente' | 'estudiante';

export const useNotifications = (rol: RolUsuario) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    // Cargar notificaciones del localStorage al iniciar
    const saved = localStorage.getItem(`notificaciones_${rol}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          fecha: new Date(n.fecha)
        }));
      } catch (error) {
        console.error('Error parsing saved notifications:', error);
        return [];
      }
    }
    return [];
  });

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(`notificaciones_${rol}`, JSON.stringify(notificaciones));
  }, [notificaciones, rol]);

  const agregarNotificacion = useCallback((notif: Omit<Notificacion, 'id' | 'leida' | 'fecha'>) => {
    const nueva: Notificacion = {
      ...notif,
      id: `${Date.now()}-${Math.random()}`,
      leida: false,
      fecha: new Date()
    };

    setNotificaciones(prev => [nueva, ...prev].slice(0, 50)); // Mantener máximo 50 notificaciones

    // Mostrar notificación del navegador si tiene permisos
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.titulo, {
        body: notif.mensaje,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  const marcarComoLeida = useCallback((id: string) => {
    setNotificaciones(prev =>
      prev.map(n => (n.id === id ? { ...n, leida: true } : n))
    );
  }, []);

  // Solicitar permisos de notificaciones del navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Configurar eventos de WebSocket según el rol
  const events: { [key: string]: (data: any) => void } = {};

  if (rol === 'admin') {
    // Eventos para admin
    events.nueva_solicitud = (data: any) => {
      agregarNotificacion({
        tipo: 'matricula',
        titulo: 'Nueva solicitud de matrícula',
        mensaje: `${data.nombre_solicitante} ${data.apellido_solicitante} ha enviado una solicitud`,
        link: '/admin/matriculas',
        data
      });
    };
  } else if (rol === 'docente') {
    // Eventos para docente
    events.tarea_entregada = (data: any) => {
      agregarNotificacion({
        tipo: 'tarea',
        titulo: 'Nueva tarea entregada',
        mensaje: `${data.estudiante_nombre} ha entregado la tarea "${data.tarea_titulo}"`,
        link: `/docente/tareas/${data.id_tarea}`,
        data
      });
    };
  } else if (rol === 'estudiante') {
    // Eventos para estudiante
    
    // 1. Nuevo módulo creado por docente
    events.nuevo_modulo = (data: any) => {
      agregarNotificacion({
        tipo: 'modulo',
        titulo: '📚 Nuevo módulo disponible',
        mensaje: `El docente ha agregado el módulo "${data.nombre_modulo}" en ${data.curso_nombre}`,
        link: `/estudiante/curso/${data.id_curso}`,
        data
      });
    };

    // 2. Nueva tarea asignada
    events.nueva_tarea = (data: any) => {
      agregarNotificacion({
        tipo: 'tarea',
        titulo: '📝 Nueva tarea asignada',
        mensaje: `Tienes una nueva tarea: "${data.titulo_tarea}" - Vence: ${new Date(data.fecha_entrega).toLocaleDateString('es-ES')}`,
        link: `/estudiante/curso/${data.id_curso}`,
        data
      });
    };

    // 3. Pago verificado por admin
    events.pago_verificado_estudiante = (data: any) => {
      agregarNotificacion({
        tipo: 'pago',
        titulo: '✅ Pago verificado',
        mensaje: `Tu pago de la cuota #${data.numero_cuota} ha sido verificado exitosamente`,
        link: '/estudiante/servicios',
        data
      });
    };

    // Fallback para evento broadcast
    events.pago_verificado = (data: any) => {
      // Solo si coincide con el usuario actual
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (data.id_estudiante === payload.id_usuario) {
            agregarNotificacion({
              tipo: 'pago',
              titulo: '✅ Pago verificado',
              mensaje: `Tu pago de la cuota #${data.numero_cuota} ha sido verificado exitosamente`,
              link: '/estudiante/servicios',
              data
            });
          }
        } catch (error) {
          console.error('Error decodificando token:', error);
        }
      }
    };

    // 4. Tarea calificada por docente
    events.tarea_calificada = (data: any) => {
      agregarNotificacion({
        tipo: 'calificacion',
        titulo: '⭐ Tarea calificada',
        mensaje: `Tu tarea "${data.tarea_titulo}" ha sido calificada: ${data.nota}/20`,
        link: `/estudiante/curso/${data.id_curso}`,
        data
      });
    };

    // 5. Módulo actualizado
    events.modulo_actualizado = (data: any) => {
      agregarNotificacion({
        tipo: 'modulo',
        titulo: '🔄 Módulo actualizado',
        mensaje: `El módulo "${data.nombre_modulo}" ha sido actualizado en ${data.curso_nombre}`,
        link: `/estudiante/curso/${data.id_curso}`,
        data
      });
    };
  }

  // Obtener userId del token
  const [userId, setUserId] = useState<number | undefined>(undefined);
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserId(payload.id_usuario);
      } catch (error) {
        console.error('Error decodificando token:', error);
      }
    }
  }, []);

  // Usar el hook useSocket con los eventos configurados
  useSocket(events, userId);

  return {
    notificaciones,
    agregarNotificacion,
    limpiarNotificaciones,
    marcarComoLeida
  };
};
