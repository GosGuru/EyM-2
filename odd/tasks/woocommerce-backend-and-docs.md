# Backend WooCommerce + seguridad + documentación

Objetivo: dejar WooCommerce como único backend, cerrar los problemas de seguridad pendientes y
documentar visión, arquitectura, estructura, SEO/GEO y operación en `docs/`.

## Specs

S1 — Seguridad. Requisito del humano, textual: "quiero que arregles todos los problemas de seguridad".
Interpretación operativa: ningún endpoint público puede exponer datos personales, permitir manipular
montos, aceptar transiciones de pago sin autenticar, ni ejecutarse sin límite de tasa. Toda credencial
de WooCommerce/Mercado Pago queda server-only. Un fallo de configuración falla cerrado, nunca abierto.

S2 — Backend. Requisito del humano, textual: "arrememos la parte del backend".
Decisión del humano (2026-10-26): **"WooCommerce es el único backend"**. Consecuencias obligatorias:
1. Se retira el panel `/admin`, `lib/supabase.js`, `supabase_setup.sql` y la dependencia `@supabase/supabase-js`.
2. El CMS es WordPress + WooCommerce. No se construye un CMS propio.
3. La tienda lee siempre de WooCommerce. Los datos mock dejan de ser un fallback silencioso: solo se
   permiten con `WC_ALLOW_MOCKS=true` explícito y nunca en producción.
4. Los totales del pedido (ítems, envío, total) se calculan en el servidor a partir de WooCommerce.
   El cliente no puede fijar precios, envío ni monto.
5. Existe un diagnóstico público que responde si WooCommerce está configurado y accesible, sin
   filtrar secretos, porque el humano contestó "No sé, hay que revisar" sobre la data real.

S3 — Documentación. Requisito del humano, textual: "Quiero que pongas como en una carpeta llamada docs
toda la documentación de la página, de todo lo que venimos haciendo, de la estructura, de la arquitectura."
Interpretación: `docs/` contiene el mapa completo del proyecto, incluido lo ya hecho, con índice.

S4 — Arquitectura y estrategia. Requisito del humano, textual: "Quiero que definamos la arquitectura,
así es que no está planteada el objetivo y la misión, visión de la de este proyecto va a ser crecer esta
página web a nivel Uruguay. teniendo en cuenta el SEO y el GEO".
Decisión del humano (2026-10-26): GEO = **"Generative Engine Optimization"**.
Interpretación: misión, visión y objetivos medibles para Uruguay; arquitectura explícita; estrategia de
SEO técnico y GEO documentada y conectada con las decisiones técnicas reales del código.

## Tasks

| ID | Tarea | Spec | Ruta | Commit |
| --- | --- | --- | --- | --- |
| T1 | Retirar Supabase y el panel `/admin` | S2 | inline | C3 |
| T2 | WooCommerce estricto (sin mocks silenciosos) + `/api/health` | S2 | inline | C3 |
| T3 | Totales del checkout calculados en el servidor | S1, S2 | inline | C3 |
| T4 | Rate limit en endpoints de checkout | S1 | inline | C3 |
| T5 | Headers de seguridad, CSP y validación de entorno | S1 | inline | C3 |
| T6 | Limpiar código muerto y bugs menores del checkout | S1, S3 | inline | C3 |
| T7 | Set de documentación en `docs/` con índice | S3 | inline | C4 |
| T8 | Arquitectura, visión/misión/objetivos, SEO/GEO, roadmap | S4 | inline | C5 |
| T9 | Verificación integral: tests, build, sondas y consistencia de docs | S1-S4 | inline | — |
| T10 | Opciones de aprovisionamiento del backend (hosting, dominio, recuperación de cuenta) | S2 | inline | C5 |

## Contrato de implementación (T1-T6)

Contexto: Next.js 15 App Router + TypeScript + Tailwind; gestor `bun` (nunca npm/npx/pnpm/yarn).
No hay `.env.local` ni hosting: el sitio debe compilar y mostrar un catálogo demo VISIBLE.
Ya resuelto y fuera de alcance: `lib/mp/webhook.ts`, `lib/mp/webhook.test.ts`, `app/api/webhooks/mercadopago/route.ts`,
`app/api/checkout/payment/route.ts`, `app/api/orders/[id]/route.ts`, `app/api/wc/[...path]` (eliminado).

