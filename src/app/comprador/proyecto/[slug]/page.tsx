// app/comprador/proyecto/[slug]/page.tsx
// Este es un Server Component. NO necesita 'use client'.

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image'; // Importar el componente Image de Next.js
import { notFound } from 'next/navigation';
import { Building, MapPin, Package, Calendar, ChevronLeft, Phone, Mail, MessageSquare, DollarSign, Bed, Bath, Ruler } from 'lucide-react';

// Importa las funciones de tu API
import { getProjectBySlug } from '@/lib/api';

// ¡IMPORTANTE! Importa tu componente ImageDisplay
// Asumimos que ImageDisplay ya maneja internamente next/image para sus propósitos
import ImageDisplay from '../../components/ImageDisplay'; // Ajusta la ruta si es diferente

interface ProyectoPageProps {
  params: {
    slug: string; // El slug del proyecto vendrá como parámetro de ruta
  };
}


// Componente principal de la página de detalle del proyecto
export default async function ProyectoDetailPage({ params }: { params: { slug: string } }) {
  const proyecto = await getProjectBySlug(params.slug);

  if (!proyecto) {
    notFound(); // Next.js maneja esto con la página 404 por defecto
  }

  // Prepara el array de URLs de imágenes para el Client Component ImageDisplay
  const imageUrlsForCarousel = proyecto.imagenes
    ?.map((img: any) => img.url)
    .filter((url: any): url is string => typeof url === 'string' && url.trim() !== '') || [];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 lg:px-10 bg-white shadow-xl rounded-2xl my-10 space-y-10" role="main">
      {/* Schema Markup para SEO */}
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product", // Usamos Product para un proyecto inmobiliario en venta
          "name": proyecto.nombre,
          "description": proyecto.descripcion || `Descubre el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}.`,
          "image": imageUrlsForCarousel[0] || proyecto.imagenDestacada || 'https://placehold.co/1200x630/cccccc/333333?text=Inmuebles+RD+Proyecto',
          "url": `https://www.tuinmobiliaria.com/comprador/proyecto/${proyecto.slug}`,
          "brand": {
            "@type": "Organization",
            "name": "Inmuebles RD" // Tu marca
          },
          "offers": proyecto.precioDesde ? {
            "@type": "Offer",
            "priceCurrency": "USD", // Asume USD, ajusta según tu moneda
            "price": proyecto.precioDesde,
            "availability": "https://schema.org/InStock", // O OutOfStock si no hay unidades
            "url": `https://www.tuinmobiliaria.com/comprador/proyecto/${proyecto.slug}`,
            "seller": {
              "@type": "Organization",
              "name": "Inmuebles RD"
            }
          } : undefined,
          // Propiedades adicionales para un proyecto inmobiliario
          "additionalProperty": [
            {
              "@type": "PropertyValue",
              "name": "Estado del Proyecto",
              "value": proyecto.estado
            },
            {
              "@type": "PropertyValue",
              "name": "Ubicación",
              "value": proyecto.ubicacion
            },
            {
              "@type": "PropertyValue",
              "name": "Unidades Disponibles",
              "value": proyecto.unidadesDisponibles
            },
            // Puedes añadir más como fecha de entrega, amenidades, etc.
          ].filter(p => p.value !== null && p.value !== undefined),
          // Si tienes reseñas o ratings, irían aquí
        })}
      </script>

      {/* Volver al catálogo */}
      <div>
        <Link
          href="/comprador/catalogo"
          className="inline-flex items-center text-azul-marino hover:underline focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2 rounded-md"
          aria-label="Volver al catálogo de proyectos"
        >
          <ChevronLeft size={20} className="mr-1" aria-hidden="true" />
          Volver al Catálogo
        </Link>
      </div>

      {/* Encabezado del Proyecto */}
      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-grafito" id="project-title">{proyecto.nombre}</h1>
        <p className="flex items-center justify-center md:justify-start text-lg text-gray-600">
          <MapPin size={20} className="mr-2 text-red-500" aria-hidden="true" />
          <span className="sr-only">Ubicación:</span>
          {proyecto.ubicacion}
        </p>
      </header>

      {/* Sección de Video y Carrusel de Imágenes */}
      {/* Si hay video, se muestra primero */}
      {proyecto.videoUrl && (
        <div className="w-full relative overflow-hidden rounded-xl shadow-lg aspect-video" aria-labelledby="project-video-heading">
          <h2 id="project-video-heading" className="sr-only">Video del proyecto {proyecto.nombre}</h2>
          <video controls className="w-full h-full object-cover" aria-label={`Video de recorrido del proyecto ${proyecto.nombre}`}>
            <source src={proyecto.videoUrl} type="video/mp4" />
            Lo sentimos, tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      {/* Si hay imágenes, se muestra el carrusel ImageDisplay */}
      {/* Se usa `imageUrlsForCarousel` que contiene solo las URLs válidas */}
      {imageUrlsForCarousel.length > 0 && (
        <ImageDisplay
          imageUrls={imageUrlsForCarousel}
          altText={`Galería de imágenes del proyecto ${proyecto.nombre}`}
        />
      )}
      {/* Fallback si no hay ni video ni imágenes */}
      {(!proyecto.videoUrl && imageUrlsForCarousel.length === 0) && (
        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-lg" aria-live="polite">
          No hay medios visuales disponibles para este proyecto.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10 mt-8">
        {/* Detalles del proyecto */}
        <section className="space-y-4" aria-labelledby="project-details-heading">
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2" id="project-details-heading">Detalles del Proyecto</h2>
          <ul className="space-y-3 text-base text-gray-700" role="list">
            <li className="flex items-center">
              <Building className="text-gray-500 mr-2" aria-hidden="true" size={20} />
              <strong className="mr-1">Estado:</strong> {proyecto.estado || 'No especificado'}
            </li>
            {proyecto.fechaEntregaEstimada && (
              <li className="flex items-center">
                <Calendar className="text-blue-500 mr-2" aria-hidden="true" size={20} />
                <strong className="mr-1">Entrega estimada:</strong> {proyecto.fechaEntregaEstimada}
              </li>
            )}
            {proyecto.unidadesDisponibles != null && (
              <li className="flex items-center">
                <Package className="text-green-600 mr-2" aria-hidden="true" size={20} />
                <strong className="mr-1">Unidades disponibles:</strong> {proyecto.unidadesDisponibles}
              </li>
            )}
            {proyecto.precioDesde && (
              <li className="flex items-center">
                <DollarSign className="text-oro-arenoso mr-2" aria-hidden="true" size={20} />
                <strong className="mr-1">Desde:</strong> ${proyecto.precioDesde.toLocaleString('es-DO')}
              </li>
            )}
          </ul>

          {proyecto.amenidadesProyecto?.length > 0 && (
            <div className="mt-6" aria-labelledby="amenities-heading">
              <h3 className="text-lg font-semibold mb-2" id="amenities-heading">Amenidades</h3>
              <div className="flex flex-wrap gap-2">
                {proyecto.amenidadesProyecto.map((item: any, i: any) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                    aria-label={`Amenidad: ${item}`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Descripción */}
        <section aria-labelledby="project-description-heading">
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2 mb-4" id="project-description-heading">Descripción del Proyecto</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {proyecto.descripcion || 'No hay descripción detallada disponible para este proyecto en este momento.'}
          </p>
        </section>
      </div>

      {/* Propiedades del proyecto */}
      {proyecto.propiedades?.length > 0 && (
        <section className="space-y-4 mt-10" aria-labelledby="project-units-heading">
          <h2 className="text-2xl font-bold text-grafito" id="project-units-heading">Unidades Disponibles en este Proyecto</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyecto.propiedades.map((prop: any) => (
              <Link
                key={prop.id}
                href={`/comprador/propiedad/${prop.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2"
                aria-label={`Ver detalles de la propiedad ${prop.nombre}`}
              >
                {/* Usar next/image para la imagen de la propiedad */}
                <div className="relative w-full h-40">
                  <Image
                    src={prop.imagenes?.[0]?.url || 'https://placehold.co/300x200/e0e0e0/555555?text=Sin+Imagen'}
                    alt={`Imagen de la propiedad ${prop.nombre}`}
                    fill // Usa `fill` para que la imagen ocupe el contenedor y `object-cover`
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Mejora el rendimiento de imágenes responsivas
                    priority={false} // Las imágenes de las unidades no son prioritarias en la carga inicial de la página del proyecto
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg text-grafito group-hover:underline">
                    {prop.nombre}
                  </h3>
                  <p className="text-sm text-azul-marino font-bold">
                    ${prop.precio?.toLocaleString('es-DO') || 'N/A'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                    {prop.habitaciones && (
                      <span className="flex items-center gap-1" aria-label={`${prop.habitaciones} habitaciones`}>
                        <Bed size={14} aria-hidden="true" /> {prop.habitaciones}
                      </span>
                    )}
                    {prop.baños && (
                      <span className="flex items-center gap-1" aria-label={`${prop.baños} baños`}>
                        <Bath size={14} aria-hidden="true" /> {prop.baños}
                      </span>
                    )}
                    {prop.metros2 && (
                      <span className="flex items-center gap-1" aria-label={`${prop.metros2} metros cuadrados`}>
                        <Ruler size={14} aria-hidden="true" /> {prop.metros2} m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Contacto */}
      <section className="mt-12 p-6 bg-gray-50 rounded-xl shadow-inner text-center" aria-labelledby="contact-heading">
        <h2 className="text-2xl font-semibold text-grafito mb-3" id="contact-heading">¿Interesado en este proyecto?</h2>
        <p className="text-gray-700 mb-6">Contáctanos para más información o para agendar una visita personal.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${proyecto.usuarioVendedor.telefono || '+18095551234'}`}
            className="inline-flex items-center bg-azul-marino text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition shadow focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2"
            aria-label={`Llamar al agente para información sobre el proyecto ${proyecto.nombre}`}
          >
            <Phone size={20} className="mr-2" aria-hidden="true" /> Llamar
          </a>
          <a
            href={`mailto:${proyecto.usuarioVendedor.email}?subject=${encodeURIComponent(`Consulta sobre el proyecto: ${proyecto.nombre}`)}`}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
            aria-label={`Enviar correo electrónico al agente sobre el proyecto ${proyecto.nombre}`}
          >
            <Mail size={20} className="mr-2" aria-hidden="true" /> Correo
          </a>
          {proyecto.usuarioVendedor.whatsapp && (
            <a
              href={`https://wa.me/${proyecto.usuarioVendedor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Estoy interesado en el proyecto: ${proyecto.nombre} ubicado en ${proyecto.ubicacion}. ¿Podrías darme más detalles?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={`Enviar mensaje de WhatsApp al agente sobre el proyecto ${proyecto.nombre}`}
            >
              <MessageSquare size={20} className="mr-2" aria-hidden="true" /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}