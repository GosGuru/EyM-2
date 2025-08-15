# Checklist por Pantallas — EYM (Next.js + Woo Headless)

> Tareas marcables por pantalla. Mantener Mobile-first, contraste AA, accesibilidad y llamadas sensibles sólo en server.

## Home
- [ ] Héroe/promo con contraste suficiente (texto legible, overlay, CTA visible)
- [ ] Reservar tamaño imágenes (sin CLS) + `alt` significativo
- [ ] Sección categorías (reusar CategoryCard)
- [ ] "Productos Destacados" con productos de categoría `destacados` (fallback: featured)
- [ ] Cards clickeables completas; iconos de acción no navegan (stopPropagation)
- [ ] Botón "Ver todos" con foco visible y contraste en hover
- [ ] Skeletons/empty/error states
- [ ] Lazy-loading moderado y prefetch controlado

## Categoría (Listado)
- [ ] Título/descripcion de la categoría
- [ ] Filtros y orden (si aplica) — estado reflejado en URL
- [ ] Grid responsivo (ProductCard reutilizable)
- [ ] Paginación o infinite scroll (con sentinel)
- [ ] Skeletons al cargar; empty state claro
- [ ] Acciones en card: favorito y agregar al carrito en fila de precio
- [ ] SEO: `<title>` y `<meta>` por categoría (App Router)

## Producto (PDP)
- [ ] Galería con aspecto reservado; zoom o swipe mobile
- [ ] Nombre, precio, estado de stock
- [ ] Variantes/tallas (si existen) con validación
- [ ] Botón Agregar al carrito (deshabilitado si inválido)
- [ ] Info de envío y devoluciones
- [ ] Botón favorito (persistencia en local/server según alcance)
- [ ] Productos relacionados (con footer de precio + acciones)
- [ ] Datos estructurados (JSON-LD) básicos
- [ ] Estados de carga y errores

## Checkout
- [ ] Stepper (Carrito → Datos → Pago)
- [ ] Form validado inline: email, nombre, apellido, teléfono, dirección, envío, términos
- [ ] Resumen fijo con totales + envío
- [ ] Botón pagar deshabilitado hasta validación
- [ ] Flujo: validate-cart → order (Woo) → preference (MP) → redirect
- [ ] Llamadas Woo/MP sólo en server (Route Handlers/Server Actions)
- [ ] Recalcular totales en server; no confiar en cliente
- [ ] Manejar mensajes de error claros y neutros

## Success / Pending / Error
- [ ] Success: obtiene `order_id` y consulta Woo como fuente de verdad
- [ ] Si aún `pending/on-hold`: mostrar "Procesando pago…" con refresco suave
- [ ] Resumen de pedido: número, items, totales, direcciones, método envío
- [ ] Estados y mensajes consistentes para error/reintento
- [ ] Links útiles (seguimiento, contacto)

## Global
- [ ] Accesibilidad: foco visible, navegación teclado, hit targets ≥ 40px
- [ ] Contraste AA mínimo (no texto claro sobre fondos claros)
- [ ] Performance: imágenes optimizadas, lazy, evitar overfetching
- [ ] Seguridad: sin llamadas a Woo desde el cliente; sin keys en bundle
- [ ] Webhooks idempotentes y logs en server con `order_id` como correlación
- [ ] Telemetría mínima (eventos clave: create_order, mp_redirect, webhook_processed)
