/**
 * DTO para crear una parroquia
 */
export interface CreateParroquiaRequestDto {
  canto_cod_canto: number;  // FK cantón (ID interno)
  parro_cod_parr: string;   // Código SEPS (2 dígitos)
  parro_nom_parro: string;  // Nombre
  parro_tip_area?: 'R' | 'U' | null;  // Tipo área
  parro_flg_acti?: boolean;
}