1. Retirar Supabase y `/admin`: borrar `app/admin/**`, `lib/supabase.js`, `supabase_setup.sql` y
   `app/api/checkout/validate-cart/` (sin uso y confía en precios del cliente). En `components/Header.tsx`
   quitar el import de supabase, el estado/listener de auth y el bloque de UI de admin. En `lib/mockData.js`
   borrar los exports con forma de Supabase (`mockCategorias`, `mockProductos`) y conservar `mockWc*`.
   Quitar `@supabase/supabase-js` de `package.json` y correr `bun install`.

2. WooCommerce estricto: borrar TODOS los chequeos `typeof window === 'undefined'` de `lib/woocommerce.ts`
   (hacían que todo el server devolviera mocks). Agregar `export type WcMode = 'live' | 'mock'` y
   `export function getWcMode(): WcMode` → `'live'` solo si hay base URL (`WP_JSON_URL || WC_BASE_URL`) y
   `WC_CONSUMER_KEY` y `WC_CONSUMER_SECRET`. En modo `'mock'` las funciones devuelven mocks con un warning
   por llamada nombrando las variables faltantes. En modo `'live'` NO hay fallback: si el HTTP falla, se
   lanza el error. Los mocks nunca tapan un backend configurado que está caído. Mantener sin cambios las
   firmas exportadas existentes.

3. Totales en el servidor: crear `lib/checkout/cart.ts` con `CartItemInput`, `CartLine`,
   `CartSummary` (incluye `missing`) y `buildCartSummary(input)`: descarta `product_id` no numérico
   (`invalid_id`), fusiona duplicados sumando cantidades, clampea cantidad a entero 1..99, máximo 50 líneas
   distintas (`too_many_lines`), producto inexistente → `not_found`, precio de `p.price ?? p.regular_price`,
   envío con `quoteShipping({ subtotal })` igual que hoy, `discount` en 0. `app/api/checkout/summary/route.ts`
   la usa conservando la forma de respuesta actual (`ok`, `items`, `totals`, `shipping`) y agregando `missing`;
   mantiene el `Cache-Control` y el `meta`. `app/api/checkout/order/route.ts` la usa y **elimina** el manejo de
   `shippingLine` del cliente: el envío sale del resumen del servidor, 400 si no hay ítems válidos o si
   `missing.length > 0`, tope de 50 ítems. Conserva customer/billing/shipping/meta_data.

4. Rate limit: crear `lib/rate-limit.ts` con ventana fija en memoria
   `rateLimit(key, limit, windowMs) → { ok, remaining, retryAfterSeconds }`, mapa acotado (evicta pasando 5000
   claves). Aplicar a `POST /api/checkout/order` y `POST /api/checkout/payment`: 10 por 60s por IP
   (`x-forwarded-for` primero, `x-real-ip`, si no `'unknown'`). Al exceder: 429 con `Retry-After` y
   `{ ok: false, error: 'Demasiados intentos. Probá de nuevo en un momento.' }`.

5. Headers: en `next.config.ts` quitar el remotePattern de Supabase y agregar `headers()` para `/:path*` con
   HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
   `Permissions-Policy: camera=(), microphone=(), geolocation=()`, y CSP: `default-src 'self'`,
   `img-src 'self' data: blob: https:`, `script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com`,
   `style-src 'self' 'unsafe-inline'`, `font-src 'self' data:`,
   `frame-src 'self' https://www.mercadopago.com https://www.mercadopago.com.ar https://www.mercadopago.com.uy`,
   `connect-src 'self' https://api.mercadopago.com`, `object-src 'none'`, `base-uri 'self'`,
   `form-action 'self'`. Comentario corto aclarando que `'unsafe-inline'` es una limitación documentada a
   reemplazar por CSP con nonce. Conservar los hosts de imágenes de WordPress.

