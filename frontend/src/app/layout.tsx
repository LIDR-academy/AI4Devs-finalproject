import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RunMarket',
  description: 'Tu tienda de running',
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
