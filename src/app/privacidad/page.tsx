import React from 'react';

export const metadata = {
  title: "Política de Privacidad | Brillo Hogar",
  description: "Conoce cómo Brillo Hogar protege tus datos personales de forma segura y transparente.",
};

export default function PoliticaPrivacidad() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16 text-gray-800 mt-20">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Política de Privacidad</h1>
      
      <section className="space-y-6 text-sm md:text-base leading-relaxed">
        <p>
          En <strong>Brillo Hogar</strong>, nos comprometemos a proteger tu privacidad y garantizar que tus datos personales sean tratados de forma segura, confidencial y de acuerdo con la legislación vigente, incluyendo el Reglamento General de Protección de Datos (RGPD).
        </p>

        <h2 className="text-xl font-semibold">1. Responsable del tratamiento</h2>
        <p>
          <strong>Nombre comercial:</strong> Brillo Hogar<br />
          <strong>Teléfono:</strong> 617 547 481<br />
          <strong>Correo electrónico:</strong> info@brillohogar.com<br />
          <strong>Dirección:</strong> Valdemoro, Madrid, España
        </p>

        <h2 className="text-xl font-semibold">2. Finalidad del tratamiento</h2>
        <p>
          Los datos que nos proporcionas se utilizan exclusivamente para responder a tus solicitudes, gestionar presupuestos y prestar nuestros servicios de limpieza. No compartimos tus datos con terceros sin tu consentimiento expreso.
        </p>

        <h2 className="text-xl font-semibold">3. Derechos del usuario</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, cancelación, oposición, portabilidad y limitación del tratamiento escribiéndonos a nuestro correo electrónico o por vía telefónica.
        </p>

        <h2 className="text-xl font-semibold">4. Conservación de los datos</h2>
        <p>
          Conservamos tus datos solo durante el tiempo necesario para cumplir con las finalidades para las que fueron recogidos, así como para cumplir con obligaciones legales.
        </p>

        <h2 className="text-xl font-semibold">5. Seguridad de los datos</h2>
        <p>
          Aplicamos medidas técnicas y organizativas adecuadas para garantizar la confidencialidad, integridad y disponibilidad de tu información personal.
        </p>

        <h2 className="text-xl font-semibold">6. Cambios en esta política</h2>
        <p>
          Esta política puede actualizarse periódicamente. Te recomendamos revisarla cada cierto tiempo para estar informado.
        </p>
      </section>
    </main>
  );
}
