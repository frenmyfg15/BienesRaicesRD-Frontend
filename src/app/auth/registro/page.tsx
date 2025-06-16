'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { registerUsuarios } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { CredentialResponse } from '@react-oauth/google';

const schema = yup.object().shape({
  nombre: yup.string().required('El nombre completo es obligatorio'),
  email: yup.string().email('Correo electrónico inválido').required('El correo electrónico es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  rol: yup.string().oneOf(['COMPRADOR', 'VENDEDOR'], 'Rol inválido').required('El rol es obligatorio'),
  telefono: yup.string().when('rol', {
    is: 'VENDEDOR',
    then: (schema) => schema.required('El teléfono es obligatorio'),
    otherwise: (schema) => schema.notRequired(),
  }),
  whatsapp: yup.string().when('rol', {
    is: 'VENDEDOR',
    then: (schema) => schema.required('El WhatsApp es obligatorio'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function RegistroPage() {
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const { user, isAuthenticated, isLoading, login, loginGoogle } = useAuth();

  const rolSeleccionado = watch('rol');

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push(user.rol === 'VENDEDOR' ? '/vendedor/productos' : '/comprador/catalogo');
    }
  }, [isAuthenticated, isLoading, user, router]);

  const onSubmit = async (data: any) => {
    try {
      await registerUsuarios(data);
      toast.success('Usuario creado exitosamente. Iniciando sesión...');
      await login(data.email, data.password);
    } catch (error: any) {
      console.error('Error en registro manual:', error);
      let msg = 'Error al registrar el usuario.';
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data?.error || error.response.data?.message || msg;
      }
      toast.error(msg);
    }
  };

  const handleGoogleSignInSuccess = async (credentialResponse: CredentialResponse) => {
    setIsGoogleSubmitting(true);
    try {
      await loginGoogle(credentialResponse);
    } catch (error: any) {
      console.error('Google login error:', error);
      let msg = 'Error con Google Sign-In.';
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data?.error || error.response.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleGoogleSignInError = () => {
    toast.error('La autenticación con Google falló o fue cancelada.');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-grafito">Cargando...</div>;
  }

  if (isAuthenticated) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-grafito">Crear Cuenta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Nombre completo</label>
            <input
              {...register('nombre')}
              className="w-full p-3 border rounded-md"
              placeholder="Juan Pérez"
            />
            {errors.nombre && <p className="text-sm text-red-600">{errors.nombre.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Correo electrónico</label>
            <input
              type="email"
              {...register('email')}
              className="w-full p-3 border rounded-md"
              placeholder="correo@ejemplo.com"
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              {...register('password')}
              className="w-full p-3 border rounded-md"
              placeholder="********"
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Rol</label>
            <select {...register('rol')} className="w-full p-3 border rounded-md">
              <option value="">Selecciona un rol</option>
              <option value="COMPRADOR">Comprador</option>
              <option value="VENDEDOR">Vendedor</option>
            </select>
            {errors.rol && <p className="text-sm text-red-600">{errors.rol.message}</p>}
          </div>

          {rolSeleccionado === 'VENDEDOR' && (
            <>
              <div>
                <label className="block text-sm mb-1">Teléfono</label>
                <input
                  type="text"
                  {...register('telefono')}
                  className="w-full p-3 border rounded-md"
                  placeholder="8091234567"
                />
                {errors.telefono && <p className="text-sm text-red-600">{errors.telefono.message}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">WhatsApp</label>
                <input
                  type="text"
                  {...register('whatsapp')}
                  className="w-full p-3 border rounded-md"
                  placeholder="8091234567"
                />
                {errors.whatsapp && <p className="text-sm text-red-600">{errors.whatsapp.message}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-azul-marino text-white py-3 rounded-md hover:bg-opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Separador */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">O</span>
          </div>
        </div>

        {/* Registro con Google */}
        <div className="flex justify-center">
          <GoogleSignInButton
            onSuccess={handleGoogleSignInSuccess}
            onError={handleGoogleSignInError}
            disabled={isGoogleSubmitting}
            text={isGoogleSubmitting ? 'Procesando...' : 'Registrarse con Google'}
          />
        </div>

        <p className="text-center mt-6 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={() => router.push('/auth/login')} className="text-azul-marino font-medium hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </main>
  );
}
