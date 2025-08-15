"use client";
import { useState, useRef, useEffect } from "react";
import supabase from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import CartDrawer from "./CartDrawer";
import SearchIcon from "./ui/SearchIcon";
import { useFavoritos } from "./FavoritosContext";
import { useCart } from "./CartContext";

// Cliente Supabase centralizado desde lib/supabase

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: "Sale", href: "/sale" },
  { name: "Tienda", href: "/tienda" },
  { name: "Novedades", href: "/novedades" },
  { name: "Categorías", href: "/categorias" },
  { name: "Contacto", href: "/contacto" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuAnimatingOut, setMenuAnimatingOut] = useState(false);
  const {
    favoritos,
    setFavoritos,
    addFavorito,
    removeFavorito,
    toggleFavorito,
  } = useFavoritos();
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [adminUser, setAdminUser] = useState<any>(null);
  const { totalItems, setOpen: setCartDrawerOpen } = useCart();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setAdminUser(data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAdminUser(session?.user ?? null);
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Cierra el menú con animación de salida
  const closeMobileMenu = () => {
    setMenuAnimatingOut(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMenuAnimatingOut(false);
    }, 350); // Duración igual a la animación
  };

  // Detecta scroll para alternar estado fixed del nav
  useEffect(() => {
    const onScroll = () => setIsFixed(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Medir altura del nav para spacer cuando está fixed y en resize
  useEffect(() => {
    const measure = () => {
      if (navRef.current)
        setNavHeight(navRef.current.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Re medir al cambiar fixed (tras aplicar clases de padding)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (navRef.current)
        setNavHeight(navRef.current.getBoundingClientRect().height);
    });
    return () => cancelAnimationFrame(id);
  }, [isFixed]);

  return (
    <header className="w-full" suppressHydrationWarning>
      {/* Barra superior de anuncio */}
      <div className="bg-black text-white text-xs py-2 px-4 flex justify-between items-center">
        <p className="font-light">30% OFF en todo* ¡Comprá ahora!</p>
        <p className="font-light hidden sm:block">
          Envíos gratis a todo el país en compras superiores a $50.000
        </p>
      </div>
      {/* Navegación principal (pasa a fixed con animación) */}
      <nav
        ref={navRef}
        className={`${
          isFixed ? "fixed top-0 left-0 right-0 z-50" : ""
        } border-b transition-[padding,background,box-shadow] duration-300
        ${
          isFixed
            ? "py-2 bg-white shadow-sm border-gray-200"
            : "py-4 bg-white border-gray-200"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          {/* Logo + texto */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 font-bold text-base sm:text-lg uppercase text-eym-dark tracking-wide font-display min-w-0 max-w-[60vw]"
          >
            <div
              className={`relative ${
                isFixed ? "w-7 h-7 sm:w-9 sm:h-9" : "w-8 h-8 sm:w-10 sm:h-10"
              } flex-shrink-0`}
            >
              <Image
                src="/assets/logo/508345866_17844952938509402_1750017635773048389_n.jpg"
                alt="Logo EYM Indumentaria"
                fill
                sizes="(max-width: 640px) 2rem, (max-width: 768px) 2.25rem, 2.5rem"
                className="object-cover rounded-full"
                priority
              />
            </div>
            <span className="truncate hidden sm:flex items-center whitespace-nowrap">
              EYM Indumentaria
            </span>
          </Link>
          {/* Enlaces de navegación - Desktop */}
          <ul className="hidden md:flex space-x-6 uppercase text-sm font-semibold tracking-wide">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="hover:text-eym-accent-orange transition-colors duration-200"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          {/* Iconos de utilidad */}
          <div className="flex items-center gap-3 text-lg">
            {/* Admin dashboard link (solo si logueado) */}
            {adminUser && (
              <Link
                href="/admin"
                className="text-eym-dark hover:text-white font-bold text-sm px-2 py-1 rounded border border-eym-accent-orange bg-eym-accent-orange hover:bg-eym-accent-orange/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 transition-colors duration-200"
              >
                Admin
              </Link>
            )}
            {/* Buscar */}
            <div className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-eym-dark hover:text-eym-accent-orange hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 transition-colors">
              <SearchIcon size={20} className="text-current" showModal={true} />
            </div>
            {/* Wishlist */}
            <Link
              href="/favoritos"
              className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-eym-dark hover:text-eym-accent-orange hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 transition-colors"
              aria-label="Favoritos"
              onClick={closeMobileMenu}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              {favoritos.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-eym-accent-orange text-white text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center ring-1 ring-white shadow-sm"
                  aria-live="polite"
                >
                  {favoritos.length}
                </span>
              )}
            </Link>
            {/* Carrito */}
            <button
              className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full text-eym-dark hover:text-eym-accent-orange hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 transition-colors"
              aria-label="Carrito"
              onClick={() => setCartDrawerOpen(true)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-eym-accent-orange text-white text-[10px] font-semibold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center ring-1 ring-white shadow-sm">
                {totalItems}
              </span>
            </button>
            {/* Menú hamburguesa - Mobile */}
            <button
              className="block md:hidden text-2xl ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </div>
        </div>
        {/* Menú mobile animado y con fondo blur */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Fondo negro con transparencia y blur, cierra al hacer click */}
            <div
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={closeMobileMenu}
            ></div>
            {/* Menú lateral animado alineado a la izquierda */}
            <div
              ref={menuRef}
              className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white shadow-lg p-6 flex flex-col z-50 transition-none
              ${
                menuAnimatingOut
                  ? "animate-slide-out-left"
                  : "animate-slide-in-left"
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg uppercase text-eym-dark tracking-wider font-display">
                  EYM Indumentaria
                </span>
                <button onClick={closeMobileMenu} aria-label="Cerrar menú">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul className="flex flex-col space-y-6 uppercase text-base font-medium mb-8">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="hover:text-eym-accent-orange transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex space-x-6 mt-auto">
                {/* Iconos mobile */}
                <div onClick={closeMobileMenu}>
                  <SearchIcon className="hover:opacity-75 transition-opacity w-6 h-6" />
                </div>
                <button
                  className="hover:opacity-75 transition-opacity"
                  aria-label="Favoritos"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <button
                  className="hover:opacity-75 transition-opacity"
                  aria-label="Cuenta"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M6 20c0-2.21 3.58-4 6-4s6 1.79 6 4" />
                  </svg>
                </button>
                <button
                  className="hover:opacity-75 transition-opacity relative"
                  aria-label="Carrito"
                  onClick={() => {
                    closeMobileMenu();
                    setCartDrawerOpen(true);
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  <span className="absolute -top-2 -right-2 bg-eym-accent-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer para evitar salto de layout cuando el nav es fixed */}
      {isFixed && <div style={{ height: navHeight }} aria-hidden="true" />}
      {/* Drawer del carrito se monta globalmente con CartHost */}
    </header>
  );
}
