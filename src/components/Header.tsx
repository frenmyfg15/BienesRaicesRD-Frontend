'use client';

import Link from "next/link";



export const Header = () => {

    return (
        <header className="relative h-100 md:h-100 shadow-md text-white flex flex-col">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                >
                    <source src="/fondo.mp4" type="video/mp4" />
                    Tu navegador no soporta video en HTML5.
                </video>
            </div>
            <div className="flex flex-col flex-grow justify-center items-start max-w-xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-4 text-white text-shadow-2xs">
                    Tu nuevo hogar en República Dominicana
                </h1>
                <h2 className="text-base mb-6 text-white text-shadow-2xs">
                    Casas, apartamentos y más - Proyectos confiables y con visión
                </h2>
                <Link
                    className="bg-azul-marino text-white px-6 py-3 rounded-md hover:scale-105 hover:shadow-lg transition-transform duration-300"
                    aria-label="Ver proyectos"
                    href={'/comprador/catalogo'}
                >
                    Catálogo
                </Link>
            </div>

        </header>
    );
};
