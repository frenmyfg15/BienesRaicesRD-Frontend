'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMisPropiedades } from '@/lib/api';
import Link from 'next/link';

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

const PropiedadesList: React.FC<{ propiedades: PropiedadCard[] }> = ({ propiedades }) => {
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

export default function VendedorProductosPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [misPropiedades, setMisPropiedades] = useState<PropiedadCard[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.rol === 'VENDEDOR') {
      const fetchData = async () => {
        setLoadingData(true);
        try {
          const { propiedades } = await getMisPropiedades();
          setMisPropiedades(propiedades);
        } catch (error) {
          console.error('Error al cargar propiedades del vendedor:', error);
        } finally {
          setLoadingData(false);
        }
      };
      fetchData();
    } else if (!isLoading && (!isAuthenticated || user?.rol !== 'VENDEDOR')) {
      setMisPropiedades([]);
      setLoadingData(false);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 text-grafito">
        Cargando propiedades...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <h1 className="text-3xl font-extrabold text-grafito text-center mb-10">Mis Propiedades</h1>
      <PropiedadesList propiedades={misPropiedades} />
    </div>
  );
}
