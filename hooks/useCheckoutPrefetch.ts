"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CHECKOUT_ROUTES = [
  '/checkout/exito',
  '/checkout/pendiente', 
  '/checkout/error',
  '/tienda',
  '/terminos',
  '/privacidad'
];

export function useCheckoutPrefetch() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch rutas críticas del checkout de forma progresiva
    const prefetchRoutes = async () => {
      for (const route of CHECKOUT_ROUTES) {
        try {
          router.prefetch(route);
          // Esperar un poco entre prefetches para no sobrecargar
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.warn(`Failed to prefetch ${route}:`, error);
        }
      }
    };

    // Iniciar prefetch después de que se monte el componente
    const timer = setTimeout(prefetchRoutes, 1000);
    
    return () => clearTimeout(timer);
  }, [router]);
}

export default useCheckoutPrefetch;
