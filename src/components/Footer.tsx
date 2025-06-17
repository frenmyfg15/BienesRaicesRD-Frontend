import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo.png";

import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 py-10 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 text-center md:text-left">
        {/* Logo y descripción */}
        <div className="flex flex-col items-center md:items-start">
          <Image src={logo} alt="Bienes Raices RD Logo" width={80} height={80} className="mb-4" />
          <p className="text-sm">
            Venta y alquileres de bienes raices en República Dominicana, gente de confianza y visión.
          </p>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-semibold mb-4">Contacto</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <FaPhoneAlt className="text-azul-marino" />
              <a href="tel:+34617547481">615 65 20 22</a>
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <FaEnvelope className="text-azul-marino" />
              <a href="mailto:info@brillohogar.es">info@bienesraicesrd.es</a>
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <FaMapMarkerAlt className="text-azul-marino" />
              Moca, Espaillat
            </li>
          </ul>
        </div>

        {/* Enlaces legales */}
        <div>
          <h3 className="font-semibold mb-4">Información legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacidad" className="hover:underline">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:underline">
                Política de Cookies
              </Link>
            </li>
            <li>
              <Link href="/politica" className="hover:underline">
                Política de la Empresa
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t mt-10 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Bienes Raices RD. Todos los derechos reservados.
      </div>
    </footer>
  )
}

