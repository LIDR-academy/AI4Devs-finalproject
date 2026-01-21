/**
 * DTO de respuesta para Cantón (desde backend)
 */
export interface CantonResponseDto {
  canto_cod_canto?: number;
  provi_cod_provi: number;
  canto_cod_cant: string;
  canto_nom_canto: string;
  canto_flg_acti: boolean;
  canto_fec_creac?: string;
  canto_fec_modif?: string;
  canto_fec_elimi?: string | null;
  // Optional joined fields
  provi_cod_prov?: string;
  provi_nom_provi?: string;
}

