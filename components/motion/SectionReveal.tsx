"use client";

import { m } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { MOTION_VARIANTS } from "../../lib/motion-tokens";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Wrapper para reveal de secciones al hacer scroll
 * Aparece con opacidad y ligero desplazamiento vertical
 */
export default function SectionReveal({ 
  children, 
  className, 
  delay = 0 
}: SectionRevealProps) {
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
        margin: "-50px 0px" // Trigger antes de que sea totalmente visible
      }}
      variants={{
        ...MOTION_VARIANTS.sectionReveal,
        animate: {
          ...MOTION_VARIANTS.sectionReveal.animate,
          transition: {
            ...MOTION_VARIANTS.sectionReveal.transition,
            delay
          }
        }
      }}
      style={{
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </m.div>
  );
}
