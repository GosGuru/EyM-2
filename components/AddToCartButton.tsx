"use client";
import { useCart } from "./CartContext";
import { useState } from "react";
import { HiShoppingBag } from "react-icons/hi";
import { Spinner } from "./ui/Spinner";

export default function AddToCartButton({
  id,
  name,
  slug,
  price,
  image,
  size = 40,
  ariaLabel = "Agregar al carrito",
  variant = "light",
  className = "",
}: {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  image?: string | null;
  size?: number; // px
  ariaLabel?: string;
  variant?: "light" | "dark"; // light: fondo blanco; dark: fondo negro
  className?: string;
}) {
  const { addItem } = useCart();
  const [busy, setBusy] = useState(false);
  const baseBtn = "inline-flex items-center justify-center rounded-full shadow-md ring-1 ring-black/5 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 transition duration-200 hover:scale-105 active:scale-95 hover:shadow-lg";
  const variantCls =
    variant === "dark"
      ? "bg-black text-white hover:bg-white hover:text-eym-dark"
      : "bg-white/90 text-eym-dark hover:bg-eym-accent-orange hover:text-white";
  
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-busy={busy}
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation();
        if (busy) return;
        setBusy(true);
        try {
          addItem({ id, name, slug, price: Number.isFinite(price) ? price : 0, image: image || undefined });
        } finally {
          // Small delay to avoid rapid double-tap on mobile
          setTimeout(() => setBusy(false), 250);
        }
      }}
      className={`${baseBtn} ${variantCls} ${busy ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {busy ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        <HiShoppingBag className="w-6 h-6" aria-hidden="true" />
      )}
    </button>
  );
}
