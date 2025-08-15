'use client';

import { useState } from 'react';
import { useCart } from './CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const { setOpen, totalItems } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Navbar Principal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-eym-dark text-eym-light shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo/Nombre de marca */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-eym-accent-orange to-eym-accent-purple rounded-full mr-2"></div>
                <span className="font-display text-xl font-semibold tracking-wide">
                  EYM Indumentaria
                </span>
              </Link>
            </div>

            {/* Enlaces de navegación - Desktop */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link 
                  href="/tienda" 
                  className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium"
                >
                  Tienda
                </Link>
                <Link 
                  href="/novedades" 
                  className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium"
                >
                  Novedades
                </Link>
                <Link 
                  href="/categorias" 
                  className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium"
                >
                  Categorías
                </Link>
                <Link 
                  href="/contacto" 
                  className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium"
                >
                  Contacto
                </Link>
              </div>
            </div>

            {/* Iconos de acción - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Búsqueda */}
              <button className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Usuario */}
              <button className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              {/* Carrito */}
              <button onClick={() => setOpen(true)} className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 relative" aria-label="Abrir carrito">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                {/* Badge del carrito */}
                <span className="absolute -top-2 -right-2 bg-eym-accent-orange text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              </button>
            </div>

            {/* Botón hamburguesa - Móvil */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menú móvil overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Fondo oscuro */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          ></div>
          
          {/* Menú lateral */}
          <div className="fixed right-0 top-0 h-full w-80 bg-eym-dark shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              
              {/* Header del menú móvil */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <span className="font-display text-xl font-semibold text-eym-light">
                  Menú
                </span>
                <button
                  onClick={toggleMobileMenu}
                  className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enlaces de navegación móvil */}
              <div className="flex-1 px-6 py-4">
                <div className="space-y-4">
                  <Link 
                    href="/tienda" 
                    className="block text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Tienda
                  </Link>
                  <Link 
                    href="/novedades" 
                    className="block text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Novedades
                  </Link>
                  <Link 
                    href="/categorias" 
                    className="block text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Categorías
                  </Link>
                  <Link 
                    href="/contacto" 
                    className="block text-eym-light hover:text-eym-accent-orange transition-colors duration-200 font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Contacto
                  </Link>
                </div>
              </div>

              {/* Iconos de acción móvil */}
              <div className="px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-around">
                  <button className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  
                  <button className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  
                  <button onClick={() => { setOpen(true); setIsMobileMenuOpen(false); }} className="text-eym-light hover:text-eym-accent-orange transition-colors duration-200 p-2 relative" aria-label="Abrir carrito">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <span className="absolute -top-1 -right-1 bg-eym-accent-orange text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                      {totalItems}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Espaciador para el contenido debajo del navbar sticky */}
      <div className="h-16"></div>
    </>
  );
} 