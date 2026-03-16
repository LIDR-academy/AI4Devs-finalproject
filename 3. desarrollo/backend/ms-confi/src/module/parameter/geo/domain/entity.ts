import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Provincia
 */
export interface ProvinciaEntity {
  provi_cod_provi?: number;        // INTEGER (primary key)
  provi_cod_prov: string;          // CHAR(2) - Código SEPS/INEC
  provi_nom_provi: string;         // VARCHAR(100)
  provi_flg_acti: boolean;         // Flag activo/inactivo
  provi_fec_creac?: Date;
  provi_fec_modif?: Date;
  provi_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Cantón
 */
export interface CantonEntity {
  canto_cod_canto?: number;        // INTEGER (primary key)
  provi_cod_provi: number;         // INTEGER (FK a provincia)
  canto_cod_cant: string;          // CHAR(2) - Código SEPS
  canto_nom_canto: string;         // VARCHAR(100)
  canto_flg_acti: boolean;
  canto_fec_creac?: Date;
  canto_fec_modif?: Date;
  canto_fec_elimi?: Date | null;
}

/**
 * Entidad de dominio Parroquia
 */
export interface ParroquiaEntity {
  parro_cod_parro?: number;        // INTEGER (primary key)
  canto_cod_canto: number;         // INTEGER (FK a cantón)
  parro_cod_parr: string;          // CHAR(2) - Código SEPS
  parro_nom_parro: string;         // VARCHAR(120)
  parro_tip_area?: 'R' | 'U' | null;  // R=Rural, U=Urbano
  parro_flg_acti: boolean;
  parro_fec_creac?: Date;
  parro_fec_modif?: Date;
  parro_fec_elimi?: Date | null;
}

/**
 * Parámetros para consultas geográficas
 */
export interface GeoParams extends ParamsInterface {
  active?: boolean;                // Filtrar solo activos
}

