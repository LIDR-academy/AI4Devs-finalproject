/**
 * Entidad de dominio Provincia
 * Representa una provincia del Ecuador según clasificación SEPS/INEC
 */
export interface ProvinciaEntity {
  /** ID interno (SERIAL) */
  provi_cod_provi?: number;
  /** Código SEPS de 2 dígitos (ej: "01") */
  provi_cod_prov: string;
  /** Nombre de la provincia */
  provi_nom_provi: string;
  /** Estado activo */
  provi_flg_acti: boolean;
  /** Fecha de creación */
  provi_fec_creac?: Date;
  /** Fecha de última modificación */
  provi_fec_modif?: Date;
  /** Fecha de eliminación (soft delete) */
  provi_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Cantón
 */
export interface CantonEntity {
  /** ID interno (SERIAL) */
  canto_cod_canto?: number;
  /** ID de la provincia padre */
  provi_cod_provi: number;
  /** Código SEPS de 2 dígitos (ej: "01") */
  canto_cod_cant: string;
  /** Nombre del cantón */
  canto_nom_canto: string;
  /** Estado activo */
  canto_flg_acti: boolean;
  /** Fecha de creación */
  canto_fec_creac?: Date;
  /** Fecha de última modificación */
  canto_fec_modif?: Date;
  /** Fecha de eliminación (soft delete) */
  canto_fec_elimi?: Date | null;
  
  // Denormalized for display (from join)
  /** Código SEPS de la provincia (para mostrar) */
  provi_cod_prov?: string;
  /** Nombre de la provincia (para mostrar) */
  provi_nom_provi?: string;
}

/**
 * Tipo de área de parroquia
 */
export type TipoArea = 'R' | 'U' | null;

/**
 * Entidad de dominio Parroquia
 */
export interface ParroquiaEntity {
  /** ID interno (SERIAL) */
  parro_cod_parro?: number;
  /** ID del cantón padre */
  canto_cod_canto: number;
  /** Código SEPS de 2 dígitos (ej: "50") */
  parro_cod_parr: string;
  /** Nombre de la parroquia */
  parro_nom_parro: string;
  /** Tipo de área: R=Rural, U=Urbana, null=No especificado */
  parro_tip_area?: TipoArea;
  /** Estado activo */
  parro_flg_acti: boolean;
  /** Fecha de creación */
  parro_fec_creac?: Date;
  /** Fecha de última modificación */
  parro_fec_modif?: Date;
  /** Fecha de eliminación (soft delete) */
  parro_fec_elimi?: Date | null;
  
  // Denormalized for display
  /** Código SEPS del cantón */
  canto_cod_cant?: string;
  /** Nombre del cantón */
  canto_nom_canto?: string;
  /** Código SEPS de la provincia */
  provi_cod_prov?: string;
  /** Nombre de la provincia */
  provi_nom_provi?: string;
  /** Código compuesto PPCCPP (6 dígitos) */
  codigoCompleto?: string;
}

/**
 * Genera el código compuesto de 6 dígitos
 */
export function generarCodigoCompleto(
  provinciaCodigoSeps: string,
  cantonCodigoSeps: string,
  parroquiaCodigoSeps: string
): string {
  return `${provinciaCodigoSeps}${cantonCodigoSeps}${parroquiaCodigoSeps}`;
}

/**
 * Obtiene descripción del tipo de área
 */
export function getDescripcionTipoArea(tipo: TipoArea): string {
  switch (tipo) {
    case 'U': return 'Urbana';
    case 'R': return 'Rural';
    default: return 'No especificado';
  }
}

/**
 * Verifica si la provincia está disponible (activa y no eliminada)
 */
export function provinciaEstaDisponible(provincia: ProvinciaEntity): boolean {
  return provincia.provi_flg_acti && !provincia.provi_fec_elimi;
}

