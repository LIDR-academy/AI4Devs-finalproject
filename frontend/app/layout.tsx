import type React from "react"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import "../src/styles/tailwind.css"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
})

export const metadata: Metadata = {
  title: "Buscadoc - Sistema Médico",
  description: "Plataforma para conectar pacientes y doctores",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={roboto.variable}>
      <head>
        <style>{`
html {
  font-family: ${roboto.style.fontFamily};
  --font-sans: ${roboto.style.fontFamily};
}
        `}</style>
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </body>
    </html>
  )
}
