import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple role-based redirect based on localStorage 'auth_user'
const RoleRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('auth_user');
      if (!raw) {
        navigate('/aula-virtual', { replace: true });
        return;
      }
      const user = JSON.parse(raw);
      const rol = (user?.rol || '').toLowerCase();
      // Map roles to panel paths
      const map: Record<string, string> = {
        superadmin: '/panel/superadmin',
        administrativo: '/panel/administrativo',
        docente: '/panel/docente',
        estudiante: '/panel/estudiante'
      };
      const target = map[rol];
      if (target) navigate(target, { replace: true });
      else navigate('/aula-virtual', { replace: true });
    } catch {
      navigate('/aula-virtual', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default RoleRedirect;
