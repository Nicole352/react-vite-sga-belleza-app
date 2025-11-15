import { toast, ToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';

// Configuración base para todos los toasts
const baseToastConfig: ToastOptions = {
  duration: 3000,
  position: 'bottom-right',
  style: {
    border: 'none',
    padding: '0',
    background: 'transparent',
    boxShadow: 'none',
  },
};

// Función helper para crear el contenido del toast
const createToastContent = (
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' | 'visible' | 'hidden' | 'closed' | 'reopened' | 'deleted',
  darkMode: boolean = true
) => {
  // Configuración de colores e iconos según el tipo
  const config = {
    success: {
      icon: CheckCircle,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.15)',
      bgDark: 'rgba(16, 185, 129, 0.2)',
    },
    error: {
      icon: XCircle,
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      bgDark: 'rgba(239, 68, 68, 0.2)',
    },
    warning: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.15)',
      bgDark: 'rgba(245, 158, 11, 0.2)',
    },
    info: {
      icon: Info,
      color: '#3b82f6',
      bgLight: 'rgba(59, 130, 246, 0.15)',
      bgDark: 'rgba(59, 130, 246, 0.2)',
    },
    visible: {
      icon: Eye,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.15)',
      bgDark: 'rgba(16, 185, 129, 0.2)',
    },
    hidden: {
      icon: EyeOff,
      color: '#6b7280',
      bgLight: 'rgba(107, 114, 128, 0.15)',
      bgDark: 'rgba(107, 114, 128, 0.2)',
    },
    closed: {
      icon: Lock,
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      bgDark: 'rgba(239, 68, 68, 0.2)',
    },
    reopened: {
      icon: Unlock,
      color: '#10b981',
      bgLight: 'rgba(16, 185, 129, 0.15)',
      bgDark: 'rgba(16, 185, 129, 0.2)',
    },
    deleted: {
      icon: Trash2,
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.15)',
      bgDark: 'rgba(239, 68, 68, 0.2)',
    },
  };

  const { icon: Icon, color, bgLight, bgDark } = config[type];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: darkMode
          ? `linear-gradient(135deg, ${bgDark}, ${bgDark.replace('0.2', '0.15')})`
          : `linear-gradient(135deg, ${bgLight}, ${bgLight.replace('0.15', '0.1')})`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '0.75rem',
        minWidth: '280px',
        maxWidth: '400px',
        boxShadow: darkMode
          ? '0 8px 32px rgba(0, 0, 0, 0.4)'
          : '0 8px 32px rgba(0, 0, 0, 0.12)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '50%',
          background: darkMode
            ? `${color}25`
            : `${color}20`,
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={color} strokeWidth={2.5} />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: '0.9375rem',
          fontWeight: '600',
          color: darkMode ? '#fff' : '#1f2937',
          lineHeight: '1.4',
          flex: 1,
        }}
      >
        {message}
      </p>
    </div>
  );
};

// Funciones personalizadas para cada tipo de notificación
export const showToast = {
  success: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'success', darkMode),
      { ...baseToastConfig, duration: 3000 }
    );
  },

  error: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'error', darkMode),
      { ...baseToastConfig, duration: 4000 }
    );
  },

  warning: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'warning', darkMode),
      { ...baseToastConfig, duration: 3500 }
    );
  },

  info: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'info', darkMode),
      { ...baseToastConfig, duration: 3000 }
    );
  },

  visible: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'visible', darkMode),
      { ...baseToastConfig, duration: 2500 }
    );
  },

  hidden: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'hidden', darkMode),
      { ...baseToastConfig, duration: 2500 }
    );
  },

  closed: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'closed', darkMode),
      { ...baseToastConfig, duration: 3000 }
    );
  },

  reopened: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'reopened', darkMode),
      { ...baseToastConfig, duration: 3000 }
    );
  },

  deleted: (message: string, darkMode: boolean = true) => {
    toast.custom(
      () => createToastContent(message, 'deleted', darkMode),
      { ...baseToastConfig, duration: 3000 }
    );
  },
};
