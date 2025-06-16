'use client'; // Necesario para usar Hooks de React en Next.js App Router

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react'; // Iconos para expandir/contraer

export default function FAQSection() {
  // Estado para controlar qué pregunta está abierta (almacena el índice)
  // null significa que ninguna está abierta, el número es el índice de la pregunta abierta
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Datos de las preguntas frecuentes
  const faqs = [
    {
      question: '¿Qué tipo de propiedades ofrecen?',
      answer: 'Ofrecemos una amplia variedad de propiedades, incluyendo apartamentos, casas, villas, locales comerciales, solares y propiedades en proyectos residenciales, tanto para compra como para alquiler en toda la República Dominicana.',
    },
    {
      question: '¿Cómo puedo buscar una propiedad?',
      answer: 'Puedes utilizar nuestra barra de búsqueda en la página de inicio o el catálogo para aplicar filtros por tipo de inmueble, ubicación, rango de precios, número de habitaciones y baños. También puedes explorar nuestros proyectos destacados.',
    },
    {
      question: '¿Necesito registrarme para ver las propiedades?',
      answer: 'No, no es necesario registrarse para explorar nuestro catálogo de propiedades y proyectos. Sin embargo, registrarte te permitirá guardar propiedades en favoritos y acceder a servicios personalizados.',
    },
    {
      question: '¿Cómo puedo contactar a un vendedor?',
      answer: 'En la página de detalle de cada propiedad o proyecto, encontrarás la información de contacto del vendedor asociado (nombre, email, teléfono, WhatsApp). Puedes contactarlo directamente a través de los datos proporcionados.',
    },
    {
      question: '¿Ofrecen asesoría legal o financiera?',
      answer: 'Si bien no ofrecemos asesoría legal o financiera directa, podemos referirte a una red de profesionales confiables en esos campos para facilitar tu proceso de compra o venta de propiedades.',
    },
    {
      question: '¿Qué diferencia hay entre una propiedad y un proyecto?',
      answer: 'Una "propiedad" generalmente se refiere a un inmueble individual existente (casa, apartamento, solar). Un "proyecto" es un desarrollo inmobiliario que puede incluir múltiples unidades (apartamentos o villas) en distintas fases de construcción o ya terminadas, con amenidades compartidas.',
    },
  ];

  // Función para alternar la visibilidad de una respuesta
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-extrabold text-grafito text-center mb-10 drop-shadow-sm">
          Preguntas <span className="text-azul-marino">Frecuentes</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className="flex justify-between items-center w-full p-5 text-left text-lg font-semibold text-grafito bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp size={24} className="text-azul-marino" />
                ) : (
                  <ChevronDown size={24} className="text-grafito" />
                )}
              </button>
              {openIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  className="px-5 py-4 bg-white text-gray-700 leading-relaxed border-t border-gray-200 animate-fade-in"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
