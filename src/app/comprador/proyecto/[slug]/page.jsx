import { notFound } from 'next/navigation';
import Link from 'next/link';

import {
  Building, MapPin, Package, Calendar, ChevronLeft, Phone, Mail, MessageSquare, DollarSign, Bed, Bath, Ruler
} from 'lucide-react';

import { getProjectBySlug } from '@/lib/api';
import ImageDisplay from '../../components/ImageDisplay';


export async function generateMetadata({ params }) {
  const proyecto = await getProjectBySlug(params.slug);

  if (!proyecto) {
    return {
      title: "Proyecto No Encontrado | Bienes Raices RD",
      description: "El proyecto que buscas no ha sido encontrado en Bienes Raices RD.",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = proyecto.imagenes?.[0]?.url || proyecto.imagenDestacada || 'https://placehold.co/1200x630/003366/FFFFFF?text=Bienes+Raices+RD';
  const pageUrl = `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/proyecto/${proyecto.slug}`;

  return {
    title: `${proyecto.nombre} en ${proyecto.ubicacion} | Bienes Raices RD`,
    description: proyecto.descripcion || `Descubre el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}. Conoce su estado, unidades disponibles, amenidades y más en Bienes Raices RD.`,
    keywords: [
      `${proyecto.nombre.toLowerCase()}`,
      `${proyecto.ubicacion.toLowerCase()}`,
      "proyectos inmobiliarios rd",
      "apartamentos en construcción santo domingo",
      "inversion inmobiliaria rd",
      `${proyecto.estado.toLowerCase()} proyectos`,
      "bienes raices rd",
      "proyectos nuevos rd",
    ],
    metadataBase: new URL('https://bienes-raices-rd-frontend-9gbu.vercel.app'),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${proyecto.nombre} | ${proyecto.ubicacion} | Bienes Raices RD`,
      description: proyecto.descripcion || `Descubre el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}. Conoce sus características y unidades disponibles.`,
      url: pageUrl,
      siteName: "Bienes Raices RD",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Imagen principal del proyecto ${proyecto.nombre}`,
        },
      ],
      locale: 'es_DO',
      type: 'article',
      publishedTime: proyecto.createdAt,
      modifiedTime: proyecto.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${proyecto.nombre} | ${proyecto.ubicacion} | Bienes Raices RD`,
      description: proyecto.descripcion || `Explora el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}. ¡Encuentra tu próximo hogar o inversión!`,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}


export default async function ProyectoDetailPage({params}) {
  const proyecto = await getProjectBySlug(params.slug);

  if (!proyecto) {
    notFound();
  }

  const imageUrlsForCarousel = proyecto.imagenes
    ?.map((img) => img.url)
    .filter(url => typeof url === 'string' && url.trim() !== '') || [];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 lg:px-10 bg-white shadow-xl rounded-2xl my-10 space-y-10" role="main">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": proyecto.nombre,
          "description": proyecto.descripcion || `Descubre el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}.`,
          "image": imageUrlsForCarousel[0] || proyecto.imagenDestacada || 'https://placehold.co/1200x630/cccccc/333333?text=Inmuebles+RD+Proyecto',
          "url": `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/proyecto/${proyecto.slug}`,
          "brand": {
            "@type": "Organization",
            "name": "Bienes Raices RD"
          },
          "offers": proyecto.precioDesde ? {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": proyecto.precioDesde,
            "availability": "https://schema.org/InStock",
            "url": `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/proyecto/${proyecto.slug}`,
            "seller": {
              "@type": "Organization",
              "name": "Bienes Raices RD"
            }
          } : undefined,
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
          ].filter(p => p.value !== null && p.value !== undefined),
        })}
      </script>

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

      <header className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-grafito" id="project-title">{proyecto.nombre}</h1>
        <p className="flex items-center justify-center md:justify-start text-lg text-gray-600">
          <MapPin size={20} className="mr-2 text-red-500" aria-hidden="true" />
          <span className="sr-only">Ubicación:</span>
          {proyecto.ubicacion}
        </p>
      </header>

      {proyecto.videoUrl && (
        <div className="w-full relative overflow-hidden rounded-xl shadow-lg aspect-video mb-10" aria-labelledby="project-video-heading">
          <h2 id="project-video-heading" className="sr-only">Video del proyecto {proyecto.nombre}</h2>
          <video controls playsInline muted loop
            poster="https://placehold.co/800x450/cccccc/333333?text=Video+del+Proyecto"
            className="w-full h-full object-cover" aria-label={`Video de recorrido del proyecto ${proyecto.nombre}`}>
            <source src={proyecto.videoUrl} type="video/mp4" />
            Lo sentimos, tu navegador no soporta la reproducción de video.
          </video>
        </div>
      )}

      {imageUrlsForCarousel.length > 0 && (
        <div className="shadow-md rounded-xl overflow-hidden mb-10 relative">
          <ImageDisplay
            imageUrls={imageUrlsForCarousel}
            altText={`Galería de imágenes del proyecto ${proyecto.nombre}`}
          />
        </div>
      )}
      {(!proyecto.videoUrl && imageUrlsForCarousel.length === 0) && (
        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-lg" aria-live="polite">
          No hay medios visuales disponibles para este proyecto.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10 mt-8">
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
                {proyecto.amenidadesProyecto.map((item, i) => (
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

        <section aria-labelledby="project-description-heading">
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2 mb-4" id="project-description-heading">Descripción del Proyecto</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {proyecto.descripcion || 'No hay descripción detallada disponible para este proyecto en este momento.'}
          </p>
        </section>
      </div>

      {proyecto.propiedades?.length > 0 && (
        <section className="space-y-4 mt-10" aria-labelledby="project-units-heading">
          <h2 className="text-2xl font-bold text-grafito" id="project-units-heading">Unidades Disponibles en este Proyecto</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyecto.propiedades.map((prop) => (
              <Link
                key={prop.id}
                href={`/comprador/propiedad/${prop.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2"
                aria-label={`Ver detalles de la propiedad ${prop.nombre}`}
              >
                <div className="relative w-full h-40">
                  <img
                    src={prop.imagenes?.[0]?.url || 'https://placehold.co/300x200/e0e0e0/555555?text=Sin+Imagen'}
                    alt={`Imagen de la propiedad ${prop.nombre}`}
                    className="w-full h-full object-cover"
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
              href={`https://wa.me/${typeof proyecto.usuarioVendedor.whatsapp === 'string' ? proyecto.usuarioVendedor.whatsapp.replace(/\D/g, '') : ''}?text=${encodeURIComponent(`Hola! Estoy interesado en el proyecto: ${proyecto.nombre} ubicado en ${proyecto.ubicacion}. ¿Podrías darme más detalles?`)}`}
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
