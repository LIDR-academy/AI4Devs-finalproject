import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Cónyuge
 * Representa el cónyuge del cliente
 */
export interface ClcygEntity {
  clcyg_cod_clcyg?: number;              // ID (SERIAL, primary key)
  clcyg_cod_clien: number;                 // FK a rrfclien (único, 1:1 condicional)
  clcyg_cod_perso: number;                 // FK a rrfperson - Persona del cónyuge
  clcyg_nom_empre?: string | null;         // Empresa donde trabaja (VARCHAR(150))
  clcyg_des_cargo?: string | null;         // Cargo (VARCHAR(100))
  clcyg_val_ingre?: number | null;          // Ingresos mensuales (DECIMAL(12,2))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Cónyuge
 */
export interface ClcygParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  personaId?: number;                       // Filtrar por ID de persona cónyuge
}

