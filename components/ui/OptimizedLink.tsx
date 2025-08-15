"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useOptimizedNavigation, usePrefetchOnViewport } from "../../lib/hooks/useOptimizedNavigation";

interface OptimizedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnViewport?: boolean;
  useViewTransitions?: boolean;
  [key: string]: any;
}

/**
 * Enlace optimizado con prefetch inteligente y View Transitions
 */
export default function OptimizedLink({
  href,
  children,
  className,
  prefetchOnHover = true,
  prefetchOnViewport = false,
  useViewTransitions = true,
  ...props
}: OptimizedLinkProps) {
  const { navigateWithTransition, prefetchOnHover: handlePrefetchHover } = useOptimizedNavigation();

  // Prefetch automático en viewport si está habilitado
  usePrefetchOnViewport(href, prefetchOnViewport);

  const handleClick = (e: React.MouseEvent) => {
    // Solo usar View Transitions en navegación programática si está habilitado
    if (useViewTransitions && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      
      // Disparar evento para TopLoader
      window.dispatchEvent(new CustomEvent('navigation:start'));
      
      navigateWithTransition(href);
      
      // Finalizar loading después de un delay corto
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigation:end'));
      }, 300);
    }
    // Si no, Link de Next.js maneja la navegación
  };

  const handleMouseEnter = () => {
    if (prefetchOnHover) {
      handlePrefetchHover(href);
    }
  };

  return (
    <Link
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
