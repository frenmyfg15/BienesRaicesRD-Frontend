// app/comprador/proyecto/[slug]/page.tsx
// Este es un Server Component. NO necesita 'use client'.

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Building, MapPin, Package, Calendar, ChevronLeft, Phone, Mail, MessageSquare, DollarSign, Bed, Bath, Ruler } from 'lucide-react';

// Importa las funciones de tu API
import { getProjectBySlug, ProyectoResponse } from '@/lib/api';

// ¡IMPORTANTE! Importa tu componente ImageDisplay
import ImageDisplay from '../../components/ImageDisplay'; // Ajusta la ruta si es diferente

interface ProyectoPageProps {
  params: {
    slug: string; // El slug del proyecto vendrá como parámetro de ruta
  };
}

// Generación dinámica de metadatos para SEO
export async function generateMetadata({
  params,
}: ProyectoPageProps): Promise<Metadata> {
  const projectSlug = params.slug;

  if (!projectSlug) {
    return {
      title: 'Proyecto no encontrado - Inmuebles RD',
      description: 'El proyecto que buscas no existe o el slug es inválido.',
    };
  }

  const data = await getProjectBySlug(projectSlug);
  const proyecto = data;

  if (!proyecto) {
    return {
      title: 'Proyecto no encontrado - Inmuebles RD',
      description: 'El proyecto que buscas no existe o el slug es inválido.',
    };
  }

  const title = `${proyecto.nombre} en ${proyecto.ubicacion} - ${proyecto.estado} | Inmuebles RD`;
  const descriptionSnippet = proyecto.descripcion ? `${proyecto.descripcion.substring(0, 150)}${proyecto.descripcion.length > 150 ? '...' : ''}` : 'Descubre este increíble proyecto.';
  const description = `${descriptionSnippet} Unidades desde $${proyecto.precioDesde?.toLocaleString('es-DO') || 'N/A'}. Estado: ${proyecto.estado}. Ubicado en ${proyecto.ubicacion}.`;
  // Usar la imagen destacada para OpenGraph si existe, de lo contrario un placeholder.
  const imageUrl = proyecto.imagenDestacada || 'https://placehold.co/1200x630/cccccc/333333?text=Inmuebles+RD+Proyecto';

  return {
    title: title,
    description: description,
    keywords: [
      'proyecto inmobiliario',
      proyecto.ubicacion,
      proyecto.estado,
      'inversión',
      'apartamentos',
      'República Dominicana',
      proyecto.nombre.split(' ')[0],
    ].filter(Boolean) as string[],
    openGraph: {
      title: title,
      description: description,
      url: `https://www.tudominio.com/comprador/proyecto/${proyecto.slug}`,
      siteName: 'Inmuebles RD',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: proyecto.nombre,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://www.tudominio.com/comprador/proyecto/${proyecto.slug}`,
    },
  };
}

