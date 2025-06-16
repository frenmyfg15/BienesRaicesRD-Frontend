// src/components/FavoriteButton.tsx
'use client'; // ¡Importante! Este es un Client Component

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react'; // Icono de corazón
import toast from 'react-hot-toast'; // Para notificaciones
import { useRouter } from 'next/navigation'; // Para redirección de Next.js
import { useAuth } from '@/context/AuthContext'; // Tu hook de autenticación
import { getFavorites, toggleFavorite } from '@/lib/api'; // Funciones de API para favoritos

interface FavoriteButtonProps {
  itemId: number;
  itemType: 'propiedad' | 'proyecto';
  itemSlug: string; // Se usa para la redirección después del login
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, itemType, itemSlug }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true); // Para gestionar el estado de carga inicial del botón

  // Función para verificar el estado de favorito del elemento actual al cargar el componente
  const checkFavoriteStatus = async () => {
    // Si el estado de autenticación aún está cargando o el usuario no está autenticado,
    // asumimos no favorito por defecto y desactivamos el estado de carga.
    if (authLoading || !isAuthenticated || !user) { 
      setIsFavorited(false);
      setLoadingStatus(false);
      return;
    }

    setLoadingStatus(true); // Activamos el estado de carga mientras se consulta
    try {
      const { favoritos } = await getFavorites(); // Obtenemos todos los favoritos del usuario
      // Comprobamos si el itemId y itemType actual están en la lista de favoritos
      const favorited = favoritos.some(
        fav => fav.item.id === itemId && fav.type === itemType
      );
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error al obtener el estado de favorito:', error);
      setIsFavorited(false); // Si hay un error al cargar, asumimos que no está en favoritos
      toast.error('No se pudo cargar el estado de favoritos. Intenta recargar la página.');
    } finally {
      setLoadingStatus(false); // Desactivamos el estado de carga al finalizar
    }
  };

  // Efecto para ejecutar la comprobación de estado de favorito cuando cambian las dependencias
  useEffect(() => {
    // Solo se ejecuta si la autenticación ha terminado de cargar
    if (!authLoading) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, authLoading, itemId, itemType, user]); // Dependencias para re-ejecutar el efecto

  // Manejador del clic para alternar el estado de favorito
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Previene la navegación si el botón está dentro de un <Link>
    e.stopPropagation(); // Evita que el evento se propague a elementos padre (ej. el card principal)

    if (authLoading) {
      toast.success('Verificando tu sesión...');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      // Redirige al usuario a la página de login, con un parámetro 'redirect'
      // para que pueda volver a esta misma página después de iniciar sesión.
      const redirectPath = `/comprador/${itemType}/${itemSlug}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    // Actualización optimista de la UI: cambia el estado visual antes de la respuesta del servidor
    setIsFavorited(prev => !prev);
    const previousState = isFavorited; // Guardamos el estado anterior para revertir en caso de error

    try {
      // Llama a tu función de API para alternar el favorito
      const response = await toggleFavorite(itemId, itemType);
      toast.success(response.mensaje);
      // Actualiza el estado del botón basándose en la respuesta real del servidor
      setIsFavorited(response.favorited);
    } catch (error: any) {
      // Si hay un error, revertimos el estado visual del botón
      setIsFavorited(previousState); 
      console.error('Error al alternar favorito:', error);
      const errorMessage = error.message || 'Error al actualizar favorito. Intenta de nuevo.';
      toast.error(errorMessage);
    }
  };

  // Muestra un estado de carga para el botón si aún no sabemos si es favorito
  if (loadingStatus) {
    return (
      <button
        className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg z-10 cursor-not-allowed"
        disabled // Deshabilitamos el botón durante la carga
        aria-label="Cargando estado de favoritos"
      >
        <Heart size={24} className="text-gray-300 animate-pulse" /> {/* Icono gris pulsante */}
      </button>
    );
  }

  return (
    <button
      className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg z-10 hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
      onClick={handleToggleFavorite}
      aria-label={isFavorited ? `Quitar de favoritos` : `Añadir a favoritos`}
    >
      <Heart
        size={24} // Un tamaño adecuado para el botón en la página de detalle
        className={`${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-transparent'}`}
      />
    </button>
  );
};

export default FavoriteButton;
