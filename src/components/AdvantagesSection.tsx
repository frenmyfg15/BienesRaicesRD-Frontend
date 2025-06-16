import React from 'react';
import { Award, DollarSign, Users, MapPin, Smile, TrendingUp } from 'lucide-react'; // Iconos de Lucide React

export default function AdvantagesSection() {
  const advantages = [
    {
      icon: Award,
      title: 'Experiencia y Reconocimiento',
      description: 'Años de trayectoria en el mercado inmobiliario dominicano, garantizando un servicio de calidad y resultados probados.',
    },
    {
      icon: DollarSign,
      title: 'Mejor Valor para tu Inversión',
      description: 'Te ayudamos a encontrar propiedades que se ajusten a tu presupuesto y maximicen el retorno de tu inversión.',
    },
    {
      icon: Users,
      title: 'Asesoría Personalizada',
      description: 'Nuestro equipo te acompaña en cada paso, desde la búsqueda hasta el cierre, con atención dedicada y profesional.',
    },
    {
      icon: MapPin,
      title: 'Conocimiento Local Profundo',
      description: 'Dominamos las mejores ubicaciones y tendencias del mercado en todo el territorio dominicano.',
    },
    {
      icon: Smile,
      title: 'Satisfacción del Cliente',
      description: 'Priorizamos tu felicidad, asegurando una experiencia de compra o venta sin estrés y exitosa.',
    },
    {
      icon: TrendingUp,
      title: 'Oportunidades de Crecimiento',
      description: 'Identificamos las propiedades con mayor potencial de revalorización y desarrollo futuro.',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-neutral-100 to-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-grafito mb-6 drop-shadow-sm">
          ¿Por qué elegir <span className="text-azul-marino">Bienes Raíces RD</span>?
        </h2>
        <p className="text-lg text-gray-700 mb-12 max-w-3xl mx-auto">
          Nos dedicamos a transformar tu búsqueda en una experiencia sencilla y gratificante. Descubre nuestras ventajas competitivas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg border border-neutral-200 flex flex-col items-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="bg-oro-arenoso p-4 rounded-full text-white mb-6 shadow-md">
                <advantage.icon size={36} strokeWidth={2} /> {/* Renderiza el icono dinámicamente */}
              </div>
              <h3 className="text-2xl font-bold text-grafito mb-3">{advantage.title}</h3>
              <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
