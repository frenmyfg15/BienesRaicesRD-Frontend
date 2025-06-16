// app/comprador/catalogo/page.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation'; // Importa useRouter
import {
  getProyectos,
  getPublicProperties,
  ProyectoResponse,
  PropiedadResponse,
  toggleFavorite, // Importa la función para alternar favoritos
  getFavorites,   // Importa la función para obtener favoritos
} from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Bed, Bath, X, SlidersHorizontal, MapPin, Ruler, CarFront } from 'lucide-react';
import { useAuth } from '@/context/AuthContext'; // Importa useAuth para verificar la sesión

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Inicializa useRouter
  const { user, isAuthenticated, isLoading: authLoading } = useAuth(); // Obtiene el estado de autenticación

  const [proyectos, setProyectos] = useState<ProyectoResponse[]>([]);
  const [propiedades, setPropiedades] = useState<PropiedadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Nuevo estado para los IDs de los favoritos del usuario
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set()); // Usamos Set<string> para IDs como 'propiedad_1', 'proyecto_5'

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

  // Función para cargar los datos del catálogo (proyectos y propiedades)
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

  // Función para cargar los favoritos del usuario
  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUserFavorites(new Set()); // Limpiar favoritos si no hay usuario autenticado
      return;
    }
    try {
      const { favoritos: fetchedFavorites } = await getFavorites();
      const newFavoritesSet = new Set<string>();
      fetchedFavorites.forEach(fav => {
        // Usar un formato consistente para la clave: "tipo_id"
        newFavoritesSet.add(`${fav.type}_${fav.item.id}`);
      });
      setUserFavorites(newFavoritesSet);
    } catch (err) {
      console.error('Error al cargar favoritos del usuario:', err);
      // No mostramos un toast de error aquí para no ser intrusivos en la carga inicial
    }
  }, [isAuthenticated, user]);

  // Efecto para cargar datos del catálogo y favoritos al inicio
  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  // Efecto para cargar favoritos cuando el estado de autenticación termina de cargar
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

  // Función actualizada para alternar favoritos
  const handleToggleFavorite = async (e: React.MouseEvent, itemId: number, itemType: 'propiedad' | 'proyecto') => {
    e.preventDefault(); // Previene la navegación
    e.stopPropagation(); // Detiene la propagación del evento para no activar el Link

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      router.push('/auth/login?redirect=/comprador/catalogo'); // Redirige y mantiene la URL actual para después
      return;
    }

    const key = `${itemType}_${itemId}`;
    const isCurrentlyFavorited = userFavorites.has(key);

    // Optimistic UI update: Actualiza la UI antes de la respuesta del servidor
    const prevUserFavorites = new Set(userFavorites);
    if (isCurrentlyFavorited) {
      userFavorites.delete(key);
    } else {
      userFavorites.add(key);
    }
    setUserFavorites(new Set(userFavorites)); // Crear nueva instancia para forzar re-render

    try {
      const response = await toggleFavorite(itemId, itemType);
      if (response.favorited) {
        toast.success(`${itemType === 'propiedad' ? 'Propiedad' : 'Proyecto'} añadido a favoritos.`);
      } else {
        toast.success(`${itemType === 'propiedad' ? 'Propiedad' : 'Proyecto'} eliminado de favoritos.`);
      }
      // No es necesario volver a llamar fetchUserFavorites si la actualización optimista es suficiente,
      // pero si quieres asegurar la consistencia, puedes descomentar la línea de abajo.
      // fetchUserFavorites(); 
    } catch (err: any) {
      // Revertir UI si hay un error
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
        <button onClick={cerrarFiltro} className="text-grafito hover:text-red-600 transition">
          <X size={20} />
        </button>
      </div>

      {/* Ubicación */}
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
        />
      </div>


      {/* Tipo de Inmueble/Proyecto */}
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
        >
          {tipo}
        </button>
      ))}

      {/* Precio */}
      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Precio</h3>
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Mínimo"
          value={precioMin}
          onChange={(e) => setPrecioMin(e.target.value)}
          className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-azul-marino focus:border-azul-marino"
        />
        <input
          type="number"
          placeholder="Máximo"
          value={precioMax}
          onChange={(e) => setPrecioMax(e.target.value)}
          className="w-1/2 p-2 border border-gray-300 rounded-md text-sm focus:ring-azul-marino focus:border-azul-marino"
        />
      </div>

      {/* Habitaciones */}
      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Habitaciones</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setHabitacionesSeleccionadas(null)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${habitacionesSeleccionadas === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
            }`}
        >
          Todas
        </button>
        {opcionesHabitaciones.map((num) => (
          <button
            key={num}
            onClick={() => setHabitacionesSeleccionadas(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${habitacionesSeleccionadas === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
              }`}
          >
            {num}+
          </button>
        ))}
      </div>

      {/* Baños */}
      <h3 className="text-md font-semibold text-grafito mt-6 mb-2 border-b pb-2">Baños</h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setBañosSeleccionados(null)}
          className={`px-3 py-2 rounded-md text-sm font-medium ${bañosSeleccionados === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
            }`}
        >
          Todos
        </button>
        {opcionesBaños.map((num) => (
          <button
            key={num}
            onClick={() => setBañosSeleccionados(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${bañosSeleccionados === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
              }`}
          >
            {num}+
          </button>
        ))}
      </div>

      {/* Botón para limpiar todos los filtros */}
      <button
        onClick={limpiarTodosLosFiltros}
        className="mt-6 text-sm text-red-600 hover:underline"
      >
        Limpiar todos los filtros
      </button>
    </div>
  );

  if (loading || authLoading) { // Añade authLoading a la condición de carga
    return (
      <div className="min-h-screen flex items-center justify-center text-grafito p-6">
        <p className="text-xl animate-pulse">Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600 p-6 text-center">
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
      {/* Encabezado y botón filtro en móvil */}
      <div className="md:hidden flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-grafito">Catálogo</h1>
        <button
          onClick={toggleFiltro}
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {/* Filtro absoluto en móviles */}
      {filtroVisible && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
          {FiltroPanel}
        </div>
      )}

      {/* Layout con filtro lateral y contenido */}
      <div className="flex flex-col md:flex-row gap-6 px-6 pb-12">
        {/* Filtro lateral permanente en pantallas grandes */}
        <aside className="hidden md:block md:w-64">
          {FiltroPanel}
        </aside>

        {/* Contenido de tarjetas */}
        <section className="flex-1">
          <h1 className="text-base font-extrabold text-grafito mb-3 drop-shadow-md hidden md:block">Proyectos, casas, apartamentos, solares y más en <span className='text-2xl font-extrabold'>República Dominicana</span></h1>

          {/* Total de resultados */}
          {itemsFiltrados.length > 0 && (
            <p className="text-md font-semibold text-gray-700 mb-4">
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
              {itemsFiltrados.map((item: any, index: any) => {
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
                const parqueos = !isProyecto ? item.parqueos : null; // Nuevo campo
                const itemId = item.id;
                const itemType: 'propiedad' | 'proyecto' = isProyecto ? 'proyecto' : 'propiedad';
                const isFavorited = userFavorites.has(`${itemType}_${itemId}`);

                return (
                  <Link key={index} href={url} className="relative block overflow-hidden rounded-xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* ... Proyecto badge, favoritos ... */}
                    <img src={imagen} alt={`Imagen de ${nombre}`} className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen'; }} />
                    <div className="p-3">
                      <h3 className="text-base font-semibold text-grafito mb-1">{nombre}</h3>
                      <p className="text-xs text-gray-500 mb-1 truncate">{ubicacion}</p>
                      {precio && <p className="text-azul-marino font-bold text-sm mb-1">{precio}</p>}
                      {(habitaciones !== null || baños !== null || metros2 !== null || parqueos !== null) && (
                        <div className="flex items-center text-xs text-gray-600 gap-3 mb-2">
                          {habitaciones !== null && (
                            <span className="flex items-center gap-1">
                              <Bed size={14} /> {habitaciones}
                            </span>
                          )}
                          {baños !== null && (
                            <span className="flex items-center gap-1">
                              <Bath size={14} /> {baños}
                            </span>
                          )}
                          {metros2 !== null && (
                            <span className="flex items-center gap-1">
                              <Ruler size={14} /> {metros2} m²
                            </span>
                          )}
                          {parqueos !== null && parqueos > 0 && (
                            <span className="flex items-center gap-1">
                              <CarFront size={14} /> {parqueos}
                            </span>
                          )}
                        </div>
                      )}
                      {estado && (
                        <span className={`inline-block text-[10px] font-medium rounded-full px-2 py-0.5 mt-1 ${estado === 'En construcción' ? 'bg-orange-100 text-orange-800' : estado === 'Terminado' ? 'bg-green-100 text-green-800' : estado === 'En venta' ? 'bg-green-100 text-green-800' : estado === 'Alquiler' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{estado}</span>
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
