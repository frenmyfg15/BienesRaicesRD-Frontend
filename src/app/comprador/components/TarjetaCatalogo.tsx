// app/comprador/catalogo/components/TarjetaCatalogo.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Bed, Bath, Ruler, CarFront } from 'lucide-react';

interface Props {
  item: any;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: number, type: 'propiedad' | 'proyecto') => void;
}

const TarjetaCatalogo: React.FC<Props> = ({ item, isFavorited, onToggleFavorite }) => {
  const isProyecto = item.tipoInterno === 'proyecto';
  const url = isProyecto ? `/comprador/proyecto/${item.slug}` : `/comprador/propiedad/${item.slug}`;
  const imagen = isProyecto
    ? item.imagenDestacada
    : item.imagenes?.[0]?.url || 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';

  return (
    <Link
      href={url}
      className="relative block overflow-hidden rounded-xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Botón favoritos */}
      <button
        onClick={(e) => onToggleFavorite(e, item.id, isProyecto ? 'proyecto' : 'propiedad')}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all duration-200
          ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}
        `}
        aria-label={isFavorited ? 'Eliminar de favoritos' : 'Añadir a favoritos'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      {isProyecto && (
        <span className="absolute top-3 left-3 bg-azul-oscuro text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
          Proyecto
        </span>
      )}

      <img
        src={imagen}
        alt={`Imagen de ${item.nombre}`}
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';
        }}
      />

      <div className="p-3">
        <h3 className="text-base font-semibold text-grafito mb-1">{item.nombre}</h3>
        <p className="text-xs text-gray-500 mb-1 truncate">{item.ubicacion}</p>
        {item.displayPrecio && (
          <p className="text-azul-marino font-bold text-sm mb-1">{item.displayPrecio}</p>
        )}

        {/* Detalles adicionales */}
        {!isProyecto && (
          <div className="flex items-center text-xs text-gray-600 gap-3 mb-2">
            {item.habitaciones !== null && (
              <span className="flex items-center gap-1">
                <Bed size={14} /> {item.habitaciones}
              </span>
            )}
            {item.baños !== null && (
              <span className="flex items-center gap-1">
                <Bath size={14} /> {item.baños}
              </span>
            )}
            {item.metros2 !== null && (
              <span className="flex items-center gap-1">
                <Ruler size={14} /> {item.metros2} m²
              </span>
            )}
            {item.parqueos !== null && item.parqueos > 0 && (
              <span className="flex items-center gap-1">
                <CarFront size={14} /> {item.parqueos}
              </span>
            )}
          </div>
        )}

        {item.estado && (
          <span
            className={`inline-block text-[10px] font-medium rounded-full px-2 py-0.5 mt-1 ${
              item.estado === 'En construcción'
                ? 'bg-orange-100 text-orange-800'
                : item.estado === 'Terminado'
                ? 'bg-green-100 text-green-800'
                : item.estado === 'En venta'
                ? 'bg-green-100 text-green-800'
                : item.estado === 'Alquiler'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {item.estado}
          </span>
        )}
      </div>
    </Link>
  );
};

export default TarjetaCatalogo;
