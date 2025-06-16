import React from 'react';

export const metadata = {
  title: "Política de Cookies | Brillo Hogar",
  description: "Consulta nuestra política de cookies. Actualmente no utilizamos cookies, pero mantenemos el compromiso con tu privacidad.",
};

export default function PoliticaCookies() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-gray-800 mt-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Política de Cookies</h1>

      <section className="space-y-6 text-sm md:text-base leading-relaxed">
        <p>
          En <strong>Brillo Hogar</strong> valoramos tu privacidad y transparencia. Por eso, te informamos que actualmente <strong>no utilizamos cookies propias ni de terceros</strong> en nuestro sitio web.
        </p>

        <h2 className="text-xl font-semibold">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que los sitios web pueden instalar en tu navegador para almacenar información, como preferencias de usuario, estadísticas o datos de sesión.
        </p>

        <h2 className="text-xl font-semibold">Nuestro compromiso</h2>
        <p>
          Aunque actualmente no usamos cookies, si en el futuro decidimos implementar herramientas que las requieran (como Google Analytics o integraciones con redes sociales), actualizaremos esta política y solicitaremos tu consentimiento previo.
        </p>

        <h2 className="text-xl font-semibold">¿Tienes dudas?</h2>
        <p>
          Si tienes preguntas sobre nuestra política de cookies o cómo protegemos tu información, puedes contactarnos a través de nuestro correo: <strong>info@brillohogar.com</strong>
        </p>
      </section>
    </main>
  );
}
