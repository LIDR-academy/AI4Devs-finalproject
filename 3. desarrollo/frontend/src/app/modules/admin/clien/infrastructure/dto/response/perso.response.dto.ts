/**
 * DTO de respuesta para Persona (desde backend)
 */
export interface PersoResponseDto {
  perso_cod_perso?: number;
  perso_cod_tpers: number;
  perso_cod_tiden: number;
  perso_ide_perso: string;
  perso_nom_perso: string;
  perso_fec_inici?: string | null;
  perso_cod_sexos?: number | null;
  perso_cod_nacio?: number | null;
  perso_cod_instr?: number | null;
  perso_ema_perso?: string | null;
  perso_tel_perso?: string | null;
  perso_cel_perso?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

