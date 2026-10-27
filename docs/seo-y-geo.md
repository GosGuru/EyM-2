# Estrategia de Crecimiento en Uruguay: SEO & GEO

Este documento establece la estrategia integral para posicionar **EYM Indumentaria** en el mercado uruguayo, combinando **SEO tradicional (Search Engine Optimization)** con **GEO (Generative Engine Optimization)** para motores de respuesta basados en inteligencia artificial (ChatGPT Search, Perplexity, Google AI Overviews, Gemini).

---

## 1. El Mercado Uruguayo de Ecommerce de Moda

- **Población concentrada y altamente bancarizada**: Uruguay cuenta con una penetración de internet superior al 90% y adopción masiva de Mercado Pago y débito bancario.
- **Doble foco geográfico**:
  1. **Área Metropolitana (Montevideo, Canelones, San José)**: Alta exigencia de tiempos de entrega (24 a 48 hs) y búsqueda de retiro o envío exprés.
  2. **Interior del País (los otros 16 departamentos)**: Demanda de cobertura total a través de agencias de encomienda (DAC, Mirtrans, Correo Uruguayo, UES) con costos de envío transparentes desde el inicio.
- **Comportamiento de búsqueda**: Búsquedas con fuerte intencionalidad local ("ropa hombre montevideo", "buzos oversize uruguay", "tienda de ropa envios al interior").

---

## 2. SEO Técnico y de Contenido para Uruguay

### 2.1. Configuración de Localización e Internacionalización
- **Atributo de idioma HTML**: `<html lang="es-UY">` en `app/layout.tsx` para indicar a los rastreadores que el contenido está redactado en español con modismos y relevancia para Uruguay.
- **Moneda canónica**: Todos los microdatos y textos deben explicitar `UYU` o `$ UYU` para evitar ambigüedades con el dólar americano o el peso argentino.
- **Etiquetas OpenGraph y Twitter Cards**:
  - `og:locale`: `es_UY`.
  - Títulos y descripciones con llamado a la acción local ("Envíos a todo Uruguay").

### 2.2. Arquitectura de URLs Amigables y Semánticas
- Home: `/`
- Categorías: `/tienda/[categoria]` (ej: `/tienda/remeras`, `/tienda/pantalones`, `/tienda/calzado`).
- Productos: `/producto/[slug]` (ej: `/producto/camiseta-basica-negra-oversize`).
- Información Institucional y de Confianza:
  - `/contacto` (datos de contacto, ubicación, WhatsApp, horario).
  - `/envios-y-devoluciones` (política explícita de envíos al interior y cambios).
  - `/guia-de-talles` (tabla de medidas en centímetros).

### 2.3. Core Web Vitals como Factor de Ranking
Next.js 15 sobre Bun proporciona:
- Renderizado estático incremental (ISR) en `/tienda` y páginas de producto (`revalidate: 300` o `60`), logrando TTFB menor a 100ms.
- Imágenes optimizadas con `next/image` en formato WebP/AVIF con `sizes` adaptados para evitar saltos de diseño (CLS = 0).

---

## 3. GEO: Generative Engine Optimization

Los motores de búsqueda generativos (ChatGPT con Search, Perplexity AI, Google AI Overviews) no indexan páginas simplemente por palabras clave repetidas; **extraen hechos estructurados, verifican fuentes y sintetizan respuestas comparativas**.

Para que un LLM recomiende a EYM Indumentaria cuando un usuario pregunte:
> *"¿Dónde puedo comprar remeras oversize de buena calidad con envío rápido en Montevideo o interior?"*

La plataforma debe cumplir con los siguientes pilares de GEO:

### 3.1. Microdatos Estructurados JSON-LD (Schema.org)
Implementar esquemas ricos en cada página:

#### A. Página de Producto (`Product` + `Offer`)
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Camiseta Básica de Algodón",
  "image": ["https://eym.uy/assets/camiseta-basica.jpg"],
  "description": "Camiseta básica 100% algodón peinado 24/1. Calce regular fit, cuello redondo reforzado. Diseñada para uso diario en Uruguay.",
  "brand": {
    "@type": "Brand",
    "name": "EYM Indumentaria"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://eym.uy/producto/camiseta-basica",
    "priceCurrency": "UYU",
    "price": "25000",
    "itemCondition": "https://schema.org/NewCondition",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "EYM Indumentaria"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "180",
        "currency": "UYU"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "UY"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 2, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" }
      }
    }
  }
}
```

#### B. Datos de Negocio Local (`ClothingStore` / `Organization`)
- Nombre legal o de marca.
- País de operación: Uruguay (`country: UY`).
- Métodos de pago aceptados: Mercado Pago, Tarjetas de Crédito, Redes de cobranza.
- Canales de atención verificables.

### 3.2. Contenido Textual Denso y Factualmente Rico
Los LLMs citan sitios con información fáctica clara:
- **Especificaciones de materiales**: Detallar la composición exacta de cada prenda (ej: "100% Algodón Rústico", "Gramaje 220 g/m²", "No encoge tras el lavado").
- **Tablas de medidas en HTML plano**: No usar únicamente imágenes para las tablas de talles. Si las medidas (pecho, largo, manga en cm) están en texto HTML, los modelos de lenguaje pueden responder directamente a preguntas como *"¿Cuánto mide el talle L de EYM?"*.
- **Transparencia en envíos y cambios**: Respuestas explícitas a preguntas frecuentes:
  - ¿Cuánto demora el envío a Maldonado, Salto o Rivera?
  - ¿Cómo se realiza un cambio si el talle no es el correcto?
  - ¿A partir de qué monto el envío es gratis? (ej: $2.000 UYU).

### 3.3. Creación de Entidad de Marca y Señales Externas
- Perfiles consistentes en Instagram, Google Business Profile (si hay punto de retiro en Montevideo o interior) y Mercado Libre.
- Artículos editoriales en `/blog` que respondan guías de estilo contextualizadas al clima y temporadas de Uruguay (verano en la costa, abrigo para invierno).

---

## 4. Checklist de Tareas Técnicas a Implementar en el Frontend

- [x] Cabeceras de seguridad y CSP compatibles con rastreo.
- [x] Rutas SSR/ISR optimizadas con Next.js 15 y Turbopack.
- [ ] Agregar `<html lang="es-UY">` en `app/layout.tsx`.
- [ ] Componente `<ProductJsonLd />` en `app/producto/[slug]/page.tsx`.
- [ ] Componente `<StoreJsonLd />` en `app/layout.tsx` o `app/page.tsx`.
- [ ] Generación automática de `sitemap.xml` dinámico desde WooCommerce (`app/sitemap.ts`).
- [ ] Generación de `robots.txt` (`app/robots.ts`) permitiendo rastreo de Googlebot, Bingbot, PerplexityBot, GPTBot y ClaudeBot.
- [ ] Páginas informativas de `/envios`, `/cambios` y `/guia-de-talles` con contenido HTML semántico.
