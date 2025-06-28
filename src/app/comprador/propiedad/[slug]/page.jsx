import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Bed, Bath, DollarSign, Ruler, Phone, Mail, MessageSquare, MapPin, Tag, UserCircle2,
  Car, Building, ArrowUpSquare, Home, Calendar, CheckSquare, Film, Sparkles
} from 'lucide-react';

import { getPropertyBySlug } from '@/lib/api';
import ImageDisplay from '../../components/ImageDisplay';
import FavoriteButton from '../../components/FavoriteButton';

function DetailItem({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <li className="flex items-center gap-3">
      <Icon size={18} className="text-gray-600" />
      <span><strong>{label}:</strong> {value}</span>
    </li>
  );
}

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const propiedad = await getPropertyBySlug(params.slug);
  if (!propiedad) {
    return {
      title: "Propiedad No Encontrada | Bienes Raices RD",
      description: "La propiedad que buscas no ha sido encontrada.",
      robots: { index: false, follow: false },
    };
  }

  const imageUrl = propiedad.imagenes?.[0]?.url || 'https://placehold.co/1200x630/003366/FFFFFF?text=Bienes+Raices+RD';
  const pageUrl = `https://bienes-raices-rd-frontend-9gbu.vercel.app/comprador/propiedad/${propiedad.slug}`;

  return {
    title: `${propiedad.nombre} en ${propiedad.ubicacion} | Bienes Raices RD`,
    description: propiedad.descripcion || `Detalles sobre ${propiedad.nombre} en ${propiedad.ubicacion}.`,
    metadataBase: new URL('https://bienes-raices-rd-frontend-9gbu.vercel.app'),
    alternates: { canonical: pageUrl },
    openGraph: {
      title: propiedad.nombre,
      description: propiedad.descripcion || '',
      url: pageUrl,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: propiedad.nombre,
      description: propiedad.descripcion || '',
      images: [imageUrl],
    },
  };
}

