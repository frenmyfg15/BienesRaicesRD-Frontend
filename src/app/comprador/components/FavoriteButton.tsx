'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getFavorites, toggleFavorite } from '@/lib/api';

interface FavoriteButtonProps {
  itemId: number;
  itemType: 'propiedad' | 'proyecto';
  itemSlug: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, itemType, itemSlug }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const checkFavoriteStatus = useCallback(async () => {
    if (authLoading || !isAuthenticated || !user) {
      setIsFavorited(false);
      setLoadingStatus(false);
      return;
    }

    setLoadingStatus(true);
    try {
      const { favoritos } = await getFavorites();
      const favorited = favoritos.some(
        (fav: any) => fav.item.id === itemId && fav.type === itemType
      );
      setIsFavorited(favorited);
    } catch (error) {
      console.error('Error al obtener el estado de favorito:', error);
      setIsFavorited(false);
      toast.error('No se pudo cargar el estado de favoritos. Intenta recargar la página.');
    } finally {
      setLoadingStatus(false);
    }
  }, [authLoading, isAuthenticated, user, itemId, itemType]);

  useEffect(() => {
    if (!authLoading) {
      checkFavoriteStatus();
    }
  }, [checkFavoriteStatus, authLoading]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (authLoading) {
      toast.success('Verificando tu sesión...');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      const redirectPath = `/comprador/${itemType}/${itemSlug}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }

    setIsFavorited(prev => !prev);
    const previousState = isFavorited;

    try {
      const response = await toggleFavorite(itemId, itemType);
      toast.success(response.mensaje);
      setIsFavorited(response.favorited);
    } catch (error) {
      setIsFavorited(previousState);
      console.error('Error al alternar favorito:', error);
      const err = error as Error;
      toast.error(err.message || 'Error al actualizar favorito. Intenta de nuevo.');
    }
  };

  if (loadingStatus) {
    return (
      <button
        className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg z-10 cursor-not-allowed"
        disabled
        aria-label="Cargando estado de favoritos"
      >
        <Heart size={24} className="text-gray-300 animate-pulse" />
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
        size={24}
        className={`${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-400 fill-transparent'}`}
      />
    </button>
  );
};

export default FavoriteButton;
