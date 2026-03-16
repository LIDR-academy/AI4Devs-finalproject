import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Asamblea
 * Representa la participación del cliente/socio en asamblea/directiva
 */
export interface ClasmEntity {
  clasm_cod_clasm?: number;              // ID (SERIAL, primary key)
  clasm_cod_clien: number;                // FK a rrfclien (1:1, unique)
  clasm_cod_rasam?: number | null;        // FK a rrfrasam - Tipo representante asamblea (SMALLINT)
  clasm_fec_rasam?: Date | null;           // Fecha nombramiento asamblea (DATE)
  clasm_ctr_direc: boolean;                // Es directivo (BOOLEAN, default: false)
  clasm_fec_direc?: Date | null;            // Fecha nombramiento directivo (DATE)
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                        // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Asamblea
 */
export interface ClasmParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  esDirectivo?: boolean;                   // Filtrar por si es directivo
  tipoRepresentante?: number;             // Filtrar por tipo representante asamblea
}

