// app/comprador/catalogo/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Importa el componente Image
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getProyectos,
  getPublicProperties,
  ProyectoResponse,
  PropiedadResponse,
  toggleFavorite,
  getFavorites,
} from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Bed, Bath, X, SlidersHorizontal, MapPin, Ruler, CarFront, Heart } from 'lucide-react'; // Añadido Heart para el icono de favoritos
import { useAuth } from '@/context/AuthContext';

// --- SEO: Metadata estática para la página ---
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Propiedades y Proyectos en República Dominicana - Tu Inmobiliaria',
  description: 'Descubre casas, apartamentos, locales comerciales, solares y villas en venta y alquiler en República Dominicana. Encuentra tu próxima inversión inmobiliaria o el hogar de tus sueños con nuestros filtros avanzados.',
  keywords: ['inmobiliaria', 'propiedades', 'proyectos', 'venta', 'alquiler', 'casa', 'apartamento', 'solar', 'villa', 'República Dominicana'],
  openGraph: {
    title: 'Catálogo de Propiedades y Proyectos en República Dominicana - Tu Inmobiliaria',
    description: 'Descubre casas, apartamentos, locales comerciales, solares y villas en venta y alquiler en República Dominicana.',
    url: 'https://tuinmobiliaria.com/comprador/catalogo', // Reemplaza con tu dominio real
    siteName: 'Tu Inmobiliaria',
    images: [
      {
        url: 'https://tuinmobiliaria.com/images/opengraph-catalogo.jpg', // Imagen para Open Graph
        width: 1200,
        height: 630,
        alt: 'Catálogo de Propiedades en República Dominicana',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo de Propiedades y Proyectos en República Dominicana - Tu Inmobiliaria',
    description: 'Descubre casas, apartamentos, locales comerciales, solares y villas en venta y alquiler en República Dominicana.',
    images: ['https://tuinmobiliaria.com/images/twitter-catalogo.jpg'], // Imagen para Twitter Card
  },
};
// --- Fin Metadata ---

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [propiedades, setPropiedades] = useState<PropiedadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());

  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(
    searchParams.get('tipo') || null
  );
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState<number | null>(
    searchParams.get('habitaciones') ? parseInt(searchParams.get('habitaciones')!) : null
  );
  const [bañosSeleccionados, setBañosSeleccionados] = useState<number | null>(
    searchParams.get('baños') ? parseInt(searchParams.get('baños')!) : null
  );
  const [precioMin, setPrecioMin] = useState<string>(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState<string>(searchParams.get('precioMax') || '');
  const [ubicacionFiltro, setUbicacionFiltro] = useState<string>(searchParams.get('ubicacion') || '');

  const [filtroVisible, setFiltroVisible] = useState(false);

  const toggleFiltro = () => setFiltroVisible(!filtroVisible);
  const cerrarFiltro = () => setFiltroVisible(false);

  const fetchCatalogData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { proyectos: fetchedProyectos } = await getProyectos();
      setProyectos(fetchedProyectos);

      const { propiedades: fetchedPropiedades } = await getPublicProperties();
      setPropiedades(fetchedPropiedades);
    } catch (err: any) {
      let errorMessage =
        'No se pudieron cargar los productos del catálogo. Intenta de nuevo más tarde.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage =
          err.response.data?.error ||
          err.response.data?.message ||
          errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserFavorites(new Set());
      return;
    }
    try {
      const { favoritos: fetchedFavorites } = await getFavorites();
      const newFavoritesSet = new Set<string>();
      fetchedFavorites.forEach(fav => {
        newFavoritesSet.add(`${fav.type}_${fav.item.id}`);
      });
      setUserFavorites(newFavoritesSet);
    } catch (err) {
      console.error('Error al cargar favoritos del usuario:', err);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  useEffect(() => {
    if (!authLoading) {
      fetchUserFavorites();
    }
  }, [authLoading, fetchUserFavorites]);

  const opcionesTipo = ['Casa', 'Apartamento', 'Local Comercial', 'Solar', 'Villa', 'Proyecto'];
  const opcionesHabitaciones = [1, 2, 3, 4, 5];
  const opcionesBaños = [1, 2, 3];

  const itemsFiltrados = useMemo(() => {
    let items = [
      ...proyectos.map((p) => ({ ...p, tipoInterno: 'proyecto' as const, displayPrecio: 'N/A' })),
      ...propiedades.map((p) => ({
        ...p,
        tipoInterno: 'propiedad' as const,
        displayPrecio: `$${p.precio?.toLocaleString('es-DO')}`,
      })),
    ];

    if (tipoSeleccionado) {
      if (tipoSeleccionado.toLowerCase() === 'proyecto') {
        items = items.filter(item => item.tipoInterno === 'proyecto');
      } else {
        items = items.filter((item) =>
          item.tipoInterno === 'propiedad' &&
          (item as PropiedadResponse).tipo?.toLowerCase() === tipoSeleccionado.toLowerCase()
        );
      }
    }

    if (ubicacionFiltro) {
      const ubicacionLower = ubicacionFiltro.toLowerCase();
      items = items.filter(item =>
        item.ubicacion && item.ubicacion.toLowerCase().includes(ubicacionLower)
      );
    }

    if (habitacionesSeleccionadas !== null) {
      items = items.filter((item) =>
        item.tipoInterno === 'propiedad' &&
        (item as PropiedadResponse).habitaciones !== undefined &&
        (item as PropiedadResponse).habitaciones !== null &&
        (item as PropiedadResponse).habitaciones! >= habitacionesSeleccionadas
      );
    }

    if (bañosSeleccionados !== null) {
      items = items.filter((item) =>
        item.tipoInterno === 'propiedad' &&
        (item as PropiedadResponse).baños !== undefined &&
        (item as PropiedadResponse).baños !== null &&
        (item as PropiedadResponse).baños! >= bañosSeleccionados
      );
    }

    const minPrice = parseFloat(precioMin);
    if (!isNaN(minPrice)) {
      items = items.filter((item) =>
        item.tipoInterno === 'propiedad' &&
        (item as PropiedadResponse).precio !== undefined &&
        (item as PropiedadResponse).precio !== null &&
        (item as PropiedadResponse).precio! >= minPrice
      );
    }

    const maxPrice = parseFloat(precioMax);
    if (!isNaN(maxPrice)) {
      items = items.filter((item) =>
        item.tipoInterno === 'propiedad' &&
        (item as PropiedadResponse).precio !== undefined &&
        (item as PropiedadResponse).precio !== null &&
        (item as PropiedadResponse).precio! <= maxPrice
      );
    }

    return items;
  }, [proyectos, propiedades, tipoSeleccionado, habitacionesSeleccionadas, bañosSeleccionados, precioMin, precioMax, ubicacionFiltro]);

  const limpiarTodosLosFiltros = () => {
    setTipoSeleccionado(null);
    setHabitacionesSeleccionadas(null);
    setBañosSeleccionados(null);
    setPrecioMin('');
    setPrecioMax('');
    setUbicacionFiltro('');
  };

  const handleToggleFavorite = async (e: React.MouseEvent, itemId: number, itemType: 'propiedad' | 'proyecto') => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      router.push('/auth/login?redirect=/comprador/catalogo');
      return;
    }

    const key = `${itemType}_${itemId}`;
    const isCurrentlyFavorited = userFavorites.has(key);

    const prevUserFavorites = new Set(userFavorites);
    if (isCurrentlyFavorited) {
      userFavorites.delete(key);
    } else {
      userFavorites.add(key);
    }
    setUserFavorites(new Set(userFavorites));

    try {
      const response = await toggleFavorite(itemId, itemType);
      if (response.favorited) {
        toast.success(`${itemType === 'propiedad' ? 'Propiedad' : 'Proyecto'} añadido a favoritos.`);
      } else {
        toast.success(`${itemType === 'propiedad' ? 'Propiedad' : 'Proyecto'} eliminado de favoritos.`);
      }
    } catch (err: any) {
      setUserFavorites(prevUserFavorites);
      console.error(`Error al alternar favorito para ${itemType} ID ${itemId}:`, err);
      const errorMessage = err.message || 'Error al actualizar favoritos. Intenta de nuevo.';
      toast.error(errorMessage);
    }
  };

  const FiltroPanel = (
    <div className="flex flex-col gap-3 p-6 w-full sm:w-64 bg-white shadow-lg rounded-xl md:h-auto overflow-y-auto">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-semibold text-grafito">Filtros</h2>
        <button onClick={cerrarFiltro} className="text-grafito hover:text-red-600 transition" aria-label="Cerrar filtros">
          <X size={20} />
        </button>
      </div>

      <h3 className="text-md font-semibold text-grafito mt-4 mb-2 border-b pb-2">Ubicación</h3>
      <div className="relative flex items-center">
        <MapPin size={20} className="absolute left-3 text-gray-400" />
        <input
          id="ubicacion-filtro"
          type="text"
          value={ubicacionFiltro}
          onChange={(e) => setUbicacionFiltro(e.target.value)}
          placeholder="Ej: Santo Domingo"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino text-sm"
          aria-label="Filtrar por ubicación"
        />
      </div>

      <h3 className="text-md font-semibold text-grafito mt-4 mb-2 border-b pb-2">Tipo</h3>
      <button
        onClick={() => {
          setTipoSeleccionado(null);
          if (window.innerWidth < 768) cerrarFiltro();
        }}
        className={`text-left px-3 py-2 rounded-md text-sm font-medium ${tipoSeleccionado === null
          ? 'bg-azul-marino text-white'
          : 'text-grafito hover:bg-gray-100'
          }`}
        aria-pressed={tipoSeleccionado === null}
      >
        Todo
      </button>
      {opcionesTipo.map((tipo) => (
        <button
          key={tipo}
          onClick={() => {
            setTipoSeleccionado(tipoSeleccionado === tipo ? null : tipo);
            if (window.innerWidth < 768) cerrarFiltro();
          }}
          className={`text-left px-3 py-2 rounded-md text-sm font-medium ${tipoSeleccionado === tipo
            ? 'bg-azul-marino text-white'
            : 'text-grafito hover:bg-gray-100'
            }`}
          aria-pressed={tipoSeleccionado === tipo}
        >
          {tipo}
        </button>
      ))}

      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Precio</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Mínimo"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
          className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-azul-marino focus:border-azul-marino"
          aria-label="Precio mínimo"
        />
        <input
          type="number"
          placeholder="Máximo"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
          className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-azul-marino focus:border-azul-marino"
          aria-label="Precio máximo"
        />
      </div>

      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Habitaciones</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setHabitacionesSeleccionadas(null)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${habitacionesSeleccionadas === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
            }`}
          aria-pressed={habitacionesSeleccionadas === null}
        >
          Todas
        </button>
        {opcionesHabitaciones.map((num) => (
          <button
            key={num}
            onClick={() => setHabitacionesSeleccionadas(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${habitacionesSeleccionadas === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
              }`}
            aria-pressed={habitacionesSeleccionadas === num}
          >
            {num}+
          </button>
        ))}
      </div>

      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Baños</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setBañosSeleccionados(null)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${bañosSeleccionados === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
            }`}
          aria-pressed={bañosSeleccionados === null}
        >
          Todos
        </button>
        {opcionesBaños.map((num) => (
          <button
            key={num}
            onClick={() => setBañosSeleccionados(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${bañosSeleccionados === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
              }`}
            aria-pressed={bañosSeleccionados === num}
          >
            {num}+
          </button>
        ))}
      </div>

      <button
        onClick={limpiarTodosLosFiltros}
        className="mt-6 text-sm text-red-600 hover:underline"
      >
        Limpiar todos los filtros
      </button>
    </div>
  );

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-grafito p-6" role="status" aria-live="polite">
        <p className="text-xl animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 p-6 text-center" role="alert">
        <p className="text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-azul-marino text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto min-h-screen py-6">
      <div className="md:hidden flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-grafito">Catálogo</h1>
        <button
          onClick={toggleFiltro}
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
          aria-expanded={filtroVisible}
          aria-controls="filtro-panel"
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {filtroVisible && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col" id="filtro-panel" role="dialog" aria-modal="true">
          {FiltroPanel}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 px-6 pb-12">
        <aside className="hidden md:block md:w-64" aria-label="Filtros del catálogo">
          {FiltroPanel}
        </aside>

        <section className="flex-1" aria-labelledby="catalog-heading">
          <h1 id="catalog-heading" className="text-base font-extrabold text-grafito mb-3 drop-shadow-md hidden md:block">
            Proyectos, casas, apartamentos, solares y más en <span className='text-2xl font-extrabold'>República Dominicana</span>
          </h1>

          {itemsFiltrados.length > 0 && (
            <p className="text-md font-semibold text-gray-700 mb-4" aria-live="polite">
              Total de resultados: {itemsFiltrados.length}
            </p>
          )}

          {itemsFiltrados.length === 0 ? (
            <div className="text-center text-gray-700 text-lg py-12 border rounded-xl bg-white shadow-sm">
              <p>No se encontraron resultados para los filtros seleccionados.</p>
              <p className="mt-2">Intenta ajustar tus criterios de búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsFiltrados.map((item: any, index: number) => {
                const isProyecto = item.tipoInterno === 'proyecto';
                const url = isProyecto ? `/comprador/proyecto/${item.slug}` : `/comprador/propiedad/${item.slug}`;
                const nombre = item.nombre;
                const ubicacion = item.ubicacion;
                const imagen = isProyecto ? item.imagenDestacada : item.imagenes?.[0]?.url || 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';
                const estado = item.estado;
                const precio = !isProyecto ? `$${item.precio?.toLocaleString('es-DO')}` : null;
                const habitaciones = !isProyecto ? item.habitaciones : null;
                const baños = !isProyecto ? item.baños : null;
                const metros2 = !isProyecto ? item.metros2 : null;
                const parqueos = !isProyecto ? item.parqueos : null;
                const itemId = item.id;
                const itemType: 'propiedad' | 'proyecto' = isProyecto ? 'proyecto' : 'propiedad';
                const isFavorited = userFavorites.has(`${itemType}_${itemId}`);

                return (
                  <Link key={item.id} href={url} className="relative block overflow-hidden rounded-xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {isProyecto && (
                      <span className="absolute top-2 left-2 bg-azul-marino text-white text-xs font-semibold px-2 py-1 rounded-full z-10">Proyecto</span>
                    )}
                    <button
                      onClick={(e) => handleToggleFavorite(e, itemId, itemType)}
                      className={`absolute top-2 right-2 p-2 rounded-full z-10 transition-colors ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                      aria-label={isFavorited ? `Quitar de favoritos: ${nombre}` : `Añadir a favoritos: ${nombre}`}
                    >
                      <Heart size={18} fill={isFavorited ? 'white' : 'none'} stroke={isFavorited ? 'white' : 'currentColor'} />
                    </button>

                    <Image
                      src={imagen}
                      alt={`Imagen de ${nombre}`}
                      width={800} // Ajusta el tamaño base de la imagen para optimización
                      height={450} // Mantén la proporción 16:9 o ajusta según diseño
                      className="w-full h-40 object-cover"
                      priority={index < 6} // Prioriza las primeras 6 imágenes visibles para LCP
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Define tamaños para srcset
                      onError={(e) => {
                        // Fallback de imagen en caso de error
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';
                      }}
                    />
                    <div className="p-3">
                      <h3 className="text-base font-semibold text-grafito mb-1">{nombre}</h3>
                      <p className="text-xs text-gray-500 mb-1 truncate">{ubicacion}</p>
                      {precio && <p className="text-azul-marino font-bold text-sm mb-1">{precio}</p>}
                      {(habitaciones !== null || baños !== null || metros2 !== null || parqueos !== null) && (
                        <div className="flex items-center text-xs text-gray-600 gap-3 mb-2" aria-label="Características">
                          {habitaciones !== null && (
                            <span className="flex items-center gap-1" aria-label={`${habitaciones} habitaciones`}>
                              <Bed size={14} /> {habitaciones}
                            </span>
                          )}
                          {baños !== null && (
                            <span className="flex items-center gap-1" aria-label={`${baños} baños`}>
                              <Bath size={14} /> {baños}
                            </span>
                          )}
                          {metros2 !== null && (
                            <span className="flex items-center gap-1" aria-label={`${metros2} metros cuadrados`}>
                              <Ruler size={14} /> {metros2} m²
                            </span>
                          )}
                          {parqueos !== null && parqueos > 0 && (
                            <span className="flex items-center gap-1" aria-label={`${parqueos} parqueos`}>
                              <CarFront size={14} /> {parqueos}
                            </span>
                          )}
                        </div>
                      )}
                      {estado && (
                        <span className={`inline-block text-[10px] font-medium rounded-full px-2 py-0.5 mt-1 ${estado === 'En construcción' ? 'bg-orange-100 text-orange-800' : estado === 'Terminado' ? 'bg-green-100 text-green-800' : estado === 'En venta' ? 'bg-green-100 text-green-800' : estado === 'Alquiler' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                          {estado}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}