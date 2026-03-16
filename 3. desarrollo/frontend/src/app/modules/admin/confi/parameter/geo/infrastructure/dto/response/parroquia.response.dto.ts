/**
 * DTO de respuesta para Parroquia (desde backend)
 */
export interface ParroquiaResponseDto {
  parro_cod_parro?: number;
  canto_cod_canto: number;
  parro_cod_parr: string;
  parro_nom_parro: string;
  parro_tip_area?: 'R' | 'U' | null;
  parro_flg_acti: boolean;
  parro_fec_creac?: string;
  parro_fec_modif?: string;
  parro_fec_elimi?: string | null;
  // Optional joined fields
  canto_cod_cant?: string;
  canto_nom_canto?: string;
  provi_cod_prov?: string;
  provi_nom_provi?: string;
}

