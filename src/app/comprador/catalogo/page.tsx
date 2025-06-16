// src/app/comprador/propiedad/[slug]/page.tsx

// Elimina todas las importaciones que no sean estrictamente necesarias para la estructura básica
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Deja la interfaz PropiedadPageProps como está
interface PropiedadPageProps {
  params: { slug: string };
}

// Deja generateMetadata, pero simplifícala al máximo para la prueba
export async function generateMetadata({ params }: PropiedadPageProps): Promise<Metadata> {
  // No llames a getPropertyBySlug por ahora. Retorna metadatos estáticos.
  return {
    title: `Propiedad ${params.slug} - Inmuebles RD`,
    description: 'Detalles de la propiedad.',
  };
}

// Simplifica el componente de la página al mínimo
export default async function PropiedadDetailPage({ params }: PropiedadPageProps) {
  // Solo para asegurarnos de que se reconoce la prop 'params'
  const slug = params.slug;

  // No llames a getPropertyBySlug
  // if (!propiedad) {
  //   notFound();
  // }

  return (
    <main style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Página de Propiedad (Depuración)</h1>
      <p>Slug: {slug}</p>
      <p>Si ves esto, la página se compiló correctamente con su estructura básica.</p>
    </main>
  );
}