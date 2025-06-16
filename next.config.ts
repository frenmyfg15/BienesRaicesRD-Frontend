// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'placehold.co'], // Añade aquí los dominios de donde Next.js puede cargar imágenes
  },
};

module.exports = nextConfig;