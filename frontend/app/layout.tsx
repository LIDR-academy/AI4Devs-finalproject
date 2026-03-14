import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CitaYa - Sistema de Reserva de Citas Médicas',
  description: 'Plataforma para reservar citas médicas de forma ágil y segura',
};

// Root layout - Next.js requiere este archivo con <html> y <body>
// El middleware de next-intl redirige a /es o /en automáticamente
// El layout de [locale] no debe duplicar estos tags
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className={inter.className}>{children}</body>
    </html>
  );
}

