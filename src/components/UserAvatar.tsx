import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  userId: number;
  nombre: string;
  apellido: string;
  size?: number; // Tamaño en rem
  showBorder?: boolean;
  borderColor?: string;
  fallbackColor?: string;
}

const UserAvatar = ({ 
  userId, 
  nombre, 
  apellido, 
  size = 2.5, 
  showBorder = false,
  borderColor = 'rgba(239, 68, 68, 0.3)',
  fallbackColor = 'linear-gradient(135deg, #ef4444, #dc2626)'
}: UserAvatarProps) => {
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener iniciales
  const getInitials = () => {
    const firstInitial = nombre?.charAt(0).toUpperCase() || '';
    const lastInitial = apellido?.charAt(0).toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  // Cargar foto de perfil
  useEffect(() => {
    const loadFoto = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const token = sessionStorage.getItem('auth_token');
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';
        
        const response = await fetch(`${API_BASE}/api/usuarios/${userId}/foto-perfil`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setFotoUrl(url);
        } else {
          setFotoUrl(null);
        }
      } catch (error) {
        setFotoUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadFoto();

    // Cleanup
    return () => {
      if (fotoUrl) {
        URL.revokeObjectURL(fotoUrl);
      }
    };
  }, [userId]);

  return (
    <div
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        borderRadius: '50%',
        background: fotoUrl ? 'transparent' : fallbackColor,
        border: showBorder ? `2px solid ${borderColor}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {loading ? (
        // Skeleton loader
        <div style={{
          width: '100%',
          height: '100%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }} />
      ) : fotoUrl ? (
        // Mostrar foto
        <img
          src={fotoUrl}
          alt={`${nombre} ${apellido}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        // Mostrar iniciales
        <span style={{
          fontSize: `${size * 0.4}rem`,
          fontWeight: '700',
          color: '#fff',
          letterSpacing: '1px'
        }}>
          {getInitials()}
        </span>
      )}
    </div>
  );
};

export default UserAvatar;
