'use client';

import { Playfair_Display, Inter } from "next/font/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { NavigationBar } from "@/components/shared/NavigationBar";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Footer } from "@/components/shared/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <NavigationBar />
          <ErrorBoundary>{children}</ErrorBoundary>
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  );
}
