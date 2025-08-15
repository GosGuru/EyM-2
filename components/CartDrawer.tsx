"use client";
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "./CartContext";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, removeItem, increase, decrease, clear } = useCart();
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 transition-opacity" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-full max-w-md md:w-screen md:max-w-md bg-white shadow-2xl flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold uppercase tracking-wide text-eym-dark">Tu Carrito</h2>
                    <button onClick={onClose} aria-label="Cerrar carrito" className="text-2xl text-eym-dark hover:text-eym-accent-orange transition-colors">
                      &times;
                    </button>
                  </div>
                  {/* Contenido del carrito */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-16">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="9" cy="21" r="1" />
                          <circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                        <p className="text-eym-dark/70 text-center mb-6 font-sans font-medium">Tu carrito está vacío.<br />¡Agrega productos para comenzar tu compra!</p>
                        <Link href="/tienda" className="bg-eym-accent-orange hover:bg-eym-dark text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 uppercase tracking-wide font-sans">Ir a la tienda</Link>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {items.map((it) => (
                          <li key={it.id} className="flex gap-4">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                              {it.image ? (
                                <Image src={it.image} alt={it.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full grid place-items-center text-gray-300">No img</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-eym-dark truncate">{it.name}</p>
                              <p className="text-sm text-gray-500">${(it.price).toLocaleString('es-AR')}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <button className="px-2 py-1 border rounded" aria-label="Disminuir" onClick={() => decrease(it.id)}>-</button>
                                <span className="min-w-[2ch] text-center">{it.qty}</span>
                                <button className="px-2 py-1 border rounded" aria-label="Aumentar" onClick={() => increase(it.id)}>+</button>
                                <button className="ml-auto text-sm text-red-600 hover:underline" onClick={() => removeItem(it.id)}>Quitar</button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-gray-200 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subtotal</span>
                      <span className="font-bold text-eym-dark">${subtotal.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {items.length > 0 && (
                        <Link
                          href="/checkout"
                          aria-label="Finalizar compra"
                          className="inline-flex w-full sm:flex-1 items-center justify-center bg-eym-accent-orange bg-[#FF8C00] hover:bg-eym-dark hover:bg-[#1A1A1A] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 uppercase tracking-wide font-sans focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eym-accent-orange/70 shadow select-none"
                        >
                          Finalizar compra
                        </Link>
                      )}
                      {items.length > 0 && (
                        <button
                          className="px-4 py-3 border rounded-lg text-sm text-eym-dark hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                          onClick={clear}
                        >
                          Vaciar
                        </button>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 