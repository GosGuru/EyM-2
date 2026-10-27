# Arquitectura del Sistema

## 1. Visión General: Enfoque Headless

El proyecto implementa una arquitectura desacoplada (**Headless Commerce**):

```
┌─────────────────────────────────────────────────────────────┐
│                       USUARIO / BROWSER                     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    STOREFRONT (Next.js 15)                  │
│                                                             │
│   • App Router (RSC + Client Components)                    │
│   • Tailwind CSS v4 + Framer Motion                         │
│   • Runtime: Bun (gestor) sobre Node.js 20+ (servidor)      │
│   • Edge/Node API Route Handlers:                           │
│       - /api/checkout/summary (resumen con cache)           │
│       - /api/checkout/order   (creación de orden WC)        │
│       - /api/checkout/payment (preferencia MP)              │
│       - /api/webhooks/mercadopago (notificaciones HMAC)     │
│       - /api/orders/[id]      (consulta con order_key)      │
│       - /api/health           (diagnóstico de backend)      │
└──────────────┬───────────────────────────────┬──────────────┘
               │ Basic Auth (server-only)      │ OAuth Bearer (server-only)
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      BACKEND / CMS           │ │     PASARELA DE PAGO       │
│  WordPress + WooCommerce     │ │       Mercado Pago         │
│                              │ │                            │
│  • Catálogo de productos     │ │  • Checkout Pro            │
│  • Gestión de inventario     │ │  • Medios de pago locales  │
│  • Registro de órdenes       │ │  • Webhook con firma HMAC  │
│  • Blog de contenidos        │ │                            │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Decisión Arquitectónica: Por qué WooCommerce como Único Backend

Al inicio el proyecto contenía dos mitades desconectadas:
- Un panel `/admin` con autenticación y tablas en Supabase.
- Un storefront público que consultaba WooCommerce y caía silenciosamente a datos mock.

### Problemas del esquema híbrido:
1. **Doble mantenimiento**: Cada producto requería ser cargado dos veces o construir un motor de sincronización bidireccional (propenso a pérdidas de stock y desfasajes de precio).
2. **Superficie de ataque innecesaria**: Mantener un login administrativo propio con auth client-side, reglas RLS incompletas y endpoints de manipulación de tablas expuestas.
3. **Reinventar la rueda**: WooCommerce ya resuelve variantes, talles, colores, galerías de imágenes, cupones de descuento, estados de orden y stock transaccional.

### Resolución (2026-10-26):
Se eliminó por completo la dependencia de Supabase y el panel `/admin`. **WordPress + WooCommerce es el único CMS y backend del negocio.**

---

## 3. Flujo Transaccional de Compra

```
[1. Carrito en Browser]
        │
        ▼ (POST /api/checkout/summary con {items: [{product_id, quantity}]})
[2. Server calcula Resumen] ──► Consulta precios a WooCommerce
        │                   ──► Calcula envío con rules.ts
        ▼
[3. Formulario de Envío]
        │
        ▼ (POST /api/checkout/order con items + datos del cliente)
[4. Server crea Orden en Woo] ──► Recalcula subtotales y envío
        │                     ──► Crea orden en estado 'pending'
        │                     ──► Obtiene `id` y `order_key`
        ▼
[5. Iniciar Pago] ────────────► POST /api/checkout/payment {order_id}
        │                     ──► Consulta orden a Woo: total autoritativo
        │                     ──► Crea preferencia MP con back_urls (?order_id=X&key=Y)
        ▼
[6. Redirect a Mercado Pago]
        │
        ├─► [Pago Aprobado] ──► MP Webhook POST /api/webhooks/mercadopago
        │                           │
        │                           ├── Valida firma HMAC (x-signature)
        │                           ├── Valida monto pagado == orden.total
        │                           └── Actualiza orden Woo a 'processing'
        │
        └─► Redirect comprador a /checkout/exito?order_id=X&key=Y
                │
                └── Consulta /api/orders/X?key=Y (proyección sin PII)
```

---

## 4. Política de Aislamiento de Credenciales

- **Regla inquebrantable**: Ninguna credencial de backend (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`) puede llevar el prefijo `NEXT_PUBLIC_`.
- El cliente (navegador) nunca realiza llamadas directas a `/wp-json/` ni a `api.mercadopago.com`.
- Todo contacto con el backend ocurre en **Server Components** o en **Route Handlers** protegidos con validación de entrada y rate limiting.

---

## 5. Modos de Ejecución del Catálogo

| Variable | Valor | Comportamiento |
|---|---|---|
| `getWcMode() === 'mock'` | Faltan variables de entorno | Carga catálogo demo (`lib/mockData.js`). Muestra banner visible en cabecera. La web compila y permite probar UI. |
| `getWcMode() === 'live'` | URL + Keys configuradas | Llama a la REST API de WooCommerce. **Sin fallback silencioso a mocks**: si la API de Woo falla, el error se propaga para ser detectado y resuelto de inmediato. |
