# Guía de Aprovisionamiento del Backend ($0 USD/mes)

Esta guía detalla cómo montar y operar la infraestructura completa de **EYM Indumentaria** cumpliendo la restricción estricta definida para el proyecto: **costo fijo $0 USD / mes**, sin cuotas mensuales de hosting ni servidores dedicados.

---

## 1. Decisión de Infraestructura: Pila Serverless Gratuita

Para que Enzo opere su negocio de indumentaria sin gastos fijos antes de vender, la infraestructura se compone de servicios con planes gratuitos generosos y permanentes:

| Componente | Proveedor Seleccionado | Nivel Gratuito (Free Tier) | Costo Mensual |
|---|---|---|---|
| **Frontend & API** | [Vercel](https://vercel.com/) | 100 GB ancho de banda, despliegues ilimitados, SSL automático | **$0 USD** |
| **Base de Datos** | [Neon](https://neon.tech/) o [Supabase](https://supabase.com/) | PostgreSQL 500 MB de datos, pooling de conexiones, backups | **$0 USD** |
| **Storage de Imágenes** | [Cloudinary](https://cloudinary.com/) o [Supabase Storage](https://supabase.com/) | 1 GB - 25 GB de fotos de productos con CDN global | **$0 USD** |
| **Pasarela de Pagos** | [Mercado Pago Uruguay](https://www.mercadopago.com.uy/) | Sin costo fijo; comisión estándar solo por venta cobrada | **$0 USD fijo** |

---

## 2. Paso a Paso: Alta de la Base de Datos PostgreSQL ($0)

### Opción Recomendada: Neon.tech (PostgreSQL Serverless)
1. Ingresá a [https://neon.tech/](https://neon.tech/) y creá una cuenta gratuita con GitHub o Google.
2. Hacé clic en **"Create Project"**:
   - Nombre: `eym-indumentaria`
   - Región: `us-east-1` (Norte de Virginia) o `us-east-2` (baja latencia hacia Vercel).
3. Copiá la cadena de conexión (Connection String) que te provee el panel:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. Guardala en tu archivo `.env.local` en el frontend.

---

## 3. Storage de Imágenes de Productos

Las prendas de indumentaria requieren fotos de alta calidad (frente, dorso, detalle de tela y modelo).

1. Creá una cuenta gratuita en [Cloudinary](https://cloudinary.com/).
2. Obtené las credenciales de subida directa (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`).
3. El panel `/admin` sube las fotos directamente al CDN gratuito de Cloudinary y almacena únicamente la URL optimizada en la base de datos de productos.

---

## 4. Despliegue en Vercel a Costo $0

1. Conectá el repositorio GitHub del proyecto a [Vercel](https://vercel.com/).
2. Configurá las variables de entorno en **Settings > Environment Variables**:
   - `DATABASE_URL`: Cadena de conexión de PostgreSQL.
   - `NEXT_PUBLIC_SITE_URL`: URL pública asignada por Vercel (ej: `https://eym-indumentaria.vercel.app` o tu dominio `.uy`).
   - `MP_ACCESS_TOKEN`: Credencial de producción de Mercado Pago Uruguay.
   - `MP_WEBHOOK_SECRET`: Clave secreta para validación de firmas HMAC.
3. El comando de build en Vercel es:
   ```bash
   bun run build
   ```
   *(Vercel soporta Bun nativamente a través de su build runtime).*

---

## 5. Por qué se Descartó WordPress / Hostinger

- **Costo económico**: Hostinger o VPS requieren entre $3 y $20 USD mensuales fijos, se venda o no.
- **Rendimiento deficiente**: Correr WordPress en servidores compartidos baratos genera demoras de 1 a 2 segundos por consulta a la REST API, perjudicando el posicionamiento SEO y la conversión mobile.
- **Mantenimiento**: Exige actualizar plugins de PHP, parches de seguridad de WordPress y gestionar caídas de servidor.
- **Experiencia de Enzo**: El panel integrado en Next.js le ofrece una interfaz diseñada a medida en español, limpia, rápida y accesible desde su teléfono.
