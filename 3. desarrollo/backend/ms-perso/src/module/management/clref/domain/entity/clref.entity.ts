import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Referencia
 * Representa una referencia del cliente (Personal, Comercial o Financiera)
 */
export interface ClrefEntity {
  clref_cod_clref?: number;              // ID (SERIAL, primary key)
  clref_cod_clien: number;                // FK a rrfclien (1:N)
  clref_cod_tiref: number;                // FK a rrftiref - Tipo: 1=Personal, 2=Comercial, 3=Financiera (SMALLINT)
  clref_cod_perso?: number | null;         // FK a rrfperson - Si la referencia es una persona registrada (opcional)
  clref_nom_refer?: string | null;         // Nombre si no es persona registrada (VARCHAR(150))
  clref_dir_refer?: string | null;         // Dirección (VARCHAR(200))
  clref_tlf_refer?: string | null;         // Teléfono (VARCHAR(15))
  clref_num_ctadp?: string | null;         // Número de cuenta (si financiera) (VARCHAR(30))
  clref_val_saldo?: number | null;         // Saldo promedio (si financiera) (DECIMAL(12,2))
  clref_fec_apert?: Date | null;           // Fecha apertura (si financiera) (DATE)
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Referencias
 */
export interface ClrefParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  tipoReferencia?: number;                  // Filtrar por tipo de referencia (1=Personal, 2=Comercial, 3=Financiera)
  personaId?: number;                       // Filtrar por ID de persona
}

