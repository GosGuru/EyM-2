# Documentación Técnica y Estratégica — EYM Indumentaria

Bienvenido al centro de documentación del storefront de **EYM Indumentaria**, una plataforma de comercio electrónico headless diseñada específicamente para el mercado de moda e indumentaria en **Uruguay**.

Este directorio reúne la visión de negocio, las decisiones arquitectónicas fundamentales, los controles de seguridad y las guías operativas del proyecto.

---

## Índice de Documentos

| Documento | Descripción | Audiencia |
|---|---|---|
| [**1. Visión, Misión y Objetivos**](./vision-mision-y-objetivos.md) | Propósito de marca, objetivos para Uruguay a 3 años y métricas clave (OKRs). | Negocio / Producto |
| [**2. Arquitectura del Sistema**](./arquitectura.md) | Arquitectura unificada en Next.js 15 + Postgres Serverless + Mercado Pago a costo $0/mes, flujo de compra y descarte de hostings externos. | Desarrolladores / Arquitectos |
| [**3. Estructura del Proyecto**](./estructura-del-proyecto.md) | Recorrido detallado de carpetas, convenciones de código, componentes y rutas. | Desarrolladores |
| [**4. Seguridad y Modelo de Amenazas**](./seguridad.md) | Los 6 vectores de ataque mitigados, HMAC de webhooks, cálculo autoritativo y rate limiting. | Seguridad / DevOps |
| [**5. Estrategia SEO & GEO (Uruguay)**](./seo-y-geo.md) | Posicionamiento orgánico en Uruguay + Optimización para Motores Generativos (ChatGPT, Perplexity, Google AI Overviews). | Marketing / SEO / Tech |
| [**6. Aprovisionamiento del Backend**](./aprovisionamiento-backend.md) | Guía de setup de infraestructura a costo $0/mes (Neon/Supabase Postgres + Vercel + Cloudinary). | DevOps / Operaciones |

---

## Documentación Histórica y de Módulos Específicos

Los siguientes documentos registran etapas previas de refactorización y especificaciones de subsistemas:

- [**Sistema de Animaciones (Motion)**](./MOTION-SYSTEM.md): Tokens y componentes de Framer Motion.
- [**Refactorización de la Homepage**](./REFACTORING-HOMEPAGE.md): Optimización de LCP, TTFB y streaming de secciones.
- [**Resumen de Refactorización**](./REFACTORING-SUMMARY.md): Métricas de Web Vitals antes y después.
- [**Checklist de Checkout**](./CHECKLIST-CHECKOUT.md) y [**Mejoras de Checkout**](./CHECKOUT-MEJORAS.md): Diseño del flujo de compra y validaciones.
- [**Sistema de Error 404**](./404-SYSTEM.md): Gestión de productos y categorías inexistentes.
- [**Variables de Entorno del Checkout**](./ENV-CHECKOUT.md): Configuración de credenciales de pago.

---

## Principios Rectores del Proyecto

1. **Costo fijo $0 USD / mes**: La infraestructura corre enteramente sobre tiers gratuitos (Vercel, PostgreSQL Serverless, Storage con CDN).
2. **Cálculo autoritativo en servidor**: El frontend nunca define precios ni costos de envío. Todo cobro surge de la validación server-side.
3. **Gestor de paquetes único**: El proyecto usa exclusivamente **Bun**. Prohibido el uso de `npm`, `pnpm` o `yarn`.
4. **Aliado estratégico**: Enzo es un emprendedor amigo al que acompañamos para lograr un caso de éxito comercial y técnico en Uruguay.
