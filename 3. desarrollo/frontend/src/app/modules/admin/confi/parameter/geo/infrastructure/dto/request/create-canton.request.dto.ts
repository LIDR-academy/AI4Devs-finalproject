/**
 * DTO para crear un cantón
 */
export interface CreateCantonRequestDto {
  provi_cod_provi: number;  // FK provincia (ID interno)
  canto_cod_cant: string;   // Código SEPS (2 dígitos)
  canto_nom_canto: string;  // Nombre
  canto_flg_acti?: boolean;
}

