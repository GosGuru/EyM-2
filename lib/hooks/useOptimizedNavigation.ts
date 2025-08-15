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
 * Hook para prefetch automático cuando elementos entran en viewport
 */
export function usePrefetchOnViewport(href: string, enabled: boolean = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Prefetch lazy cuando el elemento entra en viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            router.prefetch(href);
            observer.disconnect(); // Solo hacer prefetch una vez
          }
        });
      },
      { 
        rootMargin: '100px', // Prefetch antes de que sea visible
        threshold: 0.1 
      }
    );

    return () => observer.disconnect();
  }, [href, enabled, router]);
}
