import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  estado: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!storedToken) {
        setIsLoading(false);
        return false;
      }

      // Verificar token con el backend
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken);
        setIsLoading(false);
        return true;
      } else {
        // Token inválido, limpiar storage
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        const { token: authToken, user: userData } = data;
        
        // Guardar token en localStorage (persiste después de cerrar navegador)
        localStorage.setItem('auth_token', authToken);
        
        setToken(authToken);
        setUser(userData);
        setIsLoading(false);
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || 'Error en el login' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUser(null);
    setToken(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};