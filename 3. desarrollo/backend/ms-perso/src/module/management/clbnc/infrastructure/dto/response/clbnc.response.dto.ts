import { ClbncEntity } from "../../../domain/entity";
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de Usuario Banca Digital
 * Implementa la interfaz ClbncEntity directamente
 */
export class ClbncResponseDto implements ClbncEntity {
  @ApiProperty({ example: 1, description: 'ID único del usuario de banca digital' })
  clbnc_cod_clbnc?: number;

  @ApiProperty({ example: 1, description: 'ID del cliente (rrfclien)' })
  clbnc_cod_clien: number;

  @ApiProperty({ example: 'usuario@email.com', description: 'Username (email o cédula)' })
  clbnc_usr_banca: string;

  @ApiProperty({ example: '$2b$10$...', description: 'Password hash (bcrypt)' })
  clbnc_pwd_banca: string;

  @ApiProperty({ example: '2025-01-15', description: 'Fecha de registro' })
  clbnc_fec_regis: Date;

  @ApiProperty({ example: '2025-01-15T10:30:00Z', description: 'Último ingreso', required: false, nullable: true })
  clbnc_fec_ultin?: Date | null;

  @ApiProperty({ example: 'token123...', description: 'Token de sesión activa', required: false, nullable: true })
  clbnc_tok_sesio?: string | null;

  @ApiProperty({ example: 'fcm_token123...', description: 'Token push notifications', required: false, nullable: true })
  clbnc_tok_notif?: string | null;

  @ApiProperty({ example: '123456789012345', description: 'IMEI del dispositivo', required: false, nullable: true })
  clbnc_imei_disp?: string | null;

  @ApiProperty({ example: 'MI PHONE', description: 'Nombre del dispositivo', required: false, nullable: true })
  clbnc_nom_dispo?: string | null;

  @ApiProperty({ example: 'Mozilla/5.0...', description: 'User agent / modelo', required: false, nullable: true })
  clbnc_det_dispo?: string | null;

  @ApiProperty({ example: '192.168.1.1', description: 'IP último acceso', required: false, nullable: true })
  clbnc_ipa_ultin?: string | null;

  @ApiProperty({ example: -0.180653, description: 'Latitud GPS', required: false, nullable: true, type: Number })
  clbnc_lat_ultin?: number | null;

  @ApiProperty({ example: -78.467834, description: 'Longitud GPS', required: false, nullable: true, type: Number })
  clbnc_lon_ultin?: number | null;

  @ApiProperty({ example: 'QUITO, ECUADOR', description: 'Geocoder (dirección)', required: false, nullable: true })
  clbnc_geo_ultin?: string | null;

  @ApiProperty({ example: 'Bienvenido a nuestra banca digital', description: 'Mensaje de bienvenida', required: false, nullable: true })
  clbnc_msj_bienv?: string | null;

  @ApiProperty({ example: true, description: 'Estado activo' })
  clbnc_ctr_activ: boolean;

  @ApiProperty({ example: false, description: 'Aceptó términos' })
  clbnc_ctr_termi: boolean;

  @ApiProperty({ example: 1000.00, description: 'Límite diario transferencias', type: Number })
  clbnc_lim_diario: number;

  @ApiProperty({ example: 15000.00, description: 'Límite mensual transferencias', type: Number })
  clbnc_lim_mensu: number;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de creación', required: false })
  created_at?: Date;

  @ApiProperty({ example: '2025-01-15T00:00:00Z', description: 'Fecha de última modificación', required: false })
  updated_at?: Date;

  @ApiProperty({ example: 1, description: 'ID del usuario que creó el registro' })
  created_by: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que modificó el registro' })
  updated_by: number;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (soft delete)', required: false, nullable: true })
  deleted_at?: Date | null;
}

