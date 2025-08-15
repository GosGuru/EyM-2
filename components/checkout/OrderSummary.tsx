"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartContext";
import { CheckoutSummarySkeleton } from "../skeletons/CheckoutSkeleton";

interface OrderItem {
  id: number | string;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  quantity: number;
  lineTotal: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  shippingTotal: number;
  grandTotal: number;
  isLoading: boolean;
  onQuantityChange?: (id: number | string, newQty: number) => void;
  onRemoveItem?: (id: number | string) => void;
}

export default function OrderSummary({
  items,
  shippingTotal,
  grandTotal,
  isLoading,
  onQuantityChange,
  onRemoveItem
}: OrderSummaryProps) {
  const { increase, decrease, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);

  const handleQuantityChange = async (id: number | string, action: 'increase' | 'decrease') => {
    setIsUpdating(true);
    try {
      if (action === 'increase') {
        increase(id);
      } else {
        decrease(id);
      }
      onQuantityChange?.(id, action === 'increase' ? 1 : -1);
    } finally {
      // Simular tiempo de actualización para UX
      setTimeout(() => setIsUpdating(false), 300);
    }
  };

  const handleRemoveItem = (id: number | string) => {
    removeItem(id);
    onRemoveItem?.(id);
  };

  if (isLoading) {
    return <CheckoutSummarySkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Lista de productos */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b bg-gray-50 rounded-t-lg">
          <h2 className="font-semibold text-eym-dark flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Tu pedido ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </h2>
        </div>
        
        <div className="p-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>No hay productos en tu carrito</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  {/* Imagen del producto */}
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-eym-dark truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.price.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                    </p>
                  </div>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 'decrease')}
                      disabled={isUpdating}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-eym-accent-orange hover:bg-eym-accent-orange/10 transition-colors flex items-center justify-center disabled:opacity-50"
                      aria-label="Disminuir cantidad"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    
                    <span className="min-w-[2ch] text-center font-medium text-eym-dark">
                      {item.quantity}
                    </span>
                    
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 'increase')}
                      disabled={isUpdating}
                      className="w-8 h-8 rounded-full border border-gray-300 hover:border-eym-accent-orange hover:bg-eym-accent-orange/10 transition-colors flex items-center justify-center disabled:opacity-50"
                      aria-label="Aumentar cantidad"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Precio total */}
                  <div className="text-right min-w-[80px]">
                    <div className="font-semibold text-eym-dark">
                      {item.lineTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline mt-1"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resumen de totales */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {subtotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center gap-1">
                Envío
                {shippingTotal === 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    GRATIS
                  </span>
                )}
              </span>
              <span className="font-medium">
                {shippingTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })}
              </span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-eym-dark">Total</span>
                <span className="text-xl font-bold text-eym-dark">
                  {isUpdating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-eym-accent-orange border-t-transparent rounded-full animate-spin" />
                      <span className="text-gray-400">Actualizando...</span>
                    </div>
                  ) : (
                    grandTotal.toLocaleString('es-UY', { style: 'currency', currency: 'UYU' })
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información de confianza */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Pago 100% seguro con Mercado Pago</span>
        </div>
        
        <p className="text-xs text-gray-500">
          Protegemos tus datos y garantizamos la seguridad de tu compra
        </p>
      </div>
    </div>
  );
}
