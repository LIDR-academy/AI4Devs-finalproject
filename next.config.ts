import type { NextConfig } from "next";

/**
 * El **paquete autónomo es el artefacto de la VM** (ADR-0001 §5) y el que levanta el
 * E2E, así que es el modo por defecto.
 *
 * **En Vercel, no.** En modo standalone Next se lleva el trazado de ficheros a
 * `.next/standalone/` y **deja de emitir `.next/next-server.js.nft.json`** — que es
 * justo el fichero que abre el paso `onBuildComplete` de Vercel para armar sus
 * funciones. El build compila entero, genera las páginas y muere al final con un
 * `ENOENT` sobre ese json, que no dice en absoluto de dónde viene.
 *
 * `VERCEL` la define su entorno de build, así que la condición se resuelve sola: en la
 * VM, en local y en el E2E sigue saliendo el paquete autónomo.
 */
const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  // El cliente Prisma generado (driver adapter pg) corre solo en el servidor.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
