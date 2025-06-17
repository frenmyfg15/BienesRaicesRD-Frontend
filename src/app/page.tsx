import AdvantagesSection from "@/components/AdvantagesSection";
import FAQSection from "@/components/FAQSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import { Header } from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import logo from '../../public/logo.png'; // Importamos el logo para OpenGraph/Twitter

// --- Función para generar metadata específica para esta página ---
export async function generateMetadata() {
  const pageUrl = 'https://bienes-raices-rd-frontend-9gbu.vercel.app'; // Tu dominio principal

  return {
    // Título específico para la página de inicio
    title: "Bienes Raices RD | Casas, Apartamentos y Proyectos en Venta y Alquiler",
    // Descripción meta para los motores de búsqueda
    description: "Encuentra tu propiedad ideal en República Dominicana. Descubre una amplia selección de casas, apartamentos, solares, villas y proyectos inmobiliarios en venta y alquiler en Santo Domingo, Punta Cana y otras zonas. ¡Tu hogar perfecto te espera!",
    // Palabras clave relevantes para la página principal
    keywords: [
      "bienes raices rd",
      "propiedades republica dominicana",
      "casas en venta rd",
      "apartamentos en alquiler santo domingo",
      "proyectos inmobiliarios rd",
      "solares en venta republica dominicana",
      "inmuebles rd",
      "comprar casa rd",
      "agencia inmobiliaria republica dominicana",
      "venta y alquiler propiedades rd",
    ],
    // URL canónica para la página de inicio
    metadataBase: new URL(pageUrl),
    alternates: {
      canonical: pageUrl,
    },
    // OpenGraph metadata para compartir en redes sociales
    openGraph: {
      title: "Bienes Raices RD | Tu Portal Inmobiliario Líder en República Dominicana",
      description: "Descubre la mejor selección de propiedades en venta y alquiler en toda República Dominicana. Casas, apartamentos y proyectos para cada necesidad.",
      url: pageUrl,
      siteName: "Bienes Raices RD",
      images: [
        {
          url: logo.src, // Usamos el logo importado
          width: logo.width, // Ancho del logo
          height: logo.height, // Alto del logo
          alt: "Bienes Raices RD - Logo",
        },
      ],
      locale: 'es_DO',
      type: 'website',
    },
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title: "Bienes Raices RD | Encuentra Tu Hogar en República Dominicana",
      description: "Miles de propiedades en RD. Casas, apartamentos, solares y proyectos. ¡Tu búsqueda termina aquí!",
      creator: '@TuTwitterUser', // Opcional: tu usuario de Twitter si tienes uno
      images: [logo.src], // Usamos el logo importado
    },
    // Robots para indicar a los motores de búsqueda cómo indexar
    robots: {
      index: true,
      follow: true,
    },
  };
}
// -----------------------------------------------------------------

export default function Home() {
  return (
    <main className="">
      <Header/>
      <SearchBar/>
      <FeaturedCarousel/>
      <AdvantagesSection/>
      <FAQSection/>
    </main>
  );
}
