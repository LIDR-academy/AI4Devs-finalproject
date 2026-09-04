/**
 * Puerto de generación de identificadores (AUDIT-DEV-006 F-3). Sustituye a los ids
 * construidos con `` `mov-${Date.now()}` `` en la capa de aplicación — que colisionan en
 * clave primaria cuando dos escrituras caen en el mismo milisegundo (reintento, doble submit).
 */
export interface IdGenerator {
  /** Devuelve un id único con el prefijo indicado, p. ej. `next('mov')` → `mov-<uuid>`. */
  next(prefix: string): string;
}
