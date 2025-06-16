'use client';

import { useState, useEffect } from 'react'; // Importar useState y useEffect
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// Ya no importamos loginUsuarios ni loginWithGoogle directamente, ya que vienen del AuthContext
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GoogleSignInButton from '@/components/GoogleSignInButton'; // Importar el componente del botón de Google
import { CredentialResponse } from '@react-oauth/google'; // Importar el tipo de respuesta de Google
import { useAuth } from '@/context/AuthContext'; // ¡Importante! Importar el hook useAuth
import axios from 'axios'; // Importar axios para manejar errores de respuesta del backend

// Esquema de validación para el formulario de inicio de sesión
const schema = yup.object({
  email: yup.string().email('Debe ser un correo electrónico válido').required('El correo electrónico es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
}).required();

export default function LoginPage() {
  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });
  const router = useRouter();

  // Obtener el estado de autenticación y las funciones del AuthContext
  const { user, isAuthenticated, isLoading, login, loginGoogle } = useAuth(); 

  // Estados locales para controlar el envío del formulario manual y de Google,
  // separados del `isLoading` global del contexto
  const [isManualSubmitting, setIsManualSubmitting] = useState(false); 
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false); 

  // Efecto para manejar la redirección cuando el estado de autenticación cambia
  // Esto redirigirá si el usuario ya está autenticado al cargar la página, o después de un login exitoso
  useEffect(() => {
    // Solo redirige si la carga inicial ha terminado y el usuario está autenticado
    if (!isLoading && isAuthenticated && user) {
      if (user.rol === 'VENDEDOR') {
        router.push('/vendedor/productos'); // Redirigir al vendedor al panel de control
      } else {
        router.push('/comprador/catalogo'); // Redirigir al comprador al catálogo o página por defecto
      }
    }
  }, [isAuthenticated, isLoading, user, router]); // Dependencias del efecto

  // --- Manejador para el inicio de sesión manual (email/contraseña) ---
  const onSubmit = async (data: any) => {
    setIsManualSubmitting(true); // Activar el estado de carga local para el formulario manual
    try {
      // Llamar a la función de login del AuthContext.
      // El AuthContext manejará la llamada a tu API de backend y la actualización del estado global.
      await login(data.email, data.password); 
      
      // La redirección ahora es manejada por el `useEffect` de arriba,
      // que se disparará cuando `isAuthenticated` y `user` se actualicen en el contexto.
      
    } catch (error: any) {
      console.error("Error en inicio de sesión manual:", error);
      let errorMessage = 'Error al iniciar sesión. Por favor, verifica tu correo y contraseña.';
      // Si el error es de Axios y contiene una respuesta del backend, usa el mensaje de error específico
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage); // Mostrar un toast con el mensaje de error
    } finally {
      setIsManualSubmitting(false); // Desactivar el estado de carga local
    }
  };

  // --- Manejador para el inicio de sesión con Google ---
  const handleGoogleSignInSuccess = async (credentialResponse: CredentialResponse) => {
    setIsGoogleSubmitting(true); // Activar el estado de carga local para el botón de Google
    try {
      // Llamar a la función de loginGoogle del AuthContext.
      // Esta función se encarga de enviar el ID Token de Google a tu backend.
      await loginGoogle(credentialResponse); 
      
      // La redirección también es manejada por el `useEffect` de arriba.
      
    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error);
      let errorMessage = 'Error al iniciar sesión con Google. Por favor, intenta de nuevo.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (typeof error === 'string') {
        // En caso de que el error sea una cadena simple (menos común con Axios)
        errorMessage = error;
      }
      toast.error(errorMessage); // Mostrar un toast con el mensaje de error
    } finally {
      setIsGoogleSubmitting(false); // Desactivar el estado de carga local
    }
  };

  // Manejador para errores en el flujo de Google (ej. el usuario cancela la autenticación)
  const handleGoogleSignInError = () => {
    setIsGoogleSubmitting(false); // Desactivar el estado de carga local
    toast.error('La autenticación con Google fue cancelada o falló. Por favor, intenta de nuevo.');
  };

  // Determinar si los elementos interactivos deben estar deshabilitados.
  // Esto sucede si el formulario manual o el inicio de sesión con Google están en curso,
  // o si la sesión inicial de autenticación aún se está cargando.
  const isDisabled = isManualSubmitting || isGoogleSubmitting || isLoading;

  // Si la sesión inicial aún se está cargando, mostrar una pantalla de carga para evitar "parpadeos".
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-grafito">
        Cargando sesión...
      </div>
    );
  }

  // Si el usuario ya está autenticado, no renderizar el formulario de inicio de sesión.
  // El `useEffect` se encargará de la redirección.
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className='min-h-screen flex flex-col'>
      <div className="flex-grow flex items-center justify-center p-4 bg-neutral-100">
        <div className="bg-white shadow-md rounded-lg p-8 sm:p-10 max-w-md w-full">
          <h1 className="text-3xl font-extrabold text-center text-grafito mb-8">Iniciar Sesión</h1>

          {/* Formulario de Inicio de Sesión Manual */}
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
                className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${errors.email ? 'border-red-500' : 'border-oro-arenoso'
                }`}
                aria-invalid={errors.email ? "true" : "false"}
                disabled={isDisabled} // Deshabilitar el input si hay un proceso en curso
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
                className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${errors.password ? 'border-red-500' : 'border-oro-arenoso'
                }`}
                aria-invalid={errors.password ? "true" : "false"}
                disabled={isDisabled} // Deshabilitar el input si hay un proceso en curso
              />
              {errors.password && (
                <p role="alert" className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isDisabled} // Deshabilitar si el formulario o Google Sign-In están en progreso
              className="w-full bg-azul-marino text-white font-semibold py-3 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isManualSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          {/* Separador visual */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">O</span>
            </div>
          </div>

          {/* Botón de Inicio de Sesión con Google */}
          <div className='flex justify-center'>
            <GoogleSignInButton
              onSuccess={handleGoogleSignInSuccess}
              onError={handleGoogleSignInError}
              className={`my-custom-google-button ${isGoogleSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDisabled} // Deshabilitar si el formulario o Google Sign-In están en progreso
              text={isGoogleSubmitting ? "Iniciando sesión con Google..." : "Iniciar sesión con Google"}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-grafito">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/auth/registro')}
                className="font-medium text-azul-marino hover:underline focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2 rounded-md transition duration-200 ease-in-out"
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
