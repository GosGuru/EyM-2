# Configuración de entorno — Checkout Headless

Variables obligatorias para Woo + Mercado Pago en modo headless.

## .env.local (ejemplo)

```
# WooCommerce REST
WC_BASE_URL=https://tu-wordpress.com
WC_CONSUMER_KEY=ck_xxx
WC_CONSUMER_SECRET=cs_xxx

# Mercado Pago (usar sandbox/producción según entorno)
MP_ACCESS_TOKEN=APP_USR-xxx
# Opcional si alguna vista lo requiere
MP_PUBLIC_KEY=APP_USR-xxx

# Dominio público del front para armar URLs de retorno y webhook
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com

# Rutas de retorno (pueden dejarse por defecto)
MP_SUCCESS_URL=/checkout/exito
MP_FAILURE_URL=/checkout/error
MP_PENDING_URL=/checkout/pendiente

# Si firmás manualmente notificaciones (opcional)
MP_WEBHOOK_SECRET=supersecreto
```

Notas
- Reiniciá el servidor después de cambiar variables de entorno.
- WP debe pasar el header Authorization (Basic Auth) a PHP (htaccess listo en tu infra).
- No expongas claves en el cliente; todo consumo Woo/MP ocurre en rutas server.
 - Si seteás MP_WEBHOOK_SECRET, el backend agregará `?token=...` a la notification_url del webhook de Mercado Pago y rechazará con 401 los intentos sin ese token.
