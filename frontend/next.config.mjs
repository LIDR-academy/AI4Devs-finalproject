/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const assetsUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL ?? 'http://localhost:4000';
const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js dev server requires 'unsafe-eval' for HMR; production keeps it strict
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' data: ${assetsUrl}`,
      "font-src 'self'",
      `connect-src 'self' ${apiUrl}`,
    ].join('; '),
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
];

const nextConfig = {
  // Genera .next/standalone: server mínimo con solo los módulos usados en
  // runtime, necesario para no copiar node_modules completo a la imagen Docker.
  output: 'standalone',
  // Los productos son imágenes estáticas ya optimizadas del repositorio, no
  // contenido subido dinámicamente: se evita instalar `sharp` (dependencia
  // nativa pesada) en un host de 1 GB de RAM (EC2 t3.micro) sin beneficio real.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
