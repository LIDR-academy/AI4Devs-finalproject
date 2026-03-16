import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Cliente
 * Representa un Cliente/Socio de la cooperativa
 */
export interface ClienEntity {
  clien_cod_clien?: number;              // ID (SERIAL, primary key) - Código cliente (número de ventanilla)
  clien_cod_perso: number;                // FK a rrfperson (único, 1:1)
  clien_cod_ofici: number;                // FK a rrfofici - Oficina de pertenencia
  clien_ctr_socio: boolean;               // true=Socio, false=Cliente
  clien_fec_ingin: Date;                  // Fecha de ingreso
  clien_fec_salid?: Date | null;          // Fecha de salida/baja
  clien_obs_clien?: string;               // Observaciones
  created_at?: Date;                      // Fecha creación
  updated_at?: Date;                      // Fecha modificación
  created_by: number;                     // Usuario que creó
  updated_by: number;                     // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Cliente
 */
export interface ClienParams extends ParamsInterface {
  active?: boolean;                       // Filtrar solo activos (sin fecha de salida)
  esSocio?: boolean;                     // Filtrar por tipo: true=Socio, false=Cliente
  oficina?: number;                       // Filtrar por oficina
  fechaDesde?: Date;                      // Filtrar por fecha de ingreso desde
  fechaHasta?: Date;                      // Filtrar por fecha de ingreso hasta
}

