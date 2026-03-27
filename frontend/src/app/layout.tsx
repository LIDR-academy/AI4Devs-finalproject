import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'latearte | Hub Cultural',
  description: 'Descubrimiento artístico fluido y de alta especialidad',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-zinc-950 text-zinc-50">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
