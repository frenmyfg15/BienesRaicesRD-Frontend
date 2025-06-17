// app/nosotros/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import logo from '../../../public/logo.png';
import FAQSection from '@/components/FAQSection';

export const metadata: Metadata = {
    title: "Sobre Nosotros | Bienes Raices RD",
    description: "Conoce a Bienes Raices RD: misión, visión y valores. Expertos en conectar personas con propiedades ideales en República Dominicana.",
    keywords: [
        "inmobiliaria República Dominicana",
        "bienes raíces RD",
        "sobre nosotros",
        "visión y misión",
        "valores inmobiliaria",
    ],
    openGraph: {
        title: "Sobre Nosotros | Bienes Raices RD",
        description: "Descubre quiénes somos y por qué somos tu aliado ideal en el mundo inmobiliario.",
        url: "https://bienes-raices-rd-frontend-9gbu.vercel.app/nosotros",
        images: [
            {
                url: logo.src,
                width: logo.width,
                height: logo.height,
                alt: "Logo Bienes Raices RD",
            },
        ],
        locale: 'es_DO',
        siteName: "Bienes Raices RD",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Sobre Nosotros | Bienes Raices RD",
        description: "Conoce nuestra historia, misión y compromiso en el sector inmobiliario dominicano.",
        images: [logo.src],
    },
    metadataBase: new URL('https://bienes-raices-rd-frontend-9gbu.vercel.app'),
    alternates: { canonical: "/nosotros" },
};

export default function NosotrosPage() {
    return (
        <main className="max-w-5xl mx-auto px-6 py-20 text-grafito">
            {/* Hero */}
            <section className="text-center mb-20">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    Sobre <span className="text-azul-marino">Bienes Raices RD</span>
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-grafito">
                    Transformamos sueños en realidad. Tu aliado estratégico en el mercado inmobiliario dominicano.
                </p>
            </section>

            {/* Misión / Visión / Valores */}
            <section className="grid gap-10 md:grid-cols-3 mb-20">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-azul-marino hover:shadow-xl transition">
                    <h2 className="text-xl font-bold text-azul-marino mb-2">Nuestra Misión</h2>
                    <p>Conectar personas con propiedades ideales a través de honestidad, transparencia y excelencia.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-azul-marino hover:shadow-xl transition">
                    <h2 className="text-xl font-bold text-grafito mb-2">Nuestra Visión</h2>
                    <p>Ser la inmobiliaria más confiable e innovadora en República Dominicana.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-oro-arenoso hover:shadow-xl transition">
                    <h2 className="text-xl font-bold text-oro-arenoso mb-2">Nuestros Valores</h2>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li><strong>Integridad:</strong> Ética y transparencia.</li>
                        <li><strong>Excelencia:</strong> Buscamos superar expectativas.</li>
                        <li><strong>Compromiso:</strong> Total con el cliente.</li>
                        <li><strong>Innovación:</strong> Mejora continua.</li>
                    </ul>
                </div>
            </section>

            {/* Por Qué Elegirnos */}
            <section className="text-center mb-20">
                <h2 className="text-3xl font-bold mb-10">¿Por Qué Elegirnos?</h2>
                <div className="grid md:grid-cols-2 gap-8 text-left">
                    {[
                        {
                            title: "Conocimiento Local Profundo",
                            text: "Asesoría estratégica gracias a nuestra experiencia local.",
                            color: "azul-marino"
                        },
                        {
                            title: "Atención Personalizada",
                            text: "Servicio adaptado a tus necesidades específicas.",
                            color: "oro-arenoso"
                        },
                        {
                            title: "Tecnología de Vanguardia",
                            text: "Tours virtuales, filtros inteligentes y más.",
                            color: "azul-marino"
                        },
                        {
                            title: "Confianza y Seguridad",
                            text: "Operaciones legales, seguras y transparentes.",
                            color: "oro-arenoso"
                        }
                    ].map(({ title, text, color }) => (
                        <div
                            key={title}
                            className={`p-6 bg-marfil-suave rounded-xl shadow-md border-l-4 border-${color} hover:shadow-lg transition`}
                        >
                            <h3 className={`text-lg font-semibold text-${color} mb-2`}>{title}</h3>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-azul-marino text-white p-10 rounded-xl shadow-xl text-center mb-20">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">¿Listo para tu próxima inversión?</h2>
                <p className="mb-6 text-lg">Déjanos ayudarte a encontrar la propiedad perfecta en República Dominicana.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/comprador/catalogo">
                        <span className="bg-white text-azul-marino py-3 px-8 rounded-full font-bold hover:bg-gray-100 transition">
                            Explorar Propiedades
                        </span>
                    </Link>
                </div>
            </section>

            {/* Nuestra Historia */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center text-grafito mb-6">Nuestra Historia</h2>
                <p className="text-lg text-grafito text-center max-w-3xl mx-auto">
                    Fundada en 2010, Bienes Raices RD ha crecido desde una pequeña agencia local hasta convertirse en una firma reconocida a nivel nacional por su excelencia, innovación y enfoque humano. Nuestra trayectoria está marcada por miles de transacciones exitosas y relaciones duraderas con nuestros clientes.
                </p>
            </section>

            {/* Nuestro Equipo */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center text-grafito mb-10">Nuestro Equipo</h2>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <img src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg" alt="Julia, CEO" className="rounded-full mx-auto mb-4 w-28 h-28 object-cover" />
                        <h3 className="text-lg font-semibold text-azul-marino">Julia Martínez</h3>
                        <p className="text-sm text-grafito">Directora Ejecutiva</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" alt="Eduardo, CFO" className="rounded-full mx-auto mb-4 w-28 h-28 object-cover" />
                        <h3 className="text-lg font-semibold text-azul-marino">Eduardo Ramírez</h3>
                        <p className="text-sm text-grafito">Director Financiero</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg" alt="Luz, Agente" className="rounded-full mx-auto mb-4 w-28 h-28 object-cover" />
                        <h3 className="text-lg font-semibold text-azul-marino">Luz Pérez</h3>
                        <p className="text-sm text-grafito">Agente Senior</p>
                    </div>
                </div>
            </section>

            {/* Certificaciones y Alianzas */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center text-grafito mb-6">Certificaciones y Alianzas</h2>
                <p className="text-center text-lg text-grafito max-w-3xl mx-auto mb-6">
                    Contamos con certificaciones oficiales del Instituto Nacional de Tasadores (INAVI), y somos miembros activos de la Asociación Dominicana de Agentes Inmobiliarios (ADAI).
                </p>
                <div className="flex justify-center gap-6 flex-wrap">
                    <img src="https://placehold.co/120x60?text=ADAI&font=source-sans" alt="ADAI" className="h-12" />
                    <img src="https://placehold.co/120x60?text=INAVI&font=source-sans" alt="INAVI" className="h-12" />
                    <img src="https://placehold.co/120x60?text=ProPartner&font=source-sans" alt="ProPartner" className="h-12" />
                </div>
            </section>

            {/* Responsabilidad Social */}
            <section className="mb-20">
                <h2 className="text-3xl font-bold text-center text-grafito mb-6">Compromiso Social</h2>
                <p className="text-lg text-grafito text-center max-w-3xl mx-auto">
                    Nos enorgullece colaborar con fundaciones locales en programas de vivienda digna, reforestación y educación financiera para comunidades vulnerables. Creemos que el éxito debe compartirse.
                </p>
            </section>

            {/* FAQ (resumen) */}
            <FAQSection />

        </main>
    );
}
