import React from 'react'
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "../../../../public/logo.png"
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext'; // Importar el hook useAuth

export default function Header() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false); // Mantener si es necesario para otros dropdowns
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    // Obtener la función de logout y el estado de autenticación del contexto
    const { logout, isAuthenticated, isLoading } = useAuth(); 

    // Función para cerrar el menú y dropdowns al hacer clic en un enlace
    const handleLinkClick = () => {
        setMenuOpen(false);
        setDropdownOpen(false);
    };

    // Función que se ejecuta al hacer clic en "Cerrar Sesión"
    const handleLogout = async () => {
        try {
            await logout(); // Llama a la función de logout proporcionada por el AuthContext
            router.push('/auth/login'); // Redirige al login después de cerrar sesión
        } catch (error) {
            console.error("Error al intentar cerrar sesión:", error);
            toast.error("No se pudo cerrar la sesión correctamente.");
        } finally {
            handleLinkClick(); // Cierra el menú móvil/dropdown después de la acción
        }
    };

    // Efecto para cerrar el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // No necesitamos un estado de carga aquí que bloquee el renderizado del header,
    // ya que el layout principal ya maneja el isLoading global.
    // Solo necesitamos saber si el usuario está autenticado para mostrar el botón de logout.

    return (
        <div className="bg-white shadow-md"> {/* Añadí un fondo y sombra para el header */}
            {/* Contenido del header */}
            <div className="px-6 py-4 flex justify-between items-center w-full">
                <Link href="/" className="text-base font-bold tracking-wide flex items-center gap-2" onClick={handleLinkClick}>
                    <Image src={logo} alt="Logo" height={50} />
                    <span className="text-azul-marino text-shadow-2xs">Bienes Raíces</span>
                </Link>

                {/* Menú escritorio */}
                <nav className="hidden md:flex space-x-6 font-medium items-center">
                    {/* Solo muestra los enlaces del panel de vendedor si está autenticado */}
                    {isAuthenticated && !isLoading && (
                        <>
                            <Link href="/vendedor/productos" className="text-grafito hover:bg-neutral-100 px-4 py-2 rounded transition-colors duration-200" onClick={handleLinkClick}>Productos</Link>
                            <Link href="/vendedor/propiedades" className="text-grafito hover:bg-neutral-100 px-4 py-2 rounded transition-colors duration-200" onClick={handleLinkClick}>Subir producto</Link>
                        </>
                    )}
                    {/* Mostrar Cerrar Sesión si está autenticado, Iniciar Sesión si no */}
                    {isAuthenticated && !isLoading ? (
                        <button
                            className="bg-azul-marino text-white px-4 py-2 rounded hover:scale-105 hover:shadow-lg transition font-semibold"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    ) : (
                        // Opcional: Mostrar botón de Iniciar Sesión para el catálogo
                        <Link href="/auth/login" className="bg-verde-lima text-white px-4 py-2 rounded hover:scale-105 hover:shadow-lg transition font-semibold" onClick={handleLinkClick}>
                            Iniciar Sesión
                        </Link>
                    )}
                </nav>

                {/* Botón móvil */}
                <button
                    className="md:hidden text-azul-marino z-50"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menú"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Menú móvil */}
            {menuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-y-6 transform transition-transform duration-300 ease-out origin-top animate-fade-in-down">
                    {isAuthenticated && !isLoading && (
                        <>
                            <Link href="/vendedor/productos" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Productos</Link>
                            <Link href="/vendedor/propiedades" className="text-black text-2xl font-semibold py-2 px-4 rounded-lg hover:bg-neutral-100 hover:text-azul-marino transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" onClick={handleLinkClick}>Subir producto</Link>
                        </>
                    )}
                    {isAuthenticated && !isLoading ? (
                        <button 
                            className="bg-azul-marino text-white text-2xl font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2" 
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    ) : (
                        <Link href="/auth/login" className="bg-verde-lima text-white text-2xl font-bold py-3 px-8 rounded-full shadow-lg hover:bg-opacity-90 hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-verde-lima focus:ring-offset-2" onClick={handleLinkClick}>
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
