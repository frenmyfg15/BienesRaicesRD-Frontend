'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import logo from '../../public/logo.png';
import Link from 'next/link';

export default function CookiesBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('cookiesAccepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setVisible(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="animate-fadeInLeft fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-50 max-w-md md:max-w-xl bg-white border border-gray-200 shadow-xl rounded-2xl p-4 md:p-6 flex gap-4 items-start">
      <div className="w-10 h-10 relative shrink-0">
        <Image
          src={logo}
          alt="Logotipo Bienes Raices RD"
          fill
          className="object-contain"
        />
      </div>

      <div className="flex-1 text-sm md:text-base text-gray-700">
        <p className="mb-3">
          En <strong>Bienes Raices RD</strong> utilizamos cookies para mejorar tu experiencia, ofrecer servicios personalizados y analizar el uso del sitio.{' '}
          <Link href="/cookies" className="text-cyan-600 underline hover:text-cyan-800">
            Ver política de cookies
          </Link>.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={acceptCookies}
            className="bg-cyan-500 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded-full transition-all"
            aria-label="Aceptar cookies"
          >
            Aceptar
          </button>

          <button
            onClick={rejectCookies}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition-all"
            aria-label="Rechazar cookies"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  );
}