export default async function PropiedadDetailPage({ params }) {
  const propiedad = await getPropertyBySlug(params.slug);
  if (!propiedad) notFound();

  const imageUrls = propiedad.imagenes?.map(img => img.url).filter(Boolean) || [];

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-12 animate-fade-in-down" role="main">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-grafito">{propiedad.nombre}</h1>
        <p className="text-lg text-gray-500 mt-2 flex justify-center items-center gap-2">
          <MapPin size={18} /> {propiedad.ubicacion}
        </p>
      </header>

      <div className="shadow-md rounded-xl overflow-hidden mb-10 relative">
        <ImageDisplay imageUrls={imageUrls} altText={`Galería de imágenes de ${propiedad.nombre}`} videoUrl={propiedad.videoUrl || null} />
        <FavoriteButton itemId={propiedad.id} itemType="propiedad" itemSlug={propiedad.slug} />
      </div>

      {propiedad.proyecto && (
        <section className="shadow-md p-6 rounded-2xl mb-12">
          <h2 className="text-2xl font-semibold text-grafito mb-4">Proyecto Asociado</h2>
          <p>Esta propiedad forma parte del proyecto:</p>
          <Link href={`/comprador/proyecto/${propiedad.proyecto.slug}`} className="text-blue-600 underline font-medium hover:text-blue-800">
            {propiedad.proyecto.nombre}
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="shadow-md p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-grafito mb-4">Detalles de la Propiedad</h2>
          <ul className="space-y-4 text-base text-gray-700">
            <DetailItem icon={DollarSign} label="Precio" value={`$${propiedad.precio?.toLocaleString('es-DO')}`} />
            <DetailItem icon={Tag} label="Tipo" value={propiedad.tipo} />
            <DetailItem icon={Bed} label="Habitaciones" value={propiedad.habitaciones} />
            <DetailItem icon={Bath} label="Baños" value={propiedad.baños} />
            <DetailItem icon={Car} label="Parqueos" value={propiedad.parqueos} />
            <DetailItem icon={Ruler} label="Área" value={propiedad.metros2 ? `${propiedad.metros2} m²` : null} />
            <DetailItem icon={Building} label="Nivel" value={propiedad.nivel} />
            <DetailItem icon={ArrowUpSquare} label="Ascensor" value={propiedad.ascensor ? 'Sí' : 'No'} />
            <DetailItem icon={Home} label="Amueblado" value={propiedad.amueblado ? 'Sí' : 'No'} />
            <DetailItem icon={DollarSign} label="Mantenimiento" value={propiedad.mantenimiento ? `$${propiedad.mantenimiento.toLocaleString('es-DO')}` : null} />
            <DetailItem icon={Calendar} label="Año Construcción" value={propiedad.anoConstruccion} />
            <DetailItem icon={CheckSquare} label="Gastos Legales" value={propiedad.gastosLegalesIncluidos ? 'Sí' : 'No'} />
            <DetailItem icon={Calendar} label="Disponible Desde" value={propiedad.disponibleDesde ? new Date(propiedad.disponibleDesde).toLocaleDateString('es-DO') : null} />
            <DetailItem icon={Film} label="Tour Virtual" value={
              propiedad.videoUrl && (
                <a href={propiedad.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Video</a>
              )
            } />
            <DetailItem icon={Sparkles} label="Tipo de Propiedad" value={propiedad.tipoPropiedad} />
            <DetailItem icon={Tag} label="Estado" value={propiedad.estado} />
          </ul>
        </div>

        <div className="shadow-md p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold text-grafito mb-4">Descripción</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{propiedad.descripcion || 'No hay descripción disponible.'}</p>
        </div>
      </div>


      <section className="shadow-md p-6 rounded-2xl mb-12 flex flex-col md:flex-row items-center md:items-start gap-6">
        <UserCircle2 size={60} className="text-gray-600" />
        <div>
          <h2 className="text-xl font-semibold text-grafito">Agente a cargo</h2>
          <p>{propiedad.usuarioVendedor.nombre || 'No disponible'}</p>
          <p className="text-sm text-gray-500">{propiedad.usuarioVendedor.email}</p>
          {propiedad.usuarioVendedor.telefono && (
            <p className="text-sm text-gray-500">Tel: {propiedad.usuarioVendedor.telefono}</p>
          )}
        </div>
      </section>

      <section className="shadow-md p-6 rounded-2xl mb-20">
        <h2 className="text-2xl font-semibold text-center mb-4">¿Te interesa esta propiedad?</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <input type="text" placeholder="Tu nombre" className="p-3 rounded-md border border-gray-200 shadow-sm" required />
          <input type="email" placeholder="Tu correo" className="p-3 rounded-md border border-gray-200 shadow-sm" required />
          <textarea placeholder="Tu mensaje" rows={4} className="md:col-span-2 p-3 rounded-md border border-gray-200 shadow-sm" required />
          <button type="submit" className="md:col-span-2 bg-gray-900 text-white py-3 px-6 rounded-md hover:opacity-90 transition">
            Enviar mensaje
          </button>
        </form>
      </section>

      <section className="shadow-md p-6 rounded-2xl mb-8 text-center">
        <h3 className="text-xl font-semibold mb-4">Contáctanos directamente</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`tel:${propiedad.usuarioVendedor.telefono}`} className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition">
            <Phone size={18} /> Llamar
          </a>
          <a href={`mailto:${propiedad.usuarioVendedor.email}?subject=Consulta sobre propiedad: ${encodeURIComponent(propiedad.nombre || '')}`} className="bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition">
            <Mail size={18} /> Correo
          </a>
          {propiedad.usuarioVendedor.whatsapp && (
            <a href={`https://wa.me/${propiedad.usuarioVendedor.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Estoy interesado en la propiedad: ${propiedad.nombre} (${propiedad.ubicacion})`)}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-700 transition">
              <MessageSquare size={18} /> WhatsApp
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
