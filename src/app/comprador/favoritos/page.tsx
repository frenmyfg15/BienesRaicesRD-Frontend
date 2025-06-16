// app/comprador/favoritos/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getFavorites, toggleFavorite } from '@/lib/api'; // Asegúrate de importar FavoriteResponse
import { DollarSign, MapPin, Bed, Bath, Ruler, HeartOff, Building2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatNumberToCurrency } from '@/app/utils/formatNumberToCurrency';

const FavoritosPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar los favoritos
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoadingFavorites(false);
      setError('Debes iniciar sesión para ver tus favoritos.');
      setFavorites([]); // Limpiar favoritos si no hay usuario autenticado
      return;
    }

    setLoadingFavorites(true);
    setError(null);
    try {
      const response = await getFavorites();
      setFavorites(response.favoritos);
    } catch (err: any) {
      console.error('Error al cargar los favoritos:', err);
      setError(err.message || 'Error al cargar tus favoritos. Intenta de nuevo.');
    } finally {
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, user]);

  // Cargar favoritos al montar el componente o cambiar el estado de autenticación
  useEffect(() => {
    if (!authLoading) { // Solo intentar cargar si el estado de autenticación ya ha terminado de cargar
      fetchFavorites();
    }
  }, [authLoading, fetchFavorites]);

  // Función para alternar un favorito (quitarlo de la lista)
  const handleToggleFavorite = async (itemId: number, itemType: 'propiedad' | 'proyecto') => {
    if (!isAuthenticated || !user) {
      toast.error('Debes iniciar sesión para gestionar tus favoritos.');
      return;
    }

    const confirmRemove = window.confirm(`¿Estás seguro de que quieres quitar este ${itemType} de tus favoritos?`);
    if (!confirmRemove) {
        return;
    }

    toast.loading(`Quitando ${itemType} de favoritos...`);
    try {
      await toggleFavorite(itemId, itemType);
      toast.success(`${itemType === 'propiedad' ? 'Propiedad' : 'Proyecto'} eliminado de favoritos.`);
      fetchFavorites(); // Volver a cargar la lista para actualizar la UI
    } catch (err: any) {
      console.error(`Error al quitar ${itemType} de favoritos:`, err);
      toast.error(err.message || `Error al quitar ${itemType} de favoritos.`);
    }
  };

  if (authLoading || loadingFavorites) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-xl text-grafito">Cargando tus favoritos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-grafito mb-6">{error}</p>
          {!isAuthenticated && (
            <Link href="/auth/login" className="bg-azul-marino text-white px-6 py-3 rounded-md hover:bg-indigo-800 transition-colors">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-3xl font-bold text-grafito mb-4">¡Tu lista de favoritos está vacía!</h2>
        <p className="text-lg text-gray-700 mb-8 text-center">
          Explora nuestro catálogo y añade las propiedades o proyectos que más te gusten.
        </p>
        <Link href="/comprador/catalogo" className="bg-azul-marino text-white px-7 py-3 rounded-full font-semibold hover:bg-indigo-800 transition-colors shadow-md">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-grafito mb-10 text-center">
          Mis Favoritos
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div 
              key={fav.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.02]"
            >
              <Link href={fav.type === 'propiedad' ? `/comprador/propiedad/${fav.item.slug}` : `/comprador/proyecto/${fav.item.slug}`}>
                <div className="relative w-full h-48 sm:h-56 bg-gray-200 overflow-hidden">
                  <img
                    src={fav.type === 'propiedad' ? (fav.item as any).imagenes[0]?.url || 'https://placehold.co/600x400/e0e0e0/555555?text=Imagen+No+Disponible' : (fav.item as any).imagenDestacada || 'https://placehold.co/600x400/e0e0e0/555555?text=Imagen+No+Disponible'}
                    alt={`Imagen de ${fav.item.nombre}`}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400/e0e0e0/555555?text=Imagen+No+Disponible'; }}
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold uppercase ${fav.type === 'propiedad' ? 'bg-orange-500 text-white' : 'bg-purple-500 text-white'}`}>
                    {fav.type === 'propiedad' ? 'Propiedad' : 'Proyecto'}
                  </span>
                </div>
              </Link>
              <div className="p-5 flex-grow">
                <Link href={fav.type === 'propiedad' ? `/comprador/propiedad/${fav.item.slug}` : `/comprador/proyecto/${fav.item.slug}`}>
                  <h3 className="text-xl font-bold text-grafito mb-2 hover:text-azul-marino transition-colors line-clamp-2">
                    {fav.item.nombre}
                  </h3>
                </Link>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <MapPin size={16} className="mr-2 text-red-500" />
                  {fav.item.ubicacion}
                </p>
                
                {fav.type === 'propiedad' ? (
                  // Detalles para Propiedad
                  <>
                    <p className="text-xl font-bold text-azul-marino mb-3 flex items-center">
                      <DollarSign size={20} className="mr-2 text-green-600" />
                      {formatNumberToCurrency((fav.item as any).precio)}
                    </p>
                    <div className="flex items-center text-gray-700 text-sm mb-2">
                      {(fav.item as any).habitaciones && (
                        <span className="flex items-center mr-4">
                          <Bed size={16} className="mr-1 text-blue-500" /> {(fav.item as any).habitaciones} Habs
                        </span>
                      )}
                      {(fav.item as any).baños && (
                        <span className="flex items-center mr-4">
                          <Bath size={16} className="mr-1 text-purple-500" /> {(fav.item as any).baños} Baños
                        </span>
                      )}
                      {(fav.item as any).metros2 && (
                        <span className="flex items-center">
                          <Ruler size={16} className="mr-1 text-red-500" /> {(fav.item as any).metros2} m²
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  // Detalles para Proyecto
                  <p className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Building2 size={20} className="mr-2 text-gold-500" />
                    Estado: {(fav.item as any).estado}
                  </p>
                )}
              </div>
              <div className="p-5 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleToggleFavorite(fav.item.id, fav.type)}
                  className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors duration-200"
                >
                  <HeartOff size={16} className="mr-2" />
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default FavoritosPage;
