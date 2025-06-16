import React from 'react';

export const metadata = {
  title: "Política de la Empresa | Brillo Hogar",
  description: "Consulta la política de empresa de Brillo Hogar. Comprometidos con la transparencia, la calidad del servicio y la satisfacción del cliente.",
};

export default function PoliticaEmpresa() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-gray-800 mt-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Política de la Empresa</h1>

      <section className="space-y-6 text-sm md:text-base leading-relaxed">
        <p>
          En <strong>Brillo Hogar</strong>, nos regimos por principios de calidad, integridad y responsabilidad. Nuestra política empresarial está diseñada para garantizar servicios de limpieza eficientes, seguros y confiables, en beneficio de nuestros clientes y del equipo humano que forma parte de nuestra empresa.
        </p>

        <h2 className="text-xl font-semibold">Compromiso con la calidad</h2>
        <p>
          Todos nuestros servicios se realizan conforme a estándares exigentes de limpieza profesional. Nos aseguramos de utilizar productos ecológicos, equipos adecuados y técnicas eficaces para lograr resultados impecables en cada intervención.
        </p>

        <h2 className="text-xl font-semibold">Atención al cliente</h2>
        <p>
          La satisfacción del cliente es una prioridad. Escuchamos activamente sus necesidades y sugerencias, y adaptamos nuestros servicios para ofrecer soluciones personalizadas y efectivas.
        </p>

        <h2 className="text-xl font-semibold">Seguridad y confianza</h2>
        <p>
          Todo nuestro personal pasa por un proceso de selección riguroso. Promovemos un entorno de trabajo seguro, ético y respetuoso, asegurando la confianza tanto en hogares como en espacios comerciales.
        </p>

        <h2 className="text-xl font-semibold">Sostenibilidad</h2>
        <p>
          En Brillo Hogar, apostamos por prácticas sostenibles. Minimizar el impacto ambiental es parte de nuestra política mediante el uso de productos biodegradables y procesos responsables con el entorno.
        </p>

        <h2 className="text-xl font-semibold">Actualización constante</h2>
        <p>
          Revisamos y mejoramos regularmente nuestras políticas internas, formación de personal y métodos de trabajo para mantenernos a la vanguardia del sector de la limpieza profesional.
        </p>

        <p>
          Si deseas más información sobre nuestras políticas o deseas hacernos llegar alguna consulta, puedes escribirnos a: <strong>info@brillohogar.com</strong>
        </p>
      </section>
    </main>
  );
}
