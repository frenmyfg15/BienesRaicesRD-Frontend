// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'placehold.co'], // Añade aquí los dominios de donde Next.js puede cargar imágenes
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    // Solo para un caso MUY específico y temporal.
    // REMUEVE ESTO DESPUÉS DE LA DEMO.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;