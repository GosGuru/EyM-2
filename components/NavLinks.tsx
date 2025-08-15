"use client";

import OptimizedLink from "./ui/OptimizedLink";

interface NavLink {
  name: string;
  href: string;
}

interface NavLinksProps {
  links: NavLink[];
  className?: string;
  itemClassName?: string;
  onLinkClick?: () => void;
}

/**
 * Componente de navegación optimizado con prefetch automático
 * para mejorar la percepción de velocidad
 */
export default function NavLinks({ 
  links, 
  className = "",
  itemClassName = "",
  onLinkClick 
}: NavLinksProps) {
  return (
    <nav className={className}>
      {links.map((link) => (
        <OptimizedLink
          key={link.href}
          href={link.href}
          className={itemClassName}
          prefetchOnHover={true}
          prefetchOnViewport={true}
          onClick={onLinkClick}
        >
          {link.name}
        </OptimizedLink>
      ))}
    </nav>
  );
}
