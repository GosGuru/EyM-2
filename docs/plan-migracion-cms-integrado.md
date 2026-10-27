# Plan de Implementación: CMS Integrado en Next.js (Costo $0)

## 1. Objetivo
Proveer a EYM Indumentaria de un panel administrativo moderno, simple y seguro para gestionar productos, talles, stock y pedidos, **sin costos mensuales de hosting externo ($0/mes)**, manteniendo el storefront de Next.js 15 ultrarrápido y seguro.

---

## 2. Arquitectura Seleccionada

```
┌─────────────────────────────────────────────────────────────┐
│                 DEPLOYMENT ÚNICO (Vercel)                   │
│                                                             │
│  ┌────────────────────────────┐ ┌─────────────────────────┐ │
│  │   Storefront Público       │ │   Panel Admin (/admin)  │ │
│  │   • Home, Tienda, Detalle  │ │   • Login seguro        │ │
│  │   • Carrito & Checkout MP  │ │   • Carga de productos  │ │
│  │   • Rendimiento SSG + ISR  │ │   • Control de stock    │ │
│  │   • Latencia < 20ms        │ │   • Gestión de pedidos  │ │
│  └─────────────┬──────────────┘ └────────────┬────────────┘ │
│                │                             │              │
│                └──────────────┬──────────────┘              │
│                               ▼                             │
│                  Server Components / Actions                │
└───────────────────────────────┬─────────────────────────────┘
                                │ SQL / TCP Pooling (<10ms)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│         BASE DE DATOS SERVERLESS (Costo $0 / Free Tier)     │
│             PostgreSQL en Neon.tech o Supabase              │
│                                                             │
│   • Tabla products   (id, name, slug, price, images, sizes) │
│   • Tabla categories (id, name, slug, image)                │
│   • Tabla orders     (id, status, total, order_key, items)  │
│   • Tabla admin_users(id, email, password_hash)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Datos para Indumentaria

### Colección: Productos (`products`)
- `id`: serial / uuid
- `name`: texto ("Remera Oversize Basic")
- `slug`: texto único ("remera-oversize-basic")
- `price`: numérico (precio actual en UYU)
- `compare_at_price`: numérico opcional (precio tachado / oferta)
- `description`: texto enriquecido / markdown
- `images`: array de URLs (alojadas en Cloudinary free o Supabase Storage free)
- `categories`: relación muchos a muchos con `categories`
- `sizes`: array de talles disponibles (ej: `["S", "M", "L", "XL"]`)
- `stock`: número entero por talle o general
- `featured`: booleano (para sección "Productos Destacados" del Home)
- `active`: booleano (para pausar productos sin borrarlos)

### Colección: Categorías (`categories`)
- `id`: serial / uuid
- `name`: texto ("Remeras", "Pantalones", "Calzado")
- `slug`: texto único ("remeras")
- `image`: URL de imagen de portada

### Colección: Pedidos (`orders`)
- `id`: identificador de orden
- `order_key`: secreto único para consulta sin login
- `status`: `pending` | `paid` | `shipping` | `delivered` | `cancelled`
- `items`: JSON con desglose de productos, cantidades y talles
- `subtotal`: número (UYU)
- `shipping_cost`: número (UYU)
- `total`: número autoritativo (UYU)
- `customer`: datos de envío (nombre, teléfono, dirección, ciudad, departamento)
- `payment`: datos del pago MP (`payment_id`, `status_detail`)

---

## 4. Capa de Compatibilidad de Datos (`lib/catalog.ts`)

Para no romper el storefront ni los tests existentes, creamos una capa adaptadora que expone las mismas funciones que `lib/woocommerce.ts`:
- `fetchProducts(params)`
- `fetchProductBySlug(slug)`
- `fetchCategories()`
- `createOrder(payload)`
- `updateOrder(id, payload)`
- `getOrder(id)`

Cuando la base de datos no esté conectada o falte `DATABASE_URL`, el adapter cae automáticamente al catálogo demo (`lib/mockData.js`), permitiendo desarrollar y testear sin conexión obligatoria.

---

## 5. Ventajas Concretas para Enzo y el Negocio
1. **$0 costos fijos:** No hay factura de Hostinger ni cobros mensuales en dólares.
2. **Panel directo y en español:** Sin el laberinto de menús de WordPress; directo a "Agregar producto", subir foto, poner talle y precio.
3. **Velocidad inmediata:** El sitio no espera a servidores PHP lentos; la respuesta es instantánea.
4. **Seguridad integrada:** Sin plugins de terceros vulnerables ni logins expuestos a bots de escaneo de WordPress.
