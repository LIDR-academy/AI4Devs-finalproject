import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Representante
 * Representa el representante legal del cliente
 */
export interface ClrepEntity {
  clrep_cod_clrep?: number;              // ID (SERIAL, primary key)
  clrep_cod_clien: number;                // FK a rrfclien (único, 1:1 condicional)
  clrep_cod_perso: number;                // FK a rrfperson - Persona del representante (debe ser >= 18 años)
  clrep_cod_trep: number;                 // FK a rrftrep - Tipo: Legal, Tutor, Apoderado (SMALLINT)
  clrep_fec_nombr?: Date | null;          // Fecha de nombramiento (DATE)
  clrep_fec_venci?: Date | null;          // Fecha de vencimiento (DATE)
  clrep_obs_clrep?: string | null;        // Observaciones (VARCHAR(200))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Representante
 */
export interface ClrepParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  tipoRepresentante?: number;               // Filtrar por tipo de representante
  personaId?: number;                       // Filtrar por ID de persona representante
}

