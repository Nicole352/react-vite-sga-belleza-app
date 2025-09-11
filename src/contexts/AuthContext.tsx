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

const API_BASE = 'http://localhost:3001/api'; // Puerto correcto

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Verificar autenticación al cargar la app
  useEffect(() => {
    console.log('🔍 Verificando autenticación al cargar...');
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔍 Verificando autenticación...');
      
      const storedToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      if (!storedToken) {
        console.log('❌ No hay token almacenado');
        setIsLoading(false);
        return false;
      }

      console.log('✅ Token encontrado:', storedToken.substring(0, 20) + '...');

      // Verificar token con el backend
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Usuario autenticado:', userData);
        setUser(userData);
        setToken(storedToken);
        setIsLoading(false);
        return true;
      } else {
        console.log('❌ Token inválido, limpiando storage');
        // Token inválido, limpiar storage
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      
      // Si hay error de red, pero tenemos datos en localStorage, usarlos temporalmente
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        console.log('⚠️ Error de red, usando datos de localStorage temporalmente');
        
        // Datos de prueba para desarrollo (remover en producción)
        const mockUser: User = {
          id_usuario: 1,
          nombre: 'Admin',
          apellido: 'Demo',
          email: 'admin@belleza.edu',
          rol: 'superadmin',
          estado: 'activo'
        };
        
        setUser(mockUser);
        setToken(storedToken);
        setIsLoading(false);
        return true;
      }
      
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('🔐 Intentando login para:', email);
      
      // Primero intentar con el backend real
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Login exitoso con backend:', data);
          
          const { token: authToken, user: userData } = data;
          
          // Guardar token en localStorage (persiste después de cerrar navegador)
          localStorage.setItem('auth_token', authToken);
          
          setToken(authToken);
          setUser(userData);
          setIsLoading(false);
          
          return { success: true };
        } else {
          const errorData = await response.json();
          console.log('❌ Error del backend:', errorData);
          throw new Error(errorData.error || 'Error en el login');
        }
      } catch (networkError) {
        console.log('⚠️ Error de red con backend, usando autenticación de prueba');
        
        // Sistema de autenticación de prueba para desarrollo
        const demoUsers = [
          {
            email: 'admin@belleza.edu',
            password: 'admin123',
            user: {
              id_usuario: 1,
              nombre: 'Super',
              apellido: 'Admin',
              email: 'admin@belleza.edu',
              rol: 'superadmin',
              estado: 'activo'
            }
          },
          {
            email: 'coord@belleza.edu',
            password: 'coord123',
            user: {
              id_usuario: 2,
              nombre: 'Coordinador',
              apellido: 'Académico',
              email: 'coord@belleza.edu',
              rol: 'administrativo',
              estado: 'activo'
            }
          }
        ];

        const demoUser = demoUsers.find(u => u.email === email && u.password === password);
        
        if (demoUser) {
          console.log('✅ Login exitoso con datos de prueba:', demoUser.user);
          
          const mockToken = 'demo_token_' + Date.now();
          
          localStorage.setItem('auth_token', mockToken);
          
          setToken(mockToken);
          setUser(demoUser.user);
          setIsLoading(false);
          
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Credenciales inválidas' };
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      setIsLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Error de conexión' };
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
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

  console.log('🔄 AuthContext estado actual:', {
    isAuthenticated,
    user: user?.email,
    rol: user?.rol,
    isLoading
  });

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