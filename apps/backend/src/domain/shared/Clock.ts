/**
 * Puerto de reloj (AUDIT-DEV-006 F-3). Los casos de uso reciben el instante actual
 * por este puerto en vez de llamar `new Date()` / `Date.now()` directamente — así la
 * capa de aplicación queda libre de dependencias del entorno y sus tests son deterministas.
 */
export interface Clock {
  now(): Date;
}
