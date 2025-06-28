'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getProyectos,
  getPublicProperties,
  toggleFavorite,
  getFavorites,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import FiltroPanel from '@/app/comprador/components/FiltroPanel';

export const useCatalogo = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [filtroVisible, setFiltroVisible] = useState(false);

  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(searchParams.get('tipo') || null);
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState<number | null>(
    searchParams.get('habitaciones') ? parseInt(searchParams.get('habitaciones')!) : null
  );
  const [bañosSeleccionados, setBañosSeleccionados] = useState<number | null>(
    searchParams.get('baños') ? parseInt(searchParams.get('baños')!) : null
  );
  const [precioMin, setPrecioMin] = useState<string>(searchParams.get('precioMin') || '');
  const [precioMax, setPrecioMax] = useState<string>(searchParams.get('precioMax') || '');
  const [ubicacionFiltro, setUbicacionFiltro] = useState<string>(searchParams.get('ubicacion') || '');

  const toggleFiltro = () => setFiltroVisible(!filtroVisible);
  const cerrarFiltro = () => setFiltroVisible(false);

  const limpiarTodosLosFiltros = () => {
    setTipoSeleccionado(null);
    setHabitacionesSeleccionadas(null);
    setBañosSeleccionados(null);
    setPrecioMin('');
    setPrecioMax('');
    setUbicacionFiltro('');
  };

  const fetchCatalogData = useCallback(async () => {
    try {
      setLoading(true);
      const { proyectos } = await getProyectos();
      const { propiedades } = await getPublicProperties();
      setProyectos(proyectos);
      setPropiedades(propiedades);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No se pudieron cargar los productos.';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserFavorites = useCallback(async () => {
    if (!isAuthenticated || !user) return setUserFavorites(new Set());
    try {
      const { favoritos } = await getFavorites();
      const setFavs = new Set<string>();
      favoritos.forEach((fav: any) => setFavs.add(`${fav.type}_${fav.item.id}`));
      setUserFavorites(setFavs);
    } catch {
      console.error('Error al cargar favoritos');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  useEffect(() => {
    if (!authLoading) fetchUserFavorites();
  }, [authLoading, fetchUserFavorites]);

  const itemsFiltrados = useMemo(() => {
    let items = [
      ...proyectos.map(p => ({ ...p, tipoInterno: 'proyecto' as const })),
      ...propiedades.map(p => ({ ...p, tipoInterno: 'propiedad' as const })),
    ];

    if (tipoSeleccionado) {
      if (tipoSeleccionado.toLowerCase() === 'proyecto') {
        items = items.filter(item => item.tipoInterno === 'proyecto');
      } else {
        items = items.filter(item =>
          item.tipoInterno === 'propiedad' &&
          item.tipo?.toLowerCase() === tipoSeleccionado.toLowerCase()
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
      items = items.filter(item =>
        item.tipoInterno === 'propiedad' &&
        item.habitaciones >= habitacionesSeleccionadas
      );
    }

    if (bañosSeleccionados !== null) {
      items = items.filter(item =>
        item.tipoInterno === 'propiedad' &&
        item.baños >= bañosSeleccionados
      );
    }

    const minPrice = parseFloat(precioMin);
    if (!isNaN(minPrice)) {
      items = items.filter(item =>
        item.tipoInterno === 'propiedad' &&
        item.precio >= minPrice
      );
    }

    const maxPrice = parseFloat(precioMax);
    if (!isNaN(maxPrice)) {
      items = items.filter(item =>
        item.tipoInterno === 'propiedad' &&
        item.precio <= maxPrice
      );
    }

    return items;
  }, [
    proyectos,
    propiedades,
    tipoSeleccionado,
    habitacionesSeleccionadas,
    bañosSeleccionados,
    precioMin,
    precioMax,
    ubicacionFiltro,
  ]);

  const handleToggleFavorite = async (e: any, itemId: number, itemType: 'proyecto' | 'propiedad') => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos.');
      router.push('/auth/login?redirect=/comprador/catalogo');
      return;
    }

    const key = `${itemType}_${itemId}`;
    const prevFavorites = new Set(userFavorites);
    const isFav = userFavorites.has(key);

    const newSet = new Set(userFavorites);
    isFav ? newSet.delete(key) : newSet.add(key);
    setUserFavorites(newSet);

    try {
      const res = await toggleFavorite(itemId, itemType);
      toast.success(`${itemType === 'proyecto' ? 'Proyecto' : 'Propiedad'} ${res.favorited ? 'añadido' : 'eliminado'} de favoritos.`);
    } catch {
      setUserFavorites(prevFavorites);
      toast.error('Error al actualizar favoritos.');
    }
  };

  return {
    loading,
    error,
    authLoading,
    itemsFiltrados,
    filtroVisible,
    toggleFiltro,
    cerrarFiltro,
    FiltroPanelContent: (
      <FiltroPanel
        {...{
          tipoSeleccionado,
          setTipoSeleccionado,
          habitacionesSeleccionadas,
          setHabitacionesSeleccionadas,
          bañosSeleccionados,
          setBañosSeleccionados,
          precioMin,
          setPrecioMin,
          precioMax,
          setPrecioMax,
          ubicacionFiltro,
          setUbicacionFiltro,
          limpiarTodosLosFiltros,
          cerrarFiltro,
        }}
      />
    ),
    handleToggleFavorite,
    userFavorites,
  };
};
