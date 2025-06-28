'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  Home,
  ShoppingBag,
  Info,
  LogIn,
  LogOut,
  Heart,
  PackagePlus,
  X,
  Menu,
  Phone,
  User,
  ClipboardList,
  LayoutDashboard,
  DollarSign,
  LifeBuoy,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import logo from '../../public/logo.png';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error al intentar cerrar sesión:', error);
      toast.error('No se pudo cerrar la sesión correctamente.');
    } finally {
      handleLinkClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const baseLinkClass =
    'flex items-center gap-2 text-base font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none';
  const primaryBtnClass =
    'flex items-center gap-2 text-base font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none cursor-pointer';

  const getMobileNavLinks = () => {
    if (isLoading) return null;

    const unauthenticatedLinks = (
      <>
        <Link
          href="/"
          className={`${baseLinkClass} text-black hover:bg-beige-calido hover:text-verde-oliva focus:ring-verde-oliva`}
          onClick={handleLinkClick}
        >
          <Home size={20} /> Inicio
        </Link>
        <Link
          href="/comprador/catalogo"
          className={`${baseLinkClass} text-black hover:bg-beige-calido hover:text-verde-oliva focus:ring-verde-oliva`}
          onClick={handleLinkClick}
        >
          <ShoppingBag size={20} /> Catálogo
        </Link>
        <Link
          href="/nosotros"
          className={`${baseLinkClass} text-black hover:bg-beige-calido hover:text-verde-oliva focus:ring-verde-oliva`}
          onClick={handleLinkClick}
        >
          <Info size={20} /> Nosotros
        </Link>
        <Link
          href="/contacto"
          className={`${baseLinkClass} text-black hover:bg-beige-calido hover:text-verde-oliva focus:ring-verde-oliva`}
          onClick={handleLinkClick}
        >
          <Phone size={20} /> Contacto
        </Link>
        <Link href="/auth/login" className={`${primaryBtnClass} hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`} onClick={handleLinkClick}>
          <LogIn size={20} /> Iniciar Sesión
        </Link>
      </>
    );

    const clienteLinks = (
      <>
        <Link
          href="/comprador/catalogo"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <ShoppingBag size={20} /> Catálogo
        </Link>
        <Link
          href="/comprador/favoritos"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <Heart size={20} /> Favoritos
        </Link>
        <Link
          href="/comprador/pedidos"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <ClipboardList size={20} /> Mis Pedidos
        </Link>
        <Link
          href="/comprador/perfil"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <User size={20} /> Perfil
        </Link>
        <Link
          href="/ayuda"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <LifeBuoy size={20} /> Soporte
        </Link>
        <button className={`${primaryBtnClass} hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`} onClick={handleLogout}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </>
    );

    const vendedorLinks = (
      <>
        <Link
          href="/vendedor/dashboard"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link
          href="/vendedor/productos"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <ShoppingBag size={20} /> Productos
        </Link>
        <Link
          href="/vendedor/propiedades"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <PackagePlus size={20} /> Subir producto
        </Link>
        <Link
          href="/vendedor/ventas"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <DollarSign size={20} /> Ventas
        </Link>
        <Link
          href="/vendedor/perfil"
          className={`${baseLinkClass} text-black hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`}
          onClick={handleLinkClick}
        >
          <User size={20} /> Perfil
        </Link>
        <button className={`${primaryBtnClass} hover:bg-neutral-100 hover:text-azul-marino focus:ring-azul-marino`} onClick={handleLogout}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </>
    );

    if (!isAuthenticated) return unauthenticatedLinks;
    if (user?.rol === 'CLIENTE' || user?.rol === 'COMPRADOR') return clienteLinks;
    if (user?.rol === 'VENDEDOR') return vendedorLinks;

    return null;
  };

  return (
    <header className="w-full shadow-sm bg-white dark:bg-neutral-900">
      <div className="px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          onClick={handleLinkClick}
        >
          <Image src={logo} alt="Logo Bienes Raíces" height={50} />
          <span className="text-azul-marino dark:text-white">Bienes Raíces</span>
        </Link>

        {/* Menú escritorio */}
        <nav className="hidden md:flex items-center gap-6">{getMobileNavLinks()}</nav>

        {/* Botón menú móvil */}
        <button
          className="md:hidden text-azul-marino dark:text-white z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú móvil tipo drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-2/3 sm:w-1/2 bg-white dark:bg-neutral-800 z-40 shadow-lg transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col p-6 gap-4">{getMobileNavLinks()}</div>
      </div>

      {/* Capa de fondo si drawer está abierto */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-opacity-25 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
