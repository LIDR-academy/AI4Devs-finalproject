import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { EmailProvider } from '@/contexts/EmailContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GuardianPaws - Encuentra tu mascota perdida",
  description: "Plataforma para reportar y encontrar mascotas perdidas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <EmailProvider>
          <div className="min-h-screen bg-[#121212]">
            <Navigation />
            {children}
          </div>
        </EmailProvider>
      </body>
    </html>
  );
}
