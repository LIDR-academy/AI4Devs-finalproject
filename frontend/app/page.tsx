"use client"
import dynamic from "next/dynamic"

// Importar dinámicamente el componente React para evitar problemas de hidratación
const BuscadocApp = dynamic(() => import("../src/App"), { ssr: false })

export default function Page() {
  return <BuscadocApp />
}
