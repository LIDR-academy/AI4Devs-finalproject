import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Residencia Fiscal
 * Representa la residencia fiscal del cliente (CRS/FATCA)
 */
export interface ClrfiEntity {
  clrfi_cod_clrfi?: number;              // ID (SERIAL, primary key)
  clrfi_cod_clien: number;                // FK a rrfclien (1:1, unique)
  clrfi_ctr_resfi: boolean;                // Tiene residencia fiscal extranjera (BOOLEAN)
  clrfi_cod_nacio?: number | null;         // FK a rrfnacio - País de residencia fiscal (SMALLINT)
  clrfi_dir_resfi?: string | null;         // Dirección (VARCHAR(200))
  clrfi_des_provi?: string | null;         // Provincia (texto libre) (VARCHAR(50))
  clrfi_des_ciuda?: string | null;         // Ciudad (texto libre) (VARCHAR(50))
  clrfi_cod_posta?: string | null;         // Código postal (VARCHAR(10))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                        // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Residencia Fiscal
 */
export interface ClrfiParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  tieneResidenciaFiscal?: boolean;         // Filtrar por si tiene residencia fiscal extranjera
  paisId?: number;                         // Filtrar por país de residencia fiscal
}