6. Diagnóstico: crear `app/api/health/route.ts` (GET, `dynamic = 'force-dynamic'`) que devuelve 200 con
   `{ ok, mode, checks: { config: { baseUrl, consumerKey, consumerSecret, mercadopagoToken, webhookSecret },
   woocommerceReachable, latencyMs } }`. Solo booleanos, nunca valores de secretos. En `'live'` hace un GET
   barato a categorías con timeout de 3s; en `'mock'` `woocommerceReachable` es `null` y `ok` es `true`.

7. Demo visible: `components/ui/DemoCatalogBanner.tsx`, server component que no renderiza nada salvo en modo
   `'mock'`; en demo muestra una franja: "Catálogo de demostración — todavía no hay backend WooCommerce
   conectado." con `bg-amber-100 text-amber-900`. Incluirlo en `app/layout.tsx` arriba de `{children}`.

8. Defectos menores: en `app/checkout/page.tsx` cambiar `err.errors?.[0]?.message` por la API de Zod 4
   (`issues`) para recuperar los mensajes específicos; borrar `./CartContext.tsx`, `app/checkout/page-fixed.tsx`,
   `app/checkout/page-new.tsx`, `app/producto/not-found-new.tsx` y `app/tienda/not-found-new.tsx`; acotar el
   `productCache` de `app/api/checkout/summary/route.ts` a 200 entradas.

Chequeos obligatorios (reportar salida exacta): `bun test` (19 pass), `bun run type-check` (0),
`bun run build` (0), chequeo diferencial de `/api/checkout/summary` contra `/tmp/summary-baseline.json`
(ignorando `meta.timestamp`; los campos existentes deben quedar idénticos y `missing` es un campo nuevo
permitido), `/api/health` en modo mock, `/admin` y `/admin/login` y `/api/checkout/validate-cart` en 404,
`grep -rni supabase` sin resultados en código, y `/api/checkout/order` con ítems vacíos y con `product_id`
9999 devolviendo 400.

## Log

L1 — Humano, textual: "evalua este proyecto, quiero verififar el backend / el cms mejor dicho".
Resultado: auditoría con 20 hallazgos; 4 bloqueantes de seguridad y el CMS inoperante.

L2 — Humano, textual: "lo de NPM no quiero que utilicemos mas, migremos a bun".
Hecho: `bun.lock` migrado desde el `package-lock` original (0 cambios de versión), `trustedDependencies`,
scripts cross-platform, README en UTF-8, regla 9 en `.github/instructions/Rules1.instructions.md`.

L3 — Humano, textual: "si dale, mandale" (autorización para atacar primero la seguridad).
Hecho: los 4 bloqueantes cerrados con tests y sondas. Detalle en `docs/seguridad.md`.

L4 — Humano, textual: "Ok, quiero que arregles todos los problemas de seguridad y arrememos la parte del
backend. Quiero que pongas como en una carpeta llamada docs toda la documentación de la página, de todo lo
que venimos haciendo, de la estructura, de la arquitectura. Quiero que definamos la arquitectura, así es que
no está planteada el objetivo y la misión, visión de la de este proyecto va a ser crecer esta página web a
nivel Uruguay. teniendo en cuenta el SEO y el GEO".
Decisiones: WooCommerce único backend; GEO = Generative Engine Optimization; data real a verificar.

L5 — Humano, textual: "bien no hay catálogo todavía creo subido igualmente pero hay que revisar bien todo lo
de WordPress porque eso yo no me acuerdo de la cuenta no hay dominio no hay nada de eso no hay no hay o sea yo
lo tenían Hostinger creo no me acuerdo pero eso sí tengo que verlo bien porque no sé cómo puedo montar el en
dónde montar el backend hay que ver bien opciones".
Consecuencias: (a) el backend WooCommerce no está aprovisionado; no se puede verificar contra datos reales;
(b) hace falta un documento de aprovisionamiento con opciones de hosting y costos; (c) la política de mocks
no puede romper el despliegue: los mocks se permiten solo cuando WooCommerce NO está configurado, se marcan
visiblemente como demo y NUNCA se usan como fallback ante un error de un WooCommerce configurado.

L6 — Estado de verificación al iniciar T1: no hay `.env.local` en el repo; el build y las sondas corren con
el catálogo demo. La conexión real con WooCommerce queda como deuda de verificación hasta que exista hosting.
