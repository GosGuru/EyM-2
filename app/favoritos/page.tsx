"use client";
import Image from "next/image";
import Link from "next/link";
import { useFavoritos } from "../../components/FavoritosContext";
import { useEffect, useState } from "react";
import { usePrefetchRoute } from "../../hooks/usePrefetchRoute";

export default function FavoritosPage() {
  const { favoritos, removeFavorito } = useFavoritos();
  const [view, setView] = useState<"grid" | "list">("grid");
  const { prefetchOnHover } = usePrefetchRoute("/tienda");

  // Cargar preferencia desde localStorage o usar 'list' por defecto en desktop
  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('favView') : null;
      if (saved === 'grid' || saved === 'list') {
        setView(saved);
      } else if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
        setView('list');
      }
    } catch {}
  }, []);

  // Guardar preferencia
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') localStorage.setItem('favView', view);
    } catch {}
  }, [view]);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold font-display tracking-wide">FAVORITOS</h1>
        {/* Controles de vista */}
        {favoritos.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("grid")}
              aria-label="Ver en cuadrícula"
              className={`h-10 w-10 rounded-lg border flex items-center justify-center transition ${view === "grid" ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-gray-300'}`}
            >
              {/* icon grid */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h8v8h-8v-8z"/></svg>
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="Ver en lista"
              className={`h-10 w-10 rounded-lg border flex items-center justify-center transition ${view === "list" ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-200 hover:border-gray-300'}`}
            >
              {/* icon list */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/></svg>
            </button>
          </div>
        )}
      </div>
      
      {favoritos.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-eym-gray-medium mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p className="text-eym-dark/70 text-lg mb-6">No tienes productos favoritos.</p>
          <Link 
            href="/tienda" 
            onMouseEnter={prefetchOnHover}
            className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange"
          >
            Explorar Productos
          </Link>
        </div>
      ) : (
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {favoritos.map((producto) => (
                <div key={producto.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-all">
                  {producto.imagen_url && (
                    <div className="relative aspect-square overflow-hidden">
                      <Image 
                        src={producto.imagen_url} 
                        alt={producto.nombre || `Producto ${producto.id}`} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-eym-dark text-base sm:text-lg mb-1 sm:mb-2 uppercase tracking-wide truncate">
                      {producto.nombre || `Producto ${producto.id}`}
                    </h3>
                    {producto.precio && (
                      <span className="font-bold text-base sm:text-lg text-eym-dark">
                        ${producto.precio.toLocaleString('es-AR')}
                      </span>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => removeFavorito(producto.id)}
                        className="text-eym-dark hover:text-eym-accent-orange transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange rounded"
                        aria-label="Eliminar de favoritos"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                      <button className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-3 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        Añadir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {favoritos.map((producto) => (
                <div key={producto.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch">
                  {producto.imagen_url && (
                    <div className="relative w-full sm:w-40 md:w-48 lg:w-56 aspect-square sm:aspect-[4/5] rounded-md overflow-hidden bg-gray-100">
                      <Image 
                        src={producto.imagen_url} 
                        alt={producto.nombre || `Producto ${producto.id}`} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 640px) 100vw, 200px"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-eym-dark text-lg mb-1 uppercase tracking-wide">
                      {producto.nombre || `Producto ${producto.id}`}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-eym-dark/70 text-sm mb-2 line-clamp-2">{producto.descripcion}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3">
                      {producto.precio && (
                        <span className="font-bold text-xl text-eym-dark">${producto.precio.toLocaleString('es-AR')}</span>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => removeFavorito(producto.id)}
                          className="text-eym-dark hover:text-eym-accent-orange transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange rounded"
                          aria-label="Eliminar de favoritos"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </button>
                        <button className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-4 py-2 rounded-lg transition text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                          Añadir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}