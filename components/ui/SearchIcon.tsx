"use client";

import { useState } from "react";
import SearchModal from "../SearchModal";

interface SearchIconProps {
  className?: string;
  size?: number;
  showModal?: boolean;
  iconOnly?: boolean; // Para mostrar solo el icono sin botón interactivo
}

/**
 * Componente reutilizable del icono de búsqueda con modal integrado
 * Usado en Header, páginas 404 y otros lugares donde necesitemos búsqueda
 */
export default function SearchIcon({ 
  className = "", 
  size = 24,
  showModal = true,
  iconOnly = false
}: SearchIconProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleClick = () => {
    if (showModal && !iconOnly) {
      setSearchOpen(true);
    }
  };

  // Calcular clases de tamaño dinámicamente
  const sizeClass = size >= 32 ? 'w-12 h-12' : size >= 24 ? 'w-6 h-6' : size >= 20 ? 'w-5 h-5' : 'w-4 h-4';

  const iconSvg = (
    <svg 
      className={`${sizeClass} ${className}`}
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  // Si es solo icono, devolver el SVG directamente
  if (iconOnly) {
    return iconSvg;
  }

  return (
    <>
      <button 
        className={`group relative inline-flex items-center justify-center text-eym-dark hover:text-eym-accent-orange transition-colors`}
        aria-label="Buscar productos" 
        onClick={handleClick}
      >
        {iconSvg}
      </button>
      
      {showModal && (
        <SearchModal 
          open={searchOpen} 
          onClose={() => setSearchOpen(false)} 
        />
      )}
    </>
  );
}
