/**
 * DTO de respuesta para Actividad Completa (desde backend)
 * Retorna actividad con toda su jerarquía completa
 */
export interface ActividadCompletaResponseDto {
  // Actividad (Nivel 6)
  ciact_cod_ciact: number;
  ciact_abr_ciact: string;
  ciact_des_ciact: string;
  ciact_cod_semaf: number;
  semaf_des_semaf: string;
  semaf_ico_semaf: string;
  semaf_col_semaf: string;
  // Subclase (Nivel 5)
  cisub_cod_cisub: number;
  cisub_abr_cisub: string;
  cisub_des_cisub: string;
  // Clase (Nivel 4)
  cicla_cod_cicla: number;
  cicla_abr_cicla: string;
  cicla_des_cicla: string;
  // Grupo (Nivel 3)
  cigru_cod_cigru: number;
  cigru_abr_cigru: string;
  cigru_des_cigru: string;
  // División (Nivel 2)
  cidiv_cod_cidiv: number;
  cidiv_abr_cidiv: string;
  cidiv_des_cidiv: string;
  // Sección (Nivel 1)
  cisec_cod_cisec: number;
  cisec_abr_cisec: string;
  cisec_des_cisec: string;
}

