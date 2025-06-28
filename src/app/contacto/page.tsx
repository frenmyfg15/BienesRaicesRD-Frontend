import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-12 md:py-20 max-w-5xl mx-auto">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-grafito mb-4">Contáctanos</h1>
        <p className="text-lg text-gray-600">
          ¿Tienes preguntas, necesitas más información o deseas agendar una visita?
          <br />
          Estamos aquí para ayudarte.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Formulario de contacto */}
        <form className="space-y-6 bg-gray-50 p-8 rounded-xl shadow-lg" aria-label="Formulario de contacto">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">Mensaje</label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={5}
              required
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-azul-marino focus:border-azul-marino"
              placeholder="Escribe tu mensaje aquí..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-azul-marino text-white py-3 rounded-md hover:bg-azul-marino/90 transition font-semibold"
          >
            Enviar mensaje
          </button>
        </form>

        {/* Información de contacto */}
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-grafito mb-4">Información de contacto</h2>
          <p className="text-gray-600">
            Si prefieres contactarnos directamente, utiliza los siguientes medios.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="text-green-600" />
              <a href="tel:+18095551234" className="text-gray-800 hover:underline">
                +1 (809) 555-1234
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="text-blue-600" />
              <a href="mailto:contacto@bienesraicesrd.com" className="text-gray-800 hover:underline">
                contacto@bienesraicesrd.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-red-600" />
              <p className="text-gray-800">Av. Winston Churchill 123, Santo Domingo, RD</p>
            </div>
          </div>

          <div className="mt-6">
            <iframe
              title="Ubicación oficina"
              src="https://maps.google.com/maps?q=Av.%20Winston%20Churchill%20123,%20Santo%20Domingo&t=&z=15&ie=UTF8&iwloc=&output=embed"
              className="w-full h-64 rounded-lg border"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
