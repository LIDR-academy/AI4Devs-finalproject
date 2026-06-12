import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'RunMarket — Tu tienda de running',
    template: '%s | RunMarket',
  },
  description: 'Zapatillas, ropa técnica y accesorios para running filtrados por distancia, superficie, nivel y objetivo. Encuentra el equipamiento que se adapta a tu perfil de corredor.',
  openGraph: {
    siteName: 'RunMarket',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
