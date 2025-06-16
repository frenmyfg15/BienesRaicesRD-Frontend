// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { me, loginUsuarios, loginWithGoogle, logout as apiLogout } from '@/lib/api';
import { CredentialResponse } from '@react-oauth/google';
import toast from 'react-hot-toast';
import axios from 'axios'; // Importar axios para manejar errores específicos

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  // Asegúrate de que esta interfaz incluya todas las propiedades que recibes de tu API para el usuario
}

// Nueva interfaz para la respuesta esperada de `me()`
interface MeResponse {
  usuario: User;
  mensaje?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: (credentialResponse: CredentialResponse) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga inicial

  // Función para guardar el usuario en localStorage
  const saveUserToLocalStorage = (userData: User | null, authStatus: boolean) => {
    if (typeof window !== 'undefined') { // Asegurarse de que estamos en el navegador
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
  };

  const loadUser = useCallback(async () => {
    console.log("AuthContext: Iniciando loadUser().");
    setIsLoading(true);
    try {
      // Intentar cargar desde localStorage primero
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user');
        const storedAuthStatus = localStorage.getItem('isAuthenticated');

        if (storedUser && storedAuthStatus === 'true') {
          // Si hay datos en localStorage, intentamos rehidratar
          const parsedUser: User = JSON.parse(storedUser);
          // Opcional: Podrías llamar a `me()` aquí para validar el token si tu backend lo requiere
          // Sin embargo, si `me()` se usa para verificar sesión basada en cookies,
          // el siguiente bloque `await me()` ya lo hará.
        }
      }

      // Luego, siempre intentar validar la sesión con el backend (para cookies, JWT en headers, etc.)
      const data: MeResponse | null = await me();

      if (data && data.usuario) {
        setUser(data.usuario);
        setIsAuthenticated(true);
        saveUserToLocalStorage(data.usuario, true); // Guardar en localStorage si la sesión es válida
        console.log("AuthContext: Usuario cargado exitosamente del backend:", data.usuario);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        saveUserToLocalStorage(null, false); // Limpiar localStorage si la sesión no es válida
        console.log("AuthContext: No se pudo cargar el usuario (sesión inválida o no existe).");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Si la API devuelve 401, significa no autenticado, lo cual es esperado si la sesión expiró
        console.warn("AuthContext: Sesión expirada o no autorizada (401). Limpiando.");
      } else {
        console.error("AuthContext: Error general al cargar el usuario en me() API:", error);
      }
      setUser(null);
      setIsAuthenticated(false);
      saveUserToLocalStorage(null, false); // Asegurarse de limpiar localStorage en caso de error
    } finally {
      setIsLoading(false);
      console.log("AuthContext: loadUser() finalizado. isLoading = false.");
    }
  }, []); // Dependencias: ninguna, ya que esta función gestiona la carga inicial y la persistencia

  useEffect(() => {
    console.log("AuthContext: useEffect disparado al montar/recargar para cargar usuario.");
    loadUser();
  }, [loadUser]); // Se ejecuta una vez al montar, o si loadUser cambia (no debería cambiar si es useCallback sin dependencias)

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUsuarios({ email, password });
      setUser(response.usuario);
      setIsAuthenticated(true);
      saveUserToLocalStorage(response.usuario, true); // Guardar en localStorage al iniciar sesión
      toast.success(response.mensaje);
      console.log("AuthContext: Login manual exitoso.");
    } catch (error: unknown) { // Usar unknown para mejor tipado
      console.error("AuthContext: Error al iniciar sesión manual:", error);
      const errorMessage = (axios.isAxiosError(error) && error.response?.data?.error) || 'Credenciales inválidas.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      const response = await loginWithGoogle(credentialResponse.credential as string);
      setUser(response.usuario);
      setIsAuthenticated(true);
      saveUserToLocalStorage(response.usuario, true); // Guardar en localStorage al iniciar sesión con Google
      toast.success(response.mensaje);
      console.log("AuthContext: Login con Google exitoso.");
    } catch (error: unknown) { // Usar unknown para mejor tipado
      console.error("AuthContext: Error al iniciar sesión con Google:", error);
      const errorMessage = (axios.isAxiosError(error) && error.response?.data?.error) || 'Error al iniciar sesión con Google.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      setIsAuthenticated(false);
      saveUserToLocalStorage(null, false); // Limpiar localStorage al cerrar sesión
      toast.success('Sesión cerrada correctamente.');
      console.log("AuthContext: Sesión cerrada.");
    } catch (error: unknown) { // Usar unknown para mejor tipado
      console.error("AuthContext: Error al cerrar sesión:", error);
      const errorMessage = (axios.isAxiosError(error) && error.response?.data?.error) || 'Error al cerrar sesión.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};