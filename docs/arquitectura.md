# Arquitectura del Sistema

## 1. Visión General: Arquitectura Integrada a Costo $0

El proyecto implementa una arquitectura unificada sobre **Next.js 15 (App Router)** sin costos fijos de servidores:

```
┌─────────────────────────────────────────────────────────────┐
│                       USUARIO / ENZO (BROWSER)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    APLICACIÓN NEXT.JS 15                    │
│                                                             │
│   • STOREFRONT:                                             │
│       - Catálogo, Tienda, Detalle de Producto, Carrito      │
│       - Tailwind CSS v4 + Framer Motion (RSC + Streaming)   │
│   • PANEL /ADMIN INTEGRADO:                                 │
│       - Gestión de productos, talles, variantes y fotos     │
│       - Panel de control de órdenes y despachos para Enzo   │
│   • API & SERVER ACTIONS:                                   │
│       - /api/checkout/summary (resumen y cálculo de envío)  │
│       - /api/checkout/order   (creación segura de orden)    │
│       - /api/checkout/payment (preferencia Mercado Pago)    │
│       - /api/webhooks/mercadopago (validación HMAC)         │
│       - /api/orders/[id]      (consulta con order_key)      │
│       - /api/health           (diagnóstico de conectividad) │
└──────────────┬───────────────────────────────┬──────────────┘
               │ Query directa (<10ms)         │ OAuth Bearer (server-only)
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│   POSTGRESQL SERVERLESS      │ │     PASARELA DE PAGO       │
│  (Neon / Supabase Free Tier) │ │       Mercado Pago         │
│                              │ │                            │
│  • Productos, variantes      │ │  • Checkout Pro            │
│  • Categorías                │ │  • Tarjetas / Abitab / Red │
│  • Órdenes y transacciones   │ │  • Webhook con firma HMAC  │
│  • Costo: $0 USD / mes       │ │                            │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Decisión Arquitectónica y Evolución del Backend

### Etapa 1: Esquema híbrido inicial (Deprecado)
Al inicio el proyecto contenía dos mitades desconectadas: un panel `/admin` con autenticación en Supabase y un storefront que caía silenciosamente a datos mock intentando hablar con WooCommerce.

### Etapa 2: Evaluación de WooCommerce Headless (Descartado por Costo $0)
Se evaluó unificar todo sobre WordPress + WooCommerce en hosting externo (ej. Hostinger).
- **Motivo de descarte:** Requiere costos fijos mensuales recurrentes de hosting PHP/MySQL y mantenimiento de servidores. La premisa estratégica del proyecto (emprendimiento aliado) es **costo fijo $0/mes** de infraestructura. Además, la REST API de WordPress en hosting compartido agrega cuellos de botella de latencia (500ms - 2000ms) innecesarios.

### Etapa 3: Decisión Definitiva — Panel CMS Integrado en Next.js (Costo $0)
Se adopta la arquitectura **Next.js All-in-One con CMS integrado**:
1. **Infraestructura unificada ($0/mes):** El storefront y el panel administrativo `/admin` corren dentro del mismo proyecto desplegado en Vercel, respaldado por una base de datos PostgreSQL serverless gratuita (ej. Supabase o Neon).
2. **Latencia < 10ms:** Las consultas de catálogo se ejecutan directamente en Server Components y Server Actions sobre la base de datos sin saltos de red HTTP hacia servidores PHP externos.
3. **Panel Administrativo Simplificado:** Panel en español optimizado para indumentaria (gestión de catálogo, talles, variantes, fotos y estado de pedidos).
4. **Checkout y Pagos Seguros Preservados:** Toda la suite de seguridad desarrollada (validación de firma HMAC de Mercado Pago, cálculo autoritativo de subtotales y envíos en servidor, proyección pública de pedidos sin PII) se preserva intacta.

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
[4. Server crea Orden en DB] ──► Recalcula subtotales y envío en servidor
        │                     ──► Inserta orden en estado 'pending'
        │                     ──► Genera `order_key` criptográfico
        ▼
[5. Iniciar Pago] ────────────► POST /api/checkout/payment {order_id}
        │                     ──► Lee orden de DB: total autoritativo
        │                     ──► Crea preferencia MP con back_urls (?order_id=X&key=Y)
        ▼
[6. Redirect a Mercado Pago]
        │
        ├─► [Pago Aprobado] ──► MP Webhook POST /api/webhooks/mercadopago
        │                           │
        │                           ├── Valida firma HMAC (x-signature)
        │                           ├── Valida monto pagado == orden.total
        │                           └── Actualiza orden en DB a 'processing'
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
