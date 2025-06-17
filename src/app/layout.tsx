import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import Footer from "@/components/Footer";
import Head from "@/components/Head"; // Asumo que este Head es tu componente de navegación/cabecera
import { AuthProvider } from "@/context/AuthContext";
import CookiesBanner from "@/components/CookiesBanner";
import logo from '../../public/logo.png';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
});

export const metadata: Metadata = {
  // Título principal del sitio, aparecerá en la pestaña del navegador y resultados de búsqueda
  title: {
    default: "Bienes Raices RD | Casas, Apartamentos y Proyectos en República Dominicana",
    template: "%s | Bienes Raices RD", // Para títulos de página específicos (ej: Propiedad X | Bienes Raices RD)
  },
  // Descripción meta para los motores de búsqueda
  description: "Encuentra tu propiedad ideal en República Dominicana. Descubre casas, apartamentos, solares, villas y proyectos inmobiliarios en venta y alquiler en Santo Domingo, Punta Cana y más. Tu mejor opción inmobiliaria en RD.",
  // Palabras clave relevantes para tu negocio
  keywords: [
    "bienes raices rd",
    "propiedades republica dominicana",
    "casas en venta rd",
    "apartamentos en alquiler santo domingo",
    "proyectos inmobiliarios rd",
    "solares en venta",
    "villas en alquiler",
    "inmuebles rd",
    "compra venta propiedades republica dominicana",
    "agencia inmobiliaria rd",
    "bienes raices santo domingo",
    "alquiler rd",
    "venta propiedades rd",
  ],
  // URL canónica del sitio (ayuda a prevenir contenido duplicado)
  metadataBase: new URL('https://www.tudominio.com'), // <-- ¡IMPORTANTE! Reemplaza con tu dominio real
  alternates: {
    canonical: '/',
  },
  // OpenGraph metadata para compartir en redes sociales (Facebook, LinkedIn, WhatsApp, etc.)
  openGraph: {
    title: "Bienes Raices RD | Tu Portal Inmobiliario en República Dominicana",
    description: "Explora la mayor oferta de propiedades en venta y alquiler en RD. Encuentra casas, apartamentos y proyectos adaptados a tus necesidades.",
    url: "https://www.tudominio.com", // <-- ¡IMPORTANTE! Reemplaza con tu dominio real
    siteName: "Bienes Raices RD",
    images: [
      {
        url: logo.src, // <-- Reemplaza con la URL de tu logo o una imagen representativa (1200x630px es ideal)
        width: 1200,
        height: 630,
        alt: "Bienes Raices RD - Logo o Imagen de Bienvenida",
      },
    ],
    locale: 'es_DO', // Idioma y región (Español de República Dominicana)
    type: 'website',
  },
  // Twitter Card metadata para compartir en Twitter
  twitter: {
    card: 'summary_large_image',
    title: "Bienes Raices RD | Propiedades en Venta y Alquiler",
    description: "Descubre miles de propiedades en República Dominicana. Casas, apartamentos y proyectos para todos los gustos y presupuestos.",
    creator: '@TuTwitterUser', // <-- Opcional: Reemplaza con tu usuario de Twitter
    images: ['https://placehold.co/1200x630/003366/FFFFFF?text=Bienes+Raices+RD'], // Misma imagen que OpenGraph
  },
  // Robots para indicar a los motores de búsqueda cómo indexar tu sitio
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Otros meta tags útiles
  // viewport: 'width=device-width, initial-scale=1', // Suele ser añadido por Next.js automáticamente, pero puedes forzarlo
  // themeColor: '#003366', // Color de tema para la barra del navegador en móviles
  // author: 'Tu Nombre o Empresa',
  // publisher: 'Tu Nombre o Empresa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
      >
        <AuthProvider>
          <Toaster />
          <Head/>
          {children}
          <Footer />
          <CookiesBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
