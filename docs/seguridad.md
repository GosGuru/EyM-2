# Seguridad y Modelo de Amenazas

Este documento describe las vulnerabilidades críticas identificadas en la auditoría del proyecto, las mitigaciones implementadas en código y los controles vigentes para proteger la operación de comercio electrónico.

---

## 1. Vulnerabilidades Mitigadas (Auditoría Octubre 2026)

### V1. Proxy Público sin Control a WooCommerce (`/api/wc/[...path]`)
- **Problema previo**: Un endpoint catch-all (`route.ts`) reenviaba cualquier path (`/api/wc/orders`, `/api/wc/customers`) a la API administrativa de WooCommerce con las claves del servidor y cabecera `Cache-Control: public, s-maxage=300`. Cualquier atacante podía listar compradores, direcciones, teléfonos y órdenes, y la respuesta quedaba cacheada en CDN público.
- **Mitigación**: Se **eliminó por completo el archivo** `app/api/wc/[...path]/route.ts`. El frontend solo expone endpoints de propósito único (`/api/wc/products` para catálogo público).

### V2. Falsificación de Notificaciones de Pago (Webhooks de Mercado Pago)
- **Problema previo**: El webhook (`/api/webhooks/mercadopago`) validaba un token opcional por query string (`?token=...`). Si no estaba configurado, aceptaba cualquier POST y procedía a marcar la orden en WooCommerce como `processing`.
- **Mitigación**:
  - Implementación de `lib/mp/webhook.ts` con verificación criptográfica obligatoria de la cabecera `x-signature` mediante HMAC-SHA256 sobre el manifiesto `id:<dataId>;request-id:<xRequestId>;ts:<ts>;`.
  - Comparación en tiempo constante con `crypto.timingSafeEqual`.
  - **Fallo cerrado (Fail-closed)**: Si `MP_WEBHOOK_SECRET` no está definido en variables de entorno, el endpoint responde `503 Service Unavailable` y rechaza la notificación. Si la firma es inválida o falta, responde `401 Unauthorized`.
  - Validación de coincidencia de montos: La orden solo transiciona a `processing` si el monto cobrado por Mercado Pago coincide exactamente (margen de 1 centavo) con el total de la orden en WooCommerce.

### V3. Manipulación de Monto en el Checkout de Pago
- **Problema previo**: `/api/checkout/payment` aceptaba `totals.grandTotal` directamente del cuerpo enviado por el navegador. Un usuario malicioso podía enviar `totals: { grandTotal: 1 }` y generar una preferencia oficial de Mercado Pago por $1 UYU para una compra de $100.000 UYU.
- **Mitigación**:
  - `/api/checkout/payment` ahora toma únicamente `order_id` del cuerpo.
  - El total se lee de forma **autoritativa desde WooCommerce** mediante `wcGetOrder(orderId)`.
  - Se valida que la orden esté en un estado pagable (`pending`, `on-hold`, `failed`). Órdenes ya procesadas o canceladas son rechazadas con error `409 Conflict`.

### V4. Enumeración Pública de Órdenes y Filtración de Datos Personales
- **Problema previo**: `GET /api/orders/[id]` recibía un ID numérico correlativo (1, 2, 3...) y devolvía el objeto de orden completo con nombre, apellido, dirección, teléfono, email y notas.
- **Mitigación**:
  - Requiere obligatoriamente el parámetro `?key=<order_key>`.
  - `order_key` es un token aleatorio y criptográficamente impredecible generado por WooCommerce al crear la orden.
  - La comparación de claves se realiza con `timingSafeEqual`.
  - La respuesta entrega una **proyección pública mínima**: únicamente `id`, `status`, `total`, `currency` y nombres/cantidades de ítems. Ningún dato de facturación ni contacto se expone por la API.

### V5. Abuso de Creación de Órdenes y Spam (Denegación de Servicio)
- **Problema previo**: Cualquier script podía enviar miles de peticiones POST a `/api/checkout/order` y saturar la base de datos de WooCommerce con órdenes basura.
- **Mitigación**:
  - Rate limiting en memoria con ventana fija (`lib/rate-limit.ts`): máximo 10 solicitudes por minuto por dirección IP en `/api/checkout/order` y `/api/checkout/payment`.
  - Al exceder la cuota se devuelve código `429 Too Many Requests` con cabecera `Retry-After`.

### V6. Cabeceras HTTP Inseguras y CSP Inexistente
- **Problema previo**: El sitio no enviaba cabeceras de seguridad contra clickjacking, MIME-sniffing ni restricciones de contenido.
- **Mitigación**:
  - Configuración en `next.config.ts`:
    - `Strict-Transport-Security` (HSTS de 2 años con subdominios y preload).
    - `X-Frame-Options: DENY` (previene clickjacking).
    - `X-Content-Type-Options: nosniff`.
    - `Referrer-Policy: strict-origin-when-cross-origin`.
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
    - `Content-Security-Policy` estricto con dominios autorizados de Mercado Pago y origen propio.

---

## 2. Matriz de Cobertura de Pruebas Automatizadas

El sistema cuenta con pruebas unitarias en `bun test`:
- `lib/mp/webhook.test.ts` (19 pruebas):
  - Creación de manifiesto normalizado.
  - Aceptación de firmas válidas y normalización de mayúsculas.
  - Rechazo ante adulteración de firma, secreto incorrecto, request-id alterado o cabeceras malformadas.
  - Rechazo de montos manipulados, cero, negativos o con tipos no numéricos.
- `lib/woocommerce.test.ts` (5 pruebas):
  - Detección estricta de modo live vs mock según variables de entorno.
  - Comportamiento en modo mock para productos y categorías.
- `lib/checkout/cart.test.ts` (5 pruebas):
  - Carrito vacío y cálculo de reglas de envío.
  - Fusión de productos duplicados sumando cantidades.
  - Detección de IDs inválidos y productos inexistentes.
- `lib/rate-limit.test.ts` (2 pruebas):
  - Cuota permitida y bloqueo con cálculo de `retryAfterSeconds`.

Total actual: **31 pruebas automatizadas pasando con éxito.**
