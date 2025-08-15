"use client";

import { LazyMotion, domAnimation } from "framer-motion";
import { ReactNode } from "react";

interface MotionProviderProps {
  children: ReactNode;
}

/**
 * Proveedor global de Framer Motion usando LazyMotion para bundle size óptimo
 * Solo carga las funciones de animación necesarias (domAnimation)
 */
export default function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
