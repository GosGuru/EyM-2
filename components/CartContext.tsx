"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: number | string;
  name: string;
  slug: string;
  price: number; // stored as number
  image?: string | null;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: CartItem["id"]) => void;
  clear: () => void;
  increase: (id: CartItem["id"]) => void;
  decrease: (id: CartItem["id"]) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  lastAddedName?: string | null;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "eym_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAddedName, setLastAddedName] = useState<string | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
  }, []);

  // persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem: CartContextType["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  try { setLastAddedName(item.name); } catch {}
    setOpen(true);
  };

  const removeItem: CartContextType["removeItem"] = (id) => setItems((prev) => prev.filter((p) => (p.id === id ? false : true)));
  const clear: CartContextType["clear"] = () => setItems([]);
  const increase: CartContextType["increase"] = (id) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: p.qty + 1 } : p)));
  const decrease: CartContextType["decrease"] = (id) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p)));

  const { totalItems, subtotal } = useMemo(() => {
    const totalItems = items.reduce((acc, it) => acc + it.qty, 0);
    const subtotal = items.reduce((acc, it) => acc + it.qty * (Number.isFinite(it.price) ? it.price : 0), 0);
    return { totalItems, subtotal };
  }, [items]);

  const value: CartContextType = {
    items,
    totalItems,
    subtotal,
    addItem,
    removeItem,
    clear,
    increase,
    decrease,
    open,
  setOpen,
  lastAddedName,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
