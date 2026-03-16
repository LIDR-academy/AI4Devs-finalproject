import { PersoResponseDto } from './perso.response.dto';

/**
 * DTO de respuesta para Cliente (desde backend)
 */
export interface ClienResponseDto {
  clien_cod_clien?: number;
  clien_cod_perso: number;
  clien_cod_ofici: number;
  clien_ctr_socio: boolean;
  clien_fec_ingin: string;
  clien_fec_salid?: string | null;
  clien_des_obser?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  
  // Denormalized
  persona?: PersoResponseDto;
}

