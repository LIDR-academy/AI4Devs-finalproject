import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Información Laboral
 * Representa la información laboral del cliente
 */
export interface CllabEntity {
  cllab_cod_cllab?: number;              // ID (SERIAL, primary key)
  cllab_cod_clien: number;                // FK a rrfclien (único, 1:1 condicional)
  cllab_cod_depen?: number | null;         // FK a dependencia/institución (catálogo externo)
  cllab_des_cargo?: string | null;         // Cargo que desempeña (VARCHAR(100))
  cllab_cod_tcont?: number | null;         // FK a rrftcont - Tipo de contrato (SMALLINT)
  cllab_fec_ingre?: Date | null;           // Fecha ingreso al trabajo (DATE)
  cllab_fec_finct?: Date | null;           // Fecha fin de contrato (DATE)
  cllab_val_ingre?: number | null;         // Ingreso mensual (DECIMAL(12,2))
  cllab_dir_traba?: string | null;         // Dirección del trabajo (VARCHAR(300))
  cllab_tlf_traba?: string | null;         // Teléfono del trabajo (VARCHAR(15))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Información Laboral
 */
export interface CllabParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  dependenciaId?: number;                   // Filtrar por ID de dependencia
  tipoContrato?: number;                     // Filtrar por tipo de contrato
}

