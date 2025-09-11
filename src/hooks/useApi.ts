import { useState, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";


const API_BASE = 'http://localhost:3000/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export const useApi = () => {
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(async <T = any>(
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      
      const { method = 'GET', headers = {}, body } = options;
      
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...headers
        }
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE}${endpoint}`, config);
      
      // Si el token expiró o es inválido, hacer logout
      if (response.status === 401) {
        logout();
        return {
          data: null,
          error: 'Sesión expirada',
          loading: false
        };
      }

      const data = await response.json();

      if (response.ok) {
        return {
          data,
          error: null,
          loading: false
        };
      } else {
        return {
          data: null,
          error: data.error || data.message || 'Error en la petición',
          loading: false
        };
      }
    } catch (error) {
      console.error('Error en API call:', error);
      return {
        data: null,
        error: 'Error de conexión',
        loading: false
      };
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  // Métodos de conveniencia
  const get = useCallback(<T = any>(endpoint: string) => 
    apiCall<T>(endpoint, { method: 'GET' }), [apiCall]);

  const post = useCallback(<T = any>(endpoint: string, body: any) => 
    apiCall<T>(endpoint, { method: 'POST', body }), [apiCall]);

  const put = useCallback(<T = any>(endpoint: string, body: any) => 
    apiCall<T>(endpoint, { method: 'PUT', body }), [apiCall]);

  const del = useCallback(<T = any>(endpoint: string) => 
    apiCall<T>(endpoint, { method: 'DELETE' }), [apiCall]);

  const patch = useCallback(<T = any>(endpoint: string, body: any) => 
    apiCall<T>(endpoint, { method: 'PATCH', body }), [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
    patch,
    loading
  };
};