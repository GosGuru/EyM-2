# Estructura del Proyecto

Este documento describe la organización del código fuente del storefront **EYM Indumentaria**, facilitando la incorporación de nuevos desarrolladores y el mantenimiento ordenado del repositorio.

---

## 1. Árbol de Directorios Principal

```
EyM-2/
├── .github/
│   └── instructions/
│       └── Rules1.instructions.md    # Reglas generales del proyecto y comando Bun
├── app/                              # Rutas y páginas (Next.js 15 App Router)
│   ├── api/                          # Route Handlers server-side
│   │   ├── checkout/
│   │   │   ├── order/route.ts        # Creación autoritativa de orden en WooCommerce
│   │   │   ├── payment/route.ts      # Generación de preferencia Mercado Pago
│   │   │   └── summary/route.ts      # Cálculo de totales y cotización de envío
│   │   ├── health/route.ts           # Diagnóstico del estado del backend
│   │   ├── orders/[id]/route.ts      # Consulta pública de orden protegida con order_key
│   │   ├── wc/products/route.ts      # Proxy cacheado para catálogo
│   │   └── webhooks/mercadopago/     # Webhook con validación criptográfica HMAC
│   ├── blog/                         # Artículos editoriales desde WordPress
│   ├── categorias/                   # Listado visual de categorías
│   ├── checkout/                     # Proceso de compra en un paso
│   │   ├── error/                    # Retorno de pago fallido
│   │   ├── exito/                    # Retorno de pago aprobado / polling de estado
│   │   └── pendiente/                # Retorno de pago pendiente (redes de cobranza)
│   ├── favoritos/                    # Lista de deseos (almacenada en localStorage)
│   ├── producto/[slug]/              # Detalle de producto con galería y variantes
│   ├── tienda/                       # Catálogo con filtrado por categoría y /todos
│   ├── layout.tsx                    # Shell raíz con fuentes, contextos y banner demo
│   └── page.tsx                      # Homepage optimizada con streaming
├── components/                       # Componentes de interfaz de usuario
│   ├── motion/                       # Wrappers de animación Framer Motion
│   ├── sections/                     # Bloques modulares de la homepage
│   ├── skeletons/                    # Marcadores de posición para streaming (Suspense)
│   ├── ui/                           # Átomos reutilizables (Botón, Banner demo, etc.)
│   ├── CartContext.tsx               # Estado global del carrito (localStorage)
│   ├── CartDrawer.tsx                # Cajón lateral del carrito interactivo
│   ├── FavoritosContext.tsx          # Estado global de favoritos
│   ├── Header.tsx                    # Cabecera principal y navegación mobile
│   └── Navbar.tsx                    # Barra de navegación secundaria
├── docs/                             # Documentación técnica, estratégica y de seguridad
├── hooks/                            # Hooks personalizados de navegación y prefetch
├── lib/                              # Lógica de negocio y clientes externos
│   ├── checkout/
│   │   ├── cart.ts                   # Cálculo autoritativo de subtotales y faltantes
│   │   └── cart.test.ts              # Pruebas unitarias de cálculo de carrito
│   ├── mp/
│   │   ├── client.ts                 # Cliente de la API de Mercado Pago
│   │   ├── webhook.ts                # Verificación de firmas HMAC y comparación de montos
│   │   └── webhook.test.ts           # Pruebas unitarias del webhook
│   ├── shipping/
│   │   └── rules.ts                  # Reglas de negocio de envío para Uruguay
│   ├── mockData.js                   # Datos de prueba para modo demostración
│   ├── rate-limit.ts                 # Limitador de tasa en memoria con ventana fija
│   ├── rate-limit.test.ts            # Pruebas unitarias del rate limiter
│   ├── woocommerce.ts                # Cliente REST estricto de WooCommerce
│   ├── woocommerce.test.ts           # Pruebas unitarias del cliente WooCommerce
│   └── wordpress.ts                  # Cliente REST para contenidos del blog
├── odd/                              # Tareas y registro de decisiones de ingeniería
├── public/                           # Activos estáticos, fuentes e imágenes locales
├── bun.lock                          # Lockfile versionado del gestor Bun
├── next.config.ts                    # Configuración de Next.js, CSP y cabeceras
├── package.json                      # Scripts y dependencias del proyecto
└── tsconfig.json                     # Configuración estricta de TypeScript
```

---

## 2. Convenciones de Desarrollo

1. **Gestor de Paquetes Único**: Usar exclusivamente `bun install`, `bun add`, `bun run dev`, `bun run build`, `bun test`.
2. **Server-Side por Defecto**: Todos los componentes en `app/` son **React Server Components (RSC)** a menos que requieran interactividad explícita mediante la directiva `"use client"`.
3. **Manejo de Errores y Loading**: Cada ruta dinámica (`[slug]`, `[categoria]`) debe proveer su propio archivo `loading.tsx` con skeletons que preserven las dimensiones visuales (evitar CLS).
4. **Validación de Formularios**: Los formularios de entrada de usuario se validan con esquemas de **Zod v4** tanto en el cliente como en el servidor.
5. **Estilos**: Se utiliza **Tailwind CSS v4** con tokens de diseño definidos en `globals.css` (colores de marca: `eym-dark`, `eym-accent-orange`, `eym-light`).
