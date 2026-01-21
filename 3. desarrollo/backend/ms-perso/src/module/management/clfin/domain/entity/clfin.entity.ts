import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Información Financiera
 * Representa un rubro financiero del cliente (Ingreso, Gasto, Activo, Pasivo)
 */
export interface ClfinEntity {
  clfin_cod_clfin?: number;              // ID (SERIAL, primary key)
  clfin_cod_clien: number;                // FK a rrfclien (1:N)
  clfin_cod_tifin: number;                // FK a rrftifin - Tipo: I=Ingreso, G=Gasto, A=Activo, P=Pasivo
  clfin_val_monto: number;                // Monto mensual o valor (DECIMAL(15,2))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Información Financiera
 */
export interface ClfinParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  tipoFinanciero?: number;                  // Filtrar por tipo financiero (I=Ingreso, G=Gasto, A=Activo, P=Pasivo)
}

