// app/comprador/catalogo/components/CatalogoGrid.tsx
'use client';

import React from 'react';
import TarjetaCatalogo from './TarjetaCatalogo';

interface Props {
  items: any[];
  userFavorites: Set<string>;
  onToggleFavorite: (e: React.MouseEvent, id: number, type: 'propiedad' | 'proyecto') => void;
}

const CatalogoGrid: React.FC<Props> = ({ items, userFavorites, onToggleFavorite }) => {
  if (items.length === 0) {
    return (
      <div className="text-center text-gray-700 text-lg py-12 border rounded-xl bg-white shadow-sm">
        <p>No se encontraron resultados para los filtros seleccionados.</p>
        <p className="mt-2">Intenta ajustar tus criterios de búsqueda.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-md font-semibold text-gray-700 mb-4">
        Total de resultados: {items.length}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const key = `${item.tipoInterno}_${item.id}`;
          const isFavorited = userFavorites.has(key);
          return (
            <TarjetaCatalogo
              key={key}
              item={item}
              isFavorited={isFavorited}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </div>
    </>
  );
};

export default CatalogoGrid;
