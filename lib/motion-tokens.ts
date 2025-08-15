// Tokens de motion siguiendo las mejores prácticas de performance y accesibilidad

export const MOTION_TOKENS = {
  // Duraciones optimizadas para percepción rápida
  duration: {
    pageTransition: 180,     // Transiciones entre páginas
    sectionReveal: 160,      // Aparición de secciones
    stagger: 80,             // Retardo entre elementos
    microInteraction: 140,   // Hover/focus
  },

  // Desplazamientos sutiles para reveals
  displacement: {
    reveal: 12,              // Movimiento Y para aparición
    hover: 2,                // Movimiento sutil en hover
  },

  // Easing curves para fluidez natural
  easing: {
    smooth: [0.25, 0.1, 0.25, 1],           // Suave y natural
    snappy: [0.4, 0, 0.2, 1],               // Más dinámico
    gentle: [0.25, 0.46, 0.45, 0.94],       // Muy suave
  },

  // Configuración de stagger para grids
  stagger: {
    container: {
      delayChildren: 0.1,
      staggerChildren: 0.06,
    },
    item: {
      y: 8,
      opacity: 0,
    }
  }
} as const;

// Variantes reutilizables para componentes
export const MOTION_VARIANTS = {
  // Transición de página
  pageTransition: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { 
      duration: MOTION_TOKENS.duration.pageTransition / 1000,
      ease: MOTION_TOKENS.easing.smooth 
    }
  },

  // Reveal de sección en scroll
  sectionReveal: {
    initial: { 
      opacity: 0, 
      y: MOTION_TOKENS.displacement.reveal 
    },
    animate: { 
      opacity: 1, 
      y: 0 
    },
    transition: { 
      duration: MOTION_TOKENS.duration.sectionReveal / 1000,
      ease: MOTION_TOKENS.easing.gentle 
    }
  },

  // Container para stagger
  staggerContainer: {
    animate: {
      transition: {
        delayChildren: MOTION_TOKENS.stagger.container.delayChildren,
        staggerChildren: MOTION_TOKENS.stagger.container.staggerChildren,
      }
    }
  },

  // Items individuales del stagger
  staggerItem: {
    initial: MOTION_TOKENS.stagger.item,
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: MOTION_TOKENS.duration.sectionReveal / 1000,
        ease: MOTION_TOKENS.easing.smooth 
      }
    }
  }
} as const;
