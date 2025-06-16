'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react'; // Iconos para la búsqueda y filtros, MapPin para ubicación

export default function SearchBar() {
  const router = useRouter();

  // Estados para los filtros en la barra de búsqueda
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>(''); // Vacío para "Todo" inicial
  const [habitacionesSeleccionadas, setHabitacionesSeleccionadas] = useState<number | ''>(''); // Vacío para "Todas"
  const [bañosSeleccionados, setBañosSeleccionados] = useState<number | ''>(''); // Vacío para "Todos"
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>(''); // Nuevo estado para la ubicación

  // Opciones de filtros (consistentes con CatalogoPage)
  const opcionesTipo = ['Casa', 'Apartamento', 'Local Comercial', 'Solar', 'Villa', 'Proyecto'];
  const opcionesHabitaciones = [1, 2, 3, 4, 5];
  const opcionesBaños = [1, 2, 3];

  // Simulamos algunas ubicaciones para el autocompletado
  const ubicacionesSugeridas = [
    'Santo Domingo', 'Santiago', 'Punta Cana', 'La Romana', 'Puerto Plata',
    'Santo Domingo Este', 'Santo Domingo Oeste', 'Distrito Nacional', 'Bavaro', 'Juan Dolio'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el envío por defecto del formulario

    const queryParams = new URLSearchParams();

    if (tipoSeleccionado) {
      queryParams.append('tipo', tipoSeleccionado);
    }
    if (habitacionesSeleccionadas) {
      queryParams.append('habitaciones', habitacionesSeleccionadas.toString());
    }
    if (bañosSeleccionados) {
      queryParams.append('baños', bañosSeleccionados.toString());
    }
    if (precioMin) {
      queryParams.append('precioMin', precioMin);
    }
    if (precioMax) {
      queryParams.append('precioMax', precioMax);
    }
    if (ubicacion) { // Añadir la ubicación a los parámetros de búsqueda
      queryParams.append('ubicacion', ubicacion);
    }

    // Redirigir al catálogo con los parámetros de búsqueda
    router.push(`/comprador/catalogo?${queryParams.toString()}`);
  };

  const limpiarFiltros = () => {
    setTipoSeleccionado('');
    setHabitacionesSeleccionadas('');
    setBañosSeleccionados('');
    setPrecioMin('');
    setPrecioMax('');
    setUbicacion(''); // Limpiar también la ubicación
  };

  return (
    <section className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto -mt-16 relative z-10 border border-neutral-200">
      <h2 className="text-3xl font-bold text-grafito text-center mb-6">Encuentra tu Propiedad Ideal</h2>
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Campo de Búsqueda de Ubicación con Autocompletado */}
        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">Ubicación:</label>
          <div className="relative flex items-center">
            <MapPin size={20} className="absolute left-3 text-gray-400" />
            <input
              id="ubicacion"
              type="text"
              list="ubicaciones-sugeridas" // Vincula el input con la datalist
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Ej: Santo Domingo, Piantini"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino sm:text-sm"
            />
            {/* Datalist para el autocompletado */}
            <datalist id="ubicaciones-sugeridas">
              {ubicacionesSugeridas.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Tipo de Inmueble/Proyecto */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">Tipo de Inmueble:</label>
          <select
            id="tipo"
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino sm:text-sm"
          >
            <option value="">Todo</option> {/* Opción "Todo" por defecto */}
            {opcionesTipo.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Precios */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rango de Precios:</label>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Precio Mín."
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino sm:text-sm"
            />
            <input
              type="number"
              placeholder="Precio Máx."
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              className="w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino sm:text-sm"
            />
          </div>
        </div>

        {/* Habitaciones y Baños (en una fila) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones:</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHabitacionesSeleccionadas('')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  habitacionesSeleccionadas === '' ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              {opcionesHabitaciones.map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setHabitacionesSeleccionadas(num)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    habitacionesSeleccionadas === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Baños:</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBañosSeleccionados('')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  bañosSeleccionados === '' ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {opcionesBaños.map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setBañosSeleccionados(num)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    bañosSeleccionados === num ? 'bg-azul-marino text-white' : 'bg-gray-100 text-grafito hover:bg-gray-200'
                  }`}
                >
                  {num}+
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            type="submit"
            className="bg-verde-lima text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-green-600 transition-colors duration-300 flex items-center gap-2"
          >
            <Search size={20} /> Buscar
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-gray-600 px-6 py-3 rounded-md font-semibold text-lg hover:text-red-500 hover:bg-gray-100 transition-colors duration-300"
          >
            Limpiar Filtros
          </button>
          {/* Botón de "Ir" que también activa la búsqueda */}
          <button
            type="submit" // Al ser type="submit", enviará el formulario y activará handleSearch
            className="bg-azul-marino text-white px-6 py-3 rounded-md font-semibold text-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2"
          >
            Ir
          </button>
        </div>
      </form>
    </section>
  );
}
