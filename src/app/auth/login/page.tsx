'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

// Esquema de validación
const schema = yup.object({
  email: yup.string().email('Debe ser un correo electrónico válido').required('El correo electrónico es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
}).required();

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register: reg, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, loginGoogle } = useAuth();
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.rol === 'VENDEDOR') {
        router.push('/vendedor/productos');
      } else {
        router.push('/comprador/catalogo');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const onSubmit = async (data: LoginFormInputs) => {
    setIsManualSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Error en inicio de sesión manual:", error);
      let errorMessage = 'Error al iniciar sesión. Por favor, verifica tu correo y contraseña.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsManualSubmitting(false);
    }
  };

  const handleGoogleSignInSuccess = async (credentialResponse: CredentialResponse) => {
    setIsGoogleSubmitting(true);
    try {
      await loginGoogle(credentialResponse);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      let errorMessage = 'Error al iniciar sesión con Google. Por favor, intenta de nuevo.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast.error(errorMessage);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleSignInError = () => {
    setIsGoogleSubmitting(false);
    toast.error('La autenticación con Google fue cancelada o falló. Por favor, intenta de nuevo.');
  };

  const isDisabled = isManualSubmitting || isGoogleSubmitting || isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-grafito">
        Cargando sesión...
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <main className='min-h-screen flex flex-col'>
      <div className="flex-grow flex items-center justify-center p-4 bg-neutral-100">
        <div className="bg-white shadow-md rounded-lg p-8 sm:p-10 max-w-md w-full">
          <h1 className="text-3xl font-extrabold text-center text-grafito mb-8">Iniciar Sesión</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-grafito mb-1">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                {...reg("email")}
                placeholder="tu@ejemplo.com"
                className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso ${errors.email ? 'border-red-500' : 'border-oro-arenoso'}`}
                aria-invalid={errors.email ? "true" : "false"}
                disabled={isDisabled}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-grafito mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                {...reg("password")}
                placeholder="********"
                className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso ${errors.password ? 'border-red-500' : 'border-oro-arenoso'}`}
                aria-invalid={errors.password ? "true" : "false"}
                disabled={isDisabled}
              />
              {errors.password && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full bg-azul-marino text-white font-semibold py-3 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isManualSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">O</span>
            </div>
          </div>

          <div className='flex justify-center'>
            <GoogleSignInButton
              onSuccess={handleGoogleSignInSuccess}
              onError={handleGoogleSignInError}
              className={`my-custom-google-button ${isGoogleSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDisabled}
              text={isGoogleSubmitting ? "Iniciando sesión con Google..." : "Iniciar sesión con Google"}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-grafito">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/auth/registro')}
                className="font-medium text-azul-marino hover:underline focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2 rounded-md"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
