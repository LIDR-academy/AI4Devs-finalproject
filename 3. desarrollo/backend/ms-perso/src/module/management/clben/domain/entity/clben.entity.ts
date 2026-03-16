import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Beneficiario
 * Representa un beneficiario de banca digital asociado a un usuario de banca digital
 */
export interface ClbenEntity {
  clben_cod_clben?: number;              // ID (SERIAL, primary key)
  clben_cod_clbnc: number;                // FK a rrfclbnc (1:N)
  clben_num_cuent: string;                // Número cuenta destino (VARCHAR(20))
  clben_cod_tcuen: number;                // Tipo cuenta: 1=Ahorros, 2=Corriente (SMALLINT)
  clben_cod_ifina?: number | null;         // FK a rrfifina - Institución financiera (si externo) (INTEGER)
  clben_nom_benef: string;                // Nombre del beneficiario (VARCHAR(250))
  clben_ide_benef: string;                // Cédula/RUC del beneficiario (VARCHAR(20))
  clben_cod_tiden?: number | null;         // FK a rrftiden - Tipo identificación (SMALLINT)
  clben_ema_benef?: string | null;         // Email para notificación (VARCHAR(150))
  clben_ctr_exter?: boolean;               // Es externo (SPI) (BOOLEAN, default: false)
  clben_ali_benef?: string | null;         // Alias del beneficiario (VARCHAR(50))
  clben_ctr_activ?: boolean;               // Activo (BOOLEAN, default: true)
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Beneficiarios
 */
export interface ClbenParams extends ParamsInterface {
  usuarioBancaDigitalId?: number;          // Filtrar por ID de usuario de banca digital
  activo?: boolean;                        // Filtrar por estado activo
  externo?: boolean;                        // Filtrar por si es externo
}

