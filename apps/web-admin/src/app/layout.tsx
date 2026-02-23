import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/layout/sidebar';
import { Providers } from '@/components/layout/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Adresles Admin',
  description: 'Panel de administración de Adresles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="flex h-screen overflow-hidden font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-lime focus:text-brand-black focus:font-medium"
        >
          Saltar al contenido
        </a>
        <Providers>
          <Sidebar />
          <main
            id="main-content"
            className="flex-1 overflow-y-auto bg-background"
          >
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
