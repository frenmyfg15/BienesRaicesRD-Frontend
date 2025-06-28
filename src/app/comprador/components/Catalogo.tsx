// app/comprador/catalogo/page.tsx
'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useCatalogo } from '../../../hooks/useCatalogo';
import CatalogoGrid from './CatalogoGrid';

export default function Catalogo() {
  const {
    filtroVisible,
    toggleFiltro,
    cerrarFiltro,
    FiltroPanelContent,
    loading,
    error,
    authLoading,
    itemsFiltrados,
    handleToggleFavorite,
    userFavorites
  } = useCatalogo();

  if (loading || authLoading) {
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
      {/* Encabezado móvil */}
      <div className="md:hidden flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-grafito">Catálogo</h1>
        <button
          onClick={toggleFiltro}
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
        >
          <SlidersHorizontal size={16} /> Filtros
        </button>
      </div>

      {/* Filtro móvil */}
      {filtroVisible && (
        <div className="fixed inset-0 bg-white z-50 md:hidden flex flex-col">
          {FiltroPanelContent}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 px-6 pb-12">
        {/* Filtro lateral desktop */}
        <aside className="hidden md:block md:w-64">{FiltroPanelContent}</aside>

        {/* Contenido de resultados */}
        <section className="flex-1">
          <h1 className="text-base font-extrabold text-grafito mb-3 drop-shadow-md hidden md:block">
            Proyectos, casas, apartamentos, solares y más en{' '}
            <span className="text-2xl font-extrabold">República Dominicana</span>
          </h1>

          <CatalogoGrid
            items={itemsFiltrados}
            userFavorites={userFavorites}
            onToggleFavorite={handleToggleFavorite}
          />
        </section>
      </div>
    </main>
  );
}
