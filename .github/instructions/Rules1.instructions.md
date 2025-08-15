---
applyTo: '**'
---

# Regla más importante --> Hablarme siempre en español

# Reglas de Desarrollo — EYM Indumentaria Web (Headless Woo + Next.js)

## 0) Propósito
- Frontend: **Next.js** (App Router, TypeScript, Tailwind).  
- Backend: **WordPress + WooCommerce (REST API)** en modo headless.  
- Objetivo: UX rápida, accesible y fácil de mantener. Nada de llamadas a Woo desde el navegador.

---

## 1) Principios UX/UI
- **Mobile-first**. Diseño limpio, jerarquía clara, espacios generosos.
- **Contraste AA mínimo**. Nunca texto blanco sobre fondo blanco (arreglar banners/pills).
- **Feedback inmediato**: skeletons, loading states, empty states, errores con mensajes humanos.
- **Navegación simple**: Home → Categorías → Listado → Producto → Carrito/Checkout.
- **Click targets** ≥ 40px. Foco visible y navegable con teclado.
- **Imágenes** con `alt` significativo; reservar tamaño para evitar CLS.
- **Velocidad percibida**: lazy loading de imágenes, prefetch moderado.

---

## 2) Arquitectura de componentes
- **Atomic design**:
  - `ui/*`: átomos (Botón, Badge, Price, Skeleton, Image).
  - `modules/*`: combos (ProductCard, CategoryCard, ProductGrid).
  - `sections/*`: secciones de página (HomeHero, CategoriesSection, FeaturedSection).
- **No duplicar layouts**: reutilizar `CategoryCard` y `ProductCard`.
- Sin lógica de negocio en componentes de UI (solo props).

---

## 3) Datos y seguridad (REST only)
- **Prohibido** llamar `/wp-json/` o `/wc/v3/` desde el cliente.
- Todo fetch a WooCommerce se hace **server-only** (RSC, Route Handlers o Server Actions).
- **Credenciales** en variables de entorno (no en el bundle):
  - `WC_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`.
- **CORS** controlado en WP (mu-plugin).  
- **Validar respuesta** con adaptadores/schemas antes de tocar la UI.
- **Nunca** exponer keys, ni pasar tokens a componentes cliente.

**Adapter mínimo (ejemplo):**
```ts
// types/catalog.ts
export type UICategory = { id:number; name:string; slug:string; image?:string; count:number };
export type UIProduct  = { id:number; name:string; slug:string; price:string; image?:string };

// adapters/wc.ts
export const adaptCategory = (c:any) => ({
  id: c.id, name: c.name, slug: c.slug, count: c.count ?? 0,
  image: c.image?.src || undefined
});
export const adaptProduct = (p:any) => ({
  id: p.id, name: p.name, slug: p.slug,
  price: String(p.price ?? p.regular_price ?? ''),
  image: p.images?.[0]?.src || undefined
});
