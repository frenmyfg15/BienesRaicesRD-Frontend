// app/comprador/catalogo/components/FiltroPanel.tsx
'use client';

import React from 'react';
import { X, MapPin } from 'lucide-react';

interface Props {
  tipoSeleccionado: string | null;
  setTipoSeleccionado: (value: string | null) => void;
  habitacionesSeleccionadas: number | null;
  setHabitacionesSeleccionadas: (value: number | null) => void;
  bañosSeleccionados: number | null;
  setBañosSeleccionados: (value: number | null) => void;
  precioMin: string;
  setPrecioMin: (value: string) => void;
  precioMax: string;
  setPrecioMax: (value: string) => void;
  ubicacionFiltro: string;
  setUbicacionFiltro: (value: string) => void;
  limpiarTodosLosFiltros: () => void;
  cerrarFiltro: () => void;
}

const FiltroPanel: React.FC<Props> = ({
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
}) => {
  const opcionesTipo = ['Casa', 'Apartamento', 'Local Comercial', 'Solar', 'Villa', 'Proyecto'];
  const opcionesHabitaciones = [1, 2, 3, 4, 5];
  const opcionesBaños = [1, 2, 3];

  return (
    <div className="flex flex-col gap-3 p-6 w-full sm:w-64 bg-white shadow-lg rounded-xl md:h-auto overflow-y-auto">
      {/* Encabezado móvil */}
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
          type="text"
          value={ubicacionFiltro}
          onChange={(e) => setUbicacionFiltro(e.target.value)}
          placeholder="Ej: Santo Domingo"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino text-sm"
        />
      </div>

      {/* Tipo */}
      <h3 className="text-md font-semibold text-grafito mt-4 mb-2 border-b pb-2">Tipo</h3>
      <button
        onClick={() => {
          setTipoSeleccionado(null);
          if (window.innerWidth < 768) cerrarFiltro();
        }}
        className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
          tipoSeleccionado === null ? 'bg-azul-marino text-white' : 'text-grafito hover:bg-gray-100'
        }`}
      >
        Todo
      </button>
      {opcionesTipo.map((tipo) => (
        <button
          key={tipo}
          onClick={() => {
            setTipoSeleccionado(tipo === tipoSeleccionado ? null : tipo);
            if (window.innerWidth < 768) cerrarFiltro();
          }}
          className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
            tipoSeleccionado === tipo ? 'bg-azul-marino text-white' : 'text-grafito hover:bg-gray-100'
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
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            habitacionesSeleccionadas === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
          }`}
        >
          Todas
        </button>
        {opcionesHabitaciones.map((num) => (
          <button
            key={num}
            onClick={() => setHabitacionesSeleccionadas(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              habitacionesSeleccionadas === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
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
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            bañosSeleccionados === null ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {opcionesBaños.map((num) => (
          <button
            key={num}
            onClick={() => setBañosSeleccionados(num)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              bañosSeleccionados === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
            }`}
          >
            {num}+
          </button>
        ))}
      </div>

      {/* Limpiar filtros */}
      <button onClick={limpiarTodosLosFiltros} className="mt-6 text-sm text-red-600 hover:underline">
        Limpiar todos los filtros
      </button>
    </div>
  );
};

export default FiltroPanel;
