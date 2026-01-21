import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Domicilio
 * Representa el domicilio de un cliente
 */
export interface CldomEntity {
  cldom_cod_cldom?: number;              // ID (SERIAL, primary key)
  cldom_cod_clien: number;                // FK a rrfclien (único, 1:1 obligatorio)
  cldom_cod_provi: string;                // FK a rrfprovi - Código provincia INEC (VARCHAR(2))
  cldom_cod_canto: string;                // FK a rrfcanto - Código cantón INEC (VARCHAR(4))
  cldom_cod_parro: string;                // FK a rrfparro - Código parroquia INEC (VARCHAR(6))
  cldom_dir_domic: string;                // Dirección completa (VARCHAR(300))
  cldom_tlf_domic?: string | null;        // Teléfono domicilio (VARCHAR(15))
  cldom_sit_refdo?: string | null;         // Referencia de ubicación (VARCHAR(200))
  cldom_lat_coord?: number | null;         // Latitud GPS (DECIMAL(10,8))
  cldom_lon_coord?: number | null;         // Longitud GPS (DECIMAL(11,8))
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Domicilio
 */
export interface CldomParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  provincia?: string;                      // Filtrar por código de provincia
  canton?: string;                         // Filtrar por código de cantón
  parroquia?: string;                      // Filtrar por código de parroquia
}

