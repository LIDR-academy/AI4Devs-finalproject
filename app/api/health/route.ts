import { NextResponse } from "next/server";

/**
 * Health check. Smoke de la capa API (Route Handlers en app/api/*). No toca la BD;
 * un readiness check con Prisma se añadirá cuando exista conexión (tarea 1.2/1.3).
 */
export function GET() {
  return NextResponse.json({ status: "ok", service: "clickoteca" });
}
