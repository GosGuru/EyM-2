"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * Hook para navegación optimizada con View Transitions API
 * Fallback a transición suave si no es compatible
 */
export function useOptimizedNavigation() {
  const router = useRouter();

  // Función para navegar con View Transitions
  const navigateWithTransition = useCallback((href: string) => {
    // Verificar soporte de View Transitions API
    if (typeof window !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    } else {
      // Fallback a navegación normal
      router.push(href);
    }
  }, [router]);

  // Función para prefetch al hover
  const prefetchOnHover = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  return {
    navigateWithTransition,
    prefetchOnHover
  };
}

/**
 * Hook para prefetch automático cuando elementos entran en viewport.
 * Next.js Link ya gestiona el prefetch de viewport nativamente.
 */
export function usePrefetchOnViewport(_href: string, _enabled: boolean = true) {
  // No-op: Next.js <Link> realiza prefetch nativo sin sobrecargar observers.
}
