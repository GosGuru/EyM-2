"use client";

import { m } from "framer-motion";
import { ReactNode } from "react";
import { MOTION_VARIANTS } from "../../lib/motion-tokens";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper para transiciones suaves entre páginas
 * Aplica fundido de entrada sin afectar el LCP
 */
export default function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <m.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={MOTION_VARIANTS.pageTransition}
      // Respeta prefers-reduced-motion
      style={{
        willChange: 'opacity'
      }}
    >
      {children}
    </m.div>
  );
}
