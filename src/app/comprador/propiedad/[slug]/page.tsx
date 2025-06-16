// app/comprador/propiedad/[slug]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Bed, Bath, DollarSign, Ruler, Phone, Mail, MessageSquare, MapPin, Tag, UserCircle2,
  Car, Building, ArrowUpSquare, Home, Calendar, CheckSquare, Film, Sparkles, Heart // Añadido Heart si se usa para el FavoriteButton aquí (aunque lo manejas en el componente)
} from 'lucide-react';
import { getPropertyBySlug } from '@/lib/api';
import ImageDisplay from '../../components/ImageDisplay';
import FavoriteButton from '../../components/FavoriteButton'; // Asegúrate de que este componente sea 'use client' si usa hooks de React

interface PropiedadPageProps {
  params: { slug: string };
}

// --- SEO: generateMetadata para metadatos dinámicos ---
export async function generateMetadata({ params }: PropiedadPageProps): Promise<Metadata> {
  const propiedad = await getPropertyBySlug(params.slug);
  if (!propiedad) {
    return {
      title: 'Propiedad no encontrada - Inmuebles RD',
      description: 'La propiedad que buscas no ha sido encontrada.',
      alternates: {
        canonical: `https://tuinmobiliaria.com/propiedad/${params.slug}`, // URL canónica
      },
    };
  }

  const imageUrl = propiedad.imagenes?.[0]?.url || 'https://placehold.co/1200x630/cccccc/333333?text=Inmueble+RD';
  const title = `${propiedad.nombre} en ${propiedad.ubicacion} - Inmuebles RD`;
  const description = propiedad.descripcion?.slice(0, 160) || `Descubre ${propiedad.nombre}, una impresionante ${propiedad.tipo} con ${propiedad.habitaciones || 'varias'} habitaciones y ${propiedad.baños || 'varios'} baños en ${propiedad.ubicacion}. ¡Encuentra tu hogar ideal!`;

  return {
    title,
    description,
    keywords: [`${propiedad.tipo}`, `${propiedad.ubicacion}`, 'inmobiliaria', 'venta', 'alquiler', 'casa', 'apartamento', 'solar', 'villa', 'República Dominicana', `${propiedad.nombre}`],
    openGraph: {
      title,
      description,
      url: `https://tuinmobiliaria.com/comprador/propiedad/${propiedad.slug}`, // URL específica para Open Graph
      siteName: 'Inmuebles RD',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: `Imagen principal de ${propiedad.nombre}` }],
      type: 'article', // O 'product' si aplica más
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@TuInmobiliariaRD', // O tu handle de Twitter
    },
    alternates: {
      canonical: `https://tuinmobiliaria.com/comprador/propiedad/${propiedad.slug}`, // URL canónica
    },
  };
}
// --- Fin generateMetadata ---


