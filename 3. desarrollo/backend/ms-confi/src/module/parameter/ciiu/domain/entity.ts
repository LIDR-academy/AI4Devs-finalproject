/**
 * Entidad de dominio Sección CIIU (Nivel 1)
 */
export interface SeccionEntity {
  cisec_cod_cisec?: number;        // INTEGER (primary key)
  cisec_abr_cisec: string;         // CHAR(1) - Código CIIU: A, B, C...
  cisec_des_cisec: string;         // VARCHAR(200)
  cisec_fec_creac?: Date;
  cisec_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio División CIIU (Nivel 2)
 */
export interface DivisionEntity {
  cidiv_cod_cidiv?: number;        // INTEGER (primary key)
  cidiv_cod_cisec: number;         // INTEGER (FK a Sección)
  cidiv_abr_cidiv: string;         // VARCHAR(3) - Código CIIU: A01, A02...
  cidiv_des_cidiv: string;         // VARCHAR(200)
  cidiv_fec_creac?: Date;
  cidiv_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Grupo CIIU (Nivel 3)
 */
export interface GrupoEntity {
  cigru_cod_cigru?: number;        // INTEGER (primary key)
  cigru_cod_cidiv: number;         // INTEGER (FK a División)
  cigru_abr_cigru: string;         // VARCHAR(4) - Código CIIU: A011, A012...
  cigru_des_cigru: string;         // VARCHAR(200)
  cigru_fec_creac?: Date;
  cigru_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Clase CIIU (Nivel 4)
 */
export interface ClaseEntity {
  cicla_cod_cicla?: number;        // INTEGER (primary key)
  cicla_cod_cigru: number;         // INTEGER (FK a Grupo)
  cicla_abr_cicla: string;         // VARCHAR(5) - Código CIIU: A0111, A0112...
  cicla_des_cicla: string;         // VARCHAR(200)
  cicla_fec_creac?: Date;
  cicla_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Subclase CIIU (Nivel 5)
 */
export interface SubclaseEntity {
  cisub_cod_cisub?: number;        // INTEGER (primary key)
  cisub_cod_cicla: number;         // INTEGER (FK a Clase)
  cisub_abr_cisub: string;         // VARCHAR(6) - Código CIIU: A01111, A01112...
  cisub_des_cisub: string;         // VARCHAR(200)
  cisub_fec_creac?: Date;
  cisub_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Actividad CIIU (Nivel 6)
 */
export interface ActividadEntity {
  ciact_cod_ciact?: number;        // INTEGER (primary key)
  ciact_cod_cisub: number;         // INTEGER (FK a Subclase)
  ciact_cod_semaf?: number;        // INTEGER (FK a Semáforo) - Default 0
  ciact_abr_ciact: string;         // VARCHAR(7) - Código CIIU: A011111, A011112...
  ciact_des_ciact: string;         // VARCHAR(500)
  ciact_fec_creac?: Date;
  ciact_fec_elimi?: Date | null;
}

/**
 * Entidad para el resultado de la vista vw_ciiu_actividad_completa
 * Retorna actividad con toda su jerarquía completa
 */
export interface ActividadCompletaEntity {
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

/**
 * Entidad para el resultado de la vista vw_ciiu_arbol
 * Retorna estructura de árbol para navegación jerárquica
 */
export interface ArbolCiiuEntity {
  nivel: number;
  id: number;
  parent_id: number | null;
  codigo: string;
  descripcion: string;
  tipo: 'seccion' | 'division' | 'grupo' | 'clase' | 'subclase' | 'actividad';
  semaf_cod?: number | null;
  semaf_des?: string | null;
}

