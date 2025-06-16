// app/vendedor/productos/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMisPropiedades, getProyectos } from '@/lib/api';
import Link from 'next/link';

// --- Interfaces de Datos (mantienen la misma estructura) ---
interface PropiedadCard {
  id: number;
  nombre: string;
  slug: string;
  tipo: string;
  precio: number;
  habitaciones?: number | null;
  baños?: number | null;
  metros2?: number | null;
  estado: string | null;
  ubicacion: string | null;
  proyecto?: {
    id: number | null;
    nombre: string | null;
    slug: string | null;
  };
  imagenUrls?: string[] | null;
}

interface ProyectoCard {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
  imagenDestacada: string;
}

// --- Componente: Lista de Propiedades ---
interface PropiedadesListProps {
  propiedades: PropiedadCard[];
}

const PropiedadesList: React.FC<PropiedadesListProps> = ({ propiedades }) => {
  if (propiedades.length === 0) {
    return (
      <div className="text-center text-gray-700 p-8 bg-white rounded-lg shadow-sm">
        <p className="text-lg mb-4">Aún no has subido ninguna propiedad.</p>
        <Link href="/vendedor/propiedades" className="bg-green-800 text-white px-6 py-3 rounded-md hover:bg-green-600 transition">
          Añadir Nueva Propiedad
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {propiedades.map((propiedad) => (
        <div key={propiedad.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-oro-arenoso">
          {propiedad.imagenUrls && propiedad.imagenUrls.length > 0 ? (
            <img
              src={propiedad.imagenUrls[0]}
              alt={`Imagen de propiedad ${propiedad.nombre}`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://placehold.co/600x400/cccccc/333333?text=Propiedad';
              }}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              Sin imagen
            </div>
          )}
          <div className="p-5">
            <h3 className="font-bold text-xl text-grafito mb-2">{propiedad.nombre}</h3>
            <p className="text-gray-600 text-sm mb-1">{propiedad.tipo} en {propiedad.ubicacion}</p>
            <p className="text-azul-marino font-bold text-lg mb-2">${propiedad.precio?.toLocaleString('es-DO')}</p>
            <p className="text-sm text-gray-700">Habitaciones: {propiedad.habitaciones || 'N/A'} | Baños: {propiedad.baños || 'N/A'}</p>
            <p className="text-sm text-gray-700">M²: {propiedad.metros2 || 'N/A'}</p>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-2 ${
              propiedad.estado === 'En venta' ? 'bg-green-100 text-green-800' :
              propiedad.estado === 'Alquiler' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {propiedad.estado}
            </span>
            {propiedad.proyecto && (
              <p className="text-xs text-gray-500 mt-2">
                Parte de: <Link href={`/vendedor/proyectos/${propiedad.proyecto.id}`} className="text-azul-marino hover:underline">{propiedad.proyecto.nombre}</Link>
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <Link href={`/vendedor/propiedades/${propiedad.id}`} className="text-azul-marino hover:underline text-sm font-semibold">
                Ver Detalles
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Componente: Lista de Proyectos ---
interface ProyectosListProps {
  proyectos: ProyectoCard[];
}

const ProyectosList: React.FC<ProyectosListProps> = ({ proyectos }) => {
  if (proyectos.length === 0) {
    return (
      <div className="text-center text-gray-700 p-8 bg-white rounded-lg shadow-sm">
        <p className="text-lg mb-4">Aún no has creado ningún proyecto.</p>
        <Link href="/vendedor/proyectos/crear" className="bg-azul-marino text-white px-6 py-3 rounded-md hover:bg-azul-marino/80 transition">
          Crear Nuevo Proyecto
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proyectos.map((proyecto) => (
        <div key={proyecto.id} className="bg-white rounded-lg shadow-lg overflow-hidden border border-oro-arenoso">
          <img
            src={proyecto.imagenDestacada}
            alt={`Imagen de proyecto ${proyecto.nombre}`}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://placehold.co/600x400/cccccc/333333?text=Proyecto';
            }}
          />
          <div className="p-5">
            <h3 className="font-bold text-xl text-grafito mb-2">{proyecto.nombre}</h3>
            <p className="text-gray-600 text-sm mb-1">{proyecto.ubicacion}</p>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
              proyecto.estado === 'En construcción' ? 'bg-orange-100 text-orange-800' :
              proyecto.estado === 'Terminado' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {proyecto.estado}
            </span>
            <p className="text-sm text-gray-700 mt-3 line-clamp-3">{proyecto.descripcion}</p>
            <div className="mt-4 flex justify-end">
              <Link href={`/vendedor/proyectos/${proyecto.id}`} className="text-azul-marino hover:underline text-sm font-semibold">
                Ver Detalles y Propiedades
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


// --- Componente Principal: VendedorProductosPage (El Panel) ---
export default function VendedorProductosPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [misPropiedades, setMisPropiedades] = useState<PropiedadCard[]>([]);
  const [misProyectos, setMisProyectos] = useState<ProyectoCard[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'propiedades' | 'proyectos'>('propiedades'); // Estado para la vista seleccionada

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.rol === 'VENDEDOR') {
      const fetchSellerData = async () => {
        setLoadingData(true);
        setErrorData(null);
        try {
          const { propiedades } = await getMisPropiedades();
          
          setMisPropiedades(propiedades);

          // Asegúrate de que getProyectos tenga el vendedorId en su implementación de backend para filtrar
          const { proyectos } = await getProyectos(user.id);
          setMisProyectos(proyectos);

        } catch (error: any) {
          // console.error('Error al cargar datos del vendedor:', error);
          // setErrorData('No se pudieron cargar tus propiedades y proyectos. Intenta de nuevo más tarde.');
          // toast.error('Error al cargar tus productos.');
        } finally {
          setLoadingData(false);
        }
      };
      fetchSellerData();
    } else if (!isLoading && (!isAuthenticated || user?.rol !== 'VENDEDOR')) {
      setMisPropiedades([]);
      setMisProyectos([]);
      setLoadingData(false);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-grafito">
        Cargando tus productos...
      </div>
    );
  }

  // if (errorData) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 text-red-600 p-4">
  //       <p className="text-lg mb-4">{errorData}</p>
  //       <Link href="/vendedor/dashboard" className="bg-azul-marino text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition">
  //         Ir al Panel de Vendedor
  //       </Link>
  //     </div>
  //   );
  // }

  // Si no hay propiedades ni proyectos y la carga ha terminado, muestra el mensaje para añadir
  if (misPropiedades.length === 0 && misProyectos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 text-grafito p-4">
        <h2 className="text-2xl font-bold mb-4">Aún no tienes propiedades ni proyectos.</h2>
        <p className="mb-6 text-center">¡Es hora de empezar a añadir tus listados!</p>
        <Link href="/vendedor/propiedades" className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 hover:scale-110 transition">
          Añadir Nueva Propiedad
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100 text-grafito">
      {/* Sidebar de Navegación */}
      <aside className="w-64 bg-azul-marino text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold mb-8 text-center">
          Panel Vendedor
        </div>
        <nav className="flex-grow">
          <ul>
            <li className="mb-2">
              <button
                onClick={() => setSelectedView('propiedades')}
                className={`w-full text-left py-2 px-4 rounded-md transition duration-200 ${
                  selectedView === 'propiedades' ? 'bg-oro-arenoso text-azul-marino font-semibold' : 'hover:bg-azul-marino/80'
                }`}
              >
                Mis Propiedades
              </button>
            </li>
            <li className="mb-2">
              <button
                onClick={() => setSelectedView('proyectos')}
                className={`w-full text-left py-2 px-4 rounded-md transition duration-200 ${
                  selectedView === 'proyectos' ? 'bg-oro-arenoso text-azul-marino font-semibold' : 'hover:bg-azul-marino/80'
                }`}
              >
                Mis Proyectos
              </button>
            </li>
            {/* Opciones Adicionales para el futuro */}
            <li className="mb-2">
              <Link href="/vendedor/estadisticas" className="w-full text-left py-2 px-4 rounded-md transition duration-200 hover:bg-azul-marino/80 block">
                Estadísticas
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/vendedor/mensajes" className="w-full text-left py-2 px-4 rounded-md transition duration-200 hover:bg-azul-marino/80 block">
                Mensajes
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/vendedor/ajustes" className="w-full text-left py-2 px-4 rounded-md transition duration-200 hover:bg-azul-marino/80 block">
                Ajustes
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-extrabold text-grafito text-center mb-10">
          {selectedView === 'propiedades' ? 'Mis Propiedades' : 'Mis Proyectos'}
        </h1>

        {selectedView === 'propiedades' && <PropiedadesList propiedades={misPropiedades} />}
        {selectedView === 'proyectos' && <ProyectosList proyectos={misProyectos} />}
      </div>
    </div>
  );
}