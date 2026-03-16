import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Container } from "@/components/layout/container";
import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IPFS Gateway",
    template: "%s | IPFS Gateway",
  },
  description: "Secure gateway to upload, retrieve, and manage decentralized files with IPFS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8">
              <Container>{children}</Container>
            </main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
