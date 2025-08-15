"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Producto {
  id: string | number;
  [key: string]: any;
}

interface FavoritosContextType {
  favoritos: Producto[];
  setFavoritos: React.Dispatch<React.SetStateAction<Producto[]>>;
  addFavorito: (producto: Producto) => void;
  removeFavorito: (productoId: string | number) => void;
  toggleFavorito: (producto: Producto) => void;
}

export const FavoritosContext = createContext<FavoritosContextType | undefined>(undefined);

export function FavoritosProvider({ children }: { children: ReactNode }) {
  const [favoritos, setFavoritos] = useState<Producto[]>([]);

  const addFavorito = (producto: Producto) => {
    setFavoritos((prev) => [...prev, producto]);
  };
  const removeFavorito = (productoId: string | number) => {
    setFavoritos((prev) => prev.filter((p) => p.id !== productoId));
  };
  const toggleFavorito = (producto: Producto) => {
    if (favoritos.some((p) => p.id === producto.id)) {
      removeFavorito(producto.id);
    } else {
      addFavorito(producto);
    }
  };

  useEffect(() => {
    const favs = localStorage.getItem("favoritos");
    if (favs) setFavoritos(JSON.parse(favs));
  }, []);
  useEffect(() => {
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  }, [favoritos]);

  return (
    <FavoritosContext.Provider value={{ favoritos, setFavoritos, addFavorito, removeFavorito, toggleFavorito }}>
      {children}
    </FavoritosContext.Provider>
  );
}

export function useFavoritos() {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error("useFavoritos debe usarse dentro de FavoritosProvider");
  }
  return context;
} 