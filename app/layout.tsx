import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clickoteca",
    template: "%s · Clickoteca",
  },
  description:
    "Biblioteca de alquiler de sets LEGO por suscripción. Alquila, construye y devuelve.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
