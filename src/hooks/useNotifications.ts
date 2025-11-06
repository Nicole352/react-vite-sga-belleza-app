import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

export interface Notificacion {
  id: string;
  tipo: "modulo" | "tarea" | "pago" | "calificacion" | "matricula" | "general";
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: Date;
  fechaLeida?: Date;
  link?: string;
  data?: any;
}

type RolUsuario = "admin" | "docente" | "estudiante";

export const useNotifications = (rol: RolUsuario) => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() => {
    const saved = localStorage.getItem(`notificaciones_${rol}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((n: any) => ({
          ...n,
          fecha: new Date(n.fecha),
          fechaLeida: n.fechaLeida ? new Date(n.fechaLeida) : undefined
        }));
      } catch (error) {
        console.error("Error parsing saved notifications:", error);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`notificaciones_${rol}`, JSON.stringify(notificaciones));
  }, [notificaciones, rol]);

  const agregarNotificacion = useCallback(
    (notif: Omit<Notificacion, "id" | "leida" | "fecha">) => {
      const nueva: Notificacion = {
        ...notif,
        id: `${Date.now()}-${Math.random()}`,
        leida: false,
        fecha: new Date()
      };
      setNotificaciones((prev) => [nueva, ...prev].slice(0, 50));
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notif.titulo, {
          body: notif.mensaje,
          icon: "/logo.png"
        });
      }
    },
    []
  );

  const marcarTodasLeidas = useCallback(() => {
    const ahora = new Date();
    setNotificaciones((prev) =>
      prev.map((n) => ({
        ...n,
        leida: true,
        fechaLeida: ahora
      }))
    );
    
    setTimeout(() => {
      setNotificaciones([]);
    }, 2000);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      setNotificaciones((prev) =>
        prev.filter((n) => {
          if (!n.leida) return true;
          
          if (n.fechaLeida) {
            const diffMinutos = (ahora.getTime() - n.fechaLeida.getTime()) / (1000 * 60);
            return diffMinutos < 60;
          }
          
          return true;
        })
      );
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const events: { [key: string]: (data: any) => void } = {};

  if (rol === "admin") {
    events.nueva_solicitud_matricula = (data: any) =>
      agregarNotificacion({
        tipo: "matricula",
        titulo: "📋 Nueva solicitud de matrícula",
        mensaje: `${data.nombre_solicitante} ${data.apellido_solicitante} solicita ${data.curso}`,
        link: "/admin/matriculas",
        data
      });

    events.matriculas_pendientes = (data: any) =>
      agregarNotificacion({
        tipo: "matricula",
        titulo: "⏳ Matrículas pendientes",
        mensaje: data.mensaje,
        link: "/admin/matriculas",
        data
      });

    events.nuevo_pago_pendiente = (data: any) => {
      const curso = data.curso_nombre ? ` - ${data.curso_nombre}` : '';
      agregarNotificacion({
        tipo: "pago",
        titulo: "💰 Nuevo pago pendiente",
        mensaje: `${data.estudiante_nombre}${curso} - Cuota #${data.numero_cuota}`,
        link: "/admin/pagos",
        data
      });
    };
  } else if (rol === "docente") {
    events.tarea_entregada_docente = (data: any) => {
      const curso = data.curso_nombre ? ` - ${data.curso_nombre}` : '';
      agregarNotificacion({
        tipo: "tarea",
        titulo: "📝 Tarea entregada",
        mensaje: `${data.estudiante_nombre} entregó "${data.tarea_titulo}"${curso}`,
        link: `/docente/tareas/${data.id_tarea}`,
        data
      });
    };

    events.tareas_por_calificar = (data: any) =>
      agregarNotificacion({
        tipo: "tarea",
        titulo: "⭐ Tareas por calificar",
        mensaje: data.mensaje,
        link: `/docente/tareas/${data.id_tarea}`,
        data
      });
  } else if (rol === "estudiante") {
    events.nuevo_modulo = (data: any) => {
      const docente = data.docente_nombre ? ` (${data.docente_nombre})` : '';
      agregarNotificacion({
        tipo: "modulo",
        titulo: "📚 Nuevo módulo disponible",
        mensaje: `${data.nombre_modulo} - ${data.curso_nombre}${docente}`,
        link: `/estudiante/cursos/${data.id_curso}`,
        data
      });
    };

    events.nueva_tarea = (data: any) => {
      const fechaEntrega = new Date(data.fecha_entrega);
      const fechaFormateada = fechaEntrega.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const horaFormateada = fechaEntrega.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      });
      
      const curso = data.curso_nombre || 'tu curso';
      const docente = data.docente_nombre ? ` (${data.docente_nombre})` : '';
      
      agregarNotificacion({
        tipo: "tarea",
        titulo: "📝 Nueva tarea asignada",
        mensaje: `${data.titulo_tarea} - ${curso}${docente} - Fecha límite: ${fechaFormateada} a las ${horaFormateada}`,
        link: "/estudiante/tareas",
        data
      });
    };

    events.tarea_calificada = (data: any) => {
      const curso = data.curso_nombre ? ` - ${data.curso_nombre}` : '';
      const docente = data.docente_nombre ? ` (${data.docente_nombre})` : '';
      agregarNotificacion({
        tipo: "calificacion",
        titulo: "⭐ Tarea calificada",
        mensaje: `${data.tarea_titulo}${curso}${docente} - Nota: ${data.nota}`,
        link: "/estudiante/tareas",
        data
      });
    };

    events.pago_verificado_estudiante = (data: any) => {
      const curso = data.curso_nombre ? ` - ${data.curso_nombre}` : '';
      const admin = data.admin_nombre ? ` (verificado por ${data.admin_nombre})` : '';
      agregarNotificacion({
        tipo: "pago",
        titulo: "✅ Pago verificado",
        mensaje: `Cuota #${data.numero_cuota}${curso} - Monto: S/${data.monto}${admin}`,
        link: "/estudiante/pagos",
        data
      });
    };

    events.matricula_aprobada = (data: any) =>
      agregarNotificacion({
        tipo: "matricula",
        titulo: "🎉 Matrícula aprobada",
        mensaje: `¡Bienvenido a ${data.curso_nombre}!`,
        link: "/estudiante/cursos",
        data
      });
  }

  // Conectar socket con los eventos definidos
  useSocket(events);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return {
    notificaciones,
    noLeidas,
    marcarTodasLeidas
  };
};
