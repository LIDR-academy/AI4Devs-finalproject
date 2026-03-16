import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Actividad Económica
 * Representa la actividad económica BCE del cliente
 */
export interface ClecoEntity {
  cleco_cod_cleco?: number;              // ID (SERIAL, primary key)
  cleco_cod_clien: number;                // FK a rrfclien (único, 1:1 obligatorio)
  cleco_cod_aebce: string;                // Código actividad económica BCE (VARCHAR(10))
  cleco_cod_saebc: string;                // Código subactividad BCE (VARCHAR(10))
  cleco_cod_dtfin: string;                // Código detalle financiero BCE (VARCHAR(10))
  cleco_cod_sebce: string;                // Código sector BCE (VARCHAR(10))
  cleco_cod_ssgbc: string;                // Código subsegmento BCE (VARCHAR(10))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Actividad Económica
 */
export interface ClecoParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  sector?: string;                         // Filtrar por código de sector
  actividad?: string;                       // Filtrar por código de actividad
}

