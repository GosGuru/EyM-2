"use client";
import { useFavoritos, Producto } from "./FavoritosContext";
import { usePrefetchRoute } from "../hooks/usePrefetchRoute";

interface BotonFavoritoProps {
  producto: Producto;
}

export default function BotonFavorito({ producto }: BotonFavoritoProps) {
  const { favoritos, toggleFavorito } = useFavoritos();
  const esFavorito = favoritos.some((p) => p.id === producto.id);
  const { prefetchOnHover } = usePrefetchRoute("/favoritos");
  
  return (
    <button
      className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-eym-accent-orange hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 ${esFavorito ? 'text-eym-accent-orange' : 'text-eym-dark'}`}
      onClick={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        toggleFavorito(producto); 
      }}
      onMouseEnter={prefetchOnHover}
      onFocus={prefetchOnHover}
      aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
      type="button"
    >
      {esFavorito ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
} 