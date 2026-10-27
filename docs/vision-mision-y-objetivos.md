# Visión, Misión y Objetivos de Negocio

## 1. Misión
Empoderar la identidad y el estilo contemporáneo del público uruguayo ofreciendo indumentaria moderna, accesible y de alta calidad mediante una experiencia de compra digital ultrarrápida, transparente y segura, con entrega confiable a los 19 departamentos de Uruguay.

## 2. Visión (Horizonte 2026 - 2028)
Convertirse en una de las marcas de indumentaria digital-first referentes de Uruguay, destacándose por:
1. Una tasa de conversión superior al promedio del ecommerce local gracias a un storefront headless de rendimiento extremo.
2. Reconocimiento de marca tanto en motores de búsqueda tradicionales como en respuestas de Inteligencia Artificial (ChatGPT, Perplexity, Gemini, Google AI Overviews).
3. Una logística de entrega sin fricciones en todo el territorio uruguayo.

---

## 3. Propuesta de Valor para el Mercado Uruguayo

- **Fricción cero en el checkout**: Integración nativa con **Mercado Pago Uruguay** (tarjetas locales OCA, VISA, Master, débito bancario y redes de cobranza Abitab/RedPagos).
- **Transparencia en moneda local**: Todos los precios expresados en **Pesos Uruguayos (UYU)** sin costos ocultos en aduana ni sorpresas en el resumen.
- **Logística local adaptada**: Política de envíos claros con envío bonificado a partir de un umbral alcanzable ($2.000 UYU) y tarifa plana para todo el interior del país a través de couriers locales (DAC, Correo Uruguayo, UES, Mirtrans).
- **Rendimiento instantáneo**: Carga inicial por debajo de 1.5 segundos en redes móviles 4G/5G locales, evitando el abandono típico de sitios de comercio pesados construidos sobre plantillas lentas de WordPress.

---

## 4. Objetivos Estratégicos y Métricas Clave (OKRs)

### Trimestre 1-2: Puesta a Punto y Lanzamiento
- **OKR 1 (Infraestructura)**: Conectar el storefront a una instancia WooCommerce activa con catálogo real de al menos 30 SKUs organizados en 4+ categorías.
  - *Métrica*: `/api/health` respondiendo `mode: live` y `woocommerceReachable: true` con latencia < 500ms.
- **OKR 2 (Experiencia y Rendimiento)**: Mantener métricas Core Web Vitals en rango verde (LCP < 2.0s, CLS < 0.05, INP < 100ms) en móvil.
- **OKR 3 (Seguridad y Transaccionalidad)**: 0 incidentes de pagos inconsistentes o falsificados gracias a la verificación HMAC y monto autoritativo en servidor.

### Año 1: Tracción y Posicionamiento Nacional
- **OKR 4 (Adquisición Orgánica)**: Lograr que el 40% del tráfico provenga de canales orgánicos (SEO local por departamento e intención de compra en Uruguay).
- **OKR 5 (GEO - Citabilidad IA)**: Conseguir presencia citada en consultas de compras de ropa en Uruguay en motores generativos (Perplexity, ChatGPT Search).
- **OKR 6 (Conversión)**: Alcanzar una tasa de conversión de visita a compra de al menos 1.8% en tráfico mobile uruguayo.
