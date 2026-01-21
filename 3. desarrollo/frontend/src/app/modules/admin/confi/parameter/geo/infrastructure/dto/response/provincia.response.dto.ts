/**
 * DTO de respuesta para Provincia (desde backend)
 */
export interface ProvinciaResponseDto {
  provi_cod_provi?: number;
  provi_cod_prov: string;
  provi_nom_provi: string;
  provi_flg_acti: boolean;
  provi_fec_creac?: string;
  provi_fec_modif?: string;
  provi_fec_elimi?: string | null;
}

