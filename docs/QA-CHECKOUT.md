# Guía de QA — Checkout Headless

## Casos de prueba (sandbox)

1) Aprobado
- Agregar 1–2 items al carrito
- Completar Checkout y pagar con método sandbox aprobado
- Verificar: Woo → pedido pasa de `pending` a `processing/completed` por webhook
- Ver en `/checkout/exito?order_id=...` el resumen correcto

2) Rechazado
- Pagar con método sandbox rechazado
- Woo → `cancelled`
- Front → `/checkout/error` con botón Reintentar

3) Pendiente
- Usar método que deje `in_process/pending`
- Woo → `on-hold`
- Front → `/checkout/pendiente` y luego cambio por webhook si aplica

## Idempotencia
- Reenviar manualmente el webhook de MP (mismo id)
- Confirmar que no se duplican acciones en Woo ni cambia el estado erróneamente

## Accesibilidad/UX
- CTA visible con foco, contraste AA
- Resumen sticky en desktop; barra sticky en mobile
- Skeleton/loader visibles en recalculo/submit

## Métricas básicas
- LCP y CLS razonables en `/checkout` y `/checkout/exito`
- Sin errores JS en consola
