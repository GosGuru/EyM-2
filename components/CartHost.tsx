"use client";
import CartDrawer from "./CartDrawer";
import { useCart } from "./CartContext";
import { useEffect, useState } from "react";

export default function CartHost() {
  const { open, setOpen, lastAddedName } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    if (!lastAddedName) return;
    setMsg(`${lastAddedName} agregado al carrito`);
    setShowToast(true);
    const t = setTimeout(() => setShowToast(false), 2400);
    return () => clearTimeout(t);
  }, [lastAddedName]);

  return (
    <>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
      {/* Toast visual con accesibilidad */}
      <div className={`fixed inset-x-0 bottom-3 md:bottom-5 z-50 pointer-events-none flex justify-center md:justify-end px-3 md:px-5 transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        <div role="status" aria-live="polite" aria-atomic className="pointer-events-auto rounded-lg bg-eym-dark text-white shadow-lg px-4 py-3 max-w-sm w-full md:w-auto">
          <span className="block text-sm font-medium">{msg}</span>
        </div>
      </div>
    </>
  );
}
