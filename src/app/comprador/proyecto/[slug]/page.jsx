import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Building, MapPin, Package, Calendar, ChevronLeft, Phone, Mail, MessageSquare, DollarSign, Bed, Bath, Ruler,
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
    description: proyecto.descripcion || `Descubre el proyecto ${proyecto.nombre} en ${proyecto.ubicacion}.`,
    metadataBase: new URL('https://bienes-raices-rd-frontend-9gbu.vercel.app'),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${proyecto.nombre} | ${proyecto.ubicacion}`,
      description: proyecto.descripcion,
      url: pageUrl,
      siteName: "Bienes Raices RD",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Imagen del proyecto ${proyecto.nombre}`,
        },
      ],
      locale: 'es_DO',
      type: 'article',
      publishedTime: proyecto.createdAt,
      modifiedTime: proyecto.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${proyecto.nombre} | ${proyecto.ubicacion}`,
      description: proyecto.descripcion,
      images: [imageUrl],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProyectoDetailPage({ params }) {
  const proyecto = await getProjectBySlug(params.slug);
  if (!proyecto) notFound();

  const imageUrls = proyecto.imagenes?.map(i => i.url).filter(Boolean) || [];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 lg:px-10 bg-white shadow-xl rounded-2xl my-10 space-y-10">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: proyecto.nombre,
          description: proyecto.descripcion,
          image: imageUrls[0] || proyecto.imagenDestacada,
          url: `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/proyecto/${proyecto.slug}`,
          brand: { "@type": "Organization", name: "Bienes Raices RD" },
          offers: proyecto.precioDesde
            ? {
              "@type": "Offer",
              priceCurrency: "USD",
              price: proyecto.precioDesde,
              availability: "https://schema.org/InStock",
              url: `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/proyecto/${proyecto.slug}`,
              seller: { "@type": "Organization", name: "Bienes Raices RD" },
            }
            : undefined,
        })}
      </script>

      <Link href="/comprador/catalogo" className="inline-flex items-center text-azul-marino hover:underline">
        <ChevronLeft size={20} className="mr-1" /> Volver al Catálogo
      </Link>

      <header className="text-center md:text-left space-y-2">
        <h1 className="text-4xl font-bold text-grafito">{proyecto.nombre}</h1>
        <p className="text-lg text-gray-600 flex justify-center md:justify-start items-center">
          <MapPin size={20} className="mr-2 text-red-500" /> {proyecto.ubicacion}
        </p>
      </header>

      {/* VIDEO */}
      {proyecto.videoUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-xl shadow">
          <video controls playsInline muted loop poster="https://placehold.co/800x450?text=Proyecto+Video" className="w-full h-full object-cover">
            <source src={proyecto.videoUrl} type="video/mp4" />
            Tu navegador no soporta video.
          </video>
        </div>
      )}

      {/* IMÁGENES */}
      {imageUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden shadow-md">
          <ImageDisplay imageUrls={imageUrls} altText={`Galería de imágenes del proyecto ${proyecto.nombre}`} />
        </div>
      )}

      {/* SIN MEDIOS */}
      {!proyecto.videoUrl && imageUrls.length === 0 && (
        <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
          No hay medios visuales disponibles.
        </div>
      )}

      {/* DETALLES Y DESCRIPCIÓN */}
      <div className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2 mb-4">Detalles del Proyecto</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center">
              <Building size={20} className="mr-2 text-gray-500" />
              <strong className="mr-1">Estado:</strong> {proyecto.estado || 'No especificado'}
            </li>
            {proyecto.fechaEntregaEstimada && (
              <li className="flex items-center">
                <Calendar size={20} className="mr-2 text-blue-500" />
                <strong className="mr-1">Entrega:</strong> {proyecto.fechaEntregaEstimada}
              </li>
            )}
            {proyecto.unidadesDisponibles != null && (
              <li className="flex items-center">
                <Package size={20} className="mr-2 text-green-500" />
                <strong className="mr-1">Unidades:</strong> {proyecto.unidadesDisponibles}
              </li>
            )}
            {proyecto.precioDesde && (
              <li className="flex items-center">
                <DollarSign size={20} className="mr-2 text-oro-arenoso" />
                <strong className="mr-1">Desde:</strong> ${proyecto.precioDesde.toLocaleString('es-DO')}
              </li>
            )}
          </ul>

          {proyecto.amenidadesProyecto?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Amenidades</h3>
              <div className="flex flex-wrap gap-2">
                {proyecto.amenidadesProyecto.map((a, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2 mb-4">Descripción</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{proyecto.descripcion || 'No hay descripción disponible.'}</p>
        </section>
      </div>

      {/* UNIDADES DISPONIBLES */}
      {proyecto.propiedades?.length > 0 && (
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold text-grafito">Unidades Disponibles</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyecto.propiedades.map((prop) => (
              <Link
                key={prop.id}
                href={`/comprador/propiedad/${prop.slug}`}
                className="border rounded-xl hover:shadow-md overflow-hidden block group transition"
              >
                <img
                  src={prop.imagenes?.[0]?.url || 'https://placehold.co/300x200?text=Sin+imagen'}
                  alt={`Imagen de ${prop.nombre}`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-grafito group-hover:underline">{prop.nombre}</h3>
                  <p className="text-azul-marino font-bold">${prop.precio?.toLocaleString('es-DO') || 'N/A'}</p>
                  <div className="flex flex-wrap text-xs text-gray-600 mt-1 gap-x-4">
                    {prop.habitaciones && (
                      <span className="flex items-center gap-1">
                        <Bed size={14} /> {prop.habitaciones}
                      </span>
                    )}
                    {prop.baños && (
                      <span className="flex items-center gap-1">
                        <Bath size={14} /> {prop.baños}
                      </span>
                    )}
                    {prop.metros2 && (
                      <span className="flex items-center gap-1">
                        <Ruler size={14} /> {prop.metros2} m²
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      
      {/* MAPA DE UBICACIÓN */}
      {proyecto.ubicacion && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-grafito mb-4 text-center">Ubicación en el Mapa</h2>
          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 shadow">
            <iframe
              title={`Mapa del proyecto ${proyecto.nombre}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(proyecto.ubicacion)}&output=embed`}
              className="w-full h-full"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      )}


      {/* CONTACTO */}
      <section className="mt-12 p-6 bg-gray-50 rounded-xl text-center">
        <h2 className="text-2xl font-semibold text-grafito mb-3">¿Interesado?</h2>
        <p className="text-gray-700 mb-6">Contáctanos para más información o agendar una visita.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`tel:${proyecto.usuarioVendedor.telefono || '+18095551234'}`} className="btn bg-azul-marino text-white">
            <Phone size={20} className="mr-2" /> Llamar
          </a>
          <a
            href={`mailto:${proyecto.usuarioVendedor.email}?subject=Consulta: ${encodeURIComponent(proyecto.nombre)}`}
            className="btn bg-gray-700 text-white"
          >
            <Mail size={20} className="mr-2" /> Correo
          </a>
          {proyecto.usuarioVendedor.whatsapp && (
            <a
              href={`https://wa.me/${proyecto.usuarioVendedor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hola! Estoy interesado en el proyecto: ${proyecto.nombre} ubicado en ${proyecto.ubicacion}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-500 text-white"
            >
              <MessageSquare size={20} className="mr-2" /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