// Componente principal de la página de detalle del proyecto
export default async function ProyectoDetailPage({
  params,
}: ProyectoPageProps) {
  const projectSlug = params.slug;

  if (!projectSlug) {
    notFound();
  }

  // Obtener los datos del proyecto, incluyendo videoUrl e imagenes
  // Asegúrate de que `getProjectBySlug` en tu `lib/api.ts` y tu controlador backend
  // incluyan `videoUrl` y el array de `imagenes` para el modelo `Proyecto`.
  const data = await getProjectBySlug(projectSlug);
  const proyecto = data;

  if (!proyecto) {
    notFound();
  }

  // Prepara el array de URLs de imágenes para el Client Component ImageDisplay
  // Filtra cualquier URL que pueda ser null/undefined para evitar errores en el componente ImageDisplay.
  const imageUrlsForCarousel = proyecto.imagenes
    ?.map(img => img.url)
    .filter((url): url is string => typeof url === 'string' && url.trim() !== '') || [];

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 lg:px-10 bg-white shadow-xl rounded-2xl my-10 space-y-10">
      {/* Volver al catálogo */}
      <div>
        <Link href="/comprador/catalogo" className="inline-flex items-center text-azul-marino hover:underline">
          <ChevronLeft size={20} className="mr-1" />
          Volver al Catálogo
        </Link>
      </div>

      {/* Encabezado del Proyecto */}
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold text-grafito">{proyecto.nombre}</h1>
        <p className="flex items-center text-lg text-gray-600">
          <MapPin size={20} className="mr-2 text-red-500" />
          {proyecto.ubicacion}
        </p>
      </header>

      {/* Sección de Video y Carrusel de Imágenes */}
      {/* Si hay video, se muestra primero */}
      {proyecto.videoUrl && (
        <div className="w-full relative overflow-hidden rounded-xl shadow-lg aspect-video">
          <video controls className="w-full h-full object-cover">
            <source src={proyecto.videoUrl} type="video/mp4" />
            Tu navegador no soporta el tag de video.
          </video>
        </div>
      )}

      {/* Si hay imágenes, se muestra el carrusel ImageDisplay */}
      {/* Se usa `imageUrlsForCarousel` que contiene solo las URLs válidas */}
      {imageUrlsForCarousel.length > 0 && (
        <ImageDisplay
          imageUrls={imageUrlsForCarousel}
          altText={`Imágenes de ${proyecto.nombre}`}
        />
      )}
      {/* Fallback si no hay ni video ni imágenes */}
      {(!proyecto.videoUrl && imageUrlsForCarousel.length === 0) && (
        <div className="w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-lg">
          No hay medios disponibles para este proyecto.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-10 mt-8">
        {/* Detalles del proyecto */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2">Detalles del Proyecto</h2>
          <ul className="space-y-3 text-base text-gray-700">
            <li className="flex items-center">
              <Building className="text-gray-500 mr-2" size={20} />
              <strong className="mr-1">Estado:</strong> {proyecto.estado}
            </li>
            {proyecto.fechaEntregaEstimada && (
              <li className="flex items-center">
                <Calendar className="text-blue-500 mr-2" size={20} />
                <strong className="mr-1">Entrega estimada:</strong> {proyecto.fechaEntregaEstimada}
              </li>
            )}
            {proyecto.unidadesDisponibles != null && (
              <li className="flex items-center">
                <Package className="text-green-600 mr-2" size={20} />
                <strong className="mr-1">Unidades disponibles:</strong> {proyecto.unidadesDisponibles}
              </li>
            )}
            {proyecto.precioDesde && (
              <li className="flex items-center">
                <DollarSign className="text-oro-arenoso mr-2" size={20} />
                <strong className="mr-1">Desde:</strong> ${proyecto.precioDesde.toLocaleString('es-DO')}
              </li>
            )}
          </ul>

          {proyecto.amenidadesProyecto?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Amenidades</h3>
              <div className="flex flex-wrap gap-2">
                {proyecto.amenidadesProyecto.map((item, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Descripción */}
        <section>
          <h2 className="text-2xl font-semibold text-grafito border-b pb-2 mb-4">Descripción</h2>
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
            {proyecto.descripcion || 'No hay descripción disponible para este proyecto.'}
          </p>
        </section>
      </div>

      {/* Propiedades del proyecto */}
      {proyecto.propiedades?.length > 0 && (
        <section className="space-y-4 mt-10">
          <h2 className="text-2xl font-bold text-grafito">Unidades en este Proyecto</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyecto.propiedades.map((prop) => (
              <Link
                key={prop.id}
                href={`/comprador/propiedad/${prop.slug}`}
                className="group border rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <img
                  src={prop.imagenes?.[0]?.url || 'https://placehold.co/300x200'}
                  alt={prop.nombre}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-lg text-grafito group-hover:underline">
                    {prop.nombre}
                  </h3>
                  <p className="text-sm text-azul-marino font-bold">
                    ${prop.precio?.toLocaleString('es-DO')}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-600 mt-1">
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

      {/* Contacto */}
      <section className="mt-12 p-6 bg-gray-50 rounded-xl shadow-inner text-center">
        <h2 className="text-2xl font-semibold text-grafito mb-3">¿Interesado en este proyecto?</h2>
        <p className="text-gray-700 mb-6">Contáctanos para más información o agendar una visita.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${proyecto.usuarioVendedor.telefono || '+18095551234'}`}
            className="inline-flex items-center bg-azul-marino text-white px-6 py-3 rounded-lg hover:bg-indigo-800 transition shadow"
          >
            <Phone size={20} className="mr-2" /> Llamar
          </a>
          <a
            href={`mailto:${proyecto.usuarioVendedor.email}?subject=Consulta sobre proyecto: ${proyecto.nombre}`}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
          >
            <Mail size={20} className="mr-2" /> Correo
          </a>
          {proyecto.usuarioVendedor.whatsapp && (
            <a
              href={`https://wa.me/${proyecto.usuarioVendedor.whatsapp.replace(/\D/g, '')}?text=Hola! Estoy interesado en el proyecto: ${proyecto.nombre}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition shadow"
            >
              <MessageSquare size={20} className="mr-2" /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
