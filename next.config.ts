import type { NextConfig } from 'next';

// Content-Security-Policy
// Nota: 'unsafe-inline' en script-src y style-src es una concesión temporal
// requerida por la hidratación de Next.js y Tailwind v4 en modo sin nonce.
// A futuro se migra a CSP basada en nonces vía middleware.
const ContentSecurityPolicy = `
  default-src 'self';
  img-src 'self' data: blob: https:;
  script-src 'self' 'unsafe-inline' https://sdk.mercadopago.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  frame-src 'self' https://www.mercadopago.com https://www.mercadopago.com.ar https://www.mercadopago.com.uy;
  connect-src 'self' https://api.mercadopago.com https://booloifqeoerermpbzrr.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      // Local WordPress (development)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8882',
        pathname: '/wp-content/uploads/**',
      },
      // Hostinger WordPress (production)
      {
        protocol: 'https',
        hostname: 'slategray-wallaby-716305.hostingersite.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Supabase Storage (producción / uploads del admin)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      // Cloudinary (CDN de imágenes optimizadas)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
