# Checklist de Integración — Checkout Headless (Woo + Next + MP)

> Guía para marcar avances mientras integrás. Todas las llamadas sensibles deben ser server-only.

## 0) Pre-requisitos

- [ ] Variables de entorno definidas
  - [ ] `WC_BASE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`
  - [ ] `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`
  - [ ] `APP_BASE_URL` (https://dominio.com)
- [ ] Woo configurado: moneda, impuestos, zonas y tarifas de envío
- [ ] MP Checkout Pro habilitado y `notification_url` pública
- [ ] WP headless (mu-plugin + .htaccess pasando Authorization)

## 1) Datos/UI de Checkout (cliente)

- [ ] Carrito en estado global (items, qty, subtotal, shipping)
- [ ] Formulario con validación inline
  - [ ] Email, nombre, apellido, teléfono
  - [ ] Dirección: calle/número, ciudad, provincia/estado, CP, país
  - [ ] Método de envío (y costo)
  - [ ] Aceptación de Términos/Política
- [ ] Resumen fijo con totales + envío
- [ ] Botón "Pagar" deshabilitado hasta validación completa
- [ ] Barra de progreso (Carrito → Datos → Pago)

## 2) Endpoints Next (server-only)

- [ ] POST `/api/checkout/validate-cart`
  - [ ] Valida stock/precio actual (Woo)
  - [ ] Calcula totales y envío
- [ ] POST `/api/checkout/order`
  - [ ] Crea `order` en Woo con status `pending`
  - [ ] Guarda `order_id` de respuesta
  - [ ] Mete `meta_data` (checkout_channel, cart_hash)
- [ ] POST `/api/checkout/payment`
  - [ ] Crea Preference en MP con `external_reference = order_id`
  - [ ] Setea `back_urls` y `notification_url`
  - [ ] Persiste `mp_preference_id` en el pedido (Woo)
- [ ] POST `/api/webhooks/mercadopago`
  - [ ] Idempotente (dedupe por `mp_payment_id`/`merchant_order_id`)
  - [ ] Verifica evento consultando MP
  - [ ] Mapea estado → actualiza orden en Woo
  -  [ ] Persiste `raw_event` en meta
- [ ] GET `/api/orders/:order_id` (opcional)
  - [ ] Devuelve estado y resumen desde Woo

## 3) Páginas

- [ ] `/checkout` — Formulario + Resumen
  - [ ] Llama validate → order → payment
  - [ ] Redirige a `init_point` de MP
- [ ] `/checkout/success`
  - [ ] Lee `order_id` (query/session)
  - [ ] Consulta Woo → muestra estado y resumen
  - [ ] Si aún pending/on-hold → "Procesando pago…" con refresco suave
- [ ] `/checkout/error` (opcional)
  - [ ] Muestra motivo y CTA reintento
- [ ] `/checkout/pending` (opcional)
  - [ ] Estado intermedio, idéntico a success con banner de espera

## 4) Estados y reglas

- [ ] MP → Woo
  - [ ] `approved` → `processing` (o `completed` si sin logística)
  - [ ] `rejected/cancelled` → `cancelled`
  - [ ] `in_process/pending` → `on-hold`/`pending`
  - [ ] `refunded/chargeback` → `refunded` o `cancelled`
- [ ] Stock: descontar al pasar a `processing`
- [ ] Cupones: recalcular en server (no confiar en cliente)

## 5) Seguridad

- [ ] Keys solo en server; no exponer en cliente
- [ ] Webhooks idempotentes
- [ ] Validar schemas/adapters antes de impactar UI
- [ ] Logs en server con `correlation_id = order_id`
- [ ] CORS controlado en WP

## 6) Testing (sandbox)

- [ ] Productos de prueba con stock y envío
- [ ] Pedido feliz: pending → webhook → processing → success correcto
- [ ] Falla de pago: `cancelled` y página de error correcta
- [ ] Reintentos: sin duplicados (idempotencia OK)
- [ ] Webhook antes/después del return: UI maneja ambos
- [ ] Precios/stock desactualizados: bloqueo con mensaje claro

## 7) Entregables mínimos en código (cuando implementes)

- [ ] Tipos/Adapters: `UICartItem`, `UIOrder`, `MPEvent`
- [ ] Utils de Woo: crear/actualizar orden, buscar por `order_id`
- [ ] SDK MP server: crear preference, obtener merchant_order/payment
- [ ] Manejo de errores homogéneo (shape `{ok, error, details?}`)
- [ ] Tests unitarios básicos de endpoints

---

Notas:
- `external_reference = order_id` es la llave de reconciliación.
- Guardar `mp_preference_id`, `mp_payment_id`, `mp_status` en `meta_data` del pedido.
- En `success`, la fuente de verdad es Woo (no confíes solo en query de MP).
