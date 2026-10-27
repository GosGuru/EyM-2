# Guía de Aprovisionamiento del Backend WooCommerce

Esta guía responde a la situación identificada en el proyecto: **actualmente no hay un catálogo cargado, no hay dominio propio asignado y se debe recuperar o definir dónde alojar la instancia de WordPress + WooCommerce**.

---

## 1. Diagnóstico del Estado Actual

En el código fuente original (`next.config.ts`), el proyecto tenía configurado el siguiente dominio temporal de Hostinger:
```
https://slategray-wallaby-716305.hostingersite.com
```
Este subdominio es el formato típico que asigna **Hostinger** a sitios de prueba (`hostingersite.com`) antes de vincular un dominio personalizado.

---

## 2. Paso a Paso: Recuperación de la Cuenta Existente en Hostinger

Si sospechás que tenés o tuviste una cuenta en Hostinger, realizá los siguientes pasos antes de contratar un servicio nuevo:

1. **Prueba de Recuperación de Correo**:
   - Ingresá a [https://hpanel.hostinger.com/](https://hpanel.hostinger.com/).
   - Hacé clic en *"¿Olvidaste tu contraseña?"* y probá con tus correos electrónicos personales o de trabajo.
   - Revisá en tu bandeja de entrada (y spam) buscando correos con el remitente `@hostinger.com` o menciones a *"slategray-wallaby"*.
2. **Acceso directo por proveedor OAuth**:
   - Probá iniciar sesión con *"Continuar con Google"* usando tus cuentas de Google personales.
3. **Verificación de Facturación**:
   - Revisá resúmenes de tarjetas de crédito o estados de cuenta de los últimos 12 meses buscando cargos a nombre de `HOSTINGER` o `Hostinger International`.

---

## 3. Evaluación de Opciones para Alojar el Backend

Si la cuenta anterior expiró o decidís comenzar desde cero, evaluá estas 3 alternativas:

| Criterio | Opción A: Hostinger (WordPress Administrado) | Opción B: Cloudways (DigitalOcean / Vultr) | Opción C: LocalWP (Desarrollo Local Gratuito) |
|---|---|---|---|
| **Costo mensual** | ~$3 a $7 USD / mes | ~$14 a $26 USD / mes | **$0 USD (Gratis)** |
| **Facilidad de uso** | Muy alta (hPanel, instalador de WP en 1 clic) | Media (orientado a desarrolladores) | Muy alta (aplicación de escritorio) |
| **Rendimiento REST API** | Aceptable para catálogos chicos (< 500 visitas/día) | Excelente (servidor dedicado, Redis, NGINX) | Depende de tu máquina local |
| **Copias de seguridad** | Diarias o semanales automáticas | Automáticas por hora/día | Manuales (copia de archivos) |
| **Recomendado para** | **Lanzamiento inicial con bajo presupuesto** | **Escala de ventas y tráfico continuo** | **Cargar productos y probar antes de pagar hosting** |

### Recomendación Operativa:
- **Paso Inmediato**: Si querés armar el catálogo hoy sin gastar dinero, descargá [LocalWP](https://localwp.com/), instalá WordPress en tu computadora en 2 minutos, activá WooCommerce y conectá el frontend con `WP_JSON_URL=http://localhost:8882/wp-json`.
- **Paso a Producción**: Cuando el catálogo esté listo para vender en Uruguay, contratá el plan *Business WordPress* de Hostinger o un droplet en Cloudways, vinculá tu dominio (ej: `admin.eym.uy` o `api.eym.uy`) y subí la base de datos.

---

## 4. Configuración Obligatoria de WooCommerce para Modo Headless

Una vez que tengas WordPress instalado, realizá exactamente estas configuraciones:

### 4.1. Enlaces Permanentes (Permalinks) — CRÍTICO
- Menú: **Ajustes > Enlaces permanentes**.
- Seleccionar: **Nombre de la entrada** (`/%postname%/`).
- Guardar cambios.
- *Por qué*: Si los enlaces están en modo "Simple" (`?p=123`), la REST API de WooCommerce `/wp-json/wc/v3` devolverá error 404 en todas las consultas.

### 4.2. Moneda y Ubicación
- Menú: **WooCommerce > Ajustes > General**.
- País: **Uruguay**.
- Moneda: **Pesos uruguayos ($)** (`UYU`).
- Posición de la moneda: Izquierda con espacio.

### 4.3. Generación de Claves REST API
- Menú: **WooCommerce > Ajustes > Avanzado > REST API**.
- Hacé clic en **Añadir clave**.
  - Descripción: `EYM Next.js Storefront`.
  - Usuario: Seleccionar usuario administrador.
  - Permisos: **Lectura/Escritura** (requerido para consultar catálogo y registrar pedidos).
- Copiar y guardar de inmediato en lugar seguro:
  - **Clave de cliente (Consumer Key)**: comienza con `ck_...`
  - **Secreto de cliente (Consumer Secret)**: comienza con `cs_...`
- *Nota*: El secreto no se vuelve a mostrar una vez cerrada la ventana.

### 4.4. Reglas de Envío Básicas
- Menú: **WooCommerce > Ajustes > Envío**.
- Crear una Zona de Envío: **Uruguay (Todo el país)**.
- Añadir método:
  - **Precio fijo**: $180 UYU (nombre: "Envío estándar a todo el país").
  - **Envío gratuito**: Requiere "Una cantidad mínima de pedido" de $2.000 UYU.
*(Estas reglas quedan alineadas con `lib/shipping/rules.ts` en el frontend).*

---

## 5. Vinculación con el Frontend

Creá el archivo `.env.local` en la raíz de `EyM-2`:

```bash
# URL de la API de WooCommerce (sin barra final)
WP_JSON_URL=https://tu-sitio.com/wp-json
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL pública del frontend (para callbacks de retorno de pago)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Mercado Pago Uruguay
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx
MP_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Una vez configurado, ejecutá:
```bash
curl -s http://localhost:3000/api/health
```
Debe responder:
```json
{
  "ok": true,
  "mode": "live",
  "checks": {
    "config": {
      "baseUrl": true,
      "consumerKey": true,
      "consumerSecret": true,
      "mercadopagoToken": true,
      "webhookSecret": true
    },
    "woocommerceReachable": true,
    "latencyMs": 240
  }
}
```
En ese momento, el banner de demostración desaparecerá automáticamente y el storefront comenzará a mostrar los productos reales del backend.
