'use client'; // Necesario para usar Hooks y Contextos en Next.js App Router

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react'; // Importar iconos de Lucide React
import toast from 'react-hot-toast'; // Para notificaciones

import { useAuth } from '@/context/AuthContext'; // Importar el hook useAuth

import logo from '../../public/logo.png'; // Ajusta esta ruta si es necesario

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Obtener el estado de autenticación y los datos del usuario desde el contexto
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // Mantener si hay dropdowns de usuario, etc.
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref para el dropdown (si se usa)
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref para el botón que abre el dropdown (si se usa)

  // Función para cerrar los menús (móvil y dropdown)
  const handleLinkClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await logout(); // Llama a la función de logout del AuthContext
      router.push('/auth/login'); // Redirige al login después de cerrar sesión
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
      toast.error('No se pudo cerrar la sesión correctamente.');
    } finally {
      handleLinkClick(); // Cierra cualquier menú abierto
    }
  };

  // Efecto para cerrar el dropdown al hacer clic fuera (si se usa un dropdown de perfil)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && // Asegurarse de que buttonRef.current no sea null
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determinar los enlaces de navegación y el botón de acción según el estado de autenticación y el rol
  const getNavLinks = () => {
    if (isLoading) {
      // Mientras carga la sesión, puedes mostrar un estado de "cargando" o simplemente nada
      return null; // O un spinner si lo prefieres
    } else if (!isAuthenticated) {
      return (
        // Caso: Sin sesión iniciada
        <>
          <Link href="/" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Inicio</Link>
          <Link href="/comprador/catalogo" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Catálogo</Link>
          <Link href="/nosotros" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Nosotros</Link>
          <Link
            href="/auth/login"
            className="bg-azul-marino text-white px-4 py-2 rounded hover:scale-110 hover:shadow-2xl transition font-semibold"
            onClick={handleLinkClick}
          >
            Iniciar Sesión
          </Link>
        </>
      );
    } else if (user?.rol === 'CLIENTE' || user?.rol === 'COMPRADOR') { // Asumiendo 'CLIENTE' como rol de comprador
      return (
        // Caso: Sesión iniciada como Comprador
        <>
          <Link href="/comprador/catalogo" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Catálogo</Link>
          <Link href="/comprador/favoritos" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Favoritos</Link>
          <button
            className="bg-azul-marino text-white px-4 py-2 rounded hover:scale-110 hover:shadow-2xl transition font-semibold"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else if (user?.rol === 'VENDEDOR') {
      return (
        // Caso: Sesión iniciada como Vendedor
        <>
          <Link href="/vendedor/productos" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Productos</Link>
          <Link href="/vendedor/propiedades" className="hover:bg-white hover:text-black px-4 py-2 rounded text-shadow-2xs" onClick={handleLinkClick}>Subir producto</Link>
          <button
            className="bg-azul-marino text-white px-4 py-2 rounded hover:scale-110 hover:shadow-2xl transition font-semibold"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </>
      );
    }
    // Caso por defecto si el rol no se reconoce (ej. ADMIN, u otro)
    // Puedes añadir más lógica aquí si tienes otros roles
    return null; 
  };

  const getMobileNavLinks = () => {
    if (isLoading) {
      return null;
    } else if (!isAuthenticated) {
      return (
        <>
          <Link href="/" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-beige-calido hover:text-verde-oliva transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-verde-oliva focus:ring-offset-2" onClick={handleLinkClick}>Inicio</Link>
          <Link href="/comprador/catalogo" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-beige-calido hover:text-verde-oliva transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-verde-oliva focus:ring-offset-2" onClick={handleLinkClick}>Catálogo</Link>
          <Link href="/nosotros" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-beige-calido hover:text-verde-oliva transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-verde-oliva focus:ring-offset-2" onClick={handleLinkClick}>Nosotros</Link>
          <Link href="/auth/login" className="bg-azul-marino text-white text-2xl font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-verde-oliva focus:ring-offset-2" onClick={handleLinkClick}>Iniciar Sesión</Link>
        </>
      );
    } else if (user?.rol === 'CLIENTE' || user?.rol === 'COMPRADOR') {
      return (
        <>
          <Link href="/comprador/catalogo" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Catálogo</Link>
          <Link href="/comprador/favoritos" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Favoritos</Link>
          <button 
            className="bg-azul-marino text-white text-2xl font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" 
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </>
      );
    } else if (user?.rol === 'VENDEDOR') {
      return (
        <>
          <Link href="/vendedor/productos" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Productos</Link>
          <Link href="/vendedor/propiedades" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Subir producto</Link>
          <button 
            className="bg-azul-marino text-white text-2xl font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" 
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-white shadow-md">
      {/* Contenido del header */}
      <div className="px-6 py-4 flex justify-between items-center w-full">
        <Link href="/" className="text-base font-bold tracking-wide flex items-center gap-2" onClick={handleLinkClick}>
          <Image src={logo} alt="Logo de Bienes Raíces" height={50} />
          <span className="text-azul-marino text-shadow-2xs">Bienes Raíces</span>
        </Link>

        {/* Menú escritorio */}
        <nav className="hidden md:flex space-x-6 font-medium items-center">
          {getNavLinks()}
        </nav>

        {/* Botón móvil */}
        <button
          className="md:hidden text-azul-marino z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-y-6 transform transition-transform duration-300 ease-out origin-top animate-fade-in-down">
          {getMobileNavLinks()}
        </div>
      )}
    </div>
  );
}