export default async function PropiedadDetailPage({ params }: PropiedadPageProps) {
  const propiedad = await getPropertyBySlug(params.slug);

  if (!propiedad) {
    notFound(); // Next.js maneja esto con la página 404 por defecto
  }

  const imageUrls = propiedad.imagenes?.map(img => img.url) || [];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in-down" role="main">
      {/* Título y ubicación */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-grafito" id="propiedad-title">{propiedad.nombre}</h1>
        <p className="text-lg text-gray-500 mt-2 flex justify-center items-center gap-2">
          <MapPin size={18} className="text-gray-500" aria-hidden="true" />
          <span className="sr-only">Ubicación:</span>
          {propiedad.ubicacion}
        </p>
      </header>

      {/* Galería principal y el botón de favoritos */}
      <div className="shadow-md rounded-xl overflow-hidden mb-10 relative">
        {/* Asume que ImageDisplay internamente usa next/image con props width, height, quality, sizes */}
        <ImageDisplay imageUrls={imageUrls} altText={`Galería de imágenes de ${propiedad.nombre}`} />
        
        {/* FavoriteButton debe ser un componente cliente ('use client') si usa estado o hooks */}
        <FavoriteButton
          itemId={propiedad.id}
          itemType="propiedad"
          itemSlug={propiedad.slug}
        />
      </div>

      {/* Proyecto relacionado */}
      {propiedad.proyecto && (
        <section className="shadow-md p-6 rounded-2xl mb-12" aria-labelledby="proyecto-heading">
          <h2 className="text-2xl font-semibold text-grafito mb-4" id="proyecto-heading">Proyecto Asociado</h2>
          <p className="text-base text-gray-700 mb-2">Esta propiedad forma parte del proyecto:</p>
          <Link
            href={`/comprador/proyecto/${propiedad.proyecto.slug}`}
            className="text-blue-600 underline text-lg font-medium hover:text-blue-800 transition-colors"
            aria-label={`Ver detalles del proyecto ${propiedad.proyecto.nombre}`}
          >
            {propiedad.proyecto.nombre}
          </Link>
        </section>
      )}

      {/* Detalles y descripción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Detalles */}
        <div className="shadow-md p-6 rounded-2xl" aria-labelledby="detalles-heading">
          <h2 className="text-2xl font-semibold text-grafito mb-4" id="detalles-heading">Detalles de la Propiedad</h2>
          <ul className="space-y-4 text-base text-gray-700" role="list">
            <li className="flex items-center gap-3">
              <DollarSign size={18} className="text-gray-600" aria-hidden="true" />
              <span><strong>Precio:</strong> ${propiedad.precio?.toLocaleString('es-DO') || 'N/A'}</span>
            </li>
            <li className="flex items-center gap-3">
              <Tag size={18} className="text-gray-600" aria-hidden="true" />
              <span><strong>Tipo:</strong> {propiedad.tipo || 'N/A'}</span>
            </li>
            <li className="flex items-center gap-3">
              <Bed size={18} className="text-gray-600" aria-hidden="true" />
              <span><strong>Habitaciones:</strong> {propiedad.habitaciones || 'N/A'}</span>
            </li>
            <li className="flex items-center gap-3">
              <Bath size={18} className="text-gray-600" aria-hidden="true" />
              <span><strong>Baños:</strong> {propiedad.baños || 'N/A'}</span>
            </li>
            {propiedad.parqueos !== undefined && propiedad.parqueos !== null && (
              <li className="flex items-center gap-3">
                <Car size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Parqueos:</strong> {propiedad.parqueos}</span>
              </li>
            )}
            {propiedad.metros2 && (
              <li className="flex items-center gap-3">
                <Ruler size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Área:</strong> {propiedad.metros2} m²</span>
              </li>
            )}
            {propiedad.nivel !== undefined && propiedad.nivel !== null && (
              <li className="flex items-center gap-3">
                <Building size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Nivel:</strong> {propiedad.nivel}</span>
              </li>
            )}
            {propiedad.ascensor !== undefined && propiedad.ascensor !== null && (
              <li className="flex items-center gap-3">
                <ArrowUpSquare size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Ascensor:</strong> {propiedad.ascensor ? 'Sí' : 'No'}</span>
              </li>
            )}
            {propiedad.amueblado !== undefined && propiedad.amueblado !== null && (
              <li className="flex items-center gap-3">
                <Home size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Amueblado:</strong> {propiedad.amueblado ? 'Sí' : 'No'}</span>
              </li>
            )}
            {propiedad.mantenimiento !== undefined && propiedad.mantenimiento !== null && (
              <li className="flex items-center gap-3">
                <DollarSign size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Mantenimiento:</strong> ${propiedad.mantenimiento.toLocaleString('es-DO')}</span>
              </li>
            )}
            {propiedad.anoConstruccion !== undefined && propiedad.anoConstruccion !== null && (
              <li className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Año Construcción:</strong> {propiedad.anoConstruccion}</span>
              </li>
            )}
            {propiedad.gastosLegalesIncluidos !== undefined && propiedad.gastosLegalesIncluidos !== null && (
              <li className="flex items-center gap-3">
                <CheckSquare size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Gastos Legales Incluidos:</strong> {propiedad.gastosLegalesIncluidos ? 'Sí' : 'No'}</span>
              </li>
            )}
            {propiedad.disponibleDesde && (
              <li className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Disponible Desde:</strong> {new Date(propiedad.disponibleDesde).toLocaleDateString('es-DO')}</span>
              </li>
            )}
            {propiedad.videoUrl && (
              <li className="flex items-center gap-3">
                <Film size={18} className="text-gray-600" aria-hidden="true" />
                <span>
                  <strong>Tour Virtual:</strong> <a href={propiedad.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" aria-label="Ver video tour virtual de la propiedad">Ver Video</a>
                </span>
              </li>
            )}
            {propiedad.tipoPropiedad && (
              <li className="flex items-center gap-3">
                <Sparkles size={18} className="text-gray-600" aria-hidden="true" />
                <span><strong>Tipo de Propiedad:</strong> {propiedad.tipoPropiedad}</span>
              </li>
            )}
            <li className="flex items-center gap-3">
              <span className="sr-only">Estado:</span>
              <strong>Estado:</strong> {propiedad.estado || 'N/A'}
            </li>
          </ul>
        </div>

        {/* Descripción */}
        <div className="shadow-md p-6 rounded-2xl" aria-labelledby="descripcion-heading">
          <h2 className="text-2xl font-semibold text-grafito mb-4" id="descripcion-heading">Descripción</h2>
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
            {propiedad.descripcion || 'No hay descripción disponible para esta propiedad.'}
          </p>
        </div>
      </div>

      {/* Tarjeta del agente */}
      <section className="shadow-md p-6 rounded-2xl mb-12 flex flex-col md:flex-row items-center md:items-start gap-6" aria-labelledby="agente-heading">
        <UserCircle2 size={60} className="text-gray-600" aria-hidden="true" />
        <div>
          <h2 className="text-xl font-semibold text-grafito" id="agente-heading">Agente a cargo</h2>
          <p className="text-gray-700">{propiedad.usuarioVendedor.nombre || 'Nombre no disponible'}</p>
          <p className="text-sm text-gray-500">{propiedad.usuarioVendedor.email}</p>
          {propiedad.usuarioVendedor.telefono && (
            <p className="text-sm text-gray-500">Tel: {propiedad.usuarioVendedor.telefono}</p>
          )}
        </div>
      </section>

      {/* Formulario de contacto */}
      <section className="shadow-md p-6 rounded-2xl mb-20" aria-labelledby="contacto-form-heading">
        <h2 className="text-2xl font-semibold text-grafito mb-4 text-center" id="contacto-form-heading">¿Te interesa esta propiedad?</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto" aria-label="Formulario de contacto para la propiedad">
          <input type="text" placeholder="Tu nombre" className="p-3 rounded-md border border-gray-200 shadow-sm" aria-label="Tu nombre" required />
          <input type="email" placeholder="Tu correo" className="p-3 rounded-md border border-gray-200 shadow-sm" aria-label="Tu correo electrónico" required />
          <textarea placeholder="Tu mensaje" rows={4} className="md:col-span-2 p-3 rounded-md border border-gray-200 shadow-sm" aria-label="Tu mensaje" required></textarea>
          <button
            type="submit"
            className="md:col-span-2 bg-gray-900 text-white py-3 px-6 rounded-md hover:opacity-90 transition"
          >
            Enviar mensaje
          </button>
        </form>
      </section>

      {/* Opciones de contacto rápidas */}
      <section className="shadow-md p-6 rounded-2xl mb-8 text-center" aria-labelledby="contacto-rapido-heading">
        <h3 className="text-xl font-semibold text-grafito mb-4" id="contacto-rapido-heading">Si lo prefieres, contáctanos vía:</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`tel:${propiedad.usuarioVendedor.telefono}`}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
            aria-label={`Llamar al agente: ${propiedad.usuarioVendedor.telefono}`}
          >
            <Phone size={18} aria-hidden="true" /> Llamar
          </a>
          <a
            href={`mailto:${propiedad.usuarioVendedor.email}?subject=Consulta sobre propiedad: ${encodeURIComponent(propiedad.nombre || '')}`}
            className="bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition"
            aria-label={`Enviar correo al agente: ${propiedad.usuarioVendedor.email}`}
          >
            <Mail size={18} aria-hidden="true" /> Correo
          </a>
          {propiedad.usuarioVendedor.whatsapp && (
            <a
              href={`https://wa.me/${propiedad.usuarioVendedor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Estoy interesado en la propiedad: ${propiedad.nombre} (${propiedad.ubicacion})`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
              aria-label={`Enviar mensaje de WhatsApp al agente: ${propiedad.usuarioVendedor.whatsapp}`}
            >
              <MessageSquare size={18} aria-hidden="true" /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}