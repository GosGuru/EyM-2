

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usar directorio por defecto para evitar problemas con OneDrive
  // distDir: "node_modules/.cache/next", // Comentado para evitar problemas de permisos
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
      {
        protocol: 'https',
        hostname: 'ewchbggpobgpotzicnln.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
