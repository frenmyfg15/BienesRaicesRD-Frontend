'use client'; // Necesario para usar Hooks de React en Next.js App Router

import React from 'react';
import Image from 'next/image'; // Para optimización de imágenes en Next.js
import Link from 'next/link';   // Para navegación en Next.js
import { Building, Home, Building2, Sun, ShoppingBag } from 'lucide-react'; // Importar iconos para cada tipo

// Interfaz para definir la estructura de cada elemento destacado
interface FeaturedItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string; // La URL de la imagen para el elemento
  link: string; // URL a la página de detalle del elemento
  type?: string; // Por ejemplo, 'Propiedad', 'Proyecto', 'Apartamento', 'Casa', 'Solar', 'Local Comercial', 'Villa'
  price?: number; // Opcional para propiedades
  location?: string; // Opcional para propiedades/proyectos
}

export default function FeaturedCarousel() {
  // Datos de ejemplo para el carrusel de destacados
  const featuredItems: FeaturedItem[] = [
    {
      id: 1,
      title: 'Apartamento de Lujo en Piantini',
      description: 'Espacioso y moderno apartamento con vistas panorámicas, ideal para la vida urbana.',
      imageUrl: 'https://placehold.co/400x250/3498db/ffffff?text=Apartamento+Lujo',
      link: '/propiedades/apartamento-piantini',
      type: 'Apartamento', // Tipo: Apartamento
      price: 280000,
      location: 'Piantini, Santo Domingo',
    },
    {
      id: 2,
      title: 'Villa Exclusiva en Cap Cana',
      description: 'Impresionante villa con acceso directo a la playa y todas las comodidades de un resort.',
      imageUrl: 'https://placehold.co/400x250/2ecc71/ffffff?text=Villa+Cap+Cana',
      link: '/propiedades/villa-cap-cana',
      type: 'Villa', // Tipo: Villa
      price: 1200000,
      location: 'Cap Cana, Punta Cana',
    },
    {
      id: 3,
      title: 'Solar Comercial en Arroyo Hondo',
      description: 'Gran oportunidad de inversión en un solar de alta visibilidad para desarrollo comercial.',
      imageUrl: 'https://placehold.co/400x250/e67e22/ffffff?text=Solar+Comercial',
      link: '/solares/solar-arroyo-hondo',
      type: 'Solar', // Tipo: Solar
      price: 450000,
      location: 'Arroyo Hondo, Santo Domingo',
    },
    {
      id: 4,
      title: 'Residencial Las Colinas', // Este es un proyecto
      description: 'Nuevo proyecto de apartamentos con diseño contemporáneo y amenidades de primera clase.',
      imageUrl: 'https://placehold.co/400x250/9b59b6/ffffff?text=Residencial+Colinas',
      link: '/proyectos/residencial-las-colinas',
      type: 'Proyecto', // Tipo: Proyecto
      location: 'Santiago de los Caballeros',
    },
    {
      id: 5,
      title: 'Casa Familiar en Gazcue',
      description: 'Encantadora casa ideal para familias en un vecindario tranquilo y céntrico.',
      imageUrl: 'https://placehold.co/400x250/1abc9c/ffffff?text=Casa+Gazcue',
      link: '/propiedades/casa-gazcue',
      type: 'Casa', // Tipo: Casa
      price: 195000,
      location: 'Gazcue, Santo Domingo',
    },
    {
      id: 6,
      title: 'Local Comercial en Naco',
      description: 'Espacio ideal para oficina o negocio en una de las zonas más céntricas.',
      imageUrl: 'https://placehold.co/400x250/f1c40f/ffffff?text=Local+Naco',
      link: '/locales/local-naco',
      type: 'Local Comercial', // Tipo: Local Comercial
      price: 3500,
      location: 'Naco, Santo Domingo',
    },
  ];

  // Función auxiliar para obtener el color y el icono según el tipo
  const getTypeBadge = (type: string | undefined) => {
    switch (type) {
      case 'Proyecto':
        return { color: 'bg-emerald-400', icon: <Building size={16} /> };
      case 'Apartamento':
        return { color: 'bg-blue-400', icon: <Building2 size={16} /> };
      case 'Casa':
        return { color: 'bg-amber-400', icon: <Home size={16} /> };
      case 'Solar':
        return { color: 'bg-oro-arenoso', icon: <Sun size={16} /> };
      case 'Villa':
        // Asumiendo que puedes añadir más colores en tailwind.config.js o usar un color preexistente vibrante
        return { color: 'bg-pink-500', icon: <Home size={16} /> }; // Usando pink-500 de Tailwind
      case 'Local Comercial':
        return { color: 'bg-purple-600', icon: <ShoppingBag size={16} /> }; // Usando purple-600 de Tailwind
      default:
        return { color: 'bg-gray-500', icon: null }; // Default para tipos no definidos
    }
  };

  return (
    <section className="py-16 px-4 bg-neutral-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold text-grafito text-center mb-10 drop-shadow-sm">
          <span className="text-azul-marino">Destacados</span>
        </h2>

        {/* Contenedor del carrusel con scroll horizontal */}
        <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 space-x-6 scrollbar-hide">
          {featuredItems.map((item) => {
            const badge = getTypeBadge(item.type);
            return (
              <div
                key={item.id}
                className="flex-none w-80 sm:w-96 snap-center bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transition-transform duration-300 hover:scale-[1.02]"
              >
                <Link href={item.link} className="block group">
                  <div className="relative w-full h-48">
                    <Image
                      src='/fondo.png'
                      alt={item.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    />
                    
                    {/* Indicador de Tipo de Propiedad */}
                    {item.type && (
                      <span className={`absolute top-3 right-3 ${badge.color} text-white text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-md z-10 animate-fade-in`}>
                        {badge.icon} {item.type}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-grafito mb-2 group-hover:text-azul-marino transition-colors duration-200">
                      {item.title}
                    </h3>
                    {item.location && (
                      <p className="text-sm text-gray-600 mb-1">
                        {item.location}
                      </p>
                    )}
                    {item.price && (
                      <p className="font-bold text-lg text-oro-arenoso mb-2">
                        ${item.price.toLocaleString('es-DO')}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="mt-4 text-right">
                      <span className="inline-block text-azul-marino font-semibold hover:underline">
                        Ver más &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        {/* Indicación para el usuario de que se puede hacer scroll */}
        <p className="text-center text-sm text-gray-500 mt-6">
          &larr; Desliza para ver más &rarr;
        </p>
      </div>
    </section>
  );
}
