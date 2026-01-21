/**
 * DTO para crear una provincia
 */
export interface CreateProvinciaRequestDto {
  provi_cod_prov: string;   // Código SEPS (2 dígitos)
  provi_nom_provi: string;  // Nombre
  provi_flg_acti?: boolean; // Default: true
}

