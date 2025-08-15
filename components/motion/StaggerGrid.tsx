"use client";

import { m } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { MOTION_VARIANTS } from "../../lib/motion-tokens";

interface StaggerGridProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
}

/**
 * Wrapper para grids con entrada escalonada de elementos
 * Los items aparecen uno tras otro con retardos mínimos
 */
export default function StaggerGrid({ 
  children, 
  className,
  itemClassName 
}: StaggerGridProps) {
  const [isReduced, setIsReduced] = useState(false);

  // Detectar prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReduced(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setIsReduced(e.matches);
    mediaQuery.addListener(handleChange);
    
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Si reduced motion está activo, no animar
  if (isReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial="initial"
      whileInView="animate"
      viewport={{ 
        once: true, 
        margin: "-80px 0px" 
      }}
      variants={MOTION_VARIANTS.staggerContainer}
    >
      {children}
    </m.div>
  );
}

/**
 * Item individual del grid con stagger
 */
export function StaggerItem({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string; 
}) {
  return (
    <m.div
      className={className}
      variants={MOTION_VARIANTS.staggerItem}
      style={{
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </m.div>
  );
}
