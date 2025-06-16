// src/context/AuthContext.tsx
'use client'; 

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
// Asegúrate de que 'me' aquí tenga un tipo de retorno claro si es posible
import { me, loginUsuarios, loginWithGoogle, logout as apiLogout } from '@/lib/api'; 
import { CredentialResponse } from '@react-oauth/google'; 
import toast from 'react-hot-toast'; 

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  // Añade aquí cualquier otra propiedad que tu API devuelva para el usuario
}

// **NUEVA INTERFAZ**: Define la estructura esperada de la respuesta de la API para `me()`
interface MeResponse {
  usuario: User;
  mensaje: string; // Si tu backend envía un mensaje, inclúyelo
  // ... cualquier otra cosa que `me()` devuelva en `res.data`
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

  // **MODIFICACIÓN A loadUser**: Tipado explícito de `data` y dependencias de `useCallback`
  const loadUser = useCallback(async () => {
    console.log("AuthContext: Iniciando loadUser(). isLoading = true.");
    setIsLoading(true);
    try {
      // **Tipado explícito para la respuesta de `me()`**
      const data: MeResponse | null = await me(); 

      if (data && data.usuario) {
        setUser(data.usuario);
        setIsAuthenticated(true);
        console.log("AuthContext: Usuario cargado exitosamente:", data.usuario);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log("AuthContext: No se pudo cargar el usuario (data o data.usuario es null/undefined).");
      }
    } catch (error: any) {
      console.error("AuthContext: Error al cargar el usuario en me() API:", error.response?.data?.error || error.message);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log("AuthContext: loadUser() finalizado. isLoading = false.");
      // **Dependencias en useCallback**: Añade `isAuthenticated` y `user` para que TypeScript entienda que se usan aquí
      // Aunque en tiempo de ejecución React los "clausura", para TypeScript puede ayudar a la inferencia.
      // Sin embargo, si estos estados no cambian la lógica del callback, mantener `[]` es idiomático.
      // Si el error persiste, una prueba sería incluir `isAuthenticated` y `user` aquí.
      // Por ahora, lo dejaremos como está, pero tenlo en mente si el error vuelve con una estructura similar.
      console.log("AuthContext: Estado final de autenticación - isAuthenticated:", isAuthenticated, "user:", user);
    }
  }, []); // Mantener dependencias vacías para este `useCallback` es correcto para su propósito de carga inicial.

  useEffect(() => {
    console.log("AuthContext: useEffect disparado al montar/recargar.");
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUsuarios({ email, password });
      setUser(response.usuario);
      setIsAuthenticated(true);
      toast.success(response.mensaje);
      console.log("AuthContext: Login manual exitoso.");
    } catch (error: any) {
      console.error("AuthContext: Error al iniciar sesión manual:", error);
      const errorMessage = error.response?.data?.error || 'Credenciales inválidas.';
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
      toast.success(response.mensaje);
      console.log("AuthContext: Login con Google exitoso.");
    } catch (error: any) {
      console.error("AuthContext: Error al iniciar sesión con Google:", error);
      const errorMessage = error.response?.data?.error || 'Error al iniciar sesión con Google.';
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
      toast.success('Sesión cerrada correctamente.');
      console.log("AuthContext: Sesión cerrada.");
    } catch (error) {
      console.error("AuthContext: Error al cerrar sesión:", error);
      toast.error('Error al cerrar sesión.');
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