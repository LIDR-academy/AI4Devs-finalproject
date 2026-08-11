import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deploy en VM única con `next build` standalone + systemd (ver ADR-0001 §5).
  output: "standalone",
  // El cliente Prisma generado (driver adapter pg) corre solo en el servidor.
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg"],
};

export default nextConfig;
