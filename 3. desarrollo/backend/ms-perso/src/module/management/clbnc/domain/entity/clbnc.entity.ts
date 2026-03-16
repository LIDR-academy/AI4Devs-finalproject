import { ParamsInterface } from "src/shared/util";

/**
 * Entidad de dominio Usuario Banca Digital
 * Representa un usuario de banca digital asociado a un cliente
 */
export interface ClbncEntity {
  clbnc_cod_clbnc?: number;              // ID (SERIAL, primary key)
  clbnc_cod_clien: number;                // FK a rrfclien (1:1, unique)
  clbnc_usr_banca: string;                // Username (email o cédula) (VARCHAR(150), unique)
  clbnc_pwd_banca: string;                 // Password hash (bcrypt) (VARCHAR(250))
  clbnc_fec_regis: Date;                  // Fecha de registro (DATE)
  clbnc_fec_ultin?: Date | null;           // Último ingreso (TIMESTAMP)
  clbnc_tok_sesio?: string | null;         // Token de sesión activa (VARCHAR(250))
  clbnc_tok_notif?: string | null;         // Token push notifications (VARCHAR(250))
  clbnc_imei_disp?: string | null;         // IMEI del dispositivo (VARCHAR(100))
  clbnc_nom_dispo?: string | null;         // Nombre del dispositivo (VARCHAR(150))
  clbnc_det_dispo?: string | null;         // User agent / modelo (VARCHAR(250))
  clbnc_ipa_ultin?: string | null;         // IP último acceso (VARCHAR(50))
  clbnc_lat_ultin?: number | null;         // Latitud GPS (DECIMAL(10,6))
  clbnc_lon_ultin?: number | null;         // Longitud GPS (DECIMAL(11,6))
  clbnc_geo_ultin?: string | null;         // Geocoder (dirección) (VARCHAR(250))
  clbnc_msj_bienv?: string | null;         // Mensaje de bienvenida (VARCHAR(250))
  clbnc_ctr_activ?: boolean;               // Estado activo (BOOLEAN, default: true)
  clbnc_ctr_termi?: boolean;               // Aceptó términos (BOOLEAN, default: false)
  clbnc_lim_diario?: number;               // Límite diario transferencias (DECIMAL(12,2), default: 1000)
  clbnc_lim_mensu?: number;                // Límite mensual transferencias (DECIMAL(12,2), default: 15000)
  created_at?: Date;                       // Fecha creación
  updated_at?: Date;                       // Fecha modificación
  created_by: number;                      // Usuario que creó
  updated_by: number;                      // Usuario que modificó
  deleted_at?: Date | null;                // Fecha eliminación (soft delete)
}

/**
 * Parámetros para consultas de Usuario Banca Digital
 */
export interface ClbncParams extends ParamsInterface {
  clienteId?: number;                      // Filtrar por ID de cliente
  username?: string;                        // Filtrar por username
  activo?: boolean;                        // Filtrar por estado activo
}

