import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "AuditCare Timeline",
  description: "AI-powered patient timeline MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
