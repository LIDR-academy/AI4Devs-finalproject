/**
 * Constantes compartidas por los adapters remotos de generación de recetas
 * (AUDIT-DEV-007 F-14). El timeout y el modelo *por proveedor* configurables desde
 * `AiConfiguration` quedan diferidos (requieren campo nuevo en `schema.prisma` →
 * cascada de especificación).
 */

/** Guard 9 — inferencia determinista para tareas de generación. */
export const MAX_TEMPERATURE = 0.2;
export const DETERMINISTIC_TOP_P = 0.2;

/** Antes 5000 ms hardcodeado por adapter; 8 s da margen a modelos lentos sin colgar la request. */
export const AI_GENERATION_TIMEOUT_MS = 8000;
